<?php

namespace App\Services\Identity;

use App\Enums\Role;
use App\Models\Company;
use App\Models\CompanyMembership;
use App\Models\Employee;
use App\Models\Partner;
use App\Models\RoleAssignment;
use App\Models\User;
use App\Support\Identity\PhoneNumber;

/**
 * Bridges the legacy per-portal account rows onto the global identity
 * model: one person = one `users` row keyed by phone (H §3 — a phone seen
 * under a second company becomes a membership on the SAME user, never a
 * duplicate account).
 */
class IdentityResolver
{
    /**
     * Find or create the global user for a person. Phone (normalized) is the
     * primary dedup key; email is the fallback.
     */
    public function userFor(string $name, ?string $email, ?string $phone): User
    {
        $normalizedPhone = PhoneNumber::normalize($phone);

        $user = null;

        if ($normalizedPhone !== null) {
            $user = User::query()->where('phone', $normalizedPhone)->first();
        }

        if ($user === null && $email !== null) {
            $user = User::query()->where('email', $email)->first();
        }

        if ($user === null) {
            return User::query()->create([
                'name' => $name,
                'email' => $email,
                'phone' => $normalizedPhone,
                'status' => 'active',
            ]);
        }

        // Fill identity blanks without overwriting established values.
        if ($user->phone === null && $normalizedPhone !== null) {
            $user->forceFill(['phone' => $normalizedPhone])->save();
        }

        return $user;
    }

    /**
     * Ensure the employee row is linked to a global user, has a company
     * membership, and holds the employee role on the company scope.
     */
    public function linkEmployee(Employee $employee): CompanyMembership
    {
        $user = $employee->user_id
            ? User::query()->findOrFail($employee->user_id)
            : $this->userFor($employee->name, $employee->email, $employee->phone);

        if ($employee->user_id !== $user->id) {
            $employee->forceFill(['user_id' => $user->id])->saveQuietly();
        }

        $membership = CompanyMembership::query()->firstOrNew([
            'user_id' => $user->id,
            'company_id' => $employee->company_id,
        ]);

        $membership->fill([
            'employee_id' => $employee->id,
            'department_id' => $employee->department_id,
            'status' => self::membershipStatus($employee->status),
        ]);

        // A rejoining/reactivated employee is a current member again — the
        // departure stamp belongs to the closed chapter (A4/H §5).
        if ($membership->status === 'active') {
            $membership->left_at = null;
        }

        if (! $membership->exists) {
            $membership->joined_at = $employee->created_at?->toDateString() ?? now()->toDateString();
        }

        $membership->save();

        $user->assignRole(Role::Employee, RoleAssignment::SCOPE_COMPANY, $employee->company_id);

        return $membership;
    }

    /**
     * Ensure a partner (owner or staff) account is linked to a global user
     * holding the provider role on the provider scope.
     */
    public function linkPartner(Partner $partner): User
    {
        $user = $partner->user_id
            ? User::query()->findOrFail($partner->user_id)
            : $this->userFor(
                $partner->contact_name ?: $partner->name,
                $partner->email,
                $partner->contact_phone,
            );

        if ($partner->user_id !== $user->id) {
            $partner->forceFill(['user_id' => $user->id])->saveQuietly();
        }

        $user->assignRole(Role::Provider, RoleAssignment::SCOPE_PROVIDER, $partner->resolvedPartnerId());

        return $user;
    }

    /**
     * Ensure the company's account manager exists as a global user with the
     * account_manager role on the company scope.
     */
    public function linkCompanyAccountManager(Company $company): ?User
    {
        if (! $company->email) {
            return null;
        }

        $user = $this->userFor(
            $company->contact_name ?: $company->name,
            $company->email,
            $company->contact_phone,
        );

        $user->assignRole(Role::AccountManager, RoleAssignment::SCOPE_COMPANY, $company->id);

        return $user;
    }

    /**
     * Map a legacy employee status onto the membership status enum.
     */
    public static function membershipStatus(?string $employeeStatus): string
    {
        return $employeeStatus === 'active' ? 'active' : 'inactive';
    }
}
