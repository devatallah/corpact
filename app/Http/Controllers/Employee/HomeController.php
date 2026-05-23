<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Services\Employee\ChallengeService;
use App\Services\Employee\EmployeeStatsService;
use App\Services\Employee\HomeService;
use App\Services\Employee\LeaderboardService;
use App\Services\Employee\QuickMatchService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private HomeService $homeService,
        private EmployeeStatsService $employeeStatsService,
        private LeaderboardService $leaderboardService,
        private ChallengeService $challengeService,
        private QuickMatchService $quickMatchService,
    ) {}

    /**
     * Show the employee home page.
     */
    public function index(): Response
    {
        $employee = auth('employee')->user();

        $events = $this->homeService->upcomingEvents($employee);

        $joinedEventIds = $employee->events()
            ->whereIn('events.id', $events->pluck('id'))
            ->wherePivot('status', 'joined')
            ->pluck('events.id')
            ->all();

        return Inertia::render('employee/home', [
            'employee' => $employee,
            'communities' => $this->homeService->myCommunities($employee),
            'events' => $events,
            'joinedEventIds' => $joinedEventIds,
            'activityStats' => $this->employeeStatsService->getStats($employee),
            'challenges' => $this->challengeService->getActiveChallenges($employee),
            'leaderboard' => $this->leaderboardService->getForCompany($employee->company_id),
            'quickMatches' => $this->quickMatchService->getForEmployee($employee),
        ]);
    }
}
