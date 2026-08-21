<?php

namespace App\Services\Competition;

use App\Models\Community;
use App\Models\LeaderboardSnapshot;
use App\Models\Season;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Support\Competition\MeasurementUnits;
use DateTimeInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * المواسم (H §13).
 *
 * - الافتراضي **موسم ربع سنوي يُنشأ تلقائياً لكل مجتمع** بمفتاح فترة
 *   (`2026-Q3`) يجعل الإنشاء idempotent مهما تكرر تشغيل المهمة.
 * - القائد أو أدمن تيمات يستطيعان إنشاء مواسم مخصصة (صلاحية `season.manage`).
 * - عند الإغلاق: **تُؤرشف اللوحة كنسخة نهائية ثابتة، ولا تُحذف أي نتيجة**،
 *   والموسم الجديد يبدأ بترتيب صفري (كل استعلامات اللوحة محصورة بموسمها).
 * - كل نتيجة تبقى مرتبطة بموسمها دائماً — القيد الأجنبي `restrictOnDelete`.
 *
 * قرار تفسيري: **لا تتداخل مواسم مجتمع واحد**؛ يبقى «أي موسم تنتمي إليه هذه
 * النتيجة» سؤالاً له جواب واحد. الموسم المخصص الذي يغطي فترة يمنع توليد
 * الموسم التلقائي فيها.
 */
class SeasonService
{
    public function __construct(private BoardService $boards) {}

    /**
     * الموسم الذي يغطي هذا التاريخ في هذا المجتمع، ويُنشأ الموسم الربعي
     * تلقائياً إن لم يوجد — الاستدعاء الكسول الذي يضمن أن كل نتيجة تجد موسمها.
     */
    public function seasonFor(Community $community, ?DateTimeInterface $at = null): Season
    {
        $at = $at !== null ? Carbon::instance(Carbon::parse($at)) : Carbon::now();

        $existing = $this->findCovering($community, $at);

        if ($existing !== null) {
            return $existing;
        }

        return $this->ensureQuarterlySeason($community, $at);
    }

    /**
     * الموسم المغطي لتاريخ (بلا إنشاء).
     */
    public function findCovering(Community $community, DateTimeInterface $at): ?Season
    {
        $date = Carbon::parse($at)->toDateString();

        return Season::withoutGlobalScopes()
            ->where('community_id', $community->id)
            ->whereDate('starts_on', '<=', $date)
            ->whereDate('ends_on', '>=', $date)
            ->orderByDesc('id')
            ->first();
    }

    /**
     * الموسم النشط الحالي للمجتمع (بلا إنشاء).
     */
    public function activeSeason(Community $community): ?Season
    {
        return Season::withoutGlobalScopes()
            ->where('community_id', $community->id)
            ->where('status', Season::STATUS_ACTIVE)
            ->orderByDesc('starts_on')
            ->first();
    }

