<?php

use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;

test('admin can view any community', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', Community::class))->toBeTrue();
});

test('company can view own communities', function () {
    $company = Company::factory()->create();
    $community = Community::factory()->create(['company_id' => $company->id]);
    $otherCommunity = Community::factory()->create();

    expect($company->can('view', $community))->toBeTrue()
        ->and($company->can('view', $otherCommunity))->toBeFalse();
});

test('employee can view communities from same company', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);
    $otherCommunity = Community::factory()->create();

    expect($employee->can('view', $community))->toBeTrue()
        ->and($employee->can('view', $otherCommunity))->toBeFalse();
});

test('only admin and company can create communities', function () {
    $admin = User::factory()->create();
    $company = Company::factory()->create();
    $employee = Employee::factory()->create();

    expect($admin->can('create', Community::class))->toBeTrue()
        ->and($company->can('create', Community::class))->toBeTrue()
        ->and($employee->can('create', Community::class))->toBeFalse();
});

test('community leader can update their community', function () {
    $company = Company::factory()->create();
    $leader = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create([
        'company_id' => $company->id,
        'leader_id' => $leader->id,
    ]);

    expect($leader->can('update', $community))->toBeTrue();
});

test('non-leader employee cannot update community', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create(['company_id' => $company->id]);

    expect($employee->can('update', $community))->toBeFalse();
});

test('employee cannot delete communities', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $community = Community::factory()->create([
        'company_id' => $company->id,
        'leader_id' => $employee->id,
    ]);

    expect($employee->can('delete', $community))->toBeFalse();
});
