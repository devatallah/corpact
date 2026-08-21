<?php

use App\Enums\Role;
use App\Models\Category;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\EventTemplate;
use App\Models\Partner;
use App\Models\User;
use App\Services\Community\LeadershipService;
use App\Services\Community\MembershipService;
use Carbon\Carbon;

// H §8: من ينشئ القالب — قائد المجتمع أو المنسّق أو مسؤول الحساب
// (صلاحية template.manage في مصفوفة ملحق ب — لا العضو العادي).

function managementSetup(): array
{
    test()->travelTo(Carbon::parse('2026-09-06 10:00'));

    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id, 'status' => 'active']);
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $member = Employee::factory()->create(['company_id' => $company->id]);

    app(LeadershipService::class)->assignLeader($community, $leader->fresh(), asPrimary: true);
    app(MembershipService::class)->join($member->fresh(), $community);

    return [$company, $community, $leader->fresh(), $member->fresh()];
}

function templatePayload(): array
{
    return [
        'title' => 'تدريب الأحد',
        'partner_id' => Partner::factory()->create()->id,
        'category_id' => Category::factory()->create()->id,
        'recurrence_pattern' => 'weekly',
        'day_of_week' => 0,
        'starts_from' => '2026-09-06',
        'start_time' => '20:00',
        'duration_minutes' => 90,
        'capacity' => 10,
        'min_participants' => 4,
        'total_amount' => 500,
        'company_subsidy' => 100,
        'blackout_behavior' => 'skip',
    ];
}

it('a community leader creates, edits, and pauses a template from the employee portal', function () {
    [, $community, $leader] = managementSetup();

    $this->actingAs($leader, 'employee')
        ->get("/employee/community/{$community->id}/templates")
        ->assertOk();

    $this->actingAs($leader, 'employee')
        ->post("/employee/community/{$community->id}/templates", templatePayload())
        ->assertRedirect();

    $template = EventTemplate::withoutGlobalScopes()->where('community_id', $community->id)->first();
    expect($template)->not->toBeNull()
        ->and($template->recurrence_pattern)->toBe('weekly')
        ->and($template->day_of_week)->toBe(0)
        ->and($template->created_by)->toBe($leader->id)
        ->and((float) $template->company_subsidy)->toBe(100.0);

    $this->actingAs($leader, 'employee')
        ->patch("/employee/community/{$community->id}/templates/{$template->id}", [
            ...templatePayload(),
            'start_time' => '18:00',
        ])->assertRedirect();

    expect($template->fresh()->start_time)->toContain('18:00');

    $this->actingAs($leader, 'employee')
        ->post("/employee/community/{$community->id}/templates/{$template->id}/pause")
        ->assertRedirect();

    expect($template->fresh()->status)->toBe(EventTemplate::STATUS_PAUSED);

    $this->actingAs($leader, 'employee')
        ->post("/employee/community/{$community->id}/templates/{$template->id}/resume")
        ->assertRedirect();

    expect($template->fresh()->status)->toBe(EventTemplate::STATUS_ACTIVE);
});

it('a coordinator may manage templates; a plain member may not (ملحق ب)', function () {
    [, $community, , $member] = managementSetup();

    $this->actingAs($member, 'employee')
        ->post("/employee/community/{$community->id}/templates", templatePayload())
        ->assertForbidden();

    User::query()->find($member->user_id)
        ->assignRole(Role::Coordinator, 'community', $community->id);

    $this->actingAs($member->fresh(), 'employee')
        ->post("/employee/community/{$community->id}/templates", templatePayload())
        ->assertRedirect();

    expect(EventTemplate::withoutGlobalScopes()->where('community_id', $community->id)->count())->toBe(1);
});

it('the account manager manages templates from the company portal', function () {
    [$company, $community] = managementSetup();

    $this->actingAs($company, 'company')
        ->get("/company/communities/{$community->id}/templates")
        ->assertOk();

    $this->actingAs($company, 'company')
        ->post("/company/communities/{$community->id}/templates", templatePayload())
        ->assertRedirect();

    $template = EventTemplate::withoutGlobalScopes()->where('community_id', $community->id)->first();
    expect($template)->not->toBeNull();

    $this->actingAs($company, 'company')
        ->post("/company/communities/{$community->id}/templates/{$template->id}/pause")
        ->assertRedirect();

    expect($template->fresh()->status)->toBe(EventTemplate::STATUS_PAUSED);
});

it('a foreign company cannot reach another company community templates', function () {
    [, $community] = managementSetup();
    $foreign = Company::factory()->create();

    $this->actingAs($foreign, 'company')
        ->post("/company/communities/{$community->id}/templates", templatePayload())
        ->assertNotFound(); // عزل الشركات: كيان أجنبي = 404 لا 403 (H §4)
});
