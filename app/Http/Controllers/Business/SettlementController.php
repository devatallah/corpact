<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\IndexSettlementRequest;
use App\Models\Settlement;
use App\Services\Business\BusinessSettlementService;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SettlementController extends Controller
{
    public function __construct(
        private BusinessSettlementService $settlementService,
    ) {}

    /**
     * List settlements for the authenticated business.
     */
    public function index(IndexSettlementRequest $request): Response
    {
        $business = auth('business')->user();
        $filters = $request->validated();

        return Inertia::render('business/settlements/index', [
            'business' => $business,
            'settlements' => $this->settlementService->listForbusiness($business, $filters),
            'totals' => $this->settlementService->totals($business),
            'filters' => $filters,
        ]);
    }

    /**
     * Show details for a specific settlement.
     */
    public function show(Settlement $settlement): Response
    {
        Gate::authorize('view', $settlement);

        return Inertia::render('business/settlements/show', [
            'settlement' => $settlement,
        ]);
    }
}
