<?php

namespace App\Services\Employee;

use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EmployeeStatsService
{
    /**
     * Get activity stats for an employee.
     *
     * @return array{streak: int, total_events: int, events_this_month: int, top_sport: string|null}
     */
    public function getStats(Employee $employee): array
    {
        return [
            'streak' => $this->calculateStreak($employee),
            'total_events' => $this->totalEvents($employee),
            'events_this_month' => $this->eventsThisMonth($employee),
            'top_sport' => $this->topSport($employee),
        ];
    }

    /**
     * Calculate the consecutive-week streak for the employee.
     * A week counts if the employee participated in at least 1 event (status=joined, event confirmed/completed).
     */
    private function calculateStreak(Employee $employee): int
    {
        // Get all event dates where employee participated
        $eventDates = $employee->events()
            ->wherePivot('status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->pluck('events.event_date')
            ->map(fn ($date) => Carbon::parse($date))
            ->sort()
            ->values();

        if ($eventDates->isEmpty()) {
            return 0;
        }

        // Get unique week identifiers (year + week number) for participated events
        $participatedWeeks = $eventDates
            ->map(fn (Carbon $date) => $date->startOfWeek(Carbon::SATURDAY)->format('Y-m-d'))
            ->unique()
            ->sort()
            ->values()
            ->toArray();

        if (empty($participatedWeeks)) {
            return 0;
        }

        // Start from the current week and go backwards
        $currentWeekStart = Carbon::now()->startOfWeek(Carbon::SATURDAY)->format('Y-m-d');

        // If the current week or last week isn't in the list, streak is 0
        $lastWeekStart = Carbon::now()->subWeek()->startOfWeek(Carbon::SATURDAY)->format('Y-m-d');

        if (!in_array($currentWeekStart, $participatedWeeks) && !in_array($lastWeekStart, $participatedWeeks)) {
            return 0;
        }

        // Determine starting point: current week if participated, otherwise last week
        $startFrom = in_array($currentWeekStart, $participatedWeeks) ? $currentWeekStart : $lastWeekStart;

        $streak = 0;
        $checkWeek = Carbon::parse($startFrom);

        while (in_array($checkWeek->format('Y-m-d'), $participatedWeeks)) {
            $streak++;
            $checkWeek = $checkWeek->subWeek();
        }

        return $streak;
    }

    /**
     * Total events the employee has participated in.
     */
    private function totalEvents(Employee $employee): int
    {
        return $employee->events()
            ->wherePivot('status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->count();
    }

    /**
     * Events participated in this month.
     */
    private function eventsThisMonth(Employee $employee): int
    {
        return $employee->events()
            ->wherePivot('status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->whereMonth('events.event_date', now()->month)
            ->whereYear('events.event_date', now()->year)
            ->count();
    }

    /**
     * Get the most played sport name.
     */
    private function topSport(Employee $employee): ?string
    {
        $topSport = $employee->events()
            ->wherePivot('status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->join('sports', 'events.sport_id', '=', 'sports.id')
            ->select('sports.name', DB::raw('COUNT(*) as count'))
            ->groupBy('sports.name')
            ->orderByDesc('count')
            ->first();

        return $topSport?->name;
    }
}
