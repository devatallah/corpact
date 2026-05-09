<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Settlement;
use App\Services\Admin\RevenueService;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class RevenueController extends Controller
{
    public function __construct(
        private RevenueService $revenueService,
    ) {}

    /**
     * Show the revenue overview with monthly statistics and per-company breakdown.
     */
    public function index(): Response
    {
        $now = Carbon::now();
        $year = $now->year;

        $monthlyRevenue = Settlement::whereYear('created_at', $year)
            ->whereMonth('created_at', $now->month)
            ->sum('commission_amount');

        $collectedVsPending = $this->revenueService->collectedVsPending();

        $lastMonthRevenue = Settlement::whereYear('created_at', $now->copy()->subMonth()->year)
            ->whereMonth('created_at', $now->copy()->subMonth()->month)
            ->sum('commission_amount');

        $revenueGrowth = $lastMonthRevenue > 0
            ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100)
            : 0;

        $perCompanyBreakdown = Settlement::query()
            ->join('companies', 'settlements.company_id', '=', 'companies.id')
            ->selectRaw('companies.name as company_name, COUNT(DISTINCT settlements.id) as events_count, SUM(settlements.gross_amount) as total_gross, SUM(settlements.commission_amount) as total_commission, settlements.status')
            ->groupBy('companies.name', 'settlements.status')
            ->orderByDesc('total_gross')
            ->get();

        return Inertia::render('admin/revenue/index', [
            'monthlyRevenue' => $monthlyRevenue,
            'collected' => $collectedVsPending['collected'],
            'pending' => $collectedVsPending['pending'],
            'revenueGrowth' => $revenueGrowth,
            'perCompanyBreakdown' => $perCompanyBreakdown,
        ]);
    }
}
