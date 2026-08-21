<?php

namespace App\Services\Reporting;

use App\Enums\EventStatus;
use App\Enums\WalletTransactionType;
use App\Models\Community;
use App\Models\Company;
use App\Models\DepartmentHistory;
use App\Models\Employee;
use App\Services\Attendance\ActivationService;
use App\Services\Attendance\AttendanceService;
use App\Support\Money;
use DateTimeInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * A13 — **قاموس المؤشرات: المعادلات كما نُفِّذت** (H §15، G/الشركة §9).
 *
 * الحاكم الثلاثي لكل مؤشر هنا: **بتوقيت الرياض** (عبر {@see ReportPeriod})،
 * **بفترة شهرية افتراضياً**، و**باستثناء الفعاليات الملغاة** (المرساة الزمنية
 * `events.completed_at`، والملغاة لا `completed_at` لها أصلاً).
 *
 * | المؤشر | المعادلة المنفَّذة |
 * |---|---|
 * | معدل التفعيل | موظفون حضروا ≥ فعالية مكتملة في الدورة ÷ الموظفين النشطين |
 * | معدل الحضور | `attended` ÷ المقاعد المحجوزة في الفعاليات المكتملة |
 * | التكلفة لكل مشاركة | إنفاق الشركة في الفترة ÷ عدد الحضور |
 * | معدل الإلغاء | الفعاليات التي أُلغيت في الفترة ÷ الفعاليات المنشأة فيها |
 * | المشاركة حسب الإدارة | حاضرو الإدارة ÷ موظفيها — **بالإسناد وقت الحدث** |
 * | المجتمعات النشطة | مجتمعات أقامت ≥ فعالية مكتملة خلال 30 يوماً |
 * | حجم التداول | Σ `total_amount_halalas` للمكتملة — **ليس إيراداً** |
 *
 * **لا صفحة ولا خدمة تعيد حساب أيٍّ من هذه المعادلات داخلها.** كل مستهلك
 * (لوحة الشركة، تقارير الشركة، تقرير المنسّق، التصدير) يقرأ من هنا — وإلا
 * انحرفت الأرقام بين شاشتين كما كان الحال قبل هذا القاموس
 * (`Company\ReportService::participationRate` كان يعرّف «المشاركة» عضويةً في
 * مجتمع لا حضوراً لفعالية).
 *
 * كل مؤشر يعود {@see Metric} بالبسط والمقام معاً؛ المبالغ تعود
 * {@see MoneyFigure} تحمل نوعها فلا تُجمع أنواع مختلفة (H §15).
 */
class KpiDictionary
{
    public const ACTIVATION_RATE = 'activation_rate';

    public const ATTENDANCE_RATE = 'attendance_rate';

    public const CANCELLATION_RATE = 'cancellation_rate';

    public const ACTIVE_COMMUNITIES = 'active_communities';

    public const DEPARTMENT_PARTICIPATION = 'department_participation';

    /** «المجتمع النشط» = أقام فعالية مكتملة واحدة على الأقل خلال هذه المدة. */
    public const COMMUNITY_ACTIVE_WINDOW_DAYS = 30;

    public function __construct(
        private ActivationService $activation,
    ) {}

    // ── 1) معدل التفعيل ─────────────────────────────────────────────────────

    /**
     * **المؤشر الأول** (G/الشركة §6: «النسبة الحقيقية للاستفادة — وهو المؤشر
     * الأول لا عدد المسجلين»).
     *
     * الموظفون الذين حضروا فعالية مكتملة واحدة على الأقل في الدورة ÷ الموظفين
     * النشطين في الشركة. دلالة «المفعّل» يملكها {@see ActivationService} (A12)
     * ولا تُعاد كتابتها هنا: مقعد محجوز + `attended` + فعالية اكتملت داخل
     * الفترة، ويُحتسب الموظف مرة واحدة.
     */
    public function activationRate(Company $company, ReportPeriod $period): Metric
    {
        return new Metric(
            key: self::ACTIVATION_RATE,
            label: 'معدل التفعيل',
            numerator: $this->activation->activatedCount((int) $company->id, $period->start, $period->end),
            denominator: $this->activeEmployeeCount($company),
            formula: 'موظفون حضروا فعالية مكتملة واحدة على الأقل في الدورة ÷ الموظفين النشطين',
        );
    }

