<?php

namespace App\Http\Controllers\Club;

use App\Http\Controllers\Controller;
use App\Http\Requests\Club\IndexSettlementRequest;
use App\Models\Settlement;
use App\Services\Club\ClubSettlementService;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SettlementController extends Controller
{
    public function __construct(
        private ClubSettlementService $settlementService,
    ) {}

    /**
     * List settlements for the authenticated club.
     */
    public function index(IndexSettlementRequest $request): Response
    {
        $club = auth('club')->user();
        $filters = $request->validated();

        return Inertia::render('club/settlements/index', [
            'club' => $club,
            'settlements' => $this->settlementService->listForClub($club, $filters),
            'totals' => $this->settlementService->totals($club),
            'filters' => $filters,
        ]);
    }

    /**
     * Show details for a specific settlement.
     */
    public function show(Settlement $settlement): Response
    {
        Gate::authorize('view', $settlement);

        return Inertia::render('club/settlements/show', [
            'settlement' => $settlement,
        ]);
    }
}
