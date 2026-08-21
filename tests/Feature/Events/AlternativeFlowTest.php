<?php

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventAlternative;
use App\Models\EventParticipant;
use App\Services\Company\CompanyEventService;
use App\Services\Events\EventStateMachine;
use App\Services\Events\ParticipationService;
use Illuminate\Support\Carbon;

// H §9: provider_alternative — قبول المنشئ يعيدها open بالتاريخ الجديد
// **مع بقاء المشاركين** ونافذة انسحاب حر 6 ساعات؛ رفضه (أو انقضاء 12 ساعة)
// = cancelled_provider.

function alternativeFixture(): array
{
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
        'capacity' => 6,
        'min_participants' => 2,
        'participants_count' => 0,
        'status' => 'open',
        'event_date' => now()->addDays(4)->toDateString(),
        'start_time' => '18:00',
        'community_contribution' => 0,
        'discount_amount' => null,
    ]);

    $service = app(ParticipationService::class);
    $members = collect(range(1, 3))->map(function () use ($community) {
        $employee = Employee::factory()->create(['company_id' => $community->company_id]);
        $community->members()->attach($employee->id, ['status' => 'active', 'joined_at' => now()]);

        return $employee;
    });

    foreach ($members as $member) {
        $service->join($event->fresh(), $member);
    }

    // بلغت الحد الأدنى فانتقلت pending_provider (عند الانضمام الثاني)،
    // ثم اقترح المزوّد بديلاً — عبر الآلة كي يُسجَّل في التاريخ.
    app(EventStateMachine::class)->providerProposedAlternative($event->fresh());

    $alternative = EventAlternative::create([
        'event_id' => $event->id,
        'proposed_date' => now()->addDays(6)->toDateString(),
        'proposed_start_time' => '20:00',
        'proposed_end_time' => '21:00',
        'status' => 'proposed',
    ]);

    return [$event->fresh(), $alternative, $members];
}

it('acceptance returns the event to open on the new date, KEEPS participants, and opens a 6-hour free-withdrawal window', function () {
    [$event, $alternative, $members] = alternativeFixture();

    app(CompanyEventService::class)->acceptAlternativeForEvent($event, $alternative);

    $fresh = $event->fresh();

    // المشاركون محفوظون — الكود القديم كان يطردهم جميعاً إلا المنشئ.
    expect(EventParticipant::where('event_id', $event->id)->where('seat_status', 'reserved')->count())->toBe(3)
        ->and($fresh->participants_count)->toBe(3);

    // التاريخ الجديد + نافذة الانسحاب الحر.
    expect($fresh->event_date->toDateString())->toBe(Carbon::parse($alternative->proposed_date)->toDateString())
        ->and($fresh->free_withdrawal_until)->not->toBeNull()
        ->and(round(now()->diffInHours($fresh->free_withdrawal_until)))->toEqual(6.0)
        // العدد بلغ الحد الأدنى أصلاً → عاد الطلب للمزوّد فوراً على الموعد الجديد.
        ->and($fresh->status)->toBe('pending_provider');

    // registration_closes_at أُعيد اشتقاقه من الموعد الجديد.
    expect($fresh->registration_closes_at->gt(now()))->toBeTrue()
        ->and($fresh->registration_closes_at->lt($fresh->starts_at))->toBeTrue();

    // الانسحاب حر داخل النافذة (والتسجيل مفتوح أصلاً بالتاريخ الجديد).
    app(ParticipationService::class)->withdraw($fresh, $members[2]);
    expect(EventParticipant::where('event_id', $event->id)->where('employee_id', $members[2]->id)->value('seat_status'))
        ->toBe('cancelled');
});

it('rejecting the only proposed alternative cancels the event as cancelled_provider', function () {
    [$event, $alternative] = alternativeFixture();

    app(CompanyEventService::class)->rejectAlternativeForEvent($event, $alternative);

    expect($event->fresh()->status)->toBe('cancelled_provider')
        ->and($alternative->fresh()->status)->toBe('rejected');
});

it('creator no-response for 12 hours cancels the event via the deadline command', function () {
    [$event] = alternativeFixture();

    $this->travel(13)->hours();

    $this->artisan('app:expire-provider-deadlines')->assertSuccessful();

    expect($event->fresh()->status)->toBe('cancelled_provider')
        ->and($event->fresh()->rejection_reason)->toContain('انتهت مهلة رد منشئ الفعالية');
});
