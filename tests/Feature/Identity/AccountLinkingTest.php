<?php

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\CompanyMembership;
use App\Models\Employee;
use App\Models\User;

// H §3/§4: the same phone appearing under a second company becomes a new
// membership on the SAME global user — never a duplicate account. Multi-
// membership users pick a context at login and can switch it; every switch
// is audited.

test('the same phone under a second company links to one global user', function () {
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();

    $first = Employee::factory()->create(['company_id' => $companyA->id, 'phone' => '0509500001']);
    $usersBefore = User::count();

    $second = Employee::factory()->create([
        'company_id' => $companyB->id,
        'phone' => '0509500001',
        'email' => 'other@example.com',
    ]);

    expect(User::count())->toBe($usersBefore) // no duplicate account
        ->and($second->fresh()->user_id)->toBe($first->fresh()->user_id);

    $user = $first->fresh()->user;
    expect($user->memberships)->toHaveCount(2)
        ->and($user->memberships->pluck('company_id')->all())->toEqualCanonicalizing([$companyA->id, $companyB->id]);
});

test('a multi-membership user chooses a context at login', function () {
    $otp = fakeOtp();
    $companyA = Company::factory()->create(['name' => 'شركة أ']);
    $companyB = Company::factory()->create(['name' => 'شركة ب']);

    Employee::factory()->create(['company_id' => $companyA->id, 'phone' => '0509500002']);
    $employeeB = Employee::factory()->create([
        'company_id' => $companyB->id,
        'phone' => '0509500002',
        'email' => 'b@example.com',
    ]);

    $this->post(route('employee.otp.request'), ['phone' => '0509500002']);

    // Verified, but two memberships → context chooser instead of a session.
    $this->post(route('employee.otp.verify'), ['phone' => '0509500002', 'code' => $otp->lastCode()])
        ->assertRedirect(route('employee.login'));
    $this->assertGuest('employee');

    $this->get(route('employee.login'))
        ->assertInertia(fn ($page) => $page
            ->where('step', 'context')
            ->has('contextOptions', 2));

    $this->post(route('employee.login.context'), ['context_id' => $companyB->id])
        ->assertRedirect(route('employee.home'));

    $this->assertAuthenticatedAs($employeeB->fresh(), 'employee');
});

test('a logged-in multi-membership user can switch context and the switch is audited', function () {
    $otp = fakeOtp();
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();

    $employeeA = Employee::factory()->create(['company_id' => $companyA->id, 'phone' => '0509500003']);
    $employeeB = Employee::factory()->create([
        'company_id' => $companyB->id,
        'phone' => '0509500003',
        'email' => 'switch@example.com',
    ]);

    $this->post(route('employee.otp.request'), ['phone' => '0509500003']);
    $this->post(route('employee.otp.verify'), ['phone' => '0509500003', 'code' => $otp->lastCode()]);
    $this->post(route('employee.login.context'), ['context_id' => $companyA->id]);
    $this->assertAuthenticatedAs($employeeA->fresh(), 'employee');

    $this->post(route('employee.context.switch'), ['context_id' => $companyB->id])
        ->assertRedirect(route('employee.home'));

    $this->assertAuthenticatedAs($employeeB->fresh(), 'employee');

    $log = ActivityLog::query()->where('type', 'context_switched')->first();
    expect($log)->not->toBeNull()
        ->and($log->company_id)->toBe($companyB->id)
        ->and($log->actor_user_id)->toBe($employeeA->fresh()->user_id);
});

test('a user cannot switch into a company they have no membership in', function () {
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $companyA->id]);

    $this->actingAs($employee, 'employee')
        ->post(route('employee.context.switch'), ['context_id' => $companyB->id])
        ->assertSessionHasErrors('context');

    $this->assertAuthenticatedAs($employee, 'employee');
});

test('an inactive membership is not offered as a login context', function () {
    $otp = fakeOtp();
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();

    $employeeA = Employee::factory()->create(['company_id' => $companyA->id, 'phone' => '0509500004']);
    Employee::factory()->inactive()->create([
        'company_id' => $companyB->id,
        'phone' => '0509500004',
        'email' => 'inactive@example.com',
    ]);

    expect(CompanyMembership::where('status', 'inactive')->count())->toBe(1);

    // Only one active membership → logs straight in, no chooser.
    $this->post(route('employee.otp.request'), ['phone' => '0509500004']);
    $this->post(route('employee.otp.verify'), ['phone' => '0509500004', 'code' => $otp->lastCode()])
        ->assertRedirect(route('employee.home'));

    $this->assertAuthenticatedAs($employeeA->fresh(), 'employee');
});
