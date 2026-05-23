<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Services\Company\CompanyDashboardService;
use App\Services\Employee\LeaderboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private CompanyDashboardService $dashboardService,
        private LeaderboardService $leaderboardService,
    ) {}

    /**
     * Show the company dashboard with statistics, community participation, and recent activity.
     */
    public function index(): Response
    {
        $company = auth('company')->user();
        $unreadNotifications = \App\Models\Notification::where('notifiable_type', \App\Models\Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        return Inertia::render('company/dash', [
            'company' => $company,
            'stats' => $this->dashboardService->stats($company),
            'communityParticipation' => $this->dashboardService->communityParticipationRates($company),
            'recentActivity' => $this->dashboardService->recentActivity($company),
            'unreadNotifications' => $unreadNotifications,
            'leaderboard' => $this->leaderboardService->getForCompany($company->id),
        ]);
    }
}
