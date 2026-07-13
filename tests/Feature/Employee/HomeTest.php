<?php

use App\Models\partner;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;

test('employee can access home', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->get(route('employee.home'))
        ->assertOk();
});

test('guest is redirected from employee home', function () {
    $this->get(route('employee.home'))->assertRedirect();
});

test('admin cannot access employee home', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('employee.home'))
        ->assertRedirect();
});

test('partner cannot access employee home', function () {
    $partner = partner::factory()->create();

    $this->actingAs($partner, 'partner')
        ->get(route('employee.home'))
        ->assertRedirect();
});

test('company cannot access employee home', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->get(route('employee.home'))
        ->assertRedirect();
});
