<?php

namespace App\Http\Controllers\Admin;

use App\Console\Commands\ReconcileBalances;
use App\Console\Commands\WatchdogScheduledJobs;
use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Employee;
use App\Models\JobRun;
use App\Models\Partner;
use App\Models\PaymentIntent;
use App\Models\SettlementItem;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\Admin\CompanyService;
use App\Services\Admin\PartnerService;
use App\Services\Authorization\AuthorizationService;
use App\Services\Competition\GhostEventMetricService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private CompanyService $companyService,
        private PartnerService $partnerService,
        private GhostEventMetricService $ghostEvents,
        private AuthorizationService $authorization,
    ) {}

    /**
     * Show the admin dashboard with aggregated statistics.
     */
    public function index(): Response
    {
        // H §4 — الصلاحية لا الدور: اللوحة نفسها ليست خلف `permission:` لأن
        // كل موظفي المنصة (ومنهم وكيل الدعم) يُحوَّلون إليها بعد الدخول، فلا
        // يجوز أن تردّهم 403 على أول شاشة. لذا **الأرقام** هي المحروسة: من لا
        // يملك `revenue.view` لا تُرسل له خصائص الإيراد أصلاً — لا تُخفى في
        // الواجهة (نفس بوابة /admin/revenue في routes/web.php).
        $user = Auth::guard('admin')->user();
        $canViewRevenue = $user !== null && $this->authorization->can($user, 'revenue.view');
        // H §20 — صحة المحرّكات التشغيلية ليست رقماً مالياً، فبوابتها الإدارة
        // لا الإيراد؛ وكيل الدعم لا يراها.
        $canMonitorOps = $user !== null && $this->authorization->can($user, 'platform.manage');

        $companyStats = $this->companyService->dashboardStats();
        $partnerStats = $this->partnerService->dashboardStats();

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();

        $companiesThisMonth = Company::where('created_at', '>=', $startOfMonth)->count();
        $partnersThisMonth = Partner::where('created_at', '>=', $startOfMonth)->count();
        $employeesThisMonth = Employee::where('created_at', '>=', $startOfMonth)->count();

        $totalEmployees = Employee::count();

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

        // اللوحة تعرض الاسم والعدّادين فقط — الإسقاط صريح كي لا تُشحن شروط
        // العقد ولا الرقم الضريبي/السجل التجاري ولا بيانات التواصل ولا
        // `activation_token` مع صف الشركة **لأي دور كان** (H §4/§19).
        $topCompanies = Company::active()
            ->select(['id', 'name'])
            ->withCount(['employees', 'events'])
            ->orderByDesc('employee_count')
            ->limit(5)
            ->get();

        $props = [
            'companyStats' => $companyStats,
            'partnerStats' => $partnerStats,
            'totalEmployees' => $totalEmployees,
            'companiesThisMonth' => $companiesThisMonth,
            'partnersThisMonth' => $partnersThisMonth,
            'employeesThisMonth' => $employeesThisMonth,
            'pendingRequests' => $pendingRequests,
            'pendingCompanies' => $pendingCompanies,
            'pendingPartners' => $pendingPartners,
            'recentRequests' => $recentRequests,
            'topCompanies' => $topCompanies,
            'canViewRevenue' => $canViewRevenue,
            // A12 — H §13: «يجب مراقبة معدل التعديلات بعد الاكتمال كمؤشر
            // إنذار مبكر» للفعالية الشبح. A13 يبني التقرير الكامل فوقه.
            'ghostEventWatch' => $this->ghostEvents->stats(),
            'canMonitorOps' => $canMonitorOps,
        ];

        if ($canMonitorOps) {
            $props['jobHealth'] = $this->jobHealth();
        }

        if (! $canViewRevenue) {
            return Inertia::render('admin/dash', $props);
        }

        // A11: الإيراد = العمولة على الفعاليات المكتملة (بنود التسوية بالهللة).
        $monthlyRevenue = $this->commissionForMonth($now);
        $lastMonthRevenue = $this->commissionForMonth($now->copy()->subMonth());

        $last6Months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = $now->copy()->subMonths($i);
            $last6Months->push((object) [
                'month' => $date->translatedFormat('F'),
                'total' => $this->commissionForMonth($date),
            ]);
        }

        return Inertia::render('admin/dash', [
            ...$props,
            'walletReconciliation' => $this->walletReconciliation(),
            'gatewayHealth' => $this->gatewayHealth(),
            'monthlyRevenue' => $monthlyRevenue,
            'revenueGrowth' => $lastMonthRevenue > 0
                ? round((($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100)
                : 0,
            'last6Months' => $last6Months,
            'maxRevenue' => $last6Months->max('total') ?: 1,
        ]);
    }

    /**
     * عمولة شهر بالريال للعرض — مصدرها بنود التسوية (هللات) التي لا تُنشأ
     * إلا عند اكتمال الفعالية (H §12.7).
     */
    /**
     * H §20 — «الصمت ليس دليل نجاح»: مهمة لم تُنفَّذ خلال ضعف دوريتها متأخرة.
     * الدوريات تُقرأ من {@see WatchdogScheduledJobs::CADENCES} نفسها حتى لا
     * يوجد جدولان يتباعدان.
     *
     * @return array{jobs: list<array{job: string, cadence_minutes: int, last_run_at: ?string, late: bool}>, late_count: int}
     */
    private function jobHealth(): array
    {
        $now = Carbon::now();
        $jobs = [];

        foreach (WatchdogScheduledJobs::CADENCES as $job => $cadenceMinutes) {
            $lastRunAt = JobRun::lastHeartbeatAt($job);
            $late = $lastRunAt === null || $lastRunAt->lt($now->copy()->subMinutes($cadenceMinutes * 2));

            $jobs[] = [
                'job' => $job,
                'cadence_minutes' => $cadenceMinutes,
                'last_run_at' => $lastRunAt?->toIso8601String(),
                'late' => $late,
            ];
        }

        return [
            'jobs' => $jobs,
            'late_count' => count(array_filter($jobs, static fn (array $job): bool => $job['late'])),
        ];
    }

    /**
     * H §12.5 — الرصيد مشتق من الدفتر لا العكس. نفس معادلة
     * {@see ReconcileBalances}: دائن ناقص مدين بالهللة،
     * مقابل الرصيد المخزَّن. المبالغ هللات صحيحة، والفارق يجب أن يكون صفراً.
     *
     * @return array{cached_halalas: int, ledger_halalas: int, difference_halalas: int, wallets: int, mismatched: int}
     */
    private function walletReconciliation(): array
    {
        $ledgerByWallet = WalletTransaction::query()
            ->withoutGlobalScopes()
            ->selectRaw("wallet_id, COALESCE(SUM(CASE WHEN direction = 'credit' THEN amount_halalas ELSE -amount_halalas END), 0) as ledger_balance")
            ->groupBy('wallet_id')
            ->pluck('ledger_balance', 'wallet_id');

        $cachedTotal = 0;
        $ledgerTotal = 0;
        $wallets = 0;
        $mismatched = 0;

        foreach (Wallet::query()->withoutGlobalScopes()->cursor() as $wallet) {
            $cached = (int) $wallet->balance_halalas;
            $ledger = (int) ($ledgerByWallet[$wallet->id] ?? 0);

            $cachedTotal += $cached;
            $ledgerTotal += $ledger;
            $wallets++;

            if ($cached !== $ledger) {
                $mismatched++;
            }
        }

        return [
            'cached_halalas' => $cachedTotal,
            'ledger_halalas' => $ledgerTotal,
            'difference_halalas' => $cachedTotal - $ledgerTotal,
            'wallets' => $wallets,
            'mismatched' => $mismatched,
        ];
    }

    private function commissionForMonth(Carbon $month): float
    {
        $halalas = (int) SettlementItem::query()
            ->whereYear('computed_at', $month->year)
            ->whereMonth('computed_at', $month->month)
            ->sum('commission_amount_halalas');

        return $halalas / 100;
    }

    /**
     * صحة بوابة الدفع خلال آخر ساعة — معدل النجاح وما انتهت مهلته.
     *
     * @return array<string, mixed>
     */
    private function gatewayHealth(): array
    {
        $since = now()->subHour();

        $recent = PaymentIntent::query()
            ->withoutGlobalScopes()
            ->where('created_at', '>=', $since)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $total = (int) $recent->sum();
        $paid = (int) ($recent['paid'] ?? 0);
        $failed = (int) ($recent['failed'] ?? 0);

        return [
            'window_hours' => 1,
            'total' => $total,
            'success_rate' => $total === 0 ? null : round($paid / $total * 100, 1),
            'failure_rate' => $total === 0 ? null : round($failed / $total * 100, 2),
            // نيّة تجاوزت مهلتها ولم تُغلق = ويبهوك لم يصل.
            'stale_pending' => PaymentIntent::query()
                ->withoutGlobalScopes()
                ->where('status', 'pending')
                ->whereNotNull('expires_at')
                ->where('expires_at', '<', now())
                ->count(),
        ];
    }
}