    /**
     * عدد الموظفين النشطين — مقام معدل التفعيل.
     */
    public function activeEmployeeCount(Company $company): int
    {
        return Employee::withoutGlobalScopes()
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->count();
    }

    // ── 2) معدل الحضور ──────────────────────────────────────────────────────

    /**
     * `attended` ÷ **المقاعد المحجوزة** في الفعاليات المكتملة (ملاحظة A12).
     *
     * المقام «المؤكدون» في نص المواصفة = من يملك مقعداً محجوزاً لحظة الاكتمال
     * (`seat_status = reserved`)؛ قائمة الانتظار والمنسحبون خارجه، والغائب
     * داخله لأن غيابه هو ما يقيسه المؤشر.
     */
    public function attendanceRate(Company $company, ReportPeriod $period): Metric
    {
        $counts = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('events.company_id', $company->id)
            ->whereNotNull('events.completed_at')
            ->whereBetween('events.completed_at', [$period->start, $period->end])
            ->where('event_participants.seat_status', 'reserved')
            ->selectRaw('COUNT(*) as reserved_seats')
            ->selectRaw('SUM(CASE WHEN event_participants.attendance_status = ? THEN 1 ELSE 0 END) as attended', [AttendanceService::ATTENDED])
            ->first();

        return new Metric(
            key: self::ATTENDANCE_RATE,
            label: 'معدل الحضور',
            numerator: (int) ($counts->attended ?? 0),
            denominator: (int) ($counts->reserved_seats ?? 0),
            formula: 'الحاضرون ÷ المقاعد المحجوزة في الفعاليات المكتملة',
        );
    }

    /**
     * عدد الحضور (مقام «التكلفة لكل مشاركة»): كل حضور مؤكد يُعدّ مرة —
     * الموظف الذي حضر ثلاث فعاليات = ثلاث مشاركات، بخلاف عدّاد التفعيل.
     */
    public function attendanceCount(Company $company, ReportPeriod $period): int
    {
        return DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('events.company_id', $company->id)
            ->whereNotNull('events.completed_at')
            ->whereBetween('events.completed_at', [$period->start, $period->end])
            ->where('event_participants.seat_status', 'reserved')
            ->where('event_participants.attendance_status', AttendanceService::ATTENDED)
            ->count();
    }

    // ── 3) التكلفة لكل مشاركة ───────────────────────────────────────────────

    /**
     * إجمالي إنفاق الشركة في الفترة ÷ عدد الحضور — **الكلفة الفعلية للأثر لا
     * الميزانية المرصودة** (G/الشركة §6).
     *
     * «الإنفاق» = ما خرج فعلاً من محافظ الشركة (الرئيسية ومحافظ مجتمعاتها):
     * قيود `capture` مدينة ناقص `refund` دائنة داخل الفترة. التخصيص من المحفظة
     * الرئيسية إلى محفظة مجتمع **ليس إنفاقاً** (نقل داخلي) فهو خارج الحساب.
     *
     * @return array{spend: MoneyFigure, attendance: int, cost_per_participation_halalas: int, cost_per_participation: string}
     */
    public function costPerParticipation(Company $company, ReportPeriod $period): array
    {
        $spend = $this->companySpend($company, $period);
        $attendance = $this->attendanceCount($company, $period);

        // قسمة صحيحة بلا تقريب لأعلى (قاعدة A10 — H §12.1).
        $perParticipation = $attendance === 0 ? 0 : intdiv($spend->halalas, $attendance);

        return [
            'spend' => $spend,
            'attendance' => $attendance,
            'cost_per_participation_halalas' => $perParticipation,
            'cost_per_participation' => Money::format($perParticipation),
        ];
    }

