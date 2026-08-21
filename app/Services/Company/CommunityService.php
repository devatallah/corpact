<?php

namespace App\Services\Company;

use App\Enums\EventStatus;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Wallet;
use App\Services\ActivityLogService;
use App\Services\Community\LeadershipService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CommunityService
{
    public function __construct(private LeadershipService $leadership) {}

    /**
     * List all communities for a company, with the primary leader attached
     * as a `leader` {id, name} attribute (resolved from role_assignments).
     */
    public function listForCompany(Company $company): Collection
    {
        $communities = Community::query()
            ->with(['category'])
            ->where('company_id', $company->id)
            ->withCount('members')
            ->orderBy('name')
            ->get();

        Community::attachPrimaryLeaders($communities);

        return $communities;
    }

    /**
     * Create a new community for a company. Leadership is granted through
     * role_assignments (H §6) — `leader_id` here is only the request input
     * naming the first (primary) leader.
     *
     * @param  array{name: string, category_id: int, leader_id: int, description?: string}  $data
     */
    public function create(Company $company, array $data): Community
    {
        $leader = Employee::query()
            ->where('id', $data['leader_id'])
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->first();

        if (! $leader) {
            throw ValidationException::withMessages([
                'leader_id' => ['The selected leader must be an active employee of the company.'],
            ]);
        }

        return DB::transaction(function () use ($company, $data, $leader) {
            $community = Community::create([
                'company_id' => $company->id,
                'category_id' => $data['category_id'],
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'member_count' => 0,
            ]);

            $this->leadership->assignLeader($community, $leader, asPrimary: true);

            ActivityLogService::log(
                $company->id,
                $community,
                'community_created',
                "تم إنشاء مجتمع '{$community->name}'",
            );

            $community = $community->fresh(['category']);
            Community::attachPrimaryLeaders([$community]);

            return $community;
        });
    }

    /**
     * Transfer the primary leadership of a community (manual — AM action).
     */
    public function changeLeader(Company $company, Community $community, Employee $newLeader): Community
    {
        if ($community->company_id !== $company->id) {
            // Cross-company probe → 404, never 403 (H §4) — audited centrally.
            throw (new ModelNotFoundException)
                ->setModel(Community::class, [$community->id]);
        }

        if ($newLeader->company_id !== $company->id || $newLeader->status !== 'active') {
            throw ValidationException::withMessages([
                'leader_id' => ['The new leader must be an active employee of the company.'],
            ]);
        }

        $this->leadership->transferPrimary($community, $newLeader);

        $community = $community->fresh(['category']);
        Community::attachPrimaryLeaders([$community]);

        return $community;
    }

    /**
     * Get statistics for a specific community.
     *
     * @return array{member_count: int, total_events: int, completed_events: int, balance: float, upcoming_events: int}
     */
    public function communityStats(Community $community): array
    {
        $totalEvents = $community->events()->count();
        $completedEvents = $community->events()->where('status', 'completed')->count();
        $upcomingEvents = $community->events()
            ->whereIn('status', EventStatus::activeValues())
            ->where('event_date', '>=', now())
            ->count();

        return [
            'member_count' => $community->member_count,
            'total_events' => $totalEvents,
            'completed_events' => $completedEvents,
            'upcoming_events' => $upcomingEvents,
            // A6 ledger model: balance is read through the sub-wallet only.
            'balance' => Wallet::subFor($community)->balance,
        ];
    }
}
