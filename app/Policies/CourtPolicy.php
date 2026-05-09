<?php

namespace App\Policies;

use App\Models\Club;
use App\Models\Court;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;

class CourtPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Authenticatable $user): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Club => true,
            default => false,
        };
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Authenticatable $user, Court $court): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Club => $user->id === $court->club_id,
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
            $user instanceof Club => true,
            default => false,
        };
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Authenticatable $user, Court $court): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Club => $user->id === $court->club_id,
            default => false,
        };
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Authenticatable $user, Court $court): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Club => $user->id === $court->club_id,
            default => false,
        };
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Authenticatable $user, Court $court): bool
    {
        return $user instanceof User;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Authenticatable $user, Court $court): bool
    {
        return $user instanceof User;
    }
}
