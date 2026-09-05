<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreCommunityRequest;
use App\Http\Requests\Company\UpdateCommunityRequest;
use App\Models\Category;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Notification;
use App\Services\Community\CommunityActor;
use App\Services\Community\LeadershipService;
use App\Services\Community\MembershipService;
use App\Services\Company\CommunityService;
use App\Services\Reporting\KpiDictionary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CommunityController extends Controller
{
    public function __construct(
        private CommunityService $communityService,
        private LeadershipService $leadershipService,
        private MembershipService $membershipService,
    ) {}

    /**
     * List communities for the authenticated company.
     */
    public function index(Request $request): Response
    {
        $company = auth('company')->user();
        $unreadNotifications = Notification::where('notifiable_type', Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            // H §18 — الترتيب. القيمة مفتاح من قائمة بيضاء في `ListSort`، لا
            // اسم عمود؛ التحقق هنا يمنع الحشو فقط.
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $communities = $this->communityService->listForCompany($company, $filters);

        // «خامل» ليس عموداً في الجدول — هو غياب فعالية خلال النافذة، ويعرّفه
        // قاموس المؤشرات وحده حتى لا يختلف تعريف الخمول بين شاشتين.
        $activity = app(KpiDictionary::class)->communityActivity($company, now());
        $dormantIds = collect($activity['dormant'])->pluck('id')->all();

        return Inertia::render('company/communities/index', [
            'company' => $company,
            'communities' => $communities,
            'dormantIds' => $dormantIds,
            'dormantWindowDays' => $activity['window_days'],
            'filters' => (object) $filters,
            'sort' => CommunityService::sort()->state($filters['sort'] ?? null, $filters['dir'] ?? null),
            'categories' => Category::whereNull('parent_id')->with('children:id,parent_id,name,icon')->select('id', 'parent_id', 'name', 'icon')->orderBy('name')->get(),
            'unreadNotifications' => $unreadNotifications,
        ]);
    }

    /**
     * Show the form for creating a new community.
     */
    public function create(): Response
    {
        $company = auth('company')->user();

        return Inertia::render('company/communities/create', [
            'employees' => Employee::where('company_id', $company->id)->active()->select('id', 'name')->orderBy('name')->get(),
            'categories' => Category::whereNull('parent_id')->with('children:id,parent_id,name,icon')->select('id', 'parent_id', 'name', 'icon')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a new community.
     */
    public function store(StoreCommunityRequest $request): RedirectResponse
    {
        Gate::authorize('create', Community::class);

        $company = auth('company')->user();

        $data = $request->validated();

        $this->communityService->create($company, $data);

        return redirect()->route('company.communities.index')
            ->with('success', 'تم إنشاء المجتمع بنجاح.');
    }

    /**
     * Show the form for editing the specified community.
     */
    public function edit(Community $community): Response
    {
        $company = auth('company')->user();

        $community->load('category');
        Community::attachPrimaryLeaders([$community]);

        CommunityService::attachLeaderRoster([$community]);

        return Inertia::render('company/communities/edit', [
            'community' => $community,
            // الأعضاء لم يكونوا يصلون هذه الشاشة إطلاقاً، فإزالة عضو أو حظره —
            // وهما صلاحية مسؤول الحساب وحده (H §6) — لم يكن لهما زر في أي مكان.
            'members' => $community->members()
                ->with('department:id,name')
                ->orderByPivot('joined_at', 'asc')
                ->get(['employees.id', 'employees.name', 'employees.email', 'employees.department_id'])
                ->map(fn ($member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'department' => $member->department?->only(['id', 'name']),
                    'joined_at' => $member->pivot->joined_at,
                ]),
            'employees' => Employee::where('company_id', $company->id)->active()->select('id', 'name')->orderBy('name')->get(),
            'categories' => Category::whereNull('parent_id')->with('children:id,parent_id,name,icon')->select('id', 'parent_id', 'name', 'icon')->orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified community.
     */
    public function update(UpdateCommunityRequest $request, Community $community): RedirectResponse
    {
        Gate::authorize('update', $community);

        $company = auth('company')->user();

        $data = $request->validated();

        if (isset($data['leader_id'])) {
            $newLeader = Employee::findOrFail($data['leader_id']);
            $this->communityService->changeLeader($company, $community, $newLeader);
            unset($data['leader_id']);
        }

        if (! empty($data)) {
            $community->update($data);
        }

        return back()->with('success', 'تم تحديث المجتمع بنجاح.');
    }

    /**
     * Remove the specified community.
     */
    public function destroy(Community $community): RedirectResponse
    {
        Gate::authorize('delete', $community);

        $community->delete();

        return redirect()->route('company.communities.index')
            ->with('success', 'تم حذف المجتمع بنجاح.');
    }

    /**
     * Grant leadership to an employee (multi-leader model, H §6).
     */
    public function assignLeader(Request $request, Community $community): RedirectResponse
    {
        Gate::authorize('update', $community);

        $data = $request->validate([
            'employee_id' => ['required', 'integer'],
            'is_primary' => ['sometimes', 'boolean'],
        ]);

        $employee = Employee::query()->findOrFail($data['employee_id']);

        $this->leadershipService->assignLeader($community, $employee, (bool) ($data['is_primary'] ?? false));

        return back()->with('success', 'تم تعيين القائد.');
    }

    /**
     * Revoke an employee's leadership — never auto-replaced.
     */
    public function removeLeader(Community $community, Employee $employee): RedirectResponse
    {
        Gate::authorize('update', $community);

        $this->leadershipService->removeLeader($community, $employee);

        return back()->with('success', 'تمت إزالة القيادة.');
    }

    /**
     * Designate the primary leader among current leaders.
     */
    public function setPrimaryLeader(Community $community, Employee $employee): RedirectResponse
    {
        Gate::authorize('update', $community);

        $this->leadershipService->setPrimary($community, $employee);

        return back()->with('success', 'تم تحديد القائد الأساسي.');
    }

    /**
     * AM removes a member with a documented reason.
     */
    public function removeMember(Request $request, Community $community, Employee $employee): RedirectResponse
    {
        Gate::authorize('update', $community);

        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ], [
            'reason.required' => 'سبب الإزالة مطلوب وموثَّق.',
        ]);

        $actingUser = CommunityActor::forCompany(auth('company')->user());
        abort_if($actingUser === null, 403, 'تعذر تحديد هوية مسؤول الحساب.');

        $this->membershipService->removeMember($community, $employee, $data['reason'], $actingUser);

        return back()->with('success', 'تمت إزالة العضو.');
    }

    /**
     * Ban — blocks rejoining. Account-manager-only (H §6), enforced through
     * the permission matrix.
     */
    public function banMember(Request $request, Community $community, Employee $employee): RedirectResponse
    {
        Gate::authorize('update', $community);

        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ], [
            'reason.required' => 'سبب الحظر مطلوب وموثَّق.',
        ]);

        $actingUser = CommunityActor::forCompany(auth('company')->user());
        abort_if($actingUser === null, 403, 'تعذر تحديد هوية مسؤول الحساب.');

        $this->membershipService->banMember($community, $employee, $data['reason'], $actingUser);

        return back()->with('success', 'تم حظر العضو.');
    }
}
