<?php

use App\Models\Company;
use App\Models\User;

test('admin can view any company', function () {
    $admin = User::factory()->create();

    expect($admin->can('viewAny', Company::class))->toBeTrue();
});

test('company can view any company', function () {
    $company = Company::factory()->create();

    expect($company->can('viewAny', Company::class))->toBeTrue();
});

test('admin can view any specific company', function () {
    $admin = User::factory()->create();
    $company = Company::factory()->create();

    expect($admin->can('view', $company))->toBeTrue();
});

test('company can only view itself', function () {
    $company = Company::factory()->create();
    $otherCompany = Company::factory()->create();

    expect($company->can('view', $company))->toBeTrue()
        ->and($company->can('view', $otherCompany))->toBeFalse();
});

test('only admin can create companies', function () {
    $admin = User::factory()->create();
    $company = Company::factory()->create();

    expect($admin->can('create', Company::class))->toBeTrue()
        ->and($company->can('create', Company::class))->toBeFalse();
});

test('company can update itself', function () {
    $company = Company::factory()->create();
    $otherCompany = Company::factory()->create();

    expect($company->can('update', $company))->toBeTrue()
        ->and($company->can('update', $otherCompany))->toBeFalse();
});

test('only admin can delete companies', function () {
    $admin = User::factory()->create();
    $company = Company::factory()->create();

    expect($admin->can('delete', $company))->toBeTrue()
        ->and($company->can('delete', $company))->toBeFalse();
});
