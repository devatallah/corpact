<?php

namespace App\Services\Payments\Gateway;

use App\Models\GatewayTransaction;
use App\Models\PaymentIntent;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * المشغّل التجريبي الداخلي (H §12.6): يطوَّر ويُختبر عليه خط الدفع كاملاً —
 * صفحة checkout وهمية تستطيع النجاح والفشل والتأخير، وويبهوكات موقعة
 * HMAC-SHA256 تمر بنفس نقطة الاستقبال التي ستستعملها البوابة الحقيقية.
 * ربط بوابة حقيقية = درايفر جديد + config، بلا أي تغيير في خط التحصيل.
 *
 * حالته تُقرأ من صفوف payment_intents / gateway_transactions نفسها —
 * درايفر تجريبي بلا مخزن خارجي.
 */
class LocalTestGateway implements PaymentGatewayInterface
{
    public function createPayment(int $amountHalalas, string $currency, string $reference, string $idempotencyKey, array $metadata = []): GatewayPayment
    {
        if ($currency !== 'SAR') {
            throw new InvalidArgumentException('العملة المدعومة الريال السعودي فقط (H §12.1).');
        }

        // نفس مفتاح التفرّد ⇒ نفس الدفعة — لا إنشاء مزدوج عند إعادة المحاولة.
        $existing = GatewayTransaction::query()
            ->where('idempotency_key', $idempotencyKey)
            ->first();

        $gatewayReference = $existing?->gateway_reference ?? 'local_'.Str::uuid()->toString();

        return new GatewayPayment(
            gatewayReference: $gatewayReference,
            checkoutUrl: route('test-gateway.checkout', ['reference' => $gatewayReference]),
        );
    }

    public function getStatus(string $gatewayReference): GatewayPaymentStatus
    {
        $intent = PaymentIntent::query()->where('gateway_reference', $gatewayReference)->first();

        return match ($intent?->status) {
            PaymentIntent::STATUS_PAID => GatewayPaymentStatus::Paid,
            PaymentIntent::STATUS_REFUNDED => GatewayPaymentStatus::Refunded,
            PaymentIntent::STATUS_PENDING => GatewayPaymentStatus::Pending,
            null => GatewayPaymentStatus::Unknown,
            default => GatewayPaymentStatus::Failed,
        };
    }

    public function refund(string $gatewayReference, int $amountHalalas, string $idempotencyKey): GatewayRefundResult
    {
        // فشل استرداد مُحاكى للاختبارات وطابور الفشل: مرجع يبدأ بـ local_fail.
        if (str_starts_with($gatewayReference, 'local_fail')) {
            return new GatewayRefundResult(succeeded: false, error: 'محاكاة فشل استرداد لدى البوابة التجريبية.');
        }

        return new GatewayRefundResult(
            succeeded: true,
            gatewayReference: 'local_refund_'.sha1($idempotencyKey),
        );
    }

    public function verifyWebhook(string $payload, string $signature): bool
    {
        return hash_equals($this->sign($payload), $signature);
    }

    public function parseWebhook(string $payload): GatewayWebhookEvent
    {
        $data = json_decode($payload, true);

        if (! is_array($data) || ! isset($data['type'], $data['reference'], $data['idempotency_key'])) {
            throw new InvalidArgumentException('حمولة ويبهوك غير مفهومة.');
        }

        return new GatewayWebhookEvent(
            type: (string) $data['type'],
            gatewayReference: (string) $data['reference'],
            idempotencyKey: (string) $data['idempotency_key'],
            amountHalalas: isset($data['amount_halalas']) ? (int) $data['amount_halalas'] : null,
            raw: $data,
        );
    }

    /**
     * توقيع حمولة (يستعمله checkout التجريبي لبناء ويبهوكاته).
     */
    public function sign(string $payload): string
    {
        return hash_hmac('sha256', $payload, (string) config('payments.local.secret'));
    }
}
