<?php

use App\Models\Company;
use App\Models\CompanyMembership;
use App\Models\Employee;

// H §5 — «يُحتسب الموظف في رسوم النظام إن كان قد فُعّل خلال الدورة قبل
// مغادرته»: the departure moment is stamped on the membership so A11 can
// join it with the activation criterion when computing the invoice.

test('departure stamps left_at on the membership', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    $membership = $employee->fresh()->membership;
    expect($membership->left_at)->toBeNull();

    $employee->fresh()->update(['status' => 'inactive']);

    $membership->refresh();

    expect($membership->status)->toBe('inactive')
        ->and($membership->left_at)->not->toBeNull()
        ->and($membership->left_at->isToday())->toBeTrue();
});

test('departures inside a billing cycle are queryable via departedBetween', function () {
    $company = Company::factory()->create();

    $departed = Employee::factory()->create(['company_id' => $company->id]);
    $staying = Employee::factory()->create(['company_id' => $company->id]);

    $departed->fresh()->update(['status' => 'inactive']);

    $cycleStart = now()->startOfMonth();
    $cycleEnd = now()->endOfMonth();

    $inCycle = CompanyMembership::query()
        ->where('company_id', $company->id)
        ->departedBetween($cycleStart, $cycleEnd)
        ->get();

    expect($inCycle)->toHaveCount(1)
        ->and($inCycle->first()->employee_id)->toBe($departed->id)
        ->and($inCycle->first()->user_id)->not->toBe($staying->fresh()->user_id);
});

test('the departed employee row is deactivated, never deleted, via the company portal', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    $this->actingAs($company, 'company')
        ->delete(route('company.employees.destroy', $employee))
        ->assertRedirect(route('company.employees.index'));

    // Historical data stays — the row exists, deactivated.
    $fresh = Employee::withoutGlobalScopes()->find($employee->id);

    expect($fresh)->not->toBeNull()
        ->and($fresh->status)->toBe('inactive')
        ->and($fresh->membership->left_at)->not->toBeNull();
});

test('rejoining clears the departure stamp', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    $employee->fresh()->update(['status' => 'inactive']);
    expect($employee->fresh()->membership->left_at)->not->toBeNull();

    $employee->fresh()->update(['status' => 'active']);

    $membership = $employee->fresh()->membership;

    expect($membership->status)->toBe('active')
        ->and($membership->left_at)->toBeNull();
});
