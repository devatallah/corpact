<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Services\Business\BusinessReportService;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        private BusinessReportService $reportService,
    ) {}

    public function index(): Response
    {
        $authBusiness = auth('business')->user();
        $business = $authBusiness->resolvedBusiness();

        return Inertia::render('business/reports/index', [
            'business' => $business,
            'overview' => $this->reportService->overview($business),
            'monthlyRevenue' => $this->reportService->monthlyRevenue($business),
            'topCompanies' => $this->reportService->topCompanies($business),
            'demandHeatmap' => $this->reportService->demandHeatmap($business),
        ]);
    }
}
