<?php

use App\Models\Company;
use App\Models\User;

// A3: the account manager logs in by phone + OTP (H §4) — the company
// email/password login was removed.

test('company login page renders the otp login screen', function () {
    $this->get(route('company.login'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/otp-login')->where('guard', 'company'));
});

test('account manager can login with phone and otp', function () {
    $otp = fakeOtp();
    $company = Company::factory()->create(['contact_phone' => '0508000001']);

    $this->post(route('company.otp.request'), ['phone' => '0508000001'])
        ->assertSessionHasNoErrors();

    $this->post(route('company.otp.verify'), [
        'phone' => '0508000001',
        'code' => $otp->lastCode(),
    ])->assertRedirect(route('company.dash'));

    $this->assertAuthenticatedAs($company, 'company');

    // The identity behind the session is the global account manager user.
    $user = User::where('phone', '966508000001')->first();
    expect($user)->not->toBeNull()
        ->and($user->hasRoleInScope('account_manager', 'company', $company->id))->toBeTrue();
});

test('pending company account manager cannot login', function () {
    fakeOtp();
    Company::factory()->pending()->create(['contact_phone' => '0508000002']);

    $this->post(route('company.otp.request'), ['phone' => '0508000002'])
        ->assertSessionHasErrors('phone');

    $this->assertGuest('company');
});

test('otp request validates required phone', function () {
    $this->post(route('company.otp.request'), [])
        ->assertSessionHasErrors('phone');
});

test('company can logout', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->post(route('company.logout'))
        ->assertRedirect(route('company.login'));

    $this->assertGuest('company');
});

test('company dashboard requires authentication', function () {
    $this->get(route('company.dash'))->assertRedirect();
});
