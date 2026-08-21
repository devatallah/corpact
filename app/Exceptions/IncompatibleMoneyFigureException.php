<?php

namespace App\Exceptions;

use App\Services\Reporting\MoneyFigureKind;
use LogicException;

/**
 * تحذير المواصفة المحاسبي (H §15): **«حجم التداول ليس إيراد تيمات»** —
 * لا يجتمعان في بطاقة ولا يُجمعان في حقل. جمع نوعي مبالغ مختلفين في طبقة
 * التقارير خطأ برمجي لا حالة تشغيل، فيرمي استثناءً.
 */
class IncompatibleMoneyFigureException extends LogicException
{
    public static function forKinds(MoneyFigureKind $left, MoneyFigureKind $right): self
    {
        return new self(
            "لا يجوز جمع «{$left->label()}» مع «{$right->label()}» — نوعان مختلفان من المبالغ."
        );
    }
}
