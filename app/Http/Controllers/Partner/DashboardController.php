<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Services\Partner\PartnerDashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private PartnerDashboardService $dashboardService,
    ) {}

    /**
     * Show the partner dashboard with statistics.
     */
    public function index(): Response
    {
        $authPartner = auth('partner')->user();
        $partner = $authPartner->resolvedPartner();

        $pendingEvents = $partner->events()
            ->with(['company', 'category'])
            ->where('status', 'pending_provider')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('partner/dash', [
            'partner' => $partner,
            'stats' => $this->dashboardService->stats($partner),
            'pendingEvents' => $pendingEvents,
        ]);
    }
}
