<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Services\Business\BusinessDashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private BusinessDashboardService $dashboardService,
    ) {}

    /**
     * Show the business dashboard with statistics.
     */
    public function index(): Response
    {
        $business = auth('business')->user();

        $pendingEvents = $business->events()
            ->with(['company', 'category'])
            ->where('status', 'waiting_business')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('business/dash', [
            'business' => $business,
            'stats' => $this->dashboardService->stats($business),
            'pendingEvents' => $pendingEvents,
        ]);
    }
}
