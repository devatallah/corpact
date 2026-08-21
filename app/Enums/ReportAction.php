<?php

namespace App\Enums;

/**
 * A13 — **قائمة الإجراءات المغلقة** المقابلة لـ{@see ReportCause}
 * (H §15، G/المنسّق §3).
 *
 * التوصية زوج (سبب ← إجراء) لا جملة: هكذا يصير سؤال «أي تدخل ينجح فعلاً؟»
 * قابلاً للحساب لاحقاً بربط الإجراء المختار بتغيّر المؤشرات في الشهر التالي.
 *
 * الإجراءات كلها **داخل صلاحيات المنسّق أو قابلة للطلب من مسؤول الحساب** —
 * ولا واحد منها مما «لا يستطيعه» (G/المنسّق §4: لا شحن محفظة ولا اعتماد مالي
 * ولا تغيير حالة فعالية يدوياً)، فما يحتاج مسؤول الحساب يُصاغ طلباً.
 */
enum ReportAction: string
{
    case AppointLeader = 'appoint_leader';
    case LowerMinimum = 'lower_minimum';
    case ConvertToTemplate = 'convert_to_template';
    case ChangeTimeSlot = 'change_time_slot';
    case SwitchProvider = 'switch_provider';
    case AlternativeActivity = 'alternative_activity';
    case SpreadCalendar = 'spread_calendar';
    case TargetedInvite = 'targeted_invite';
    case AwarenessCampaign = 'awareness_campaign';
    case RequestWalletTopup = 'request_wallet_topup';
    case RaiseSubsidy = 'raise_subsidy';
    case ExtendPaymentWindow = 'extend_payment_window';
    case MergeCommunities = 'merge_communities';
    case PauseCommunity = 'pause_community';
    case NoActionNeeded = 'no_action_needed';

    public function label(): string
    {
        return match ($this) {
            self::AppointLeader => 'تعيين قائد جديد للمجتمع',
            self::LowerMinimum => 'خفض الحد الأدنى للمشاركين',
            self::ConvertToTemplate => 'تحويل المجتمع إلى قالب متكرر',
            self::ChangeTimeSlot => 'تغيير توقيت الفعاليات',
            self::SwitchProvider => 'تغيير المزوّد',
            self::AlternativeActivity => 'تجربة نشاط بديل',
            self::SpreadCalendar => 'توزيع التقويم وتفادي التزاحم',
            self::TargetedInvite => 'دعوة موجّهة للإدارة أو الموظفين',
            self::AwarenessCampaign => 'حملة تعريف داخلية بالبرنامج',
            self::RequestWalletTopup => 'طلب شحن المحفظة من مسؤول الحساب',
            self::RaiseSubsidy => 'رفع نسبة الدعم',
            self::ExtendPaymentWindow => 'مراجعة مهلة الدفع والتذكير بها',
            self::MergeCommunities => 'دمج مجتمعين متقاربين',
            self::PauseCommunity => 'إيقاف المجتمع مؤقتاً',
            self::NoActionNeeded => 'لا يحتاج تدخلاً هذا الشهر',
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
