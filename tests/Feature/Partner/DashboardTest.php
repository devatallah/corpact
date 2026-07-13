<?php

use App\Models\partner;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;

test('partner can access dashboard', function () {
    $partner = partner::factory()->create();

    $this->actingAs($partner, 'partner')
        ->get(route('partner.dash'))
        ->assertOk();
});

test('guest is redirected from partner dashboard', function () {
    $this->get(route('partner.dash'))->assertRedirect();
});

test('admin cannot access partner dashboard', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin, 'admin')
        ->get(route('partner.dash'))
        ->assertRedirect();
});

test('employee cannot access partner dashboard', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->get(route('partner.dash'))
        ->assertRedirect();
});

test('company cannot access partner dashboard', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->get(route('partner.dash'))
        ->assertRedirect();
});
