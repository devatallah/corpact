<?php

namespace App\Services\Company;

use App\Models\Company;
use App\Models\Employee;
use App\Models\Invitation;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CompanyEmployeeService
{
    /**
     * List employees for a company with optional filters.
     *
     * @param  array{status?: string, department?: string, search?: string, per_page?: int}  $filters
     */
    public function list(Company $company, array $filters = []): LengthAwarePaginator
    {
        return Employee::query()
            ->where('company_id', $company->id)
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['department_id']), fn ($query) => $query->where('department_id', $filters['department_id']))
            ->when(isset($filters['search']), fn ($query) => $query->where(fn ($q) => $q->where('name', 'like', '%'.$filters['search'].'%')
                ->orWhere('email', 'like', '%'.$filters['search'].'%')
            ))
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Invite an employee by email.
     */
    public function invite(Company $company, ?Employee $invitedBy, string $email): Invitation
    {
        $existingPending = Invitation::query()
            ->where('company_id', $company->id)
            ->where('email', $email)
            ->where('status', 'pending')
            ->exists();

        if ($existingPending) {
            throw ValidationException::withMessages([
                'email' => ['An invitation has already been sent to this email address.'],
            ]);
        }

        $alreadyEmployee = Employee::query()
            ->where('company_id', $company->id)
            ->where('email', $email)
            ->exists();

        if ($alreadyEmployee) {
            throw ValidationException::withMessages([
                'email' => ['This person is already an employee of your company.'],
            ]);
        }

        $inviterId = $invitedBy?->id;

        if (! $inviterId) {
            $hrEmployee = Employee::where('email', $company->email)
                ->where('company_id', $company->id)
                ->first();
            $inviterId = $hrEmployee?->id ?? Employee::where('company_id', $company->id)->value('id');
        }

        return Invitation::create([
            'company_id' => $company->id,
            'invited_by' => $inviterId,
            'email' => $email,
            'token' => Str::random(48),
            'status' => 'pending',
        ]);
    }
}
