<?php

use App\Enums\Role;
use App\Models\ActivityLog;
use App\Models\Community;
use App\Models\CompetitionResult;
use App\Models\CompetitionResultChange;
use App\Models\Employee;
use App\Models\JobRun;
use App\Models\LeaderboardSnapshot;
use App\Models\RoleAssignment;
use App\Models\Season;
use App\Services\Attendance\AttendanceService;
use App\Services\Competition\BoardService;
use App\Services\Competition\ResultService;
use App\Services\Competition\SeasonService;
use Illuminate\Database\QueryException;

// H §13: نوعا قياس فقط (قيمة فردية · مواظبة)؛ الإدخال من القائد أو المنسّق؛
// التصحيح يحتاج صلاحية + سبباً + تدقيقاً + إعادة احتساب. المواسم ربعية
// تلقائياً، وإغلاقها يؤرشف اللوحة نسخة نهائية ثابتة بلا حذف أي نتيجة.

it('creates the quarterly season automatically and keeps creation idempotent', function () {
    $community = Community::factory()->create();
    $service = app(SeasonService::class);

    $first = $service->ensureQuarterlySeason($community, now());
    $second = $service->ensureQuarterlySeason($community, now());

    $quarter = (int) ceil(now()->month / 3);

    expect($second->id)->toBe($first->id)
        ->and($first->is_auto)->toBeTrue()
        ->and($first->period_key)->toBe(now()->year.'-Q'.$quarter)
        ->and($first->starts_on->month)->toBe(($quarter - 1) * 3 + 1)
        ->and(Season::withoutGlobalScopes()->where('community_id', $community->id)->count())->toBe(1);
});

it('opens the quarterly season for every community through the daily job, idempotently', function () {
    Community::factory()->count(3)->create();

    $this->artisan('app:ensure-seasons')->assertSuccessful();
    $this->artisan('app:ensure-seasons')->assertSuccessful();

    expect(Season::withoutGlobalScopes()->count())->toBe(3)
        ->and(JobRun::where('job', 'app:ensure-seasons')->whereNotNull('entity_type')->count())->toBe(3);
});

it('lets the leader create a custom season and refuses an overlapping one', function () {
    $context = a12CompletedEvent();
    $service = app(SeasonService::class);

    $season = $service->createCustom(
        $context['community'],
        'موسم الشتاء',
        now()->addYear()->startOfYear(),
        now()->addYear()->startOfYear()->addMonths(2),
        $context['leaderUser'],
    );

    expect($season->is_auto)->toBeFalse()
        ->and(ActivityLog::where('type', 'season_created')->exists())->toBeTrue();

    expect(fn () => $service->createCustom(
        $context['community'],
        'موسم متداخل',
        now()->addYear()->startOfYear()->addMonth(),
        now()->addYear()->startOfYear()->addMonths(3),
    ))->toThrow(RuntimeException::class, 'لا تتداخل');
});

it('refuses season management from a plain member over http', function () {
    $context = a12CompletedEvent();

    $this->actingAs($context['employees'][0], 'employee')
        ->post("/employee/community/{$context['community']->id}/seasons", [
            'name' => 'موسمي',
            'starts_on' => now()->addYear()->toDateString(),
            'ends_on' => now()->addYear()->addMonth()->toDateString(),
        ])
        ->assertForbidden();
});

it('records an individual-value result keyed to event, participant and season', function () {
    $context = a12CompletedEvent();
    $target = $context['employees'][0];

    $result = app(ResultService::class)->record(
        $context['event'],
        $target,
        'seconds',
        62.5,
        $context['leaderUser'],
    );

    $season = app(SeasonService::class)->seasonFor($context['community'], $context['event']->completed_at);

    expect($result->season_id)->toBe($season->id)
        ->and($result->event_id)->toBe($context['event']->id)
        ->and($result->employee_id)->toBe($target->id)
        ->and($result->measurement_type)->toBe(CompetitionResult::TYPE_INDIVIDUAL_VALUE)
        ->and($result->value_scaled)->toBe(625000)
        ->and($result->value)->toBe(62.5)
        // جاهزية الدوري المؤجل: الحقول العامة مكتوبة من اليوم الأول.
        ->and($result->subject_type)->toBe(CompetitionResult::SUBJECT_EMPLOYEE)
        ->and($result->subject_id)->toBe($target->id)
        ->and($result->source_type)->toBe(CompetitionResult::SOURCE_EVENT)
        ->and($result->source_id)->toBe($context['event']->id);

    expect(ActivityLog::where('type', 'result_recorded')->exists())->toBeTrue();
});

