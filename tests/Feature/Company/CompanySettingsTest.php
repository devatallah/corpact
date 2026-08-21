<?php

use App\Models\Company;
use App\Models\CompanySetting;

// H §5 — company settings with spec defaults, configurable by the account
// manager: employee_can_create_event off, funding mode مختلط, subsidy 0,
// registration closes 24h before start, absence marking allowed.

test('creating a company creates its settings row with the spec defaults', function () {
    $company = Company::factory()->create();

    $settings = CompanySetting::withoutGlobalScopes()->where('company_id', $company->id)->first();

    expect($settings)->not->toBeNull()
        ->and($settings->employee_can_create_event)->toBeFalse()
        ->and($settings->default_funding_mode)->toBe('mixed')
        ->and($settings->default_subsidy)->toBe(0)
        ->and($settings->registration_close_hours)->toBe(24)
        ->and($settings->allow_absence_marking)->toBeTrue();
});

test('getSettings creates the row on demand for companies that predate the table', function () {
    $company = Company::factory()->create();
    CompanySetting::withoutGlobalScopes()->where('company_id', $company->id)->delete();

    $settings = $company->getSettings();

    expect($settings->exists)->toBeTrue()
        ->and($settings->default_funding_mode)->toBe('mixed');
});

test('company timezone defaults to Asia/Riyadh', function () {
    $company = Company::factory()->create();

    expect($company->fresh()->timezone)->toBe('Asia/Riyadh');
});

test('contract fields are nullable until the owner sets them', function () {
    $company = Company::factory()->create();

    expect($company->contract_fee_per_activated_employee)->toBeNull()
        ->and($company->contract_monthly_minimum)->toBeNull()
        ->and($company->contract_coordinator_service)->toBeNull();

    // Amounts are integer halalas (H §21).
    $company->update([
        'contract_fee_per_activated_employee' => 1500, // 15 ريال
        'contract_monthly_minimum' => 500000,          // 5000 ريال
        'contract_coordinator_service' => true,
    ]);

    expect($company->fresh()->contract_fee_per_activated_employee)->toBe(1500)
        ->and($company->fresh()->contract_monthly_minimum)->toBe(500000)
        ->and($company->fresh()->contract_coordinator_service)->toBeTrue();
});

test('the account manager can view and update the settings', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->get(route('company.settings.index'))
        ->assertOk();

    $this->actingAs($company, 'company')
        ->put(route('company.settings.update'), [
            'employee_can_create_event' => true,
            'default_funding_mode' => 'community_wallet',
            'default_subsidy' => 2500,
            'registration_close_hours' => 48,
            'allow_absence_marking' => false,
        ])
        ->assertRedirect();

    $settings = $company->fresh()->getSettings();

    expect($settings->employee_can_create_event)->toBeTrue()
        ->and($settings->default_funding_mode)->toBe('community_wallet')
        ->and($settings->default_subsidy)->toBe(2500)
        ->and($settings->registration_close_hours)->toBe(48)
        ->and($settings->allow_absence_marking)->toBeFalse();
});

test('an invalid funding mode is rejected', function () {
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')
        ->put(route('company.settings.update'), [
            'employee_can_create_event' => false,
            'default_funding_mode' => 'free', // «مجاني» ليس مسار تمويل
            'default_subsidy' => 0,
            'registration_close_hours' => 24,
            'allow_absence_marking' => true,
        ])
        ->assertSessionHasErrors('default_funding_mode');
});
