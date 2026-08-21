<?php

use App\Models\Company;
use App\Models\Employee;
use App\Models\partner;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

uses(RefreshDatabase::class);

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

    $url = URL::temporarySignedRoute(
        'admin.verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $this->actingAs($user, 'admin')
        ->get($url)
        ->assertRedirect(route('admin.login', ['email' => $user->email]));

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

    $url = URL::temporarySignedRoute(
        'employee.verification.verify',
        now()->addMinutes(60),
        ['id' => $employee->id, 'hash' => sha1($employee->email)]
    );

    $this->actingAs($employee, 'employee')
        ->get($url)
        ->assertRedirect(route('employee.login', ['email' => $employee->email]));

    expect($employee->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('partner can see verification notice when unverified', function () {
    $partner = partner::factory()->unverified()->create();

    $this->actingAs($partner, 'partner')
        ->get(route('partner.verification.notice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/verify-email')->has('guard'));
});

test('partner can verify email with valid link', function () {
    $partner = partner::factory()->unverified()->create();

    $url = URL::temporarySignedRoute(
        'partner.verification.verify',
        now()->addMinutes(60),
        ['id' => $partner->id, 'hash' => sha1($partner->email)]
    );

    $this->actingAs($partner, 'partner')
        ->get($url)
        ->assertRedirect(route('partner.login', ['email' => $partner->email]));

    expect($partner->fresh()->hasVerifiedEmail())->toBeTrue();
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

    $url = URL::temporarySignedRoute(
        'company.verification.verify',
        now()->addMinutes(60),
        ['id' => $company->id, 'hash' => sha1($company->email)]
    );

    $this->actingAs($company, 'company')
        ->get($url)
        ->assertRedirect(route('company.login', ['email' => $company->email]));

    expect($company->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('verification fails with invalid hash', function () {
    $user = User::factory()->unverified()->create();

    $url = URL::temporarySignedRoute(
        'admin.verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => 'invalid-hash']
    );

    $this->actingAs($user, 'admin')
        ->get($url)
        ->assertForbidden();
});
