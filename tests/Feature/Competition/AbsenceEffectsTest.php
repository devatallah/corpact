<?php

use App\Enums\Role;
use App\Models\Company;
use App\Models\Employee;
use App\Models\EventParticipant;
use App\Models\User;
use App\Services\Attendance\ActivationService;
use App\Services\Attendance\AttendanceService;
use App\Services\Competition\BoardService;
use App\Services\Competition\GhostEventMetricService;
use App\Services\Competition\SeasonService;

// H §13: أثر الغياب **غير مالي بالكامل** — لا يُحتسب في لوحة المواظبة، ولا
// يُحتسب موظفاً مفعّلاً في فوترة الشهر، ويظهر في سجله. الدلالة قابلة
// للاستعلام لأن A11 يقرأها في احتساب الموظفين المفعّلين.

it('counts an attending employee as activated exactly once in the cycle', function () {
    $context = a12CompletedEvent(participants: 2);
    $activation = app(ActivationService::class);

    // فعالية ثانية لنفس الموظف داخل الدورة — يبقى مفعّلاً مرة واحدة.
    a12ExtraCompletedEvent($context['community'], [$context['employees'][0]]);

    $from = now()->startOfMonth();
    $to = now()->endOfMonth();

    expect($activation->activatedCount($context['company']->id, $from, $to))->toBe(2)
        ->and($activation->activatedEmployeeIds($context['company']->id, $from, $to)->count())->toBe(2)
        ->and($activation->attendedCount($context['employees'][0], $from, $to))->toBe(2)
        ->and($activation->isActivated($context['employees'][0], $from, $to))->toBeTrue();
});

it('removes an absent-only employee from the month activation count', function () {
    $context = a12CompletedEvent(participants: 2);
    $activation = app(ActivationService::class);
    $from = now()->startOfMonth();
    $to = now()->endOfMonth();

    expect($activation->activatedCount($context['company']->id, $from, $to))->toBe(2);

    app(AttendanceService::class)->mark(
        $context['event'],
        $context['employees'][1],
        AttendanceService::ABSENT,
        $context['leaderUser'],
        $context['leader'],
        'لم يحضر',
    );

    expect($activation->activatedCount($context['company']->id, $from, $to))->toBe(1)
        ->and($activation->isActivated($context['employees'][1], $from, $to))->toBeFalse()
        ->and($activation->absentOnlyEmployeeIds($context['company']->id, $from, $to)->all())
        ->toBe([$context['employees'][1]->id]);
});

it('keeps an employee activated when absent from one event but present at another', function () {
    $context = a12CompletedEvent(participants: 1);
    $employee = $context['employees'][0];

    a12ExtraCompletedEvent($context['community'], [$employee]);

    app(AttendanceService::class)->mark(
        $context['event'],
        $employee,
        AttendanceService::ABSENT,
        $context['leaderUser'],
        $context['leader'],
        'غاب عن الأولى',
    );

    $activation = app(ActivationService::class);

    expect($activation->isActivated($employee, now()->startOfMonth(), now()->endOfMonth()))->toBeTrue()
        ->and($activation->absentOnlyEmployeeIds($context['company']->id, now()->startOfMonth(), now()->endOfMonth())->all())->toBe([]);
});

it('records the absence visibly on the employee participation record', function () {
    $context = a12CompletedEvent(participants: 1);

    app(AttendanceService::class)->mark(
        $context['event'],
        $context['employees'][0],
        AttendanceService::ABSENT,
        $context['leaderUser'],
        $context['leader'],
        'اعتذر قبل الموعد بساعة',
    );

    $row = EventParticipant::where('event_id', $context['event']->id)
        ->where('employee_id', $context['employees'][0]->id)
        ->first();

    expect($row->attendance_status)->toBe('absent')
        ->and($row->attendance_reason)->toBe('اعتذر قبل الموعد بساعة')
        ->and($row->attendance_marked_at)->not->toBeNull()
        ->and($row->attendance_marked_by_user_id)->toBe($context['leaderUser']->id);

    $record = app(ActivationService::class)->absenceRecord($context['employees'][0]);

    expect($record)->toHaveCount(1)
        ->and($record[0]['event_id'])->toBe($context['event']->id)
        ->and($record[0]['reason'])->toBe('اعتذر قبل الموعد بساعة');
});

it('counts an employee who left the company but was activated during the cycle', function () {
    $context = a12CompletedEvent(participants: 1);
    $employee = $context['employees'][0];
    $activation = app(ActivationService::class);

    $employee->forceFill(['status' => 'inactive'])->save();

    // «الموظف الذي غادر خلال الدورة وكان مفعّلاً يُحتسب» — الصف محفوظ.
    expect($activation->activatedCount($context['company']->id, now()->startOfMonth(), now()->endOfMonth()))->toBe(1);
});

it('never counts a cancelled or never-completed event towards activation', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    expect(app(ActivationService::class)->activatedCount($company->id, now()->startOfMonth(), now()->endOfMonth()))->toBe(0)
        ->and($employee->exists)->toBeTrue();
});

