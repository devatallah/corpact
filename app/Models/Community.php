<?php

namespace App\Models;

use App\Enums\Role;
use App\Models\Concerns\ScopedToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Support\Collection;

/**
 * H §6: community = one company + one activity. Leadership lives ONLY in
 * `role_assignments` (community_leader on the community scope, exactly one
 * `is_primary` who bears responsibility and receives notifications) — there
 * is no `leader_id` column. Membership rows are states, never deleted.
 */
#[Fillable([
    'name',
    'description',
    'icon',
    'color',
    'company_id',
    'category_id',
    'member_count',
    'status',
    'leaderless_since',
])]
class Community extends Model
{
    use HasFactory, ScopedToCompany;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    /** خامل — 30 days without a leader; event generation stops (H §6). */
    public const STATUS_DORMANT = 'dormant';

    /**
     * `balance` كان عموداً قابلاً للكتابة يُسلسَل تلقائياً؛ بعد A6 صار accessor
     * مشتقاً من المحفظة الفرعية — يبقى في الـ appends كي لا تنكسر الواجهات.
     *
     * @var list<string>
     */
    protected $appends = ['balance'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'member_count' => 'integer',
            'leaderless_since' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Every leadership grant on this community (H §6 multi-leader model).
     *
     * @return HasMany<RoleAssignment, $this>
     */
    public function leaderAssignments(): HasMany
    {
        return $this->hasMany(RoleAssignment::class, 'scope_id')
            ->where('scope_type', RoleAssignment::SCOPE_COMMUNITY)
            ->where('role', Role::CommunityLeader->value);
    }

    /**
     * The single primary leader assignment (bears responsibility, receives
     * notifications).
     *
     * @return HasOne<RoleAssignment, $this>
     */
    public function primaryLeaderAssignment(): HasOne
    {
        return $this->hasOne(RoleAssignment::class, 'scope_id')
            ->where('scope_type', RoleAssignment::SCOPE_COMMUNITY)
            ->where('role', Role::CommunityLeader->value)
            ->where('is_primary', true);
    }

    /**
     * Employee profile rows (this company) of all current leaders.
     *
     * @return EloquentCollection<int, Employee>
     */
    public function leaderEmployees(): EloquentCollection
    {
        $userIds = $this->leaderAssignments()->pluck('user_id');

        if ($userIds->isEmpty()) {
            return new EloquentCollection;
        }

        return Employee::query()
            ->where('company_id', $this->company_id)
            ->whereIn('user_id', $userIds)
            ->get();
    }

    /**
     * The primary leader's employee row within this company, if any.
     */
    public function primaryLeader(): ?Employee
    {
        $userId = $this->primaryLeaderAssignment()->value('user_id');

        if ($userId === null) {
            return null;
        }

        return Employee::query()
            ->where('company_id', $this->company_id)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Is this employee one of the community's leaders?
     */
    public function isLeader(Employee $employee): bool
    {
        return $employee->user_id !== null
            && $employee->company_id === $this->company_id
            && $this->leaderAssignments()->where('user_id', $employee->user_id)->exists();
    }

    /**
     * Is this employee the primary leader?
     */
    public function isPrimaryLeader(Employee $employee): bool
    {
        return $employee->user_id !== null
            && $employee->company_id === $this->company_id
            && $this->primaryLeaderAssignment()->where('user_id', $employee->user_id)->exists();
    }

    /**
     * Employee ids of current leaders (for UI badges).
     *
     * @return array<int, int>
     */
    public function leaderEmployeeIds(): array
    {
        return $this->leaderEmployees()->pluck('id')->all();
    }

    /**
     * Bulk-attach a `leader` array attribute ({id, name} of the primary
     * leader) to a set of communities — keeps list pages to two queries
     * where the old code eager-loaded the dropped `leader_id` relation.
     *
     * @param  iterable<int, Community>  $communities
     */
    public static function attachPrimaryLeaders(iterable $communities): void
    {
        $communities = Collection::wrap($communities);

        if ($communities->isEmpty()) {
            return;
        }

        $assignments = RoleAssignment::query()
            ->where('role', Role::CommunityLeader->value)
            ->where('scope_type', RoleAssignment::SCOPE_COMMUNITY)
            ->whereIn('scope_id', $communities->pluck('id'))
            ->where('is_primary', true)
            ->get(['scope_id', 'user_id']);

        $employees = Employee::withoutGlobalScopes()
            ->whereIn('user_id', $assignments->pluck('user_id')->unique())
            ->get(['id', 'user_id', 'company_id', 'name']);

        foreach ($communities as $community) {
            $userId = $assignments->firstWhere('scope_id', $community->id)?->user_id;

            $leader = $userId === null ? null : $employees
                ->first(fn (Employee $e) => $e->user_id === $userId && $e->company_id === $community->company_id);

            $community->setAttribute('leader', $leader === null ? null : [
                'id' => $leader->id,
                'name' => $leader->name,
            ]);
        }
    }

    /**
     * Current (active) members only — leaving flips the pivot status, it
     * never deletes the row.
     *
     * @return BelongsToMany<Employee, $this>
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'community_member')
            ->using(CommunityMember::class)
            ->withPivot(['status', 'joined_at', 'left_at', 'status_reason'])
            ->wherePivot('status', CommunityMember::STATUS_ACTIVE);
    }

    /**
     * Full membership history (all states) — what the leaderboards and
     * reports need after people leave.
     *
     * @return HasMany<CommunityMember, $this>
     */
    public function memberships(): HasMany
    {
        return $this->hasMany(CommunityMember::class, 'community_id');
    }

    /**
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /**
     * @return HasMany<CommunityAnnouncement, $this>
     */
    public function announcements(): HasMany
    {
        return $this->hasMany(CommunityAnnouncement::class);
    }

    /**
     * @return HasMany<CommunityPoll, $this>
     */
    public function polls(): HasMany
    {
        return $this->hasMany(CommunityPoll::class);
    }

    /**
     * @return HasMany<League, $this>
     */
    public function leagues(): HasMany
    {
        return $this->hasMany(League::class);
    }

    /**
     * المحفظة الفرعية (H §12.5) — تُموَّل بتخصيص من محفظة الشركة الرئيسية؛
     * القائد يرى الرصيد ولا يموّل.
     *
     * @return MorphOne<Wallet, $this>
     */
    public function wallet(): MorphOne
    {
        return $this->morphOne(Wallet::class, 'owner');
    }

    /**
     * رصيد المحفظة الفرعية بالريال — مشتق من دفتر الحركات (عبر عمود الـ cache
     * الذي لا يُكتب إلا مع قيد الدفتر في نفس المعاملة). لا عمود رصيد قابل
     * للكتابة على المجتمع بعد الآن.
     */
    public function getBalanceAttribute(): float
    {
        return ($this->wallet?->balance_halalas ?? 0) / 100;
    }

    /**
     * @return HasMany<QuickMatch, $this>
     */
    public function quickMatches(): HasMany
    {
        return $this->hasMany(QuickMatch::class);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }
}
