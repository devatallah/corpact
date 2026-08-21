<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RecordsHeartbeat;
use App\Models\PaymentIntent;
use App\Services\Notifications\CriticalAlertService;
use App\Services\Payments\EventRefundService;
use Illuminate\Console\Command;

/**
 * إعادة المحاولة الآلية لفشل الاستردادات (A10 — H §12.4): «فشل الاسترداد
 * يدخل قائمة فشل مرئية للأدمن المالي مع إعادة محاولة آلية، ولا يُترك
 * صامتاً». ما استنفد محاولاته يبقى في القائمة بانتظار معالجة يدوية —
 * ويُصرخ به في السجل الحرج.
 */
class RetryFailedRefunds extends Command
{
    use RecordsHeartbeat;

    protected $signature = 'app:retry-failed-refunds';

    protected $description = 'إعادة محاولة الاستردادات الفاشلة آلياً — القائمة مرئية للأدمن المالي (H §12.4)';

    public function __construct(private EventRefundService $refunds)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $succeeded = $this->refunds->retryFailedRefunds();

        $exhausted = PaymentIntent::query()
            ->where('refund_status', PaymentIntent::REFUND_FAILED)
            ->where('refund_attempts', '>=', (int) config('payments.refunds.max_auto_retries', 5))
            ->count();

        if ($exhausted > 0) {
            app(CriticalAlertService::class)->raise(
                key: 'payments.refund_failed',
                title: 'استردادات فاشلة استنفدت محاولاتها الآلية',
                body: "{$exhausted} استرداداً يحتاج معالجة الأدمن المالي يدوياً.",
                context: ['exhausted' => $exhausted],
            );
        }

        $this->recordHeartbeat();

        $this->info("نجحت إعادة المحاولة: {$succeeded} · بانتظار معالجة يدوية: {$exhausted}");

        return self::SUCCESS;
    }
}
