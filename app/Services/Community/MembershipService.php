<?php

namespace App\Services\Community;

use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\Employee;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\Authorization\AuthorizationService;
use App\Support\Notify;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * H §6 membership model: open by default to all company employees;
 * join/leave/rejoin are recorded as pivot states with dates — NEVER by
 * deleting the row. Leaving cancels no confirmed paid participation and
 * the member's current-season leaderboard rank survives (the history rows
 * A12 will read stay intact). A leader may remove with a documented
 * reason; banning (blocking rejoin) is the account manager's alone.
 */
class MembershipService
{
    public function __construct(private AuthorizationService $authorization) {}

    /**
     * Join (or rejoin) a community. Open membership within the company;
     * only a ban blocks rejoining.
     */
    public function join(Employee $employee, Community $community): void
    {
        if ($community->company_id !== $employee->company_id) {
            throw ValidationException::withMessages([
                'community' => ['يمكنك الانضمام لمجتمعات شركتك فقط.'],
            ]);
        }

        $existing = $this->membershipRow($community, $employee);

        if ($existing?->status === CommunityMember::STATUS_ACTIVE) {
            throw ValidationException::withMessages([
                'community' => ['أنت عضو في هذا المجتمع بالفعل.'],
            ]);
        }

        DB::transaction(function () use ($community, $employee, $existing) {
            $this->activateMembership($community, $employee, $existing);

            ActivityLogService::log(
                $community->company_id,
                $community,
                $existing === null ? 'community_member_joined' : 'community_member_rejoined',
                ($existing === null ? 'انضم' : 'أعاد الانضمام')." {$employee->name} إلى مجتمع «{$community->name}»",
                ['employee_id' => $employee->id],
            );
        });
    }

    /**
     * Leave a community: the row flips to `left` with its date — it is not
     * deleted, and nothing happens to confirmed paid event participations.
     */
    public function leave(Employee $employee, Community $community): void
    {
        if ($community->isLeader($employee)) {
            throw ValidationException::withMessages([
                'community' => ['القائد لا يغادر المجتمع قبل نقل القيادة.'],
            ]);
        }

        $membership = $this->membershipRow($community, $employee);

        if ($membership?->status !== CommunityMember::STATUS_ACTIVE) {
            throw ValidationException::withMessages([
                'community' => ['أنت لست عضواً في هذا المجتمع.'],
            ]);
        }

        DB::transaction(function () use ($community, $employee, $membership) {
            $this->deactivateMembership($community, $membership, CommunityMember::STATUS_LEFT);

            ActivityLogService::log(
                $community->company_id,
                $community,
                'community_member_left',
                "غادر {$employee->name} مجتمع «{$community->name}»",
                ['employee_id' => $employee->id],
            );
        });
    }

    /**
     * Removal by a leader (or AM) — documented reason required (H §6). A
     * removed member may freely rejoin; blocking rejoin is a ban.
     */
    public function removeMember(Community $community, Employee $member, string $reason, User $actingUser): void
    {
        $this->authorization->authorize($actingUser, 'member.remove', 'community', $community->id);

        if ($community->isLeader($member)) {
            throw ValidationException::withMessages([
                'member' => ['لا يمكن إزالة قائد — انزع قيادته أولاً.'],
            ]);
        }

        $membership = $this->membershipRow($community, $member);

        if ($membership?->status !== CommunityMember::STATUS_ACTIVE) {
            throw ValidationException::withMessages([
                'member' => ['هذا الموظف ليس عضواً نشطاً في المجتمع.'],
            ]);
        }

        DB::transaction(function () use ($community, $member, $reason, $membership, $actingUser) {
            $this->deactivateMembership($community, $membership, CommunityMember::STATUS_REMOVED, $reason);

            Notify::send(
                'community.member.removed',
                $member,
                ['community' => $community->name, 'reason' => $reason],
                ['data' => ['community_id' => $community->id]],
            );

            ActivityLogService::log(
                $community->company_id,
                $community,
                'community_member_removed',
                "تمت إزالة {$member->name} من مجتمع «{$community->name}» — السبب: {$reason}",
                ['employee_id' => $member->id, 'reason' => $reason],
                $actingUser->id,
                $actingUser->name,
            );
        });
    }

