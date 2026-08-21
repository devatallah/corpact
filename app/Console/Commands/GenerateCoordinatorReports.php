<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Models\Company;
use App\Models\CoordinatorMonthlyReport;
use App\Models\JobRun;
use App\Services\Reporting\CoordinatorReportService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * A13 — **اليوم الثاني من كل شهر** (H §15، G/المنسّق §3).
 *
 * لكل شركة: لقطة ثابتة لدورة الشهر المنقضي (بتوقيت الرياض)، ثم تسليمها
 * لمسؤول الحساب ونسخة لأدمن تيمات.
 *
 * idempotent بطبقتين: `JobRun::runOnce` بمفتاح (الشركة + الدورة)، وتحت ذلك
 * `unique(company_id, period_key)` في الجدول — فتشغيل المهمة مرتين في اليوم
 * نفسه، أو تشغيل تعويضي بعد أيام، لا يولّد لقطة ثانية ولا إشعاراً ثانياً.
 */
class GenerateCoordinatorReports extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:generate-coordinator-reports {--cycle-at= : تاريخ تشغيل افتراضي (اختباري/تعويضي)}';

    protected $description = 'توليد التقرير الشهري وتسليمه (H §15 — اليوم 2 من كل شهر 04:00)';

    public function handle(CoordinatorReportService $reports): int
    {
        $this->recordHeartbeat();

        $runAt = $this->option('cycle-at') !== null
            ? Carbon::parse((string) $this->option('cycle-at'))
            : Carbon::now();

        $period = $reports->cycleFor($runAt);

        $generated = 0;
        $skipped = 0;

        foreach (Company::query()->withoutGlobalScopes()->cursor() as $company) {
            $report = null;

            $ran = JobRun::runOnce(
                job: 'reports:generate-coordinator-report',
                entityType: 'company',
                entityId: (int) $company->id,
                period: $period->key,
                callback: function () use ($reports, $company, $period, &$report): void {
                    $report = $reports->generateFor($company, $period);
                    $reports->deliver($report);
                },
            );

            if ($ran && $report instanceof CoordinatorMonthlyReport) {
                $generated++;
            } else {
                $skipped++;
            }
        }

        $this->info("دورة {$period->key}: وُلِّد {$generated} تقريراً، وتُخطِّي {$skipped} شركة.");

        return self::SUCCESS;
    }
}