    /**
     * إنفاق الشركة الفعلي في الفترة بالهللة.
     */
    public function companySpend(Company $company, ReportPeriod $period): MoneyFigure
    {
        $rows = DB::table('wallet_transactions')
            ->join('wallets', 'wallets.id', '=', 'wallet_transactions.wallet_id')
            ->where('wallets.company_id', $company->id)
            ->whereBetween('wallet_transactions.occurred_at', [$period->start, $period->end])
            ->whereIn('wallet_transactions.type', [
                WalletTransactionType::Capture->value,
                WalletTransactionType::Refund->value,
            ])
            ->selectRaw('wallet_transactions.type as type, wallet_transactions.direction as direction, SUM(wallet_transactions.amount_halalas) as total')
            ->groupBy('wallet_transactions.type', 'wallet_transactions.direction')
            ->get();

        $spent = 0;

        foreach ($rows as $row) {
            $amount = (int) $row->total;

            if ($row->type === WalletTransactionType::Capture->value && $row->direction === 'debit') {
                $spent += $amount;
            }

            if ($row->type === WalletTransactionType::Refund->value && $row->direction === 'credit') {
                $spent -= $amount;
            }
        }

        return MoneyFigure::of(MoneyFigureKind::CompanySpend, max(0, $spent));
    }

    // ── 4) معدل الإلغاء وأسبابه ─────────────────────────────────────────────

    /**
     * الفعاليات الملغاة ÷ الفعاليات المنشأة — كلاهما **داخل الفترة نفسها**:
     * المقام `events.created_at`، والبسط لحظة الانتقال إلى حالة إلغاء من
     * `event_status_history`. القراءة الحرفية للمواصفة، وثابتة بعد انقضاء
     * الشهر (لا يتغير رقم شهر مضى بإلغاء يقع لاحقاً).
     */
    public function cancellationRate(Company $company, ReportPeriod $period): Metric
    {
        return new Metric(
            key: self::CANCELLATION_RATE,
            label: 'معدل الإلغاء',
            numerator: array_sum($this->cancellationReasons($company, $period)),
            denominator: $this->createdEventCount($company, $period),
            formula: 'الفعاليات التي أُلغيت في الفترة ÷ الفعاليات المنشأة فيها',
        );
    }

    public function createdEventCount(Company $company, ReportPeriod $period): int
    {
        return DB::table('events')
            ->where('company_id', $company->id)
            ->whereBetween('created_at', [$period->start, $period->end])
            ->count();
    }

    /**
     * توزيع الإلغاء على أسبابه — **قائمة مغلقة** هي حالات الإلغاء الأربع في
     * آلة الحالات (H §9): لم يبلغ الحد الأدنى · المزوّد · الشركة · فشل
     * التحصيل. لا نص حر: السبب حالة لا عبارة.
     *
     * @return array<string, int> status => count
     */
    public function cancellationReasons(Company $company, ReportPeriod $period): array
    {
        $counts = array_fill_keys(self::cancelledStatuses(), 0);

        $rows = DB::table('event_status_history')
            ->join('events', 'events.id', '=', 'event_status_history.event_id')
            ->where('events.company_id', $company->id)
            ->whereIn('event_status_history.to_status', self::cancelledStatuses())
            ->whereBetween('event_status_history.created_at', [$period->start, $period->end])
            ->selectRaw('event_status_history.to_status as status, COUNT(DISTINCT event_status_history.event_id) as total')
            ->groupBy('event_status_history.to_status')
            ->get();

        foreach ($rows as $row) {
            $counts[$row->status] = (int) $row->total;
        }

        return $counts;
    }

