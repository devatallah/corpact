<?php

namespace App\Enums;

/**
 * Roles for service-provider (business) portal users (businesses table).
 */
enum BusinessRole: string
{
    case Owner = 'owner';
    case Accountant = 'accountant';

    public function label(): string
    {
        return match ($this) {
            self::Owner => 'مالك المنشأة',
            self::Accountant => 'محاسب',
        };
    }

    /**
     * Permissions granted to each role.
     *
     * @return string[]
     */
    public function permissions(): array
    {
        return match ($this) {
            self::Owner => [
                'manage_venues',
                'manage_bookings',
                'manage_schedule',
                'manage_discounts',
                'view_settlements',
                'manage_profile',
                'view_dashboard',
            ],
            self::Accountant => [
                'view_settlements',
                'view_dashboard',
            ],
        };
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions(), true);
    }
}
