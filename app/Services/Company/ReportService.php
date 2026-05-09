<?php

namespace App\Services\Company;

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\WalletTransaction;

class ReportService
{
    /**
     * Get overall participation rate for the company.
     *
     * @return array{total_employees: int, participating_employees: int, rate: float}
     */
    public function participationRate(Company $company): array
    {
        $totalEmployees = Employee::query()
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->count();

        $participatingEmployees = Employee::query()
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->whereHas('communities', fn ($query) => $query->where('company_id', $company->id))
            ->count();

        return [
            'total_employees' => $totalEmployees,
            'participating_employees' => $participatingEmployees,
            'rate' => $totalEmployees > 0
                ? round(($participatingEmployees / $totalEmployees) * 100, 2)
                : 0,
        ];
    }

    /**
     * Get the most active community based on completed events count.
     *
     * @return array{community_id: int, community_name: string, event_count: int}|null
     */
    public function mostActiveCommunity(Company $company): ?array
    {
        $community = Community::query()
            ->where('company_id', $company->id)
            ->withCount(['events' => fn ($query) => $query->where('status', 'completed')])
            ->orderByDesc('events_count')
            ->first();

        if (! $community || $community->events_count === 0) {
            return null;
        }

        return [
            'community_id' => $community->id,
            'community_name' => $community->name,
            'event_count' => $community->events_count,
        ];
    }

    /**
     * Get budget utilization statistics.
     *
     * @return array{total_credited: float, total_distributed: float, total_spent_on_events: float, utilization_rate: float}
     */
    public function budgetUtilization(Company $company): array
    {
        $wallet = $company->wallet;

        if (! $wallet) {
            return [
                'total_credited' => 0,
                'total_distributed' => 0,
                'total_spent_on_events' => 0,
                'utilization_rate' => 0,
            ];
        }

        $totalCredited = WalletTransaction::query()
            ->where('wallet_id', $wallet->id)
            ->where('type', 'credit')
            ->sum('amount');

        $totalDistributed = WalletTransaction::query()
            ->where('wallet_id', $wallet->id)
            ->where('type', 'debit')
            ->whereNotNull('community_id')
            ->sum('amount');

        $totalSpentOnEvents = WalletTransaction::query()
            ->where('wallet_id', $wallet->id)
            ->where('type', 'debit')
            ->whereNotNull('event_id')
            ->sum('amount');

        return [
            'total_credited' => (float) $totalCredited,
            'total_distributed' => (float) $totalDistributed,
            'total_spent_on_events' => (float) $totalSpentOnEvents,
            'utilization_rate' => $totalCredited > 0
                ? round((($totalDistributed + $totalSpentOnEvents) / $totalCredited) * 100, 2)
                : 0,
        ];
    }
}
