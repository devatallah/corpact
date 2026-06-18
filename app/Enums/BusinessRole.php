<?php

namespace App\Enums;

/**
 * Roles for service-provider (business) portal users (businesses table).
 */
enum BusinessRole: string
{
    case Owner = 'owner';
    case Receptionist = 'receptionist';
    case Accountant = 'accountant';

    public function label(): string
    {
        return match ($this) {
            self::Owner => 'مالك',
            self::Receptionist => 'موظف استقبال',
            self::Accountant => 'محاسب',
        };
    }

    /**
     * Get the permissions for this role.
     *
     * @return string[]
     */
    public function permissions(): array
    {
        return match ($this) {
            self::Owner => [
                'dashboard.view',
                'bookings.view',
                'bookings.approve',
                'bookings.reject',
                'bookings.propose-alternative',
                'schedule.view',
                'schedule.manage',
                'venues.view',
                'venues.create',
                'venues.update',
                'venues.delete',
                'discounts.view',
                'discounts.create',
                'discounts.update',
                'discounts.delete',
                'settlements.view',
                'profile.view',
                'profile.update',
                'staff.view',
                'staff.create',
                'staff.update',
                'staff.delete',
            ],
            self::Receptionist => [
                'dashboard.view',
                'bookings.view',
                'bookings.approve',
                'bookings.reject',
                'schedule.view',
                'profile.view',
            ],
            self::Accountant => [
                'settlements.view',
                'dashboard.view',
            ],
        };
    }

    /**
     * Check if this role has the given permission.
     */
    public function can(string $permission): bool
    {
        return in_array($permission, $this->permissions());
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions(), true);
    }
}
