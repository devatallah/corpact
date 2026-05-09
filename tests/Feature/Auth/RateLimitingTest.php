<?php

use App\Models\Club;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;

test('login is throttled after 5 failed attempts', function () {
    $admin = User::factory()->create();

    for ($i = 0; $i < 5; $i++) {
        $this->post(route('admin.login'), [
            'email' => $admin->email,
            'password' => 'wrong-password',
        ]);
    }

    $this->post(route('admin.login'), [
        'email' => $admin->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    expect(session('errors')->get('email')[0])
        ->toContain('عدد محاولات تسجيل الدخول');
});

test('employee login is throttled after 5 failed attempts', function () {
    $employee = Employee::factory()->create();

    for ($i = 0; $i < 5; $i++) {
        $this->post(route('employee.login'), [
            'email' => $employee->email,
            'password' => 'wrong-password',
        ]);
    }

    $this->post(route('employee.login'), [
        'email' => $employee->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    expect(session('errors')->get('email')[0])
        ->toContain('عدد محاولات تسجيل الدخول');
});

test('club login is throttled after 5 failed attempts', function () {
    $club = Club::factory()->create();

    for ($i = 0; $i < 5; $i++) {
        $this->post(route('club.login'), [
            'email' => $club->email,
            'password' => 'wrong-password',
        ]);
    }

    $this->post(route('club.login'), [
        'email' => $club->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    expect(session('errors')->get('email')[0])
        ->toContain('عدد محاولات تسجيل الدخول');
});

test('company login is throttled after 5 failed attempts', function () {
    $company = Company::factory()->create();

    for ($i = 0; $i < 5; $i++) {
        $this->post(route('company.login'), [
            'email' => $company->email,
            'password' => 'wrong-password',
        ]);
    }

    $this->post(route('company.login'), [
        'email' => $company->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    expect(session('errors')->get('email')[0])
        ->toContain('عدد محاولات تسجيل الدخول');
});

test('password reset request is throttled after 3 attempts', function () {
    for ($i = 0; $i < 3; $i++) {
        $this->post(route('admin.password.email'), [
            'email' => 'nonexistent@example.com',
        ]);
    }

    $this->post(route('admin.password.email'), [
        'email' => 'nonexistent@example.com',
    ])->assertSessionHasErrors('email');

    expect(session('errors')->get('email')[0])
        ->toContain('عدد المحاولات كثيرة');
});
