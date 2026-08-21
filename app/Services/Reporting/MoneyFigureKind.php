<?php

namespace App\Services\Reporting;

/**
 * A13 — أنواع المبالغ في التقارير، **مفصولة بالنوع لا بالاسم فقط** (H §15).
 *
 * تحذير المواصفة المحاسبي: «حجم التداول (GMV) = مجموع `total_price`
 * للفعاليات المكتملة — **ليس إيراد تيمات**»، و«إيراد تيمات = العمولة + رسوم
 * النظام + خدمة المنسّق». الخلط بينهما يضخّم الإيراد أضعافاً: تيمات **وكيل**
 * على قيمة النشاط (تُحصَّل نيابةً عن المزوّد وتُصرف له) و**أصيل** على العمولة
 * والرسوم وحدها.
 *
 * لذلك المبلغ في هذه الطبقة ليس `int` عارياً بل {@see MoneyFigure} يحمل نوعه،
 * وجمع نوعين مختلفين **يرمي استثناءً** — الفصل بنيوي لا اصطلاحي: بطاقة
 * تجمعهما لا يمكن كتابتها أصلاً.
 */
enum MoneyFigureKind: string
{
    /** حجم التداول: قيمة النشاط المحصَّلة نيابةً عن المزوّدين — ليس إيراداً. */
    case Gmv = 'gmv';

    /** إيراد تيمات: عمولة بنود التسوية. */
    case CommissionRevenue = 'commission_revenue';

    /** إيراد تيمات: رسوم النظام لكل موظف مفعّل. */
    case SystemFeeRevenue = 'system_fee_revenue';

    /** إيراد تيمات: خدمة المنسّق المُدار. */
    case CoordinatorRevenue = 'coordinator_revenue';

    /** ما صُرف للمزوّد — لا إيراد ولا حجم تداول. */
    case ProviderNet = 'provider_net';

    /** ما أنفقته الشركة فعلاً من محافظها (أساس «التكلفة لكل مشاركة»). */
    case CompanySpend = 'company_spend';

    public function label(): string
    {
        return match ($this) {
            self::Gmv => 'حجم التداول (GMV)',
            self::CommissionRevenue => 'إيراد العمولة',
            self::SystemFeeRevenue => 'إيراد رسوم النظام',
            self::CoordinatorRevenue => 'إيراد خدمة المنسّق',
            self::ProviderNet => 'صافي المزوّدين',
            self::CompanySpend => 'إنفاق الشركة',
        };
    }

    /**
     * هل هذا النوع إيراد لتيمات؟ (العمولة + رسوم النظام + خدمة المنسّق — H §15).
     */
    public function isTeamatRevenue(): bool
    {
        return match ($this) {
            self::CommissionRevenue, self::SystemFeeRevenue, self::CoordinatorRevenue => true,
            default => false,
        };
    }
}
