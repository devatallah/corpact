<?php

namespace App\Exceptions;

use LogicException;

/**
 * H §12.7 + G/الأدمن المالي §3: **«الكشف المدفوع لا يُعدَّل إطلاقاً»** —
 * التصحيح بحركة عكسية + بند تصحيحي في الكشف **التالي** بسبب إلزامي في سجل
 * التدقيق، لا بتعديل كشف أو بند مصروف.
 */
class PaidSettlementImmutableException extends LogicException
{
    public function __construct(string $message = 'الكشف المدفوع لا يُعدَّل — التصحيح بحركة عكسية وبند تصحيحي في الكشف التالي.')
    {
        parent::__construct($message);
    }
}
