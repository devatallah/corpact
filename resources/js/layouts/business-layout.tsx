import { usePage } from '@inertiajs/react';
import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage().props;
    const pendingCount = (usePage().props as Record<string, unknown>).pendingCount as number | undefined;

    const permissions = (auth.businessPermissions ?? []) as string[];
    const role = auth.businessRole as string | undefined;

    function can(permission: string): boolean {
        return permissions.includes(permission);
    }

    const allNavItems: (NavItem & { permission?: string })[] = [
        { label: 'لوحة التحكم', href: '/business/dash', emoji: '📊', permission: 'dashboard.view' },
        { label: 'طلبات الحجز', href: '/business/requests', emoji: '📋', badge: pendingCount, permission: 'bookings.view' },
        { label: 'الجدول', href: '/business/schedule', emoji: '🗓️', permission: 'schedule.view' },
        { label: 'المرافق', href: '/business/venues', emoji: '🏟️', permission: 'venues.view' },
        { label: 'الخصومات', href: '/business/discounts', emoji: '🏷️', permission: 'discounts.view' },
        { label: 'التسويات', href: '/business/settlements', emoji: '💰', permission: 'settlements.view' },
        { label: 'الموظفون', href: '/business/staff', emoji: '👥', permission: 'staff.view' },
        { label: 'الملف الشخصي', href: '/business/profile', emoji: '👤', permission: 'profile.view' },
    ];

    const navItems: NavItem[] = allNavItems
        .filter(item => !item.permission || can(item.permission))
        .map(({ permission, ...item }) => item);

    const user = auth.user as { name: string; district?: string; city?: string } | undefined;

    const roleLabel = role === 'receptionist' ? 'موظف استقبال' : undefined;

    return (
        <div className="portal-business" dir="rtl">
            <PortalSidebar
                portalTag="business"
                userLabel={user?.name ?? 'المنشأة'}
                userSub={roleLabel ?? (user?.district && user?.city ? `${user.district}، ${user.city}` : undefined)}
                navItems={navItems}
                logoutUrl="/business/logout"
                infoStyle="company"
            />
            <div className="main">
                {children}
            </div>
        </div>
    );
}
