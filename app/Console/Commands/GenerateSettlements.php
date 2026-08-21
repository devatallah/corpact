<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Services\Billing\SettlementStatementService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * توليد كشوف التسوية **كل 15 يوماً لكل مزوّد** (H §12.7 + جدول H §20 —
 * 1 و16 من كل شهر الساعة 03:00).
 *
 * الكشف يجمع بنود الفعاليات المكتملة في الفترة المنتهية للتو: يوم 16 تُفوتر
 * الفترة 1–15، ويوم 1 تُفوتر الفترة 16–آخر الشهر الماضي. أي بند معلّق أقدم
 * (وأي **بند تصحيحي** أُنشئ بعد كشف مدفوع) يدخل تلقائياً — وهذا معنى
 * «بند تصحيحي في الكشف التالي».
 *
 * idempotent بمفتاح (المزوّد + المهمة + مفتاح الفترة) عبر `JobRun::runOnce`
 * وبقيد فريد على (partner_id + period_key).
 */
class GenerateSettlements extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:generate-settlements {--period-at= : تاريخ تشغيل افتراضي (اختباري/تعويضي)}';

    protected $description = 'توليد كشوف التسوية (H §20 — كل 15 يوماً 03:00)';

    public function handle(SettlementStatementService $statements): int
    {
        $this->recordHeartbeat();

        $runAt = $this->option('period-at') !== null
            ? Carbon::parse((string) $this->option('period-at'))
            : Carbon::now();

        $period = $statements->periodEndingBefore($runAt);
        $result = $statements->generateAll($period);

        $this->info("الفترة {$period['key']} ({$period['start']->toDateString()} → {$period['end']->toDateString()}): "
            ."وُلِّد {$result['generated']} كشف، وتُخطِّي {$result['skipped']}.");

        return self::SUCCESS;
    }
}
