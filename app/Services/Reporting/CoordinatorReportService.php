<?php

namespace App\Services\Reporting;

use App\Enums\EventStatus;
use App\Enums\ReportAction;
use App\Enums\ReportCause;
use App\Enums\Role;
use App\Models\Community;
use App\Models\Company;
use App\Models\CoordinatorMonthlyReport;
use App\Models\CoordinatorReportRecommendation;
use App\Models\RoleAssignment;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Support\Notify;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * A13 — توليد وتسليم **التقرير الشهري** (H §15، G/المنسّق §3).
 *
 * نص المواصفة: «يُولَّد آلياً في **اليوم الثاني** من كل شهر: الفعاليات
 * المكتملة، معدل التفعيل، المجتمعات الخاملة، أسباب الإلغاء، ومقارنة بالشهر
 * السابق… يستلمه مسؤول الحساب في الشركة، ونسخة لأدمن تيمات، ويُحفظ نسخة
 * ثابتة لكل شهر».
 *
 * **لمن يُولَّد؟** لكل شركة. المواصفة تسمّيه «تقرير المنسّق» في دليل المنسّق،
 * لكن G/الشركة §6 يقول: «التقرير الشهري يصل مسؤول الحساب **آلياً**، ومع خدمة
 * المنسّق المُدار **يُرفق بتحليل وتوصيات** من قائمة إجراءات محددة». فالتقرير
 * حق كل شركة، والتوصيات هي ما تضيفه الخدمة المدفوعة — وهذا ما يوفّق بين
 * النصين بلا اجتهاد في المنتج.
 *
 * كل مؤشر في اللقطة يُقرأ من {@see KpiDictionary} — لا معادلة تُعاد كتابتها.
 */
class CoordinatorReportService
{
    public function __construct(
        private KpiDictionary $kpi,
    ) {}

    /**
     * الدورة التي يخصها تشغيلُ اليوم الثاني: **الشهر المنقضي** بتوقيت الرياض.
     */
    public function cycleFor(?Carbon $runAt = null): ReportPeriod
    {
        return ReportPeriod::monthOf($runAt ?? Carbon::now())->previous();
    }

    /**
     * توليد لقطة شهر لشركة وحفظها ثابتة. آمنة عند التكرار: التقرير القائم
     * يعود كما هو ولا يُعاد حسابه (يسانده `unique(company_id, period_key)`).
     */
    public function generateFor(Company $company, ReportPeriod $period, ?Carbon $generatedAt = null): CoordinatorMonthlyReport
    {
        $existing = CoordinatorMonthlyReport::query()
            ->where('company_id', $company->id)
            ->where('period_key', $period->key)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $snapshot = $this->buildSnapshot($company, $period);
        $coordinator = $this->coordinatorFor($company);

        return CoordinatorMonthlyReport::create([
            'company_id' => $company->id,
            'coordinator_user_id' => $coordinator?->id,
            'period_key' => $period->key,
            'period_start' => $period->start,
            'period_end' => $period->end,
            'status' => CoordinatorMonthlyReport::STATUS_GENERATED,
            'snapshot' => $snapshot,
            'generated_at' => $generatedAt ?? Carbon::now(),
        ]);
    }

