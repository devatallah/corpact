<?php

use App\Models\User;

// A3: Teamat admin login = email + password THEN OTP — both factors
// mandatory (H §4). Password alone never opens a session.

test('admin login page renders', function () {
    $this->get(route('admin.login'))->assertOk();
});

test('valid credentials lead to the otp challenge, not a session', function () {
    fakeOtp();
    $admin = User::factory()->platformAdmin()->create(['password' => bcrypt('password')]);

    $this->post(route('admin.login'), [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.otp'));

    $this->assertGuest('admin');
});

test('admin completes login with the otp second factor', function () {
    $otp = fakeOtp();
    $admin = User::factory()->platformAdmin()->create(['password' => bcrypt('password')]);

    $this->post(route('admin.login'), [
        'email' => $admin->email,
        'password' => 'password',
    ]);

    $this->post(route('admin.otp.verify'), ['code' => $otp->lastCode()])
        ->assertRedirect(route('admin.dash'));

    $this->assertAuthenticatedAs($admin, 'admin');
});

test('admin cannot login with wrong password', function () {
    $admin = User::factory()->platformAdmin()->create(['password' => bcrypt('password')]);

    $this->post(route('admin.login'), [
        'email' => $admin->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('admin');
});

test('admin cannot login with non-existent email', function () {
    $this->post(route('admin.login'), [
        'email' => 'nonexistent@example.com',
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('admin');
});

test('a user without a platform role cannot enter the admin portal', function () {
    fakeOtp();
    $user = User::factory()->create(['password' => bcrypt('password')]);

    $this->post(route('admin.login'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest('admin');
});

test('admin login validates required fields', function () {
    $this->post(route('admin.login'), [])
        ->assertSessionHasErrors(['email', 'password']);
});

test('admin login validates email format', function () {
    $this->post(route('admin.login'), [
        'email' => 'not-an-email',
        'password' => 'password',
    ])->assertSessionHasErrors('email');
});

test('admin can logout', function () {
    $admin = User::factory()->platformAdmin()->create();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.logout'))
        ->assertRedirect(route('admin.login'));

    $this->assertGuest('admin');
});

test('admin dashboard requires authentication', function () {
    $this->get(route('admin.dash'))->assertRedirect();
});
