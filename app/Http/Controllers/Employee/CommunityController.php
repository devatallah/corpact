<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\PostAnnouncementRequest;
use App\Models\Community;
use App\Services\Employee\CommunityDetailService;
use App\Services\Employee\ExploreService;
use Illuminate\Http\RedirectResponse;
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
}
