<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Services\Billing\InvoiceArrearsService;
use Illuminate\Console\Command;

/**
 * سلّم التأخر عن السداد (H §12.8): تنبيه بعد 7 أيام، ثم 15، ثم **إيقاف إنشاء
 * فعاليات جديدة بعد 30 يوماً** — ولا شيء غير ذلك.
 *
 * ليست في جدول H §20 صراحةً (كحال `app:retry-failed-refunds` عند A10): نص
 * §12.8 يفرض سلّماً يومياً فأُضيفت بدورية يومية 06:00. كل درجة تُختم على
 * الفاتورة فلا تتكرر.
 */
class ProcessInvoiceArrears extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:process-invoice-arrears';

    protected $description = 'سلّم التأخر عن سداد فواتير رسوم النظام (H §12.8 — يومياً)';

    public function handle(InvoiceArrearsService $arrears): int
    {
        $this->recordHeartbeat();

        $result = $arrears->process();

        $this->info("تنبيهات 7 أيام: {$result['reminded_7']}، تنبيهات 15 يوماً: {$result['reminded_15']}، حجب إنشاء: {$result['blocked']}.");

        return self::SUCCESS;
    }
}
