<?php

namespace App\Http\Controllers\Employee;

use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\PostAnnouncementRequest;
use App\Models\Community;
use App\Models\CommunityAnnouncement;
use App\Models\CommunityPoll;
use App\Models\Employee;
use App\Services\Authorization\AuthorizationService;
use App\Services\Community\AnnouncementService;
use App\Services\Community\CommunityActor;
use App\Services\Community\LeadershipService;
use App\Services\Community\MembershipService;
use App\Services\Employee\CommunityDetailService;
use App\Services\Employee\ExploreService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommunityController extends Controller
{
    public function __construct(
        private CommunityDetailService $communityDetailService,
        private ExploreService $exploreService,
        private AnnouncementService $announcementService,
        private MembershipService $membershipService,
        private LeadershipService $leadershipService,
        private AuthorizationService $authorization,
    ) {}

    /**
     * List communities the employee belongs to.
     */
    public function index(): Response
    {
        $employee = auth('employee')->user();

        $communities = $employee->communities()
            ->with(['category'])
            ->withCount(['members', 'events' => function ($query) {
                $query->whereIn('status', EventStatus::activeValues());
            }])
            ->get();

        Community::attachPrimaryLeaders($communities);

        return Inertia::render('employee/community/index', [
            'communities' => $communities,
        ]);
    }

    /**
     * Show community details.
     */
    public function show(Request $request, Community $community): Response
    {
        $employee = auth('employee')->user();

        // H §18 — ترتيب قائمة الفعاليات. القيمة مفتاح من قائمة بيضاء في
        // `ListSort` لا اسم عمود؛ التحقق هنا يمنع الحشو فقط.
        $eventFilters = $request->validate([
            'sort' => ['sometimes', 'nullable', 'string', 'max:40'],
            'dir' => ['sometimes', 'nullable', 'string', 'max:4'],
        ]);

        $community = $this->communityDetailService->getDetail($community);
        $events = $this->communityDetailService->events($community, $eventFilters);
        $members = $this->communityDetailService->members($community);
        $polls = $this->communityDetailService->polls($community, $employee);

        $announcements = $this->communityDetailService->announcements($community)
            ->each(fn (CommunityAnnouncement $announcement) => $announcement->setAttribute(
                'can_modify',
                $announcement->isModifiableBy($employee),
            ));

        $isLeader = $community->isLeader($employee);
        $isPrimaryLeader = $isLeader && $community->isPrimaryLeader($employee);
        $leaderIds = $community->leaderEmployeeIds();
        $primaryLeaderId = data_get($community->getAttribute('leader'), 'id');

        $actingUser = CommunityActor::forEmployee($employee);
        $canAnnounce = $actingUser !== null
            && $this->authorization->can($actingUser, 'announcement.post', 'community', $community->id);
        $canInvite = $actingUser !== null
            && $this->authorization->can($actingUser, 'member.invite', 'community', $community->id);

        $invitableEmployees = $canInvite
            ? Employee::query()
                ->where('company_id', $community->company_id)
                ->where('status', 'active')
                ->whereNotIn('id', $members->pluck('id'))
                ->orderBy('name')
                ->get(['id', 'name'])
            : collect();

        $leagues = $community->leagues()
            ->with('departments')
            ->withCount('matches')
            ->latest()
            ->get();

        return Inertia::render('employee/community/show', [
            'community' => $community,
            'events' => $events,
            'eventsSort' => CommunityDetailService::eventsSort()->state($eventFilters['sort'] ?? null, $eventFilters['dir'] ?? null),
            'announcements' => $announcements,
            'members' => $members,
            'leagues' => $leagues,
            'polls' => $polls,
            'canAnnounce' => $canAnnounce,
            'canInvite' => $canInvite,
            'isLeader' => $isLeader,
            'isPrimaryLeader' => $isPrimaryLeader,
            'leaderIds' => $leaderIds,
            'primaryLeaderId' => $primaryLeaderId,
            'invitableEmployees' => $invitableEmployees,
        ]);
    }

    /**
     * Join (or rejoin) a community.
     */
    public function join(Community $community): RedirectResponse
    {
        $employee = auth('employee')->user();

        $this->exploreService->joinCommunity($employee, $community);

        return back()->with('success', 'تم الانضمام للمجتمع.');
    }

    /**
     * Leave a community — recorded as a state, the row is never deleted.
     */
    public function leave(Community $community): RedirectResponse
    {
        $employee = auth('employee')->user();

        $this->exploreService->leaveCommunity($employee, $community);

        return back()->with('success', 'تم مغادرة المجتمع.');
    }

    /**
     * Leader removes a member with a documented reason (H §6).
     */
    public function removeMember(Request $request, Community $community, Employee $member): RedirectResponse
    {
        $employee = auth('employee')->user();

        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ], [
            'reason.required' => 'سبب الإزالة مطلوب وموثَّق.',
        ]);

        $actingUser = CommunityActor::forEmployee($employee);
        abort_if($actingUser === null, 403);

        $this->membershipService->removeMember($community, $member, $data['reason'], $actingUser);

        return back()->with('success', 'تمت إزالة العضو.');
    }

    /**
     * Leader invites a specific employee to the community.
     */
    public function invite(Request $request, Community $community): RedirectResponse
    {
        $employee = auth('employee')->user();

        $data = $request->validate([
            'employee_id' => ['required', 'integer'],
        ]);

        $invitee = Employee::query()->findOrFail($data['employee_id']);

        $this->membershipService->invite($community, $employee, $invitee);

        return back()->with('success', 'تم إرسال الدعوة.');
    }

    /**
     * The leader personally transfers primary leadership (manual — H §6).
     */
    public function transferLeadership(Request $request, Community $community): RedirectResponse
    {
        $employee = auth('employee')->user();

        abort_unless($community->isPrimaryLeader($employee), 403, 'نقل القيادة للقائد الأساسي فقط.');

        $data = $request->validate([
            'employee_id' => ['required', 'integer'],
        ]);

        $newLeader = Employee::query()->findOrFail($data['employee_id']);

        $this->leadershipService->transferPrimary($community, $newLeader);

        return back()->with('success', 'تم نقل القيادة.');
    }

    /**
     * A leader steps down. No one is auto-promoted; the account manager is
     * alerted and the leaderless clock starts if no leader remains.
     */
    public function stepDown(Community $community): RedirectResponse
    {
        $employee = auth('employee')->user();

        abort_unless($community->isLeader($employee), 403);

        $this->leadershipService->removeLeader($community, $employee);

        return back()->with('success', 'تم التنحّي عن القيادة.');
    }

    /**
     * Post an announcement (leader/coordinator only — text + link).
     */
    public function postAnnouncement(PostAnnouncementRequest $request, Community $community): RedirectResponse
    {
        $employee = auth('employee')->user();

        $data = $request->validated();

        $this->announcementService->post($community, $employee, $data['body'], $data['link_url'] ?? null);

        return back()->with('success', 'تم نشر الإعلان.');
    }

    /**
     * Author edits an announcement within the 15-minute window.
     */
    public function updateAnnouncement(PostAnnouncementRequest $request, Community $community, CommunityAnnouncement $announcement): RedirectResponse
    {
        $employee = auth('employee')->user();

        abort_unless($announcement->community_id === $community->id, 404);

        $data = $request->validated();

        $this->announcementService->edit($announcement, $employee, $data['body'], $data['link_url'] ?? null);

        return back()->with('success', 'تم تعديل الإعلان.');
    }

    /**
     * Author deletes an announcement within the 15-minute window.
     */
    public function deleteAnnouncement(Community $community, CommunityAnnouncement $announcement): RedirectResponse
    {
        $employee = auth('employee')->user();

        abort_unless($announcement->community_id === $community->id, 404);

        $this->announcementService->delete($announcement, $employee);

        return back()->with('success', 'تم حذف الإعلان.');
    }

    /**
     * Create a poll.
     */
    public function createPoll(Request $request, Community $community): RedirectResponse
    {
        $employee = auth('employee')->user();

        $data = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'options' => ['required', 'array', 'min:2', 'max:10'],
            'options.*' => ['required', 'string', 'max:200'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ], [
            'question.required' => 'السؤال مطلوب.',
            'question.max' => 'السؤال يجب ألا يتجاوز 500 حرف.',
            'options.required' => 'الخيارات مطلوبة.',
            'options.min' => 'يجب إضافة خيارين على الأقل.',
            'options.max' => 'الحد الأقصى 10 خيارات.',
            'options.*.required' => 'نص الخيار مطلوب.',
            'options.*.max' => 'نص الخيار يجب ألا يتجاوز 200 حرف.',
            'expires_at.after' => 'تاريخ الانتهاء يجب أن يكون في المستقبل.',
        ]);

        $this->communityDetailService->createPoll(
            $community,
            $employee,
            $data['question'],
            $data['options'],
            $data['expires_at'] ?? null,
        );

        return back()->with('success', 'تم إنشاء التصويت.');
    }

    /**
     * Cast a vote on a poll.
     */
    public function votePoll(Request $request, Community $community, CommunityPoll $poll): RedirectResponse
    {
        $employee = auth('employee')->user();

        $data = $request->validate([
            'option_id' => ['required', 'integer', 'exists:poll_options,id'],
        ], [
            'option_id.required' => 'يجب اختيار خيار.',
            'option_id.exists' => 'الخيار غير صالح.',
        ]);

        $this->communityDetailService->votePoll($community, $employee, $poll, $data['option_id']);

        return back()->with('success', 'تم تسجيل تصويتك.');
    }

    /**
     * Close a poll.
     */
    public function closePoll(Community $community, CommunityPoll $poll): RedirectResponse
    {
        $employee = auth('employee')->user();

        $this->communityDetailService->closePoll($community, $employee, $poll);

        return back()->with('success', 'تم إغلاق التصويت.');
    }
}