    /**
     * محتوى اللقطة — البنود الخمسة المنصوصة + المؤشرات المساندة، **ومقارنة
     * بالشهر السابق** لكل مؤشر يحتمل المقارنة.
     *
     * @return array<string, mixed>
     */
    public function buildSnapshot(Company $company, ReportPeriod $period): array
    {
        $current = $this->kpi->companySnapshot($company, $period, $period->end);
        $previousPeriod = $period->previous();
        $previous = $this->kpi->companySnapshot($company, $previousPeriod, $previousPeriod->end);

        $reasons = [];

        foreach ($current['cancellation_reasons'] as $status => $count) {
            $reasons[] = [
                'status' => $status,
                'label' => EventStatus::from($status)->label(),
                'count' => $count,
            ];
        }

        return [
            'generated_for' => [
                'company_id' => (int) $company->id,
                'company_name' => (string) $company->name,
                'coordinator_service' => (bool) $company->contract_coordinator_service,
            ],
            'period' => $period->toArray(),
            'previous_period' => $previousPeriod->toArray(),
            // ① الفعاليات المكتملة
            'completed_events' => $current['completed_events'],
            'created_events' => $current['created_events'],
            // ② معدل التفعيل
            'activation_rate' => $current['activation_rate'],
            'attendance_rate' => $current['attendance_rate'],
            // ③ المجتمعات الخاملة
            'communities' => $current['communities'],
            // ④ أسباب الإلغاء
            'cancellation_rate' => $current['cancellation_rate'],
            'cancellation_reasons' => $reasons,
            // مؤشرات مساندة (G/الشركة §6)
            'department_participation' => $current['department_participation'],
            'attendance_count' => $current['attendance_count'],
            'company_spend_halalas' => $current['company_spend_halalas'],
            'company_spend' => $current['company_spend'],
            'cost_per_participation_halalas' => $current['cost_per_participation_halalas'],
            'cost_per_participation' => $current['cost_per_participation'],
            // حجم التداول حقل مستقل بالاسم والنوع — ليس إيراداً ولا إنفاقاً (H §15)
            'gmv_halalas' => $current['gmv_halalas'],
            'gmv' => $current['gmv'],
            // ⑤ المقارنة بالشهر السابق
            'month_over_month' => [
                'activation_rate' => $this->delta(
                    $current['activation_rate']['rate'],
                    $previous['activation_rate']['rate'],
                ),
                'attendance_rate' => $this->delta(
                    $current['attendance_rate']['rate'],
                    $previous['attendance_rate']['rate'],
                ),
                'cancellation_rate' => $this->delta(
                    $current['cancellation_rate']['rate'],
                    $previous['cancellation_rate']['rate'],
                ),
                'completed_events' => $this->delta(
                    $current['completed_events'],
                    $previous['completed_events'],
                ),
                'active_communities' => $this->delta(
                    $current['communities']['metric']['numerator'],
                    $previous['communities']['metric']['numerator'],
                ),
                'cost_per_participation_halalas' => $this->delta(
                    $current['cost_per_participation_halalas'],
                    $previous['cost_per_participation_halalas'],
                ),
            ],
        ];
    }

    /**
     * @return array{current: int|float, previous: int|float, change: int|float}
     */
    private function delta(int|float $current, int|float $previous): array
    {
        return [
            'current' => $current,
            'previous' => $previous,
            'change' => round($current - $previous, 1),
        ];
    }

    /**
     * التسليم: مسؤول الحساب في الشركة + **نسخة لأدمن تيمات** (H §15).
     * idempotent — تقرير مُسلَّم لا يُسلَّم مرتين.
     */
    public function deliver(CoordinatorMonthlyReport $report): bool
    {
        if ($report->delivered_at !== null) {
            return false;
        }

        $company = $report->company;
        $activation = (float) $report->metric('activation_rate.rate', 0);

        $variables = [
            'period' => $report->period_key,
            'company' => (string) ($company->name ?? ''),
            'events' => (string) $report->metric('completed_events', 0),
            'activation' => number_format($activation, 1),
            'dormant' => (string) count((array) $report->metric('communities.dormant', [])),
        ];

        Notify::sendToId(
            'report.monthly.ready',
            Company::class,
            (int) $report->company_id,
            $variables,
            ['data' => ['report_id' => $report->id, 'period_key' => $report->period_key]],
        );

        // نسخة أدمن تيمات — للمستخدمين الحاملين دور أدمن المنصة على النطاق.
        $adminIds = RoleAssignment::query()
            ->where('role', Role::PlatformAdmin->value)
            ->where('scope_type', RoleAssignment::SCOPE_PLATFORM)
            ->pluck('user_id')
            ->unique()
            ->values();

        if ($adminIds->isNotEmpty()) {
            Notify::sendToIds(
                'report.monthly.admin_copy',
                User::class,
                $adminIds,
                $variables,
                ['data' => ['report_id' => $report->id, 'period_key' => $report->period_key]],
            );
        }

        $report->forceFill(['delivered_at' => Carbon::now()])->save();

        ActivityLogService::log(
            (int) $report->company_id,
            $report,
            'coordinator_report_delivered',
            "سُلِّم التقرير الشهري لدورة {$report->period_key} لمسؤول الحساب ونسخة لأدمن تيمات",
            ['period_key' => $report->period_key, 'report_id' => $report->id],
        );

        return true;
    }

