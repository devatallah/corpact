<?php

namespace App\Services\Payments\Gateway;

/**
 * حدث ويبهوك مفكوك بعد التحقق من توقيعه.
 */
final class GatewayWebhookEvent
{
    public const TYPE_PAYMENT_SUCCEEDED = 'payment_succeeded';

    public const TYPE_PAYMENT_FAILED = 'payment_failed';

    public const TYPE_REFUND_SUCCEEDED = 'refund_succeeded';

    /**
     * @param  array<string, mixed>  $raw
     */
    public function __construct(
        public readonly string $type,
        public readonly string $gatewayReference,
        public readonly string $idempotencyKey,
        public readonly ?int $amountHalalas = null,
        public readonly array $raw = [],
    ) {}
}
