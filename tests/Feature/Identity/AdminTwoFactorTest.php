<?php

use App\Models\User;
use App\Services\Auth\PortalLoginService;

// H §4: admin & finance admin enter with TWO mandatory factors
// (email + password, then OTP) and a 12-hour session.

test('password alone never opens an admin session', function () {
    fakeOtp();
    $admin = User::factory()->platformAdmin()->create(['password' => bcrypt('password')]);

    $this->post(route('admin.login'), ['email' => $admin->email, 'password' => 'password']);

    $this->assertGuest('admin');
    $this->get(route('admin.dash'))->assertRedirect();
});

test('wrong otp code does not open an admin session', function () {
    $otp = fakeOtp();
    $admin = User::factory()->platformAdmin()->create(['password' => bcrypt('password')]);

    $this->post(route('admin.login'), ['email' => $admin->email, 'password' => 'password']);

    $wrong = $otp->lastCode() === '111111' ? '222222' : '111111';
    $this->post(route('admin.otp.verify'), ['code' => $wrong])
        ->assertSessionHasErrors('code');

    $this->assertGuest('admin');
});

test('finance admin logs in with both factors too', function () {
    $otp = fakeOtp();
    $finance = User::factory()->financeAdmin()->create(['password' => bcrypt('password')]);

    $this->post(route('admin.login'), ['email' => $finance->email, 'password' => 'password'])
        ->assertRedirect(route('admin.otp'));

    $this->post(route('admin.otp.verify'), ['code' => $otp->lastCode()])
        ->assertRedirect(route('admin.dash'));

    $this->assertAuthenticatedAs($finance, 'admin');
});

test('admin can resend the second-factor code', function () {
    $otp = fakeOtp();
    $admin = User::factory()->platformAdmin()->create(['password' => bcrypt('password')]);

    $this->post(route('admin.login'), ['email' => $admin->email, 'password' => 'password']);
    $this->post(route('admin.otp.resend'))->assertSessionHasNoErrors();

    expect($otp->sent)->toHaveCount(2);

    $this->post(route('admin.otp.verify'), ['code' => $otp->lastCode()])
        ->assertRedirect(route('admin.dash'));
});

test('admin session expires after 12 hours', function () {
    $otp = fakeOtp();
    $admin = User::factory()->platformAdmin()->create(['password' => bcrypt('password')]);

    $this->post(route('admin.login'), ['email' => $admin->email, 'password' => 'password']);
    $this->post(route('admin.otp.verify'), ['code' => $otp->lastCode()]);

    $meta = session()->get(PortalLoginService::sessionKey('admin'));
    expect($meta['expires_at'])->toBeLessThanOrEqual(now()->addHours(12)->getTimestamp());

    $this->get(route('admin.dash'))->assertOk();

    $this->travel(13)->hours();

    $this->get(route('admin.dash'))->assertRedirect();
    $this->assertGuest('admin');
});

test('the otp challenge page requires a pending first factor', function () {
    $this->get(route('admin.otp'))->assertRedirect(route('admin.login'));
});
