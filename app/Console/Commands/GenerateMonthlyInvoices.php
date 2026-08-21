<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Models\Company;
use App\Models\JobRun;
use App\Services\Billing\InvoiceService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * فواتير رسوم النظام الشهرية — **اليوم الثالث من الشهر التالي** عن الدورة
 * الميلادية المنقضية (H §12.8 + جدول H §20).
 *
 * الأساس عدد **الموظفين المفعّلين**: من شارك في فعالية انتقلت إلى `completed`
 * داخل الدورة ولم يُسجَّل غائباً، مرة واحدة مهما تعددت فعالياته — ومن غادر
 * خلال الدورة يُحتسب إن كان قد فُعّل قبل مغادرته.
 *
 * شركة بلا رسم عقد محدد **لا تُفوتر** ويُنبَّه الأدمن (لا افتراضات في أرقام
 * العقود). idempotent بمفتاح (الشركة + المهمة + الدورة).
 */
class GenerateMonthlyInvoices extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:generate-monthly-invoices {--cycle-at= : تاريخ تشغيل افتراضي (اختباري/تعويضي)}';

    protected $description = 'توليد الفواتير الشهرية (H §20 — اليوم 3 من كل شهر 03:00)';

    public function handle(InvoiceService $invoices): int
    {
        $this->recordHeartbeat();

        $runAt = $this->option('cycle-at') !== null
            ? Carbon::parse((string) $this->option('cycle-at'))
            : Carbon::now();

        $cycle = $invoices->cycleFor($runAt);
        $issued = 0;
        $skipped = 0;

        foreach (Company::query()->withoutGlobalScopes()->cursor() as $company) {
            $invoice = null;

            $ran = JobRun::runOnce(
                job: 'billing:generate-monthly-invoice',
                entityType: 'company',
                entityId: (int) $company->id,
                period: $cycle['key'],
                callback: function () use ($invoices, $company, $cycle, &$invoice): void {
                    $invoice = $invoices->generateFor($company, $cycle, null, Carbon::now());
                },
            );

            if ($ran && $invoice !== null) {
                $issued++;
            } else {
                $skipped++;
            }
        }

        $this->info("دورة {$cycle['key']}: صدرت {$issued} فاتورة، وتُخطِّي {$skipped} شركة.");

        return self::SUCCESS;
    }
}
