<?php

use App\Models\business;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

test('admin forgot password page renders', function () {
    $this->get(route('admin.password.request'))->assertOk();
});

test('admin can request password reset link', function () {
    Notification::fake();
    $admin = User::factory()->create();

    $this->post(route('admin.password.email'), ['email' => $admin->email])
        ->assertSessionHas('status');

    Notification::assertSentTo($admin, ResetPasswordNotification::class);
});

test('admin cannot request reset for non-existent email', function () {
    $this->post(route('admin.password.email'), ['email' => 'fake@example.com'])
        ->assertSessionHasErrors('email');
});

test('admin reset password page renders with token', function () {
    $this->get(route('admin.password.reset', ['token' => 'test-token', 'email' => 'test@example.com']))
        ->assertOk();
});

test('admin can reset password with valid token', function () {
    $admin = User::factory()->create();

    $token = Password::broker('admins')->createToken($admin);

    $this->post(route('admin.password.update'), [
        'token' => $token,
        'email' => $admin->email,
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertRedirect(route('admin.login'));

    expect(auth()->guard('admin')->attempt([
        'email' => $admin->email,
        'password' => 'new-password-123',
    ]))->toBeTrue();
});

test('employee can request password reset link', function () {
    Notification::fake();
    $employee = Employee::factory()->create();

    $this->post(route('employee.password.email'), ['email' => $employee->email])
        ->assertSessionHas('status');

    Notification::assertSentTo($employee, ResetPasswordNotification::class);
});

test('employee can reset password with valid token', function () {
    $employee = Employee::factory()->create();

    $token = Password::broker('employees')->createToken($employee);

    $this->post(route('employee.password.update'), [
        'token' => $token,
        'email' => $employee->email,
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertRedirect(route('employee.login'));
});

test('business can request password reset link', function () {
    Notification::fake();
    $business = business::factory()->create();

    $this->post(route('business.password.email'), ['email' => $business->email])
        ->assertSessionHas('status');

    Notification::assertSentTo($business, ResetPasswordNotification::class);
});

test('business can reset password with valid token', function () {
    $business = business::factory()->create();

    $token = Password::broker('businesss')->createToken($business);

    $this->post(route('business.password.update'), [
        'token' => $token,
        'email' => $business->email,
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertRedirect(route('business.login'));
});

test('company can request password reset link', function () {
    Notification::fake();
    $company = Company::factory()->create();

    $this->post(route('company.password.email'), ['email' => $company->email])
        ->assertSessionHas('status');

    Notification::assertSentTo($company, ResetPasswordNotification::class);
});

test('company can reset password with valid token', function () {
    $company = Company::factory()->create();

    $token = Password::broker('companies')->createToken($company);

    $this->post(route('company.password.update'), [
        'token' => $token,
        'email' => $company->email,
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertRedirect(route('company.login'));
});

test('password reset fails with invalid token', function () {
    $admin = User::factory()->create();

    $this->post(route('admin.password.update'), [
        'token' => 'invalid-token',
        'email' => $admin->email,
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertSessionHasErrors('email');
});

test('password reset validates minimum length', function () {
    $admin = User::factory()->create();
    $token = Password::broker('admins')->createToken($admin);

    $this->post(route('admin.password.update'), [
        'token' => $token,
        'email' => $admin->email,
        'password' => 'short',
        'password_confirmation' => 'short',
    ])->assertSessionHasErrors('password');
});
