<?php

namespace App\Services\Employee;

use App\Enums\EventStatus;
use App\Models\Community;
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
        $communities = $employee->communities()
            ->with(['category'])
            ->withCount('members')
            ->get();

        Community::attachPrimaryLeaders($communities);

        return $communities;
    }

    /**
     * Get upcoming events for the employee's communities.
     */
    public function upcomingEvents(Employee $employee, int $limit = 10): Collection
    {
        $communityIds = $employee->communities()->pluck('communities.id');

        return Event::query()
            ->with(['community', 'partner', 'category'])
            ->whereIn('community_id', $communityIds)
            ->whereIn('status', EventStatus::activeValues())
            ->where('event_date', '>=', now())
            ->orderBy('event_date')
            ->orderBy('start_time')
            ->limit($limit)
            ->get();
    }
}
