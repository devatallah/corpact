<?php

namespace App\Support\Audit;

use App\Services\ActivityLogService;

/**
 * The mandatory audit catalog of H §19 (repeated in G «أدمن تيمات §5»):
 *
 *   تغيير الصلاحيات · كل حركة مالية واعتماد تحويل واسترداد · تغيير الحساب
 *   البنكي للمزوّد · تغيير حالة فعالية يدوياً · تعديل الحضور بعد الاكتمال ·
 *   تصحيح النتائج · تجاوز الاقتراح الآلي مع السبب · كل تصدير أو تنزيل تقرير ·
 *   تعطيل حساب · تبديل سياق الشركة.
 *
 * Actions are namespaced strings so the log filters by prefix
 * (`financial.*`, `permission.*`, …). {@see self::FROM_ACTIVITY_TYPE} is the
 * bridge that turns the 60+ existing `activity_logs` types into catalog
 * entries at a single choke point — {@see ActivityLogService}
 * mirrors any mapped type into `audit_logs` with actor, role, scope, IP and
 * user agent attached.
 */
class AuditAction
{
    // ── 1. تغيير الصلاحيات ────────────────────────────────────────────
    public const PERMISSION_GRANTED = 'permission.granted';

    public const PERMISSION_REVOKED = 'permission.revoked';

    public const PERMISSION_REVIEWED = 'permission.reviewed';

    // ── 2. كل حركة مالية واعتماد واسترداد ─────────────────────────────
    public const TOPUP_SUBMITTED = 'financial.topup.submitted';

    public const TOPUP_UNDER_REVIEW = 'financial.topup.under_review';

    public const TOPUP_APPROVED = 'financial.topup.approved';

    public const TOPUP_REJECTED = 'financial.topup.rejected';

    public const TOPUP_UNAPPROVED = 'financial.topup.unapproved';

    public const WALLET_ALLOCATED = 'financial.wallet.allocated';

    public const REFUND_ISSUED = 'financial.refund.issued';

    public const REFUND_FAILED = 'financial.refund.failed';

    public const REFUND_RETRIED = 'financial.refund.retried';

    public const SETTLEMENT_APPROVED = 'financial.settlement.approved';

    public const SETTLEMENT_PAID = 'financial.settlement.paid';

    public const SETTLEMENT_ITEM_CORRECTED = 'financial.settlement.item_corrected';

    public const INVOICE_ISSUED = 'financial.invoice.issued';

    public const INVOICE_PAID = 'financial.invoice.paid';

    public const EVENT_CREATION_BLOCKED = 'financial.arrears.event_creation_blocked';

    public const EVENT_CREATION_UNBLOCKED = 'financial.arrears.event_creation_unblocked';

    public const COMMISSION_RATE_SCHEDULED = 'financial.commission_rate.scheduled';

    public const CONTRACT_TERMS_SCHEDULED = 'financial.contract_terms.scheduled';

    public const UNIT_PRICE_CHANGE_DECIDED = 'financial.unit_price_change.decided';

    public const PAYMENT_FAILURE_REVIEWED = 'financial.payment_failure.reviewed';

    // ── 3. تغيير الحساب البنكي للمزوّد ────────────────────────────────
    public const BANK_ACCOUNT_CHANGED = 'provider.bank_account.changed';

    public const BANK_ACCOUNT_APPROVED = 'provider.bank_account.approved';

    // ── 4. تغيير حالة فعالية يدوياً ───────────────────────────────────
    public const EVENT_STATE_FORCED = 'event.state.forced';

    public const EVENT_CANCELLED_BY_ADMIN = 'event.cancelled_by_admin';

    // ── 5. تعديل الحضور بعد الاكتمال ──────────────────────────────────
    public const ATTENDANCE_POST_WINDOW_EDITED = 'attendance.post_window_edited';

    // ── 6. تصحيح النتائج ──────────────────────────────────────────────
    public const RESULT_CORRECTED = 'results.corrected';

    // ── 7. تجاوز الاقتراح الآلي مع السبب ──────────────────────────────
    public const PROVIDER_SUGGESTION_OVERRIDDEN = 'provider.suggestion.overridden';

    public const PROVIDER_RELIABILITY_ADJUSTED = 'provider.reliability.adjusted';

    // ── 8. كل تصدير أو تنزيل تقرير ────────────────────────────────────
    public const REPORT_EXPORTED = 'export.report';

    public const FILE_DOWNLOADED = 'export.file_download';

    // ── 9. تعطيل حساب ─────────────────────────────────────────────────
    public const ACCOUNT_DEACTIVATED = 'account.deactivated';

    public const ACCOUNT_ANONYMIZED = 'account.anonymized';

    // ── 10. تبديل سياق الشركة ─────────────────────────────────────────
    public const COMPANY_CONTEXT_SELECTED = 'company.context.selected';

    public const COMPANY_CONTEXT_SWITCHED = 'company.context.switched';

