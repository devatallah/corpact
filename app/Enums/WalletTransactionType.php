<?php

namespace App\Enums;

/**
 * دفتر الحركات — الأنواع المغلقة (H §12.5). القائمة نهائية بنص المواصفة؛
 * لا يُضاف نوع جديد إلا بتعديلها.
 */
enum WalletTransactionType: string
{
    case TopUp = 'top_up';
    case Allocation = 'allocation';
    case AllocationReversal = 'allocation_reversal';
    case Hold = 'hold';
    case HoldRelease = 'hold_release';
    case Capture = 'capture';
    case Refund = 'refund';
    case Commission = 'commission';
    case Settlement = 'settlement';
    case Adjustment = 'adjustment';

    public function label(): string
    {
        return match ($this) {
            self::TopUp => 'شحن رصيد',
            self::Allocation => 'تخصيص لمجتمع',
            self::AllocationReversal => 'عكس تخصيص',
            self::Hold => 'حجز مبلغ',
            self::HoldRelease => 'فك حجز',
            self::Capture => 'استقطاع',
            self::Refund => 'استرداد',
            self::Commission => 'عمولة',
            self::Settlement => 'تسوية',
            self::Adjustment => 'قيد تصحيحي',
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
