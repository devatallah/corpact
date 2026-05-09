<?php

namespace App\Services\Admin;

use App\Models\PlatformRevenue;
use App\Models\Settlement;
use Illuminate\Support\Collection;

class RevenueService
{
    /**
     * Get monthly revenue statistics for a given year.
     *
     * @return Collection<int, array{month: int, total: float}>
     */
    public function monthlyStats(int $year): Collection
    {
        return PlatformRevenue::query()
            ->selectRaw('MONTH(revenue_date) as month, SUM(amount) as total')
            ->whereYear('revenue_date', $year)
            ->groupByRaw('MONTH(revenue_date)')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'month' => (int) $row->month,
                'total' => (float) $row->total,
            ]);
    }

    /**
     * Get revenue breakdown per company.
     *
     * @return Collection<int, array{company_id: int, company_name: string, total: float}>
     */
    public function perCompanyBreakdown(?int $year = null): Collection
    {
        return Settlement::query()
            ->join('companies', 'settlements.company_id', '=', 'companies.id')
            ->selectRaw('companies.id as company_id, companies.name as company_name, SUM(settlements.commission_amount) as total')
            ->when($year, fn ($query) => $query->whereYear('settlements.created_at', $year))
            ->groupBy('companies.id', 'companies.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'company_id' => (int) $row->company_id,
                'company_name' => $row->company_name,
                'total' => (float) $row->total,
            ]);
    }

    /**
     * Get platform commission totals.
     *
     * @return array{total_commission: float, total_gross: float, total_net: float}
     */
    public function platformCommissionTotals(?int $year = null): array
    {
        $result = Settlement::query()
            ->when($year, fn ($query) => $query->whereYear('created_at', $year))
            ->selectRaw('SUM(gross_amount) as total_gross, SUM(commission_amount) as total_commission, SUM(net_amount) as total_net')
            ->first();

        return [
            'total_gross' => (float) ($result->total_gross ?? 0),
            'total_commission' => (float) ($result->total_commission ?? 0),
            'total_net' => (float) ($result->total_net ?? 0),
        ];
    }

    /**
     * Get collected vs pending settlement amounts.
     *
     * @return array{collected: float, pending: float, processing: float}
     */
    public function collectedVsPending(): array
    {
        $amounts = Settlement::query()
            ->selectRaw('status, SUM(net_amount) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        return [
            'collected' => (float) ($amounts['paid'] ?? 0),
            'pending' => (float) ($amounts['pending'] ?? 0),
            'processing' => (float) ($amounts['processing'] ?? 0),
        ];
    }
}
