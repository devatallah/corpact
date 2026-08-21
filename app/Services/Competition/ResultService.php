<?php

namespace App\Services\Competition;

use App\Models\CompetitionResult;
use App\Models\CompetitionResultChange;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\RoleAssignment;
use App\Models\Season;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\Attendance\AttendanceService;
use App\Services\Authorization\AuthorizationService;
use App\Support\Competition\MeasurementUnits;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * المسابقات والنتائج (H §13).
 *
 * - **نوعا قياس فقط**: قيمة فردية (وقت · مسافة · عدد بوحدة من الكتالوج
 *   المركزي) والمواظبة (عدد الفعاليات المكتملة). المواظبة **يحتسبها النظام**
 *   من الحضور ولا تُدخل يدوياً — عدّها إدخالاً يخلق مصدر حقيقة ثانياً يناقض
 *   `attendance_status`.
 * - **الإدخال من القائد أو المنسّق** (صلاحية `results.enter` بنطاق المجتمع).
 * - **التصحيح بعد الإدخال**: صلاحية `results.correct` + سبب إلزامي + سجل
 *   تدقيق + إعادة احتساب اللوحة — والقيمة القديمة تبقى في سجل التصحيحات.
 * - الدوري والمباريات والفرق مؤجلة: المخطط يستوعبها بحقول
 *   `subject_type/source_type` بلا تغيير لاحق.
 */
class ResultService
{
    public function __construct(
        private AuthorizationService $authorization,
        private SeasonService $seasons,
        private BoardService $boards,
    ) {}

    /**
     * إدخال (أو تحديث غير مصحَّح لأول مرة) نتيجة قيمة فردية لمشارك في فعالية.
     */
    public function record(
        Event $event,
        Employee $employee,
        string $unit,
        int|float|string $value,
        ?User $user,
        ?string $notes = null,
        string $measurementType = CompetitionResult::TYPE_INDIVIDUAL_VALUE,
    ): CompetitionResult {
        $this->assertCanEnter($event, $user);

        if ($measurementType === CompetitionResult::TYPE_CONSISTENCY) {
            throw new RuntimeException('المواظبة تُحتسب آلياً من الحضور — لا تُدخل كنتيجة يدوية (H §13).');
        }

        if ($measurementType !== CompetitionResult::TYPE_INDIVIDUAL_VALUE) {
            throw new RuntimeException('الإصدار الأول يدعم نوعي قياس فقط: قيمة فردية ومواظبة.');
        }

        if (! MeasurementUnits::exists($unit)) {
            throw new RuntimeException('وحدة القياس يجب أن تكون من الكتالوج المركزي.');
        }

        if ($event->completed_at === null) {
            throw new RuntimeException('لا تُدخل النتائج إلا لفعالية مكتملة.');
        }

        $participant = EventParticipant::where('event_id', $event->id)
            ->where('employee_id', $employee->id)
            ->first();

        if ($participant === null || $participant->seat_status !== 'reserved') {
            throw new RuntimeException('هذا الموظف ليس من مشاركي الفعالية المؤكدين.');
        }

        if ($participant->attendance_status === AttendanceService::ABSENT) {
            throw new RuntimeException('لا تُسجَّل نتيجة لمشارك مُسجَّل غائباً.');
        }

        $community = $event->community;

        if ($community === null) {
            throw new RuntimeException('الفعالية بلا مجتمع — لا موسم تُنسب إليه النتيجة.');
        }

        $season = $this->seasons->seasonFor($community, $event->completed_at);

        if ($season->isClosed()) {
            throw new RuntimeException('الموسم مغلق — لا تُدخل نتائج جديدة في موسم مؤرشف.');
        }

        return DB::transaction(function () use ($event, $employee, $unit, $value, $user, $notes, $season, $community) {
            $existing = CompetitionResult::withoutGlobalScopes()
                ->where('source_type', CompetitionResult::SOURCE_EVENT)
                ->where('source_id', $event->id)
                ->where('subject_type', CompetitionResult::SUBJECT_EMPLOYEE)
                ->where('subject_id', $employee->id)
                ->where('measurement_type', CompetitionResult::TYPE_INDIVIDUAL_VALUE)
                ->first();

            if ($existing !== null) {
                throw new RuntimeException('للمشارك نتيجة مسجَّلة في هذه الفعالية — التعديل يمر بمسار التصحيح (سبب + تدقيق).');
            }

            $result = CompetitionResult::withoutGlobalScopes()->create([
                'company_id' => $event->company_id,
                'community_id' => $community->id,
                'season_id' => $season->id,
                'subject_type' => CompetitionResult::SUBJECT_EMPLOYEE,
                'subject_id' => $employee->id,
                'employee_id' => $employee->id,
                'source_type' => CompetitionResult::SOURCE_EVENT,
                'source_id' => $event->id,
                'event_id' => $event->id,
                'measurement_type' => CompetitionResult::TYPE_INDIVIDUAL_VALUE,
                'unit' => $unit,
                'value_scaled' => CompetitionResult::toScaled($value),
                'recorded_by_user_id' => $user?->id,
                'recorded_at' => now(),
                'notes' => $notes,
            ]);

            ActivityLogService::log(
                $event->company_id,
                $result,
                'result_recorded',
                "سُجِّلت نتيجة «{$employee->name}» في الفعالية #{$event->id}: ".MeasurementUnits::format($unit, (float) $value).' (موسم «'.$season->name.'»).',
                [
                    'event_id' => $event->id,
                    'employee_id' => $employee->id,
                    'season_id' => $season->id,
                    'unit' => $unit,
                    'value_scaled' => $result->value_scaled,
                ],
                actorUserId: $user?->id,
                actorName: $user?->name,
            );

            return $result;
        });
    }

