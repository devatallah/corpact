<?php

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;

/*
 * The employee portal's largest screen had no test that rendered it.
 *
 * Every existing test touching `employee.community.show` is an isolation
 * test asserting 404 for a foreign community, so none of them reach the
 * happy path — and a fatal inside `CommunityDetailService::members()` left
 * the whole suite green while the page returned 500. This covers the render
 * itself, and the props a leader depends on.
 */
test('a member can open their community detail page', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);

    $community->members()->attach($employee->id, ['joined_at' => now()]);

    $this->actingAs($employee, 'employee')
        ->get(route('employee.community.show', $community))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('employee/community/show')
            ->has('members', 1)
            ->has('events')
            ->where('isLeader', false)
            // غير القائد لا يرى دفتر محفظة المجتمع إطلاقاً.
            ->where('walletLedger', null));
});

test('members carry their attendance record so a leader can read the list', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);

    $community->members()->attach($employee->id, ['joined_at' => now()]);

    $this->actingAs($employee, 'employee')
        ->get(route('employee.community.show', $community))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('members.0.attendance_rate', null)
            ->where('members.0.completed_events', 0));
});
