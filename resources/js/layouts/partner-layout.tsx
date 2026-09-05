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
    TicketPercent,
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
type ProviderBar = {
    pending_requests: number;
    upcoming_events: number;
    acceptance_rate: number | null;
    avg_response_minutes: number | null;
    trade_name: string;
    commercial_registration: string | null;
    status: string;
};

export default function PartnerLayout({ children }: { children: ReactNode }) {
    const props = usePage<
        SharedProps & {
            pendingCount?: number;
            auth: { providerBar?: ProviderBar };
        }
    >().props;
    const { auth } = props;
    const bar = auth.providerBar;
    const permissions = auth.partnerPermissions ?? auth.permissions ?? [];

    const allNavItems: (NavItem & { permission?: string })[] = [
        {
            label: 'لوحة التحكم',
            href: '/partner/dash',
            icon: Activity,
            permission: 'dashboard.view',
        },
        {
            label: 'الطلبات',
            href: '/partner/requests-queue',
            icon: ClipboardList,
            badge: props.pendingCount ?? bar?.pending_requests,
            permission: 'bookings.view',
        },
        {
            label: 'الفروع والوحدات',
            href: '/partner/branches',
            icon: Building2,
            permission: 'branches.view',
        },
        {
            label: 'التقويم',
            href: '/partner/availability',
            icon: CalendarDays,
            permission: 'availability.view',
        },
        {
            label: 'الأداء',
            href: '/partner/reliability',
            icon: TrendingUp,
            permission: 'reliability.view',
        },
        {
            label: 'الحساب البنكي',
            href: '/partner/bank',
            icon: Landmark,
            permission: 'bank.view',
        },
        {
            label: 'الفعاليات',
            href: '/partner/schedule',
            icon: CalendarClock,
            permission: 'schedule.view',
        },
        {
            label: 'المرافق',
            href: '/partner/venues',
            icon: Warehouse,
            permission: 'venues.view',
        },
        {
            label: 'التخفيضات',
            href: '/partner/discounts',
            icon: TicketPercent,
            permission: 'discounts.view',
        },
        {
            label: 'المستحقات',
            href: '/partner/settlements',
            icon: Scale,
            permission: 'settlements.view',
        },
        {
            label: 'التقارير',
            href: '/partner/reports',
            icon: BarChart3,
            permission: 'reports.view',
        },
        {
            label: 'الموظفون',
            href: '/partner/staff',
            icon: Users,
            permission: 'staff.view',
        },
        {
            label: 'الملف والتفعيل',
            href: '/partner/profile',
            icon: CircleUser,
            permission: 'profile.view',
        },
    ];

    const navItems: NavItem[] = allNavItems
        .filter(
            (item) => !item.permission || permissions.includes(item.permission),
        )
        .map(
            (item): NavItem => ({
                label: item.label,
                href: item.href,
                icon: item.icon,
                badge: item.badge,
            }),
        );

    return (
        <PortalShell
            navItems={navItems}
            logoutUrl="/partner/logout"
            userLabel={auth.user?.name ?? 'مزوّد الخدمة'}
            userSub={auth.role_label ?? undefined}
        >
            {bar && <ProviderBarStrip bar={bar} />}
            {children}
        </PortalShell>
    );
}

/**
 * شريط المزوّد — على كل شاشة لا على لوحته وحدها.
 *
 * الطلب الذي تنتهي مهلته دون ردّ يكلّف المزوّد نقاط موثوقية، فلا يصحّ أن يكون
 * عدّاده خلف رابط: أياً كانت الشاشة المفتوحة، الرقم أمامه.
 */
function ProviderBarStrip({ bar }: { bar: ProviderBar }) {
    const response =
        bar.avg_response_minutes === null
            ? '—'
            : bar.avg_response_minutes >= 60
              ? `${Math.floor(bar.avg_response_minutes / 60)} س ${bar.avg_response_minutes % 60} د`
              : `${bar.avg_response_minutes} د`;

    return (
        <div className="space-y-3 rounded-2xl border-[0.5px] border-ink/10 bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold text-ink">
                    مزوّد خدمة معتمد
                </span>
                {bar.commercial_registration && (
                    <span
                        className="font-mono text-[10px] text-ink/50"
                        dir="ltr"
                    >
                        سجل تجاري: {bar.commercial_registration}
                    </span>
                )}
            </div>

            <h2 className="text-sm font-extrabold text-ink">
                {bar.trade_name}
            </h2>

            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                <BarStat
                    label="طلبات تنتظر ردّك"
                    value={bar.pending_requests}
                    hint={
                        bar.pending_requests > 0
                            ? 'قبل انتهاء المهلة'
                            : 'لا شيء معلّق'
                    }
                    urgent={bar.pending_requests > 0}
                />
                <BarStat
                    label="فعاليات مؤكدة قادمة"
                    value={bar.upcoming_events}
                    hint="التزمت بتقديمها"
                />
                <BarStat
                    label="معدل قبول الطلبات"
                    value={
                        bar.acceptance_rate === null
                            ? '—'
                            : `${bar.acceptance_rate}٪`
                    }
                    hint={
                        bar.acceptance_rate === null
                            ? 'لا طلبات مكتملة بعد'
                            : undefined
                    }
                />
                <BarStat
                    label="متوسط زمن ردّك"
                    value={response}
                    hint="من لحظة وصول الطلب"
                />
            </div>
        </div>
    );
}

function BarStat({
    label,
    value,
    hint,
    urgent = false,
}: {
    label: string;
    value: number | string;
    hint?: string;
    urgent?: boolean;
}) {
    return (
        <div
            className={`rounded-xl border-[0.5px] px-3 py-2 ${urgent ? 'border-warning/30 bg-warning-tint' : 'border-ink/10 bg-page'}`}
        >
            <span className="block text-[10px] text-ink/55">{label}</span>
            <span
                className={`block font-mono text-lg font-black ${urgent ? 'text-warning' : 'text-ink'}`}
            >
                {value}
            </span>
            {hint && (
                <span className="block text-[9px] text-ink/45">{hint}</span>
            )}
        </div>
    );
}
