<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Enums\Role;
use App\Models\Community;
use App\Models\Company;
use App\Models\JobRun;
use App\Models\RoleAssignment;
use App\Services\ActivityLogService;
use App\Support\Notify;
use Illuminate\Console\Command;

/**
 * H §6 lifecycle: a community leaderless for 14 days alerts the account
 * manager; leaderless for 30 days becomes dormant (خامل) and event
 * generation stops. Idempotency runs through JobRun::runOnce keyed by
 * (community + step + leaderless episode) so re-runs never double-alert —
 * and a new leaderless episode alerts again.
 */
class CheckDormantCommunities extends Command
{
    use RecordsHeartbeat;

    public const ALERT_AFTER_DAYS = 14;

    public const DORMANT_AFTER_DAYS = 30;

    protected $signature = 'app:check-dormant-communities';

    protected $description = 'فحص المجتمعات بلا قائد: تنبيه بعد 14 يوماً وخمول بعد 30 (H §6, §20 — يومياً)';

    public function handle(): int
    {
        $this->recordHeartbeat();

        $this->reconcileLeaderlessClocks();

        $alerts = $this->sendLeaderlessAlerts();
        $dormant = $this->markDormantCommunities();

        $this->info("تنبيهات 14 يوماً: {$alerts} — مجتمعات أصبحت خاملة: {$dormant}.");

        return self::SUCCESS;
    }

    /**
     * Self-healing bookkeeping: every community's leaderless clock must
     * match the actual state of role_assignments, whatever code path
     * changed leadership.
     */
    private function reconcileLeaderlessClocks(): void
    {
        $ledIds = RoleAssignment::query()
            ->where('role', Role::CommunityLeader->value)
            ->where('scope_type', RoleAssignment::SCOPE_COMMUNITY)
            ->pluck('scope_id');

        Community::withoutGlobalScopes()
            ->whereNotIn('id', $ledIds)
            ->whereNull('leaderless_since')
            ->where('status', '!=', Community::STATUS_INACTIVE)
            ->update(['leaderless_since' => now()]);

        Community::withoutGlobalScopes()
            ->whereIn('id', $ledIds)
            ->whereNotNull('leaderless_since')
            ->update(['leaderless_since' => null]);
    }

    private function sendLeaderlessAlerts(): int
    {
        $sent = 0;

        $communities = Community::withoutGlobalScopes()
            ->where('status', Community::STATUS_ACTIVE)
            ->whereNotNull('leaderless_since')
            ->where('leaderless_since', '<=', now()->subDays(self::ALERT_AFTER_DAYS))
            ->get();

        foreach ($communities as $community) {
            $period = 'leaderless-14d:'.$community->leaderless_since->format('Y-m-d');

            $ran = JobRun::runOnce($this->getName(), 'community', $community->id, $period, function () use ($community): void {
                Notify::sendToId(
                    'community.leaderless.reminder',
                    Company::class,
                    (int) $community->company_id,
                    ['community' => $community->name],
                    ['data' => ['community_id' => $community->id]],
                );
            });

            if ($ran) {
                $sent++;
            }
        }

        return $sent;
    }

    private function markDormantCommunities(): int
    {
        $marked = 0;

        $communities = Community::withoutGlobalScopes()
            ->where('status', Community::STATUS_ACTIVE)
            ->whereNotNull('leaderless_since')
            ->where('leaderless_since', '<=', now()->subDays(self::DORMANT_AFTER_DAYS))
            ->get();

        foreach ($communities as $community) {
            $period = 'dormant:'.$community->leaderless_since->format('Y-m-d');

            $ran = JobRun::runOnce($this->getName(), 'community', $community->id, $period, function () use ($community): void {
                $community->forceFill(['status' => Community::STATUS_DORMANT])->save();

                Notify::sendToId(
                    'community.dormant',
                    Company::class,
                    (int) $community->company_id,
                    ['community' => $community->name],
                    ['data' => ['community_id' => $community->id]],
                );

                ActivityLogService::log(
                    $community->company_id,
                    $community,
                    'community_dormant',
                    "أصبح مجتمع «{$community->name}» خاملاً بعد 30 يوماً بلا قائد",
                );
            });

            if ($ran) {
                $marked++;
            }
        }

        return $marked;
    }
}
