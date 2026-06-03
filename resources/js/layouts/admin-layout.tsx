import { usePage } from '@inertiajs/react';
import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';

const navItems: NavItem[] = [
    { label: 'لوحة التحكم', href: '/admin/dash', emoji: '📊' },
    { label: 'الشركات', href: '/admin/companies', emoji: '🏢' },
    { label: 'الأعمال', href: '/admin/businesses', emoji: '🏟️' },
    { label: 'الموظفون', href: '/admin/employees', emoji: '👥' },
    { label: 'المجتمعات', href: '/admin/communities', emoji: '👫' },
    { label: 'الفئات', href: '/admin/categories', emoji: '⚽' },
    { label: 'الفعاليات', href: '/admin/events', emoji: '📅' },
    { label: 'الإيرادات', href: '/admin/revenue', emoji: '💰' },
    { label: 'الإشعارات', href: '/admin/notifs', emoji: '🔔' },
    { label: 'المشرفون', href: '/admin/admins', emoji: '🛡️' },
    { label: 'الملف الشخصي', href: '/admin/profile', emoji: '👤' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage().props;

    return (
        <div className="portal-admin" dir="rtl">
            <PortalSidebar
                portalTag="ADMIN"
                userLabel={auth.user?.name ?? 'مشرف النظام'}
                userSub="Super Admin"
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
