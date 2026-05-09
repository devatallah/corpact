<?php

use App\Models\Club;
use App\Models\Court;
use App\Models\User;

test('admin can view any court', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', Court::class))->toBeTrue();
});

test('club can view any court', function () {
    $club = Club::factory()->create();

    expect($club->can('viewAny', Court::class))->toBeTrue();
});

test('club can view own courts', function () {
    $club = Club::factory()->create();
    $court = Court::factory()->create(['club_id' => $club->id]);
    $otherCourt = Court::factory()->create();

    expect($club->can('view', $court))->toBeTrue()
        ->and($club->can('view', $otherCourt))->toBeFalse();
});

test('club can create courts', function () {
    $club = Club::factory()->create();

    expect($club->can('create', Court::class))->toBeTrue();
});

test('club can update own courts', function () {
    $club = Club::factory()->create();
    $court = Court::factory()->create(['club_id' => $club->id]);
    $otherCourt = Court::factory()->create();

    expect($club->can('update', $court))->toBeTrue()
        ->and($club->can('update', $otherCourt))->toBeFalse();
});

test('club can delete own courts', function () {
    $club = Club::factory()->create();
    $court = Court::factory()->create(['club_id' => $club->id]);
    $otherCourt = Court::factory()->create();

    expect($club->can('delete', $court))->toBeTrue()
        ->and($club->can('delete', $otherCourt))->toBeFalse();
});

test('only admin can restore and force delete courts', function () {
    $admin = User::factory()->create();
    $club = Club::factory()->create();
    $court = Court::factory()->create(['club_id' => $club->id]);

    expect($admin->can('restore', $court))->toBeTrue()
        ->and($admin->can('forceDelete', $court))->toBeTrue()
        ->and($club->can('restore', $court))->toBeFalse()
        ->and($club->can('forceDelete', $court))->toBeFalse();
});