it('supports only the two measurement types and only central catalogue units', function () {
    $context = a12CompletedEvent();
    $service = app(ResultService::class);

    // المواظبة تُحتسب آلياً من الحضور — لا تُدخل يدوياً.
    expect(fn () => $service->record(
        $context['event'], $context['employees'][0], 'count', 3, $context['leaderUser'],
        measurementType: CompetitionResult::TYPE_CONSISTENCY,
    ))->toThrow(RuntimeException::class, 'المواظبة');

    expect(fn () => $service->record(
        $context['event'], $context['employees'][0], 'bananas', 3, $context['leaderUser'],
    ))->toThrow(RuntimeException::class, 'الكتالوج المركزي');

    expect(fn () => $service->record(
        $context['event'], $context['employees'][0], 'meters', 3, $context['leaderUser'],
        measurementType: 'team_score',
    ))->toThrow(RuntimeException::class, 'نوعي قياس');
});

it('refuses result entry from anyone without results.enter, and for an absent participant', function () {
    $context = a12CompletedEvent();
    $service = app(ResultService::class);
    $member = $context['employees'][1]->fresh();

    expect(fn () => $service->record($context['event'], $context['employees'][0], 'meters', 10, $member->user))
        ->toThrow(RuntimeException::class, 'قائد المجتمع أو المنسّق');

    app(AttendanceService::class)->mark(
        $context['event'],
        $context['employees'][0],
        AttendanceService::ABSENT,
        $context['leaderUser'],
        $context['leader'],
        'غاب',
    );

    expect(fn () => $service->record($context['event']->fresh(), $context['employees'][0], 'meters', 10, $context['leaderUser']))
        ->toThrow(RuntimeException::class, 'غائباً');
});

it('requires permission, a reason, an audit trail and a recomputation to correct a result', function () {
    $context = a12CompletedEvent();
    $service = app(ResultService::class);
    $target = $context['employees'][0];

    $result = $service->record($context['event'], $target, 'meters', 100, $context['leaderUser']);

    // مسار الإدخال لا يُستعمل للتعديل.
    expect(fn () => $service->record($context['event'], $target, 'meters', 120, $context['leaderUser']))
        ->toThrow(RuntimeException::class, 'مسار التصحيح');

    // بلا سبب: مرفوض.
    expect(fn () => $service->correct($result, 120, $context['leaderUser'], '   '))
        ->toThrow(RuntimeException::class, 'سبب التصحيح إلزامي');

    // بلا صلاحية: مرفوض.
    $member = $context['employees'][1]->fresh();
    expect(fn () => $service->correct($result, 120, $member->user, 'أريد التغيير'))
        ->toThrow(RuntimeException::class, 'results.correct');

    $outcome = $service->correct($result, 120, $context['leaderUser'], 'خطأ في قراءة الشريط');

    $change = CompetitionResultChange::where('competition_result_id', $result->id)->first();

    expect($outcome['result']->value)->toBe(120.0)
        ->and($change)->not->toBeNull()
        ->and($change->from_value_scaled)->toBe(1000000)
        ->and($change->to_value_scaled)->toBe(1200000)
        ->and($change->reason)->toBe('خطأ في قراءة الشريط')
        ->and(ActivityLog::where('type', 'result_corrected')->exists())->toBeTrue();

    // إعادة احتساب اللوحة تعكس القيمة الجديدة فوراً.
    $row = collect($outcome['boards']['skill']['individual'])->firstWhere('employee_id', $target->id);
    expect($row['best_value'])->toBe(120.0);
});

