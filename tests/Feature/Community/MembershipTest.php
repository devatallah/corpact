<?php

use App\Models\ActivityLog;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Notification;
use App\Models\User;
use App\Services\Community\LeadershipService;
use App\Services\Community\MembershipService;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

// H §6 membership: open by default; join/leave/rejoin recorded as states +
// dates, NEVER row deletion; remove (leader, documented reason) vs ban
// (account-manager-only, blocks rejoin); leaving cancels nothing confirmed.

function communityWithLeader(): array
{
    $company = Company::factory()->create();
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id, 'member_count' => 0]);

    app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);

    return [$company, $community, $leader->fresh()];
}

function membershipRowFor(Community $community, Employee $employee): ?CommunityMember
{
    return CommunityMember::query()
        ->where('community_id', $community->id)
        ->where('employee_id', $employee->id)
        ->first();
}

test('leaving flips the membership row to left with a date — the row is never deleted', function () {
    [, $community] = communityWithLeader();
    $member = Employee::factory()->create(['company_id' => $community->company_id]);

    $service = app(MembershipService::class);
    $service->join($member->fresh(), $community);

    expect(membershipRowFor($community, $member)->status)->toBe('active')
        ->and($community->fresh()->member_count)->toBe(2);

    $service->leave($member->fresh(), $community);

    $row = membershipRowFor($community, $member);

    expect($row)->not->toBeNull()
        ->and($row->status)->toBe('left')
        ->and($row->left_at)->not->toBeNull()
        ->and($community->fresh()->member_count)->toBe(1)
        ->and($community->members()->count())->toBe(1);
});

test('rejoining reactivates the same row', function () {
    [, $community] = communityWithLeader();
    $member = Employee::factory()->create(['company_id' => $community->company_id]);

    $service = app(MembershipService::class);
    $service->join($member->fresh(), $community);
    $service->leave($member->fresh(), $community);

    $rowId = membershipRowFor($community, $member)->id;

    $service->join($member->fresh(), $community);

    $row = membershipRowFor($community, $member);

    expect($row->id)->toBe($rowId)          // same row — states, not churn
        ->and($row->status)->toBe('active')
        ->and($row->left_at)->toBeNull();
});

test('membership is open within the company but closed across companies', function () {
    [, $community] = communityWithLeader();
    $insider = Employee::factory()->create(['company_id' => $community->company_id]);
    $outsider = Employee::factory()->create(['company_id' => Company::factory()->create()->id]);

    $service = app(MembershipService::class);

    $service->join($insider->fresh(), $community);
    expect(membershipRowFor($community, $insider)->status)->toBe('active');

    expect(fn () => $service->join($outsider->fresh(), $community))
        ->toThrow(ValidationException::class);
});

test('a leader cannot leave before transferring leadership', function () {
    [, $community, $leader] = communityWithLeader();

    app(MembershipService::class)->leave($leader, $community);
})->throws(ValidationException::class);

test('leaving cancels no confirmed participation and preserves membership history', function () {
    [$company, $community] = communityWithLeader();
    $member = Employee::factory()->create(['company_id' => $company->id]);

    $service = app(MembershipService::class);
    $service->join($member->fresh(), $community);

    $confirmed = Event::factory()->confirmed()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
    ]);
    $completed = Event::factory()->completed()->create([
        'company_id' => $company->id,
        'community_id' => $community->id,
    ]);

    EventParticipant::create(['event_id' => $confirmed->id, 'employee_id' => $member->id, 'seat_status' => 'reserved']);
    EventParticipant::create(['event_id' => $completed->id, 'employee_id' => $member->id, 'seat_status' => 'reserved']);

    $service->leave($member->fresh(), $community);

    // Confirmed paid participation survives; history rows (what the season
    // leaderboard reads — A12) stay intact.
    expect(EventParticipant::where('event_id', $confirmed->id)->where('employee_id', $member->id)->value('seat_status'))->toBe('reserved')
        ->and(EventParticipant::where('event_id', $completed->id)->where('employee_id', $member->id)->value('seat_status'))->toBe('reserved')
        ->and(membershipRowFor($community, $member))->not->toBeNull();
});

