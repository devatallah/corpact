<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Partner;
use App\Models\SettlementItem;
use App\Services\Admin\CompanyService;
use App\Services\Admin\PartnerService;
use App\Services\Competition\GhostEventMetricService;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private CompanyService $companyService,
        private PartnerService $partnerService,
        private GhostEventMetricService $ghostEvents,
    ) {}

    /**
     * Show the admin dashboard with aggregated statistics.
     */
    public function index(): Response
    {
        $companyStats = $this->companyService->dashboardStats();
        $partnerStats = $this->partnerService->dashboardStats();

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();

        $companiesThisMonth = Company::where('created_at', '>=', $startOfMonth)->count();
        $partnersThisMonth = Partner::where('created_at', '>=', $startOfMonth)->count();
        $employeesThisMonth = Employee::where('created_at', '>=', $startOfMonth)->count();

        $totalEmployees = Employee::count();

        // A11: الإيراد = العمولة على الفعاليات المكتملة (بنود التسوية بالهللة).
        $monthlyRevenue = $this->commissionForMonth($now);
        $lastMonthRevenue = $this->commissionForMonth($now->copy()->subMonth());

        $revenueGrowth = $lastMonthRevenue > 0
            ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100)
            : 0;

        $pendingCompanies = Company::whereIn('status', ['pending', 'review'])->count();
        $pendingPartners = Partner::whereIn('status', ['pending'])->count();
        $pendingRequests = $pendingCompanies + $pendingPartners;

        $recentRequests = collect()
            ->merge(
                Company::whereIn('status', ['pending', 'review'])
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(fn (Company $c) => (object) [
                        'name' => $c->name,
                        'type' => 'company',
                        'type_label' => 'شركة',
                        'status' => $c->status,
                        'created_at' => $c->created_at,
                    ])
            )
            ->merge(
                Partner::whereIn('status', ['pending'])
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(fn (Partner $c) => (object) [
                        'name' => $c->name,
                        'type' => 'partner',
                        'type_label' => 'شريك',
                        'status' => $c->status,
                        'created_at' => $c->created_at,
                    ])
            )
            ->sortByDesc('created_at')
            ->take(5)
            ->values();

        $topCompanies = Company::active()
            ->withCount(['employees', 'events'])
            ->orderByDesc('employee_count')
            ->limit(5)
            ->get();

        $last6Months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);
            $last6Months->push((object) [
                'month' => $date->translatedFormat('F'),
                'total' => $this->commissionForMonth($date),
            ]);
        }

        $maxRevenue = $last6Months->max('total') ?: 1;

        return Inertia::render('admin/dash', [
            'companyStats' => $companyStats,
            'partnerStats' => $partnerStats,
            'totalEmployees' => $totalEmployees,
            'companiesThisMonth' => $companiesThisMonth,
            'partnersThisMonth' => $partnersThisMonth,
            'employeesThisMonth' => $employeesThisMonth,
            'monthlyRevenue' => $monthlyRevenue,
            'revenueGrowth' => $revenueGrowth,
            'pendingRequests' => $pendingRequests,
            'pendingCompanies' => $pendingCompanies,
            'pendingPartners' => $pendingPartners,
            'recentRequests' => $recentRequests,
            'topCompanies' => $topCompanies,
            'last6Months' => $last6Months,
            'maxRevenue' => $maxRevenue,
            // A12 — H §13: «يجب مراقبة معدل التعديلات بعد الاكتمال كمؤشر
            // إنذار مبكر» للفعالية الشبح. A13 يبني التقرير الكامل فوقه.
            'ghostEventWatch' => $this->ghostEvents->stats(),
        ]);
    }

    /**
     * عمولة شهر بالريال للعرض — مصدرها بنود التسوية (هللات) التي لا تُنشأ
     * إلا عند اكتمال الفعالية (H §12.7).
     */
    private function commissionForMonth(Carbon $month): float
    {
        $halalas = (int) SettlementItem::query()
            ->whereYear('computed_at', $month->year)
            ->whereMonth('computed_at', $month->month)
            ->sum('commission_amount_halalas');

        return $halalas / 100;
    }
}
