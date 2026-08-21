<?php

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\JobRun;
use App\Models\Notification;
use App\Models\NotificationPreference;
use Illuminate\Support\Carbon;

/**
 * H §14 — «التذكيرات محدودة بمرتين لكل فعالية (24 ساعة وساعتان). لا رسالة
 * ثالثة». والمستلم: المشاركون المؤكدون.
 */
function reminderEvent(Carbon $startsAt, int $reserved = 2, int $waitlisted = 0): array
{
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id, 'name' => 'مجتمع البادل']);

    $event = Event::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'status' => 'confirmed',
        'starts_at' => $startsAt,
        'event_date' => $startsAt->toDateString(),
        'start_time' => $startsAt->format('H:i'),
        'capacity' => 10,
        'min_participants' => 2,
    ]);

    $employees = [];

    foreach (range(1, $reserved) as $i) {
        $employee = Employee::factory()->create(['company_id' => $company->id]);
        EventParticipant::create([
            'event_id' => $event->id,
            'employee_id' => $employee->id,
            'seat_status' => 'reserved',
            'payment_status' => 'paid',
            'joined_at' => now(),
        ]);
        $employees[] = $employee;
    }

    $waiting = [];

    foreach (range(1, max($waitlisted, 0)) as $i) {
        if ($waitlisted === 0) {
            break;
        }
        $employee = Employee::factory()->create(['company_id' => $company->id]);
        EventParticipant::create([
            'event_id' => $event->id,
            'employee_id' => $employee->id,
            'seat_status' => 'waitlisted',
            'payment_status' => 'not_due',
            'position' => $i,
            'joined_at' => now(),
        ]);
        $waiting[] = $employee;
    }

    return ['event' => $event, 'reserved' => $employees, 'waitlisted' => $waiting];
}

function reminderCount(Employee $employee, string $key): int
{
    return Notification::query()
        ->where('notifiable_id', $employee->id)
        ->where('template_key', $key)
        ->count();
}

it('sends exactly one 24-hour reminder to each confirmed participant', function () {
    $fixture = reminderEvent(now()->addHours(20));

    $this->artisan('app:send-reminders')->assertSuccessful();

    foreach ($fixture['reserved'] as $employee) {
        expect(reminderCount($employee, 'event.reminder.24h'))->toBe(1)
            ->and(reminderCount($employee, 'event.reminder.2h'))->toBe(0);
    }
});

it('never sends a third message — running the command repeatedly changes nothing', function () {
    $fixture = reminderEvent(now()->addHours(20));
    $employee = $fixture['reserved'][0];

    foreach (range(1, 5) as $ignored) {
        $this->artisan('app:send-reminders')->assertSuccessful();
    }

    expect(reminderCount($employee, 'event.reminder.24h'))->toBe(1);

    // ثم نافذة الساعتين: رسالة ثانية واحدة، ولا ثالثة مهما تكرر التشغيل.
    $this->travelTo(now()->addHours(19));

    foreach (range(1, 5) as $ignored) {
        $this->artisan('app:send-reminders')->assertSuccessful();
    }

    expect(reminderCount($employee, 'event.reminder.2h'))->toBe(1)
        ->and(reminderCount($employee, 'event.reminder.24h'))->toBe(1)
        ->and(Notification::query()->where('notifiable_id', $employee->id)->count())->toBe(2);
});

it('keys idempotency on (event + reminder type + start time) in job_runs', function () {
    $fixture = reminderEvent(now()->addHours(20));

    $this->artisan('app:send-reminders')->assertSuccessful();

    expect(JobRun::query()
        ->where('job', 'event:reminder-24h')
        ->where('entity_type', 'event')
        ->where('entity_id', $fixture['event']->id)
        ->where('status', 'completed')
        ->exists())->toBeTrue();
});

it('re-arms the reminder when the event is rescheduled to a new start time', function () {
    $fixture = reminderEvent(now()->addHours(20));
    $employee = $fixture['reserved'][0];

    $this->artisan('app:send-reminders')->assertSuccessful();
    expect(reminderCount($employee, 'event.reminder.24h'))->toBe(1);

    // إعادة جدولة مشروعة ⇒ موعد جديد ⇒ تذكير جديد للموعد الجديد.
    $newStart = now()->addDays(3)->setTime(20, 0);
    $fixture['event']->forceFill([
        'starts_at' => $newStart,
        'event_date' => $newStart->toDateString(),
        'start_time' => '20:00',
    ])->save();

    $this->travelTo($newStart->copy()->subHours(20));
    $this->artisan('app:send-reminders')->assertSuccessful();

    expect(reminderCount($employee, 'event.reminder.24h'))->toBe(2);
});

it('sends only the 2-hour reminder for an event confirmed less than two hours before start', function () {
    $fixture = reminderEvent(now()->addMinutes(90));
    $employee = $fixture['reserved'][0];

    $this->artisan('app:send-reminders')->assertSuccessful();

    expect(reminderCount($employee, 'event.reminder.2h'))->toBe(1)
        ->and(reminderCount($employee, 'event.reminder.24h'))->toBe(0);
});

it('reminds confirmed participants only — never the waitlist', function () {
    $fixture = reminderEvent(now()->addHours(20), reserved: 1, waitlisted: 2);

    $this->artisan('app:send-reminders')->assertSuccessful();

    expect(reminderCount($fixture['reserved'][0], 'event.reminder.24h'))->toBe(1);

    foreach ($fixture['waitlisted'] as $employee) {
        expect(Notification::query()->where('notifiable_id', $employee->id)->count())->toBe(0);
    }
});

it('does not remind about an event that is not confirmed', function () {
    $fixture = reminderEvent(now()->addHours(20));
    $fixture['event']->forceFill(['status' => 'open'])->save();

    $this->artisan('app:send-reminders')->assertSuccessful();

    expect(reminderCount($fixture['reserved'][0], 'event.reminder.24h'))->toBe(0);
});

it('honours the user switching reminders off — they are optional in H §14', function () {
    $fixture = reminderEvent(now()->addHours(20));
    $employee = $fixture['reserved'][0];

    NotificationPreference::query()->create([
        'notifiable_type' => $employee->getMorphClass(),
        'notifiable_id' => $employee->id,
        'template_key' => 'event.reminder.24h',
        'enabled' => false,
    ]);

    $this->artisan('app:send-reminders')->assertSuccessful();

    expect(reminderCount($employee, 'event.reminder.24h'))->toBe(0)
        ->and(reminderCount($fixture['reserved'][1], 'event.reminder.24h'))->toBe(1);
});

it('names the community and the local Riyadh time in the reminder body', function () {
    $startsAt = Carbon::parse('2026-09-01 17:00', 'Asia/Riyadh')->utc();
    $fixture = reminderEvent($startsAt);

    $this->travelTo($startsAt->copy()->subHours(20));
    $this->artisan('app:send-reminders')->assertSuccessful();

    $notification = Notification::query()
        ->where('notifiable_id', $fixture['reserved'][0]->id)
        ->where('template_key', 'event.reminder.24h')
        ->first();

    expect($notification->body)->toContain('مجتمع البادل')
        ->and($notification->body)->toContain('17:00');
});

it('records a heartbeat every run so the watchdog can tell silence from success', function () {
    $this->artisan('app:send-reminders')->assertSuccessful();

    expect(JobRun::lastHeartbeatAt('app:send-reminders'))->not->toBeNull();
});
