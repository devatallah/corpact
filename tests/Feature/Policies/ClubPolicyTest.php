<?php

use App\Models\Club;
use App\Models\User;

test('admin can view any club', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', Club::class))->toBeTrue();
});

test('club can view any club', function () {
    $club = Club::factory()->create();

    expect($club->can('viewAny', Club::class))->toBeTrue();
});

test('club can only view itself', function () {
    $club = Club::factory()->create();
    $otherClub = Club::factory()->create();

    expect($club->can('view', $club))->toBeTrue()
        ->and($club->can('view', $otherClub))->toBeFalse();
});

test('only admin can create clubs', function () {
    $admin = User::factory()->create();
    $club = Club::factory()->create();

    expect($admin->can('create', Club::class))->toBeTrue()
        ->and($club->can('create', Club::class))->toBeFalse();
});

test('club can update itself', function () {
    $club = Club::factory()->create();
    $otherClub = Club::factory()->create();

    expect($club->can('update', $club))->toBeTrue()
        ->and($club->can('update', $otherClub))->toBeFalse();
});

test('only admin can delete clubs', function () {
    $admin = User::factory()->create();
    $club = Club::factory()->create();

    expect($admin->can('delete', $club))->toBeTrue()
        ->and($club->can('delete', $club))->toBeFalse();
});
