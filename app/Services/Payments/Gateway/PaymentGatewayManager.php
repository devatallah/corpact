<?php

namespace App\Services\Payments\Gateway;

use InvalidArgumentException;

/**
 * محلّ درايفر البوابة من config/payments.php — الجهة الوحيدة التي تعرف أي
 * بوابة فعالة. بقية الكود يطلب PaymentGatewayInterface فقط.
 */
class PaymentGatewayManager
{
    public function gateway(?string $name = null): PaymentGatewayInterface
    {
        $name ??= $this->defaultGatewayName();

        $class = config("payments.gateways.{$name}");

        if ($class === null || ! is_subclass_of($class, PaymentGatewayInterface::class)) {
            throw new InvalidArgumentException("بوابة دفع غير معرّفة: {$name}");
        }

        return app($class);
    }

    public function defaultGatewayName(): string
    {
        return (string) config('payments.gateway', 'local');
    }
}
