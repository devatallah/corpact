<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * الصفة الضريبية ومصفوفة الفوترة (H §12.9).
 *
 * شاشة قراءة فقط: المعالجة الضريبية **قرار غير نهائي** بنص المواصفة، والجدول
 * أدناه هو ما يطبّقه النظام فعلاً الآن — يُقرأ من `config/billing.php` لا من
 * نص مكتوب في الواجهة، فلا ينفصل المعروض عن المطبَّق إذا تغيّر التصنيف.
 *
 * ما دام `billing.real_invoices_enabled` مطفأً تصدر الفواتير `provisional`:
 * تُحسب وتُعرض ولا تُقدَّم مستنداً ضريبياً نهائياً. قلبه قرار مالك ومحاسب.
 */
class TaxStatusController extends Controller
{
    /** ترتيب العرض وتسمية كل تدفّق مالي بالعربية. */
    private const FLOW_LABELS = [
        'activity_value' => 'قيمة النشاط (حجز الفعالية)',
        'commission' => 'عمولة المنصة على المزوّد',
        'system_fee' => 'رسوم النظام على الشركة',
        'coordinator_service' => 'خدمة المنسّق المُدار',
    ];

    private const TREATMENT_LABELS = [
        'agent' => 'وكيل وسيط (Agent)',
        'principal' => 'أصيل (Principal)',
    ];

    private const ISSUER_LABELS = [
        'provider' => 'مزوّد الخدمة',
        'teamat' => 'تيمات',
    ];

    public function index(): Response
    {
        /** @var array<string, array{treatment: string, issuer: string}> $tax */
        $tax = config('billing.tax', []);

        $flows = [];

        foreach (self::FLOW_LABELS as $key => $label) {
            if (! isset($tax[$key])) {
                continue;
            }

            $flows[] = [
                'key' => $key,
                'label' => $label,
                'treatment' => $tax[$key]['treatment'],
                'treatment_label' => self::TREATMENT_LABELS[$tax[$key]['treatment']] ?? $tax[$key]['treatment'],
                'issuer' => $tax[$key]['issuer'],
                'issuer_label' => self::ISSUER_LABELS[$tax[$key]['issuer']] ?? $tax[$key]['issuer'],
            ];
        }

        return Inertia::render('admin/finance/tax-status', [
            'flows' => $flows,
            'vatRatePercent' => (int) config('billing.vat_rate_percent'),
            'realInvoicesEnabled' => (bool) config('billing.real_invoices_enabled'),
            'sellerVatNumber' => config('billing.invoice.seller_vat_number'),
            'sellerName' => config('billing.invoice.seller_name'),
        ]);
    }
}
