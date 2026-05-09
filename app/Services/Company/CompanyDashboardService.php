<?php

namespace App\Services\Company;

use App\Models\ActivityLog;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class CompanyDashboardService
{
    /**
     * Get dashboard stats for the company.
     *
     * @return array{active_employees: int, communities: int, monthly_events: int, wallet_balance: float}
     */
    public function stats(Company $company): array
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $activeEmployees = Employee::query()
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->count();

        $communities = Community::query()
            ->where('company_id', $company->id)
            ->count();

        $monthlyEvents = Event::query()
            ->whereHas('community', fn ($query) => $query->where('company_id', $company->id))
            ->whereBetween('event_date', [$startOfMonth, $endOfMonth])
            ->count();

        $walletBalance = $company->wallet?->balance ?? 0;

        return [
            'active_employees' => $activeEmployees,
            'communities' => $communities,
            'monthly_events' => $monthlyEvents,
            'wallet_balance' => (float) $walletBalance,
        ];
    }

    /**
     * Get participation rates per community.
     *
     * @return Collection<int, array{community_id: int, community_name: string, member_count: int, active_participants: int, rate: float}>
     */
    public function communityParticipationRates(Company $company): Collection
    {
        $communities = Community::query()
            ->where('company_id', $company->id)
            ->withCount('members')
            ->get();

        $totalEmployees = Employee::query()
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->count();

        return $communities->map(fn (Community $community) => [
            'community_id' => $community->id,
            'community_name' => $community->name,
            'member_count' => $community->members_count,
            'total_employees' => $totalEmployees,
            'rate' => $totalEmployees > 0
                ? round(($community->members_count / $totalEmployees) * 100, 2)
                : 0,
        ]);
    }

    /**
     * Get recent activity logs for the company.
     */
    public function recentActivity(Company $company, int $limit = 10): Collection
    {
        $logs = ActivityLog::query()
            ->where('company_id', $company->id)
            ->latest()
            ->limit($limit)
            ->get();

        // Resolve community IDs in old descriptions (e.g. "المجتمع #4" → "المجتمع كرة قدم")
        $communityIds = [];
        foreach ($logs as $log) {
            if (preg_match('/المجتمع #(\d+)/', $log->description, $m)) {
                $communityIds[] = (int) $m[1];
            }
        }

        if ($communityIds) {
            $names = Community::whereIn('id', array_unique($communityIds))->pluck('name', 'id');
            foreach ($logs as $log) {
                $log->description = preg_replace_callback('/المجتمع #(\d+)/', function ($m) use ($names) {
                    return 'المجتمع ' . ($names[(int) $m[1]] ?? "#{$m[1]}");
                }, $log->description);
            }
        }

        return $logs;
    }
}
