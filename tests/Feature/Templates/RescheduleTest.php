<?php

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\EventStatusHistory;
use App\Models\EventTemplate;
use App\Models\Notification;
use App\Models\WalletTransaction;
use App\Services\Community\LeadershipService;
use App\Services\Events\EventStateMachine;
use App\Services\Events\ParticipationService;

// H §8: فشل بلوغ الحد الأدنى عند إغلاق التسجيل — إعادة الجدولة **مرة واحدة**
// إلى نفس اليوم والوقت +7 أيام على **نفس السجل** (reschedule_attempt +
// original_starts_at)؛ فشل المحاولة الثانية ← cancelled_min_not_met نهائياً
// مع تنبيه القائد بمراجعة الحد الأدنى؛ **لا استقطاع مالي في أي محاولة**؛
// المزوّد الذي قبل يُبلَّغ فوراً. يسري على القوالب والفعاليات اليدوية سواء.

function rescheduleEvent(int $reserved, int $min, array $eventAttributes = []): array
{
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);

    $event = Event::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'capacity' => 10,
        'min_participants' => $min,
        'participants_count' => 0,
        'status' => 'open',
        // يومان لا يوم واحد: `registration_closes_at` يُشتق بـ24 ساعة قبل البدء،
        // فـ«غداً 20:00» يجعل التسجيل مغلقاً كلما شُغّلت الحزمة بعد 20:00 (هشاشة زمنية).
        'event_date' => now()->addDays(2)->toDateString(),
        'start_time' => '20:00',
        'community_contribution' => 0,
        'budget_deducted_at' => null,
        ...$eventAttributes,
    ]);

    $service = app(ParticipationService::class);
    for ($i = 0; $i < $reserved; $i++) {
        $employee = Employee::factory()->create(['company_id' => $company->id]);
        $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);
        $service->join($event->fresh(), $employee);
    }

    $event = $event->fresh();
    if ($event->status === 'pending_provider') {
        app(EventStateMachine::class)->providerAccepted($event);
    }

    return [$event->fresh(), $community, $leader->fresh()];
}

it('reschedules a booked below-minimum event ONCE on the same record: +7 days, provider informed, zero money', function () {
    // بلغت الحد (5) فقُبلت ثم انسحب 3 — booked ناقصة العدد عند الإغلاق
    [$event, , $leader] = rescheduleEvent(reserved: 5, min: 5);
    expect($event->status)->toBe('booked');

    $request = EventProviderRequest::where('event_id', $event->id)->first();
    expect($request)->not->toBeNull();

    $event->forceFill(['registration_closes_at' => now()->addHours(2)])->save();
    $service = app(ParticipationService::class);
    foreach ($event->reservedParticipants()->limit(3)->get() as $withdrawing) {
        $service->withdraw($event->fresh(), Employee::withoutGlobalScopes()->find($withdrawing->id));
    }

    $originalStartsAt = $event->fresh()->starts_at->copy();
    $event->forceFill(['registration_closes_at' => now()->subMinutes(2)])->save();

    $this->artisan('app:close-registration')->assertSuccessful();

    $fresh = Event::withoutGlobalScopes()->find($event->id);

    // نفس السجل — لا صف جديد
    expect(Event::withoutGlobalScopes()->count())->toBe(1)
        ->and($fresh->status)->toBe('open')
        ->and($fresh->reschedule_attempt)->toBe(1)
        ->and($fresh->original_starts_at->toDateTimeString())->toBe($originalStartsAt->toDateTimeString())
        ->and($fresh->starts_at->toDateTimeString())->toBe($originalStartsAt->copy()->addDays(7)->toDateTimeString())
        ->and($fresh->starts_at->format('H:i'))->toBe('20:00') // نفس الوقت
        ->and($fresh->registration_closes_at->gt(now()))->toBeTrue(); // أعيد اشتقاقه

    // الانتقال booked ← open مسجَّل في التاريخ
    $trail = EventStatusHistory::where('event_id', $event->id)->orderBy('id')->pluck('to_status')->all();
    expect(end($trail))->toBe('open');

    // لا استقطاع مالي على أي طرف
    expect(WalletTransaction::where('reference_id', $event->id)->exists())->toBeFalse()
        ->and($fresh->budget_deducted_at)->toBeNull();

    // طلب المزوّد أُلغي وأُبلغ فوراً، وحجز الوحدة حُرر
    expect($request->fresh()->status)->toBe(EventProviderRequest::STATUS_CANCELLED)
        ->and(Notification::where('notifiable_id', $event->partner_id)
            ->where('title', 'إلغاء حجز — لم يكتمل العدد')->exists())->toBeTrue();

    // إشعار القائد بالمحاولة الأخيرة
    expect(Notification::where('notifiable_id', $leader->id)
        ->where('title', 'أُعيدت جدولة فعالية — محاولة أخيرة')->exists())->toBeTrue();
});

