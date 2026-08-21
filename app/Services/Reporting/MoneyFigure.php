<?php

namespace App\Services\Reporting;

use App\Exceptions\IncompatibleMoneyFigureException;
use App\Support\Money;

/**
 * A13 — مبلغ بالهللة يحمل **نوعه** (H §15).
 *
 * القاعدة الوحيدة التي يفرضها هذا الصنف: **لا يُجمع نوعان مختلفان**. حجم
 * التداول لا يُجمع مع العمولة، والإنفاق لا يُجمع مع الإيراد. المحاولة ترمي
 * {@see IncompatibleMoneyFigureException} — فبطاقة واحدة تخلط الرقمين لا
 * يمكن كتابتها أصلاً، ولا يبقى الفصل رهن انتباه من يكتب الصفحة.
 *
 * الحقل في التسلسل يخرج باسمين صريحين (`*_halalas` عدداً صحيحاً و`*` نصاً
 * للعرض) — لا حقل «إجمالي» جامع.
 */
final class MoneyFigure
{
    public function __construct(
        public readonly MoneyFigureKind $kind,
        public readonly int $halalas,
    ) {}

    public static function of(MoneyFigureKind $kind, int $halalas): self
    {
        return new self($kind, $halalas);
    }

    public static function zero(MoneyFigureKind $kind): self
    {
        return new self($kind, 0);
    }

    /**
     * جمع مبلغين **من النوع نفسه فقط**.
     */
    public function plus(self $other): self
    {
        if ($other->kind !== $this->kind) {
            throw IncompatibleMoneyFigureException::forKinds($this->kind, $other->kind);
        }

        return new self($this->kind, $this->halalas + $other->halalas);
    }

    /**
     * مجموع مبالغ من النوع نفسه.
     *
     * @param  iterable<self>  $figures
     */
    public static function sum(MoneyFigureKind $kind, iterable $figures): self
    {
        $total = self::zero($kind);

        foreach ($figures as $figure) {
            $total = $total->plus($figure);
        }

        return $total;
    }

    /**
     * القيمة النصية للعرض بالريال — على الحافة فقط.
     */
    public function formatted(): string
    {
        return Money::format($this->halalas);
    }

    /**
     * حقلان صريحان بادئتهما اسم النوع — لا مفتاح «إجمالي» يخلط نوعين.
     *
     * @return array<string, int|string>
     */
    public function toFields(): array
    {
        return [
            $this->kind->value.'_halalas' => $this->halalas,
            $this->kind->value => $this->formatted(),
        ];
    }
}
