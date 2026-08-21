<?php

namespace App\Services\Payments;

use App\Enums\EventStatus;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\PaymentIntent;
use App\Models\PaymentWebhook;
use App\Services\Notifications\CriticalAlertService;
use App\Services\Payments\Gateway\GatewayWebhookEvent;
use App\Services\Payments\Gateway\PaymentGatewayManager;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * استقبال ويبهوكات البوابة (H §12.6/§12.3):
 *
 * 1) التخزين الخام أولاً — كل ويبهوك يُكتب في payment_webhooks (الحمولة +
 *    التوقيع + مفتاح التفرّد) **قبل** أي معالجة.
 * 2) تحقق التوقيع — الفاشل يوسم invalid ولا يُعالج.
 * 3) التفرّد — المكرر يُتجاهل بالمفتاح ولا يُنشئ قيداً ثانياً أبداً.
 * 4) المتأخر يُقبل ما لم يُمنح المقعد لغيره؛ وإن مُنح يُرد المبلغ تلقائياً
 *    إلى وسيلة الدفع الأصلية.
 */
class WebhookProcessor
{
    public function __construct(
        private PaymentGatewayManager $gateways,
        private CollectionService $collection,
        private EventRefundService $refunds,
    ) {}

    public function handle(string $gatewayName, string $payload, ?string $signature): PaymentWebhook
    {
        // ١) التخزين الخام قبل أي معالجة — حتى لو فشل كل ما بعده يبقى الأثر.
        $webhook = PaymentWebhook::create([
            'gateway' => $gatewayName,
            'payload' => $payload,
            'signature' => $signature,
            'processing_status' => PaymentWebhook::STATUS_RECEIVED,
        ]);

        $gateway = $this->gateways->gateway($gatewayName);

        // ٢) تحقق التوقيع.
        if ($signature === null || ! $gateway->verifyWebhook($payload, $signature)) {
            $webhook->forceFill([
                'processing_status' => PaymentWebhook::STATUS_INVALID,
                'error' => 'توقيع غير صحيح',
                'processed_at' => now(),
            ])->save();

            return $webhook;
        }

        try {
            $event = $gateway->parseWebhook($payload);
        } catch (Throwable $e) {
            $webhook->forceFill([
                'processing_status' => PaymentWebhook::STATUS_INVALID,
                'error' => "حمولة غير مفهومة: {$e->getMessage()}",
                'processed_at' => now(),
            ])->save();

            return $webhook;
        }

        $webhook->forceFill([
            'event_type' => $event->type,
            'gateway_reference' => $event->gatewayReference,
            'idempotency_key' => $event->idempotencyKey,
        ])->save();

        // ٣) التفرّد: ويبهوك سبق معالجته بنفس المفتاح ⇒ يُتجاهل، لا قيد ثانٍ.
        $duplicate = PaymentWebhook::query()
            ->where('idempotency_key', $event->idempotencyKey)
            ->where('id', '!=', $webhook->id)
            ->whereIn('processing_status', [PaymentWebhook::STATUS_PROCESSED, PaymentWebhook::STATUS_DUPLICATE])
            ->exists();

        if ($duplicate) {
            $webhook->forceFill([
                'processing_status' => PaymentWebhook::STATUS_DUPLICATE,
                'processed_at' => now(),
            ])->save();

            return $webhook;
        }

        try {
            $this->process($webhook, $event);

            $webhook->forceFill([
                'processing_status' => PaymentWebhook::STATUS_PROCESSED,
                'processed_at' => now(),
            ])->save();
        } catch (Throwable $e) {
            Log::error("فشلت معالجة ويبهوك #{$webhook->id}: {$e->getMessage()}");

            // H §20: فشل ويبهوك دفع من التنبيهات الفورية لأدمن تيمات.
            app(CriticalAlertService::class)->raise(
                key: 'payments.webhook_failed',
                title: 'فشلت معالجة ويبهوك دفع',
                body: "ويبهوك #{$webhook->id}: {$e->getMessage()}",
                context: ['webhook_id' => $webhook->id, 'error' => $e->getMessage()],
            );
            $webhook->forceFill([
                'processing_status' => PaymentWebhook::STATUS_FAILED,
                'error' => $e->getMessage(),
                'processed_at' => now(),
            ])->save();
        }

        return $webhook;
    }

    private function process(PaymentWebhook $webhook, GatewayWebhookEvent $event): void
    {
        $intent = $this->resolveIntent($event);

        if ($intent === null) {
            throw new \RuntimeException("لا مطالبة تقابل مرجع البوابة {$event->gatewayReference}");
        }

        $webhook->forceFill(['payment_intent_id' => $intent->id])->save();

        match ($event->type) {
            GatewayWebhookEvent::TYPE_PAYMENT_SUCCEEDED => $this->handlePaymentSucceeded($intent, $event),
            GatewayWebhookEvent::TYPE_PAYMENT_FAILED => $this->handlePaymentFailed($intent),
            GatewayWebhookEvent::TYPE_REFUND_SUCCEEDED => null, // الاسترداد يُسجَّل عند طلبه — الويبهوك توثيق إضافي
            default => throw new \RuntimeException("نوع ويبهوك غير معروف: {$event->type}"),
        };
    }

