<?php

namespace App\Services\Company;

use App\Enums\EventStatus;
use App\Enums\Role;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\RoleAssignment;
use App\Models\Wallet;
use App\Services\ActivityLogService;
use App\Services\Community\LeadershipService;
use App\Support\Lists\ListSort;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CommunityService
{
    public function __construct(private LeadershipService $leadership) {}

    /**
     * الحقول المسموح الترتيب بها في بطاقات مجتمعات الشركة — الاسم وعدد
     * الأعضاء، وكلاهما معروض على البطاقة (H §18). `members_count` اسم تجميع
     * من `withCount('members')` القائم أصلاً.
     */
    public static function sort(): ListSort
    {
        return ListSort::make([
            'name' => 'name',
            'members_count' => 'members_count',
        ], 'name', ListSort::ASC, 'id');
    }

    /**
     * List all communities for a company, with the primary leader attached
     * as a `leader` {id, name} attribute (resolved from role_assignments).
     *
     * H §18: ترقيم صفحات بعشرين عنصراً + بحث بالاسم + ترتيب.
     *
     * @param  array{search?: string, sort?: string, dir?: string, per_page?: int}  $filters
     */
    public function listForCompany(Company $company, array $filters = []): LengthAwarePaginator
    {
        $query = Community::query()
            // بطاقة المجتمع تعرض الأعضاء والفعاليات والرصيد معاً — تحميلها في
            // الاستعلام يمنع N+1 على صفحة من عشرين بطاقة.
            ->with(['category', 'wallet'])
            ->where('company_id', $company->id)
            ->withCount(['members', 'events'])
            ->when(filled($filters['search'] ?? null), fn ($inner) => $inner
                ->where('name', 'like', '%'.$filters['search'].'%'))
            // H §18 — التصفية بالفئة. بدونها يكون المُنتقي في الواجهة زرّاً
            // لا يفعل شيئاً، وهو أسوأ من غيابه.
            ->when(filled($filters['category_id'] ?? null), fn ($inner) => $inner
                ->where('category_id', $filters['category_id']));

        $communities = self::sort()
            ->apply($query, $filters['sort'] ?? null, $filters['dir'] ?? null)
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();

        Community::attachPrimaryLeaders($communities->getCollection());
        self::attachLeaderRoster($communities->getCollection());

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

    /**
     * القيادة كاملةً على كل مجتمع: الأساسي ونوّابه.
     *
     * H §6 يسمح بأكثر من قائد وواحد أساسي. عرض الأساسي وحده يخفي من يملك
     * الصلاحية فعلاً، فمسؤول الحساب يظنّ المجتمع بقيادة شخص واحد بينما
     * ينشئ فعالياته غيره.
     *
     * @param  iterable<int, Community>  $communities
     */
    public static function attachLeaderRoster(iterable $communities): void
    {
        $communities = Collection::wrap($communities);

        if ($communities->isEmpty()) {
            return;
        }

        $assignments = RoleAssignment::query()
            ->where('role', Role::CommunityLeader->value)
            ->where('scope_type', RoleAssignment::SCOPE_COMMUNITY)
            ->whereIn('scope_id', $communities->pluck('id'))
            ->get(['scope_id', 'user_id', 'is_primary']);

        $employees = Employee::withoutGlobalScopes()
            ->whereIn('user_id', $assignments->pluck('user_id')->unique())
            ->get(['id', 'user_id', 'company_id', 'name']);

        foreach ($communities as $community) {
            $rows = $assignments->where('scope_id', $community->id);

            $deputies = $rows
                ->where('is_primary', false)
                ->map(fn ($row) => $employees->first(
                    fn (Employee $e) => $e->user_id === $row->user_id && $e->company_id === $community->company_id,
                ))
                ->filter()
                ->map(fn (Employee $e) => ['id' => $e->id, 'name' => $e->name])
                ->values()
                ->all();

            $community->setAttribute('deputy_leaders', $deputies);
        }
    }
}