    /**
     * إنشاء الموسم الربعي للفترة التي يقع فيها التاريخ — idempotent بمفتاح
     * (المجتمع + `Y-Qn`).
     */
    public function ensureQuarterlySeason(Community $community, ?DateTimeInterface $at = null): Season
    {
        $at = $at !== null ? Carbon::parse($at) : Carbon::now();

        $quarter = (int) ceil($at->month / 3);
        $periodKey = $at->year.'-Q'.$quarter;

        $existing = Season::withoutGlobalScopes()
            ->where('community_id', $community->id)
            ->where('period_key', $periodKey)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $startsOn = Carbon::create($at->year, ($quarter - 1) * 3 + 1, 1)->startOfDay();
        $endsOn = $startsOn->copy()->addMonths(3)->subDay();

        // موسم قائم يغطي التاريخ نفسه = لا حاجة لموسم جديد.
        $covering = $this->findCovering($community, $at);

        if ($covering !== null) {
            return $covering;
        }

        // موسم مخصص يقتطع جزءاً من الربع: يُقلَّص الموسم التلقائي إلى الفجوة
        // الحرة المحيطة بالتاريخ فقط — «لا تتداخل مواسم المجتمع الواحد» تبقى
        // قاعدة، ولا يبقى يوم بلا موسم في المقابل.
        $before = Season::withoutGlobalScopes()
            ->where('community_id', $community->id)
            ->whereDate('ends_on', '<', $at->toDateString())
            ->whereDate('ends_on', '>=', $startsOn->toDateString())
            ->orderByDesc('ends_on')
            ->first();

        if ($before !== null) {
            $startsOn = Carbon::parse($before->ends_on)->addDay()->startOfDay();
        }

        $after = Season::withoutGlobalScopes()
            ->where('community_id', $community->id)
            ->whereDate('starts_on', '>', $at->toDateString())
            ->whereDate('starts_on', '<=', $endsOn->toDateString())
            ->orderBy('starts_on')
            ->first();

        if ($after !== null) {
            $endsOn = Carbon::parse($after->starts_on)->subDay()->startOfDay();
        }

        return Season::withoutGlobalScopes()->create([
            'company_id' => $community->company_id,
            'community_id' => $community->id,
            'category_id' => $community->category_id,
            'name' => "الربع {$this->quarterName($quarter)} {$at->year}",
            'starts_on' => $startsOn->toDateString(),
            'ends_on' => $endsOn->toDateString(),
            'status' => Season::STATUS_ACTIVE,
            'period_key' => $periodKey,
            'is_auto' => true,
        ]);
    }

    /**
     * موسم مخصص من القائد أو أدمن تيمات (H §13).
     */
    public function createCustom(
        Community $community,
        string $name,
        DateTimeInterface $startsOn,
        DateTimeInterface $endsOn,
        ?User $actor = null,
    ): Season {
        $start = Carbon::parse($startsOn)->startOfDay();
        $end = Carbon::parse($endsOn)->startOfDay();

        if ($end->lt($start)) {
            throw new RuntimeException('تاريخ نهاية الموسم قبل بدايته.');
        }

        $overlapping = Season::withoutGlobalScopes()
            ->where('community_id', $community->id)
            ->whereDate('starts_on', '<=', $end->toDateString())
            ->whereDate('ends_on', '>=', $start->toDateString())
            ->exists();

        if ($overlapping) {
            throw new RuntimeException('يوجد موسم يغطي هذه الفترة — لا تتداخل مواسم المجتمع الواحد.');
        }

        $season = Season::withoutGlobalScopes()->create([
            'company_id' => $community->company_id,
            'community_id' => $community->id,
            'category_id' => $community->category_id,
            'name' => $name,
            'starts_on' => $start->toDateString(),
            'ends_on' => $end->toDateString(),
            'status' => Season::STATUS_ACTIVE,
            'period_key' => null,
            'is_auto' => false,
        ]);

        ActivityLogService::log(
            $community->company_id,
            $season,
            'season_created',
            "أُنشئ موسم مخصص «{$name}» لمجتمع «{$community->name}» ({$start->toDateString()} — {$end->toDateString()}).",
            ['community_id' => $community->id, 'season_id' => $season->id],
            actorUserId: $actor?->id,
            actorName: $actor?->name,
        );

        return $season;
    }

    /**
     * إغلاق الموسم: أرشفة اللوحات نسخاً نهائية ثابتة ثم ختم الحالة.
     * **لا تُحذف نتيجة واحدة** — النتائج تبقى مرتبطة بموسمها إلى الأبد.
     *
     * @return array<int, LeaderboardSnapshot>
     */
    public function close(Season $season, ?User $actor = null): array
    {
        if ($season->isClosed()) {
            return $season->snapshots()->withoutGlobalScopes()->get()->all();
        }

        return DB::transaction(function () use ($season, $actor) {
            $snapshots = $this->archive($season);

            $season->forceFill([
                'status' => Season::STATUS_CLOSED,
                'closed_at' => now(),
                'closed_by_user_id' => $actor?->id,
            ])->save();

            ActivityLogService::log(
                $season->company_id,
                $season,
                'season_closed',
                "أُغلق موسم «{$season->name}» وأُرشفت لوحاته نسخاً نهائية ثابتة — لم تُحذف أي نتيجة، والموسم التالي يبدأ من الصفر.",
                [
                    'season_id' => $season->id,
                    'community_id' => $season->community_id,
                    'snapshots' => count($snapshots),
                ],
                actorUserId: $actor?->id,
                actorName: $actor?->name,
            );

            return $snapshots;
        });
    }

