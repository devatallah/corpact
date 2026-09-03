import { usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Building2,
    CalendarClock,
    CalendarDays,
    CircleUser,
    ClipboardList,
    Landmark,
    Scale,
    TrendingUp,
    Users,
    Warehouse,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { NavItem } from '@/components/portal-sidebar';
import PortalShell from '@/layouts/portal-shell';
import type { SharedProps } from '@/types';

/**
 * H §17 — the provider portal. Its three staff roles (owner · receptionist ·
 * accountant) see different rails, so every row is gated on the permission
 * the route itself enforces.
 */
export default function PartnerLayout({ children }: { children: ReactNode }) {
    const props = usePage<SharedProps & { pendingCount?: number }>().props;
    const { auth } = props;
    const permissions = auth.partnerPermissions ?? auth.permissions ?? [];

    const allNavItems: (NavItem & { permission?: string })[] = [
        { label: 'لوحة التحكم', href: '/partner/dash', icon: Activity, permission: 'dashboard.view' },
        { label: 'طلبات الحجز', href: '/partner/requests-queue', icon: ClipboardList, badge: props.pendingCount, permission: 'bookings.view' },
        { label: 'الفروع والوحدات', href: '/partner/branches', icon: Building2, permission: 'branches.view' },
        { label: 'التقويم والتوفر', href: '/partner/availability', icon: CalendarDays, permission: 'availability.view' },
        { label: 'سلوكياتي', href: '/partner/reliability', icon: TrendingUp, permission: 'reliability.view' },
        { label: 'الحساب البنكي', href: '/partner/bank', icon: Landmark, permission: 'bank.view' },
        { label: 'الجدول', href: '/partner/schedule', icon: CalendarClock, permission: 'schedule.view' },
        { label: 'المرافق', href: '/partner/venues', icon: Warehouse, permission: 'venues.view' },
        { label: 'التسويات', href: '/partner/settlements', icon: Scale, permission: 'settlements.view' },
        { label: 'التقارير', href: '/partner/reports', icon: BarChart3, permission: 'reports.view' },
        { label: 'الموظفون', href: '/partner/staff', icon: Users, permission: 'staff.view' },
        { label: 'الملف الشخصي', href: '/partner/profile', icon: CircleUser, permission: 'profile.view' },
    ];

    const navItems: NavItem[] = allNavItems
        .filter((item) => !item.permission || permissions.includes(item.permission))
        .map((item): NavItem => ({ label: item.label, href: item.href, icon: item.icon, badge: item.badge }));

    return (
        <PortalShell
            navItems={navItems}
            logoutUrl="/partner/logout"
            userLabel={auth.user?.name ?? 'مزوّد الخدمة'}
            userSub={auth.role_label ?? undefined}
        >
            {children}
        </PortalShell>
    );
}
