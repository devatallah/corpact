<?php

namespace App\Services\Club;

use App\Models\Club;
use App\Models\Event;
use Illuminate\Support\Carbon;

class ClubDashboardService
{
    /**
     * Get dashboard stats for a specific club.
     *
     * @return array{pending_requests: int, monthly_bookings: int, monthly_revenue: float, partner_companies: int}
     */
    public function stats(Club $club): array
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $pendingRequests = Event::query()
            ->where('club_id', $club->id)
            ->where('status', 'waiting_club')
            ->count();

        $monthlyBookings = Event::query()
            ->where('club_id', $club->id)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereIn('status', ['confirmed', 'completed'])
            ->count();

        $monthlyRevenue = Event::query()
            ->where('club_id', $club->id)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_amount');

        $partnerCompanies = Event::query()
            ->where('club_id', $club->id)
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
