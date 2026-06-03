<?php

namespace App\Policies;

use App\Models\Business;
use App\Models\Venue;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;

class VenuePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Authenticatable $user): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Business => true,
            default => false,
        };
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Authenticatable $user, Venue $venue): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Business => $user->id === $venue->business_id,
            default => false,
        };
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Authenticatable $user): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Business => true,
            default => false,
        };
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Authenticatable $user, Venue $venue): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Business => $user->id === $venue->business_id,
            default => false,
        };
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Authenticatable $user, Venue $venue): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Business => $user->id === $venue->business_id,
            default => false,
        };
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Authenticatable $user, Venue $venue): bool
    {
        return $user instanceof User;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Authenticatable $user, Venue $venue): bool
    {
        return $user instanceof User;
    }
}
