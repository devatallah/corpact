<?php

use App\Models\partner;
use App\Models\User;
use App\Models\venue;

test('admin can view any venue', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', venue::class))->toBeTrue();
});

test('partner can view any venue', function () {
    $partner = partner::factory()->create();

    expect($partner->can('viewAny', venue::class))->toBeTrue();
});

test('partner can view own venues', function () {
    $partner = partner::factory()->create();
    $venue = venue::factory()->create(['partner_id' => $partner->id]);
    $othervenue = venue::factory()->create();

    expect($partner->can('view', $venue))->toBeTrue()
        ->and($partner->can('view', $othervenue))->toBeFalse();
});

test('partner can create venues', function () {
    $partner = partner::factory()->create();

    expect($partner->can('create', venue::class))->toBeTrue();
});

test('partner can update own venues', function () {
    $partner = partner::factory()->create();
    $venue = venue::factory()->create(['partner_id' => $partner->id]);
    $othervenue = venue::factory()->create();

    expect($partner->can('update', $venue))->toBeTrue()
        ->and($partner->can('update', $othervenue))->toBeFalse();
});

test('partner can delete own venues', function () {
    $partner = partner::factory()->create();
    $venue = venue::factory()->create(['partner_id' => $partner->id]);
    $othervenue = venue::factory()->create();

    expect($partner->can('delete', $venue))->toBeTrue()
        ->and($partner->can('delete', $othervenue))->toBeFalse();
});

test('only admin can restore and force delete venues', function () {
    $admin = User::factory()->create();
    $partner = partner::factory()->create();
    $venue = venue::factory()->create(['partner_id' => $partner->id]);

    expect($admin->can('restore', $venue))->toBeTrue()
        ->and($admin->can('forceDelete', $venue))->toBeTrue()
        ->and($partner->can('restore', $venue))->toBeFalse()
        ->and($partner->can('forceDelete', $venue))->toBeFalse();
});
