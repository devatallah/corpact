<?php

use App\Models\business;
use App\Models\Company;
use App\Models\Settlement;
use App\Models\User;

test('admin can view any settlement', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', Settlement::class))->toBeTrue();
});

test('business can view any settlement', function () {
    $business = business::factory()->create();

    expect($business->can('viewAny', Settlement::class))->toBeTrue();
});

test('company can view any settlement', function () {
    $company = Company::factory()->create();

    expect($company->can('viewAny', Settlement::class))->toBeTrue();
});

test('business can view own settlements', function () {
    $business = business::factory()->create();
    $settlement = Settlement::factory()->create(['business_id' => $business->id]);
    $otherSettlement = Settlement::factory()->create();

    expect($business->can('view', $settlement))->toBeTrue()
        ->and($business->can('view', $otherSettlement))->toBeFalse();
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
    $business = business::factory()->create();
    $company = Company::factory()->create();

    expect($admin->can('create', Settlement::class))->toBeTrue()
        ->and($business->can('create', Settlement::class))->toBeFalse()
        ->and($company->can('create', Settlement::class))->toBeFalse();
});

test('only admin can update and delete settlements', function () {
    $admin = User::factory()->create();
    $business = business::factory()->create();
    $settlement = Settlement::factory()->create(['business_id' => $business->id]);

    expect($admin->can('update', $settlement))->toBeTrue()
        ->and($admin->can('delete', $settlement))->toBeTrue()
        ->and($business->can('update', $settlement))->toBeFalse()
        ->and($business->can('delete', $settlement))->toBeFalse();
});
