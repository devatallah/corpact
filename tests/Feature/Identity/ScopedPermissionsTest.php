<?php

use App\Enums\Role;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use App\Services\Authorization\AuthorizationService;
use App\Services\Community\LeadershipService;
use App\Support\Tenancy\CompanyContext;

// H §4: every check is (permission + scope) — «هل يملك هذا المستخدم صلاحية
// event.cancel على المجتمع رقم 12؟» — never a bare role. One user can hold
// three roles in three scopes and still sees only what each scope allows.

function threeScopeUser(): array
{
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();

    $communityX = Community::factory()->create(['company_id' => $companyA->id]);
    $communityY = Community::factory()->create(['company_id' => $companyA->id]);
    $communityZ = Community::factory()->create(['company_id' => $companyB->id]);

    // Role 1: employee in company A (observer creates user + membership + role).
    $employee = Employee::factory()->create(['company_id' => $companyA->id, 'phone' => '0509400001']);
    $user = $employee->fresh()->user;

    // Role 2: primary leader of community X (role_assignments — A5/H §6).
    app(CompanyContext::class)->bypass(function () use ($communityX, $employee): void {
        app(LeadershipService::class)
            ->assignLeader($communityX, $employee->fresh(), asPrimary: true);
    });

    // Role 3: account manager of company B.
    $user->assignRole(Role::AccountManager, 'company', $companyB->id);

    return [$user->fresh(), $employee, $companyA, $companyB, $communityX, $communityY, $communityZ];
}

test('one user with three roles in three scopes gets each permission only in its scope', function () {
    [$user, , $companyA, $companyB, $communityX, $communityY, $communityZ] = threeScopeUser();

    $authz = app(AuthorizationService::class);

    // Leader permissions hold on community X only.
    expect($authz->can($user, 'event.approve', 'community', $communityX->id))->toBeTrue()
        ->and($authz->can($user, 'attendance.edit', 'community', $communityX->id))->toBeTrue()
        ->and($authz->can($user, 'event.approve', 'community', $communityY->id))->toBeFalse()
        ->and($authz->can($user, 'event.approve', 'community', $communityZ->id))->toBeTrue(); // via AM on company B

    // Account-manager permissions hold on company B only.
    expect($authz->can($user, 'wallet.allocate', 'company', $companyB->id))->toBeTrue()
        ->and($authz->can($user, 'wallet.topup.request', 'company', $companyB->id))->toBeTrue()
        ->and($authz->can($user, 'wallet.allocate', 'company', $companyA->id))->toBeFalse();

    // Employee role grants participation, never management.
    expect($authz->can($user, 'event.join', 'company', $companyA->id))->toBeTrue()
        ->and($authz->can($user, 'event.cancel', 'company', $companyA->id))->toBeFalse();

    // No platform reach whatsoever.
    expect($authz->can($user, 'platform.manage'))->toBeFalse()
        ->and($authz->can($user, 'event.force_state'))->toBeFalse();
});

test('the ملحق-ب matrix separates platform admin from finance admin', function () {
    $platform = User::factory()->platformAdmin()->create();
    $finance = User::factory()->financeAdmin()->create();

    $authz = app(AuthorizationService::class);

    // Financial approvals belong to the finance admin only.
    expect($authz->can($finance, 'wallet.topup.approve'))->toBeTrue()
        ->and($authz->can($finance, 'settlement.approve'))->toBeTrue()
        ->and($authz->can($platform, 'wallet.topup.approve'))->toBeFalse()
        ->and($authz->can($platform, 'settlement.approve'))->toBeFalse();

    // Operations belong to the platform admin only.
    expect($authz->can($platform, 'event.force_state'))->toBeTrue()
        ->and($authz->can($platform, 'catalog.manage'))->toBeTrue()
        ->and($authz->can($finance, 'event.force_state'))->toBeFalse()
        ->and($authz->can($finance, 'catalog.manage'))->toBeFalse();

    // Platform-scope assignments cover any scope (whole-platform reach).
    $company = Company::factory()->create();
    expect($authz->can($platform, 'event.cancel', 'company', $company->id))->toBeTrue();
});

test('provider permissions are confined to their own provider scope', function () {
    $user = User::factory()->create();
    $user->assignRole(Role::Provider, 'provider', 7);

    $authz = app(AuthorizationService::class);

    expect($authz->can($user, 'event.cancel', 'provider', 7))->toBeTrue()
        ->and($authz->can($user, 'settlement.dispute', 'provider', 7))->toBeTrue()
        ->and($authz->can($user, 'event.cancel', 'provider', 8))->toBeFalse()
        ->and($authz->can($user, 'settlement.approve', 'provider', 7))->toBeFalse();
});

test('with an active company context queries only surface that company\'s data', function () {
    [, , $companyA, $companyB, $communityX, $communityY, $communityZ] = threeScopeUser();

    $context = app(CompanyContext::class);

    $context->set($companyA->id);
    expect(Community::pluck('id')->all())->toEqualCanonicalizing([$communityX->id, $communityY->id]);

    $context->set($companyB->id);
    expect(Community::pluck('id')->all())->toEqualCanonicalizing([$communityZ->id]);

    $context->clear();
    expect(Community::count())->toBe(3);
});

test('the multi-scope user browsing the employee portal sees only the active company', function () {
    $otp = fakeOtp();
    [, $employee, , , , , $communityZ] = threeScopeUser();

    $this->post(route('employee.otp.request'), ['phone' => '0509400001']);
    $this->post(route('employee.otp.verify'), ['phone' => '0509400001', 'code' => $otp->lastCode()])
        ->assertRedirect(route('employee.home'));

    $this->assertAuthenticatedAs($employee, 'employee');

    // Company B data is unreachable from the employee session in company A —
    // 404, not 403, so existence is not leaked.
    $this->get(route('employee.community.show', $communityZ))->assertNotFound();
});
