<?php

namespace App\Services\Employee;

use App\Models\Employee;
use App\Models\Event;
use Illuminate\Database\Eloquent\Collection;

class ProfileService
{
    /**
     * Get profile data for an employee.
     *
     * @return array{employee: Employee, stats: array{events_participated: int, communities_joined: int, events_created: int}}
     */
    public function profileData(Employee $employee): array
    {
        // Employee is now self-authenticating, no user relation needed

        return [
            'employee' => $employee,
            'stats' => $this->stats($employee),
        ];
    }

    /**
     * Get participation stats for an employee.
     *
     * @return array{events_participated: int, communities_joined: int, events_created: int}
     */
    public function stats(Employee $employee): array
    {
        $eventsParticipated = $employee->events()
            ->wherePivot('status', 'joined')
            ->count();

        $communitiesJoined = $employee->communities()->count();

        $eventsCreated = Event::query()
            ->where('created_by', $employee->id)
            ->count();

        return [
            'events_participated' => $eventsParticipated,
            'communities_joined' => $communitiesJoined,
            'events_created' => $eventsCreated,
        ];
    }

    /**
     * Get events the employee has participated in.
     *
     * @param  array{status?: string, per_page?: int}  $filters
     */
    public function myEvents(Employee $employee, array $filters = []): Collection
    {
        return $employee->events()
            ->with(['community', 'club', 'sport'])
            ->wherePivot('status', 'joined')
            ->when(isset($filters['status']), fn ($query) => $query->where('events.status', $filters['status']))
            ->latest('events.event_date')
            ->get();
    }

    /**
     * Get communities the employee belongs to.
     */
    public function myCommunities(Employee $employee): Collection
    {
        return $employee->communities()
            ->with(['sport', 'leader'])
            ->withCount('members')
            ->get();
    }
}
