import { usePage } from '@inertiajs/react';
import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage().props;
    const unread = (usePage().props as Record<string, unknown>).unreadNotifications as number | undefined;
    const pendingRequests = (usePage().props as Record<string, unknown>).pendingCommunityRequests as number | undefined;

    const navItems: NavItem[] = [
        { label: 'لوحة التحكم', href: '/company/dash', emoji: '📊' },
        { label: 'الأقسام', href: '/company/departments', emoji: '🏷️' },
        { label: 'الموظفون', href: '/company/employees', emoji: '👥' },
        { label: 'المجتمعات', href: '/company/communities', emoji: '🏘️' },
        { label: 'طلبات المجتمعات', href: '/company/community-requests', emoji: '📋', badge: pendingRequests },
        { label: 'الفعاليات', href: '/company/events', emoji: '📅' },
        { label: 'البطولات', href: '/company/leagues', emoji: '🏆' },
        { label: 'المحفظة', href: '/company/wallet', emoji: '💳' },
        { label: 'التقارير', href: '/company/reports', emoji: '📈' },
        { label: 'الإشعارات', href: '/company/notifications', emoji: '🔔', badge: unread },
        { label: 'الملف الشخصي', href: '/company/profile', emoji: '👤' },
    ];

    return (
        <div className="portal-company" dir="rtl">
            <PortalSidebar
                portalTag="COMPANY"
                userLabel={auth.user?.name ?? 'الشركة'}
                userSub={auth.user && 'contact_name' in auth.user ? (auth.user as { contact_name: string }).contact_name : undefined}
                navItems={navItems}
                logoutUrl="/company/logout"
                infoStyle="company"
            />
            <div className="main">
                {children}
            </div>
        </div>
    );
}
