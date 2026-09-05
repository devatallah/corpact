<?php

namespace App\Enums;

/**
 * Roles for service-provider (partner) portal users (partners table).
 */
enum PartnerRole: string
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
                'bookings.cancel',
                'branches.view',
                'branches.manage',
                'availability.view',
                'availability.manage',
                'bank.view',
                'bank.manage',
                'reliability.view',
                'schedule.view',
                'schedule.manage',
                'venues.view',
                'venues.create',
                'venues.update',
                'venues.delete',
                // A17 — التخفيضات اتفاق تجاري: المالك يبرمه، والمحاسب يراه.
                'discounts.view',
                'discounts.manage',
                'settlements.view',
                'reports.view',
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
                'branches.view',
                'availability.view',
                'availability.manage',
                'reliability.view',
                'schedule.view',
                'profile.view',
            ],
            self::Accountant => [
                'settlements.view',
                'reports.view',
                'dashboard.view',
                'bank.view',
                'reliability.view',
                'discounts.view',
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
