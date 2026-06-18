<?php

namespace App\Enums;

/**
 * Roles for Teamat platform-level admin users (users table).
 */
enum AdminRole: string
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case Accountant = 'accountant';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'مدير عام',
            self::Admin => 'مشرف',
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
            self::SuperAdmin => [
                'manage_admins',
                'manage_companies',
                'manage_businesses',
                'manage_employees',
                'manage_communities',
                'manage_categories',
                'manage_events',
                'view_revenue',
                'manage_notifications',
                'manage_settings',
            ],
            self::Admin => [
                'manage_companies',
                'manage_businesses',
                'manage_employees',
                'manage_communities',
                'manage_categories',
                'manage_events',
                'view_revenue',
                'manage_notifications',
            ],
            self::Accountant => [
                'view_revenue',
                'view_companies',
                'view_businesses',
                'view_settlements',
            ],
        };
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions(), true);
    }
}
