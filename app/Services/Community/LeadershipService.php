<?php

namespace App\Services\Community;

use App\Enums\Role;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\RoleAssignment;
use App\Services\ActivityLogService;
use App\Support\Notify;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * H §6 leadership model: a community supports multiple leaders through
 * `role_assignments`, with exactly one `is_primary` who bears
 * responsibility and receives notifications. Every change here is MANUAL —
 * by the account manager or the leader personally. The system never
 * auto-assigns leadership («لا يعيّن النظام قائداً تلقائياً») because that
 * would impose a role on an employee who did not accept it.
 */
class LeadershipService
{
    /**
     * Grant community leadership to an employee. The first leader of a
     * community is always primary; passing `$asPrimary` transfers the
     * primary flag from the current holder.
     */
    public function assignLeader(Community $community, Employee $employee, bool $asPrimary = false): RoleAssignment
    {
        if ($employee->company_id !== $community->company_id || $employee->status !== 'active') {
            throw ValidationException::withMessages([
                'leader_id' => ['يجب أن يكون القائد موظفاً نشطاً في نفس الشركة.'],
            ]);
        }

        if ($employee->user_id === null) {
            throw ValidationException::withMessages([
                'leader_id' => ['حساب الموظف غير مرتبط بهوية عالمية.'],
            ]);
        }

        return DB::transaction(function () use ($community, $employee, $asPrimary) {
            // A leader is always a member; membership is a state, so a
            // previous `left`/`removed` row is reactivated, never recreated.
            app(MembershipService::class)->ensureActiveMembership($community, $employee);

            $hadLeaders = $community->leaderAssignments()->exists();
            $isPrimary = $asPrimary || ! $hadLeaders;

            if ($isPrimary) {
                $community->leaderAssignments()->where('is_primary', true)->update(['is_primary' => false]);
            }

            $assignment = RoleAssignment::query()->updateOrCreate([
                'user_id' => $employee->user_id,
                'role' => Role::CommunityLeader->value,
                'scope_type' => RoleAssignment::SCOPE_COMMUNITY,
                'scope_id' => $community->id,
            ], [
                'is_primary' => $isPrimary,
            ]);

            $updates = ['leaderless_since' => null];

            // A dormant community wakes when leadership is (manually) filled.
            if ($community->status === Community::STATUS_DORMANT) {
                $updates['status'] = Community::STATUS_ACTIVE;
            }

            $community->forceFill($updates)->save();

            ActivityLogService::log(
                $community->company_id,
                $community,
                'community_leader_assigned',
                "تم تعيين {$employee->name} قائداً لمجتمع «{$community->name}»".($isPrimary ? ' (قائد أساسي)' : ''),
                ['employee_id' => $employee->id, 'is_primary' => $isPrimary],
            );

            return $assignment;
        });
    }

    /**
     * Revoke an employee's leadership. If the community is left leaderless,
     * the leaderless clock starts and the account manager is alerted — no
     * one is ever promoted automatically.
     */
    public function removeLeader(Community $community, Employee $employee): void
    {
        $assignment = $community->leaderAssignments()
            ->where('user_id', $employee->user_id ?? 0)
            ->first();

        if ($assignment === null) {
            throw ValidationException::withMessages([
                'leader_id' => ['هذا الموظف ليس قائداً لهذا المجتمع.'],
            ]);
        }

        DB::transaction(function () use ($community, $employee, $assignment) {
            $wasPrimary = $assignment->is_primary;

            $assignment->delete();

            $remaining = $community->leaderAssignments()->count();

            if ($remaining === 0) {
                $community->forceFill(['leaderless_since' => now()])->save();

                Notify::sendToId(
                    'community.leaderless',
                    Company::class,
                    (int) $community->company_id,
                    ['community' => $community->name],
                    ['data' => ['community_id' => $community->id]],
                );
            } elseif ($wasPrimary) {
                // Other leaders remain but none is primary — designation is
                // manual (AM or leader), never automatic.
                Notify::sendToId(
                    'community.primary_leader_needed',
                    Company::class,
                    (int) $community->company_id,
                    ['community' => $community->name],
                    ['data' => ['community_id' => $community->id]],
                );
            }

            ActivityLogService::log(
                $community->company_id,
                $community,
                'community_leader_removed',
                "أُزيلت قيادة {$employee->name} عن مجتمع «{$community->name}»",
                ['employee_id' => $employee->id, 'was_primary' => $wasPrimary],
            );
        });
    }

    /**
     * Manual transfer of the primary leadership to another employee (AM or
     * the leader personally — H §6). The outgoing primary stays a member;
     * whether they remain a co-leader is the caller's choice.
     */
    public function transferPrimary(Community $community, Employee $newLeader, bool $keepOldAsCoLeader = false): void
    {
        DB::transaction(function () use ($community, $newLeader, $keepOldAsCoLeader) {
            $current = $community->primaryLeaderAssignment()->first();

            if ($current !== null && ! $keepOldAsCoLeader) {
                $oldEmployee = Employee::query()
                    ->where('company_id', $community->company_id)
                    ->where('user_id', $current->user_id)
                    ->first();

                if ($oldEmployee !== null && $oldEmployee->id === $newLeader->id) {
                    return; // Already the primary leader.
                }

                $current->delete();

                if ($oldEmployee !== null) {
                    ActivityLogService::log(
                        $community->company_id,
                        $community,
                        'community_leader_removed',
                        "أُزيلت قيادة {$oldEmployee->name} عن مجتمع «{$community->name}» (نقل قيادة)",
                        ['employee_id' => $oldEmployee->id, 'was_primary' => true],
                    );
                }
            }

            $this->assignLeader($community, $newLeader, asPrimary: true);
        });
    }

    /**
     * Promote one of the existing co-leaders to primary.
     */
    public function setPrimary(Community $community, Employee $leader): void
    {
        if (! $community->isLeader($leader)) {
            throw ValidationException::withMessages([
                'leader_id' => ['هذا الموظف ليس قائداً لهذا المجتمع.'],
            ]);
        }

        DB::transaction(function () use ($community, $leader) {
            $community->leaderAssignments()->where('is_primary', true)->update(['is_primary' => false]);
            $community->leaderAssignments()->where('user_id', $leader->user_id)->update(['is_primary' => true]);

            ActivityLogService::log(
                $community->company_id,
                $community,
                'community_primary_changed',
                "أصبح {$leader->name} القائد الأساسي لمجتمع «{$community->name}»",
                ['employee_id' => $leader->id],
            );
        });
    }
}
