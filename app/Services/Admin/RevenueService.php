<?php

namespace App\Services\Admin;

use App\Models\PlatformFeeInvoice;
use App\Models\SettlementItem;
use App\Models\SettlementStatement;
use App\Support\Money;
use Illuminate\Support\Collection;

/**
 * أرقام إيراد المنصة — مبنية على بنود التسوية وفواتير رسوم النظام بالهللة
 * (A11)، لا على الجدولين المؤرشفين العشريين.
 *
 * **حجم التداول ليس إيراداً** (H §15): `gross` قيمة النشاط التي تُحصَّل
 * نيابةً عن المزوّد (تيمات وكيل فيها)، والإيراد هو **العمولة + رسوم النظام**.
 * الحقول تعود منفصلة بأسمائها الصريحة ولا تُجمع في حقل واحد أبداً.
 */
class RevenueService
{
    /**
     * إيراد العمولة الشهري لسنة — يُنسب بشهر **اكتمال** الفعالية.
     *
     * @return Collection<int, array{month: int, commission_halalas: int, commission: string}>
     */
    public function monthlyCommission(int $year): Collection
    {
        $driver = SettlementItem::query()->getConnection()->getDriverName();
        $monthExpression = $driver === 'sqlite'
            ? "CAST(strftime('%m', computed_at) AS INTEGER)"
            : 'MONTH(computed_at)';

        return SettlementItem::query()
            ->whereYear('computed_at', $year)
            ->selectRaw("{$monthExpression} as month, SUM(commission_amount_halalas) as total")
            ->groupByRaw($monthExpression)
            ->orderByRaw($monthExpression)
            ->get()
            ->map(fn ($row) => [
                'month' => (int) $row->month,
                'commission_halalas' => (int) $row->total,
                'commission' => Money::format((int) $row->total),
            ]);
    }

    /**
     * توزيع العمولة على الشركات (مصدر النشاط) — بالهللة.
     *
     * @return Collection<int, array{company_id: int, company_name: string, commission_halalas: int, commission: string}>
     */
    public function perCompanyBreakdown(?int $year = null): Collection
    {
        return SettlementItem::query()
            ->join('companies', 'settlement_items.company_id', '=', 'companies.id')
            ->selectRaw('companies.id as company_id, companies.name as company_name, SUM(settlement_items.commission_amount_halalas) as total')
            ->when($year, fn ($query) => $query->whereYear('settlement_items.computed_at', $year))
            ->groupBy('companies.id', 'companies.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'company_id' => (int) $row->company_id,
                'company_name' => (string) $row->company_name,
                'commission_halalas' => (int) $row->total,
                'commission' => Money::format((int) $row->total),
            ]);
    }

    /**
     * إجماليات المنصة — **بطاقات منفصلة**: حجم التداول ≠ الإيراد.
     *
     * @return array<string, mixed>
     */
    public function platformTotals(?int $year = null): array
    {
        $items = SettlementItem::query()
            ->when($year, fn ($query) => $query->whereYear('computed_at', $year))
            ->selectRaw('SUM(gross_amount_halalas) as gross, SUM(commission_amount_halalas) as commission, SUM(net_amount_halalas) as net')
            ->first();

        $fees = (int) PlatformFeeInvoice::query()
            ->whereIn('status', [PlatformFeeInvoice::STATUS_ISSUED, PlatformFeeInvoice::STATUS_PAID])
            ->when($year, fn ($query) => $query->whereYear('issued_at', $year))
            ->sum('subtotal_halalas');

        $gross = (int) ($items->gross ?? 0);
        $commission = (int) ($items->commission ?? 0);
        $providerNet = (int) ($items->net ?? 0);

        return [
            // حجم التداول: قيمة النشاط المحصَّلة نيابةً عن المزوّدين — ليس إيراداً.
            'gmv_halalas' => $gross,
            'gmv' => Money::format($gross),
            'provider_net_halalas' => $providerNet,
            'provider_net' => Money::format($providerNet),
            // الإيراد: العمولة + رسوم النظام (تيمات أصيل فيهما — H §12.9).
            'commission_revenue_halalas' => $commission,
            'commission_revenue' => Money::format($commission),
            'system_fee_revenue_halalas' => $fees,
            'system_fee_revenue' => Money::format($fees),
        ];
    }

    /**
     * المصروف للمزوّدين مقابل ما لم يُصرف بعد.
     *
     * @return array<string, mixed>
     */
    public function payoutStatus(): array
    {
        $byStatus = SettlementStatement::query()
            ->selectRaw('status, SUM(net_amount_halalas) as net')
            ->groupBy('status')
            ->pluck('net', 'status');

        $paid = (int) ($byStatus[SettlementStatement::STATUS_PAID] ?? 0);
        $approved = (int) ($byStatus[SettlementStatement::STATUS_APPROVED] ?? 0);
        $draft = (int) ($byStatus[SettlementStatement::STATUS_DRAFT] ?? 0);

        return [
            'paid_halalas' => $paid,
            'paid' => Money::format($paid),
            'approved_halalas' => $approved,
            'approved' => Money::format($approved),
            'draft_halalas' => $draft,
            'draft' => Money::format($draft),
        ];
    }
}
