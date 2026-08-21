<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\RevenueService;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * إيراد المنصة — يُقرأ من بنود التسوية وفواتير رسوم النظام بالهللة (A11).
 *
 * **حجم التداول ≠ الإيراد** (H §15): البطاقات منفصلة صراحةً ولا يُجمع
 * المبلغان في حقل واحد ولا في بطاقة واحدة.
 */
class RevenueController extends Controller
{
    public function __construct(
        private RevenueService $revenueService,
    ) {}

    public function index(): Response
    {
        $year = Carbon::now()->year;

        return Inertia::render('admin/revenue/index', [
            'year' => $year,
            'totals' => $this->revenueService->platformTotals($year),
            'monthlyCommission' => $this->revenueService->monthlyCommission($year),
            'perCompanyBreakdown' => $this->revenueService->perCompanyBreakdown($year),
            'payouts' => $this->revenueService->payoutStatus(),
        ]);
    }
}
