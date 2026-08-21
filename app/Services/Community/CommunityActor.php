<?php

namespace App\Services\Community;

use App\Models\Company;
use App\Models\Employee;
use App\Models\User;
use App\Services\Auth\PortalLoginService;

/**
 * Resolves the global User behind a portal actor so community actions can
 * be authorized through the (permission + scope) primitive (H §4) — the
 * legacy guards authenticate profile rows, not the global account.
 */
class CommunityActor
{
    public static function forEmployee(Employee $employee): ?User
    {
        return $employee->user_id !== null
            ? User::query()->find($employee->user_id)
            : null;
    }

    /**
     * The account-manager user acting through the company portal: the
     * session stamp written at login, falling back to the user linked to
     * the company's account-manager email (CompanyObserver bridge).
     */
    public static function forCompany(Company $company): ?User
    {
        if (app()->bound('request') && request()->hasSession()) {
            $userId = app(PortalLoginService::class)->sessionUserId(request(), 'company');

            if ($userId !== null) {
                $user = User::query()->find($userId);

                if ($user !== null) {
                    return $user;
                }
            }
        }

        return $company->email !== null
            ? User::query()->where('email', $company->email)->first()
            : null;
    }
}