test('a leader removes a member with a documented reason — logged with actor, member may rejoin', function () {
    [$company, $community, $leader] = communityWithLeader();
    $member = Employee::factory()->create(['company_id' => $company->id]);

    app(MembershipService::class)->join($member->fresh(), $community);

    $this->actingAs($leader, 'employee')
        ->post(route('employee.community.members.remove', [$community, $member]), [
            'reason' => 'سلوك غير لائق في الفعاليات',
        ])
        ->assertRedirect();

    $row = membershipRowFor($community, $member);

    expect($row->status)->toBe('removed')
        ->and($row->status_reason)->toBe('سلوك غير لائق في الفعاليات');

    $log = ActivityLog::query()
        ->where('type', 'community_member_removed')
        ->where('subject_id', $community->id)
        ->first();

    expect($log)->not->toBeNull()
        ->and($log->actor_user_id)->toBe($leader->user_id)
        ->and($log->data['reason'])->toBe('سلوك غير لائق في الفعاليات');

    // Removal does NOT block rejoining — only a ban does.
    app(MembershipService::class)->join($member->fresh(), $community);
    expect(membershipRowFor($community, $member)->status)->toBe('active');
});

test('removing without a reason is rejected', function () {
    [$company, $community, $leader] = communityWithLeader();
    $member = Employee::factory()->create(['company_id' => $company->id]);

    app(MembershipService::class)->join($member->fresh(), $community);

    $this->actingAs($leader, 'employee')
        ->from(route('employee.community.show', $community))
        ->post(route('employee.community.members.remove', [$community, $member]), [])
        ->assertSessionHasErrors('reason');

    expect(membershipRowFor($community, $member)->status)->toBe('active');
});

test('a plain member cannot remove anyone', function () {
    [$company, $community] = communityWithLeader();
    $member = Employee::factory()->create(['company_id' => $company->id]);
    $victim = Employee::factory()->create(['company_id' => $company->id]);

    $service = app(MembershipService::class);
    $service->join($member->fresh(), $community);
    $service->join($victim->fresh(), $community);

    $this->actingAs($member->fresh(), 'employee')
        ->post(route('employee.community.members.remove', [$community, $victim]), [
            'reason' => 'لا يعجبني',
        ])
        ->assertForbidden();

    expect(membershipRowFor($community, $victim)->status)->toBe('active');
});

test('banning is account-manager-only and blocks rejoining', function () {
    [$company, $community, $leader] = communityWithLeader();
    $member = Employee::factory()->create(['company_id' => $company->id]);

    $service = app(MembershipService::class);
    $service->join($member->fresh(), $community);

    // The leader has no ban permission — enforced by the matrix.
    $leaderUser = User::query()->find($leader->user_id);
    expect(fn () => $service->banMember($community, $member->fresh(), 'سبب', $leaderUser))
        ->toThrow(HttpException::class);

    // The AM bans through the company portal with a documented reason.
    $this->actingAs($company, 'company')
        ->post(route('company.communities.members.ban', [$community, $member]), [
            'reason' => 'إساءة متكررة موثقة',
        ])
        ->assertRedirect();

    $row = membershipRowFor($community, $member);

    expect($row->status)->toBe('banned')
        ->and($row->status_reason)->toBe('إساءة متكررة موثقة');

    $log = ActivityLog::query()->where('type', 'community_member_banned')->first();
    expect($log)->not->toBeNull()
        ->and($log->actor_user_id)->not->toBeNull();

    // A banned member cannot rejoin.
    expect(fn () => $service->join($member->fresh(), $community))
        ->toThrow(ValidationException::class);

    expect(membershipRowFor($community, $member)->status)->toBe('banned');
});

test('a leader invites a specific employee — invite is a notification, joining stays a choice', function () {
    [$company, $community, $leader] = communityWithLeader();
    $invitee = Employee::factory()->create(['company_id' => $company->id]);

    $this->actingAs($leader, 'employee')
        ->post(route('employee.community.invite', $community), ['employee_id' => $invitee->id])
        ->assertRedirect();

    expect(Notification::query()
        ->where('notifiable_type', Employee::class)
        ->where('notifiable_id', $invitee->id)
        ->where('type', 'community_invite')
        ->exists())->toBeTrue();

    // No membership was forced.
    expect(membershipRowFor($community, $invitee))->toBeNull();
});

test('a plain member cannot invite', function () {
    [$company, $community] = communityWithLeader();
    $member = Employee::factory()->create(['company_id' => $company->id]);
    $invitee = Employee::factory()->create(['company_id' => $company->id]);

    app(MembershipService::class)->join($member->fresh(), $community);

    $this->actingAs($member->fresh(), 'employee')
        ->post(route('employee.community.invite', $community), ['employee_id' => $invitee->id])
        ->assertForbidden();
});
