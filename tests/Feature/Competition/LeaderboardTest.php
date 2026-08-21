<?php

use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Services\Attendance\AttendanceService;
use App\Services\Competition\BoardService;
use App\Services\Competition\ResultService;
use App\Services\Competition\SeasonService;
use Illuminate\Support\Facades\DB;

// H §13: لوحتان فقط — مهارة (نتائج القيمة الفردية) ومواظبة (الفعاليات
// المكتملة بحضور، نقاط من أول مشاركة)، كل منهما فردياً وعلى مستوى الإدارة
// **بإسناد الإدارة وقت الفعالية**. الغائب خارج المواظبة. لا مقارنة بين شركات.

it('builds the consistency board from attended completed events with points from the first participation', function () {
    $context = a12CompletedEvent(participants: 2);
    [$first, $second] = $context['employees'];

    a12ExtraCompletedEvent($context['community'], [$first]);

    $season = app(SeasonService::class)->seasonFor($context['community'], $context['event']->completed_at);
    $board = app(BoardService::class)->consistencyBoard($season, 'individual');

    expect($board)->toHaveCount(2)
        ->and($board[0]['employee_id'])->toBe($first->id)
        ->and($board[0]['events_count'])->toBe(2)
        ->and($board[0]['points'])->toBe(2)
        ->and($board[0]['rank'])->toBe(1)
        ->and($board[1]['employee_id'])->toBe($second->id)
        ->and($board[1]['points'])->toBe(1)
        ->and($board[1]['rank'])->toBe(2)
        // نقاط من أول مشاركة — لحظة دخول الموظف اللوحة محفوظة.
        ->and($board[1]['first_participation_at'])->not->toBeNull();
});

it('drops an absent participant out of the consistency board entirely', function () {
    $context = a12CompletedEvent(participants: 2);
    $season = app(SeasonService::class)->seasonFor($context['community'], $context['event']->completed_at);
    $boards = app(BoardService::class);

    expect($boards->consistencyBoard($season, 'individual'))->toHaveCount(2);

    app(AttendanceService::class)->mark(
        $context['event'],
        $context['employees'][1],
        AttendanceService::ABSENT,
        $context['leaderUser'],
        $context['leader'],
        'لم يحضر',
    );

    $board = $boards->consistencyBoard($season, 'individual');

    expect($board)->toHaveCount(1)
        ->and($board[0]['employee_id'])->toBe($context['employees'][0]->id);
});

