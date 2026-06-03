<?php

use App\Models\business;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;

test('company can access dashboard', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->get(route('company.dash'))
        ->assertOk();
});

test('guest is redirected from company dashboard', function () {
    $this->get(route('company.dash'))->assertRedirect();
});

test('admin cannot access company dashboard', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('company.dash'))
        ->assertRedirect();
});

test('business cannot access company dashboard', function () {
    $business = business::factory()->create();

    $this->actingAs($business, 'business')
        ->get(route('company.dash'))
        ->assertRedirect();
});

test('employee cannot access company dashboard', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->get(route('company.dash'))
        ->assertRedirect();
});
