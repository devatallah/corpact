<?php

use App\Models\Company;
use App\Models\Department;
use App\Models\DepartmentHistory;
use App\Models\Employee;
use Illuminate\Support\Carbon;

// H §5 — تغيير الإدارة يُسجَّل في department_history، والتقارير التاريخية
// تُنسب للإدارة وقت الحدث لا الإدارة الحالية.

afterEach(fn () => Carbon::setTestNow());

test('creating an employee opens the first department interval', function () {
    $company = Company::factory()->create();
    $department = Department::create(['company_id' => $company->id, 'name' => 'التقنية']);

    $employee = Employee::factory()->create([
        'company_id' => $company->id,
        'department_id' => $department->id,
    ]);

    $history = DepartmentHistory::withoutGlobalScopes()->where('employee_id', $employee->id)->get();

    expect($history)->toHaveCount(1)
        ->and($history->first()->department_id)->toBe($department->id)
        ->and($history->first()->ended_at)->toBeNull();
});

test('changing the department closes the open interval and opens a new one', function () {
    $company = Company::factory()->create();
    $tech = Department::create(['company_id' => $company->id, 'name' => 'التقنية']);
    $finance = Department::create(['company_id' => $company->id, 'name' => 'المالية']);

    $employee = Employee::factory()->create([
        'company_id' => $company->id,
        'department_id' => $tech->id,
    ]);

    $employee->update(['department_id' => $finance->id]);

    $intervals = DepartmentHistory::withoutGlobalScopes()
        ->where('employee_id', $employee->id)
        ->orderBy('id')
        ->get();

    expect($intervals)->toHaveCount(2)
        ->and($intervals[0]->department_id)->toBe($tech->id)
        ->and($intervals[0]->ended_at)->not->toBeNull()
        ->and($intervals[1]->department_id)->toBe($finance->id)
        ->and($intervals[1]->ended_at)->toBeNull();

    // Exactly one open interval — one department at a time.
    expect(DepartmentHistory::withoutGlobalScopes()
        ->where('employee_id', $employee->id)
        ->whereNull('ended_at')
        ->count())->toBe(1);
});

test('historical attribution resolves to the department AT EVENT TIME, not the current one', function () {
    $company = Company::factory()->create();
    $tech = Department::create(['company_id' => $company->id, 'name' => 'التقنية']);
    $finance = Department::create(['company_id' => $company->id, 'name' => 'المالية']);

    Carbon::setTestNow(now()->subDays(30));
    $employee = Employee::factory()->create([
        'company_id' => $company->id,
        'department_id' => $tech->id,
    ]);

    Carbon::setTestNow(now()->addDays(20)); // -10 days from real now
    $employee->fresh()->update(['department_id' => $finance->id]);

    Carbon::setTestNow();

    // An event 15 days ago belongs to التقنية even though the employee is
    // in المالية today.
    expect($employee->fresh()->departmentAt(now()->subDays(15))?->id)->toBe($tech->id)
        ->and($employee->fresh()->departmentAt(now()->subDays(5))?->id)->toBe($finance->id)
        ->and($employee->fresh()->department_id)->toBe($finance->id);

    // Before the employee existed there is no attribution.
    expect(DepartmentHistory::departmentIdAt($employee->id, now()->subDays(60)))->toBeNull();
});

test('an employee without a department records a null interval until assigned', function () {
    $company = Company::factory()->create();
    $tech = Department::create(['company_id' => $company->id, 'name' => 'التقنية']);

    Carbon::setTestNow(now()->subDays(10));
    $employee = Employee::factory()->create([
        'company_id' => $company->id,
        'department_id' => null,
    ]);

    Carbon::setTestNow(now()->addDays(5)); // -5 days from real now
    $employee->fresh()->update(['department_id' => $tech->id]);

    Carbon::setTestNow();

    expect(DepartmentHistory::departmentIdAt($employee->id, now()->subDays(7)))->toBeNull()
        ->and(DepartmentHistory::departmentIdAt($employee->id, now()->subDays(2)))->toBe($tech->id);
});
