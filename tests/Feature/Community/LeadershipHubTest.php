<?php

use App\Enums\Role;
use App\Models\Community;
use App\Models\Employee;
use App\Models\RoleAssignment;
use App\Services\Community\LeadershipService;
use App\Services\Identity\IdentityBackfillService;
use Inertia\Testing\AssertableInertia;

/**
 * «قيادتي» — أدوات القائد مُسمّاة في القائمة لا مدفونة في صفحة.
 *
 * القيادة ليست بوابة منفصلة، فالتبويب يُضاف لمن يقود ويغيب عمّن لا يقود.
 * والصفحة تعرض ما يقوده هذا الموظف وحده — لا مجتمعات شركته كلها.
 */
function leaderWorld(): array
{
    $community = Community::factory()->create();
    $leader = Employee::factory()->create(['company_id' => $community->company_id]);
    $member = Employee::factory()->create(['company_id' => $community->company_id]);

    app(IdentityBackfillService::class)->run();

    $community->members()->attach([
        $leader->id => ['status' => 'active', 'joined_at' => now()],
        $member->id => ['status' => 'active', 'joined_at' => now()],
    ]);
    app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);

    return [$community, $leader->fresh(), $member->fresh()];
}

test('a leader is offered the leadership tab; a plain member is not', function () {
    [, $leader, $member] = leaderWorld();

    $this->actingAs($leader, 'employee')
        ->get('/employee/home')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->has('auth.leadership', 1));

    // العضو العادي لا يقود شيئاً — فلا تبويب له.
    $this->actingAs($member, 'employee')
        ->get('/employee/home')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->has('auth.leadership', 0));
});

test('the hub lists only the communities this employee leads', function () {
    [$mine, $leader] = leaderWorld();

    // مجتمع آخر في الشركة نفسها لا يقوده — لا يظهر.
    Community::factory()->create(['company_id' => $mine->company_id]);

    $this->actingAs($leader, 'employee')
        ->get('/employee/leadership')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('communities', 1)
            ->where('communities.0.id', $mine->id)
            ->where('communities.0.is_primary', true)
        );
});

test('an employee who leads nothing gets an empty hub, not an error', function () {
    [, , $member] = leaderWorld();

    $this->actingAs($member, 'employee')
        ->get('/employee/leadership')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->has('communities', 0));
});

test('leadership never leaks across companies', function () {
    [, $leader] = leaderWorld();
    [$foreign] = leaderWorld();

    $this->actingAs($leader, 'employee')
        ->get('/employee/leadership')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('communities', 1)
            ->where('communities.0.id', fn (int $id) => $id !== $foreign->id)
        );
});

test('a deputy leader reaches the same tools, marked as deputy', function () {
    [$community, $leader] = leaderWorld();

    $deputy = Employee::factory()->create(['company_id' => $community->company_id]);
    app(IdentityBackfillService::class)->run();
    $community->members()->attach($deputy->id, ['status' => 'active', 'joined_at' => now()]);
    app(LeadershipService::class)->assignLeader($community, $deputy->fresh(), asPrimary: false);

    $this->actingAs($deputy->fresh(), 'employee')
        ->get('/employee/leadership')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('communities', 1)
            ->where('communities.0.is_primary', false)
        );

    expect(RoleAssignment::query()
        ->where('role', Role::CommunityLeader->value)
        ->where('scope_id', $community->id)
        ->count())->toBe(2)
        ->and($leader->id)->not->toBeNull();
});
