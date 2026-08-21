<?php

namespace App\Services\Employee;

use App\Models\Community;
use App\Models\Employee;
use App\Services\Community\MembershipService;
use App\Support\Lists\ListSort;
use Illuminate\Pagination\LengthAwarePaginator;

class ExploreService
{
    public function __construct(private MembershipService $membership) {}

    /**
     * الأعمدة المسموح الترتيب بها — الاسم وعدد الأعضاء وتاريخ الإنشاء، وكلها
     * معروضة على بطاقة المجتمع في شاشة الاستكشاف أصلاً (H §18).
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'name' => 'name',
            'members_count' => 'members_count',
            'created_at' => 'created_at',
        ], 'name', ListSort::ASC, 'id');
    }

    /**
     * List available communities that the employee can join within their company.
     *
     * @param  array{search?: string, sort?: string, dir?: string, per_page?: int}  $filters
     */
    public function availableCommunities(Employee $employee, array $filters = []): LengthAwarePaginator
    {
        $query = Community::query()
            ->with(['category'])
            ->where('company_id', $employee->company_id)
            ->withCount('members')
            ->when(filled($filters['search'] ?? null), fn ($q) => $q->where('name', 'like', '%'.$filters['search'].'%'));

        $communities = self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();

        Community::attachPrimaryLeaders($communities->getCollection());

        $memberCommunityIds = $employee->communities()->pluck('communities.id')->all();

        $communities->getCollection()->each(function (Community $community) use ($memberCommunityIds) {
            $community->setAttribute('is_member', in_array($community->id, $memberCommunityIds, true));
        });

        return $communities;
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
