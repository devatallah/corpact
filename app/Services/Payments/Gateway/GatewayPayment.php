<?php

namespace App\Services\Payments\Gateway;

/**
 * نتيجة إنشاء دفعة لدى البوابة: مرجعها لديها + رابط صفحة الدفع.
 */
final class GatewayPayment
{
    public function __construct(
        public readonly string $gatewayReference,
        public readonly string $checkoutUrl,
        public readonly GatewayPaymentStatus $status = GatewayPaymentStatus::Pending,
    ) {}
}
