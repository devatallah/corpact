<?php

namespace App\Enums;

use App\Services\Authorization\AuthorizationService;

/**
 * Spec roles (H §3) carried by `role_assignments`, always read together with
 * a scope: («قائد على المجتمع رقم 12» لا «قائد» فقط).
 *
 * The permission lists implement the G/ملحق-ب matrix. A permission means
 * nothing on its own — every check is (permission + scope) resolved through
 * {@see AuthorizationService}.
 */
enum Role: string
{
    case Employee = 'employee';
    case CommunityLeader = 'community_leader';
    case AccountManager = 'account_manager';
    case Coordinator = 'coordinator';
    case Provider = 'provider';
    case PlatformAdmin = 'platform_admin';
    case FinanceAdmin = 'finance_admin';
    case SupportAgent = 'support_agent';

    public function label(): string
    {
        return match ($this) {
            self::Employee => 'موظف',
            self::CommunityLeader => 'قائد مجتمع',
            self::AccountManager => 'مسؤول الحساب',
            self::Coordinator => 'منسّق مُدار',
            self::Provider => 'مزوّد الخدمة',
            self::PlatformAdmin => 'أدمن تيمات',
            self::FinanceAdmin => 'الأدمن المالي',
            self::SupportAgent => 'وكيل الدعم',
        };
    }

