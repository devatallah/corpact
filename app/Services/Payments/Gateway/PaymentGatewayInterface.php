<?php

namespace App\Services\Payments\Gateway;

/**
 * طبقة تجريد بوابة الدفع — إلزامية بنص H §12.6:
 *
 * «يُبنى كل ما يتعلق بالدفع خلف واجهة مجرَّدة، ويُطوَّر ويُختبر بالكامل عبر
 * مشغّل تجريبي داخلي، بحيث يكون ربط البوابة الحقيقية لاحقاً عملية يوم واحد
 * لا إعادة بناء. ممنوع استدعاء أي SDK لبوابة بعينها من داخل المتحكمات أو
 * النماذج» — الاستدعاء من طبقة الخدمات حصراً.
 *
 * كل المبالغ هللات صحيحة، والعملة SAR فقط (H §12.1).
 */
interface PaymentGatewayInterface
{
    /**
     * إنشاء عملية دفع لدى البوابة. مفتاح التفرّد يمنع الإنشاء المزدوج عند
     * إعادة المحاولة (القاعدة 5). تظهر تيمات في كشف الحساب
     * (statement descriptor — Merchant of Record).
     *
     * @param  array<string, mixed>  $metadata
     */
    public function createPayment(int $amountHalalas, string $currency, string $reference, string $idempotencyKey, array $metadata = []): GatewayPayment;

    public function getStatus(string $gatewayReference): GatewayPaymentStatus;

    /**
     * استرداد إلى وسيلة الدفع الأصلية — لا وجهة أخرى أبداً (H §12.4).
     */
    public function refund(string $gatewayReference, int $amountHalalas, string $idempotencyKey): GatewayRefundResult;

    /**
     * تحقق توقيع الويبهوك قبل أي معالجة.
     */
    public function verifyWebhook(string $payload, string $signature): bool;

    /**
     * تفكيك حمولة ويبهوك موثَّق التوقيع إلى حدث مفهوم.
     */
    public function parseWebhook(string $payload): GatewayWebhookEvent;
}