it('attributes the department board to the department at event time, not the current one', function () {
    $context = a12CompletedEvent(participants: 1);
    $employee = $context['employees'][0];

    $old = Department::create(['company_id' => $context['company']->id, 'name' => 'الإدارة القديمة']);
    $new = Department::create(['company_id' => $context['company']->id, 'name' => 'الإدارة الجديدة']);

    // الموظف كان في القديمة وقت الفعالية، ثم انتقل للجديدة بعدها.
    DB::table('department_history')->where('employee_id', $employee->id)->delete();
    DB::table('department_history')->insert([
        [
            'company_id' => $context['company']->id,
            'employee_id' => $employee->id,
            'department_id' => $old->id,
            'started_at' => now()->subYear(),
            'ended_at' => now()->subHour(),
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'company_id' => $context['company']->id,
            'employee_id' => $employee->id,
            'department_id' => $new->id,
            'started_at' => now()->subHour(),
            'ended_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);

    $employee->forceFill(['department_id' => $new->id])->saveQuietly();

    $season = app(SeasonService::class)->seasonFor($context['community'], $context['event']->completed_at);
    $board = app(BoardService::class)->consistencyBoard($season, 'department');

    expect($board)->toHaveCount(1)
        ->and($board[0]['department_id'])->toBe($old->id)
        ->and($board[0]['name'])->toBe('الإدارة القديمة');
});

it('keeps the rank after the member leaves the community', function () {
    $context = a12CompletedEvent(participants: 2);
    $leaver = $context['employees'][0];

    CommunityMember::query()
        ->where('community_id', $context['community']->id)
        ->where('employee_id', $leaver->id)
        ->update(['status' => CommunityMember::STATUS_LEFT, 'left_at' => now()]);

    $season = app(SeasonService::class)->seasonFor($context['community'], $context['event']->completed_at);
    $board = app(BoardService::class)->consistencyBoard($season, 'individual');

    expect(collect($board)->pluck('employee_id')->all())->toContain($leaver->id);
});

it('ranks the skill board by the unit direction — lower is better for time, higher for distance', function () {
    $context = a12CompletedEvent(participants: 2);
    [$fast, $slow] = $context['employees'];
    $results = app(ResultService::class);

    $results->record($context['event'], $fast, 'seconds', 58.2, $context['leaderUser']);
    $results->record($context['event'], $slow, 'seconds', 61.9, $context['leaderUser']);

    $season = app(SeasonService::class)->seasonFor($context['community'], $context['event']->completed_at);
    $boards = app(BoardService::class);

    $timeBoard = $boards->skillBoard($season, 'individual', 'seconds');
    expect($timeBoard[0]['employee_id'])->toBe($fast->id)
        ->and($timeBoard[0]['best_value'])->toBe(58.2)
        ->and($timeBoard[0]['rank'])->toBe(1);

    // لوحة لكل وحدة — الثواني لا تُقارن بالأمتار.
    $second = a12ExtraCompletedEvent($context['community'], [$fast, $slow]);
    $results->record($second, $fast, 'meters', 10, $context['leaderUser']);
    $results->record($second, $slow, 'meters', 40, $context['leaderUser']);

    expect($boards->unitsUsedIn($season))->toBe(['meters', 'seconds']);

    $distanceBoard = $boards->skillBoard($season, 'individual', 'meters');
    expect($distanceBoard[0]['employee_id'])->toBe($slow->id)
        ->and($distanceBoard[0]['best_value'])->toBe(40.0);
});

it('builds the skill board at department level from the best value in each department', function () {
    $context = a12CompletedEvent(participants: 2);
    [$one, $two] = $context['employees'];

    $sales = Department::create(['company_id' => $context['company']->id, 'name' => 'المبيعات']);
    $tech = Department::create(['company_id' => $context['company']->id, 'name' => 'التقنية']);

    // الإسناد وقت الفعالية: تُكتب فترات department_history تغطي لحظة البدء.
    foreach ([[$one, $sales], [$two, $tech]] as [$employee, $department]) {
        DB::table('department_history')->where('employee_id', $employee->id)->delete();
        DB::table('department_history')->insert([
            'company_id' => $context['company']->id,
            'employee_id' => $employee->id,
            'department_id' => $department->id,
            'started_at' => now()->subYear(),
            'ended_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    $results = app(ResultService::class);
    $results->record($context['event'], $one, 'meters', 12, $context['leaderUser']);
    $results->record($context['event'], $two, 'meters', 30, $context['leaderUser']);

    $season = app(SeasonService::class)->seasonFor($context['community'], $context['event']->completed_at);
    $board = app(BoardService::class)->skillBoard($season, 'department', 'meters');

    expect($board)->toHaveCount(2)
        ->and($board[0]['department_id'])->toBe($tech->id)
        ->and($board[0]['best_value'])->toBe(30.0)
        ->and($board[1]['department_id'])->toBe($sales->id);
});

it('never mixes two companies into one board or one company overview', function () {
    $contextA = a12CompletedEvent(participants: 1);
    $contextB = a12CompletedEvent(participants: 1);

    $seasonA = app(SeasonService::class)->seasonFor($contextA['community'], $contextA['event']->completed_at);
    $boards = app(BoardService::class);

    $ids = collect($boards->consistencyBoard($seasonA, 'individual'))->pluck('employee_id');

    expect($ids->all())->toBe([$contextA['employees'][0]->id]);

    $overview = $boards->companyOverview($contextA['company']->id);
    expect(collect($overview['top_employees'])->pluck('id')->all())
        ->toBe([$contextA['employees'][0]->id])
        ->and(collect($overview['top_communities'])->pluck('id')->all())
        ->toBe([$contextA['community']->id]);
});

it('bases the company overview on attendance, not on joining', function () {
    $context = a12CompletedEvent(participants: 2);
    $boards = app(BoardService::class);

    expect($boards->companyOverview($context['company']->id)['top_employees'])->toHaveCount(2);

    app(AttendanceService::class)->mark(
        $context['event'],
        $context['employees'][1],
        AttendanceService::ABSENT,
        $context['leaderUser'],
        $context['leader'],
        'غاب',
    );

    $overview = $boards->companyOverview($context['company']->id);

    expect($overview['top_employees'])->toHaveCount(1)
        ->and($overview['top_employees'][0]['id'])->toBe($context['employees'][0]->id);
});

it('renders the employee leaderboards page with a season selector', function () {
    $context = a12CompletedEvent(participants: 1);

    $this->actingAs($context['employees'][0]->fresh(), 'employee')
        ->get('/employee/leaderboards')
        ->assertOk();

    // القائد يرى أدوات إدارة المواسم.
    $this->actingAs($context['leader'], 'employee')
        ->get('/employee/leaderboards')
        ->assertOk();
});

it('ties on equal points share the same rank', function () {
    $context = a12CompletedEvent(participants: 2);
    $season = app(SeasonService::class)->seasonFor($context['community'], $context['event']->completed_at);

    $board = app(BoardService::class)->consistencyBoard($season, 'individual');

    expect($board[0]['rank'])->toBe(1)
        ->and($board[1]['rank'])->toBe(1);
});

it('excludes results of another season from a season board — a new season starts at zero', function () {
    $context = a12CompletedEvent(participants: 1);
    $seasons = app(SeasonService::class);

    $current = $seasons->seasonFor($context['community'], $context['event']->completed_at);
    app(ResultService::class)->record($context['event'], $context['employees'][0], 'meters', 25, $context['leaderUser']);

    $next = $seasons->createCustom(
        $context['community'],
        'الموسم التالي',
        $current->ends_on->copy()->addDay(),
        $current->ends_on->copy()->addMonths(3),
    );

    $boards = app(BoardService::class);

    expect($boards->skillBoard($current, 'individual', 'meters'))->toHaveCount(1)
        ->and($boards->skillBoard($next, 'individual'))->toBe([])
        ->and($boards->consistencyBoard($next, 'individual'))->toBe([]);
});

it('shows a completed event with an unassigned department under «بلا إدارة»', function () {
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $employee = Employee::factory()->create(['company_id' => $company->id, 'department_id' => null]);
    $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);

    a12ExtraCompletedEvent($community, [$employee]);

    $season = app(SeasonService::class)->seasonFor($community);
    $board = app(BoardService::class)->consistencyBoard($season, 'department');

    expect($board)->toHaveCount(1)
        ->and($board[0]['department_id'])->toBeNull()
        ->and($board[0]['name'])->toBe('بلا إدارة');
});
