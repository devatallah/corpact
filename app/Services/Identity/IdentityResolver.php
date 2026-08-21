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
     *
     * **Resolution never writes `users.phone`.** That column is the login
     * credential (`OtpLoginService::userForPhone`), and the fallback above
     * reaches an existing identity from an *email* alone — so back-filling
     * the phone here would let any caller that can name an email move the
     * login credential of that identity onto a number it chose. Binding is a
     * separate, explicitly-vouched step: `bindPhone()`.
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

        return $user;
    }

    /**
     * Give an identity that has no login phone one.
     *
     * The phone **is** the credential on every OTP portal, so this is only
     * called where the number is vouched for: a staff-initiated write inside
     * an authenticated panel (admin company/employee edit), the legacy
     * backfill command, or an acceptance whose phone was proven by OTP.
     * Never from anonymous request input.
     *
     * Two invariants: an established number is never overwritten, and a
     * number already owned by another identity is never moved — the other
     * person's sessions would follow it.
     */
    public function bindPhone(User $user, ?string $phone): User
    {
        $normalized = PhoneNumber::normalize($phone);

        if ($normalized === null || $user->phone !== null) {
            return $user;
        }

        $takenByAnother = User::query()
            ->where('phone', $normalized)
            ->whereKeyNot($user->getKey())
            ->exists();

        if ($takenByAnother) {
            return $user;
        }

        $user->forceFill(['phone' => $normalized])->save();

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

        // The employee row is only ever written by an authenticated panel
        // (company staff / platform admin), by the OTP-verified invitation
        // acceptance, or by self-registration onto a company domain — all
        // vouched paths — so a phone landing here may bind the identity that
        // was provisioned without one. This is what keeps an admin-created,
        // phone-less account manager reachable once someone fills the number
        // in, now that resolution no longer writes the credential itself.
        $this->bindPhone($user, $employee->phone);

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
     *
     * `$bindPhone` is opt-in because this runs from the PUBLIC provider
     * registration (`POST /partner/register`) too: only a caller that can
     * vouch for the number (admin panel, backfill command) may set it.
     */
    public function linkPartner(Partner $partner, bool $bindPhone = false): User
    {
        $user = $partner->user_id
            ? User::query()->findOrFail($partner->user_id)
            : $this->userFor(
                $partner->contact_name ?: $partner->name,
                $partner->email,
                $partner->contact_phone,
            );

        if ($bindPhone) {
            $this->bindPhone($user, $partner->contact_phone);
        }

        if ($partner->user_id !== $user->id) {
            $partner->forceFill(['user_id' => $user->id])->saveQuietly();
        }

        $user->assignRole(Role::Provider, RoleAssignment::SCOPE_PROVIDER, $partner->resolvedPartnerId());

        return $user;
    }

    /**
     * Ensure the company's account manager exists as a global user with the
     * account_manager role on the company scope.
     *
     * `$bindPhone` is opt-in for the same reason as `linkPartner()`: the
     * PUBLIC company registration (`POST /company/register`) reaches this
     * method with caller-supplied contact details.
     */
    public function linkCompanyAccountManager(Company $company, bool $bindPhone = false): ?User
    {
        if (! $company->email) {
            return null;
        }

        $user = $this->userFor(
            $company->contact_name ?: $company->name,
            $company->email,
            $company->contact_phone,
        );

        if ($bindPhone) {
            $this->bindPhone($user, $company->contact_phone);
        }

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
