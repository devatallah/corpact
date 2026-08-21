<?php

namespace App\Services\Competition;

use App\Models\Community;
use App\Models\CompetitionResult;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaderboardSnapshot;
use App\Models\Season;
use App\Services\Attendance\AttendanceService;
use App\Support\Competition\MeasurementUnits;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * لوحتا الصدارة (H §13) — لا ثالثة لهما:
 *
 * | اللوحة | المصدر | المستوى |
 * | مهارة  | نتائج المسابقات (القيمة الفردية) | فردي وعلى مستوى الإدارة |
 * | مواظبة | عدد الفعاليات المكتملة **بحضور**، مع نقاط من أول مشاركة | فردي وإدارة |
 *
 * قواعد مطبَّقة حرفياً:
 * - **الغائب خارج لوحة المواظبة** — الصف يُقرأ من `attendance_status = attended`.
 * - **الإسناد للإدارة وقت الفعالية** عبر `Employee::departmentAt()` لا الإدارة
 *   الحالية (تصحيح انحراف اللوحة القديمة).
 * - **الترتيب يبقى بعد مغادرة المجتمع**: لا فلترة على عضوية ولا على حالة
 *   موظف — صفوف المشاركة والنتائج محفوظة (قيدا A5/A7).
 * - **لا مقارنة بين الشركات إطلاقاً**: كل استعلام محصور بمجتمع واحد (ومن ثم
 *   شركة واحدة)، ولوحات الشركة محصورة بـ `company_id`.
 * - لوحة المهارة **لكل وحدة قياس على حدة** — الثواني لا تُقارن بالأمتار،
 *   واتجاه الأفضلية من الكتالوج المركزي.
 */
class BoardService
{
    public function pointsPerAttendance(): int
    {
        return (int) config('results.consistency.points_per_attendance', 1);
    }

    // ── لوحة المواظبة ────────────────────────────────────────────────────

    /**
     * لوحة المواظبة داخل موسم — فردي أو على مستوى الإدارة.
     *
     * @return array<int, array<string, mixed>>
     */
    public function consistencyBoard(Season $season, string $level = LeaderboardSnapshot::LEVEL_INDIVIDUAL): array
    {
        $rows = $this->attendedRows($season);

        return $level === LeaderboardSnapshot::LEVEL_DEPARTMENT
            ? $this->consistencyByDepartment($rows)
            : $this->consistencyByEmployee($rows);
    }

    /**
     * الصفوف الخام: كل حضور مؤكد في فعالية اكتملت داخل نافذة الموسم لمجتمعه.
     *
     * @return Collection<int, object>
     */
    private function attendedRows(Season $season)
    {
        return DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('events.community_id', $season->community_id)
            ->whereNotNull('events.completed_at')
            ->whereDate('events.completed_at', '>=', $season->starts_on->toDateString())
            ->whereDate('events.completed_at', '<=', $season->ends_on->toDateString())
            ->where('event_participants.seat_status', 'reserved')
            ->where('event_participants.attendance_status', AttendanceService::ATTENDED)
            ->select([
                'event_participants.employee_id',
                'events.id as event_id',
                'events.starts_at',
                'events.completed_at',
            ])
            ->get();
    }

    /**
     * @param  Collection<int, object>  $rows
     * @return array<int, array<string, mixed>>
     */
    private function consistencyByEmployee($rows): array
    {
        $employees = $this->employeeMap($rows->pluck('employee_id')->unique()->all());
        $points = $this->pointsPerAttendance();

        $board = [];

        foreach ($rows->groupBy('employee_id') as $employeeId => $group) {
            $employee = $employees[(int) $employeeId] ?? null;
            $first = $group->min('completed_at');

            $board[] = [
                'employee_id' => (int) $employeeId,
                'name' => $employee?->name,
                'avatar' => $employee?->avatar,
                'events_count' => $group->count(),
                'points' => $group->count() * $points,
                // «نقاط من أول مشاركة» — لحظة دخول الموظف اللوحة.
                'first_participation_at' => $first,
            ];
        }

        return $this->rank($board, 'points', descending: true, tiebreak: 'first_participation_at');
    }

