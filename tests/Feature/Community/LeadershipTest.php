<?php

use App\Enums\Role;
use App\Models\Category;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Notification;
use App\Models\RoleAssignment;
use App\Services\Community\LeadershipService;
use App\Services\Community\MembershipService;
use App\Services\Company\CommunityService;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

// H §6: multi-leader model through role_assignments with exactly one
// is_primary; no leader_id column; every leadership change is manual.

test('the communities table has no leader_id column and the pivot has no role column', function () {
    expect(Schema::hasColumn('communities', 'leader_id'))->toBeFalse()
        ->and(Schema::hasColumn('community_member', 'role'))->toBeFalse()
        ->and(Schema::hasColumn('communities', 'leaderless_since'))->toBeTrue();
});

test('creating a community grants primary leadership through role_assignments', function () {
    $company = Company::factory()->create();
    $leader = Employee::factory()->create(['company_id' => $company->id]);

    $community = app(CommunityService::class)->create($company, [
        'name' => 'مجتمع البادل',
        'category_id' => Category::factory()->create()->id,
        'leader_id' => $leader->id,
    ]);

    $assignment = RoleAssignment::query()
        ->where('role', Role::CommunityLeader->value)
        ->where('scope_type', 'community')
        ->where('scope_id', $community->id)
        ->first();

    expect($assignment)->not->toBeNull()
        ->and($assignment->user_id)->toBe($leader->fresh()->user_id)
        ->and($assignment->is_primary)->toBeTrue()
        ->and($community->isLeader($leader->fresh()))->toBeTrue();

    // The leader is automatically an active member.
    $membership = CommunityMember::query()
        ->where('community_id', $community->id)
        ->where('employee_id', $leader->id)
        ->first();

    expect($membership->status)->toBe(CommunityMember::STATUS_ACTIVE);
});

test('a community supports multiple leaders with exactly one primary', function () {
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $first = Employee::factory()->create(['company_id' => $company->id]);
    $second = Employee::factory()->create(['company_id' => $company->id]);

    $service = app(LeadershipService::class);

    // The first leader is always primary, even when not requested.
    $service->assignLeader($community, $first->fresh());
    // A second, non-primary co-leader.
    $service->assignLeader($community, $second->fresh());

    expect($community->leaderAssignments()->count())->toBe(2)
        ->and($community->primaryLeaderAssignment()->first()->user_id)->toBe($first->fresh()->user_id);

    // Promoting the second to primary demotes the first — never two primaries.
    $service->setPrimary($community, $second->fresh());

    expect($community->leaderAssignments()->where('is_primary', true)->count())->toBe(1)
        ->and($community->primaryLeaderAssignment()->first()->user_id)->toBe($second->fresh()->user_id);
});

test('transferring primary leadership removes the old primary but keeps them a member', function () {
    $company = Company::factory()->create();
    $old = Employee::factory()->create(['company_id' => $company->id]);
    $new = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);

    $service = app(LeadershipService::class);
    $service->assignLeader($community, $old->fresh(), asPrimary: true);

    $service->transferPrimary($community, $new->fresh());

    expect($community->isLeader($old->fresh()))->toBeFalse()
        ->and($community->isPrimaryLeader($new->fresh()))->toBeTrue();

    // The outgoing leader's membership row survives as an active member.
    $membership = CommunityMember::query()
        ->where('community_id', $community->id)
        ->where('employee_id', $old->id)
        ->first();

    expect($membership->status)->toBe(CommunityMember::STATUS_ACTIVE);
});

test('removing the only leader starts the leaderless clock and alerts the AM — no auto-assignment', function () {
    $company = Company::factory()->create();
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $member = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);

    $service = app(LeadershipService::class);
    $service->assignLeader($community, $leader->fresh(), asPrimary: true);
    app(MembershipService::class)->join($member->fresh(), $community);

    $service->removeLeader($community, $leader->fresh());

    $community->refresh();

    expect($community->leaderless_since)->not->toBeNull()
        // The remaining member is NOT auto-promoted («لا يعيّن النظام قائداً تلقائياً»).
        ->and($community->leaderAssignments()->count())->toBe(0);

    expect(Notification::query()
        ->where('notifiable_type', Company::class)
        ->where('notifiable_id', $company->id)
        ->where('type', 'community_leaderless')
        ->exists())->toBeTrue();
});

test('removing the primary while a co-leader remains asks the AM to designate — never auto-promotes', function () {
    $company = Company::factory()->create();
    $primary = Employee::factory()->create(['company_id' => $company->id]);
    $coLeader = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);

    $service = app(LeadershipService::class);
    $service->assignLeader($community, $primary->fresh(), asPrimary: true);
    $service->assignLeader($community, $coLeader->fresh());

    $service->removeLeader($community, $primary->fresh());

    // The co-leader keeps leadership but is NOT auto-promoted to primary.
    expect($community->isLeader($coLeader->fresh()))->toBeTrue()
        ->and($community->primaryLeaderAssignment()->exists())->toBeFalse()
        ->and($community->fresh()->leaderless_since)->toBeNull();

    expect(Notification::query()
        ->where('notifiable_type', Company::class)
        ->where('notifiable_id', $company->id)
        ->where('type', 'community_primary_needed')
        ->exists())->toBeTrue();
});

test('assigning a leader to a dormant community reactivates it', function () {
    $company = Company::factory()->create();
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create([
        'company_id' => $company->id,
        'status' => Community::STATUS_DORMANT,
        'leaderless_since' => now()->subDays(40),
    ]);

    app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);

    $community->refresh();

    expect($community->status)->toBe(Community::STATUS_ACTIVE)
        ->and($community->leaderless_since)->toBeNull();
});

test('a leader can step down through the employee portal — the community is left leaderless, no one promoted', function () {
    $company = Company::factory()->create();
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);

    app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);

    $this->actingAs($leader->fresh(), 'employee')
        ->post(route('employee.community.step-down', $community))
        ->assertRedirect();

    expect($community->fresh()->leaderless_since)->not->toBeNull()
        ->and($community->leaderAssignments()->count())->toBe(0);
});

test('a non-leader cannot step down or transfer leadership', function () {
    $company = Company::factory()->create();
    $member = Employee::factory()->create(['company_id' => $company->id]);
    $other = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);

    app(MembershipService::class)->join($member->fresh(), $community);

    $this->actingAs($member->fresh(), 'employee')
        ->post(route('employee.community.step-down', $community))
        ->assertForbidden();

    $this->actingAs($member->fresh(), 'employee')
        ->post(route('employee.community.transfer-leadership', $community), ['employee_id' => $other->id])
        ->assertForbidden();
});

test('the primary leader can transfer leadership through the employee portal', function () {
    $company = Company::factory()->create();
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $successor = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);

    app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);

    $this->actingAs($leader->fresh(), 'employee')
        ->post(route('employee.community.transfer-leadership', $community), ['employee_id' => $successor->id])
        ->assertRedirect();

    expect($community->isPrimaryLeader($successor->fresh()))->toBeTrue()
        ->and($community->isLeader($leader->fresh()))->toBeFalse();
});

test('a leader from another company cannot be assigned', function () {
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();
    $outsider = Employee::factory()->create(['company_id' => $companyB->id]);
    $community = Community::factory()->create(['company_id' => $companyA->id]);

    app(LeadershipService::class)->assignLeader($community, $outsider->fresh(), asPrimary: true);
})->throws(ValidationException::class);
