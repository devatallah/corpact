<?php

namespace App\Services\Partner;

use App\Models\Event;
use App\Models\Partner;
use Illuminate\Support\Carbon;

class PartnerDashboardService
{
    /**
     * Get dashboard stats for a specific partner.
     *
     * @return array{pending_requests: int, monthly_bookings: int, monthly_revenue: float, partner_companies: int}
     */
    public function stats(Partner $partner): array
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $pendingRequests = Event::query()
            ->where('partner_id', $partner->id)
            ->where('status', 'pending_provider')
            ->count();

        $monthlyBookings = Event::query()
            ->where('partner_id', $partner->id)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereIn('status', ['confirmed', 'completed'])
            ->count();

        // A10: العمود هللات صحيحة — القسمة على 100 للعرض فقط.
        $monthlyRevenue = ((int) Event::query()
            ->where('partner_id', $partner->id)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_amount_halalas')) / 100;

        $partnerCompanies = Event::query()
            ->where('partner_id', $partner->id)
            ->whereIn('status', ['confirmed', 'completed'])
            ->distinct('company_id')
            ->count('company_id');

        return [
            'pending_requests' => $pendingRequests,
            'monthly_bookings' => $monthlyBookings,
            'monthly_revenue' => (float) $monthlyRevenue,
            'partner_companies' => $partnerCompanies,
        ];
    }
}
