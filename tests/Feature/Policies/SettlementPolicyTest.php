<?php

use App\Models\partner;
use App\Models\Company;
use App\Models\Settlement;
use App\Models\User;

test('admin can view any settlement', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', Settlement::class))->toBeTrue();
});

test('partner can view any settlement', function () {
    $partner = partner::factory()->create();

    expect($partner->can('viewAny', Settlement::class))->toBeTrue();
});

test('company can view any settlement', function () {
    $company = Company::factory()->create();

    expect($company->can('viewAny', Settlement::class))->toBeTrue();
});

test('partner can view own settlements', function () {
    $partner = partner::factory()->create();
    $settlement = Settlement::factory()->create(['partner_id' => $partner->id]);
    $otherSettlement = Settlement::factory()->create();

    expect($partner->can('view', $settlement))->toBeTrue()
        ->and($partner->can('view', $otherSettlement))->toBeFalse();
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
    $partner = partner::factory()->create();
    $company = Company::factory()->create();

    expect($admin->can('create', Settlement::class))->toBeTrue()
        ->and($partner->can('create', Settlement::class))->toBeFalse()
        ->and($company->can('create', Settlement::class))->toBeFalse();
});

test('only admin can update and delete settlements', function () {
    $admin = User::factory()->create();
    $partner = partner::factory()->create();
    $settlement = Settlement::factory()->create(['partner_id' => $partner->id]);

    expect($admin->can('update', $settlement))->toBeTrue()
        ->and($admin->can('delete', $settlement))->toBeTrue()
        ->and($partner->can('update', $settlement))->toBeFalse()
        ->and($partner->can('delete', $settlement))->toBeFalse();
});
