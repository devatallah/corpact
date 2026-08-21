<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * سحب يتجاوز رصيد المحفظة. تُلتقط في طبقة المتحكمات وتُحوَّل إلى
 * ValidationException برسالة عربية حيث يلزم.
 */
class InsufficientBalanceException extends RuntimeException
{
    public function __construct(string $message = 'رصيد المحفظة غير كافٍ.')
    {
        parent::__construct($message);
    }
}
