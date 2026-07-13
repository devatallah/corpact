<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Services\Partner\PartnerReportService;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        private PartnerReportService $reportService,
    ) {}

    public function index(): Response
    {
        $authPartner = auth('partner')->user();
        $partner = $authPartner->resolvedPartner();

        return Inertia::render('partner/reports/index', [
            'partner' => $partner,
            'overview' => $this->reportService->overview($partner),
            'monthlyRevenue' => $this->reportService->monthlyRevenue($partner),
            'topCompanies' => $this->reportService->topCompanies($partner),
            'demandHeatmap' => $this->reportService->demandHeatmap($partner),
        ]);
    }
}
