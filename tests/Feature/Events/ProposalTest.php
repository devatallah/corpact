<?php

use App\Models\Category;
use App\Models\Community;
use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EventStatusHistory;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\Venue;
use App\Models\VenuePricing;
use App\Services\Community\LeadershipService;
use App\Services\Employee\EventCreationService;
use App\Support\Tenancy\CompanyContext;
use Illuminate\Support\Carbon;

// H §7: الموظف العادي بلا إعداد employee_can_create_event ← اقتراح
// pending_approval يعتمده القائد/المنسّق خلال 48 ساعة وإلا رُفض تلقائياً.

function proposalFixture(): array
{
    $company = Company::factory()->create();
    $category = Category::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id, 'category_id' => $category->id]);

    $partner = Partner::factory()->create(['status' => 'active']);
    $venue = Venue::factory()->create(['partner_id' => $partner->id, 'category_id' => $category->id, 'status' => 'active']);
    $pricing = VenuePricing::factory()->create(['venue_id' => $venue->id, 'duration_minutes' => 60]);

    $member = Employee::factory()->create(['company_id' => $company->id]);
    $community->members()->attach($member->id, ['status' => 'active', 'joined_at' => now()]);

    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $community->members()->attach($leader->id, ['status' => 'active', 'joined_at' => now()]);
    app(CompanyContext::class)->bypass(function () use ($community, $leader): void {
        app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);
    });

    $data = [
        'community_id' => $community->id,
        'partner_id' => $partner->id,
        'category_id' => $category->id,
        'venue_pricing_id' => $pricing->id,
        'venue_ids' => [$venue->id],
        'date' => now()->addDays(5)->toDateString(),
        'time' => '18:00',
        'capacity' => 8,
        'min_participants' => 4,
        'company_subsidy' => 0,
    ];

    return [$community, $member, $leader, $data];
}

it('routes a plain member proposal to pending_approval when the company setting is off (default)', function () {
    [$community, $member, $leader, $data] = proposalFixture();

    $event = app(EventCreationService::class)->create($member->fresh(), $data);

    expect($event->status)->toBe('pending_approval')
        ->and($event->creator_role)->toBe('employee')
        ->and(EventStatusHistory::where('event_id', $event->id)->value('to_status'))->toBe('pending_approval');

    // يُشعَر القائد للاعتماد — لا الأعضاء.
    expect(Notification::where('notifiable_id', $leader->id)
        ->where('title', 'اقتراح فعالية بانتظار الاعتماد')->exists())->toBeTrue();
});

it('publishes directly (open) when employee_can_create_event is enabled', function () {
    [$community, $member, , $data] = proposalFixture();

    CompanySetting::where('company_id', $community->company_id)->update(['employee_can_create_event' => true]);

    $event = app(EventCreationService::class)->create($member->fresh(), $data);

    expect($event->status)->toBe('open');
});

it('publishes directly (open) for the community leader regardless of the setting', function () {
    [, , $leader, $data] = proposalFixture();

    $event = app(EventCreationService::class)->create($leader->fresh(), $data);

    expect($event->status)->toBe('open')
        ->and($event->creator_role)->toBe('community_leader');
});

it('lets the leader approve a proposal through the endpoint — pending_approval to open', function () {
    [, $member, $leader, $data] = proposalFixture();

    $event = app(EventCreationService::class)->create($member->fresh(), $data);

    $this->actingAs($leader->fresh(), 'employee')
        ->post("/employee/detail/{$event->id}/proposal/approve")
        ->assertSessionHas('success');

    expect($event->fresh()->status)->toBe('open')
        ->and(Notification::where('notifiable_id', $member->id)->where('title', 'اعتُمد اقتراحك')->exists())->toBeTrue();
});

it('blocks a plain member from approving proposals', function () {
    [$community, $member, , $data] = proposalFixture();

    $event = app(EventCreationService::class)->create($member->fresh(), $data);

    $other = Employee::factory()->create(['company_id' => $community->company_id]);
    $community->members()->attach($other->id, ['status' => 'active', 'joined_at' => now()]);

    $this->actingAs($other->fresh(), 'employee')
        ->post("/employee/detail/{$event->id}/proposal/approve")
        ->assertForbidden();

    expect($event->fresh()->status)->toBe('pending_approval');
});

it('lets the leader reject a proposal with a written reason', function () {
    [, $member, $leader, $data] = proposalFixture();

    $event = app(EventCreationService::class)->create($member->fresh(), $data);

    $this->actingAs($leader->fresh(), 'employee')
        ->post("/employee/detail/{$event->id}/proposal/reject", ['reason' => 'الموعد يتعارض مع نشاط آخر'])
        ->assertSessionHas('success');

    expect($event->fresh()->status)->toBe('rejected')
        ->and($event->fresh()->rejection_reason)->toBe('الموعد يتعارض مع نشاط آخر');
});

it('auto-rejects proposals older than 48 hours with a notification to the proposer', function () {
    $this->travelTo(Carbon::parse('2026-08-20 10:00:00'));

    [, $member, , $data] = proposalFixture();
    $data['date'] = '2026-08-30';

    $event = app(EventCreationService::class)->create($member->fresh(), $data);
    expect($event->status)->toBe('pending_approval');

    // قبل انقضاء المهلة — لا شيء.
    $this->travelTo(Carbon::parse('2026-08-22 09:00:00'));
    $this->artisan('app:expire-stale')->assertSuccessful();
    expect($event->fresh()->status)->toBe('pending_approval');

    // بعد 48 ساعة — رفض تلقائي + إشعار المقترح.
    $this->travelTo(Carbon::parse('2026-08-22 10:01:00'));
    $this->artisan('app:expire-stale')->assertSuccessful();

    expect($event->fresh()->status)->toBe('rejected');

    expect(Notification::where('notifiable_id', $member->id)
        ->where('title', 'رُفض اقتراحك تلقائياً')->exists())->toBeTrue();

    $history = EventStatusHistory::where('event_id', $event->id)->latest('id')->first();
    expect($history->to_status)->toBe('rejected')
        ->and($history->reason)->toContain('انقضت مهلة الاعتماد');
});
