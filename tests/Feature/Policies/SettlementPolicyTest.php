<?php

use App\Models\Club;
use App\Models\Company;
use App\Models\Settlement;
use App\Models\User;

test('admin can view any settlement', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', Settlement::class))->toBeTrue();
});

test('club can view any settlement', function () {
    $club = Club::factory()->create();

    expect($club->can('viewAny', Settlement::class))->toBeTrue();
});

test('company can view any settlement', function () {
    $company = Company::factory()->create();

    expect($company->can('viewAny', Settlement::class))->toBeTrue();
});

test('club can view own settlements', function () {
    $club = Club::factory()->create();
    $settlement = Settlement::factory()->create(['club_id' => $club->id]);
    $otherSettlement = Settlement::factory()->create();

    expect($club->can('view', $settlement))->toBeTrue()
        ->and($club->can('view', $otherSettlement))->toBeFalse();
});

test('company can view own settlements', function () {
    $company = Company::factory()->create();
    $settlement = Settlement::factory()->create(['company_id' => $company->id]);
    $otherSettlement = Settlement::factory()->create();

    expect($company->can('view', $settlement))->toBeTrue()
        ->and($company->can('view', $otherSettlement))->toBeFalse();
});

test('only admin can create settlements', function () {
    $admin = User::factory()->create();
    $club = Club::factory()->create();
    $company = Company::factory()->create();

    expect($admin->can('create', Settlement::class))->toBeTrue()
        ->and($club->can('create', Settlement::class))->toBeFalse()
        ->and($company->can('create', Settlement::class))->toBeFalse();
});

test('only admin can update and delete settlements', function () {
    $admin = User::factory()->create();
    $club = Club::factory()->create();
    $settlement = Settlement::factory()->create(['club_id' => $club->id]);

    expect($admin->can('update', $settlement))->toBeTrue()
        ->and($admin->can('delete', $settlement))->toBeTrue()
        ->and($club->can('update', $settlement))->toBeFalse()
        ->and($club->can('delete', $settlement))->toBeFalse();
});
