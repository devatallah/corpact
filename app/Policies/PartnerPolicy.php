<?php

namespace App\Policies;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;

class PartnerPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Authenticatable $user): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Partner => true,
            default => false,
        };
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Authenticatable $user, Partner $partner): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Partner => $user->resolvedPartnerId() === $partner->id || $user->id === $partner->id,
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
    public function update(Authenticatable $user, Partner $partner): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Partner => $user->resolvedPartnerId() === $partner->id && $user->isOwner(),
            default => false,
        };
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Authenticatable $user, Partner $partner): bool
    {
        return $user instanceof User;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Authenticatable $user, Partner $partner): bool
    {
        return $user instanceof User;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Authenticatable $user, Partner $partner): bool
    {
        return $user instanceof User;
    }
}
