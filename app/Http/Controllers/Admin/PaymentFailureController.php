<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentIntent;
use App\Models\PaymentWebhook;
use App\Services\Payments\EventRefundService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * قائمة فشل المدفوعات والاستردادات — مسؤولية الأدمن المالي اليومية
 * (H §12.4 + دليل الأدمن المالي §2/§6): «إعادة المحاولة آلية، لكن لا يُترك
 * فشل بلا معالجة». خلف permission:payments.failures.view (الأدمن المالي).
 */
class PaymentFailureController extends Controller
{
    public function __construct(private EventRefundService $refunds) {}

    public function index(): Response
    {
        $failedRefunds = PaymentIntent::query()
            ->where('refund_status', PaymentIntent::REFUND_FAILED)
            ->with(['event:id,title,event_date,community_id', 'event.community:id,name', 'employee:id,name'])
            ->latest('updated_at')
            ->paginate(20)
            ->through(fn (PaymentIntent $intent) => [
                'id' => $intent->id,
                'event' => $intent->event?->only(['id', 'title', 'event_date']),
                'community' => $intent->event?->community?->only(['id', 'name']),
                'employee' => $intent->employee?->only(['id', 'name']),
                'amount' => $intent->amount,
                'refund_reason' => $intent->refund_reason,
                'refund_attempts' => $intent->refund_attempts,
                'refund_last_error' => $intent->refund_last_error,
                'max_auto_retries' => (int) config('payments.refunds.max_auto_retries', 5),
                'updated_at' => $intent->updated_at?->toIso8601String(),
            ]);

        // مطالبات انقضت نافذتها دون سداد (فشل تحصيل على مستوى المشارك) +
        // ويبهوكات فشلت معالجتها — للمراقبة اليومية نفسها.
        $expiredIntents = PaymentIntent::query()
            ->where('status', PaymentIntent::STATUS_EXPIRED)
            ->with(['event:id,title,event_date', 'employee:id,name'])
            ->latest('updated_at')
            ->limit(50)
            ->get()
            ->map(fn (PaymentIntent $intent) => [
                'id' => $intent->id,
                'event' => $intent->event?->only(['id', 'title', 'event_date']),
                'employee' => $intent->employee?->only(['id', 'name']),
                'amount' => $intent->amount,
                'expires_at' => $intent->expires_at?->toIso8601String(),
            ]);

        $failedWebhooks = PaymentWebhook::query()
            ->where('processing_status', PaymentWebhook::STATUS_FAILED)
            ->latest()
            ->limit(50)
            ->get(['id', 'gateway', 'event_type', 'gateway_reference', 'error', 'created_at']);

        return Inertia::render('admin/payments/failures', [
            'failedRefunds' => $failedRefunds,
            'expiredIntents' => $expiredIntents,
            'failedWebhooks' => $failedWebhooks,
        ]);
    }

    /**
     * إعادة محاولة استرداد فاشل يدوياً — نفس مفتاح التفرّد فلا ازدواج أبداً.
     */
    public function retryRefund(PaymentIntent $intent): RedirectResponse
    {
        if ($intent->refund_status !== PaymentIntent::REFUND_FAILED) {
            return back()->with('error', 'هذه المطالبة ليست في قائمة فشل الاستردادات.');
        }

        $succeeded = $this->refunds->refundIntent($intent, $intent->refund_reason ?? 'إعادة محاولة يدوية من الأدمن المالي');

        return back()->with(
            $succeeded ? 'success' : 'error',
            $succeeded ? 'نجح الاسترداد وأُقفل من القائمة.' : 'ما زال الاسترداد يفشل لدى البوابة — الخطأ موثَّق في الصف.',
        );
    }
}