    /**
     * أرشفة اللوحات الأربع (مهارة/مواظبة × فردي/إدارة) — لوحة مهارة لكل وحدة
     * قياس مستعملة في الموسم، لأن الثواني لا تُقارن بالأمتار.
     *
     * @return array<int, LeaderboardSnapshot>
     */
    public function archive(Season $season): array
    {
        $snapshots = [];
        $generatedAt = now();

        foreach ([LeaderboardSnapshot::LEVEL_INDIVIDUAL, LeaderboardSnapshot::LEVEL_DEPARTMENT] as $level) {
            $snapshots[] = $this->writeSnapshot(
                $season,
                LeaderboardSnapshot::BOARD_CONSISTENCY,
                $level,
                '',
                $this->boards->consistencyBoard($season, $level),
                $generatedAt,
            );
        }

        foreach ($this->boards->unitsUsedIn($season) as $unit) {
            foreach ([LeaderboardSnapshot::LEVEL_INDIVIDUAL, LeaderboardSnapshot::LEVEL_DEPARTMENT] as $level) {
                $snapshots[] = $this->writeSnapshot(
                    $season,
                    LeaderboardSnapshot::BOARD_SKILL,
                    $level,
                    $unit,
                    $this->boards->skillBoard($season, $level, $unit),
                    $generatedAt,
                );
            }
        }

        return array_values(array_filter($snapshots));
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function writeSnapshot(Season $season, string $board, string $level, string $unit, array $rows, Carbon $generatedAt): ?LeaderboardSnapshot
    {
        $existing = LeaderboardSnapshot::withoutGlobalScopes()
            ->where('season_id', $season->id)
            ->where('board', $board)
            ->where('level', $level)
            ->where('unit', $unit)
            ->first();

        // النسخة النهائية لا تُكتب مرتين ولا تُعدَّل.
        if ($existing !== null) {
            return $existing;
        }

        return LeaderboardSnapshot::withoutGlobalScopes()->create([
            'company_id' => $season->company_id,
            'community_id' => $season->community_id,
            'season_id' => $season->id,
            'board' => $board,
            'level' => $level,
            'unit' => $unit,
            'payload' => [
                'season' => [
                    'id' => $season->id,
                    'name' => $season->name,
                    'starts_on' => $season->starts_on?->toDateString(),
                    'ends_on' => $season->ends_on?->toDateString(),
                ],
                'board' => $board,
                'level' => $level,
                'unit' => $unit,
                'unit_label' => $unit === '' ? null : MeasurementUnits::label($unit),
                'rows' => $rows,
            ],
            'generated_at' => $generatedAt,
            'created_at' => $generatedAt,
        ]);
    }

    /**
     * المواسم التي انقضى تاريخ نهايتها وما زالت نشطة — تُغلقها المهمة اليومية.
     *
     * @return Collection<int, Season>
     */
    public function seasonsDueForClose(?DateTimeInterface $at = null)
    {
        $date = Carbon::parse($at ?? now())->toDateString();

        return Season::withoutGlobalScopes()
            ->where('status', Season::STATUS_ACTIVE)
            ->whereDate('ends_on', '<', $date)
            ->orderBy('id')
            ->get();
    }

    private function quarterName(int $quarter): string
    {
        return match ($quarter) {
            1 => 'الأول',
            2 => 'الثاني',
            3 => 'الثالث',
            default => 'الرابع',
        };
    }
}
