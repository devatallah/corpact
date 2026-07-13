<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\IndexSettlementRequest;
use App\Models\Settlement;
use App\Services\Partner\PartnerSettlementService;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SettlementController extends Controller
{
    public function __construct(
        private PartnerSettlementService $settlementService,
    ) {}

    /**
     * List settlements for the authenticated partner.
     */
    public function index(IndexSettlementRequest $request): Response
    {
        $partner = auth('partner')->user()->resolvedPartner();
        $filters = $request->validated();

        return Inertia::render('partner/settlements/index', [
            'partner' => $partner,
            'settlements' => $this->settlementService->listForpartner($partner, $filters),
            'totals' => $this->settlementService->totals($partner),
            'filters' => $filters,
        ]);
    }

    /**
     * Show details for a specific settlement.
     */
    public function show(Settlement $settlement): Response
    {
        Gate::authorize('view', $settlement);

        return Inertia::render('partner/settlements/show', [
            'settlement' => $settlement,
        ]);
    }
}
