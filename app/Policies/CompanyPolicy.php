<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;

class CompanyPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Authenticatable $user): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Company => true,
            default => false,
        };
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Authenticatable $user, Company $company): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Company => $user->id === $company->id,
            default => false,
        };
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Authenticatable $user): bool
    {
        return $user instanceof User;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Authenticatable $user, Company $company): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Company => $user->id === $company->id,
            default => false,
        };
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Authenticatable $user, Company $company): bool
    {
        return $user instanceof User;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Authenticatable $user, Company $company): bool
    {
        return $user instanceof User;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Authenticatable $user, Company $company): bool
    {
        return $user instanceof User;
    }
}
