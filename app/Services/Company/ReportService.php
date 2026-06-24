<?php

namespace App\Services\Company;

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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

    /**
     * Get detailed employee activity statistics for the company.
     *
     * @return array{total_employees: int, participated_at_least_once: int, never_participated: int, participation_rate: float, monthly_rates: array, inactive_employees: array}
     */
    public function employeeActivity(Company $company): array
    {
        $arabicMonths = [
            1  => 'يناير',
            2  => 'فبراير',
            3  => 'مارس',
            4  => 'أبريل',
            5  => 'مايو',
            6  => 'يونيو',
            7  => 'يوليو',
            8  => 'أغسطس',
            9  => 'سبتمبر',
            10 => 'أكتوبر',
            11 => 'نوفمبر',
            12 => 'ديسمبر',
        ];

        $totalEmployees = Employee::where('company_id', $company->id)
            ->where('status', 'active')
            ->count();

        $participated = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('events.company_id', $company->id)
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->where('event_participants.status', 'joined')
            ->distinct('event_participants.employee_id')
            ->count('event_participants.employee_id');

        $neverParticipated = $totalEmployees - $participated;
        $participationRate = $totalEmployees > 0
            ? round(($participated / $totalEmployees) * 100, 2)
            : 0;

        $monthlyRates = [];
        for ($i = 5; $i >= 0; $i--) {
            $date       = Carbon::now()->subMonths($i);
            $year       = (int) $date->format('Y');
            $month      = (int) $date->format('n');

            $monthCount = DB::table('event_participants')
                ->join('events', 'events.id', '=', 'event_participants.event_id')
                ->where('events.company_id', $company->id)
                ->whereIn('events.status', ['confirmed', 'completed'])
                ->where('event_participants.status', 'joined')
                ->whereYear('events.event_date', $year)
                ->whereMonth('events.event_date', $month)
                ->distinct('event_participants.employee_id')
                ->count('event_participants.employee_id');

            $monthlyRates[] = [
                'month' => $arabicMonths[$month],
                'count' => $monthCount,
                'rate'  => $totalEmployees > 0
                    ? round(($monthCount / $totalEmployees) * 100, 2)
                    : 0,
            ];
        }

        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $activeParticipantIds = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('events.company_id', $company->id)
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->where('event_participants.status', 'joined')
            ->where('events.event_date', '>=', $thirtyDaysAgo)
            ->pluck('event_participants.employee_id')
            ->unique()
            ->values()
            ->all();

        $inactiveEmployeesQuery = DB::table('employees')
            ->leftJoin('community_member', function ($join) {
                $join->on('community_member.employee_id', '=', 'employees.id')
                    ->whereRaw('community_member.id = (SELECT MIN(cm2.id) FROM community_member cm2 WHERE cm2.employee_id = employees.id)');
            })
            ->leftJoin('communities', 'communities.id', '=', 'community_member.community_id')
            ->where('employees.company_id', $company->id)
            ->where('employees.status', 'active')
            ->whereNotIn('employees.id', $activeParticipantIds)
            ->select([
                'employees.id',
                'employees.name',
                'employees.email',
                'employees.created_at as joined_date',
                'communities.name as community_name',
            ])
            ->limit(50)
            ->get()
            ->map(fn ($row) => (array) $row)
            ->all();

        return [
            'total_employees'          => $totalEmployees,
            'participated_at_least_once' => $participated,
            'never_participated'       => $neverParticipated,
            'participation_rate'       => $participationRate,
            'monthly_rates'            => $monthlyRates,
            'inactive_employees'       => $inactiveEmployeesQuery,
        ];
    }

    /**
     * Get budget consumption statistics broken down by community.
     *
     * @return array{total_budget: float, used: float, remaining: float, used_pct: float, breakdown: array, avg_per_employee: float}
     */
    public function budgetConsumption(Company $company): array
    {
        $wallet = $company->wallet;

        $totalBudget = $wallet
            ? (float) WalletTransaction::where('wallet_id', $wallet->id)
                ->where('type', 'credit')
                ->sum('amount')
            : 0.0;

        $used = $wallet
            ? (float) WalletTransaction::where('wallet_id', $wallet->id)
                ->where('type', 'debit')
                ->sum('amount')
            : 0.0;

        $remaining = $wallet ? (float) $wallet->balance : ($totalBudget - $used);

        $usedPct = $totalBudget > 0
            ? round(($used / $totalBudget) * 100, 2)
            : 0.0;

        $breakdown = [];
        if ($wallet) {
            $communityDebits = DB::table('wallet_transactions')
                ->join('communities', 'communities.id', '=', 'wallet_transactions.community_id')
                ->where('wallet_transactions.wallet_id', $wallet->id)
                ->where('wallet_transactions.type', 'debit')
                ->whereNotNull('wallet_transactions.community_id')
                ->groupBy('wallet_transactions.community_id', 'communities.name')
                ->select([
                    'communities.name as community_name',
                    DB::raw('SUM(wallet_transactions.amount) as amount'),
                ])
                ->get();

            foreach ($communityDebits as $row) {
                $breakdown[] = [
                    'community_name' => $row->community_name,
                    'amount'         => (float) $row->amount,
                    'pct'            => $used > 0
                        ? round(((float) $row->amount / $used) * 100, 2)
                        : 0.0,
                ];
            }
        }

        $totalActiveEmployees = Employee::where('company_id', $company->id)
            ->where('status', 'active')
            ->count();

        $avgPerEmployee = $totalActiveEmployees > 0
            ? round($used / $totalActiveEmployees, 2)
            : 0.0;

        return [
            'total_budget'     => $totalBudget,
            'used'             => $used,
            'remaining'        => $remaining,
            'used_pct'         => $usedPct,
            'breakdown'        => $breakdown,
            'avg_per_employee' => $avgPerEmployee,
        ];
    }

    /**
     * Get the most booked activity categories for the company.
     *
     * @return array<int, array{category_name: string, bookings: int, unique_participants: int, change_pct: float}>
     */
    public function mostBookedActivities(Company $company): array
    {
        $thisMonthStart = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd   = Carbon::now()->subMonth()->endOfMonth();

        $results = DB::table('events')
            ->join('categories', 'categories.id', '=', 'events.category_id')
            ->where('events.company_id', $company->id)
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->whereNotNull('events.category_id')
            ->groupBy('events.category_id', 'categories.name')
            ->select([
                'events.category_id',
                'categories.name as category_name',
                DB::raw('COUNT(events.id) as bookings'),
                DB::raw('(SELECT COUNT(DISTINCT ep.employee_id) FROM event_participants ep WHERE ep.event_id IN (SELECT e2.id FROM events e2 WHERE e2.category_id = events.category_id AND e2.company_id = ' . (int) $company->id . ' AND e2.status IN (\'confirmed\', \'completed\')) AND ep.status = \'joined\') as unique_participants'),
                DB::raw('SUM(CASE WHEN events.event_date >= \'' . $thisMonthStart->toDateString() . '\' THEN 1 ELSE 0 END) as this_month_count'),
                DB::raw('SUM(CASE WHEN events.event_date >= \'' . $lastMonthStart->toDateString() . '\' AND events.event_date <= \'' . $lastMonthEnd->toDateString() . '\' THEN 1 ELSE 0 END) as last_month_count'),
            ])
            ->orderByDesc('bookings')
            ->limit(10)
            ->get();

        return $results->map(function ($row) {
            $thisMonth = (int) $row->this_month_count;
            $lastMonth = (int) $row->last_month_count;

            $changePct = $lastMonth > 0
                ? round((($thisMonth - $lastMonth) / $lastMonth) * 100, 2)
                : ($thisMonth > 0 ? 100.0 : 0.0);

            return [
                'category_name'      => $row->category_name,
                'bookings'           => (int) $row->bookings,
                'unique_participants' => (int) $row->unique_participants,
                'change_pct'         => $changePct,
            ];
        })->all();
    }

    /**
     * Get a report for each community belonging to the company.
     *
     * @return array<int, array{community_name: string, icon: string|null, members: int, events_this_month: int, attendance_rate: float, leader_name: string|null, last_event_date: string|null, status: string}>
     */
    public function communitiesReport(Company $company): array
    {
        $monthStart = Carbon::now()->startOfMonth()->toDateString();
        $monthEnd   = Carbon::now()->endOfMonth()->toDateString();

        $communities = DB::table('communities')
            ->leftJoin('employees as leaders', 'leaders.id', '=', 'communities.leader_id')
            ->where('communities.company_id', $company->id)
            ->select([
                'communities.id',
                'communities.name as community_name',
                'communities.icon',
                'leaders.name as leader_name',
            ])
            ->get();

        $report = [];

        foreach ($communities as $community) {
            $memberCount = DB::table('community_member')
                ->where('community_id', $community->id)
                ->count();

            $eventsThisMonth = DB::table('events')
                ->where('community_id', $community->id)
                ->whereBetween('event_date', [$monthStart, $monthEnd])
                ->count();

            $attendanceRate = DB::table('events')
                ->where('community_id', $community->id)
                ->whereIn('status', ['confirmed', 'completed'])
                ->whereRaw('capacity > 0')
                ->avg(DB::raw('(participants_count / NULLIF(capacity, 0)) * 100'));

            $lastEventDate = DB::table('events')
                ->where('community_id', $community->id)
                ->max('event_date');

            if ($eventsThisMonth >= 4) {
                $status = 'active';
            } elseif ($eventsThisMonth >= 1) {
                $status = 'moderate';
            } else {
                $status = 'inactive';
            }

            $report[] = [
                'community_name'   => $community->community_name,
                'icon'             => $community->icon,
                'members'          => $memberCount,
                'events_this_month' => $eventsThisMonth,
                'attendance_rate'  => $attendanceRate !== null ? round((float) $attendanceRate, 2) : 0.0,
                'leader_name'      => $community->leader_name,
                'last_event_date'  => $lastEventDate,
                'status'           => $status,
            ];
        }

        return $report;
    }

    /**
     * Get employees who have had no event participation in the last 30 days.
     *
     * @return array<int, array{id: int, name: string, email: string, joined_date: string, community_name: string|null, last_event_date: string|null}>
     */
    public function inactiveEmployees(Company $company): array
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30)->toDateString();

        $rows = DB::table('employees')
            ->leftJoin(
                DB::raw('(SELECT ep.employee_id, MAX(e.event_date) as last_event_date
                          FROM event_participants ep
                          JOIN events e ON e.id = ep.event_id
                          WHERE e.company_id = ' . (int) $company->id . '
                            AND e.status IN (\'confirmed\', \'completed\')
                            AND ep.status = \'joined\'
                          GROUP BY ep.employee_id) as last_events'),
                'last_events.employee_id',
                '=',
                'employees.id'
            )
            ->leftJoin(
                DB::raw('(SELECT cm.employee_id, c.name as community_name
                          FROM community_member cm
                          JOIN communities c ON c.id = cm.community_id
                          WHERE cm.id = (SELECT MIN(cm2.id) FROM community_member cm2 WHERE cm2.employee_id = cm.employee_id)
                         ) as first_community'),
                'first_community.employee_id',
                '=',
                'employees.id'
            )
            ->where('employees.company_id', $company->id)
            ->where('employees.status', 'active')
            ->where(function ($q) use ($thirtyDaysAgo) {
                $q->whereNull('last_events.last_event_date')
                    ->orWhere('last_events.last_event_date', '<', $thirtyDaysAgo);
            })
            ->select([
                'employees.id',
                'employees.name',
                'employees.email',
                'employees.created_at as joined_date',
                'first_community.community_name',
                'last_events.last_event_date',
            ])
            ->orderByRaw('last_events.last_event_date ASC NULLS FIRST')
            ->limit(100)
            ->get()
            ->map(fn ($row) => (array) $row)
            ->all();

        return $rows;
    }
}
