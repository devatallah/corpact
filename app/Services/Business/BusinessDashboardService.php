<?php

namespace App\Services\Business;

use App\Models\Business;
use App\Models\Event;
use Illuminate\Support\Carbon;

class BusinessDashboardService
{
    /**
     * Get dashboard stats for a specific business.
     *
     * @return array{pending_requests: int, monthly_bookings: int, monthly_revenue: float, partner_companies: int}
     */
    public function stats(Business $business): array
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $pendingRequests = Event::query()
            ->where('business_id', $business->id)
            ->where('status', 'waiting_business')
            ->count();

        $monthlyBookings = Event::query()
            ->where('business_id', $business->id)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereIn('status', ['confirmed', 'completed'])
            ->count();

        $monthlyRevenue = Event::query()
            ->where('business_id', $business->id)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_amount');

        $partnerCompanies = Event::query()
            ->where('business_id', $business->id)
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
