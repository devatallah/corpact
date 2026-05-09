<?php

namespace App\Services\Employee;

use App\Models\Employee;
use App\Models\Event;
use Illuminate\Database\Eloquent\Collection;

class HomeService
{
    /**
     * Get all communities that the employee belongs to.
     */
    public function myCommunities(Employee $employee): Collection
    {
        return $employee->communities()
            ->with(['sport', 'leader'])
            ->withCount('members')
            ->get();
    }

    /**
     * Get upcoming events for the employee's communities.
     */
    public function upcomingEvents(Employee $employee, int $limit = 10): Collection
    {
        $communityIds = $employee->communities()->pluck('communities.id');

        return Event::query()
            ->with(['community', 'club', 'sport'])
            ->whereIn('community_id', $communityIds)
            ->whereIn('status', ['open', 'full', 'confirmed'])
            ->where('event_date', '>=', now())
            ->orderBy('event_date')
            ->orderBy('start_time')
            ->limit($limit)
            ->get();
    }
}
