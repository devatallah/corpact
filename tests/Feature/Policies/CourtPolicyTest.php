<?php

use App\Models\business;
use App\Models\venue;
use App\Models\User;

test('admin can view any venue', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', venue::class))->toBeTrue();
});

test('business can view any venue', function () {
    $business = business::factory()->create();

    expect($business->can('viewAny', venue::class))->toBeTrue();
});

test('business can view own venues', function () {
    $business = business::factory()->create();
    $venue = venue::factory()->create(['business_id' => $business->id]);
    $othervenue = venue::factory()->create();

    expect($business->can('view', $venue))->toBeTrue()
        ->and($business->can('view', $othervenue))->toBeFalse();
});

test('business can create venues', function () {
    $business = business::factory()->create();

    expect($business->can('create', venue::class))->toBeTrue();
});

test('business can update own venues', function () {
    $business = business::factory()->create();
    $venue = venue::factory()->create(['business_id' => $business->id]);
    $othervenue = venue::factory()->create();

    expect($business->can('update', $venue))->toBeTrue()
        ->and($business->can('update', $othervenue))->toBeFalse();
});

test('business can delete own venues', function () {
    $business = business::factory()->create();
    $venue = venue::factory()->create(['business_id' => $business->id]);
    $othervenue = venue::factory()->create();

    expect($business->can('delete', $venue))->toBeTrue()
        ->and($business->can('delete', $othervenue))->toBeFalse();
});

test('only admin can restore and force delete venues', function () {
    $admin = User::factory()->create();
    $business = business::factory()->create();
    $venue = venue::factory()->create(['business_id' => $business->id]);

    expect($admin->can('restore', $venue))->toBeTrue()
        ->and($admin->can('forceDelete', $venue))->toBeTrue()
        ->and($business->can('restore', $venue))->toBeFalse()
        ->and($business->can('forceDelete', $venue))->toBeFalse();
});
