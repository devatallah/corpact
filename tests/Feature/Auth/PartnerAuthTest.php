<?php

use App\Models\Partner;

// A3: providers log in by phone + OTP after being invited/approved by the
// Teamat admin (H §4) — the partner email/password login was removed.

test('partner login page renders the otp login screen', function () {
    $this->get(route('partner.login'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/otp-login')->where('guard', 'partner'));
});

test('active partner can login with phone and otp', function () {
    $otp = fakeOtp();
    $partner = Partner::factory()->create(['contact_phone' => '0507000001', 'status' => 'active']);

    $this->post(route('partner.otp.request'), ['phone' => '0507000001'])
        ->assertSessionHasNoErrors();

    $this->post(route('partner.otp.verify'), [
        'phone' => '0507000001',
        'code' => $otp->lastCode(),
    ])->assertRedirect(route('partner.dash'));

    $this->assertAuthenticatedAs($partner, 'partner');
});

test('pending partner cannot login', function () {
    fakeOtp();
    Partner::factory()->pending()->create(['contact_phone' => '0507000002']);

    $this->post(route('partner.otp.request'), ['phone' => '0507000002'])
        ->assertSessionHasErrors('phone');

    $this->assertGuest('partner');
});

test('otp request validates required phone', function () {
    $this->post(route('partner.otp.request'), [])
        ->assertSessionHasErrors('phone');
});

test('partner can logout', function () {
    $partner = Partner::factory()->create();

    $this->actingAs($partner, 'partner')
        ->post(route('partner.logout'))
        ->assertRedirect(route('partner.login'));

    $this->assertGuest('partner');
});

test('partner dashboard requires authentication', function () {
    $this->get(route('partner.dash'))->assertRedirect();
});