    /**
     * @param  Collection<int, object>  $rows
     * @return array<int, array<string, mixed>>
     */
    private function consistencyByDepartment($rows): array
    {
        $resolver = $this->departmentResolver($rows->pluck('employee_id')->unique()->all());
        $points = $this->pointsPerAttendance();

        $buckets = [];

        foreach ($rows as $row) {
            $at = $row->starts_at ?? $row->completed_at;
            $departmentId = $resolver((int) $row->employee_id, $at);
            $key = $departmentId ?? 0;

            $buckets[$key] ??= [
                'department_id' => $departmentId,
                'events_count' => 0,
                'employee_ids' => [],
                'first_participation_at' => null,
            ];

            $buckets[$key]['events_count']++;
            $buckets[$key]['employee_ids'][(int) $row->employee_id] = true;

            $first = $buckets[$key]['first_participation_at'];
            if ($first === null || (string) $row->completed_at < (string) $first) {
                $buckets[$key]['first_participation_at'] = $row->completed_at;
            }
        }

        $departments = $this->departmentMap(array_filter(array_column($buckets, 'department_id')));

        $board = [];

        foreach ($buckets as $bucket) {
            $board[] = [
                'department_id' => $bucket['department_id'],
                'name' => $bucket['department_id'] === null
                    ? 'بلا إدارة'
                    : ($departments[$bucket['department_id']]->name ?? 'بلا إدارة'),
                'events_count' => $bucket['events_count'],
                'members_count' => count($bucket['employee_ids']),
                'points' => $bucket['events_count'] * $points,
                'first_participation_at' => $bucket['first_participation_at'],
            ];
        }

        return $this->rank($board, 'points', descending: true, tiebreak: 'first_participation_at');
    }

    // ── لوحة المهارة ─────────────────────────────────────────────────────

    /**
     * وحدات القياس المستعملة فعلاً داخل الموسم — لوحة مهارة لكل واحدة.
     *
     * @return array<int, string>
     */
    public function unitsUsedIn(Season $season): array
    {
        return CompetitionResult::withoutGlobalScopes()
            ->where('season_id', $season->id)
            ->where('measurement_type', CompetitionResult::TYPE_INDIVIDUAL_VALUE)
            ->whereNotNull('unit')
            ->distinct()
            ->orderBy('unit')
            ->pluck('unit')
            ->map(fn ($unit) => (string) $unit)
            ->all();
    }

    /**
     * لوحة المهارة لوحدة قياس داخل موسم — فردي أو على مستوى الإدارة.
     *
     * @return array<int, array<string, mixed>>
     */
    public function skillBoard(Season $season, string $level = LeaderboardSnapshot::LEVEL_INDIVIDUAL, ?string $unit = null): array
    {
        $unit ??= $this->unitsUsedIn($season)[0] ?? null;

        if ($unit === null) {
            return [];
        }

        $results = CompetitionResult::withoutGlobalScopes()
            ->where('season_id', $season->id)
            ->where('measurement_type', CompetitionResult::TYPE_INDIVIDUAL_VALUE)
            ->where('unit', $unit)
            ->whereNotNull('value_scaled')
            ->whereNotNull('employee_id')
            ->get();

        $lowerIsBetter = MeasurementUnits::lowerIsBetter($unit);

        return $level === LeaderboardSnapshot::LEVEL_DEPARTMENT
            ? $this->skillByDepartment($results, $unit, $lowerIsBetter)
            : $this->skillByEmployee($results, $unit, $lowerIsBetter);
    }

    /**
     * @param  Collection<int, CompetitionResult>  $results
     * @return array<int, array<string, mixed>>
     */
    private function skillByEmployee($results, string $unit, bool $lowerIsBetter): array
    {
        $employees = $this->employeeMap($results->pluck('employee_id')->unique()->all());

        $board = [];

        foreach ($results->groupBy('employee_id') as $employeeId => $group) {
            $best = $lowerIsBetter
                ? $group->min('value_scaled')
                : $group->max('value_scaled');

            $employee = $employees[(int) $employeeId] ?? null;

            $board[] = [
                'employee_id' => (int) $employeeId,
                'name' => $employee?->name,
                'avatar' => $employee?->avatar,
                'unit' => $unit,
                'unit_label' => MeasurementUnits::label($unit),
                'best_value' => (float) ($best / CompetitionResult::SCALE),
                'best_value_formatted' => MeasurementUnits::format($unit, (float) $best / CompetitionResult::SCALE),
                'results_count' => $group->count(),
            ];
        }

        return $this->rank($board, 'best_value', descending: ! $lowerIsBetter, tiebreak: 'name');
    }

