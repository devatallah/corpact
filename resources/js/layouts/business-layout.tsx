import { usePage } from '@inertiajs/react';
import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage().props;
    const pendingCount = (usePage().props as Record<string, unknown>).pendingCount as number | undefined;

    const navItems: NavItem[] = [
        { label: 'لوحة التحكم', href: '/business/dash', emoji: '📊' },
        { label: 'طلبات الحجز', href: '/business/requests', emoji: '📋', badge: pendingCount },
        { label: 'الجدول', href: '/business/schedule', emoji: '🗓️' },
        { label: 'المرافق', href: '/business/venues', emoji: '🏟️' },
        { label: 'الخصومات', href: '/business/discounts', emoji: '🏷️' },
        { label: 'التسويات', href: '/business/settlements', emoji: '💰' },
        { label: 'الملف الشخصي', href: '/business/profile', emoji: '👤' },
    ];

    const user = auth.user as { name: string; district?: string; city?: string } | undefined;

    return (
        <div className="portal-business" dir="rtl">
            <PortalSidebar
                portalTag="business"
                userLabel={user?.name ?? 'المنشأة'}
                userSub={user?.district && user?.city ? `${user.district}، ${user.city}` : undefined}
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