    /**
     * @return list<string>
     */
    public static function cancelledStatuses(): array
    {
        return [
            EventStatus::CancelledMinNotMet->value,
            EventStatus::CancelledProvider->value,
            EventStatus::CancelledCompany->value,
            EventStatus::CancelledPaymentFailed->value,
        ];
    }

    // ── 5) المشاركة حسب الإدارة ─────────────────────────────────────────────

    /**
     * الحاضرون من الإدارة ÷ موظفي الإدارة — **يُنسبون للإدارة وقت الحدث**
     * (H §15، H §5).
     *
     * الإسناد يقرأ `department_history` عبر
     * {@see DepartmentHistory::departmentIdAt()} بلحظة بدء
     * الفعالية، لا `employees.department_id` الحالي: موظف نُقل بعد الفعالية
     * تبقى مشاركته محسوبة على إدارته وقتها، وإلا هاجرت أرقام الشهور الماضية مع
     * كل نقل إداري.
     *
     * المقام يُسند بالمنطق نفسه عند **نهاية الفترة** كي يقيس البسط والمقام
     * الشيء ذاته. موظف بلا إدارة في تلك اللحظة يُجمع تحت «بلا إدارة».
     *
     * @return list<array{department_id: int|null, department_name: string, attendees: int, employees: int, rate: float}>
     */
    public function participationByDepartment(Company $company, ReportPeriod $period): array
    {
        $history = $this->departmentHistoryFor($company);

        // المقام: كل موظف نشط منسوب لإدارته عند نهاية الفترة.
        $employees = Employee::withoutGlobalScopes()
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->pluck('id')
            ->all();

        $totals = [];

        foreach ($employees as $employeeId) {
            $departmentId = $this->resolveDepartment($history, (int) $employeeId, $period->end);
            $key = $departmentId ?? 0;
            $totals[$key] ??= ['attendees' => [], 'employees' => 0];
            $totals[$key]['employees']++;
        }

        // البسط: كل حاضر منسوب لإدارته **وقت الفعالية**، مرة واحدة لكل إدارة.
        $attendances = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('events.company_id', $company->id)
            ->whereNotNull('events.completed_at')
            ->whereBetween('events.completed_at', [$period->start, $period->end])
            ->where('event_participants.seat_status', 'reserved')
            ->where('event_participants.attendance_status', AttendanceService::ATTENDED)
            ->select([
                'event_participants.employee_id',
                'events.starts_at',
                'events.completed_at',
            ])
            ->get();

        foreach ($attendances as $row) {
            $at = Carbon::parse($row->starts_at ?? $row->completed_at);
            $departmentId = $this->resolveDepartment($history, (int) $row->employee_id, $at);
            $key = $departmentId ?? 0;
            $totals[$key] ??= ['attendees' => [], 'employees' => 0];
            $totals[$key]['attendees'][(int) $row->employee_id] = true;
        }

        $names = DB::table('departments')
            ->where('company_id', $company->id)
            ->pluck('name', 'id');

        $report = [];

        foreach ($totals as $departmentId => $bucket) {
            $attendees = count($bucket['attendees']);
            $employeeCount = $bucket['employees'];

            $report[] = [
                'department_id' => $departmentId === 0 ? null : (int) $departmentId,
                'department_name' => $departmentId === 0
                    ? 'بلا إدارة'
                    : (string) ($names[$departmentId] ?? 'إدارة محذوفة'),
                'attendees' => $attendees,
                'employees' => $employeeCount,
                'rate' => $employeeCount === 0 ? 0.0 : round(($attendees / $employeeCount) * 100, 1),
            ];
        }

        usort($report, fn ($a, $b) => $b['rate'] <=> $a['rate'] ?: strcmp($a['department_name'], $b['department_name']));

        return $report;
    }