    // ── ملحقات موثَّقة (A8/A14/A15) ───────────────────────────────────
    public const NOTIFICATION_TEMPLATE_UPDATED = 'settings.notification_template.updated';

    public const PLATFORM_SETTING_UPDATED = 'settings.platform.updated';

    public const CATALOG_UPDATED = 'settings.catalog.updated';

    public const BLACKOUT_CHANGED = 'settings.blackout.changed';

    public const COMPANY_CONTRACT_UPDATED = 'company.contract.updated';

    public const FILE_UPLOADED = 'file.uploaded';

    public const FILE_REPLACED = 'file.replaced';

    public const SUPPORT_RESEND = 'support.resend';

    public const CROSS_COMPANY_PROBE = 'security.cross_company_probe';

    public const RETENTION_APPLIED = 'retention.applied';

    /**
     * Actions whose rows belong to the financial part of the log and are
     * therefore kept 10 years, not 24 months (H §19 «سجل التدقيق: 24 شهراً
     * (المالي منه 10 سنوات)»).
     *
     * @return string[]
     */
    public static function financial(): array
    {
        return [
            self::TOPUP_SUBMITTED,
            self::TOPUP_UNDER_REVIEW,
            self::TOPUP_APPROVED,
            self::TOPUP_REJECTED,
            self::TOPUP_UNAPPROVED,
            self::WALLET_ALLOCATED,
            self::REFUND_ISSUED,
            self::REFUND_FAILED,
            self::REFUND_RETRIED,
            self::SETTLEMENT_APPROVED,
            self::SETTLEMENT_PAID,
            self::SETTLEMENT_ITEM_CORRECTED,
            self::INVOICE_ISSUED,
            self::INVOICE_PAID,
            self::EVENT_CREATION_BLOCKED,
            self::EVENT_CREATION_UNBLOCKED,
            self::COMMISSION_RATE_SCHEDULED,
            self::CONTRACT_TERMS_SCHEDULED,
            self::UNIT_PRICE_CHANGE_DECIDED,
            self::PAYMENT_FAILURE_REVIEWED,
            self::BANK_ACCOUNT_CHANGED,
            self::BANK_ACCOUNT_APPROVED,
            self::COMPANY_CONTRACT_UPDATED,
        ];
    }

    public static function isFinancial(string $action): bool
    {
        return in_array($action, self::financial(), true);
    }

    /**
     * `activity_logs.type` → catalog action. Types absent from this map are
     * ordinary activity (a member joined a community, a template generated an
     * occurrence…) and stay out of the audit log.
     *
     * @return array<string, string>
     */
    public static function fromActivityTypeMap(): array
    {
        return [
            // financial
            'wallet_topup_submitted' => self::TOPUP_SUBMITTED,
            'wallet_topup_under_review' => self::TOPUP_UNDER_REVIEW,
            'wallet_topup_approved' => self::TOPUP_APPROVED,
            'wallet_topup_rejected' => self::TOPUP_REJECTED,
            'wallet_topup_unapproved' => self::TOPUP_UNAPPROVED,
            'wallet_distributed' => self::WALLET_ALLOCATED,
            'settlement_statement_approved' => self::SETTLEMENT_APPROVED,
            'settlement_statement_paid' => self::SETTLEMENT_PAID,
            'settlement_item_corrected' => self::SETTLEMENT_ITEM_CORRECTED,
            'platform_fee_invoice_issued' => self::INVOICE_ISSUED,
            'platform_fee_invoice_paid' => self::INVOICE_PAID,
            'event_creation_blocked' => self::EVENT_CREATION_BLOCKED,
            'event_creation_unblocked' => self::EVENT_CREATION_UNBLOCKED,
            'provider_commission_rate_scheduled' => self::COMMISSION_RATE_SCHEDULED,
            'company_contract_terms_scheduled' => self::CONTRACT_TERMS_SCHEDULED,
            'unit_price_change_approved' => self::UNIT_PRICE_CHANGE_DECIDED,
            'unit_price_change_rejected' => self::UNIT_PRICE_CHANGE_DECIDED,

            // bank
            'security_bank_account_changed' => self::BANK_ACCOUNT_CHANGED,
            'provider_bank_account_submitted' => self::BANK_ACCOUNT_CHANGED,
            'provider_bank_account_approved' => self::BANK_ACCOUNT_APPROVED,

            // events / attendance / results
            'event_status_forced' => self::EVENT_STATE_FORCED,
            'attendance_admin_exception' => self::ATTENDANCE_POST_WINDOW_EDITED,
            'result_corrected' => self::RESULT_CORRECTED,
            'provider_reliability_adjusted' => self::PROVIDER_RELIABILITY_ADJUSTED,

            // identity / context
            'membership_deactivated' => self::ACCOUNT_DEACTIVATED,
            'context_selected' => self::COMPANY_CONTEXT_SELECTED,
            'context_switched' => self::COMPANY_CONTEXT_SWITCHED,
            'community_leader_assigned' => self::PERMISSION_GRANTED,
            'community_leader_removed' => self::PERMISSION_REVOKED,
            'community_primary_changed' => self::PERMISSION_GRANTED,

            // settings
            'notification_template_updated' => self::NOTIFICATION_TEMPLATE_UPDATED,
            'blackout_created' => self::BLACKOUT_CHANGED,

            // security
            'cross_company_probe' => self::CROSS_COMPANY_PROBE,
        ];
    }

