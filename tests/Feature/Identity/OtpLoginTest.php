<?php

use App\Models\Employee;
use App\Models\OtpCode;
use App\Services\Auth\PortalLoginService;

// H §4 / ملحق أ: 6 digits · 5-minute validity · 3 sends/hour/phone ·
// 5 wrong entries → 15-minute lock · portal session lifetimes.

test('otp codes are 6 digits, stored hashed and consumed on use', function () {
    $otp = fakeOtp();
    Employee::factory()->create(['phone' => '0509300001']);

    $this->post(route('employee.otp.request'), ['phone' => '0509300001']);

    $code = $otp->lastCode();
    expect($code)->toMatch('/^\d{6}$/');

    $row = OtpCode::query()->latest('id')->first();
    expect($row->phone)->toBe('966509300001')
        ->and($row->code_hash)->not->toBe($code);

    $this->post(route('employee.otp.verify'), ['phone' => '0509300001', 'code' => $code])
        ->assertRedirect(route('employee.home'));

    expect($row->fresh()->isConsumed())->toBeTrue();

    // A consumed code cannot be replayed.
    auth('employee')->logout();
    $this->post(route('employee.otp.verify'), ['phone' => '0509300001', 'code' => $code])
        ->assertSessionHasErrors('code');
});

test('an otp expires after 5 minutes', function () {
    $otp = fakeOtp();
    Employee::factory()->create(['phone' => '0509300002']);

    $this->post(route('employee.otp.request'), ['phone' => '0509300002']);

    $this->travel(6)->minutes();

    $this->post(route('employee.otp.verify'), [
        'phone' => '0509300002',
        'code' => $otp->lastCode(),
    ])->assertSessionHasErrors('code');

    $this->assertGuest('employee');
});

test('5 wrong entries lock the phone for 15 minutes, then it unlocks', function () {
    $otp = fakeOtp();
    Employee::factory()->create(['phone' => '0509300003']);

    $this->post(route('employee.otp.request'), ['phone' => '0509300003']);
    $code = $otp->lastCode();
    $wrong = $code === '111111' ? '222222' : '111111';

    foreach (range(1, 5) as $i) {
        $this->post(route('employee.otp.verify'), ['phone' => '0509300003', 'code' => $wrong]);
    }

    // Locked: even the correct code is rejected now.
    $this->post(route('employee.otp.verify'), ['phone' => '0509300003', 'code' => $code])
        ->assertSessionHasErrors('code');
    $this->assertGuest('employee');

    // And new codes cannot be requested during the lock.
    $this->post(route('employee.otp.request'), ['phone' => '0509300003'])
        ->assertSessionHasErrors('phone');

    // After 15 minutes the lock lifts (a fresh code is required — resend
    // caps are per rolling hour, so travel past them).
    $this->travel(61)->minutes();
    $this->post(route('employee.otp.request'), ['phone' => '0509300003'])
        ->assertSessionHasNoErrors();

    $this->post(route('employee.otp.verify'), ['phone' => '0509300003', 'code' => $otp->lastCode()])
        ->assertRedirect(route('employee.home'));
});

test('requesting a new code invalidates the previous one', function () {
    $otp = fakeOtp();
    Employee::factory()->create(['phone' => '0509300004']);

    $this->post(route('employee.otp.request'), ['phone' => '0509300004']);
    $first = $otp->lastCode();

    $this->post(route('employee.otp.request'), ['phone' => '0509300004']);

    $this->post(route('employee.otp.verify'), ['phone' => '0509300004', 'code' => $first])
        ->assertSessionHasErrors('code');
});

test('employee portal session is stamped with a 30-day absolute expiry', function () {
    $otp = fakeOtp();
    Employee::factory()->create(['phone' => '0509300005']);

    $this->post(route('employee.otp.request'), ['phone' => '0509300005']);
    $this->post(route('employee.otp.verify'), ['phone' => '0509300005', 'code' => $otp->lastCode()]);

    $meta = session()->get(PortalLoginService::sessionKey('employee'));

    expect($meta['expires_at'])->toBeGreaterThan(now()->addDays(29)->getTimestamp())
        ->and($meta['expires_at'])->toBeLessThanOrEqual(now()->addDays(30)->getTimestamp());
});

test('an expired portal session is logged out on the next request', function () {
    $otp = fakeOtp();
    Employee::factory()->create(['phone' => '0509300006']);

    $this->post(route('employee.otp.request'), ['phone' => '0509300006']);
    $this->post(route('employee.otp.verify'), ['phone' => '0509300006', 'code' => $otp->lastCode()]);

    $this->get(route('employee.home'))->assertOk();

    $this->travel(31)->days();

    $this->get(route('employee.home'))->assertRedirect();
    $this->assertGuest('employee');
});
