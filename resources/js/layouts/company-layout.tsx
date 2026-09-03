import { usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    Calendar,
    CircleUser,
    ClipboardList,
    Receipt,
    Settings,
    ShieldCheck,
    Tags,
    TrendingUp,
    Trophy,
    Users,
    UsersRound,
    Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { NavItem } from '@/components/portal-sidebar';
import PortalShell from '@/layouts/portal-shell';
import type { SharedProps } from '@/types';

/**
 * H §18 (مسؤول الحساب) — the account manager's shell. Its two counters
 * (pending community requests, unread notifications) come from shared props
 * so the rail can badge them without a second request.
 */
export default function CompanyLayout({ children }: { children: ReactNode }) {
    const props = usePage<SharedProps & { pendingCommunityRequests?: number }>().props;
    const { auth } = props;
    const unread = props.unreadNotifications;
    const pendingRequests = props.pendingCommunityRequests;

    const navItems: NavItem[] = [
        { label: 'لوحة التحكم', href: '/company/dash', icon: Activity },
        { label: 'الأقسام', href: '/company/departments', icon: Tags },
        { label: 'الموظفون', href: '/company/employees', icon: Users },
        { label: 'المجتمعات', href: '/company/communities', icon: UsersRound },
        { label: 'طلبات المجتمعات', href: '/company/community-requests', icon: ClipboardList, badge: pendingRequests },
        { label: 'الفعاليات', href: '/company/events', icon: Calendar },
        { label: 'البطولات', href: '/company/leagues', icon: Trophy },
        { label: 'المحفظة', href: '/company/wallet', icon: Wallet },
        { label: 'الفواتير', href: '/company/invoices', icon: Receipt },
        { label: 'التقارير', href: '/company/reports', icon: TrendingUp },
        { label: 'سجل التدقيق', href: '/company/audit', icon: ShieldCheck },
        { label: 'الإشعارات', href: '/company/notifications', icon: Bell, badge: unread },
        { label: 'الإعدادات', href: '/company/settings', icon: Settings },
        { label: 'الملف الشخصي', href: '/company/profile', icon: CircleUser },
    ];

    return (
        <PortalShell
            navItems={navItems}
            logoutUrl="/company/logout"
            userLabel={auth.user?.name ?? 'الشركة'}
            userSub="مسؤول الحساب"
            notificationsUrl="/company/notifications"
            contextSwitchUrl="/company/context/switch"
        >
            {children}
        </PortalShell>
    );
}
