<?php

use App\Enums\Role;
use App\Models\ActivityLog;
use App\Models\Community;
use App\Models\Employee;
use App\Models\EventParticipant;
use App\Models\JobRun;
use App\Models\ParticipantEvent;
use App\Models\RoleAssignment;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\Attendance\AttendanceService;

// H §13: الحضور تلقائي بالكامل، ونافذة تعديله 24 ساعة من الاكتمال لقائد
// المجتمع أو المنسّق وحدهما، ثم تُقفل ولا يعدّلها إلا أدمن تيمات بسبب موثَّق.

it('lets the community leader flip attended to absent inside the 24h window and logs it', function () {
    $context = a12CompletedEvent();
    $target = $context['employees'][0];

    $row = app(AttendanceService::class)->mark(
        $context['event'],
        $target,
        AttendanceService::ABSENT,
        $context['leaderUser'],
        $context['leader'],
        'لم يحضر — تأكد القائد',
    );

    expect($row->attendance_status)->toBe('absent')
        ->and($row->attendance_reason)->toBe('لم يحضر — تأكد القائد');

    // قيد A7: التعديل سطر في participant_events بالفاعل والسبب.
    $log = ParticipantEvent::where('event_id', $context['event']->id)
        ->where('employee_id', $target->id)
        ->where('field', 'attendance_status')
        ->latest('id')
        ->first();

    expect($log)->not->toBeNull()
        ->and($log->from_value)->toBe('attended')
        ->and($log->to_value)->toBe('absent')
        ->and($log->reason)->toBe('لم يحضر — تأكد القائد')
        ->and($log->actor_id)->toBe($context['leader']->id);

    expect(ActivityLog::where('type', 'attendance_edited')->exists())->toBeTrue();
});

it('flips absent back to attended inside the window', function () {
    $context = a12CompletedEvent();
    $target = $context['employees'][0];
    $service = app(AttendanceService::class);

    $service->mark($context['event'], $target, AttendanceService::ABSENT, $context['leaderUser'], $context['leader'], 'خطأ');
    $row = $service->mark($context['event'], $target, AttendanceService::ATTENDED, $context['leaderUser'], $context['leader'], 'تصحيح — كان حاضراً');

    expect($row->attendance_status)->toBe('attended');
    expect(ParticipantEvent::where('event_id', $context['event']->id)
        ->where('employee_id', $target->id)
        ->where('field', 'attendance_status')
        ->count())->toBe(2);
});

it('moves no money at all when a participant is marked absent', function () {
    $context = a12CompletedEvent();
    $before = WalletTransaction::count();

    app(AttendanceService::class)->mark(
        $context['event'],
        $context['employees'][0],
        AttendanceService::ABSENT,
        $context['leaderUser'],
        $context['leader'],
        'غياب',
    );

    // «لا أثر مالي للغياب إطلاقاً» — لا استرداد ولا حركة دفتر واحدة.
    expect(WalletTransaction::count())->toBe($before);
});

it('refuses an ordinary member and refuses a leader of another community', function () {
    $context = a12CompletedEvent();
    $outsider = $context['employees'][1]->fresh();

    expect(fn () => app(AttendanceService::class)->mark(
        $context['event'],
        $context['employees'][0],
        AttendanceService::ABSENT,
        $outsider->user,
        $outsider,
    ))->toThrow(RuntimeException::class);

    $other = Community::factory()->create(['company_id' => $context['company']->id]);
    $otherLeader = Employee::factory()->create(['company_id' => $context['company']->id])->fresh();
    $otherLeader->user->assignRole(Role::CommunityLeader, RoleAssignment::SCOPE_COMMUNITY, $other->id, true);

    expect(fn () => app(AttendanceService::class)->mark(
        $context['event'],
        $context['employees'][0],
        AttendanceService::ABSENT,
        $otherLeader->user->fresh(),
        $otherLeader,
    ))->toThrow(RuntimeException::class);
});

it('honours the company allow_absence_marking setting for the leader path', function () {
    $context = a12CompletedEvent();
    $context['company']->getSettings()->forceFill(['allow_absence_marking' => false])->save();

    expect(fn () => app(AttendanceService::class)->mark(
        $context['event']->fresh(),
        $context['employees'][0],
        AttendanceService::ABSENT,
        $context['leaderUser'],
        $context['leader'],
    ))->toThrow(RuntimeException::class, 'allow_absence_marking');
});

