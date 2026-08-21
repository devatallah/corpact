<?php

namespace App\Enums;

/**
 * آلة حالات الفعالية — H §9 «إلزامية بحرفها».
 *
 * القيم الـ 15 المنصوصة + `rejected` (هدف انتقال pending_approval في جدول §9
 * نفسه — اقتراح موظف رُفض أو انقضت مهلة اعتماده). `full` القديمة حُذفت
 * نهائياً: بلوغ السعة عَلَم `is_full` مشتق لا حالة.
 */
enum EventStatus: string
{
    case PendingApproval = 'pending_approval';
    case Open = 'open';
    case Rejected = 'rejected';
    case PendingProvider = 'pending_provider';
    case ProviderAlternative = 'provider_alternative';
    case Booked = 'booked';
    case AwaitingPayment = 'awaiting_payment';
    case Confirmed = 'confirmed';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Settled = 'settled';
    case Expired = 'expired';
    case CancelledMinNotMet = 'cancelled_min_not_met';
    case CancelledProvider = 'cancelled_provider';
    case CancelledCompany = 'cancelled_company';
    case CancelledPaymentFailed = 'cancelled_payment_failed';

    public function label(): string
    {
        return match ($this) {
            self::PendingApproval => 'بانتظار الاعتماد',
            self::Open => 'مفتوحة للتسجيل',
            self::Rejected => 'اقتراح مرفوض',
            self::PendingProvider => 'بانتظار رد المزوّد',
            self::ProviderAlternative => 'وقت بديل مقترح',
            self::Booked => 'محجوزة — التسجيل مفتوح',
            self::AwaitingPayment => 'بانتظار الدفع',
            self::Confirmed => 'مؤكدة',
            self::InProgress => 'جارية الآن',
            self::Completed => 'مكتملة',
            self::Settled => 'مسوّاة',
            self::Expired => 'منتهية دون اكتمال العدد',
            self::CancelledMinNotMet => 'ملغاة — لم يبلغ الحد الأدنى',
            self::CancelledProvider => 'ملغاة من المزوّد',
            self::CancelledCompany => 'ملغاة من الشركة',
            self::CancelledPaymentFailed => 'ملغاة — فشل التحصيل',
        };
    }

    /**
     * الحالات التي ما زالت الفعالية فيها «حية» في خط السير.
     *
     * @return string[]
     */
    public static function activeValues(): array
    {
        return [
            self::Open->value,
            self::PendingProvider->value,
            self::ProviderAlternative->value,
            self::Booked->value,
            self::AwaitingPayment->value,
            self::Confirmed->value,
            self::InProgress->value,
        ];
    }

    /**
     * الحالات التي يجوز فيها الانضمام/قائمة الانتظار (قبل إغلاق التسجيل).
     *
     * @return string[]
     */
    public static function joinableValues(): array
    {
        return [
            self::Open->value,
            self::PendingProvider->value,
            self::ProviderAlternative->value,
            self::Booked->value,
        ];
    }

    /**
     * @return string[]
     */
    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
