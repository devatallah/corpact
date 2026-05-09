<?php

use App\Models\Club;
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

test('club can see verification notice when unverified', function () {
    $club = Club::factory()->unverified()->create();

    $this->actingAs($club, 'club')
        ->get(route('club.verification.notice'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/verify-email')->has('guard'));
});

test('club can verify email with valid link', function () {
    $club = Club::factory()->unverified()->create();

    $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
        'club.verification.verify',
        now()->addMinutes(60),
        ['id' => $club->id, 'hash' => sha1($club->email)]
    );

    $this->actingAs($club, 'club')
        ->get($url)
        ->assertRedirect(route('club.dash'));

    expect($club->fresh()->hasVerifiedEmail())->toBeTrue();
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
