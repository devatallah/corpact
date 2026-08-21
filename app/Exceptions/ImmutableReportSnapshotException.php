<?php

namespace App\Exceptions;

use LogicException;

/**
 * H §15: «يُحفظ نسخة ثابتة لكل شهر». اللقطة الشهرية سجل لا مسوّدة — تعديلها
 * أو حذفها خطأ برمجي لا حالة تشغيل.
 */
class ImmutableReportSnapshotException extends LogicException
{
    public static function forColumn(string $column): self
    {
        return new self("الحقل «{$column}» ثابت في اللقطة الشهرية ولا يقبل التعديل بعد التوليد.");
    }
}
