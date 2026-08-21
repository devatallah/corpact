<?php

use App\Models\ActivityLog;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\JobRun;
use App\Models\Notification;
use App\Services\Community\LeadershipService;
use App\Services\Employee\EventCreationService;
use Illuminate\Validation\ValidationException;

// H §6 lifecycle: leaderless 14 days → alert the account manager; 30 days →
// dormant (خامل) and event generation stops. Idempotent through JobRun.

function leaderlessCommunity(int $daysAgo): array
{
    $company = Company::factory()->create();
    $community = Community::factory()->create([
        'company_id' => $company->id,
        'status' => Community::STATUS_ACTIVE,
        'leaderless_since' => now()->subDays($daysAgo),
    ]);

    return [$company, $community];
}

function amAlertCount(Company $company, string $type): int
{
    return Notification::query()
        ->where('notifiable_type', Company::class)
        ->where('notifiable_id', $company->id)
        ->where('type', $type)
        ->count();
}

test('a freshly leaderless community gets its clock started but no alert yet', function () {
    $company = Company::factory()->create();
    $community = Community::factory()->create([
        'company_id' => $company->id,
        'leaderless_since' => null,
    ]);

    $this->artisan('app:check-dormant-communities')->assertSuccessful();

    // Self-healing bookkeeping: the clock starts, no alert before 14 days.
    expect($community->fresh()->leaderless_since)->not->toBeNull()
        ->and(amAlertCount($company, 'community_leaderless_alert'))->toBe(0)
        ->and($community->fresh()->status)->toBe(Community::STATUS_ACTIVE);
});

test('leaderless for 14 days alerts the account manager exactly once', function () {
    [$company, $community] = leaderlessCommunity(15);

    $this->artisan('app:check-dormant-communities')->assertSuccessful();
    expect(amAlertCount($company, 'community_leaderless_alert'))->toBe(1);

    // Idempotent: a re-run never double-alerts (JobRun::runOnce).
    $this->artisan('app:check-dormant-communities')->assertSuccessful();
    expect(amAlertCount($company, 'community_leaderless_alert'))->toBe(1)
        ->and($community->fresh()->status)->toBe(Community::STATUS_ACTIVE);
});

test('leaderless for 30 days turns the community dormant with an audit trail — idempotently', function () {
    [$company, $community] = leaderlessCommunity(31);

    $this->artisan('app:check-dormant-communities')->assertSuccessful();

    expect($community->fresh()->status)->toBe(Community::STATUS_DORMANT)
        ->and(amAlertCount($company, 'community_dormant'))->toBe(1);

    expect(ActivityLog::query()
        ->where('subject_type', $community->getMorphClass())
        ->where('subject_id', $community->id)
        ->where('type', 'community_dormant')
        ->exists())->toBeTrue();

    // Re-run: no duplicate notification, no state churn.
    $this->artisan('app:check-dormant-communities')->assertSuccessful();
    expect(amAlertCount($company, 'community_dormant'))->toBe(1);

    expect(JobRun::query()
        ->where('job', 'app:check-dormant-communities')
        ->where('entity_type', 'community')
        ->where('entity_id', $community->id)
        ->where('status', 'completed')
        ->count())->toBeGreaterThanOrEqual(1);
});

test('a community with a leader gets its stale leaderless clock cleared', function () {
    $company = Company::factory()->create();
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);

    app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);

    // Simulate drift: a stale clock on a community that actually has a leader.
    $community->forceFill(['leaderless_since' => now()->subDays(20)])->save();

    $this->artisan('app:check-dormant-communities')->assertSuccessful();

    expect($community->fresh()->leaderless_since)->toBeNull()
        ->and(amAlertCount($company, 'community_leaderless_alert'))->toBe(0);
});

test('event creation is blocked in a dormant community', function () {
    $company = Company::factory()->create();
    $creator = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create([
        'company_id' => $company->id,
        'status' => Community::STATUS_DORMANT,
        'leaderless_since' => now()->subDays(40),
    ]);

    app(EventCreationService::class)->create($creator->fresh(), [
        'community_id' => $community->id,
    ]);
})->throws(ValidationException::class);

test('a new leaderless episode after re-leadership alerts again', function () {
    $company = Company::factory()->create();
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    [$company2, $community] = [null, null];

    $community = Community::factory()->create([
        'company_id' => $company->id,
        'status' => Community::STATUS_ACTIVE,
        'leaderless_since' => now()->subDays(20),
    ]);

    $this->artisan('app:check-dormant-communities')->assertSuccessful();
    expect(amAlertCount($company, 'community_leaderless_alert'))->toBe(1);

    // A leader is assigned, then steps down later — a NEW episode with a
    // different leaderless_since date.
    $service = app(LeadershipService::class);
    $service->assignLeader($community, $leader->fresh(), asPrimary: true);
    $service->removeLeader($community, $leader->fresh());

    $community->forceFill(['leaderless_since' => now()->subDays(15)])->save();

    $this->artisan('app:check-dormant-communities')->assertSuccessful();

    // The new episode (different leaderless_since date) alerts again.
    expect(amAlertCount($company, 'community_leaderless_alert'))->toBe(2);
});
