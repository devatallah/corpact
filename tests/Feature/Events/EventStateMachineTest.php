<?php

use App\Enums\EventStatus;
use App\Enums\Role;
use App\Models\Event;
use App\Models\EventStatusHistory;
use App\Models\User;
use App\Services\Events\EventStateMachine;
use App\Services\Events\IllegalEventTransition;

// H §9: «أي انتقال غير مذكور في هذا الجدول ممنوع» — الآلة طبقة واحدة،
// وكل انتقال سطر في event_status_history بالفاعل والسبب والوقت.

function machineEvent(string $status): Event
{
    $event = Event::factory()->create(['event_date' => now()->addDays(3)->toDateString()]);
    $event->forceFill(['status' => $status])->save();

    return $event->fresh();
}

it('allows every transition in the section-9 table and records history', function () {
    $machine = app(EventStateMachine::class);

    foreach (EventStateMachine::TRANSITIONS as $from => $targets) {
        foreach ($targets as $to) {
            $event = machineEvent($from);

            $machine->transition($event, EventStatus::from($to), null, 'اختبار انتقال مشروع');

            expect($event->fresh()->status)->toBe($to, "الانتقال {$from} ← {$to} يجب أن يكون مشروعاً");

            $history = EventStatusHistory::where('event_id', $event->id)->latest('id')->first();
            expect($history)->not->toBeNull()
                ->and($history->from_status)->toBe($from)
                ->and($history->to_status)->toBe($to)
                ->and($history->reason)->toBe('اختبار انتقال مشروع')
                ->and($history->is_manual)->toBeFalse();
        }
    }
});

it('throws on every transition not in the section-9 table and writes nothing', function () {
    $machine = app(EventStateMachine::class);
    $checked = 0;

    foreach (EventStateMachine::TRANSITIONS as $from => $targets) {
        foreach (EventStatus::values() as $to) {
            if ($to === $from || in_array($to, $targets, true)) {
                continue;
            }

            $event = machineEvent($from);
            $before = EventStatusHistory::count();

            expect(fn () => $machine->transition($event, EventStatus::from($to)))
                ->toThrow(IllegalEventTransition::class, message: "الانتقال {$from} ← {$to} يجب أن يُرفض");

            expect($event->fresh()->status)->toBe($from)
                ->and(EventStatusHistory::count())->toBe($before);

            $checked++;
        }
    }

    expect($checked)->toBeGreaterThan(150); // 16 حالة × الأهداف غير المشروعة
});

it('terminal states allow no transitions at all', function () {
    foreach (['settled', 'rejected', 'expired', 'cancelled_min_not_met', 'cancelled_provider', 'cancelled_company', 'cancelled_payment_failed'] as $terminal) {
        expect(EventStateMachine::TRANSITIONS[$terminal])->toBe([]);
    }
});

it('writes the event snapshot once when entering confirmed', function () {
    $event = machineEvent('awaiting_payment');

    app(EventStateMachine::class)->collectionComplete($event);

    $snapshot = $event->fresh()->event_snapshot;

    expect($snapshot)->not->toBeNull()
        ->and($snapshot['creator']['name'])->toBe($event->creator->name)
        ->and($snapshot['provider']['id'])->toBe($event->partner_id)
        ->and($snapshot['financial']['currency'])->toBe('SAR')
        ->and($snapshot['financial']['subsidy_halalas'])->toBeNull(); // يملؤها A10
});

it('completes a confirmed event through in_progress — no jumping over the table', function () {
    $event = machineEvent('confirmed');

    app(EventStateMachine::class)->complete($event);

    expect($event->fresh()->status)->toBe('completed');

    $trail = EventStatusHistory::where('event_id', $event->id)->orderBy('id')->pluck('to_status')->all();
    expect($trail)->toBe(['in_progress', 'completed']);
});

it('force() bypasses the table for platform admin with a mandatory written reason', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    $event = machineEvent('completed');

    // H §9 قاعدة 2: مثال المواصفة — إرجاعها من completed إذا ثبت أنها لم تُقم.
    app(EventStateMachine::class)->force($event, EventStatus::Confirmed, $admin, 'ثبت أن الفعالية لم تُقم — تصحيح يدوي');

    expect($event->fresh()->status)->toBe('confirmed');

    $history = EventStatusHistory::where('event_id', $event->id)->latest('id')->first();
    expect($history->is_manual)->toBeTrue()
        ->and($history->reason)->toBe('ثبت أن الفعالية لم تُقم — تصحيح يدوي')
        ->and($history->actor_id)->toBe($admin->id);
});

it('force() refuses an empty reason', function () {
    $admin = User::factory()->create();
    $admin->assignRole(Role::PlatformAdmin);

    $event = machineEvent('completed');

    expect(fn () => app(EventStateMachine::class)->force($event, EventStatus::Confirmed, $admin, '  '))
        ->toThrow(InvalidArgumentException::class);
});
