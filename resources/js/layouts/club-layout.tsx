import { usePage } from '@inertiajs/react';
import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';

export default function ClubLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage().props;
    const pendingCount = (usePage().props as Record<string, unknown>).pendingCount as number | undefined;

    const navItems: NavItem[] = [
        { label: 'لوحة التحكم', href: '/club/dash', emoji: '📊' },
        { label: 'طلبات الحجز', href: '/club/requests', emoji: '📋', badge: pendingCount },
        { label: 'الجدول', href: '/club/schedule', emoji: '🗓️' },
        { label: 'الملاعب', href: '/club/courts', emoji: '🏟️' },
        { label: 'الخصومات', href: '/club/discounts', emoji: '🏷️' },
        { label: 'التسويات', href: '/club/settlements', emoji: '💰' },
        { label: 'الملف الشخصي', href: '/club/profile', emoji: '👤' },
    ];

    const user = auth.user as { name: string; district?: string; city?: string } | undefined;

    return (
        <div className="portal-club" dir="rtl">
            <PortalSidebar
                portalTag="CLUB"
                userLabel={user?.name ?? 'النادي'}
                userSub={user?.district && user?.city ? `${user.district}، ${user.city}` : undefined}
                navItems={navItems}
                logoutUrl="/club/logout"
                infoStyle="company"
            />
            <div className="main">
                {children}
            </div>
        </div>
    );
}