    /**
     * G/ملحق-ب permission matrix, one row per permission.
     *
     * «إنشاء فعالية منشورة مباشرة» for the plain employee is «حسب إعداد
     * الشركة» — the company setting belongs to A4, so the employee role does
     * not carry `event.create_direct` here; the future setting layer grants it
     * conditionally on top of this matrix.
     *
     * @return string[]
     */
    public function permissions(): array
    {
        return match ($this) {
            self::Employee => [
                'event.join',
                'event.withdraw',
                'community.join',
                'community.leave',
                'event.propose',
            ],
            self::CommunityLeader => [
                'event.create_direct',
                'event.approve',
                'template.manage',
                'attendance.edit',
                'results.enter',
                // A12 — H §13: «تصحيحها بعد الاعتماد يحتاج صلاحية + سبباً»؛
                // صلاحية مسماة مستقلة عن الإدخال كي تُنزع وحدها لاحقاً.
                'results.correct',
                // A12 — H §13: «يستطيع القائد أو أدمن تيمات إنشاء مواسم مخصصة».
                'season.manage',
                'member.remove',
                'member.invite',
                'announcement.post',   // H §6: إعلان من القائد أو المنسّق فقط
            ],
            self::AccountManager => [
                'event.create_direct',
                'event.approve',
                'template.manage',
                'event.cancel',
                'wallet.topup.request',
                'wallet.allocate',
                'employees.invite',
                'employee.deactivate',
                'member.remove',
                'member.ban',
                'member.invite',
                'reports.view',
                // A15 — H §19: «يراه أدمن تيمات كاملاً، ويرى مسؤول الحساب
                // ملخصاً محدوداً لشركته فقط». صلاحية منفصلة عن `audit.view`
                // كي لا يتسرب سجل شركة إلى أخرى.
                'audit.view.company',
            ],
            self::Coordinator => [
                'event.create_direct',
                'event.approve',
                'template.manage',
                'attendance.edit',
                'results.enter',
                'results.correct',
                // المنسّق ليس من «القائد أو أدمن تيمات» في نص المواسم (H §13)
                // — فلا `season.manage` له.
                'member.invite',
                'announcement.post',   // H §6: إعلان من القائد أو المنسّق فقط
            ],
            self::Provider => [
                'event.cancel',           // «يخصه هو» — provider scope only
                'settlement.dispute',     // «يعترض»
            ],
            self::PlatformAdmin => [
                'event.create_direct',
                'event.approve',
                'template.manage',
                'event.cancel',
                'attendance.edit',
                'results.enter',
                'results.correct',
                'season.manage',
                'wallet.allocate',
                'employees.invite',
                'employee.deactivate',
                'member.remove',
                'member.ban',
                'event.force_state',
                // A15 — G (أدمن تيمات §3): «تستطيع تعديل قائمة الحضور بعد
                // انقضاء نافذة الـ24 ساعة — وهو استثناء لا إجراء روتيني»؛
                // مستقلة عن `attendance.edit` (نافذة القائد) كي يُمنع وكيل
                // الدعم منها صراحةً ويُصعِّدها.
                'attendance.edit_post_window',
                'provider.reliability.adjust',
                'catalog.manage',
                'platform.manage',
                'admins.manage',
                'revenue.view',
                // A14 — G (وكيل الدعم): «قراءة سجل الإشعارات وحالات التسليم —
                // أول ما يُفحص في شكوى لم يصلني شيء». صلاحية مستقلة عن
                // `platform.manage` كي يمنحها A15 لدور وكيل الدعم وحده.
                'notifications.logs.view',
                // A15 — H §19 / G (أدمن تيمات §5).
                'audit.view',
                'audit.view.company',
                'security.events.view',
                'support.search',
                'event.history.view',
                'support.resend',
                'support.messages.manage',
                'files.manage',
            ],
            self::FinanceAdmin => [
                'wallet.topup.approve',   // اعتماد تحويل بنكي
                // إلغاء اعتماد سابق (H §12.5 بند 5): «صلاحية أعلى» — لا يوجد
                // دور مالي أعلى في نموذج الأدوار الحالي، فتُمنح للأدمن المالي
                // مع اشتراط أن يكون غير المنشئ وغير المعتمد الأصلي + سبب
                // مسجَّل (انظر divergences.md — قرار A6).
                'wallet.topup.unapprove',
                'settlement.approve',     // اعتماد كشف تسوية وصرفه
                'refund.approve',
                'invoice.approve',
                'revenue.view',
                // A10 — H §12.4: قائمة فشل المدفوعات والاستردادات مسؤولية
                // الأدمن المالي اليومية + إعادة المحاولة اليدوية.
                'payments.failures.view',
                'payments.refund.retry',
            ],
            // A15 — G («دليل وكيل الدعم»): «صلاحياته قراءة وتدخل محدود.
            // مهمتك تشخيص المشكلة وتوثيقها وتصعيدها لمن يملك الصلاحية، لا
            // حلّها بتجاوز النظام». كل ما ليس في هذه القائمة يُصعَّد — ولا
            // يحمل الدور أي صلاحية اعتماد مالي، ولا `event.force_state`،
            // ولا `attendance.edit*`، ولا `results.*`، ولا
            // `provider.reliability.adjust`، ولا `admins.manage`.
            self::SupportAgent => [
                'support.search',            // البحث في الفعاليات والمستخدمين والشركات
                'event.history.view',        // قراءة سجل حالات أي فعالية
                'notifications.logs.view',   // سجل الإشعارات وحالات التسليم
                'support.resend',            // إعادة إرسال دعوة أو رمز ضمن الحدود
                'support.messages.manage',   // توثيق البلاغ
            ],
        };
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions(), true);
    }

    /**
     * Roles that live on the platform scope (Teamat staff).
     *
     * @return self[]
     */
    public static function platformRoles(): array
    {
        return [self::PlatformAdmin, self::FinanceAdmin, self::SupportAgent];
    }

    /**
     * G (وكيل الدعم / «ما لا تفعله — يُصعَّد فوراً»): the escalation matrix,
     * as (permission => role that owns it). A denial surfaced to a support
     * agent names the role to escalate to instead of a bare 403.
     *
     * @return array<string, self>
     */
    public static function escalationMatrix(): array
    {
        return [
            'event.force_state' => self::PlatformAdmin,           // تغيير حالة فعالية يدوياً
            'attendance.edit_post_window' => self::PlatformAdmin, // تعديل الحضور بعد نافذة الـ24 ساعة
            'attendance.edit' => self::PlatformAdmin,
            'results.correct' => self::PlatformAdmin,             // تصحيح النتائج
            'provider.reliability.adjust' => self::PlatformAdmin, // تعديل مؤشر موثوقية مزوّد
            'admins.manage' => self::PlatformAdmin,               // تغيير صلاحية أو دور
            'platform.manage' => self::PlatformAdmin,
            'catalog.manage' => self::PlatformAdmin,
            'refund.approve' => self::FinanceAdmin,               // أي استرداد أو تصحيح مالي
            'wallet.topup.approve' => self::FinanceAdmin,         // اعتماد تحويل بنكي
            'wallet.topup.unapprove' => self::FinanceAdmin,
            'settlement.approve' => self::FinanceAdmin,           // اعتماد كشف تسوية
            'invoice.approve' => self::FinanceAdmin,
        ];
    }

    /**
     * The role a support agent must escalate `$permission` to, if any.
     */
    public static function escalatesTo(string $permission): ?self
    {
        return self::escalationMatrix()[$permission] ?? null;
    }
}
