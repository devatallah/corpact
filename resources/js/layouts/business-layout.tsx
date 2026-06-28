import { usePage } from '@inertiajs/react';
import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';
import type { Auth } from '@/types/auth';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
    const props = usePage<{ auth: Auth }>().props;
    const { auth } = props;
    const pendingCount = (props as Record<string, unknown>).pendingCount as number | undefined;

    const permissions = (auth.businessPermissions ?? auth.permissions ?? []) as string[];
    const role = auth.businessRole as string | undefined;

    function can(permission: string): boolean {
        return permissions.includes(permission);
    }

    const allNavItems: (NavItem & { permission?: string })[] = [
        { label: '\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645', href: '/business/dash', emoji: '\uD83D\uDCCA', permission: 'dashboard.view' },
        { label: '\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u062C\u0632', href: '/business/requests', emoji: '\uD83D\uDCCB', badge: pendingCount, permission: 'bookings.view' },
        { label: '\u0627\u0644\u062C\u062F\u0648\u0644', href: '/business/schedule', emoji: '\uD83D\uDDD3\uFE0F', permission: 'schedule.view' },
        { label: '\u0627\u0644\u0645\u0631\u0627\u0641\u0642', href: '/business/venues', emoji: '\uD83C\uDFDF\uFE0F', permission: 'venues.view' },
        { label: '\u0627\u0644\u062E\u0635\u0648\u0645\u0627\u062A', href: '/business/discounts', emoji: '\uD83C\uDFF7\uFE0F', permission: 'discounts.view' },
        { label: '\u0627\u0644\u062A\u0633\u0648\u064A\u0627\u062A', href: '/business/settlements', emoji: '\uD83D\uDCB0', permission: 'settlements.view' },
        { label: '\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631', href: '/business/reports', emoji: '\uD83D\uDCC8', permission: 'reports.view' },
        { label: '\u0627\u0644\u0645\u0648\u0638\u0641\u0648\u0646', href: '/business/staff', emoji: '\uD83D\uDC65', permission: 'staff.view' },
        { label: '\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A', href: '/business/profile', emoji: '\uD83D\uDC64', permission: 'profile.view' },
    ];

    const navItems: NavItem[] = allNavItems
        .filter(item => !item.permission || can(item.permission))
        .map(({ permission, ...item }) => item);

    const user = auth.user as { name: string; district?: string; city?: string } | undefined;
    const roleLabel = auth.role_label;
    const subText = [
        roleLabel,
        user?.district && user?.city ? `${user.district}\u060C ${user.city}` : null,
    ].filter(Boolean).join(' - ');

    return (
        <div className="portal-business" dir="rtl">
            <PortalSidebar
                portalTag="business"
                userLabel={user?.name ?? '\u0627\u0644\u0645\u0646\u0634\u0623\u0629'}
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
