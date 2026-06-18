import { usePage } from '@inertiajs/react';
import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';
import type { Auth } from '@/types/auth';

const allNavItems: (NavItem & { permission?: string; badgeKey?: string })[] = [
    { label: 'لوحة التحكم', href: '/business/dash', emoji: '📊', permission: 'view_dashboard' },
    { label: 'طلبات الحجز', href: '/business/requests', emoji: '📋', permission: 'manage_bookings', badgeKey: 'pendingCount' },
    { label: 'الجدول', href: '/business/schedule', emoji: '🗓️', permission: 'manage_schedule' },
    { label: 'المرافق', href: '/business/venues', emoji: '🏟️', permission: 'manage_venues' },
    { label: 'الخصومات', href: '/business/discounts', emoji: '🏷️', permission: 'manage_discounts' },
    { label: 'التسويات', href: '/business/settlements', emoji: '💰', permission: 'view_settlements' },
    { label: 'الملف الشخصي', href: '/business/profile', emoji: '👤', permission: 'manage_profile' },
];

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
    const props = usePage<{ auth: Auth }>().props;
    const { auth } = props;
    const pendingCount = (props as Record<string, unknown>).pendingCount as number | undefined;
    const permissions = auth.permissions ?? [];

    const navItems: NavItem[] = allNavItems
        .filter((item) => !item.permission || permissions.includes(item.permission))
        .map(({ permission: _, badgeKey, ...rest }) => ({
            ...rest,
            badge: badgeKey === 'pendingCount' ? pendingCount : undefined,
        }));

    const user = auth.user as { name: string; district?: string; city?: string } | undefined;
    const roleLabel = auth.role_label;
    const subText = [
        roleLabel,
        user?.district && user?.city ? `${user.district}، ${user.city}` : null,
    ].filter(Boolean).join(' - ');

    return (
        <div className="portal-business" dir="rtl">
            <PortalSidebar
                portalTag="business"
                userLabel={user?.name ?? 'المنشأة'}
                userSub={subText || undefined}
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
