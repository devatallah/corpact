<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Company;
use App\Models\PermissionReview;
use App\Models\RoleAssignment;
use App\Services\Audit\AuditLogService;
use App\Support\Audit\AuditAction;
use App\Support\Identity\CurrentActor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * H §19 / G (أدمن تيمات §7): «مراجعة صلاحيات ربع سنوية **موثَّقة**».
 *
 * The screen is the documentation: every elevated assignment on one page,
 * grouped by scope, with the last review recorded and the next one due.
 * Marking a quarter reviewed writes an audit row — the record the control
 * asks for.
 */
class PermissionReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'role' => ['sometimes', 'nullable', 'string', 'max:60'],
            'scope_type' => ['sometimes', 'nullable', 'string', 'max:32'],
            'sort' => ['sometimes', 'nullable', 'string'],
        ]);

        $direction = ($filters['sort'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $assignments = RoleAssignment::query()
            ->with('user:id,name,email,status')
            ->whereIn('role', self::reviewableRoles())
            ->when(filled($filters['role'] ?? null), fn ($query) => $query->where('role', $filters['role']))
            ->when(filled($filters['scope_type'] ?? null), fn ($query) => $query->where('scope_type', $filters['scope_type']))
            ->when(filled($filters['search'] ?? null), fn ($query) => $query->whereHas('user', fn ($inner) => $inner
                ->where('name', 'like', '%'.$filters['search'].'%')
                ->orWhere('email', 'like', '%'.$filters['search'].'%')))
            ->orderBy('created_at', $direction)
            ->paginate(20)
            ->withQueryString();

        $companyNames = Company::query()->pluck('name', 'id');
        $communityNames = Community::withoutGlobalScopes()->pluck('name', 'id');

        $assignments->through(fn (RoleAssignment $assignment) => [
            'id' => $assignment->id,
            'user' => $assignment->user?->only(['id', 'name', 'email', 'status']),
            'role' => $assignment->role->value,
            'role_label' => $assignment->role->label(),
            'scope_type' => $assignment->scope_type,
            'scope_id' => $assignment->scope_id,
            'scope_label' => match ($assignment->scope_type) {
                RoleAssignment::SCOPE_PLATFORM => 'المنصة',
                RoleAssignment::SCOPE_COMPANY => $companyNames[$assignment->scope_id] ?? ('شركة #'.$assignment->scope_id),
                RoleAssignment::SCOPE_COMMUNITY => $communityNames[$assignment->scope_id] ?? ('مجتمع #'.$assignment->scope_id),
                default => $assignment->scope_type.' #'.$assignment->scope_id,
            },
            'permissions' => $assignment->role->permissions(),
            'granted_at' => $assignment->created_at?->toIso8601String(),
        ]);

        $latest = PermissionReview::query()->orderByDesc('reviewed_at')->first();

        return Inertia::render('admin/security/permission-review', [
            'assignments' => $assignments,
            'filters' => $filters,
            'roles' => collect(self::reviewableRoles())
                ->map(fn (string $role) => ['value' => $role, 'label' => Role::from($role)->label()])
                ->values()
                ->all(),
            'currentPeriod' => self::currentPeriod(),
            'lastReview' => $latest === null ? null : [
                'period' => $latest->period,
                'reviewed_at' => $latest->reviewed_at?->toIso8601String(),
                'reviewed_by' => $latest->reviewed_by_name,
                'assignments_reviewed' => $latest->assignments_reviewed,
                'notes' => $latest->notes,
            ],
            'history' => PermissionReview::query()
                ->orderByDesc('reviewed_at')
                ->limit(8)
                ->get()
                ->map(fn (PermissionReview $review) => [
                    'period' => $review->period,
                    'reviewed_at' => $review->reviewed_at?->toIso8601String(),
                    'reviewed_by' => $review->reviewed_by_name,
                    'assignments_reviewed' => $review->assignments_reviewed,
                    'notes' => $review->notes,
                ])
                ->all(),
            'stats' => [
                'total' => RoleAssignment::query()->whereIn('role', self::reviewableRoles())->count(),
                'platform' => RoleAssignment::query()
                    ->where('scope_type', RoleAssignment::SCOPE_PLATFORM)
                    ->count(),
                'reviewed_this_period' => PermissionReview::query()->where('period', self::currentPeriod())->exists(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'notes' => ['required', 'string', 'min:5', 'max:2000'],
        ], [
            'notes.required' => 'المراجعة الربع سنوية موثَّقة — اكتب خلاصة ما راجعته.',
            'notes.min' => 'اكتب خلاصة حقيقية للمراجعة.',
        ]);

        ['id' => $actorId, 'name' => $actorName] = CurrentActor::resolve();
        $period = self::currentPeriod();
        $count = RoleAssignment::query()->whereIn('role', self::reviewableRoles())->count();

        $review = PermissionReview::updateOrCreate(
            ['period' => $period],
            [
                'reviewed_by_user_id' => $actorId,
                'reviewed_by_name' => $actorName,
                'assignments_reviewed' => $count,
                'notes' => $data['notes'],
                'reviewed_at' => now(),
            ],
        );

        AuditLogService::record(
            action: AuditAction::PERMISSION_REVIEWED,
            entity: $review,
            after: ['period' => $period, 'assignments_reviewed' => $count],
            reason: $data['notes'],
        );

        return back()->with('success', "سُجِّلت مراجعة الصلاحيات للفترة {$period} ({$count} إسناداً).");
    }

    /**
     * @return string[]
     */
    private static function reviewableRoles(): array
    {
        return [
            Role::PlatformAdmin->value,
            Role::FinanceAdmin->value,
            Role::SupportAgent->value,
            Role::AccountManager->value,
            Role::Coordinator->value,
            Role::CommunityLeader->value,
        ];
    }

    public static function currentPeriod(): string
    {
        $now = now();

        return $now->year.'-Q'.(int) ceil($now->month / 3);
    }
}
