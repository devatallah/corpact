<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Settlement;
use App\Services\Admin\BusinessService;
use App\Services\Admin\CompanyService;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private CompanyService $companyService,
        private BusinessService $businessService,
    ) {}

    /**
     * Show the admin dashboard with aggregated statistics.
     */
    public function index(): Response
    {
        $companyStats = $this->companyService->dashboardStats();
        $businessStats = $this->businessService->dashboardStats();

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();

        $companiesThisMonth = Company::where('created_at', '>=', $startOfMonth)->count();
        $businesssThisMonth = Business::where('created_at', '>=', $startOfMonth)->count();
        $employeesThisMonth = Employee::where('created_at', '>=', $startOfMonth)->count();

        $totalEmployees = Employee::count();

        $monthlyRevenue = Settlement::whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->sum('commission_amount');

        $lastMonthRevenue = Settlement::whereYear('created_at', $now->copy()->subMonth()->year)
            ->whereMonth('created_at', $now->copy()->subMonth()->month)
            ->sum('commission_amount');

        $revenueGrowth = $lastMonthRevenue > 0
            ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100)
            : 0;

        $pendingCompanies = Company::whereIn('status', ['pending', 'review'])->count();
        $pendingbusinesss = Business::whereIn('status', ['pending'])->count();
        $pendingRequests = $pendingCompanies + $pendingbusinesss;

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
                Business::whereIn('status', ['pending'])
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(fn (Business $c) => (object) [
                        'name' => $c->name,
                        'type' => 'business',
                        'type_label' => 'نادي',
                        'status' => $c->status,
                        'created_at' => $c->created_at,
                    ])
            )
            ->sortByDesc('created_at')
            ->take(5)
            ->values();

        $topCompanies = Company::active()
            ->withCount(['employees', 'events'])
            ->with(['settlements' => fn ($q) => $q->selectRaw('company_id, SUM(gross_amount) as total_spend')->groupBy('company_id')])
            ->orderByDesc('employee_count')
            ->limit(5)
            ->get();

        $last6Months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);
            $total = Settlement::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('commission_amount');
            $last6Months->push((object) [
                'month' => $date->translatedFormat('F'),
                'total' => (float) $total,
            ]);
        }

        $maxRevenue = $last6Months->max('total') ?: 1;

        return Inertia::render('admin/dash', [
            'companyStats' => $companyStats,
            'businessStats' => $businessStats,
            'totalEmployees' => $totalEmployees,
            'companiesThisMonth' => $companiesThisMonth,
            'businesssThisMonth' => $businesssThisMonth,
            'employeesThisMonth' => $employeesThisMonth,
            'monthlyRevenue' => $monthlyRevenue,
            'revenueGrowth' => $revenueGrowth,
            'pendingRequests' => $pendingRequests,
            'pendingCompanies' => $pendingCompanies,
            'pendingbusinesss' => $pendingbusinesss,
            'recentRequests' => $recentRequests,
            'topCompanies' => $topCompanies,
            'last6Months' => $last6Months,
            'maxRevenue' => $maxRevenue,
        ]);
    }
}