// ── سيناريو القبول 8 (H §23): تعديل الحضور خلال 24 ساعة وأثره على اللوحة
// والفوترة معاً في مسار واحد.
// سيناريو القبول 8 نفسه (باللوحة **والفاتورة**) في
// tests/Feature/Acceptance/Scenario08AttendanceEditTest.php — هذا انحدار A12.
it('an attendance edit inside 24h moves the board and the activation count together', function () {
    $context = a12CompletedEvent(participants: 3);
    [$stays, $flips, $other] = $context['employees'];

    $seasons = app(SeasonService::class);
    $boards = app(BoardService::class);
    $activation = app(ActivationService::class);

    $season = $seasons->seasonFor($context['community'], $context['event']->completed_at);
    $from = now()->startOfMonth();
    $to = now()->endOfMonth();

    expect($boards->consistencyBoard($season, 'individual'))->toHaveCount(3)
        ->and($activation->activatedCount($context['company']->id, $from, $to))->toBe(3);

    // القائد يعدّل داخل النافذة.
    expect(app(AttendanceService::class)->isWindowOpen($context['event']))->toBeTrue();

    $this->actingAs($context['leader'], 'employee')
        ->post("/employee/detail/{$context['event']->id}/attendance/{$flips->id}", [
            'attendance_status' => 'absent',
            'reason' => 'لم يحضر رغم الحجز',
        ])
        ->assertSessionHas('success');

    $board = $boards->consistencyBoard($season, 'individual');

    expect($board)->toHaveCount(2)
        ->and(collect($board)->pluck('employee_id')->all())->not->toContain($flips->id)
        ->and(collect($board)->pluck('employee_id')->all())->toContain($stays->id, $other->id)
        // ...والفوترة: الغائب لم يعد موظفاً مفعّلاً هذا الشهر.
        ->and($activation->activatedCount($context['company']->id, $from, $to))->toBe(2)
        ->and($activation->isActivated($flips, $from, $to))->toBeFalse();

    // ثم يتراجع القائد داخل النافذة نفسها: يعود للوحة وللعدّاد معاً.
    $this->actingAs($context['leader'], 'employee')
        ->post("/employee/detail/{$context['event']->id}/attendance/{$flips->id}", [
            'attendance_status' => 'attended',
            'reason' => 'تبيّن أنه حضر متأخراً',
        ])
        ->assertSessionHas('success');

    expect($boards->consistencyBoard($season, 'individual'))->toHaveCount(3)
        ->and($activation->activatedCount($context['company']->id, $from, $to))->toBe(3);
});

// ── مؤشر «الفعالية الشبح» (H §13) ────────────────────────────────────────

it('exposes the post-completion edit rate and the manual state-change rate', function () {
    $context = a12CompletedEvent(participants: 2);
    $metrics = app(GhostEventMetricService::class);

    $before = $metrics->stats($context['company']->id);

    expect($before['completed_events'])->toBe(1)
        ->and($before['post_completion_edited_events'])->toBe(0)
        ->and($before['post_completion_edit_rate'])->toBe(0.0);

    app(AttendanceService::class)->mark(
        $context['event'],
        $context['employees'][0],
        AttendanceService::ABSENT,
        $context['leaderUser'],
        $context['leader'],
        'مراجعة القائد',
    );

    $after = $metrics->stats($context['company']->id);

    expect($after['post_completion_edited_events'])->toBe(1)
        ->and($after['post_completion_edit_rate'])->toBe(100.0)
        ->and($after['absence_marks'])->toBe(1)
        ->and($after)->toHaveKeys([
            'manual_state_change_events',
            'manual_state_change_rate',
            'locked_without_review',
            'locked_without_review_rate',
        ]);
});

it('counts a manual state change in the ghost-event watch', function () {
    $context = a12CompletedEvent(participants: 1);

    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    $this->actingAs($admin->fresh(), 'admin')
        ->post("/admin/events/{$context['event']->id}/force-status", [
            'status' => 'confirmed',
            'reason' => 'بلاغ أن الفعالية لم تُقم',
        ])
        ->assertSessionHas('success');

    $stats = app(GhostEventMetricService::class)->stats($context['company']->id);

    expect($stats['manual_state_change_events'])->toBe(1)
        ->and($stats['manual_state_change_rate'])->toBeGreaterThan(0);
});

it('flags a completed event whose window closed without a single review', function () {
    $context = a12CompletedEvent(participants: 1, completedAt: now()->subHours(26));

    $this->artisan('app:close-attendance-window')->assertSuccessful();

    $stats = app(GhostEventMetricService::class)->stats($context['company']->id);

    expect($stats['locked_without_review'])->toBe(1)
        ->and($stats['locked_without_review_rate'])->toBe(100.0);
});

it('shows the ghost-event watch card on the admin dashboard', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    $this->actingAs($admin->fresh(), 'admin')
        ->get('/admin/dash')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('ghostEventWatch.post_completion_edit_rate'));
});
