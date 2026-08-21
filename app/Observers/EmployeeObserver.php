<?php

namespace App\Observers;

use App\Models\DepartmentHistory;
use App\Models\Employee;
use App\Services\Identity\DepartureService;
use App\Services\Identity\IdentityResolver;
use App\Support\Identity\CurrentActor;
use App\Support\Tenancy\CompanyContext;

/**
 * Keeps the legacy `employees` rows glued to the global identity model:
 * every employee row gets a global user, a company membership and the
 * employee role on the company scope — whichever legacy code path created
 * it (invites, self-registration, admin panels, factories).
 */
class EmployeeObserver
{
    public function __construct(
        private IdentityResolver $resolver,
        private DepartureService $departures,
    ) {}

    public function created(Employee $employee): void
    {
        app(CompanyContext::class)->bypass(function () use ($employee): void {
            $this->resolver->linkEmployee($employee);

            // Open the first department interval (H §5 — historical reports
            // attribute to the department at event time).
            DepartmentHistory::create([
                'company_id' => $employee->company_id,
                'employee_id' => $employee->id,
                'department_id' => $employee->department_id,
                'started_at' => $employee->created_at ?? now(),
                'changed_by_user_id' => CurrentActor::resolve()['id'],
            ]);
        });
    }

    public function updated(Employee $employee): void
    {
        app(CompanyContext::class)->bypass(function () use ($employee): void {
            if ($employee->wasChanged('department_id')) {
                $this->recordDepartmentChange($employee);
            }

            if ($employee->wasChanged('status') && $employee->status === 'inactive') {
                // Departure cascade (sessions, leaderships, participations).
                $this->departures->handleDeactivation($employee);

                return;
            }

            if ($employee->wasChanged(['status', 'department_id', 'company_id', 'phone', 'email'])) {
                $this->resolver->linkEmployee($employee);
            }
        });
    }

    /**
     * Close the open department interval and start the new one — the
     * `department_history` record H §5 mandates for at-event-time reports.
     */
    private function recordDepartmentChange(Employee $employee): void
    {
        $now = now();

        DepartmentHistory::query()
            ->where('employee_id', $employee->id)
            ->whereNull('ended_at')
            ->update(['ended_at' => $now]);

        DepartmentHistory::create([
            'company_id' => $employee->company_id,
            'employee_id' => $employee->id,
            'department_id' => $employee->department_id,
            'started_at' => $now,
            'changed_by_user_id' => CurrentActor::resolve()['id'],
        ]);
    }
}
