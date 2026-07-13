<?php

use App\Models\partner;
use App\Models\User;

test('admin can view any partner', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', partner::class))->toBeTrue();
});

test('partner can view any partner', function () {
    $partner = partner::factory()->create();

    expect($partner->can('viewAny', partner::class))->toBeTrue();
});

test('partner can only view itself', function () {
    $partner = partner::factory()->create();
    $otherpartner = partner::factory()->create();

    expect($partner->can('view', $partner))->toBeTrue()
        ->and($partner->can('view', $otherpartner))->toBeFalse();
});

test('only admin can create partners', function () {
    $admin = User::factory()->create();
    $partner = partner::factory()->create();

    expect($admin->can('create', partner::class))->toBeTrue()
        ->and($partner->can('create', partner::class))->toBeFalse();
});

test('partner can update itself', function () {
    $partner = partner::factory()->create();
    $otherpartner = partner::factory()->create();

    expect($partner->can('update', $partner))->toBeTrue()
        ->and($partner->can('update', $otherpartner))->toBeFalse();
});

test('only admin can delete partners', function () {
    $admin = User::factory()->create();
    $partner = partner::factory()->create();

    expect($admin->can('delete', $partner))->toBeTrue()
        ->and($partner->can('delete', $partner))->toBeFalse();
});