    /**
     * @param  Collection<int, CompetitionResult>  $results
     * @return array<int, array<string, mixed>>
     */
    private function skillByDepartment($results, string $unit, bool $lowerIsBetter): array
    {
        $resolver = $this->departmentResolver($results->pluck('employee_id')->unique()->all());
        $eventTimes = $this->eventTimes($results->pluck('event_id')->filter()->unique()->all());

        $buckets = [];

        foreach ($results as $result) {
            $at = $eventTimes[(int) $result->event_id] ?? $result->recorded_at;
            $departmentId = $resolver((int) $result->employee_id, $at);
            $key = $departmentId ?? 0;

            $buckets[$key] ??= [
                'department_id' => $departmentId,
                'best' => null,
                'results_count' => 0,
                'employee_ids' => [],
            ];

            $buckets[$key]['results_count']++;
            $buckets[$key]['employee_ids'][(int) $result->employee_id] = true;

            $value = (int) $result->value_scaled;
            $current = $buckets[$key]['best'];

            if ($current === null || ($lowerIsBetter ? $value < $current : $value > $current)) {
                $buckets[$key]['best'] = $value;
            }
        }

        $departments = $this->departmentMap(array_filter(array_column($buckets, 'department_id')));

        $board = [];

        foreach ($buckets as $bucket) {
            $board[] = [
                'department_id' => $bucket['department_id'],
                'name' => $bucket['department_id'] === null
                    ? 'بلا إدارة'
                    : ($departments[$bucket['department_id']]->name ?? 'بلا إدارة'),
                'unit' => $unit,
                'unit_label' => MeasurementUnits::label($unit),
                'best_value' => (float) ($bucket['best'] / CompetitionResult::SCALE),
                'best_value_formatted' => MeasurementUnits::format($unit, (float) $bucket['best'] / CompetitionResult::SCALE),
                'results_count' => $bucket['results_count'],
                'members_count' => count($bucket['employee_ids']),
            ];
        }

        return $this->rank($board, 'best_value', descending: ! $lowerIsBetter, tiebreak: 'name');
    }

    // ── لوحات جاهزة للعرض ────────────────────────────────────────────────

    /**
     * كل لوحات موسم واحد جاهزة للواجهة — أو نسخته المؤرشفة إن كان مغلقاً
     * (النسخة النهائية الثابتة هي المعروضة، لا إعادة حساب).
     *
     * @return array<string, mixed>
     */
    public function seasonBoards(Season $season): array
    {
        $units = $this->unitsUsedIn($season);

        if ($season->isClosed()) {
            $snapshots = LeaderboardSnapshot::withoutGlobalScopes()
                ->where('season_id', $season->id)
                ->get();

            $read = fn (string $board, string $level, string $unit = '') => $snapshots
                ->first(fn (LeaderboardSnapshot $s) => $s->board === $board && $s->level === $level && (string) $s->unit === $unit)
                ?->payload['rows'] ?? [];

            $archivedUnits = $snapshots
                ->where('board', LeaderboardSnapshot::BOARD_SKILL)
                ->pluck('unit')
                ->filter(fn ($u) => $u !== '')
                ->unique()
                ->values()
                ->all();

            $unit = $archivedUnits[0] ?? null;

            return [
                'archived' => true,
                'units' => $archivedUnits,
                'unit' => $unit,
                'consistency' => [
                    'individual' => $read(LeaderboardSnapshot::BOARD_CONSISTENCY, LeaderboardSnapshot::LEVEL_INDIVIDUAL),
                    'department' => $read(LeaderboardSnapshot::BOARD_CONSISTENCY, LeaderboardSnapshot::LEVEL_DEPARTMENT),
                ],
                'skill' => [
                    'individual' => $unit === null ? [] : $read(LeaderboardSnapshot::BOARD_SKILL, LeaderboardSnapshot::LEVEL_INDIVIDUAL, $unit),
                    'department' => $unit === null ? [] : $read(LeaderboardSnapshot::BOARD_SKILL, LeaderboardSnapshot::LEVEL_DEPARTMENT, $unit),
                ],
            ];
        }

        $unit = $units[0] ?? null;

        return [
            'archived' => false,
            'units' => $units,
            'unit' => $unit,
            'consistency' => [
                'individual' => $this->consistencyBoard($season, LeaderboardSnapshot::LEVEL_INDIVIDUAL),
                'department' => $this->consistencyBoard($season, LeaderboardSnapshot::LEVEL_DEPARTMENT),
            ],
            'skill' => [
                'individual' => $unit === null ? [] : $this->skillBoard($season, LeaderboardSnapshot::LEVEL_INDIVIDUAL, $unit),
                'department' => $unit === null ? [] : $this->skillBoard($season, LeaderboardSnapshot::LEVEL_DEPARTMENT, $unit),
            ],
        ];
    }