    private function resolveIntent(GatewayWebhookEvent $event): ?PaymentIntent
    {
        $byReference = PaymentIntent::query()
            ->where('gateway_reference', $event->gatewayReference)
            ->first();

        if ($byReference !== null) {
            return $byReference;
        }

        // المشغّل التجريبي يمرر معرف المطالبة في الحمولة.
        $intentId = $event->raw['payment_intent_id'] ?? null;

        return $intentId !== null ? PaymentIntent::query()->find((int) $intentId) : null;
    }

    private function handlePaymentSucceeded(PaymentIntent $intent, GatewayWebhookEvent $event): void
    {
        if ($event->amountHalalas !== null && $event->amountHalalas !== (int) $intent->amount_halalas) {
            throw new \RuntimeException(
                "مبلغ الويبهوك ({$event->amountHalalas}) لا يطابق مبلغ المطالبة ({$intent->amount_halalas}) — لا زيادة بعد الدفع أبداً.",
            );
        }

        if ($intent->status === PaymentIntent::STATUS_PENDING && $intent->expires_at->isFuture()) {
            $this->collection->markIntentPaid($intent, $event->gatewayReference);

            return;
        }

        if ($intent->status === PaymentIntent::STATUS_PAID || $intent->status === PaymentIntent::STATUS_REFUNDED) {
            return; // مكرر فعلياً — عولج من قبل، لا قيد ثانٍ
        }

        // ٤) ويبهوك متأخر بعد انتهاء المهلة (H §12.3): يُقبل ما لم يُمنح
        //    المقعد لغيره؛ وإن مُنح يُرد المبلغ تلقائياً للوسيلة الأصلية.
        $this->handleLatePayment($intent, $event);
    }

    private function handleLatePayment(PaymentIntent $intent, GatewayWebhookEvent $event): void
    {
        $restored = DB::transaction(function () use ($intent, $event) {
            /** @var Event|null $lockedEvent */
            $lockedEvent = Event::withoutGlobalScopes()->whereKey($intent->event_id)->lockForUpdate()->first();
            /** @var PaymentIntent $locked */
            $locked = PaymentIntent::query()->lockForUpdate()->findOrFail($intent->id);

            if ($lockedEvent === null || (string) $lockedEvent->status !== EventStatus::AwaitingPayment->value) {
                return false; // الفعالية حُسمت (تأكدت بدونه أو أُلغيت) — المقعد لم يعد له
            }

            $row = EventParticipant::query()
                ->where('event_id', $lockedEvent->id)
                ->where('employee_id', $locked->employee_id)
                ->first();

            if ($row === null || $row->seat_status !== 'released') {
                return false;
            }

            $reserved = EventParticipant::query()
                ->where('event_id', $lockedEvent->id)
                ->where('seat_status', 'reserved')
                ->count();

            $activeOffers = EventParticipant::query()
                ->where('event_id', $lockedEvent->id)
                ->where('seat_status', 'waitlisted')
                ->whereNotNull('offer_expires_at')
                ->where('offer_expires_at', '>=', now())
                ->count();

            // «ما لم يُمنح المقعد لغيره»: محجوز لبديل قَبِل أو معروض عليه الآن.
            if ($reserved + $activeOffers >= (int) $lockedEvent->participants_count) {
                return false;
            }

            // استعادة المقعد وقبول الدفعة المتأخرة.
            $row->forceFill(['seat_status' => 'reserved'])->save();

            $locked->forceFill([
                'status' => PaymentIntent::STATUS_PENDING,
                'cancelled_at' => null,
                'expires_at' => now()->addMinute(), // markIntentPaid يتطلب نافذة قائمة
            ])->save();

            $this->collection->markIntentPaid($locked, $event->gatewayReference);

            return true;
        });

        if (! $restored) {
            // مُنح المقعد لغيره ⇒ استرداد تلقائي للوسيلة الأصلية.
            $intent->refresh();
            $intent->forceFill([
                'status' => PaymentIntent::STATUS_PAID, // المال قُبض لدى البوابة فعلاً
                'paid_at' => $intent->paid_at ?? now(),
                'gateway_reference' => $event->gatewayReference,
            ])->save();

            $this->refunds->refundIntent($intent, 'دفعة متأخرة بعد منح المقعد لغيره — استرداد تلقائي (H §12.3)');
        }
    }

    private function handlePaymentFailed(PaymentIntent $intent): void
    {
        // فشل محاولة دفع لدى البوابة: المطالبة تبقى قائمة حتى نهاية النافذة —
        // للموظف إعادة المحاولة من نفس الرابط؛ payment_status = failed يُختم
        // عند انقضاء المهلة لا هنا.
        Log::info("فشلت محاولة دفع للمطالبة #{$intent->id} لدى البوابة — النافذة ما زالت مفتوحة.");
    }
}
