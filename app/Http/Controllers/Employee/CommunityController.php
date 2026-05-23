<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\PostAnnouncementRequest;
use App\Models\Community;
use App\Models\CommunityPoll;
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
    ) {}

    /**
     * List communities the employee belongs to.
     */
    public function index(): Response
    {
        $employee = auth('employee')->user();

        $communities = $employee->communities()
            ->with(['sport', 'leader'])
            ->withCount(['members', 'events' => function ($query) {
                $query->whereIn('status', ['open', 'full', 'confirmed']);
            }])
            ->get();

        return Inertia::render('employee/community/index', [
            'communities' => $communities,
        ]);
    }

    /**
     * Show community details.
     */
    public function show(Community $community): Response
    {
        $employee = auth('employee')->user();

        $community = $this->communityDetailService->getDetail($community);
        $events = $this->communityDetailService->events($community);
        $announcements = $this->communityDetailService->announcements($community);
        $members = $this->communityDetailService->members($community);
        $polls = $this->communityDetailService->polls($community, $employee);

        $isCaptain = $community->leader_id === $employee->id
            || $community->members()->where('employee_id', $employee->id)->wherePivot('role', 'captain')->exists();

        $isLeader = $community->leader_id === $employee->id;

        $leagues = $community->leagues()
            ->with('departments')
            ->withCount('matches')
            ->latest()
            ->get();

        return Inertia::render('employee/community/show', [
            'community' => $community,
            'events' => $events,
            'announcements' => $announcements,
            'members' => $members,
            'leagues' => $leagues,
            'polls' => $polls,
            'canAnnounce' => $isCaptain,
            'isLeader' => $isLeader,
        ]);
    }

    /**
     * Join a community.
     */
    public function join(Community $community): RedirectResponse
    {
        $employee = auth('employee')->user();

        $this->exploreService->joinCommunity($employee, $community);

        return back()->with('success', 'تم الانضمام للمجتمع.');
    }

    /**
     * Leave a community.
     */
    public function leave(Community $community): RedirectResponse
    {
        $employee = auth('employee')->user();

        $this->exploreService->leaveCommunity($employee, $community);

        return back()->with('success', 'تم مغادرة المجتمع.');
    }

    /**
     * Post an announcement (AJAX).
     */
    public function postAnnouncement(PostAnnouncementRequest $request, Community $community): RedirectResponse
    {
        $employee = auth('employee')->user();

        $data = $request->validated();

        $this->communityDetailService->postAnnouncement($community, $employee, $data['body']);

        return back()->with('success', 'تم نشر الإعلان.');
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
