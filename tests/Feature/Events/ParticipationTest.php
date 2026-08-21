<?php

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\ParticipantEvent;
use App\Services\Events\ParticipationService;

// H §10: الحقول الثلاثة المنفصلة + الانضمام الذري + الانسحاب حالةً لا حذفاً.

function participationFixture(int $capacity = 10, int $min = 4): array
{
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'capacity' => $capacity,
        'min_participants' => $min,
        'participants_count' => 0,
        'is_full' => false,
        'status' => 'open',
        'event_date' => now()->addDays(3)->toDateString(),
        'start_time' => '18:00',
    ]);

    return [$event->fresh(), $community, $company];
}

function communityMember(Community $community): Employee
{
    $employee = Employee::factory()->create(['company_id' => $community->company_id]);
    $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);

    return $employee;
}

it('joins a member with a reserved seat, payment not_due, and a change-log line', function () {
    [$event, $community] = participationFixture();
    $member = communityMember($community);

    $result = app(ParticipationService::class)->join($event, $member);

    $row = EventParticipant::where('event_id', $event->id)->where('employee_id', $member->id)->first();

    expect($result)->toBe('reserved')
        ->and($row->seat_status)->toBe('reserved')
        ->and($row->payment_status)->toBe('not_due') // لا تحصيل عند الانضمام إطلاقاً
        ->and($event->fresh()->participants_count)->toBe(1);

    $log = ParticipantEvent::where('event_id', $event->id)->where('employee_id', $member->id)->first();
    expect($log->field)->toBe('seat_status')
        ->and($log->to_value)->toBe('reserved');
});

it('rejects joining for non-members of the community', function () {
    [$event] = participationFixture();
    $stranger = Employee::factory()->create(['company_id' => $event->company_id]);

    expect(fn () => app(ParticipationService::class)->join($event, $stranger))
        ->toThrow(RuntimeException::class, 'الانضمام متاح لأعضاء المجتمع فقط.');
});

it('transitions open to pending_provider when the minimum is reached at join', function () {
    [$event, $community] = participationFixture(capacity: 10, min: 2);

    app(ParticipationService::class)->join($event, communityMember($community));
    expect($event->fresh()->status)->toBe('open');

    app(ParticipationService::class)->join($event, communityMember($community));
    expect($event->fresh()->status)->toBe('pending_provider');
});

it('withdrawal before close flips seat_status to cancelled and never deletes the row', function () {
    [$event, $community] = participationFixture();
    $member = communityMember($community);
    $service = app(ParticipationService::class);

    $service->join($event, $member);
    $service->withdraw($event, $member);

    $row = EventParticipant::where('event_id', $event->id)->where('employee_id', $member->id)->first();

    expect($row)->not->toBeNull() // الصف باقٍ — التاريخ لا يُمحى
        ->and($row->seat_status)->toBe('cancelled')
        ->and($event->fresh()->participants_count)->toBe(0);

    expect(ParticipantEvent::where('event_id', $event->id)
        ->where('employee_id', $member->id)
        ->pluck('to_value')->all())->toBe(['reserved', 'cancelled']);
});

it('refuses self-withdrawal after registration close', function () {
    [$event, $community] = participationFixture();
    $member = communityMember($community);
    $service = app(ParticipationService::class);

    $service->join($event, $member);

    $event->forceFill(['registration_closes_at' => now()->subMinute()])->save();

    expect(fn () => $service->withdraw($event->fresh(), $member))
        ->toThrow(RuntimeException::class, 'أُغلق التسجيل — لا انسحاب بعد الإغلاق.');
});

it('re-joining after withdrawal reuses the same row', function () {
    [$event, $community] = participationFixture();
    $member = communityMember($community);
    $service = app(ParticipationService::class);

    $service->join($event, $member);
    $service->withdraw($event, $member);
    $service->join($event, $member);

    expect(EventParticipant::where('event_id', $event->id)->where('employee_id', $member->id)->count())->toBe(1)
        ->and(EventParticipant::where('event_id', $event->id)->where('employee_id', $member->id)->value('seat_status'))->toBe('reserved');
});

it('removal by management releases the seat (released, not cancelled) and keeps the row', function () {
    [$event, $community] = participationFixture();
    $member = communityMember($community);
    $service = app(ParticipationService::class);

    $service->join($event, $member);
    $service->remove($event, $member, null, 'إزالة اختبارية');

    expect(EventParticipant::where('event_id', $event->id)->where('employee_id', $member->id)->value('seat_status'))
        ->toBe('released');
});

it('does NOT revert pending_provider to open when withdrawal drops the count below minimum', function () {
    [$event, $community] = participationFixture(capacity: 10, min: 2);
    $service = app(ParticipationService::class);

    $first = communityMember($community);
    $second = communityMember($community);
    $service->join($event, $first);
    $service->join($event, $second);

    expect($event->fresh()->status)->toBe('pending_provider');

    // جدول §9 لا يعرف انتقال pending_provider ← open — الحالة تبقى،
    // والحسم عند إغلاق التسجيل (cancelled_min_not_met إن بقي العدد ناقصاً).
    $service->withdraw($event->fresh(), $second);

    expect($event->fresh()->status)->toBe('pending_provider')
        ->and($event->fresh()->participants_count)->toBe(1);
});

// اختبار القبول الإلزامي (H §10): 100 طلب انضمام على 10 مقاعد ← 10 محجوزة
// و90 في قائمة الانتظار — لا 11 ولا 9. التزامن الحقيقي غير ممكن على SQLite
// في الاختبار؛ جوهر الضمانة معاملة lockForUpdate واحدة للحجز والقراءة معاً
// (ParticipationService::join)، وهذا يثبت العدّ الدقيق عبر المسار نفسه.
it('100 joins on 10 seats yield exactly 10 reserved and 90 waitlisted in strict FIFO', function () {
    [$event, $community] = participationFixture(capacity: 10, min: 4);
    $service = app(ParticipationService::class);

    $members = collect(range(1, 100))->map(fn () => communityMember($community));

    $results = $members->map(fn (Employee $member) => $service->join($event->fresh(), $member));

    expect($results->filter(fn ($r) => $r === 'reserved')->count())->toBe(10)
        ->and($results->filter(fn ($r) => $r === 'waitlisted')->count())->toBe(90);

    $reserved = EventParticipant::where('event_id', $event->id)->where('seat_status', 'reserved')->count();
    $waitlisted = EventParticipant::where('event_id', $event->id)->where('seat_status', 'waitlisted')
        ->orderBy('position')->pluck('position');

    expect($reserved)->toBe(10)
        ->and($waitlisted->count())->toBe(90)
        ->and($waitlisted->all())->toBe(range(1, 90)) // FIFO صارم بلا فجوات
        ->and($event->fresh()->is_full)->toBeTrue()
        ->and($event->fresh()->participants_count)->toBe(10);
});
