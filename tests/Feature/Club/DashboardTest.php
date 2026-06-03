<?php

use App\Models\business;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;

test('business can access dashboard', function () {
    $business = business::factory()->create();

    $this->actingAs($business, 'business')
        ->get(route('business.dash'))
        ->assertOk();
});

test('guest is redirected from business dashboard', function () {
    $this->get(route('business.dash'))->assertRedirect();
});

test('admin cannot access business dashboard', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('business.dash'))
        ->assertRedirect();
});

test('employee cannot access business dashboard', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->get(route('business.dash'))
        ->assertRedirect();
});

test('company cannot access business dashboard', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->get(route('business.dash'))
        ->assertRedirect();
});
