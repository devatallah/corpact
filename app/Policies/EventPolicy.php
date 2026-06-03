<?php

namespace App\Policies;

use App\Models\Business;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Event;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;

class EventPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Authenticatable $user): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Company => true,
            $user instanceof Business => true,
            $user instanceof Employee => true,
            default => false,
        };
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Authenticatable $user, Event $event): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Company => $user->id === $event->company_id,
            $user instanceof Business => $user->id === $event->business_id,
            $user instanceof Employee => $user->company_id === $event->company_id,
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
            $user instanceof Company => true,
            $user instanceof Employee => true,
            default => false,
        };
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Authenticatable $user, Event $event): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Company => $user->id === $event->company_id,
            default => false,
        };
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Authenticatable $user, Event $event): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Company => $user->id === $event->company_id,
            default => false,
        };
    }

    /**
     * Determine whether the user can cancel the event.
     */
    public function cancel(Authenticatable $user, Event $event): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Company => $user->id === $event->company_id,
            default => false,
        };
    }

    /**
     * Determine whether the user can approve a booking request.
     */
    public function approve(Authenticatable $user, Event $event): bool
    {
        return match (true) {
            $user instanceof User => true,
            $user instanceof Business => $user->id === $event->business_id,
            default => false,
        };
    }

    /**
     * Determine whether the user can reject a booking request.
     */
    public function reject(Authenticatable $user, Event $event): bool
    {
        return $this->approve($user, $event);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Authenticatable $user, Event $event): bool
    {
        return $user instanceof User;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Authenticatable $user, Event $event): bool
    {
        return $user instanceof User;
    }
}
