<?php

use App\Models\business;
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

test('business logout does not affect company session', function () {
    $business = business::factory()->create();
    $company = Company::factory()->create();

    $this->actingAs($business, 'business')
        ->actingAs($company, 'company');

    $this->post(route('business.logout'));

    $this->assertGuest('business');
    $this->assertAuthenticatedAs($company, 'company');
});

test('all four guards can be authenticated simultaneously', function () {
    $admin = User::factory()->create();
    $employee = Employee::factory()->create();
    $business = business::factory()->create();
    $company = Company::factory()->create();

    $this->actingAs($admin, 'admin')
        ->actingAs($employee, 'employee')
        ->actingAs($business, 'business')
        ->actingAs($company, 'company');

    $this->assertAuthenticatedAs($admin, 'admin');
    $this->assertAuthenticatedAs($employee, 'employee');
    $this->assertAuthenticatedAs($business, 'business');
    $this->assertAuthenticatedAs($company, 'company');
});

test('admin cannot access business routes', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('business.dash'))
        ->assertRedirect();
});

test('employee cannot access admin routes', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->get(route('admin.dash'))
        ->assertRedirect();
});

test('business cannot access company routes', function () {
    $business = business::factory()->create();

    $this->actingAs($business, 'business')
        ->get(route('company.dash'))
        ->assertRedirect();
});

test('company cannot access employee routes', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->get(route('employee.home'))
        ->assertRedirect();
});
