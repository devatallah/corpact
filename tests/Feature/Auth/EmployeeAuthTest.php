<?php

use App\Models\Company;
use App\Models\Employee;

test('employee login page renders', function () {
    $this->get(route('employee.login'))->assertOk();
});

test('active employee can login', function () {
    $employee = Employee::factory()->create([
        'password' => bcrypt('password'),
        'status' => 'active',
    ]);

    $this->post(route('employee.login'), [
        'email' => $employee->email,
        'password' => 'password',
    ])->assertRedirect(route('employee.home'));

    $this->assertAuthenticatedAs($employee, 'employee');
});

test('inactive employee cannot login', function () {
    $employee = Employee::factory()->create([
        'password' => bcrypt('password'),
        'status' => 'inactive',
    ]);

    $this->post(route('employee.login'), [
        'email' => $employee->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('employee');
});

test('employee cannot login with wrong password', function () {
    $employee = Employee::factory()->create(['password' => bcrypt('password')]);

    $this->post(route('employee.login'), [
        'email' => $employee->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('employee');
});

test('employee login validates required fields', function () {
    $this->post(route('employee.login'), [])
        ->assertSessionHasErrors(['email', 'password']);
});

test('employee can logout', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'employee')
        ->post(route('employee.logout'))
        ->assertRedirect(route('employee.login'));

    $this->assertGuest('employee');
});

test('employee home requires authentication', function () {
    $this->get(route('employee.home'))->assertRedirect();
});
