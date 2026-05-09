<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Services\Club\ClubDashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private ClubDashboardService $dashboardService,
    ) {}

    /**
     * Show the club dashboard with statistics.
     */
    public function index(): Response
    {
        $club = auth('club')->user();

        $pendingEvents = $club->events()
            ->with(['company', 'sport'])
            ->where('status', 'waiting_club')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('club/dash', [
            'club' => $club,
            'stats' => $this->dashboardService->stats($club),
            'pendingEvents' => $pendingEvents,
        ]);
    }
}