it('re-sends the provider request when quorum is re-reached after the reschedule', function () {
    [$event, $community] = rescheduleEvent(reserved: 5, min: 5);

    $event->forceFill(['registration_closes_at' => now()->addHours(2)])->save();
    $service = app(ParticipationService::class);
    foreach ($event->reservedParticipants()->limit(2)->get() as $withdrawing) {
        $service->withdraw($event->fresh(), Employee::withoutGlobalScopes()->find($withdrawing->id));
    }

    $event->forceFill(['registration_closes_at' => now()->subMinutes(2)])->save();
    $this->artisan('app:close-registration')->assertSuccessful();

    $fresh = $event->fresh();
    expect($fresh->status)->toBe('open')->and($fresh->reschedule_attempt)->toBe(1);

    // انضمام جديد يعيد بلوغ الحد ← الطلب يُرسل للمزوّد من جديد بالموعد الجديد
    for ($i = 0; $i < 2; $i++) {
        $employee = Employee::factory()->create(['company_id' => $fresh->company_id]);
        $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);
        $service->join($fresh->fresh(), $employee);
    }

    $fresh = $fresh->fresh();
    expect($fresh->status)->toBe('pending_provider');

    $requests = EventProviderRequest::where('event_id', $event->id)->orderBy('id')->get();
    expect($requests)->toHaveCount(2)
        ->and($requests->first()->status)->toBe(EventProviderRequest::STATUS_CANCELLED)
        ->and($requests->last()->status)->toBe(EventProviderRequest::STATUS_PENDING)
        ->and($requests->last()->requested_date->format('Y-m-d'))->toBe($fresh->starts_at->format('Y-m-d'));
});

it('second failure is final: cancelled_min_not_met on the same record, leader told to review the minimum, zero money', function () {
    [$event, , $leader] = rescheduleEvent(reserved: 2, min: 5, eventAttributes: ['reschedule_attempt' => 1, 'original_starts_at' => now()->subDays(6)]);
    expect($event->status)->toBe('open'); // لم تبلغ الحد قط

    $event->forceFill(['registration_closes_at' => now()->subMinutes(2)])->save();

    $this->artisan('app:close-registration')->assertSuccessful();

    $fresh = $event->fresh();

    expect(Event::withoutGlobalScopes()->count())->toBe(1) // نفس السجل
        ->and($fresh->status)->toBe('cancelled_min_not_met')
        ->and($fresh->reschedule_attempt)->toBe(1)
        ->and(WalletTransaction::where('reference_id', $event->id)->exists())->toBeFalse();

    expect(Notification::where('notifiable_id', $leader->id)
        ->where('title', 'راجع الحد الأدنى للفعالية')->exists())->toBeTrue();
});

it('an open manually-created event below minimum reschedules in place (same record, still open)', function () {
    [$event] = rescheduleEvent(reserved: 2, min: 5);
    expect($event->status)->toBe('open');

    $originalStartsAt = $event->starts_at->copy();
    $event->forceFill(['registration_closes_at' => now()->subMinutes(2)])->save();

    $this->artisan('app:close-registration')->assertSuccessful();

    $fresh = $event->fresh();

    expect($fresh->status)->toBe('open')
        ->and($fresh->reschedule_attempt)->toBe(1)
        ->and($fresh->starts_at->toDateTimeString())->toBe($originalStartsAt->copy()->addDays(7)->toDateTimeString())
        ->and($fresh->original_starts_at->toDateTimeString())->toBe($originalStartsAt->toDateTimeString());

    // سطر تاريخ توثيقي open ← open (ليس انتقالاً)
    $note = EventStatusHistory::where('event_id', $event->id)->orderByDesc('id')->first();
    expect($note->from_status)->toBe('open')->and($note->to_status)->toBe('open');
});