    /**
     * أسماء إدارات مجموعة موظفين **بالإسناد التاريخي** عند لحظة محددة —
     * الأداة التي تستعملها التصديرات كي لا تقرأ `employees.department_id`.
     *
     * @param  list<int>  $employeeIds
     * @return array<int, string>
     */
    public function departmentNamesAt(Company $company, DateTimeInterface $at, array $employeeIds): array
    {
        $history = $this->departmentHistoryFor($company);

        $names = DB::table('departments')
            ->where('company_id', $company->id)
            ->pluck('name', 'id');

        $resolved = [];

        foreach ($employeeIds as $employeeId) {
            $departmentId = $this->resolveDepartment($history, $employeeId, $at);

            $resolved[$employeeId] = $departmentId === null
                ? 'بلا إدارة'
                : (string) ($names[$departmentId] ?? 'إدارة محذوفة');
        }

        return $resolved;
    }

    /**
     * فترات `department_history` للشركة كاملة، مرة واحدة لكل تقرير.
     *
     * @return array<int, list<array{start: Carbon, end: Carbon|null, department_id: int|null}>>
     */
    private function departmentHistoryFor(Company $company): array
    {
        $rows = DB::table('department_history')
            ->where('company_id', $company->id)
            ->orderBy('employee_id')
            ->orderBy('started_at')
            ->orderBy('id')
            ->get(['employee_id', 'department_id', 'started_at', 'ended_at']);

        $history = [];

        foreach ($rows as $row) {
            $history[(int) $row->employee_id][] = [
                'start' => Carbon::parse($row->started_at),
                'end' => $row->ended_at === null ? null : Carbon::parse($row->ended_at),
                'department_id' => $row->department_id === null ? null : (int) $row->department_id,
            ];
        }

        return $history;
    }

    /**
     * @param  array<int, list<array{start: Carbon, end: Carbon|null, department_id: int|null}>>  $history
     */
    private function resolveDepartment(array $history, int $employeeId, DateTimeInterface $at): ?int
    {
        $moment = Carbon::parse($at);
        $resolved = null;

        foreach ($history[$employeeId] ?? [] as $interval) {
            if ($interval['start']->gt($moment)) {
                continue;
            }

            if ($interval['end'] !== null && $interval['end']->lte($moment)) {
                continue;
            }

            // الفترات مرتّبة تصاعدياً؛ الأخيرة المطابقة هي الأحدث.
            $resolved = $interval['department_id'];
        }

        return $resolved;
    }

    // ── 6) المجتمعات النشطة والخاملة ────────────────────────────────────────

    /**
     * المجتمع **نشط** إن أقام فعالية مكتملة واحدة على الأقل خلال 30 يوماً
     * (H §15)، وإلا فهو **خامل نشاطياً** — وهذا تعريف مستقل عن
     * `communities.status = dormant` الذي يعني «بلا قائد 30 يوماً» (H §6):
     * مجتمع له قائد ولا يقيم شيئاً خاملٌ في التقرير وإن كان `active` في
     * قاعدة البيانات، وهو بالضبط ما يجب أن يراه مسؤول الحساب.
     *
     * @return array{window_days: int, as_of: string, active: list<array{id: int, name: string, last_completed_at: string|null}>, dormant: list<array{id: int, name: string, last_completed_at: string|null}>, metric: Metric}
     */
    public function communityActivity(Company $company, ?DateTimeInterface $asOf = null): array
    {
        $asOf = Carbon::parse($asOf ?? Carbon::now());
        $threshold = $asOf->copy()->subDays(self::COMMUNITY_ACTIVE_WINDOW_DAYS);

        $communities = Community::withoutGlobalScopes()
            ->where('company_id', $company->id)
            ->where('status', '!=', Community::STATUS_INACTIVE)
            ->orderBy('name')
            ->get(['id', 'name', 'status']);

        $lastCompleted = DB::table('events')
            ->where('company_id', $company->id)
            ->whereNotNull('completed_at')
            ->where('completed_at', '<=', $asOf)
            ->groupBy('community_id')
            ->selectRaw('community_id, MAX(completed_at) as last_completed_at')
            ->pluck('last_completed_at', 'community_id');

        $active = [];
        $dormant = [];

        foreach ($communities as $community) {
            $last = $lastCompleted[$community->id] ?? null;
            $row = [
                'id' => (int) $community->id,
                'name' => (string) $community->name,
                'last_completed_at' => $last === null ? null : Carbon::parse($last)->toIso8601String(),
                'leaderless_dormant' => $community->status === Community::STATUS_DORMANT,
            ];

            if ($last !== null && Carbon::parse($last)->gte($threshold)) {
                $active[] = $row;
            } else {
                $dormant[] = $row;
            }
        }

        return [
            'window_days' => self::COMMUNITY_ACTIVE_WINDOW_DAYS,
            'as_of' => $asOf->toIso8601String(),
            'active' => $active,
            'dormant' => $dormant,
            'metric' => new Metric(
                key: self::ACTIVE_COMMUNITIES,
                label: 'المجتمعات النشطة',
                numerator: count($active),
                denominator: count($active) + count($dormant),
                formula: 'مجتمعات أقامت فعالية مكتملة واحدة على الأقل خلال 30 يوماً ÷ كل المجتمعات',
            ),
        ];
    }

