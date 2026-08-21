<?php

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

// A3: passwords exist only on the admin portal (email + password + OTP).
// The employee / company / partner portals authenticate by phone + OTP and
// have no password-reset flow anymore.

test('admin forgot password page renders', function () {
    $this->get(route('admin.password.request'))->assertOk();
});

test('admin can request password reset link', function () {
    Notification::fake();
    $admin = User::factory()->platformAdmin()->create();

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
    $admin = User::factory()->platformAdmin()->create();

    $token = Password::broker('admins')->createToken($admin);

    $this->post(route('admin.password.update'), [
        'token' => $token,
        'email' => $admin->email,
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertRedirect(route('admin.login'));

    expect(auth()->guard('admin')->validate([
        'email' => $admin->email,
        'password' => 'new-password-123',
    ]))->toBeTrue();
});

test('the removed portal password-reset routes are gone', function () {
    expect(Route::has('employee.password.email'))->toBeFalse()
        ->and(Route::has('company.password.email'))->toBeFalse()
        ->and(Route::has('partner.password.email'))->toBeFalse();
});
