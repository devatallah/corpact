<?php

use App\Models\Employee;

// A3: the employee portal authenticates by phone + OTP (H §4) — the old
// email/password login was removed, so this file now covers the OTP flow.

test('employee login page renders the otp login screen', function () {
    $this->get(route('employee.login'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/otp-login')->where('guard', 'employee'));
});

test('active employee can login with phone and otp', function () {
    $otp = fakeOtp();
    $employee = Employee::factory()->create(['phone' => '0509000001']);

    $this->post(route('employee.otp.request'), ['phone' => '0509000001'])
        ->assertSessionHasNoErrors();

    $this->post(route('employee.otp.verify'), [
        'phone' => '0509000001',
        'code' => $otp->lastCode(),
    ])->assertRedirect(route('employee.home'));

    $this->assertAuthenticatedAs($employee, 'employee');
});

test('inactive employee cannot request an otp', function () {
    fakeOtp();
    Employee::factory()->inactive()->create(['phone' => '0509000002']);

    $this->post(route('employee.otp.request'), ['phone' => '0509000002'])
        ->assertSessionHasErrors('phone');

    $this->assertGuest('employee');
});

test('unknown phone cannot request an otp', function () {
    fakeOtp();

    $this->post(route('employee.otp.request'), ['phone' => '0500000000'])
        ->assertSessionHasErrors('phone');
});

test('employee cannot login with a wrong code', function () {
    $otp = fakeOtp();
    Employee::factory()->create(['phone' => '0509000003']);

    $this->post(route('employee.otp.request'), ['phone' => '0509000003']);

    $wrong = $otp->lastCode() === '111111' ? '222222' : '111111';

    $this->post(route('employee.otp.verify'), [
        'phone' => '0509000003',
        'code' => $wrong,
    ])->assertSessionHasErrors('code');

    $this->assertGuest('employee');
});

test('otp request validates required phone', function () {
    $this->post(route('employee.otp.request'), [])
        ->assertSessionHasErrors('phone');
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