    // ── 7) حجم التداول — وليس إيراداً ───────────────────────────────────────

    /**
     * Σ قيمة الفعاليات المكتملة في الفترة. **ليس إيراد تيمات** (H §15) —
     * ولا يمكن جمعه ببند إيراد لأن {@see MoneyFigure} يمنع جمع نوعين.
     */
    public function gmv(Company $company, ReportPeriod $period): MoneyFigure
    {
        $total = (int) DB::table('events')
            ->where('company_id', $company->id)
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$period->start, $period->end])
            ->sum('total_amount_halalas');

        return MoneyFigure::of(MoneyFigureKind::Gmv, $total);
    }

    public function completedEventCount(Company $company, ReportPeriod $period): int
    {
        return DB::table('events')
            ->where('company_id', $company->id)
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$period->start, $period->end])
            ->count();
    }

    // ── الحزمة الكاملة ──────────────────────────────────────────────────────

    /**
     * كل مؤشرات الشركة لفترة واحدة — المصدر الوحيد للوحة الشركة وتقاريرها
     * وتقرير المنسّق والتصدير.
     *
     * @return array<string, mixed>
     */
    public function companySnapshot(Company $company, ReportPeriod $period, ?DateTimeInterface $asOf = null): array
    {
        $cost = $this->costPerParticipation($company, $period);
        $communities = $this->communityActivity($company, $asOf ?? $period->end);

        return [
            'period' => $period->toArray(),
            'activation_rate' => $this->activationRate($company, $period)->toArray(),
            'attendance_rate' => $this->attendanceRate($company, $period)->toArray(),
            'cancellation_rate' => $this->cancellationRate($company, $period)->toArray(),
            'cancellation_reasons' => $this->cancellationReasons($company, $period),
            'department_participation' => $this->participationByDepartment($company, $period),
            'communities' => [
                'window_days' => $communities['window_days'],
                'as_of' => $communities['as_of'],
                'active' => $communities['active'],
                'dormant' => $communities['dormant'],
                'metric' => $communities['metric']->toArray(),
            ],
            'completed_events' => $this->completedEventCount($company, $period),
            'created_events' => $this->createdEventCount($company, $period),
            'attendance_count' => $cost['attendance'],
            // حقلان منفصلان بالاسم والنوع — لا بطاقة تجمعهما ولا حقل يلمّهما.
            ...$cost['spend']->toFields(),
            ...$this->gmv($company, $period)->toFields(),
            'cost_per_participation_halalas' => $cost['cost_per_participation_halalas'],
            'cost_per_participation' => $cost['cost_per_participation'],
        ];
    }
}
