<?php

use App\Models\Club;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\User;

test('admin can view any event', function () {
    $admin = User::factory()->create();
    $this->actingAs($admin, 'admin');

    expect($admin->can('viewAny', Event::class))->toBeTrue();
});

test('company can view own events', function () {
    $company = Company::factory()->create();
    $event = Event::factory()->create(['company_id' => $company->id]);
    $otherEvent = Event::factory()->create();

    expect($company->can('view', $event))->toBeTrue()
        ->and($company->can('view', $otherEvent))->toBeFalse();
});

test('club can view own events', function () {
    $club = Club::factory()->create();
    $event = Event::factory()->create(['club_id' => $club->id]);
    $otherEvent = Event::factory()->create();

    expect($club->can('view', $event))->toBeTrue()
        ->and($club->can('view', $otherEvent))->toBeFalse();
});

test('employee can view events from same company', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $event = Event::factory()->create(['company_id' => $company->id]);
    $otherEvent = Event::factory()->create();

    expect($employee->can('view', $event))->toBeTrue()
        ->and($employee->can('view', $otherEvent))->toBeFalse();
});

test('admin can create events', function () {
    $admin = User::factory()->create();

    expect($admin->can('create', Event::class))->toBeTrue();
});

test('company can create events', function () {
    $company = Company::factory()->create();

    expect($company->can('create', Event::class))->toBeTrue();
});

test('employee can create events', function () {
    $employee = Employee::factory()->create();

    expect($employee->can('create', Event::class))->toBeTrue();
});

test('club cannot create events', function () {
    $club = Club::factory()->create();

    expect($club->can('create', Event::class))->toBeFalse();
});

test('company can update own events', function () {
    $company = Company::factory()->create();
    $event = Event::factory()->create(['company_id' => $company->id]);
    $otherEvent = Event::factory()->create();

    expect($company->can('update', $event))->toBeTrue()
        ->and($company->can('update', $otherEvent))->toBeFalse();
});

test('employee cannot update events', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);
    $event = Event::factory()->create(['company_id' => $company->id]);

    expect($employee->can('update', $event))->toBeFalse();
});

test('company can delete own events', function () {
    $company = Company::factory()->create();
    $event = Event::factory()->create(['company_id' => $company->id]);
    $otherEvent = Event::factory()->create();

    expect($company->can('delete', $event))->toBeTrue()
        ->and($company->can('delete', $otherEvent))->toBeFalse();
});

test('club can approve own events', function () {
    $club = Club::factory()->create();
    $event = Event::factory()->create(['club_id' => $club->id]);
    $otherEvent = Event::factory()->create();

    expect($club->can('approve', $event))->toBeTrue()
        ->and($club->can('approve', $otherEvent))->toBeFalse();
});

test('company cannot approve events', function () {
    $company = Company::factory()->create();
    $event = Event::factory()->create(['company_id' => $company->id]);

    expect($company->can('approve', $event))->toBeFalse();
});

test('reject delegates to approve', function () {
    $club = Club::factory()->create();
    $event = Event::factory()->create(['club_id' => $club->id]);
    $otherEvent = Event::factory()->create();

    expect($club->can('reject', $event))->toBeTrue()
        ->and($club->can('reject', $otherEvent))->toBeFalse();
});

test('only admin can restore and force delete events', function () {
    $admin = User::factory()->create();
    $company = Company::factory()->create();
    $event = Event::factory()->create(['company_id' => $company->id]);

    expect($admin->can('restore', $event))->toBeTrue()
        ->and($admin->can('forceDelete', $event))->toBeTrue()
        ->and($company->can('restore', $event))->toBeFalse()
        ->and($company->can('forceDelete', $event))->toBeFalse();
});
