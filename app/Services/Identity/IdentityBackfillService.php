<?php

namespace App\Services\Identity;

use App\Enums\Role;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Partner;
use App\Models\RoleAssignment;
use App\Models\User;
use App\Support\Identity\PhoneNumber;
use App\Support\Tenancy\CompanyContext;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Idempotent migration of the legacy four-account-table world into
 * users + company_memberships + role_assignments. Runs from the identity
 * data migration and again at the end of database seeding (the seeder
 * suppresses model events, so observers don't cover it).
 */
class IdentityBackfillService
{
    public function __construct(private IdentityResolver $resolver) {}

    public function run(): void
    {
        app(CompanyContext::class)->bypass(function (): void {
            $this->backfillAdmins();
            $this->backfillCompanies();
            $this->backfillEmployees();
            $this->backfillPartners();
            // Community leadership reconciliation moved into the A5
            // migration (leader_id column no longer exists).
        });
    }

    /**
     * Pre-A3 the `users` table held only Teamat admins with a `role` string
     * column. Map it onto platform-scope assignments:
     * super_admin/admin → platform_admin, accountant → finance_admin.
     */
    private function backfillAdmins(): void
    {
        if (! Schema::hasColumn('users', 'role')) {
            return;
        }

        DB::table('users')->orderBy('id')->each(function (object $row): void {
            $role = match ($row->role) {
                'accountant' => Role::FinanceAdmin,
                default => Role::PlatformAdmin,
            };

            User::query()->find($row->id)?->assignRole($role, RoleAssignment::SCOPE_PLATFORM);
        });

        // Normalize stored admin phones so OTP lookups match.
        User::query()->whereNotNull('phone')->orderBy('id')->each(function (User $user): void {
            $normalized = PhoneNumber::normalize($user->phone);

            if ($normalized !== null && $normalized !== $user->phone) {
                $user->forceFill(['phone' => $normalized])->save();
            }
        });
    }

    private function backfillCompanies(): void
    {
        // Console-only migration of rows that predate the identity model —
        // the contact details are already-stored tenant data, not request
        // input, so the phone may bind the account-manager identity.
        Company::query()->orderBy('id')->each(function (Company $company): void {
            $this->resolver->linkCompanyAccountManager($company, bindPhone: true);
        });
    }

    private function backfillEmployees(): void
    {
        Employee::withoutGlobalScopes()->orderBy('id')->each(function (Employee $employee): void {
            $this->resolver->linkEmployee($employee);
        });
    }

    private function backfillPartners(): void
    {
        // Owners first so staff phone collisions resolve toward owners.
        Partner::query()->orderByRaw('parent_id is not null')->orderBy('id')->each(function (Partner $partner): void {
            $this->resolver->linkPartner($partner, bindPhone: true);
        });
    }
}