it('honors the template reschedule interval (configurable — H §8)', function () {
    $template = EventTemplate::factory()->create(['reschedule_interval_days' => 14]);

    [$event] = rescheduleEvent(reserved: 2, min: 5, eventAttributes: [
        'template_id' => $template->id,
    ]);

    $originalStartsAt = $event->starts_at->copy();
    $event->forceFill(['registration_closes_at' => now()->subMinutes(2)])->save();

    $this->artisan('app:close-registration')->assertSuccessful();

    expect($event->fresh()->starts_at->toDateTimeString())
        ->toBe($originalStartsAt->copy()->addDays(14)->toDateTimeString());
});

// ── H §24: تمديد التسجيل 24 ساعة مرة واحدة قبل مسار إعادة الجدولة ────────────

it('a leader extends registration once by 24h; a second extension is refused', function () {
    [$event, , $leader] = rescheduleEvent(reserved: 2, min: 5, eventAttributes: [
        'event_date' => now()->addDays(3)->toDateString(),
    ]);

    $closesAt = $event->starts_at->copy()->subHours(30);
    $event->forceFill(['registration_closes_at' => $closesAt])->save();

    $this->actingAs($leader, 'employee')
        ->post("/employee/detail/{$event->id}/extend-registration")
        ->assertRedirect()
        ->assertSessionHas('success');

    $fresh = $event->fresh();
    expect($fresh->registration_closes_at->toDateTimeString())->toBe($closesAt->copy()->addHours(24)->toDateTimeString())
        ->and($fresh->registration_extended_at)->not->toBeNull()
        ->and($fresh->registration_extended_by)->toBe($leader->id);

    // مرة واحدة فقط
    $this->actingAs($leader, 'employee')
        ->post("/employee/detail/{$event->id}/extend-registration")
        ->assertSessionHasErrors();

    expect($event->fresh()->registration_closes_at->toDateTimeString())
        ->toBe($closesAt->copy()->addHours(24)->toDateTimeString());
});

it('the extension is capped at the event start time and denied to plain members', function () {
    [$event, $community] = rescheduleEvent(reserved: 2, min: 5);

    // الإغلاق قبل البدء بساعتين — التمديد لا يتجاوز وقت البدء
    $event->forceFill(['registration_closes_at' => $event->starts_at->copy()->subHours(2)])->save();

    $member = Employee::factory()->create(['company_id' => $event->company_id]);
    $community->members()->attach($member->id, ['status' => 'active', 'joined_at' => now()]);

    $this->actingAs($member->fresh(), 'employee')
        ->post("/employee/detail/{$event->id}/extend-registration")
        ->assertForbidden();

    $leader = Employee::withoutGlobalScopes()->find($event->community->leaderEmployees()->first()->id);
    $this->actingAs($leader, 'employee')
        ->post("/employee/detail/{$event->id}/extend-registration")
        ->assertRedirect();

    expect($event->fresh()->registration_closes_at->toDateTimeString())
        ->toBe($event->starts_at->toDateTimeString()); // السقف: وقت البدء
});

it('extension then close below minimum still falls into the reschedule path', function () {
    [$event, , $leader] = rescheduleEvent(reserved: 2, min: 5);

    $event->forceFill(['registration_closes_at' => now()->addHours(1)])->save();

    $this->actingAs($leader, 'employee')
        ->post("/employee/detail/{$event->id}/extend-registration")
        ->assertRedirect();

    // انقضى التمديد دون اكتمال العدد ← إعادة الجدولة (المحاولة الأولى)
    $this->travelTo($event->fresh()->registration_closes_at->copy()->addMinute());
    $this->artisan('app:close-registration')->assertSuccessful();

    expect($event->fresh()->reschedule_attempt)->toBe(1)
        ->and($event->fresh()->status)->toBe('open');
});
