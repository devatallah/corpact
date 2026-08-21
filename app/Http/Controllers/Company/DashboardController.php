<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Notification;
use App\Services\Company\CompanyDashboardService;
use App\Services\Competition\BoardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private CompanyDashboardService $dashboardService,
        private BoardService $boardService,
    ) {}

    /**
     * لوحة الشركة (H §18): التفعيل أولاً، ثم المجتمعات النشطة والخاملة،
     * والمشاركة حسب الإدارة، والإنفاق.
     */
    public function index(): Response
    {
        $company = auth('company')->user();
        $unreadNotifications = Notification::where('notifiable_type', Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        return Inertia::render('company/dash', [
            'company' => $company,
            'stats' => $this->dashboardService->stats($company),
            'communityActivity' => $this->dashboardService->communityActivity($company),
            'departmentParticipation' => $this->dashboardService->departmentParticipation($company),
            'recentActivity' => $this->dashboardService->recentActivity($company),
            'unreadNotifications' => $unreadNotifications,
            'leaderboard' => $this->boardService->companyOverview($company->id),
        ]);
    }
}
