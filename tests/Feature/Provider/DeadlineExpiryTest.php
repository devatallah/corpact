<?php

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventProviderRequest;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\ProviderReliabilityLog;

// A9 — مهلة رد المزوّد (H §11 + §20): طلب pending تجاوز مهلته يسقط عبر
// app:expire-provider-deadlines مع أثر −3 وإشعارات، وبمفتاح idempotency.

function expirySetup(): array
{
    $partner = Partner::factory()->create();
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $creator = Employee::factory()->create(['company_id' => $company->id]);

    $event = Event::factory()->create([
        'partner_id' => $partner->id,
        'company_id' => $company->id,
        'community_id' => $community->id,
        'created_by' => $creator->id,
        'event_date' => now()->addDays(2)->toDateString(),
        'start_time' => '18:00',
        'duration_minutes' => 90,
        'status' => 'open',
    ]);
    $event->update(['status' => 'pending_provider']);

    $request = EventProviderRequest::where('event_id', $event->id)->firstOrFail();

    return [$partner, $event, $request, $creator];
}

test('an overdue pending request expires with a −3 reliability penalty and notifications', function () {
    [$partner, $event, $request, $creator] = expirySetup();
    $scoreBefore = $partner->fresh()->reliability_score;

    $request->update(['deadline_at' => now()->subHour()]);

    $this->artisan('app:expire-provider-deadlines')->assertSuccessful();

    $request->refresh();
    expect($request->status)->toBe('expired')
        ->and($request->late_response)->toBeTrue()
        ->and($partner->fresh()->reliability_score)->toBe($scoreBefore - 3);

    $log = ProviderReliabilityLog::where('partner_id', $partner->id)
        ->where('reason', 'late_response')->first();
    expect($log)->not->toBeNull()
        ->and($log->delta)->toBe(-3)
        ->and($log->counts_as_sample)->toBeTrue();

    // إشعارات: المزوّد + الشركة + المنشئ
    expect(Notification::where('notifiable_type', Partner::class)->where('notifiable_id', $partner->id)->where('title', 'انتهت مهلة الرد')->exists())->toBeTrue()
        ->and(Notification::where('notifiable_type', Company::class)->where('notifiable_id', $event->company_id)->where('title', 'المزوّد لم يرد في المهلة')->exists())->toBeTrue()
        ->and(Notification::where('notifiable_type', Employee::class)->where('notifiable_id', $creator->id)->where('title', 'المزوّد لم يرد في المهلة')->exists())->toBeTrue();
});

test('the expiry job is idempotent — rerunning applies no second penalty', function () {
    [$partner, , $request] = expirySetup();
    $request->update(['deadline_at' => now()->subHour()]);

    $this->artisan('app:expire-provider-deadlines')->assertSuccessful();
    $scoreAfterFirst = $partner->fresh()->reliability_score;

    $this->artisan('app:expire-provider-deadlines')->assertSuccessful();

    expect($partner->fresh()->reliability_score)->toBe($scoreAfterFirst)
        ->and(ProviderReliabilityLog::where('partner_id', $partner->id)->count())->toBe(1);
});

test('a request still inside its deadline is untouched', function () {
    [$partner, , $request] = expirySetup();

    $this->artisan('app:expire-provider-deadlines')->assertSuccessful();

    expect($request->fresh()->status)->toBe('pending')
        ->and($partner->fresh()->reliability_score)->toBe(80);
});

test('a decision after the deadline (before the job runs) binds but counts as a late response', function () {
    [$partner, $event, $request] = expirySetup();
    $request->update(['deadline_at' => now()->subMinutes(30)]);

    $this->actingAs($partner, 'partner')
        ->post(route('partner.provider-requests.accept', $request))
        ->assertRedirect()->assertSessionHasNoErrors();

    $request->refresh();
    expect($request->status)->toBe('accepted')
        ->and($request->late_response)->toBeTrue()
        ->and($event->fresh()->status)->toBe('booked')
        // متأخر: −3 بدل +2
        ->and($partner->fresh()->reliability_score)->toBe(77);
});