    /**
     * Ban — blocks rejoining. Account-manager-only (H §6: «الحظر صلاحية
     * مسؤول الحساب وحده»), enforced through the permission matrix.
     */
    public function banMember(Community $community, Employee $member, string $reason, User $actingUser): void
    {
        $this->authorization->authorize($actingUser, 'member.ban', 'community', $community->id);

        if ($community->isLeader($member)) {
            throw ValidationException::withMessages([
                'member' => ['لا يمكن حظر قائد — انزع قيادته أولاً.'],
            ]);
        }

        $membership = $this->membershipRow($community, $member);

        DB::transaction(function () use ($community, $member, $reason, $membership, $actingUser) {
            if ($membership === null) {
                CommunityMember::create([
                    'community_id' => $community->id,
                    'employee_id' => $member->id,
                    'status' => CommunityMember::STATUS_BANNED,
                    'joined_at' => now(),
                    'left_at' => now(),
                    'status_reason' => $reason,
                ]);
            } else {
                $this->deactivateMembership($community, $membership, CommunityMember::STATUS_BANNED, $reason);
            }

            Notify::send(
                'community.member.banned',
                $member,
                ['community' => $community->name, 'reason' => $reason],
                ['data' => ['community_id' => $community->id]],
            );

            ActivityLogService::log(
                $community->company_id,
                $community,
                'community_member_banned',
                "تم حظر {$member->name} من مجتمع «{$community->name}» — السبب: {$reason}",
                ['employee_id' => $member->id, 'reason' => $reason],
                $actingUser->id,
                $actingUser->name,
            );
        });
    }

    /**
     * A leader (or coordinator/AM) invites a specific employee (H §6:
     * membership is open by default AND the leader may invite specific
     * employees). The invite is a notification — joining stays the
     * employee's choice.
     */
    public function invite(Community $community, Employee $inviter, Employee $invitee): void
    {
        $actingUser = CommunityActor::forEmployee($inviter);

        if ($actingUser === null || ! $this->authorization->can($actingUser, 'member.invite', 'community', $community->id)) {
            abort(403, 'غير مصرح لك بدعوة أعضاء لهذا المجتمع.');
        }

        if ($invitee->company_id !== $community->company_id || $invitee->status !== 'active') {
            throw ValidationException::withMessages([
                'employee' => ['يمكن دعوة موظفي الشركة النشطين فقط.'],
            ]);
        }

        $existing = $this->membershipRow($community, $invitee);

        if ($existing?->status === CommunityMember::STATUS_ACTIVE) {
            throw ValidationException::withMessages([
                'employee' => ['هذا الموظف عضو في المجتمع بالفعل.'],
            ]);
        }

        if ($existing?->status === CommunityMember::STATUS_BANNED) {
            throw ValidationException::withMessages([
                'employee' => ['هذا الموظف محظور من المجتمع.'],
            ]);
        }

        Notify::send(
            'community.member.invited',
            $invitee,
            ['community' => $community->name, 'inviter' => $inviter->name],
            ['data' => ['community_id' => $community->id, 'invited_by' => $inviter->id]],
        );

        ActivityLogService::log(
            $community->company_id,
            $community,
            'community_member_invited',
            "دعا {$inviter->name} الموظف {$invitee->name} إلى مجتمع «{$community->name}»",
            ['employee_id' => $invitee->id, 'invited_by' => $inviter->id],
        );
    }

    /**
     * Used by leadership assignment: a leader must be an active member —
     * reactivates a previous state row when one exists.
     */
    public function ensureActiveMembership(Community $community, Employee $employee): void
    {
        $existing = $this->membershipRow($community, $employee);

        if ($existing?->status === CommunityMember::STATUS_ACTIVE) {
            return;
        }

        $this->activateMembership($community, $employee, $existing);
    }

    private function membershipRow(Community $community, Employee $employee): ?CommunityMember
    {
        return CommunityMember::query()
            ->where('community_id', $community->id)
            ->where('employee_id', $employee->id)
            ->first();
    }

    private function activateMembership(Community $community, Employee $employee, ?CommunityMember $existing): void
    {
        if ($existing?->status === CommunityMember::STATUS_BANNED) {
            throw ValidationException::withMessages([
                'community' => ['لا يمكنك الانضمام لهذا المجتمع — تم حظرك من قبل مسؤول الحساب.'],
            ]);
        }

        if ($existing === null) {
            CommunityMember::create([
                'community_id' => $community->id,
                'employee_id' => $employee->id,
                'status' => CommunityMember::STATUS_ACTIVE,
                'joined_at' => now(),
            ]);
        } else {
            $existing->forceFill([
                'status' => CommunityMember::STATUS_ACTIVE,
                'joined_at' => now(),
                'left_at' => null,
                'status_reason' => null,
            ])->save();
        }

        $community->increment('member_count');
    }

    private function deactivateMembership(Community $community, CommunityMember $membership, string $status, ?string $reason = null): void
    {
        $membership->forceFill([
            'status' => $status,
            'left_at' => now(),
            'status_reason' => $reason,
        ])->save();

        Community::withoutGlobalScopes()
            ->whereKey($community->id)
            ->where('member_count', '>', 0)
            ->decrement('member_count');
    }
}
