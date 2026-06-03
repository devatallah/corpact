<?php

namespace App\Services\Business;

use App\Models\Business;
use App\Models\Settlement;
use Illuminate\Pagination\LengthAwarePaginator;

class BusinessSettlementService
{
    /**
     * List settlements for a specific business.
     *
     * @param  array{status?: string, per_page?: int}  $filters
     */
    public function listForbusiness(Business $business, array $filters = []): LengthAwarePaginator
    {
        return Settlement::query()
            ->with('company')
            ->where('business_id', $business->id)
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['search']), fn ($query) => $query->whereHas('company', fn ($q) => $q->where('name', 'like', "%{$filters['search']}%")))
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Get settlement totals for a business (received vs pending).
     *
     * @return array{received: float, pending: float, processing: float, total_gross: float, total_commission: float, total_net: float}
     */
    public function totals(Business $business): array
    {
        $amounts = Settlement::query()
            ->where('business_id', $business->id)
            ->selectRaw('status, SUM(net_amount) as total_net, SUM(gross_amount) as total_gross, SUM(commission_amount) as total_commission')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $allGross = Settlement::query()->where('business_id', $business->id)->sum('gross_amount');
        $allCommission = Settlement::query()->where('business_id', $business->id)->sum('commission_amount');
        $allNet = Settlement::query()->where('business_id', $business->id)->sum('net_amount');

        return [
            'received' => (float) ($amounts->get('paid')?->total_net ?? 0),
            'pending' => (float) ($amounts->get('pending')?->total_net ?? 0),
            'processing' => (float) ($amounts->get('processing')?->total_net ?? 0),
            'total_gross' => (float) $allGross,
            'total_commission' => (float) $allCommission,
            'total_net' => (float) $allNet,
        ];
    }
}
