import { usePage } from '@inertiajs/react';
import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';
import type { Auth } from '@/types/auth';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    const props = usePage<{ auth: Auth }>().props;
    const { auth } = props;
    const pendingCount = (props as Record<string, unknown>).pendingCount as number | undefined;

    const permissions = (auth.partnerPermissions ?? auth.permissions ?? []) as string[];
    const role = auth.partnerRole as string | undefined;

    function can(permission: string): boolean {
        return permissions.includes(permission);
    }

    const allNavItems: (NavItem & { permission?: string })[] = [
        { label: '\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645', href: '/partner/dash', emoji: '\uD83D\uDCCA', permission: 'dashboard.view' },
        { label: '\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u062C\u0632', href: '/partner/requests-queue', emoji: '\uD83D\uDCCB', badge: pendingCount, permission: 'bookings.view' },
        { label: '\u0627\u0644\u0641\u0631\u0648\u0639 \u0648\u0627\u0644\u0648\u062D\u062F\u0627\u062A', href: '/partner/branches', emoji: '\uD83C\uDFE2', permission: 'branches.view' },
        { label: '\u0627\u0644\u062A\u0642\u0648\u064A\u0645 \u0648\u0627\u0644\u062A\u0648\u0641\u0631', href: '/partner/availability', emoji: '\uD83D\uDCC6', permission: 'availability.view' },
        { label: '\u0633\u0644\u0648\u0643\u064A\u0627\u062A\u064A', href: '/partner/reliability', emoji: '\uD83D\uDCC8', permission: 'reliability.view' },
        { label: '\u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064A', href: '/partner/bank', emoji: '\uD83C\uDFE6', permission: 'bank.view' },
        { label: '\u0627\u0644\u062C\u062F\u0648\u0644', href: '/partner/schedule', emoji: '\uD83D\uDDD3\uFE0F', permission: 'schedule.view' },
        { label: '\u0627\u0644\u0645\u0631\u0627\u0641\u0642', href: '/partner/venues', emoji: '\uD83C\uDFDF\uFE0F', permission: 'venues.view' },
        { label: '\u0627\u0644\u062A\u0633\u0648\u064A\u0627\u062A', href: '/partner/settlements', emoji: '\uD83D\uDCB0', permission: 'settlements.view' },
        { label: '\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631', href: '/partner/reports', emoji: '\uD83D\uDCC8', permission: 'reports.view' },
        { label: '\u0627\u0644\u0645\u0648\u0638\u0641\u0648\u0646', href: '/partner/staff', emoji: '\uD83D\uDC65', permission: 'staff.view' },
        { label: '\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A', href: '/partner/profile', emoji: '\uD83D\uDC64', permission: 'profile.view' },
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
        <div className="portal-partner" dir="rtl">
            <PortalSidebar
                portalTag="partner"
                userLabel={user?.name ?? '\u0627\u0644\u0645\u0646\u0634\u0623\u0629'}
                userSub={subText || undefined}
                navItems={navItems}
                logoutUrl="/partner/logout"
                infoStyle="company"
            />
            <div className="main">
                {children}
            </div>
        </div>
    );
}
