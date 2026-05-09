<?php

use App\Models\Company;
use App\Models\Employee;
use App\Models\User;

test('admin can view any employee', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', Employee::class))->toBeTrue();
});

test('company can view any employee', function () {
    $company = Company::factory()->create();

    expect($company->can('viewAny', Employee::class))->toBeTrue();
});

test('company can view own employees', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $otherEmployee = Employee::factory()->create();

    expect($company->can('view', $employee))->toBeTrue()
        ->and($company->can('view', $otherEmployee))->toBeFalse();
});

test('company can create employees', function () {
    $company = Company::factory()->create();

    expect($company->can('create', Employee::class))->toBeTrue();
});

test('company can update own employees', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $otherEmployee = Employee::factory()->create();

    expect($company->can('update', $employee))->toBeTrue()
        ->and($company->can('update', $otherEmployee))->toBeFalse();
});

test('company can delete own employees', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $otherEmployee = Employee::factory()->create();

    expect($company->can('delete', $employee))->toBeTrue()
        ->and($company->can('delete', $otherEmployee))->toBeFalse();
});

test('employee cannot manage other employees', function () {
    $employee = Employee::factory()->create();

    expect($employee->can('viewAny', Employee::class))->toBeFalse()
        ->and($employee->can('create', Employee::class))->toBeFalse();
});
