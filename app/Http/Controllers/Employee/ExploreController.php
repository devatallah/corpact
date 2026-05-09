<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Services\Employee\ExploreService;
use Inertia\Inertia;
use Inertia\Response;

class ExploreController extends Controller
{
    public function __construct(
        private ExploreService $exploreService,
    ) {}

    /**
     * List available communities and clubs to explore.
     */
    public function index(): Response
    {
        $employee = auth('employee')->user();

        return Inertia::render('employee/explore/index', [
            'communities' => $this->exploreService->availableCommunities($employee),
        ]);
    }

    /**
     * Show details for a specific club.
     */
    public function show(Club $club): Response
    {
        return Inertia::render('employee/explore/show', [
            'club' => $club->load(['courts', 'sports']),
        ]);
    }
}
