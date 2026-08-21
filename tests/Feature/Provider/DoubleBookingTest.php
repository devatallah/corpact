<?php

use App\Models\ActivityUnit;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\Partner;
use App\Models\ProviderBranch;
use App\Models\UnitSlot;
use App\Services\Provider\AvailabilityService;
use App\Services\Provider\ProviderRequestService;
use Illuminate\Validation\ValidationException;

// A9 — تقويم المنصة مصدر الحقيقة الوحيد (H §11): القبول يحجز الوحدة داخل
// معاملة بقفل تمنع الحجز المزدوج، والحجوزات الخارجية «حجز خارجي» تحجب الوقت.

function bookingSetup(): array
{
    $partner = Partner::factory()->create();
    $branch = ProviderBranch::factory()->create(['partner_id' => $partner->id]);
    $unit = ActivityUnit::factory()->create(['provider_branch_id' => $branch->id]);

    return [$partner, $unit];
}

function requestForSlot(Partner $partner, ActivityUnit $unit, string $date, string $time): EventProviderRequest
{
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $creator = Employee::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create([
        'partner_id' => $partner->id,
        'company_id' => $company->id,
        'community_id' => $community->id,
        'created_by' => $creator->id,
        'event_date' => $date,
        'start_time' => $time,
        'duration_minutes' => 90,
        'status' => 'open',
    ]);

    $event->update(['status' => 'pending_provider']);

    $request = EventProviderRequest::where('event_id', $event->id)->firstOrFail();
    $request->update(['activity_unit_id' => $unit->id]);

    return $request->fresh();
}

test('two accepts on the same slot: the first books, the second hits the lock and fails', function () {
    [$partner, $unit] = bookingSetup();
    $date = now()->addDays(3)->toDateString();

    $first = requestForSlot($partner, $unit, $date, '18:00');
    $second = requestForSlot($partner, $unit, $date, '18:00');

    $service = app(ProviderRequestService::class);
    $service->accept($partner, $first);

    expect(UnitSlot::where('activity_unit_id', $unit->id)->count())->toBe(1);

    // القبول الثاني على نفس الفتحة يفشل داخل المعاملة — لا حجز مزدوج
    expect(fn () => $service->accept($partner, $second))
        ->toThrow(ValidationException::class);

    expect($second->fresh()->status)->toBe('pending')
        ->and($second->fresh()->event->status)->toBe('pending_provider')
        ->and(UnitSlot::where('activity_unit_id', $unit->id)->count())->toBe(1);
});

test('an overlapping (not identical) slot is also blocked', function () {
    [$partner, $unit] = bookingSetup();
    $date = now()->addDays(3)->toDateString();

    $first = requestForSlot($partner, $unit, $date, '18:00');   // 18:00–19:30
    $overlap = requestForSlot($partner, $unit, $date, '19:00'); // 19:00–20:30

    $service = app(ProviderRequestService::class);
    $service->accept($partner, $first);

    expect(fn () => $service->accept($partner, $overlap))
        ->toThrow(ValidationException::class);
});

test('an external booking «حجز خارجي» blocks acceptance of that time', function () {
    [$partner, $unit] = bookingSetup();
    $date = now()->addDays(3)->toDateString();

    app(AvailabilityService::class)->markExternal($unit, $date, '17:30', '19:00', 'صيانة');

    $request = requestForSlot($partner, $unit, $date, '18:00');

    expect(fn () => app(ProviderRequestService::class)->accept($partner, $request))
        ->toThrow(ValidationException::class);
});

test('a provider marks and removes external bookings from the availability panel', function () {
    [$partner, $unit] = bookingSetup();
    $date = now()->addDays(2)->toDateString();

    $this->actingAs($partner, 'partner')
        ->post(route('partner.availability.external.store'), [
            'activity_unit_id' => $unit->id,
            'date' => $date,
            'start_time' => '20:00',
            'end_time' => '21:30',
        ])->assertRedirect()->assertSessionHasNoErrors();

    $slot = UnitSlot::where('activity_unit_id', $unit->id)->first();
    expect($slot->booking_type)->toBe('external')
        ->and($slot->note)->toBe('حجز خارجي');

    // تداخل خارجي فوق خارجي يُرفض
    $this->actingAs($partner, 'partner')
        ->post(route('partner.availability.external.store'), [
            'activity_unit_id' => $unit->id,
            'date' => $date,
            'start_time' => '21:00',
            'end_time' => '22:00',
        ])->assertSessionHasErrors();

    $this->actingAs($partner, 'partner')
        ->delete(route('partner.availability.external.destroy', $slot))
        ->assertRedirect();

    expect(UnitSlot::count())->toBe(0);
});

test('an internal platform booking cannot be deleted from the calendar', function () {
    [$partner, $unit] = bookingSetup();
    $request = requestForSlot($partner, $unit, now()->addDays(3)->toDateString(), '18:00');
    app(ProviderRequestService::class)->accept($partner, $request);

    $slot = UnitSlot::where('booking_type', 'internal')->firstOrFail();

    $this->actingAs($partner, 'partner')
        ->delete(route('partner.availability.external.destroy', $slot))
        ->assertSessionHasErrors();

    expect(UnitSlot::count())->toBe(1);
});

test('provider cancellation after acceptance releases the slot, applies −15 and refunds in full', function () {
    [$partner, $unit] = bookingSetup();
    $request = requestForSlot($partner, $unit, now()->addDays(3)->toDateString(), '18:00');

    $service = app(ProviderRequestService::class);
    $service->accept($partner, $request);

    $scoreAfterAccept = $partner->fresh()->reliability_score;

    $this->actingAs($partner, 'partner')
        ->post(route('partner.provider-requests.cancel', $request->fresh()), [
            'reason' => 'حجز خارجي لم يُسجَّل',
            'stale_availability' => true,
        ])->assertRedirect()->assertSessionHasNoErrors();

    $request->refresh();
    expect($request->status)->toBe('cancelled')
        ->and($request->event->status)->toBe('cancelled_provider')
        ->and(UnitSlot::where('event_provider_request_id', $request->id)->count())->toBe(0)
        ->and($partner->fresh()->reliability_score)->toBe(max(0, $scoreAfterAccept - 15));

    // التعارض بسبب عدم تحديث التوفر يُوثَّق بسببه وسياسة الإلغاء
    $log = $partner->reliabilityLogs()->where('reason', 'stale_availability_conflict')->first();
    expect($log)->not->toBeNull()
        ->and($log->note)->toContain('سياسة إلغاء المزوّد');
});
