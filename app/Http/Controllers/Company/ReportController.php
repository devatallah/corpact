<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\CoordinatorMonthlyReport;
use App\Models\Notification;
use App\Services\Reporting\Export\ExportAudience;
use App\Services\Reporting\Export\ExportContext;
use App\Services\Reporting\Export\ExportFormat;
use App\Services\Reporting\Export\ExportService;
use App\Services\Reporting\KpiDictionary;
use App\Services\Reporting\ReportPeriod;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * A13 — تقارير مسؤول الحساب (H §15، H §18، G/الشركة §6 و§9).
 *
 * كل رقم على هذه الصفحة يأتي من {@see KpiDictionary} — **لا معادلة محسوبة
 * هنا**. ما كان قبلها (`Company\ReportService`) كان يعرّف «المشاركة» عضويةً
 * في مجتمع، ويقيس «معدل الحضور» بنسبة المسجلين إلى السعة، ويصدّر JSON بلا
 * تدقيق؛ الثلاثة أُبدلت.
 *
 * التصدير يمر بمجموعة المسارات نفسها (`auth:company` + `company.context`)
 * فيرث فحص الصلاحية ونطاق الشركة حرفياً — شرط «نفس فحص الصلاحيات ونطاق
 * الشركة» في H §15 مُستوفى بالبناء لا بالتكرار.
 */
class ReportController extends Controller
{
    public function __construct(
        private KpiDictionary $kpi,
        private ExportService $exports,
    ) {}

    public function index(Request $request): Response
    {
        $company = auth('company')->user();
        $period = $this->resolvePeriod($request);

        $unreadNotifications = Notification::where('notifiable_type', Company::class)
            ->where('notifiable_id', $company->id)
            ->whereNull('read_at')
            ->count();

        $monthlyReports = CoordinatorMonthlyReport::query()
            ->where('company_id', $company->id)
            ->whereNotNull('delivered_at')
            ->orderByDesc('period_key')
            ->limit(12)
            ->get()
            ->map(fn (CoordinatorMonthlyReport $report) => [
                'id' => (int) $report->id,
                'period_key' => $report->period_key,
                'delivered_at' => $report->delivered_at?->toIso8601String(),
                'activation_rate' => (float) $report->metric('activation_rate.rate', 0),
                'completed_events' => (int) $report->metric('completed_events', 0),
                'recommendations_count' => $report->recommendations()->count(),
            ])
            ->all();

        return Inertia::render('company/reports/index', [
            'company' => $company,
            'period' => $period->toArray(),
            'periodOptions' => $this->periodOptions(),
            'kpi' => $this->kpi->companySnapshot($company, $period),
            'exports' => $this->exports->availableFor(ExportAudience::AccountManager),
            'monthlyReports' => $monthlyReports,
            'unreadNotifications' => $unreadNotifications,
        ]);
    }

    /**
     * تصدير Excel/PDF — التصريح والحجب والتدقيق كلها داخل
     * {@see ExportService}.
     */
    public function export(Request $request, string $exportKey): HttpResponse
    {
        $company = auth('company')->user();

        $format = ExportFormat::tryFrom((string) $request->query('format', 'xlsx'));

        if ($format === null) {
            throw new HttpException(404, 'صيغة تصدير غير مدعومة.');
        }

        $context = new ExportContext(
            company: $company,
            audience: ExportAudience::AccountManager,
            period: $this->resolvePeriod($request),
        );

        return $this->exports->download($exportKey, $context, $format);
    }

    /**
     * التقرير الشهري كما وصل مسؤول الحساب — لقطة ثابتة لا يُعاد حسابها.
     */
    public function monthly(CoordinatorMonthlyReport $report): Response
    {
        $company = auth('company')->user();

        // نطاق الشركة: تقرير شركة أخرى **غير موجود** لهذه الجلسة (H §4).
        if ((int) $report->company_id !== (int) $company->id || $report->delivered_at === null) {
            abort(404);
        }

        $report->load('recommendations.community');

        return Inertia::render('company/reports/monthly', [
            'company' => $company,
            'report' => [
                'id' => (int) $report->id,
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
        ]);
    }

    private function resolvePeriod(Request $request): ReportPeriod
    {
        $key = (string) $request->query('period', '');

        if (preg_match('/^\d{4}-\d{2}$/', $key) === 1) {
            return ReportPeriod::fromKey($key);
        }

        // H §15: «بفترة شهرية افتراضياً».
        return ReportPeriod::currentMonth();
    }

    /**
     * @return list<array{key: string, label: string}>
     */
    private function periodOptions(): array
    {
        $options = [];
        $period = ReportPeriod::currentMonth();

        for ($i = 0; $i < 12; $i++) {
            $options[] = ['key' => $period->key, 'label' => $period->label];
            $period = $period->previous();
        }

        return $options;
    }
}
