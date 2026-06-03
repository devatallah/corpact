<?php

use App\Models\business;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;

test('admin can access dashboard', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.dash'))
        ->assertOk();
});

test('guest is redirected from admin dashboard', function () {
    $this->get(route('admin.dash'))->assertRedirect();
});

test('employee cannot access admin dashboard', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->get(route('admin.dash'))
        ->assertRedirect();
});

test('business cannot access admin dashboard', function () {
    $business = business::factory()->create();

    $this->actingAs($business, 'business')
        ->get(route('admin.dash'))
        ->assertRedirect();
});

test('company cannot access admin dashboard', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->get(route('admin.dash'))
        ->assertRedirect();
});
