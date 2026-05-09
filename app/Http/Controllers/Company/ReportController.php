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

    /**
     * Show the reports overview.
     */
    public function index(): Response
    {
        $company = auth('company')->user();
        $unreadNotifications = \App\Models\Notification::where('notifiable_type', \App\Models\Company::class)->where('notifiable_id', $company->id)->whereNull('read_at')->count();

        return Inertia::render('company/reports/index', [
            'company' => $company,
            'participation' => $this->reportService->participationRate($company),
            'mostActive' => $this->reportService->mostActiveCommunity($company),
            'budget' => $this->reportService->budgetUtilization($company),
            'unreadNotifications' => $unreadNotifications,
        ]);
    }

    /**
     * Export the report data.
     */
    public function export(): StreamedResponse
    {
        $company = auth('company')->user();
        $report = [
            'participation' => $this->reportService->participationRate($company),
            'most_active' => $this->reportService->mostActiveCommunity($company),
            'budget' => $this->reportService->budgetUtilization($company),
        ];

        return response()->streamDownload(function () use ($report) {
            echo json_encode($report, JSON_PRETTY_PRINT);
        }, 'report-'.now()->format('Y-m-d').'.json', [
            'Content-Type' => 'application/json',
        ]);
    }
}
