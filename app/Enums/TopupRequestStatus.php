<?php

namespace App\Enums;

/**
 * حالات طلب شحن المحفظة بتحويل بنكي (H §12.5):
 * submitted ← under_review ← approved أو rejected.
 * إلغاء اعتماد سابق يعيد الطلب إلى under_review بحركة عكسية — لا حالة خامسة.
 */
enum TopupRequestStatus: string
{
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Submitted => 'مُقدَّم',
            self::UnderReview => 'قيد المراجعة',
            self::Approved => 'معتمد',
            self::Rejected => 'مرفوض',
        };
    }

    /**
     * @return string[]
     */
    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
