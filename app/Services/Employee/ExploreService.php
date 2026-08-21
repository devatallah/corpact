<?php

namespace App\Services\Employee;

use App\Models\Community;
use App\Models\Employee;
use App\Services\Community\MembershipService;
use Illuminate\Database\Eloquent\Collection;

class ExploreService
{
    public function __construct(private MembershipService $membership) {}

    /**
     * List available communities that the employee can join within their company.
     */
    public function availableCommunities(Employee $employee): Collection
    {
        $communities = Community::query()
            ->with(['category'])
            ->where('company_id', $employee->company_id)
            ->withCount('members')
            ->orderBy('name')
            ->get();

        Community::attachPrimaryLeaders($communities);

        $memberCommunityIds = $employee->communities()->pluck('communities.id')->all();

        return $communities->each(function (Community $community) use ($memberCommunityIds) {
            $community->setAttribute('is_member', in_array($community->id, $memberCommunityIds, true));
        });
    }

    /**
     * Join (or rejoin) a community — membership states, never row churn.
     */
    public function joinCommunity(Employee $employee, Community $community): void
    {
        $this->membership->join($employee, $community);
    }

    /**
     * Leave a community — the membership row flips to `left`, it is never
     * deleted (H §6).
     */
    public function leaveCommunity(Employee $employee, Community $community): void
    {
        $this->membership->leave($employee, $community);
    }
}
