<?php

use App\Models\Employee;
use App\Models\User;

test('admin login is throttled after 5 failed attempts', function () {
    $admin = User::factory()->platformAdmin()->create();

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

test('otp requests are capped at 3 per hour per phone', function () {
    $otp = fakeOtp();
    Employee::factory()->create(['phone' => '0509111111']);

    for ($i = 0; $i < 3; $i++) {
        $this->post(route('employee.otp.request'), ['phone' => '0509111111'])
            ->assertSessionHasNoErrors();
    }

    $this->post(route('employee.otp.request'), ['phone' => '0509111111'])
        ->assertSessionHasErrors('phone');

    expect($otp->sent)->toHaveCount(3);
});

test('otp endpoints are rate limited per minute', function () {
    fakeOtp();
    Employee::factory()->create(['phone' => '0509222222']);

    for ($i = 0; $i < 10; $i++) {
        $this->post(route('employee.otp.verify'), [
            'phone' => '0509222222',
            'code' => '000000',
        ]);
    }

    $this->post(route('employee.otp.verify'), [
        'phone' => '0509222222',
        'code' => '000000',
    ])->assertSessionHasErrors('phone');

    expect(session('errors')->get('phone')[0])
        ->toContain('محاولات كثيرة');
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
