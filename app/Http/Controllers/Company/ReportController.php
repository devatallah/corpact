<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Services\Company\ReportService;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(
        private ReportService $reportService,
    ) {}

    public function index(): Response
    {
        $company = auth('company')->user();
        $unreadNotifications = \App\Models\Notification::where('notifiable_type', \App\Models\Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        return Inertia::render('company/reports/index', [
            'company' => $company,
            'employeeActivity' => $this->reportService->employeeActivity($company),
            'budgetConsumption' => $this->reportService->budgetConsumption($company),
            'mostBookedActivities' => $this->reportService->mostBookedActivities($company),
            'communitiesReport' => $this->reportService->communitiesReport($company),
            'inactiveEmployees' => $this->reportService->inactiveEmployees($company),
            'unreadNotifications' => $unreadNotifications,
        ]);
    }

    public function export(): StreamedResponse
    {
        $company = auth('company')->user();
        $report = [
            'employee_activity' => $this->reportService->employeeActivity($company),
            'budget_consumption' => $this->reportService->budgetConsumption($company),
            'most_booked_activities' => $this->reportService->mostBookedActivities($company),
            'communities_report' => $this->reportService->communitiesReport($company),
            'inactive_employees' => $this->reportService->inactiveEmployees($company),
        ];

        return response()->streamDownload(function () use ($report) {
            echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }, 'report-'.now()->format('Y-m-d').'.json', [
            'Content-Type' => 'application/json',
        ]);
    }
}