it('closes a season into an immutable archive, deletes nothing, and starts the next from zero', function () {
    $context = a12CompletedEvent(participants: 2);
    $results = app(ResultService::class);
    $seasons = app(SeasonService::class);

    $results->record($context['event'], $context['employees'][0], 'meters', 100, $context['leaderUser']);
    $results->record($context['event'], $context['employees'][1], 'meters', 80, $context['leaderUser']);

    $season = $seasons->seasonFor($context['community'], $context['event']->completed_at);

    $snapshots = $seasons->close($season, $context['leaderUser']);

    expect($season->fresh()->status)->toBe(Season::STATUS_CLOSED)
        ->and($season->fresh()->closed_at)->not->toBeNull()
        // مواظبة (فردي + إدارة) + مهارة بوحدة واحدة (فردي + إدارة)
        ->and(count($snapshots))->toBe(4)
        ->and(CompetitionResult::withoutGlobalScopes()->count())->toBe(2)
        ->and(ActivityLog::where('type', 'season_closed')->exists())->toBeTrue();

    $skill = LeaderboardSnapshot::withoutGlobalScopes()
        ->where('season_id', $season->id)
        ->where('board', LeaderboardSnapshot::BOARD_SKILL)
        ->where('level', LeaderboardSnapshot::LEVEL_INDIVIDUAL)
        ->first();

    expect($skill->payload['rows'][0]['employee_id'])->toBe($context['employees'][0]->id)
        ->and((float) $skill->payload['rows'][0]['best_value'])->toBe(100.0);

    // النسخة النهائية لا تُعدَّل ولا تُحذف.
    expect(fn () => $skill->forceFill(['unit' => 'seconds'])->save())->toThrow(RuntimeException::class);
    expect(fn () => $skill->delete())->toThrow(RuntimeException::class);

    // الموسم التالي يبدأ بترتيب صفري.
    $next = $seasons->createCustom(
        $context['community'],
        'الموسم التالي',
        $season->ends_on->copy()->addDay(),
        $season->ends_on->copy()->addMonths(3),
    );

    $boards = app(BoardService::class);
    expect($boards->skillBoard($next, 'individual'))->toBe([])
        ->and($boards->consistencyBoard($next, 'individual'))->toBe([]);

    // ولا نتائج جديدة تدخل موسماً مغلقاً.
    expect(fn () => $results->record($context['event']->fresh(), $context['employees'][0], 'meters', 90, $context['leaderUser']))
        ->toThrow(RuntimeException::class, 'الموسم مغلق');
});

it('auto-closes an expired season through the daily job and opens the current quarter', function () {
    $community = Community::factory()->create();

    $expired = app(SeasonService::class)->createCustom(
        $community,
        'موسم منتهٍ',
        now()->subMonths(4),
        now()->subMonths(1),
    );

    $this->artisan('app:ensure-seasons')->assertSuccessful();

    expect($expired->fresh()->status)->toBe(Season::STATUS_CLOSED)
        ->and(LeaderboardSnapshot::withoutGlobalScopes()->where('season_id', $expired->id)->count())->toBeGreaterThan(0)
        ->and(Season::withoutGlobalScopes()
            ->where('community_id', $community->id)
            ->where('status', Season::STATUS_ACTIVE)
            ->count())->toBe(1);
});

it('keeps every result linked to its season forever — the season cannot be deleted under it', function () {
    $context = a12CompletedEvent();
    app(ResultService::class)->record($context['event'], $context['employees'][0], 'meters', 42, $context['leaderUser']);

    $season = app(SeasonService::class)->seasonFor($context['community'], $context['event']->completed_at);

    expect(fn () => $season->delete())->toThrow(QueryException::class);
});

it('records a result through the leader http endpoint and corrects it with a reason', function () {
    $context = a12CompletedEvent();

    $this->actingAs($context['leader'], 'employee')
        ->post("/employee/detail/{$context['event']->id}/results/{$context['employees'][0]->id}", [
            'unit' => 'kilometers',
            'value' => 5.125,
        ])
        ->assertSessionHas('success');

    $result = CompetitionResult::withoutGlobalScopes()->latest('id')->first();
    expect($result->unit)->toBe('kilometers')->and($result->value)->toBe(5.125);

    $this->actingAs($context['leader'], 'employee')
        ->post("/employee/results/{$result->id}/correct", ['value' => 5.5])
        ->assertSessionHasErrors('reason');

    $this->actingAs($context['leader'], 'employee')
        ->post("/employee/results/{$result->id}/correct", [
            'value' => 5.5,
            'reason' => 'قراءة الساعة الرسمية',
        ])
        ->assertSessionHas('success');

    expect($result->fresh()->value)->toBe(5.5);
});

it('grants season.manage to the leader and platform admin only', function () {
    expect(Role::CommunityLeader->hasPermission('season.manage'))->toBeTrue()
        ->and(Role::PlatformAdmin->hasPermission('season.manage'))->toBeTrue()
        ->and(Role::Coordinator->hasPermission('season.manage'))->toBeFalse()
        ->and(Role::Employee->hasPermission('season.manage'))->toBeFalse()
        ->and(Role::Coordinator->hasPermission('results.correct'))->toBeTrue()
        ->and(Role::Employee->hasPermission('results.correct'))->toBeFalse();
});

it('lets a coordinator enter results on the community scope', function () {
    $context = a12CompletedEvent();

    $coordinator = Employee::factory()->create(['company_id' => $context['company']->id])->fresh();
    $coordinator->user->assignRole(Role::Coordinator, RoleAssignment::SCOPE_COMMUNITY, $context['community']->id);

    $result = app(ResultService::class)->record(
        $context['event'],
        $context['employees'][0],
        'repetitions',
        30,
        $coordinator->user->fresh(),
    );

    expect($result->value)->toBe(30.0);
});