it('closes the window after 24 hours through the hourly job, idempotently', function () {
    $context = a12CompletedEvent(completedAt: now()->subHours(25));

    $this->artisan('app:close-attendance-window')->assertSuccessful();

    $event = $context['event']->fresh();
    expect($event->attendance_locked_at)->not->toBeNull();

    $lockedAt = $event->attendance_locked_at;
    $runs = JobRun::where('job', 'app:close-attendance-window')->whereNotNull('entity_type')->count();

    // تشغيلها مرتين لا ينتج أثراً مزدوجاً (H §20).
    $this->artisan('app:close-attendance-window')->assertSuccessful();

    expect($context['event']->fresh()->attendance_locked_at->toIso8601String())->toBe($lockedAt->toIso8601String())
        ->and(JobRun::where('job', 'app:close-attendance-window')->whereNotNull('entity_type')->count())->toBe($runs)
        ->and(ActivityLog::where('type', 'attendance_window_closed')->count())->toBe(1);
});

it('leaves the window open before 24 hours have passed', function () {
    $context = a12CompletedEvent(completedAt: now()->subHours(23));

    $this->artisan('app:close-attendance-window')->assertSuccessful();

    expect($context['event']->fresh()->attendance_locked_at)->toBeNull()
        ->and(app(AttendanceService::class)->isWindowOpen($context['event']->fresh()))->toBeTrue();
});

it('locks the leader out once the window is closed', function () {
    $context = a12CompletedEvent(completedAt: now()->subHours(25));
    $this->artisan('app:close-attendance-window')->assertSuccessful();

    expect(fn () => app(AttendanceService::class)->mark(
        $context['event']->fresh(),
        $context['employees'][0],
        AttendanceService::ABSENT,
        $context['leaderUser'],
        $context['leader'],
        'متأخر',
    ))->toThrow(RuntimeException::class, 'أُقفلت نافذة تعديل الحضور');
});

it('lets a platform admin edit after the window only with a documented reason, audited as an exception', function () {
    $context = a12CompletedEvent(completedAt: now()->subHours(30));
    $this->artisan('app:close-attendance-window')->assertSuccessful();

    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);
    $admin = $admin->fresh();

    $service = app(AttendanceService::class);

    // بلا سبب: مرفوض.
    expect(fn () => $service->mark(
        $context['event']->fresh(),
        $context['employees'][0],
        AttendanceService::ABSENT,
        $admin,
        $admin,
    ))->toThrow(RuntimeException::class, AttendanceService::ADMIN_EXCEPTION_NOTE);

    $row = $service->mark(
        $context['event']->fresh(),
        $context['employees'][0],
        AttendanceService::ABSENT,
        $admin,
        $admin,
        'ثبت بالتسجيل أن الموظف لم يحضر',
    );

    expect($row->attendance_status)->toBe('absent');

    $audit = ActivityLog::where('type', 'attendance_admin_exception')->latest('id')->first();
    expect($audit)->not->toBeNull()
        ->and($audit->description)->toContain(AttendanceService::ADMIN_EXCEPTION_NOTE)
        ->and($audit->actor_user_id)->toBe($admin->id)
        ->and($audit->data['reason'])->toBe('ثبت بالتسجيل أن الموظف لم يحضر');

    $log = ParticipantEvent::where('event_id', $context['event']->id)
        ->where('field', 'attendance_status')
        ->latest('id')
        ->first();
    expect($log->reason)->toContain(AttendanceService::ADMIN_EXCEPTION_NOTE);
});

it('exposes the leader endpoint on the event page and rejects a non-participant target', function () {
    $context = a12CompletedEvent();
    $stranger = Employee::factory()->create(['company_id' => $context['company']->id]);

    $this->actingAs($context['leader'], 'employee')
        ->post("/employee/detail/{$context['event']->id}/attendance/{$context['employees'][0]->id}", [
            'attendance_status' => 'absent',
            'reason' => 'لم يحضر',
        ])
        ->assertSessionHas('success');

    expect(EventParticipant::where('event_id', $context['event']->id)
        ->where('employee_id', $context['employees'][0]->id)
        ->value('attendance_status'))->toBe('absent');

    $this->actingAs($context['leader'], 'employee')
        ->post("/employee/detail/{$context['event']->id}/attendance/{$stranger->id}", [
            'attendance_status' => 'absent',
        ])
        ->assertSessionHas('error');
});

it('requires a reason on the admin exception endpoint', function () {
    $context = a12CompletedEvent(completedAt: now()->subHours(30));
    $this->artisan('app:close-attendance-window')->assertSuccessful();

    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    $this->actingAs($admin->fresh(), 'admin')
        ->post("/admin/events/{$context['event']->id}/attendance/{$context['employees'][0]->id}", [
            'attendance_status' => 'absent',
        ])
        ->assertSessionHasErrors('reason');

    $this->actingAs($admin->fresh(), 'admin')
        ->post("/admin/events/{$context['event']->id}/attendance/{$context['employees'][0]->id}", [
            'attendance_status' => 'absent',
            'reason' => 'بلاغ موثَّق من القائد بعد النافذة',
        ])
        ->assertSessionHas('success');

    expect(EventParticipant::where('event_id', $context['event']->id)
        ->where('employee_id', $context['employees'][0]->id)
        ->value('attendance_status'))->toBe('absent');
});
