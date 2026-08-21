<?php

namespace App\Services\Payments\Gateway;

/**
 * نتيجة طلب استرداد لدى البوابة — إلى وسيلة الدفع الأصلية حصراً.
 */
final class GatewayRefundResult
{
    public function __construct(
        public readonly bool $succeeded,
        public readonly ?string $gatewayReference = null,
        public readonly ?string $error = null,
    ) {}
}
