<?php

use App\Models\business;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\VerifyEmailNotification;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
});

test('admin can see verification notice when unverified', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user, 'admin')
        ->get(route('admin.verification.notice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/verify-email')->has('guard'));
});

test('verified admin is redirected from verification notice', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'admin')
        ->get(route('admin.verification.notice'))
        ->assertRedirect(route('admin.dash'));
});

test('admin can verify email with valid link', function () {
    $user = User::factory()->unverified()->create();

    $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
        'admin.verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $this->actingAs($user, 'admin')
        ->get($url)
        ->assertRedirect(route('admin.dash'));

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('admin can resend verification email', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $this->actingAs($user, 'admin')
        ->post(route('admin.verification.send'))
        ->assertRedirect()
        ->assertSessionHas('status');

    Notification::assertSentTo($user, VerifyEmailNotification::class);
});

test('employee can see verification notice when unverified', function () {
    $employee = Employee::factory()->unverified()->create();

    $this->actingAs($employee, 'employee')
        ->get(route('employee.verification.notice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/verify-email')->has('guard'));
});

test('employee can verify email with valid link', function () {
    $employee = Employee::factory()->unverified()->create();

    $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
        'employee.verification.verify',
        now()->addMinutes(60),
        ['id' => $employee->id, 'hash' => sha1($employee->email)]
    );

    $this->actingAs($employee, 'employee')
        ->get($url)
        ->assertRedirect(route('employee.home'));

    expect($employee->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('business can see verification notice when unverified', function () {
    $business = business::factory()->unverified()->create();

    $this->actingAs($business, 'business')
        ->get(route('business.verification.notice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/verify-email')->has('guard'));
});

test('business can verify email with valid link', function () {
    $business = business::factory()->unverified()->create();

    $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
        'business.verification.verify',
        now()->addMinutes(60),
        ['id' => $business->id, 'hash' => sha1($business->email)]
    );

    $this->actingAs($business, 'business')
        ->get($url)
        ->assertRedirect(route('business.dash'));

    expect($business->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('company can see verification notice when unverified', function () {
    $company = Company::factory()->unverified()->create();

    $this->actingAs($company, 'company')
        ->get(route('company.verification.notice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/verify-email')->has('guard'));
});

test('company can verify email with valid link', function () {
    $company = Company::factory()->unverified()->create();

    $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
        'company.verification.verify',
        now()->addMinutes(60),
        ['id' => $company->id, 'hash' => sha1($company->email)]
    );

    $this->actingAs($company, 'company')
        ->get($url)
        ->assertRedirect(route('company.dash'));

    expect($company->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('verification fails with invalid hash', function () {
    $user = User::factory()->unverified()->create();

    $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
        'admin.verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => 'invalid-hash']
    );

    $this->actingAs($user, 'admin')
        ->get($url)
        ->assertForbidden();
});
