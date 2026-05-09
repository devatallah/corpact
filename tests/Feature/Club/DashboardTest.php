<?php

use App\Models\Club;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;

test('club can access dashboard', function () {
    $club = Club::factory()->create();

    $this->actingAs($club, 'club')
        ->get(route('club.dash'))
        ->assertOk();
});

test('guest is redirected from club dashboard', function () {
    $this->get(route('club.dash'))->assertRedirect();
});

test('admin cannot access club dashboard', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('club.dash'))
        ->assertRedirect();
});

test('employee cannot access club dashboard', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->get(route('club.dash'))
        ->assertRedirect();
});

test('company cannot access club dashboard', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->get(route('club.dash'))
        ->assertRedirect();
});
