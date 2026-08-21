<?php

use App\Models\ActivityLog;
use App\Models\Community;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;

// H §4 mandatory test (acceptance scenario 11): probing an entity id that
// belongs to another company returns 404 — never 403 — and is audit-logged.

test('cross-company community probe returns 404 and is audited', function () {
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $companyA->id]);
    $foreign = Community::factory()->create(['company_id' => $companyB->id]);

    $this->actingAs($employee, 'employee')
        ->get(route('employee.community.show', $foreign))
        ->assertNotFound();

    $log = ActivityLog::query()->where('type', 'cross_company_probe')->first();

    expect($log)->not->toBeNull()
        ->and($log->company_id)->toBe($companyA->id)
        ->and($log->subject_id)->toBe($foreign->id)
        ->and($log->data['foreign_company_id'])->toBe($companyB->id)
        ->and($log->actor_user_id)->toBe($employee->fresh()->user_id);
});

test('cross-company event probe returns 404, own event resolves', function () {
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $companyA->id]);

    $own = Event::factory()->create(['company_id' => $companyA->id]);
    $foreign = Event::factory()->create(['company_id' => $companyB->id]);

    $this->actingAs($employee, 'employee')
        ->get(route('employee.events.show', $own))
        ->assertOk();

    $this->actingAs($employee, 'employee')
        ->get(route('employee.events.show', $foreign))
        ->assertNotFound();
});

test('company portal cannot allocate funds to another company\'s community', function () {
    $companyA = Company::factory()->create();
    $companyB = Company::factory()->create();
    $foreign = Community::factory()->create(['company_id' => $companyB->id]);

    $this->actingAs($companyA, 'company')
        ->post(route('company.wallet.distribute'), [
            'community_id' => $foreign->id,
            'amount' => 100,
        ])
        ->assertNotFound();

    expect(ActivityLog::query()->where('type', 'cross_company_probe')->exists())->toBeTrue()
        ->and($foreign->fresh()->balance)->toBe(0.0);
});

test('a genuinely missing id is a plain 404 with no probe audit', function () {
    $company = Company::factory()->create();
    $employee = Employee::factory()->create(['company_id' => $company->id]);

    $this->actingAs($employee, 'employee')
        ->get(route('employee.community.show', 999999))
        ->assertNotFound();

    expect(ActivityLog::query()->where('type', 'cross_company_probe')->exists())->toBeFalse();
});
