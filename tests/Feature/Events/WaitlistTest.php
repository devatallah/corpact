<?php

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Notification;
use App\Services\Events\ParticipationService;
use Illuminate\Support\Carbon;

// H §10: قائمة انتظار FIFO صارمة، وعرض المقعد الشاغر بمهلة
// 120 دقيقة ← 30 دقيقة (< 6 ساعات على الإغلاق) ← فوري «الأسبق يفوز» (< ساعة).

function waitlistFixture(int $capacity = 2): array
{
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'capacity' => $capacity,
        'min_participants' => $capacity, // يمنع قفزة pending_provider أثناء الاختبار
        'participants_count' => 0,
        'is_full' => false,
        'status' => 'open',
        'event_date' => now()->addDays(3)->toDateString(),
        'start_time' => '18:00',
    ]);

    return [$event->fresh(), $community];
}

function waitlistMember(Community $community): Employee
{
    $employee = Employee::factory()->create(['company_id' => $community->company_id]);
    $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);

    return $employee;
}

function offerRow(Event $event, Employee $employee): ?EventParticipant
{
    return EventParticipant::where('event_id', $event->id)->where('employee_id', $employee->id)->first();
}

it('offers a vacated seat to the first in line with a 120-minute window', function () {
    $this->travelTo(Carbon::parse('2026-08-20 10:00:00'));

    [$event, $community] = waitlistFixture(capacity: 2);
    $service = app(ParticipationService::class);

    [$a, $b, $c, $d] = [waitlistMember($community), waitlistMember($community), waitlistMember($community), waitlistMember($community)];

    $service->join($event->fresh(), $a);
    $service->join($event->fresh(), $b);   // امتلأت
    $service->join($event->fresh(), $c);   // انتظار #1
    $service->join($event->fresh(), $d);   // انتظار #2

    $service->withdraw($event->fresh(), $a); // شغور مقعد

    $row = offerRow($event, $c);

    expect($row->seat_status)->toBe('waitlisted')
        ->and($row->offered_at)->not->toBeNull()
        ->and($row->offer_expires_at->toDateTimeString())->toBe('2026-08-20 12:00:00') // 120 دقيقة
        ->and(offerRow($event, $d)->offered_at)->toBeNull(); // الأسبق أولاً — الثاني لا يُعرض عليه

    expect(Notification::where('notifiable_id', $c->id)->where('title', 'شغر مقعد في الفعالية')->exists())->toBeTrue();
});

it('shrinks the offer window to 30 minutes when under 6 hours to registration close', function () {
    [$event, $community] = waitlistFixture(capacity: 1);
    $service = app(ParticipationService::class);

    [$a, $b] = [waitlistMember($community), waitlistMember($community)];
    $service->join($event->fresh(), $a);
    $service->join($event->fresh(), $b);

    // بقي 5 ساعات على الإغلاق.
    $closesAt = $event->fresh()->registration_closes_at;
    $this->travelTo($closesAt->copy()->subHours(5));

    $service->withdraw($event->fresh(), $a);

    $row = offerRow($event, $b);
    expect($row->offer_expires_at->diffInMinutes($row->offered_at))->toEqualWithDelta(-30.0, 0.1);
});

it('promotes instantly first-wins when under one hour to registration close', function () {
    [$event, $community] = waitlistFixture(capacity: 1);
    $service = app(ParticipationService::class);

    [$a, $b] = [waitlistMember($community), waitlistMember($community)];
    $service->join($event->fresh(), $a);
    $service->join($event->fresh(), $b);

    $closesAt = $event->fresh()->registration_closes_at;
    $this->travelTo($closesAt->copy()->subMinutes(30));

    $service->withdraw($event->fresh(), $a);

    expect(offerRow($event, $b)->seat_status)->toBe('reserved') // فوري — بلا عرض ولا مهلة
        ->and($event->fresh()->participants_count)->toBe(1);
});

it('accepting an offer within the window reserves the seat and compacts positions', function () {
    [$event, $community] = waitlistFixture(capacity: 1);
    $service = app(ParticipationService::class);

    [$a, $b, $c] = [waitlistMember($community), waitlistMember($community), waitlistMember($community)];
    $service->join($event->fresh(), $a);
    $service->join($event->fresh(), $b); // انتظار #1
    $service->join($event->fresh(), $c); // انتظار #2

    $service->withdraw($event->fresh(), $a);
    $service->acceptOffer($event->fresh(), $b);

    expect(offerRow($event, $b)->seat_status)->toBe('reserved')
        ->and(offerRow($event, $c)->position)->toBe(1); // ضُغطت المواضع
});

it('declining an offer passes the seat to the next in line', function () {
    [$event, $community] = waitlistFixture(capacity: 1);
    $service = app(ParticipationService::class);

    [$a, $b, $c] = [waitlistMember($community), waitlistMember($community), waitlistMember($community)];
    $service->join($event->fresh(), $a);
    $service->join($event->fresh(), $b);
    $service->join($event->fresh(), $c);

    $service->withdraw($event->fresh(), $a);
    $service->declineOffer($event->fresh(), $b);

    expect(offerRow($event, $b)->seat_status)->toBe('cancelled') // قرار المشارك
        ->and(offerRow($event, $c)->offered_at)->not->toBeNull(); // انتقل العرض للتالي
});

it('expires lapsed offers, releases the holder, and offers the seat to the next in line', function () {
    $this->travelTo(Carbon::parse('2026-08-20 10:00:00'));

    [$event, $community] = waitlistFixture(capacity: 1);
    $service = app(ParticipationService::class);

    [$a, $b, $c] = [waitlistMember($community), waitlistMember($community), waitlistMember($community)];
    $service->join($event->fresh(), $a);
    $service->join($event->fresh(), $b);
    $service->join($event->fresh(), $c);

    $service->withdraw($event->fresh(), $a);

    // انقضت المهلة (120 دقيقة) دون تأكيد.
    $this->travelTo(Carbon::parse('2026-08-20 12:01:00'));

    $expired = $service->expireLapsedOffers();

    expect($expired)->toBe(1)
        ->and(offerRow($event, $b)->seat_status)->toBe('released') // قرار نظام لا قرار مشارك
        ->and(offerRow($event, $c)->offered_at)->not->toBeNull()
        ->and(offerRow($event, $c)->position)->toBe(1);
});

it('does not offer seats after registration close and notifies the remaining waitlist at close', function () {
    [$event, $community] = waitlistFixture(capacity: 1);
    $service = app(ParticipationService::class);

    [$a, $b] = [waitlistMember($community), waitlistMember($community)];
    $service->join($event->fresh(), $a);
    $service->join($event->fresh(), $b);

    // أُغلق التسجيل.
    $event->forceFill(['registration_closes_at' => now()->subMinute()])->save();

    $service->cancelParticipation($event->fresh(), $a, null, 'إسقاط اختباري بعد الإغلاق');

    expect(offerRow($event, $b)->offered_at)->toBeNull(); // القائمة أُغلقت — لا عروض

    $service->closeWaitlist($event->fresh());

    expect(Notification::where('notifiable_id', $b->id)->where('title', 'أُغلق التسجيل')->exists())->toBeTrue()
        ->and(offerRow($event, $b)->seat_status)->toBe('waitlisted'); // يبقى بديلاً لغير الدافعين (A10)
});
