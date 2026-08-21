<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Services\Events\TemplateGenerationService;
use Illuminate\Console\Command;

/**
 * توليد الفعاليات من قوالب التكرار (A8 — H §8, §20، يومياً 02:00):
 *
 * - الفعالية تُولَّد قبل 14 يوماً من موعدها؛ بداية الأسبوع الأحد؛ «يوم 31»
 *   في شهر أقصر ← آخر يوم.
 * - أيام الحظر: تخطٍ أو إزاحة أسبوع حسب إعداد القالب.
 * - يتخطى القوالب الموقوفة والمجتمعات الخاملة والوحدات غير المتاحة
 *   (حارس توفر A9) — مع إشعار القادة بالسبب.
 * - idempotent لكل (قالب + تاريخ نمطي) عبر JobRun::runOnce — تشغيل اليوم
 *   مرتين لا يولّد شيئاً مرتين، وتفويت يومٍ يعوَّض في التشغيل التالي.
 */
class GenerateTemplateEvents extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:generate-template-events';

    protected $description = 'توليد الفعاليات من القوالب المتكررة (H §20 — يومياً 02:00)';

    public function __construct(private TemplateGenerationService $generation)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $totals = $this->generation->generateAll();

        $this->recordHeartbeat();

        $this->info("توليد القوالب: وُلّدت {$totals['generated']} · تُخطيت {$totals['skipped']} · فشلت {$totals['failed']}");

        return self::SUCCESS;
    }
}
