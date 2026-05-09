<?php

use App\Models\Club;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;

test('admin logout does not affect employee session', function () {
    $admin = User::factory()->create();
    $employee = Employee::factory()->create();

    $this->actingAs($admin, 'admin')
        ->actingAs($employee, 'employee');

    $this->post(route('admin.logout'));

    $this->assertGuest('admin');
    $this->assertAuthenticatedAs($employee, 'employee');
});

test('employee logout does not affect admin session', function () {
    $admin = User::factory()->create();
    $employee = Employee::factory()->create();

    $this->actingAs($admin, 'admin')
        ->actingAs($employee, 'employee');

    $this->post(route('employee.logout'));

    $this->assertGuest('employee');
    $this->assertAuthenticatedAs($admin, 'admin');
});

test('club logout does not affect company session', function () {
    $club = Club::factory()->create();
    $company = Company::factory()->create();

    $this->actingAs($club, 'club')
        ->actingAs($company, 'company');

    $this->post(route('club.logout'));

    $this->assertGuest('club');
    $this->assertAuthenticatedAs($company, 'company');
});

test('all four guards can be authenticated simultaneously', function () {
    $admin = User::factory()->create();
    $employee = Employee::factory()->create();
    $club = Club::factory()->create();
    $company = Company::factory()->create();

    $this->actingAs($admin, 'admin')
        ->actingAs($employee, 'employee')
        ->actingAs($club, 'club')
        ->actingAs($company, 'company');

    $this->assertAuthenticatedAs($admin, 'admin');
    $this->assertAuthenticatedAs($employee, 'employee');
    $this->assertAuthenticatedAs($club, 'club');
    $this->assertAuthenticatedAs($company, 'company');
});

test('admin cannot access club routes', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('club.dash'))
        ->assertRedirect();
});

test('employee cannot access admin routes', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->get(route('admin.dash'))
        ->assertRedirect();
});

test('club cannot access company routes', function () {
    $club = Club::factory()->create();

    $this->actingAs($club, 'club')
        ->get(route('company.dash'))
        ->assertRedirect();
});

test('company cannot access employee routes', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->get(route('employee.home'))
        ->assertRedirect();
});
