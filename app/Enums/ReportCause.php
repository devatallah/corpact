<?php

namespace App\Enums;

/**
 * A13 — **قائمة الأسباب المغلقة** لتوصيات تقرير المنسّق الشهري (H §15،
 * G/المنسّق §3).
 *
 * نص المواصفة وسببه معاً: «التوصيات تُختار من **قائمة أسباب وإجراءات مغلقة**
 * لا نص حر — **النص الحر لا يُنتج بيانات قابلة للتحليل**… اختيارك من القائمة
 * هو ما يسمح لاحقاً بمعرفة أي تدخل ينجح فعلاً».
 *
 * فالقيمة هنا ليست تصنيفاً شكلياً: هي المتغيّر المستقل في السؤال «أي تدخل
 * نجح؟» بعد أشهر. لذلك القائمة **enum لا جدول محرَّر**: إضافة سبب قرار منتج
 * يُراجَع، لا حقل يملؤه المنسّق وقت الكتابة.
 *
 * القائمة مشتقة من مؤشرات نجاح المنسّق ومهامه التشغيلية (G/المنسّق §2 و§5)
 * ومن «كيف تقيس العائد» (G/الشركة §6).
 */
enum ReportCause: string
{
    /** «انخفاض معدل الإلغاء لعدم بلوغ الحد الأدنى — وهو غالباً مشكلة إعداد لا مشكلة حماس». */
    case MinimumNotMet = 'minimum_not_met';

    /** مجتمع بلا قائد — يسبق الخمول ويسببه (H §6). */
    case CommunityLeaderless = 'community_leaderless';

    /** «مجتمع بلا فعالية مكتملة خلال ٣٠ يوماً يحتاج تدخلاً». */
    case CommunityDormant = 'community_dormant';

    /** معدل تفعيل منخفض رغم وجود فعاليات. */
    case LowActivation = 'low_activation';

    /** «إدارات معزولة عن البرنامج — وغالباً هي التي تحتاجه أكثر». */
    case DepartmentIsolated = 'department_isolated';

    /** الاعتماد على الإنشاء اليدوي بدل القوالب المتكررة. */
    case ManualScheduling = 'manual_scheduling';

    /** تأخر المزوّد أو رفضه أو إلغاؤه بعد القبول. */
    case ProviderUnreliable = 'provider_unreliable';

    /** توقيت الفعاليات لا يناسب الفئة المستهدفة. */
    case UnsuitableTiming = 'unsuitable_timing';

    /** تزاحم فعاليات عدة مجتمعات في يوم واحد. */
    case CalendarCongestion = 'calendar_congestion';

    /** رصيد المحفظة لا يغطي الدعم المعلن. */
    case BudgetExhausted = 'budget_exhausted';

    /** تعثّر تحصيل حصص الموظفين قبل انتهاء المهلة. */
    case PaymentFriction = 'payment_friction';

    /** «الإطلاق الصامت هو السبب الأول لفشل هذه البرامج» (G/الشركة §4). */
    case SilentLaunch = 'silent_launch';

    public function label(): string
    {
        return match ($this) {
            self::MinimumNotMet => 'إلغاء متكرر لعدم بلوغ الحد الأدنى',
            self::CommunityLeaderless => 'مجتمع بلا قائد',
            self::CommunityDormant => 'مجتمع خامل بلا فعالية مكتملة',
            self::LowActivation => 'معدل تفعيل منخفض',
            self::DepartmentIsolated => 'إدارة معزولة عن البرنامج',
            self::ManualScheduling => 'إنشاء يدوي بدل القوالب المتكررة',
            self::ProviderUnreliable => 'ضعف موثوقية المزوّد',
            self::UnsuitableTiming => 'توقيت غير مناسب',
            self::CalendarCongestion => 'تزاحم التقويم في يوم واحد',
            self::BudgetExhausted => 'رصيد المحفظة لا يغطي الدعم',
            self::PaymentFriction => 'تعثّر تحصيل حصص الموظفين',
            self::SilentLaunch => 'إطلاق صامت وضعف التعريف بالبرنامج',
        };
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases(),
        );
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
