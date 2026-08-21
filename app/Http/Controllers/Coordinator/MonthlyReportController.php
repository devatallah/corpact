<?php

namespace App\Http\Controllers\Coordinator;

use App\Enums\ReportAction;
use App\Enums\ReportCause;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CoordinatorMonthlyReport;
use App\Models\RoleAssignment;
use App\Models\User;
use App\Services\Reporting\CoordinatorReportService;
use App\Services\Reporting\Export\ExportAudience;
use App\Services\Reporting\Export\ExportContext;
use App\Services\Reporting\Export\ExportFormat;
use App\Services\Reporting\Export\ExportService;
use App\Services\Reporting\ReportPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * A13 — شاشات المنسّق المُدار للتقرير الشهري (H §15، H §18، G/المنسّق §1 و§3).
 *
 * المنسّق موظف لدى تيمات، فهويته `users` والحارس `admin` — ونطاقه **الشركات
 * المسندة إليه وحدها** عبر `role_assignments (coordinator, scope=company)`.
 * شركة غير مسندة إليه **غير موجودة** بالنسبة له (404 لا 403 — H §4)، وأدمن
 * المنصة يرى الكل.
 *
 * ما يستطيعه هنا: قراءة اللقطة، واختيار توصيات من **القائمتين المغلقتين**،
 * وكتابة **ملاحظة واحدة**. ما لا يستطيعه: تعديل رقم واحد في اللقطة.
 */
class MonthlyReportController extends Controller
{
    public function __construct(
        private CoordinatorReportService $reports,
        private ExportService $exports,
    ) {}

    public function index(Request $request): Response
    {
        $user = $this->actor();
        $companyIds = $this->scopeCompanyIds($user);

        $reports = CoordinatorMonthlyReport::query()
            ->with('company:id,name')
            ->when($companyIds !== null, fn ($q) => $q->whereIn('company_id', $companyIds))
            ->orderByDesc('period_key')
            ->orderBy('company_id')
            ->limit(60)
            ->get()
            ->map(fn (CoordinatorMonthlyReport $report) => [
                'id' => (int) $report->id,
                'company_id' => (int) $report->company_id,
                'company_name' => (string) ($report->company->name ?? ''),
                'period_key' => $report->period_key,
                'status' => $report->status,
                'delivered_at' => $report->delivered_at?->toIso8601String(),
                'submitted_at' => $report->submitted_at?->toIso8601String(),
                'activation_rate' => (float) $report->metric('activation_rate.rate', 0),
                'completed_events' => (int) $report->metric('completed_events', 0),
                'dormant_communities' => count((array) $report->metric('communities.dormant', [])),
                'recommendations_count' => $report->recommendations()->count(),
            ])
            ->all();

        return Inertia::render('coordinator/reports/index', [
            'reports' => $reports,
            'isPlatformAdmin' => $companyIds === null,
        ]);
    }

    public function show(CoordinatorMonthlyReport $report): Response
    {
        $this->authorizeReport($report);

        $report->load(['company:id,name', 'recommendations.community']);

        $communities = Community::withoutGlobalScopes()
            ->where('company_id', $report->company_id)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($community) => ['id' => (int) $community->id, 'name' => (string) $community->name])
            ->all();

        return Inertia::render('coordinator/reports/show', [
            'report' => [
                'id' => (int) $report->id,
                'company_id' => (int) $report->company_id,
                'company_name' => (string) ($report->company->name ?? ''),
                'period_key' => $report->period_key,
                'status' => $report->status,
                'note' => $report->note,
                'generated_at' => $report->generated_at?->toIso8601String(),
                'delivered_at' => $report->delivered_at?->toIso8601String(),
                'submitted_at' => $report->submitted_at?->toIso8601String(),
                'snapshot' => $report->snapshot,
                'recommendations' => $report->recommendations
                    ->map(fn ($recommendation) => $recommendation->toDisplayArray())
                    ->all(),
            ],
            'communities' => $communities,
            'causeOptions' => ReportCause::options(),
            'actionOptions' => ReportAction::options(),
            'exports' => $this->exports->availableFor(ExportAudience::Coordinator),
        ]);
    }

    /**
     * حفظ التوصيات — الاعتماد على `Rule::in` للقائمتين المغلقتين، فالنص الحر
     * يُرفض قبل أن يصل الخدمة (H §15).
     */
    public function storeRecommendations(Request $request, CoordinatorMonthlyReport $report): RedirectResponse
    {
        $this->authorizeReport($report);

        $validated = $request->validate([
            'recommendations' => ['array', 'max:20'],
            'recommendations.*.cause' => ['required', Rule::in(ReportCause::values())],
            'recommendations.*.action' => ['required', Rule::in(ReportAction::values())],
            'recommendations.*.community_id' => ['nullable', 'integer'],
            // «حقل ملاحظة واحد اختياري» — واحد على التقرير كله.
            'note' => ['nullable', 'string', 'max:1000'],
        ], [], [
            'recommendations.*.cause' => 'السبب',
            'recommendations.*.action' => 'الإجراء',
            'note' => 'الملاحظة',
        ]);

        $this->reports->saveRecommendations(
            $report,
            $validated['recommendations'] ?? [],
            $validated['note'] ?? null,
            $this->actor(),
        );

        return back()->with('success', 'حُفظت التوصيات.');
    }

    public function export(Request $request, CoordinatorMonthlyReport $report, string $exportKey): HttpResponse
    {
        $this->authorizeReport($report);

        $format = ExportFormat::tryFrom((string) $request->query('format', 'xlsx'));

        if ($format === null) {
            throw new HttpException(404, 'صيغة تصدير غير مدعومة.');
        }

        $context = new ExportContext(
            company: $report->company,
            audience: ExportAudience::Coordinator,
            period: ReportPeriod::fromKey($report->period_key),
        );

        return $this->exports->download($exportKey, $context, $format);
    }

    private function actor(): User
    {
        $user = auth('admin')->user();

        if (! $user instanceof User) {
            abort(403, 'غير مصرح لك بالوصول.');
        }

        return $user;
    }

    /**
     * الشركات المسندة، أو `null` لأدمن المنصة (بلا نطاق).
     *
     * @return list<int>|null
     */
    private function scopeCompanyIds(User $user): ?array
    {
        $isPlatformAdmin = $user->roleAssignments->contains(
            fn (RoleAssignment $assignment) => $assignment->role === Role::PlatformAdmin
                && $assignment->scope_type === RoleAssignment::SCOPE_PLATFORM
        );

        if ($isPlatformAdmin) {
            return null;
        }

        $companyIds = $this->reports->companyIdsFor($user);

        if ($companyIds === []) {
            abort(403, 'لا توجد شركات مسندة إليك.');
        }

        return $companyIds;
    }

    private function authorizeReport(CoordinatorMonthlyReport $report): void
    {
        $companyIds = $this->scopeCompanyIds($this->actor());

        // H §4: خارج النطاق = 404، لا 403 — لا تأكيد لوجود المورد.
        if ($companyIds !== null && ! in_array((int) $report->company_id, $companyIds, true)) {
            abort(404);
        }
    }
}
