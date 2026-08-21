<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Models\JobRun;
use App\Services\Notifications\CriticalAlertService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class WatchdogScheduledJobs extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:watchdog-scheduled-jobs';

    protected $description = 'تنبيه إذا لم تُنفَّذ مهمة مجدولة حرجة خلال ضعف دوريتها — الصمت ليس دليل نجاح (H §20)';

    /**
     * المهام الحرجة ودورية كل منها بالدقائق (جدول H §20).
     *
     * @var array<string, int>
     */
    private const CADENCES = [
        'app:generate-template-events' => 1440,
        'app:close-registration' => 5,
        'app:expire-payment-deadlines' => 1,
        'app:expire-provider-deadlines' => 5,
        'app:transition-event-lifecycle' => 5,
        'app:close-attendance-window' => 60,
        'app:generate-settlements' => 15 * 1440,
        'app:generate-monthly-invoices' => 31 * 1440,
        'app:process-invoice-arrears' => 1440,
        'app:check-dormant-communities' => 1440,
        'app:ensure-seasons' => 1440,
        'app:send-reminders' => 15,
        'app:reconcile-balances' => 1440,
    ];

    public function handle(): int
    {
        // أول نشاط مسجل للمجدول — مرجع للمهام التي لم تسجل نبضة قط.
        $schedulerActiveSince = JobRun::min('created_at');
        $silent = [];

        foreach (self::CADENCES as $job => $cadenceMinutes) {
            $threshold = now()->subMinutes($cadenceMinutes * 2);
            $lastRunAt = JobRun::lastHeartbeatAt($job);

            $isSilent = $lastRunAt !== null
                ? $lastRunAt->lt($threshold)
                : ($schedulerActiveSince !== null && Carbon::parse($schedulerActiveSince)->lt($threshold));

            if ($isSilent) {
                $silent[] = $job;

                // A14 — مسار تسجيل واحد: خدمة التنبيهات تكتب Log::critical
                // وتفتح صفاً في صندوق أدمن تيمات معاً (H §20).
                app(CriticalAlertService::class)->raise(
                    key: 'jobs.watchdog',
                    title: "المهمة المجدولة [{$job}] لم تُنفَّذ خلال ضعف دوريتها — الصمت ليس دليل نجاح (H §20).",
                    body: 'آخر تنفيذ: '.($lastRunAt?->toDateTimeString() ?? 'لا يوجد')." — الدورية {$cadenceMinutes} دقيقة.",
                    context: [
                        'job' => $job,
                        'last_run_at' => $lastRunAt?->toDateTimeString(),
                        'cadence_minutes' => $cadenceMinutes,
                    ],
                );
            }
        }

        // تهذيب نبضات أقدم من 30 يوماً حتى لا يتضخم الجدول.
        JobRun::whereNull('entity_type')
            ->where('created_at', '<', now()->subDays(30))
            ->delete();

        $this->recordHeartbeat();

        $this->info($silent === []
            ? 'كل المهام الحرجة نُفِّذت ضمن دوريتها.'
            : 'مهام صامتة: '.implode('، ', $silent));

        return self::SUCCESS;
    }
}
