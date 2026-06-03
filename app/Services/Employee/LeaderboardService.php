<?php

namespace App\Services\Employee;

use App\Models\Community;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class LeaderboardService
{
    /**
     * Get leaderboard data for a given company.
     *
     * @return array{top_employees: array, top_departments: array, top_communities: array}
     */
    public function getForCompany(int $companyId): array
    {
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $endOfMonth = Carbon::now()->endOfMonth()->toDateString();

        return [
            'top_employees' => $this->topEmployees($companyId, $startOfMonth, $endOfMonth),
            'top_departments' => $this->topDepartments($companyId, $startOfMonth, $endOfMonth),
            'top_communities' => $this->topCommunities($companyId, $startOfMonth, $endOfMonth),
        ];
    }

    /**
     * Top 5 employees by event participation count this month.
     */
    private function topEmployees(int $companyId, string $startOfMonth, string $endOfMonth): array
    {
        return Employee::query()
            ->select([
                'employees.id',
                'employees.name',
                'employees.avatar',
                'departments.name as department_name',
                DB::raw('COUNT(event_participants.id) as events_count'),
            ])
            ->leftJoin('departments', 'departments.id', '=', 'employees.department_id')
            ->join('event_participants', 'event_participants.employee_id', '=', 'employees.id')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('employees.company_id', $companyId)
            ->where('employees.status', 'active')
            ->where('event_participants.status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->whereBetween('events.event_date', [$startOfMonth, $endOfMonth])
            ->groupBy('employees.id', 'employees.name', 'employees.avatar', 'departments.name')
            ->orderByDesc('events_count')
            ->limit(5)
            ->get()
            ->map(fn ($emp) => [
                'id' => $emp->id,
                'name' => $emp->name,
                'avatar' => $emp->avatar,
                'department_name' => $emp->department_name,
                'events_count' => (int) $emp->events_count,
            ])
            ->all();
    }

    /**
     * Top 5 departments by aggregate employee participation this month.
     */
    private function topDepartments(int $companyId, string $startOfMonth, string $endOfMonth): array
    {
        return Department::query()
            ->select([
                'departments.id',
                'departments.name',
                DB::raw('COUNT(event_participants.id) as events_count'),
            ])
            ->join('employees', 'employees.department_id', '=', 'departments.id')
            ->join('event_participants', 'event_participants.employee_id', '=', 'employees.id')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('departments.company_id', $companyId)
            ->where('employees.status', 'active')
            ->where('event_participants.status', 'joined')
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->whereBetween('events.event_date', [$startOfMonth, $endOfMonth])
            ->groupBy('departments.id', 'departments.name')
            ->orderByDesc('events_count')
            ->limit(5)
            ->get()
            ->map(fn ($dept) => [
                'id' => $dept->id,
                'name' => $dept->name,
                'events_count' => (int) $dept->events_count,
            ])
            ->all();
    }

    /**
     * Top 5 communities by events held this month.
     */
    private function topCommunities(int $companyId, string $startOfMonth, string $endOfMonth): array
    {
        return Community::query()
            ->select([
                'communities.id',
                'communities.name',
                'categories.name as category_name',
                'categories.icon as category_icon',
                DB::raw('COUNT(events.id) as events_count'),
            ])
            ->leftJoin('categories', 'categories.id', '=', 'communities.category_id')
            ->join('events', 'events.community_id', '=', 'communities.id')
            ->where('communities.company_id', $companyId)
            ->whereIn('events.status', ['confirmed', 'completed'])
            ->whereBetween('events.event_date', [$startOfMonth, $endOfMonth])
            ->groupBy('communities.id', 'communities.name', 'categories.name', 'categories.icon')
            ->orderByDesc('events_count')
            ->limit(5)
            ->get()
            ->map(fn ($comm) => [
                'id' => $comm->id,
                'name' => $comm->name,
                'category_name' => $comm->category_name,
                'category_icon' => $comm->category_icon,
                'events_count' => (int) $comm->events_count,
            ])
            ->all();
    }
}