    public static function fromActivityType(string $type): ?string
    {
        return self::fromActivityTypeMap()[$type] ?? null;
    }

    /**
     * Arabic label for the admin/AM log screens.
     */
    public static function label(string $action): string
    {
        return self::labels()[$action] ?? $action;
    }

    /**
     * @return array<string, string>
     */
    public static function labels(): array
    {
        return [
            self::PERMISSION_GRANTED => 'منح صلاحية',
            self::PERMISSION_REVOKED => 'سحب صلاحية',
            self::PERMISSION_REVIEWED => 'مراجعة صلاحيات',
            self::TOPUP_SUBMITTED => 'طلب شحن محفظة',
            self::TOPUP_UNDER_REVIEW => 'بدء مراجعة تحويل',
            self::TOPUP_APPROVED => 'اعتماد تحويل بنكي',
            self::TOPUP_REJECTED => 'رفض تحويل بنكي',
            self::TOPUP_UNAPPROVED => 'إلغاء اعتماد تحويل',
            self::WALLET_ALLOCATED => 'تخصيص رصيد',
            self::REFUND_ISSUED => 'استرداد',
            self::REFUND_FAILED => 'فشل استرداد',
            self::REFUND_RETRIED => 'إعادة محاولة استرداد',
            self::SETTLEMENT_APPROVED => 'اعتماد كشف تسوية',
            self::SETTLEMENT_PAID => 'تسجيل صرف تسوية',
            self::SETTLEMENT_ITEM_CORRECTED => 'تصحيح بند تسوية',
            self::INVOICE_ISSUED => 'إصدار فاتورة',
            self::INVOICE_PAID => 'سداد فاتورة',
            self::EVENT_CREATION_BLOCKED => 'حجب إنشاء الفعاليات للتأخر',
            self::EVENT_CREATION_UNBLOCKED => 'رفع حجب إنشاء الفعاليات',
            self::COMMISSION_RATE_SCHEDULED => 'جدولة نسبة عمولة',
            self::CONTRACT_TERMS_SCHEDULED => 'جدولة شروط عقد',
            self::UNIT_PRICE_CHANGE_DECIDED => 'بت تغيير سعر وحدة',
            self::PAYMENT_FAILURE_REVIEWED => 'مراجعة فشل دفع',
            self::BANK_ACCOUNT_CHANGED => 'تغيير الحساب البنكي',
            self::BANK_ACCOUNT_APPROVED => 'اعتماد الحساب البنكي',
            self::EVENT_STATE_FORCED => 'تغيير حالة فعالية يدوياً',
            self::EVENT_CANCELLED_BY_ADMIN => 'إلغاء فعالية من الأدمن',
            self::ATTENDANCE_POST_WINDOW_EDITED => 'تعديل الحضور بعد النافذة',
            self::RESULT_CORRECTED => 'تصحيح نتيجة',
            self::PROVIDER_SUGGESTION_OVERRIDDEN => 'تجاوز الاقتراح الآلي',
            self::PROVIDER_RELIABILITY_ADJUSTED => 'تعديل مؤشر الموثوقية',
            self::REPORT_EXPORTED => 'تصدير تقرير',
            self::FILE_DOWNLOADED => 'تنزيل ملف',
            self::ACCOUNT_DEACTIVATED => 'تعطيل حساب',
            self::ACCOUNT_ANONYMIZED => 'إخفاء هوية حساب',
            self::COMPANY_CONTEXT_SELECTED => 'اختيار سياق شركة',
            self::COMPANY_CONTEXT_SWITCHED => 'تبديل سياق الشركة',
            self::NOTIFICATION_TEMPLATE_UPDATED => 'تعديل قالب رسالة',
            self::PLATFORM_SETTING_UPDATED => 'تعديل إعداد منصة',
            self::CATALOG_UPDATED => 'تعديل شجرة الفئات',
            self::BLACKOUT_CHANGED => 'تعديل أيام التعطيل',
            self::COMPANY_CONTRACT_UPDATED => 'تعديل بيانات عقد شركة',
            self::FILE_UPLOADED => 'رفع ملف',
            self::FILE_REPLACED => 'استبدال ملف',
            self::SUPPORT_RESEND => 'إعادة إرسال من الدعم',
            self::CROSS_COMPANY_PROBE => 'محاولة وصول عبر الشركات',
            self::RETENTION_APPLIED => 'تنفيذ سياسة الاحتفاظ',
        ];
    }
}
