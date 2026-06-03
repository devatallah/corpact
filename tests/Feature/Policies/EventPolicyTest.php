<?php

use App\Models\business;
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

test('business can view own events', function () {
    $business = business::factory()->create();
    $event = Event::factory()->create(['business_id' => $business->id]);
    $otherEvent = Event::factory()->create();

    expect($business->can('view', $event))->toBeTrue()
        ->and($business->can('view', $otherEvent))->toBeFalse();
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

test('business cannot create events', function () {
    $business = business::factory()->create();

    expect($business->can('create', Event::class))->toBeFalse();
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

test('business can approve own events', function () {
    $business = business::factory()->create();
    $event = Event::factory()->create(['business_id' => $business->id]);
    $otherEvent = Event::factory()->create();

    expect($business->can('approve', $event))->toBeTrue()
        ->and($business->can('approve', $otherEvent))->toBeFalse();
});

test('company cannot approve events', function () {
    $company = Company::factory()->create();
    $event = Event::factory()->create(['company_id' => $company->id]);

    expect($company->can('approve', $event))->toBeFalse();
});

test('reject delegates to approve', function () {
    $business = business::factory()->create();
    $event = Event::factory()->create(['business_id' => $business->id]);
    $otherEvent = Event::factory()->create();

    expect($business->can('reject', $event))->toBeTrue()
        ->and($business->can('reject', $otherEvent))->toBeFalse();
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
