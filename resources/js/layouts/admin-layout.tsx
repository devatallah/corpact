import { usePage } from '@inertiajs/react';
import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';
import type { Auth } from '@/types/auth';

const allNavItems: (NavItem & { permission?: string })[] = [
    { label: 'لوحة التحكم', href: '/admin/dash', emoji: '📊' },
    { label: 'الشركات', href: '/admin/companies', emoji: '🏢', permission: 'manage_companies' },
    { label: 'الأعمال', href: '/admin/businesses', emoji: '🏟️', permission: 'manage_businesses' },
    { label: 'الموظفون', href: '/admin/employees', emoji: '👥', permission: 'manage_employees' },
    { label: 'المجتمعات', href: '/admin/communities', emoji: '👫', permission: 'manage_communities' },
    { label: 'الفئات', href: '/admin/categories', emoji: '⚽', permission: 'manage_categories' },
    { label: 'الفعاليات', href: '/admin/events', emoji: '📅', permission: 'manage_events' },
    { label: 'الإيرادات', href: '/admin/revenue', emoji: '💰', permission: 'view_revenue' },
    { label: 'الإشعارات', href: '/admin/notifs', emoji: '🔔', permission: 'manage_notifications' },
    { label: 'المشرفون', href: '/admin/admins', emoji: '🛡️', permission: 'manage_admins' },
    { label: 'الملف الشخصي', href: '/admin/profile', emoji: '👤' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const permissions = auth.permissions ?? [];

    const navItems: NavItem[] = allNavItems
        .filter((item) => !item.permission || permissions.includes(item.permission))
        .map(({ permission: _, ...rest }) => rest);

    const roleLabel = auth.role_label ?? 'مشرف';

    return (
        <div className="portal-admin" dir="rtl">
            <PortalSidebar
                portalTag="ADMIN"
                userLabel={auth.user?.name ?? 'مشرف النظام'}
                userSub={roleLabel}
                userAvatar="م"
                userAvatarStyle={{ background: 'linear-gradient(135deg,#E03050,#B8001A)' }}
                navItems={navItems}
                logoutUrl="/admin/logout"
                infoStyle="admin"
            />
            <div className="main">
                {children}
            </div>
        </div>
    );
}
