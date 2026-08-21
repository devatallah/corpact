<?php

namespace App\Exceptions;

use LogicException;

/**
 * القاعدة المالية الثانية (G — قبل أن تبدأ): «لا يُصحَّح خطأ بالحذف» —
 * حركات الدفتر غير قابلة للتعديل ولا للحذف أبداً؛ التصحيح بحركة عكسية
 * مرتبطة بالحركة الأصلية (H §12.5).
 */
class ImmutableLedgerException extends LogicException
{
    public function __construct(string $message = 'حركات الدفتر غير قابلة للتعديل أو الحذف — التصحيح يكون بحركة عكسية مرتبطة.')
    {
        parent::__construct($message);
    }
}