    /**
     * تصحيح نتيجة بعد إدخالها: صلاحية + **سبب إلزامي** + سجل تدقيق + إعادة
     * احتساب اللوحة. القيمة القديمة لا تُطمس — تبقى في `competition_result_changes`.
     *
     * @return array{result: CompetitionResult, boards: array<string, mixed>}
     */
    public function correct(
        CompetitionResult $result,
        int|float|string $value,
        ?User $user,
        string $reason,
        ?string $unit = null,
    ): array {
        $reason = trim($reason);

        if ($reason === '') {
            throw new RuntimeException('سبب التصحيح إلزامي (H §13).');
        }

        $this->assertCanCorrect($result, $user);

        $unit ??= $result->unit;

        if (! MeasurementUnits::exists($unit)) {
            throw new RuntimeException('وحدة القياس يجب أن تكون من الكتالوج المركزي.');
        }

        return DB::transaction(function () use ($result, $value, $user, $reason, $unit) {
            $fromValue = $result->value_scaled;
            $fromUnit = $result->unit;
            $toValue = CompetitionResult::toScaled($value);

            $result->forceFill([
                'value_scaled' => $toValue,
                'unit' => $unit,
            ])->save();

            CompetitionResultChange::create([
                'competition_result_id' => $result->id,
                'from_value_scaled' => $fromValue,
                'to_value_scaled' => $toValue,
                'from_unit' => $fromUnit,
                'to_unit' => $unit,
                'reason' => $reason,
                'actor_user_id' => $user?->id,
                'actor_name' => $user?->name,
                'created_at' => now(),
            ]);

            ActivityLogService::log(
                $result->company_id,
                $result,
                'result_corrected',
                'صُحِّحت نتيجة #'.$result->id.': '.
                    MeasurementUnits::format($fromUnit, ($fromValue ?? 0) / CompetitionResult::SCALE).' ← '.
                    MeasurementUnits::format($unit, $toValue / CompetitionResult::SCALE).
                    " — السبب: {$reason}. أُعيد احتساب اللوحة.",
                [
                    'result_id' => $result->id,
                    'season_id' => $result->season_id,
                    'from_value_scaled' => $fromValue,
                    'to_value_scaled' => $toValue,
                    'from_unit' => $fromUnit,
                    'to_unit' => $unit,
                    'reason' => $reason,
                ],
                actorUserId: $user?->id,
                actorName: $user?->name,
            );

            return [
                'result' => $result->fresh(),
                'boards' => $this->recompute($result->season),
            ];
        });
    }

    /**
     * إعادة احتساب لوحات الموسم بعد تصحيح. اللوحات مشتقة من مصدر الحقيقة
     * مباشرة (النتائج + الحضور) فلا نسخة وسيطة تتقادم — والنسخة المؤرشفة
     * لموسم مغلق تبقى كما أُخذت (نسخة نهائية ثابتة).
     *
     * @return array<string, mixed>
     */
    public function recompute(Season $season): array
    {
        return [
            'season_id' => $season->id,
            'consistency' => [
                'individual' => $this->boards->consistencyBoard($season, 'individual'),
                'department' => $this->boards->consistencyBoard($season, 'department'),
            ],
            'skill' => [
                'individual' => $this->boards->skillBoard($season, 'individual'),
                'department' => $this->boards->skillBoard($season, 'department'),
            ],
        ];
    }

    /**
     * نتائج فعالية جاهزة للعرض على صفحة القائد.
     *
     * @return array<int, array<string, mixed>>
     */
    public function forEvent(Event $event): array
    {
        return CompetitionResult::withoutGlobalScopes()
            ->where('source_type', CompetitionResult::SOURCE_EVENT)
            ->where('source_id', $event->id)
            ->with('employee:id,name')
            ->orderBy('id')
            ->get()
            ->map(fn (CompetitionResult $result) => [
                'id' => $result->id,
                'employee_id' => (int) $result->employee_id,
                'employee_name' => $result->employee?->name,
                'measurement_type' => $result->measurement_type,
                'unit' => $result->unit,
                'unit_label' => MeasurementUnits::label($result->unit),
                'value' => $result->value,
                'value_formatted' => $result->formattedValue(),
                'season_id' => $result->season_id,
                'corrections_count' => $result->changes()->count(),
            ])
            ->all();
    }

    private function assertCanEnter(Event $event, ?User $user): void
    {
        if ($user === null || ! $this->authorization->can(
            $user,
            'results.enter',
            RoleAssignment::SCOPE_COMMUNITY,
            $event->community_id,
        )) {
            throw new RuntimeException('إدخال النتائج لقائد المجتمع أو المنسّق فقط (H §13).');
        }
    }

    private function assertCanCorrect(CompetitionResult $result, ?User $user): void
    {
        if ($user === null || ! $this->authorization->can(
            $user,
            'results.correct',
            RoleAssignment::SCOPE_COMMUNITY,
            $result->community_id,
        )) {
            throw new RuntimeException('تصحيح النتيجة يحتاج صلاحية `results.correct` (H §13).');
        }
    }
}
