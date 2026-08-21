<?php

use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\JobRun;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

function attendanceOf(Event $event, Employee $employee): ?string
{
    return EventParticipant::where('event_id', $event->id)
        ->where('employee_id', $employee->id)
        ->value('attendance_status');
}

it('moves an ended confirmed event to completed and marks joined participants attended', function () {
    $this->travelTo(Carbon::parse('2026-08-19 14:00:00'));

    $event = Event::factory()->confirmed()->create([
        'event_date' => '2026-08-19',
        'start_time' => '12:00:00',
        'duration_minutes' => 60,
    ]);

    [$joined, $waitlisted, $cancelled] = Employee::factory()->count(3)->create();
    $event->participants()->attach($joined->id, ['seat_status' => 'reserved', 'joined_at' => now()]);
    $event->participants()->attach($waitlisted->id, ['seat_status' => 'waitlisted', 'joined_at' => now()]);
    $event->participants()->attach($cancelled->id, ['seat_status' => 'cancelled', 'joined_at' => now()]);

    $this->artisan('app:transition-event-lifecycle')->assertSuccessful();

    $event->refresh();
    expect($event->status)->toBe('completed')
        ->and($event->completed_at)->not->toBeNull()
        ->and(attendanceOf($event, $joined))->toBe('attended')
        ->and(attendanceOf($event, $waitlisted))->toBeNull()
        ->and(attendanceOf($event, $cancelled))->toBeNull();
});

it('moves a confirmed event to in_progress at start time and completes it at end time', function () {
    $this->travelTo(Carbon::parse('2026-08-19 12:10:00'));

    $event = Event::factory()->confirmed()->create([
        'event_date' => '2026-08-19',
        'start_time' => '12:00:00',
        'duration_minutes' => 60,
    ]);

    $this->artisan('app:transition-event-lifecycle')->assertSuccessful();

    expect($event->refresh()->status)->toBe('in_progress')
        ->and($event->completed_at)->toBeNull();

    $this->travelTo(Carbon::parse('2026-08-19 13:05:00'));

    $this->artisan('app:transition-event-lifecycle')->assertSuccessful();

    expect($event->refresh()->status)->toBe('completed')
        ->and($event->completed_at)->not->toBeNull();
});

it('running the transition twice causes no double effect', function () {
    $this->travelTo(Carbon::parse('2026-08-19 14:00:00'));

    $event = Event::factory()->confirmed()->create([
        'event_date' => '2026-08-19',
        'start_time' => '12:00:00',
        'duration_minutes' => 60,
    ]);

    $joined = Employee::factory()->create();
    $event->participants()->attach($joined->id, ['seat_status' => 'reserved', 'joined_at' => now()]);

    $this->artisan('app:transition-event-lifecycle')->assertSuccessful();

    $event->refresh();
    $completedAt = $event->completed_at->toDateTimeString();

    // القائد عدّل الحضور داخل نافذة الـ24 ساعة — إعادة التشغيل يجب ألا تكتب فوقه.
    EventParticipant::where('event_id', $event->id)
        ->where('employee_id', $joined->id)
        ->update(['attendance_status' => 'absent']);

    $this->travelTo(Carbon::parse('2026-08-19 14:10:00'));
    $this->artisan('app:transition-event-lifecycle')->assertSuccessful();

    $event->refresh();
    expect($event->status)->toBe('completed')
        ->and($event->completed_at->toDateTimeString())->toBe($completedAt)
        ->and(attendanceOf($event, $joined))->toBe('absent')
        ->and(JobRun::where('job', 'event-lifecycle:complete')
            ->where('entity_type', 'event')
            ->where('entity_id', $event->id)
            ->count())->toBe(1);
});

it('leaves upcoming confirmed events untouched', function () {
    $this->travelTo(Carbon::parse('2026-08-19 10:00:00'));

    $event = Event::factory()->confirmed()->create([
        'event_date' => '2026-08-19',
        'start_time' => '12:00:00',
        'duration_minutes' => 60,
    ]);

    $this->artisan('app:transition-event-lifecycle')->assertSuccessful();

    expect($event->refresh()->status)->toBe('confirmed');
});

it('runOnce skips completed keys, retries failures with backoff, and stops after three attempts', function () {
    $this->travelTo(Carbon::parse('2026-08-19 10:00:00'));

    $calls = 0;
    $failing = function () use (&$calls): void {
        $calls++;
        throw new RuntimeException('boom');
    };

    // المحاولة 1 تفشل وتُثار.
    expect(fn () => JobRun::runOnce('test-job', 'event', 1, '2026-08-19', $failing))
        ->toThrow(RuntimeException::class);

    // قبل انقضاء التباعد الأسي (5 دقائق) — تُتخطى بلا تنفيذ.
    expect(JobRun::runOnce('test-job', 'event', 1, '2026-08-19', $failing))->toBeFalse()
        ->and($calls)->toBe(1);

    // المحاولتان 2 و3 بعد التباعد.
    $this->travelTo(Carbon::parse('2026-08-19 10:06:00'));
    expect(fn () => JobRun::runOnce('test-job', 'event', 1, '2026-08-19', $failing))
        ->toThrow(RuntimeException::class);

    $this->travelTo(Carbon::parse('2026-08-19 10:17:00'));
    expect(fn () => JobRun::runOnce('test-job', 'event', 1, '2026-08-19', $failing))
        ->toThrow(RuntimeException::class);

    // استُنفدت المحاولات الثلاث — لا تنفيذ بعدها مهما مر الوقت.
    $this->travelTo(Carbon::parse('2026-08-20 10:00:00'));
    expect(JobRun::runOnce('test-job', 'event', 1, '2026-08-19', $failing))->toBeFalse()
        ->and($calls)->toBe(3);

    // مفتاح مكتمل لا يُنفَّذ ثانية.
    $done = 0;
    JobRun::runOnce('test-job', 'event', 2, '2026-08-19', function () use (&$done): void {
        $done++;
    });
    expect(JobRun::runOnce('test-job', 'event', 2, '2026-08-19', function () use (&$done): void {
        $done++;
    }))->toBeFalse()
        ->and($done)->toBe(1);
});

it('stub scheduled commands run cleanly and record a heartbeat', function () {
    $stubs = [
        'app:generate-template-events',
        'app:close-registration',
        'app:expire-payment-deadlines',
        'app:expire-provider-deadlines',
        'app:close-attendance-window',
        'app:generate-settlements',
        'app:generate-monthly-invoices',
        'app:check-dormant-communities',
        'app:send-reminders',
        'app:reconcile-balances',
    ];

    foreach ($stubs as $command) {
        $this->artisan($command)->assertSuccessful();

        expect(JobRun::where('job', $command)->whereNull('entity_type')->exists())
            ->toBeTrue("لم تُسجَّل نبضة للمهمة {$command}");
    }
});

it('watchdog alerts for critical jobs silent longer than twice their cadence', function () {
    $this->travelTo(Carbon::parse('2026-08-19 09:00:00'));
    JobRun::heartbeat('app:transition-event-lifecycle');

    $this->travelTo(Carbon::parse('2026-08-19 12:00:00'));

    Log::spy();

    $this->artisan('app:watchdog-scheduled-jobs')->assertSuccessful();

    Log::shouldHaveReceived('critical')
        ->withArgs(fn (string $message) => str_contains($message, 'app:transition-event-lifecycle'))
        ->once();
});
