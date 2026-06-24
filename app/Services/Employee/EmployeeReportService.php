<?php

namespace App\Services\Employee;

use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EmployeeReportService
{
    private static array $arabicMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

    /**
     * Get the employee's activity log (events they participated in).
     * Filterable by category name.
     */
    public function activityLog(Employee $employee, ?string $category = null): array
    {
        $query = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->join('businesses', 'businesses.id', '=', 'events.business_id')
            ->join('categories', 'categories.id', '=', 'events.category_id')
            ->where('event_participants.employee_id', $employee->id)
            ->where('event_participants.status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->select([
                'categories.name as category_name',
                'categories.name_en as category_name_en',
                'categories.icon as category_icon',
                'businesses.name as business_name',
                'events.event_date',
                'events.start_time',
                'events.duration_minutes',
                'events.participants_count',
                'events.company_subsidy',
            ])
            ->orderByDesc('events.event_date');

        if ($category !== null) {
            $query->where('categories.name', $category);
        }

        $rows = $query->get();

        return $rows->map(function ($row) {
            return [
                'activity_name'      => $row->category_name . ' — ' . $row->business_name,
                'event_date'         => $row->event_date,
                'start_time'         => $row->start_time,
                'duration_minutes'   => (int) $row->duration_minutes,
                'participants_count' => (int) $row->participants_count,
                'company_subsidy'    => (float) $row->company_subsidy,
                'category_icon'      => $row->category_icon,
                'category_name'      => $row->category_name,
                'business_name'      => $row->business_name,
            ];
        })->toArray();
    }

    /**
     * Get personal stats for the employee.
     */
    public function myStats(Employee $employee): array
    {
        // Total activities
        $totalActivities = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('event_participants.employee_id', $employee->id)
            ->where('event_participants.status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->count();

        // Total hours (sum of duration_minutes / 60)
        $totalMinutes = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('event_participants.employee_id', $employee->id)
            ->where('event_participants.status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->sum('events.duration_minutes');

        $totalHours = round($totalMinutes / 60, 1);

        // Events this month
        $eventsThisMonth = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('event_participants.employee_id', $employee->id)
            ->where('event_participants.status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->whereMonth('events.event_date', now()->month)
            ->whereYear('events.event_date', now()->year)
            ->count();

        // Favorite activity (category with most events) — use DB::table to avoid pivot issues
        $favoriteRow = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->join('categories', 'categories.id', '=', 'events.category_id')
            ->where('event_participants.employee_id', $employee->id)
            ->where('event_participants.status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->selectRaw('categories.name, categories.icon, COUNT(*) as cnt')
            ->groupBy('categories.id', 'categories.name', 'categories.icon')
            ->orderByDesc('cnt')
            ->limit(1)
            ->first();

        $favoriteActivity = $favoriteRow
            ? ['name' => $favoriteRow->name, 'icon' => $favoriteRow->icon]
            : null;

        // Unique people (distinct employees who shared at least one event with this employee)
        $employeeEventIds = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('event_participants.employee_id', $employee->id)
            ->where('event_participants.status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->pluck('event_participants.event_id');

        $uniquePeople = 0;
        if ($employeeEventIds->isNotEmpty()) {
            $uniquePeople = DB::table('event_participants')
                ->whereIn('event_id', $employeeEventIds)
                ->where('employee_id', '!=', $employee->id)
                ->where('status', 'joined')
                ->distinct('employee_id')
                ->count('employee_id');
        }

        // Longest streak (consecutive weeks with at least 1 event — week starts Saturday)
        $longestStreak = $this->calculateStreak($employee);

        // Community rank: rank within primary community by event count this month
        $communityRank = $this->communityRank($employee);

        return [
            'total_activities'  => $totalActivities,
            'total_hours'       => $totalHours,
            'events_this_month' => $eventsThisMonth,
            'favorite_activity' => $favoriteActivity,
            'unique_people'     => $uniquePeople,
            'longest_streak'    => $longestStreak,
            'community_rank'    => $communityRank,
        ];
    }

    /**
     * Get budget information for the employee.
     */
    public function budget(Employee $employee): array
    {
        $baseQuery = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->join('categories', 'categories.id', '=', 'events.category_id')
            ->where('event_participants.employee_id', $employee->id)
            ->where('event_participants.status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed']);

        // Total used (all time)
        $totalUsed = (clone $baseQuery)->sum('events.company_subsidy');

        // This month used
        $thisMonthUsed = (clone $baseQuery)
            ->whereMonth('events.event_date', now()->month)
            ->whereYear('events.event_date', now()->year)
            ->sum('events.company_subsidy');

        // Breakdown by category
        $breakdownRows = (clone $baseQuery)
            ->selectRaw('categories.name as category_name, categories.icon as category_icon, SUM(events.company_subsidy) as total')
            ->groupBy('categories.id', 'categories.name', 'categories.icon')
            ->orderByDesc('total')
            ->get();

        $breakdown = $breakdownRows->map(fn ($row) => [
            'category_name' => $row->category_name,
            'category_icon' => $row->category_icon,
            'total'         => (float) $row->total,
        ])->toArray();

        // Renewal date: first day of next month
        $renewalDate = now()->startOfMonth()->addMonth()->toDateString();

        return [
            'total_used'     => (float) $totalUsed,
            'this_month_used' => (float) $thisMonthUsed,
            'breakdown'      => $breakdown,
            'renewal_date'   => $renewalDate,
        ];
    }

    /**
     * Get distinct categories from the employee's event history (for filter buttons).
     */
    public function availableCategories(Employee $employee): array
    {
        $rows = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->join('categories', 'categories.id', '=', 'events.category_id')
            ->where('event_participants.employee_id', $employee->id)
            ->where('event_participants.status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->select('categories.name', 'categories.name_en', 'categories.icon')
            ->distinct()
            ->orderBy('categories.name')
            ->get();

        return $rows->map(fn ($row) => [
            'name'    => $row->name,
            'name_en' => $row->name_en,
            'icon'    => $row->icon,
        ])->toArray();
    }

    /**
     * Calculate the consecutive-week streak for the employee.
     * A week counts if the employee participated in at least 1 event (status=joined, event confirmed/completed).
     * Week starts on Saturday (matches EmployeeStatsService logic).
     */
    private function calculateStreak(Employee $employee): int
    {
        $eventDates = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('event_participants.employee_id', $employee->id)
            ->where('event_participants.status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->pluck('events.event_date')
            ->map(fn ($date) => Carbon::parse($date))
            ->sort()
            ->values();

        if ($eventDates->isEmpty()) {
            return 0;
        }

        $participatedWeeks = $eventDates
            ->map(fn (Carbon $date) => $date->startOfWeek(Carbon::SATURDAY)->format('Y-m-d'))
            ->unique()
            ->sort()
            ->values()
            ->toArray();

        if (empty($participatedWeeks)) {
            return 0;
        }

        $currentWeekStart = Carbon::now()->startOfWeek(Carbon::SATURDAY)->format('Y-m-d');
        $lastWeekStart    = Carbon::now()->subWeek()->startOfWeek(Carbon::SATURDAY)->format('Y-m-d');

        if (!in_array($currentWeekStart, $participatedWeeks) && !in_array($lastWeekStart, $participatedWeeks)) {
            return 0;
        }

        $startFrom = in_array($currentWeekStart, $participatedWeeks) ? $currentWeekStart : $lastWeekStart;

        $streak    = 0;
        $checkWeek = Carbon::parse($startFrom);

        while (in_array($checkWeek->format('Y-m-d'), $participatedWeeks)) {
            $streak++;
            $checkWeek = $checkWeek->subWeek();
        }

        return $streak;
    }

    /**
     * Determine the employee's rank within their primary community
     * by number of events attended this month.
     */
    private function communityRank(Employee $employee): ?int
    {
        // Find the employee's primary community (first membership)
        $membership = DB::table('community_member')
            ->where('employee_id', $employee->id)
            ->orderBy('joined_at')
            ->first();

        if (!$membership) {
            return null;
        }

        $communityId = $membership->community_id;

        // Get all members of that community
        $memberIds = DB::table('community_member')
            ->where('community_id', $communityId)
            ->pluck('employee_id');

        if ($memberIds->isEmpty()) {
            return null;
        }

        // Count this month's events per member
        $counts = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->whereIn('event_participants.employee_id', $memberIds)
            ->where('event_participants.status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->whereMonth('events.event_date', now()->month)
            ->whereYear('events.event_date', now()->year)
            ->selectRaw('event_participants.employee_id, COUNT(*) as event_count')
            ->groupBy('event_participants.employee_id')
            ->get()
            ->keyBy('employee_id');

        // Build ranking list: members not in $counts get 0
        $ranked = $memberIds->map(fn ($id) => [
            'employee_id' => $id,
            'event_count' => isset($counts[$id]) ? (int) $counts[$id]->event_count : 0,
        ])->sortByDesc('event_count')->values();

        // Find this employee's rank (1-based, ties share the same rank)
        $employeeCount = $counts[$employee->id]->event_count ?? 0;
        $rank = 1;

        foreach ($ranked as $entry) {
            if ($entry['employee_id'] == $employee->id) {
                break;
            }
            if ($entry['event_count'] > $employeeCount) {
                $rank++;
            }
        }

        return $rank;
    }
}
