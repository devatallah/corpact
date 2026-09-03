import { usePage } from '@inertiajs/react';
import { Activity, BarChart3, Building2, CalendarClock, CalendarDays, CircleUser, ClipboardList, Landmark, Scale, TrendingUp, Users, Warehouse } from 'lucide-react';
import PortalHeader from '@/components/portal-header';
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
        { label: '\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645', href: '/partner/dash', icon: Activity, permission: 'dashboard.view' },
        { label: '\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062D\u062C\u0632', href: '/partner/requests-queue', icon: ClipboardList, badge: pendingCount, permission: 'bookings.view' },
        { label: '\u0627\u0644\u0641\u0631\u0648\u0639 \u0648\u0627\u0644\u0648\u062D\u062F\u0627\u062A', href: '/partner/branches', icon: Building2, permission: 'branches.view' },
        { label: '\u0627\u0644\u062A\u0642\u0648\u064A\u0645 \u0648\u0627\u0644\u062A\u0648\u0641\u0631', href: '/partner/availability', icon: CalendarDays, permission: 'availability.view' },
        { label: '\u0633\u0644\u0648\u0643\u064A\u0627\u062A\u064A', href: '/partner/reliability', icon: TrendingUp, permission: 'reliability.view' },
        { label: '\u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064A', href: '/partner/bank', icon: Landmark, permission: 'bank.view' },
        { label: '\u0627\u0644\u062C\u062F\u0648\u0644', href: '/partner/schedule', icon: CalendarClock, permission: 'schedule.view' },
        { label: '\u0627\u0644\u0645\u0631\u0627\u0641\u0642', href: '/partner/venues', icon: Warehouse, permission: 'venues.view' },
        { label: '\u0627\u0644\u062A\u0633\u0648\u064A\u0627\u062A', href: '/partner/settlements', icon: Scale, permission: 'settlements.view' },
        { label: '\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631', href: '/partner/reports', icon: BarChart3, permission: 'reports.view' },
        { label: '\u0627\u0644\u0645\u0648\u0638\u0641\u0648\u0646', href: '/partner/staff', icon: Users, permission: 'staff.view' },
        { label: '\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A', href: '/partner/profile', icon: CircleUser, permission: 'profile.view' },
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
        <div
            className="min-h-screen bg-[#F6F8F5] text-[#0A0A0A] font-arabic antialiased selection:bg-[#C8FF00] selection:text-[#0A0A0A] flex flex-col"
            dir="rtl"
        >
            <PortalHeader
                userLabel={user?.name ?? '\u0627\u0644\u0645\u0646\u0634\u0623\u0629'}
                userSub={subText || undefined}
                notificationsUrl="/partner/dash"
                
            />

            {/* Full-width header over a max-w-7xl body, as the prototype lays it out. */}
            <div className="flex-1 flex max-w-7xl mx-auto w-full">
                <PortalSidebar
                    portalTag="PARTNER"
                    userLabel={user?.name ?? '\u0627\u0644\u0645\u0646\u0634\u0623\u0629'}
                    userSub={subText || undefined}
                    navItems={navItems}
                    logoutUrl="/partner/logout"
                    infoStyle="company"
                    brandInHeader
                    
                />
                <main className="flex-1 min-w-0 p-0 sm:p-4 lg:p-6 pb-8 flex justify-center">
                    <div className="w-full max-w-6xl min-w-0 p-4 sm:p-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
