<?php

use App\Models\business;
use App\Models\User;

test('admin can view any business', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', business::class))->toBeTrue();
});

test('business can view any business', function () {
    $business = business::factory()->create();

    expect($business->can('viewAny', business::class))->toBeTrue();
});

test('business can only view itself', function () {
    $business = business::factory()->create();
    $otherbusiness = business::factory()->create();

    expect($business->can('view', $business))->toBeTrue()
        ->and($business->can('view', $otherbusiness))->toBeFalse();
});

test('only admin can create businesss', function () {
    $admin = User::factory()->create();
    $business = business::factory()->create();

    expect($admin->can('create', business::class))->toBeTrue()
        ->and($business->can('create', business::class))->toBeFalse();
});

test('business can update itself', function () {
    $business = business::factory()->create();
    $otherbusiness = business::factory()->create();

    expect($business->can('update', $business))->toBeTrue()
        ->and($business->can('update', $otherbusiness))->toBeFalse();
});

test('only admin can delete businesss', function () {
    $admin = User::factory()->create();
    $business = business::factory()->create();

    expect($admin->can('delete', $business))->toBeTrue()
        ->and($business->can('delete', $business))->toBeFalse();
});