    /**
     * لوحة الشركة المختصرة لبطاقات لوحات التحكم — **مواظبة** (الفعاليات
     * المكتملة بحضور) لا مجرد عدد الانضمامات، وإسناد الإدارة وقت الفعالية،
     * وبلا أي مقارنة عبر الشركات.
     *
     * @return array{top_employees: array<int, array<string, mixed>>, top_departments: array<int, array<string, mixed>>, top_communities: array<int, array<string, mixed>>, period: array{from: string, to: string}}
     */
    public function companyOverview(int $companyId, ?Carbon $from = null, ?Carbon $to = null): array
    {
        $from ??= Carbon::now()->startOfMonth();
        $to ??= Carbon::now()->endOfMonth();

        $rows = DB::table('event_participants')
            ->join('events', 'events.id', '=', 'event_participants.event_id')
            ->where('events.company_id', $companyId)
            ->whereNotNull('events.completed_at')
            ->whereBetween('events.completed_at', [$from, $to])
            ->where('event_participants.seat_status', 'reserved')
            ->where('event_participants.attendance_status', AttendanceService::ATTENDED)
            ->select([
                'event_participants.employee_id',
                'events.id as event_id',
                'events.starts_at',
                'events.completed_at',
                'events.community_id',
            ])
            ->get();

        $employees = $this->employeeMap($rows->pluck('employee_id')->unique()->all());
        $resolver = $this->departmentResolver($rows->pluck('employee_id')->unique()->all());
        $points = $this->pointsPerAttendance();

        $topEmployees = [];
        foreach ($rows->groupBy('employee_id') as $employeeId => $group) {
            $employee = $employees[(int) $employeeId] ?? null;
            $department = $resolver((int) $employeeId, $group->first()->starts_at ?? $group->first()->completed_at);

            $topEmployees[] = [
                'id' => (int) $employeeId,
                'name' => $employee?->name,
                'avatar' => $employee?->avatar,
                'department_name' => $department === null ? null : ($this->departmentMap([$department])[$department]->name ?? null),
                'events_count' => $group->count(),
                'points' => $group->count() * $points,
            ];
        }
        usort($topEmployees, fn ($a, $b) => $b['events_count'] <=> $a['events_count']);

        $departmentBuckets = [];
        foreach ($rows as $row) {
            $departmentId = $resolver((int) $row->employee_id, $row->starts_at ?? $row->completed_at);
            $key = $departmentId ?? 0;
            $departmentBuckets[$key] ??= ['department_id' => $departmentId, 'events_count' => 0];
            $departmentBuckets[$key]['events_count']++;
        }
        $departments = $this->departmentMap(array_filter(array_column($departmentBuckets, 'department_id')));
        $topDepartments = [];
        foreach ($departmentBuckets as $bucket) {
            $topDepartments[] = [
                'id' => $bucket['department_id'] ?? 0,
                'name' => $bucket['department_id'] === null
                    ? 'بلا إدارة'
                    : ($departments[$bucket['department_id']]->name ?? 'بلا إدارة'),
                'events_count' => $bucket['events_count'],
            ];
        }
        usort($topDepartments, fn ($a, $b) => $b['events_count'] <=> $a['events_count']);

        $communityCounts = DB::table('events')
            ->where('company_id', $companyId)
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$from, $to])
            ->select('community_id', DB::raw('COUNT(*) as events_count'))
            ->groupBy('community_id')
            ->orderByDesc('events_count')
            ->limit(5)
            ->get();

        $communities = Community::withoutGlobalScopes()
            ->with('category:id,name,icon')
            ->whereIn('id', $communityCounts->pluck('community_id')->filter()->all())
            ->get()
            ->keyBy('id');

        $topCommunities = $communityCounts->map(function ($row) use ($communities) {
            $community = $communities[$row->community_id] ?? null;

            return [
                'id' => (int) $row->community_id,
                'name' => $community?->name,
                'category_name' => $community?->category?->name,
                'category_icon' => $community?->category?->icon,
                'events_count' => (int) $row->events_count,
            ];
        })->all();

        return [
            'top_employees' => array_slice($topEmployees, 0, 5),
            'top_departments' => array_slice($topDepartments, 0, 5),
            'top_communities' => $topCommunities,
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
        ];
    }

    // ── أدوات ────────────────────────────────────────────────────────────

    /**
     * ترتيب مع تعادل: نفس القيمة = نفس المرتبة (1,1,3 لا 1,2,3).
     *
     * @param  array<int, array<string, mixed>>  $rows
     * @return array<int, array<string, mixed>>
     */
    private function rank(array $rows, string $key, bool $descending, ?string $tiebreak = null): array
    {
        usort($rows, function ($a, $b) use ($key, $descending, $tiebreak) {
            $comparison = $a[$key] <=> $b[$key];

            if ($comparison !== 0) {
                return $descending ? -$comparison : $comparison;
            }

            if ($tiebreak !== null) {
                return (string) ($a[$tiebreak] ?? '') <=> (string) ($b[$tiebreak] ?? '');
            }

            return 0;
        });

        $rank = 0;
        $seen = 0;
        $previous = null;

        foreach ($rows as $index => $row) {
            $seen++;

            if ($previous === null || $row[$key] != $previous) {
                $rank = $seen;
                $previous = $row[$key];
            }

            $rows[$index]['rank'] = $rank;
        }

        return $rows;
    }

    /**
     * @param  array<int, mixed>  $ids
     * @return array<int, Employee>
     */
    private function employeeMap(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        return Employee::withoutGlobalScopes()
            ->whereIn('id', $ids)
            ->get(['id', 'name', 'avatar'])
            ->keyBy('id')
            ->all();
    }

    /**
     * @param  array<int, mixed>  $ids
     * @return array<int, Department>
     */
    private function departmentMap(array $ids): array
    {
        $ids = array_values(array_filter($ids));

        if ($ids === []) {
            return [];
        }

        return Department::withoutGlobalScopes()
            ->whereIn('id', $ids)
            ->get(['id', 'name'])
            ->keyBy('id')
            ->all();
    }

    /**
     * @param  array<int, mixed>  $eventIds
     * @return array<int, mixed>
     */
    private function eventTimes(array $eventIds): array
    {
        if ($eventIds === []) {
            return [];
        }

        return DB::table('events')
            ->whereIn('id', $eventIds)
            ->pluck(DB::raw('COALESCE(starts_at, completed_at)'), 'id')
            ->map(fn ($value) => $value)
            ->all();
    }

    /**
     * مُحلِّل الإدارة **وقت الفعالية** (H §5/§13) بلا N+1: فترات
     * `department_history` تُحمَّل مرة واحدة وتُقرأ من الذاكرة.
     *
     * @param  array<int, mixed>  $employeeIds
     * @return callable(int, mixed): ?int
     */
    private function departmentResolver(array $employeeIds): callable
    {
        $intervals = [];

        if ($employeeIds !== []) {
            $rows = DB::table('department_history')
                ->whereIn('employee_id', $employeeIds)
                ->orderBy('employee_id')
                ->orderByDesc('started_at')
                ->orderByDesc('id')
                ->get(['employee_id', 'department_id', 'started_at', 'ended_at']);

            foreach ($rows as $row) {
                $intervals[(int) $row->employee_id][] = $row;
            }
        }

        return function (int $employeeId, mixed $at) use ($intervals): ?int {
            $moment = $at === null ? Carbon::now() : Carbon::parse($at);
            $stamp = $moment->format('Y-m-d H:i:s');

            foreach ($intervals[$employeeId] ?? [] as $interval) {
                $started = (string) $interval->started_at;

                if ($started > $stamp) {
                    continue;
                }

                if ($interval->ended_at !== null && (string) $interval->ended_at <= $stamp) {
                    continue;
                }

                return $interval->department_id === null ? null : (int) $interval->department_id;
            }

            return null;
        };
    }
}
