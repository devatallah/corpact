<?php

namespace App\Services\Identity;

use App\Enums\Role;
use App\Models\Community;
use App\Models\Company;
use App\Models\CompanyMembership;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\RoleAssignment;
use App\Services\ActivityLogService;
use App\Services\Events\ParticipationService;
use App\Support\Notify;
use App\Support\Tenancy\CompanyContext;
use Illuminate\Support\Facades\DB;

/**
 * Departure cascade (H §4/§5): deactivating a membership revokes every
 * session of the user immediately, removes the user's community
 * leaderships in that company (account manager is notified to appoint a
 * successor), and cancels unconfirmed participations. Confirmed paid
 * participations survive — «الموظف لم يخطئ».
 */
class DepartureService
{
    public function __construct(private IdentityResolver $resolver) {}

    /**
     * Public API: deactivate a membership and run the cascade.
     */
    public function deactivate(CompanyMembership $membership): void
    {
        $employee = $membership->employee;

        if ($employee !== null && $employee->status !== 'inactive') {
            // The employee observer routes back into handleDeactivation().
            $employee->update(['status' => 'inactive']);

            return;
        }

        $membership->update(['status' => 'inactive']);
        $this->cascade($membership);
    }

    /**
     * Entry point used by the Employee observer once the legacy status flag
     * flipped to inactive (covers every legacy deactivation code path).
     */
    public function handleDeactivation(Employee $employee): void
    {
        $membership = $this->resolver->linkEmployee($employee); // idempotent; syncs status → inactive

        $this->cascade($membership);
    }

    private function cascade(CompanyMembership $membership): void
    {
        app(CompanyContext::class)->bypass(function () use ($membership): void {
            DB::transaction(function () use ($membership): void {
                $user = $membership->user;

                // 0) Stamp the departure date (H §5): a departed employee
                //    still counts in the cycle's system-fee invoice if
                //    activated before leaving — A11 reads `left_at` via
                //    CompanyMembership::departedBetween().
                $membership->forceFill(['left_at' => now()])->save();

                // 1) Revoke every session of the user immediately.
                $user?->revokeAllSessions();

                // 2) Remove community leaderships inside this company and
                //    alert the account manager to transfer them.
                $companyCommunityIds = Community::withoutGlobalScopes()
                    ->where('company_id', $membership->company_id)
                    ->pluck('id');

                $leaderships = RoleAssignment::query()
                    ->where('user_id', $user?->id ?? 0)
                    ->where('role', Role::CommunityLeader->value)
                    ->where('scope_type', RoleAssignment::SCOPE_COMMUNITY)
                    ->whereIn('scope_id', $companyCommunityIds)
                    ->get();

                foreach ($leaderships as $leadership) {
                    $community = Community::withoutGlobalScopes()->find($leadership->scope_id);

                    $leadership->delete();

                    if ($community === null) {
                        continue;
                    }

                    // Start the leaderless clock (H §6: 14d → alert AM,
                    // 30d → dormant) when no leader remains. Transfer stays
                    // manual — the system never auto-assigns a leader.
                    $stillLed = RoleAssignment::query()
                        ->where('role', Role::CommunityLeader->value)
                        ->where('scope_type', RoleAssignment::SCOPE_COMMUNITY)
                        ->where('scope_id', $community->id)
                        ->exists();

                    if (! $stillLed && $community->leaderless_since === null) {
                        $community->forceFill(['leaderless_since' => now()])->saveQuietly();
                    }

                    Notify::sendToId(
                        'community.leaderless.departed',
                        Company::class,
                        (int) $membership->company_id,
                        ['community' => $community->name],
                        ['data' => ['community_id' => $community->id]],
                    );
                }

                // 3) Cancel unconfirmed participations; confirmed ones survive.
                //    A7: حالة لا حذف — seat_status ← cancelled مع سطر سجل،
                //    والمقعد الشاغر يُعرض على قائمة الانتظار (H §10).
                if ($membership->employee_id !== null) {
                    $participants = EventParticipant::query()
                        ->where('employee_id', $membership->employee_id)
                        ->whereIn('seat_status', ['reserved', 'waitlisted'])
                        ->whereHas('event', function ($query): void {
                            $query->withoutGlobalScopes()
                                ->whereIn('status', ['open', 'pending_provider', 'provider_alternative', 'booked']);
                        })
                        ->get();

                    $participation = app(ParticipationService::class);
                    $employee = Employee::withoutGlobalScopes()->find($membership->employee_id);

                    foreach ($participants as $participant) {
                        $event = Event::withoutGlobalScopes()->find($participant->event_id);

                        if ($event === null || $employee === null) {
                            continue;
                        }

                        $participation->cancelParticipation($event, $employee, null, 'مغادرة الموظف الشركة — إسقاط المشاركات غير المؤكدة');
                    }
                }

                ActivityLogService::log(
                    $membership->company_id,
                    $membership,
                    'membership_deactivated',
                    'تم تعطيل عضوية الموظف وإلغاء جلساته وقيادات مجتمعاته ومشاركاته غير المؤكدة.',
                    [
                        'user_id' => $user?->id,
                        'employee_id' => $membership->employee_id,
                        'removed_leaderships' => $leaderships->pluck('scope_id')->all(),
                    ],
                );
            });
        });
    }
}