    /**
     * حفظ توصيات المنسّق — **من القائمتين المغلقتين وحدهما** + حقل ملاحظة
     * واحد. التوصيات تُستبدل بالكامل (لا دمج) كي تعكس ما يراه المنسّق الآن.
     *
     * @param  list<array{cause: string, action: string, community_id?: int|null}>  $recommendations
     */
    public function saveRecommendations(
        CoordinatorMonthlyReport $report,
        array $recommendations,
        ?string $note,
        ?User $author,
    ): CoordinatorMonthlyReport {
        $communityIds = Community::withoutGlobalScopes()
            ->where('company_id', $report->company_id)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $rows = [];

        foreach ($recommendations as $recommendation) {
            // خارج القائمة ⇒ ValueError من الـ enum، لا صف يُكتب.
            $cause = ReportCause::from($recommendation['cause']);
            $action = ReportAction::from($recommendation['action']);
            $communityId = $recommendation['community_id'] ?? null;

            if ($communityId !== null && ! in_array((int) $communityId, $communityIds, true)) {
                // مجتمع من شركة أخرى — نطاق التقرير شركته وحدها.
                throw new RuntimeException('المجتمع المختار لا يتبع شركة هذا التقرير.');
            }

            $rows[] = [
                'coordinator_monthly_report_id' => $report->id,
                'community_id' => $communityId === null ? null : (int) $communityId,
                'cause' => $cause->value,
                'action' => $action->value,
                'created_by_user_id' => $author?->id,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ];
        }

        DB::transaction(function () use ($report, $rows, $note, $author): void {
            $report->recommendations()->delete();

            if ($rows !== []) {
                CoordinatorReportRecommendation::query()->insertOrIgnore($rows);
            }

            $report->forceFill([
                'note' => $note === null || trim($note) === '' ? null : trim($note),
                'status' => CoordinatorMonthlyReport::STATUS_SUBMITTED,
                'submitted_at' => Carbon::now(),
                'coordinator_user_id' => $author?->id ?? $report->coordinator_user_id,
            ])->save();
        });

        ActivityLogService::log(
            (int) $report->company_id,
            $report,
            'coordinator_report_recommendations_saved',
            "حُفظت توصيات التقرير الشهري لدورة {$report->period_key}",
            [
                'period_key' => $report->period_key,
                'recommendations' => array_map(fn ($row) => $row['cause'].'→'.$row['action'], $rows),
                'has_note' => $note !== null && trim((string) $note) !== '',
            ],
        );

        return $report->fresh(['recommendations']);
    }

    /**
     * الشركات المسندة إلى منسّق (دور `coordinator` بنطاق شركة).
     *
     * @return list<int>
     */
    public function companyIdsFor(User $coordinator): array
    {
        return RoleAssignment::query()
            ->where('user_id', $coordinator->id)
            ->where('role', Role::Coordinator->value)
            ->where('scope_type', RoleAssignment::SCOPE_COMPANY)
            ->pluck('scope_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * المنسّق المسنَد لشركة (الأول إن تعددوا).
     */
    public function coordinatorFor(Company $company): ?User
    {
        $userId = RoleAssignment::query()
            ->where('role', Role::Coordinator->value)
            ->where('scope_type', RoleAssignment::SCOPE_COMPANY)
            ->where('scope_id', $company->id)
            ->orderBy('id')
            ->value('user_id');

        return $userId === null ? null : User::query()->find($userId);
    }
}
