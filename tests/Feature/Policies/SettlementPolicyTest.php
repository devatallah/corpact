<?php

use App\Models\Company;
use App\Models\Partner;
use App\Models\SettlementStatement;
use App\Models\User;

test('admin can view any settlement statement', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', SettlementStatement::class))->toBeTrue();
});

test('provider can view any settlement statement', function () {
    $partner = Partner::factory()->create();

    expect($partner->can('viewAny', SettlementStatement::class))->toBeTrue();
});

test('a company is not a party to a provider statement', function () {
    $company = Company::factory()->create();

    expect($company->can('viewAny', SettlementStatement::class))->toBeFalse();
});

test('provider sees own statements only', function () {
    $partner = Partner::factory()->create();
    $own = SettlementStatement::factory()->create(['partner_id' => $partner->id]);
    $other = SettlementStatement::factory()->create();

    expect($partner->can('view', $own))->toBeTrue()
        ->and($partner->can('view', $other))->toBeFalse();
});

test('only admins create statements', function () {
    $admin = User::factory()->create();
    $partner = Partner::factory()->create();

    expect($admin->can('create', SettlementStatement::class))->toBeTrue()
        ->and($partner->can('create', SettlementStatement::class))->toBeFalse();
});

test('a paid statement can never be updated — not even by an admin', function () {
    $admin = User::factory()->create();
    $draft = SettlementStatement::factory()->create();
    $paid = SettlementStatement::factory()->create(['status' => SettlementStatement::STATUS_PAID]);

    expect($admin->can('update', $draft))->toBeTrue()
        ->and($admin->can('update', $paid))->toBeFalse();
});

test('no one may delete a settlement statement', function () {
    $admin = User::factory()->create();
    $statement = SettlementStatement::factory()->create();

    expect($admin->can('delete', $statement))->toBeFalse()
        ->and($admin->can('forceDelete', $statement))->toBeFalse();
});
