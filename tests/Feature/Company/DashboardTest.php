<?php

use App\Models\Club;
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

test('club cannot access company dashboard', function () {
    $club = Club::factory()->create();

    $this->actingAs($club, 'club')
        ->get(route('company.dash'))
        ->assertRedirect();
});

test('employee cannot access company dashboard', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->get(route('company.dash'))
        ->assertRedirect();
});
