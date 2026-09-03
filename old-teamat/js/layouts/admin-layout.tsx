import { usePage } from '@inertiajs/react';
import {
    Activity, AlertTriangle, Bell, Building2, Calendar, CalendarOff, CircleUser,
    ClipboardList, Compass, FileSpreadsheet, FileText, Ghost, Headphones, KeyRound, Landmark,
    MessageSquare, Receipt, Ruler, Scale, ScrollText, SearchCheck, Settings,
    Shield, ShieldCheck, Siren, Tags, TrendingUp, UserRound, Users, UsersRound,
} from 'lucide-react';
import PortalHeader from '@/components/portal-header';
import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';
import type { Auth } from '@/types/auth';

/**
 * H §16 — لوحة أدمن تيمات، وفصل الأدوار: `platform_admin` (كل شيء عدا
 * الاعتماد المالي) · `finance_admin` (الاعتمادات المالية) · `support_agent`
 * (قراءة وتدخل محدود).
 *
 * A15 fix: every `permission` below is a real string from
 * `App\Enums\Role::permissions()`, and matches the middleware on the route it
 * links to. The previous list used a pre-A3 vocabulary
 * (`manage_companies`, `manage_categories`, `manage_notifications`,
 * `manage_admins`, `view_revenue`, …) that exists nowhere in the backend, so
 * those entries rendered **for nobody** — Companies, Partners, Employees,
 * Communities, Categories, Events, Revenue, Support and Admins were all
 * silently hidden from a platform admin even though the routes worked.
 */
const allNavItems: (NavItem & { permission?: string })[] = [
    { label: 'لوحة التحكم', href: '/admin/dash', icon: Activity },

    // الشركات والعقود · المزوّدون · الفعاليات (H §16)
    { label: 'الشركات والعقود', href: '/admin/companies', icon: Building2, permission: 'platform.manage' },
    { label: 'المزوّدون', href: '/admin/partners', icon: Users, permission: 'platform.manage' },
    { label: 'إشراف المزوّدين', href: '/admin/providers/oversight', icon: Compass, permission: 'platform.manage' },
    { label: 'الموظفون', href: '/admin/employees', icon: UserRound, permission: 'platform.manage' },
    { label: 'المجتمعات', href: '/admin/communities', icon: UsersRound, permission: 'platform.manage' },
    { label: 'الفعاليات', href: '/admin/events', icon: Calendar, permission: 'platform.manage' },
    { label: 'مراقبة الفعاليات الشبح', href: '/admin/monitoring/ghost-events', icon: Ghost, permission: 'platform.manage' },
    // A13's coordinator report lives outside /admin on purpose (its own group,
    // no platform permissions). H §15 gives أدمن تيمات a copy, so the link is
    // gated on `platform.manage`; the coordinator's own shell is still to come.
    { label: 'تقارير المنسّق المُدار', href: '/coordinator/reports', icon: ClipboardList, permission: 'platform.manage' },

    // المالية (H §16) — الأدمن المالي
    { label: 'الإيرادات', href: '/admin/revenue', icon: TrendingUp, permission: 'revenue.view' },
    { label: 'اعتماد التحويلات', href: '/admin/finance/topups', icon: Landmark, permission: 'wallet.topup.approve' },
    { label: 'فشل المدفوعات', href: '/admin/payments/failures', icon: AlertTriangle, permission: 'payments.failures.view' },
    { label: 'التسويات', href: '/admin/finance/settlements', icon: Scale, permission: 'settlement.approve' },
    { label: 'الفواتير', href: '/admin/finance/invoices', icon: Receipt, permission: 'invoice.approve' },
    { label: 'شروط العقود', href: '/admin/finance/terms', icon: Ruler, permission: 'invoice.approve' },
    { label: 'الصفة الضريبية', href: '/admin/finance/tax-status', icon: FileSpreadsheet, permission: 'invoice.approve' },

    // الدعم وسجل التدقيق (H §16 + §19)
    { label: 'مركز الدعم', href: '/admin/support-console', icon: Headphones, permission: 'support.search' },
    { label: 'رسائل الدعم', href: '/admin/support', icon: MessageSquare, permission: 'support.messages.manage' },
    { label: 'سجل التدقيق', href: '/admin/audit', icon: ShieldCheck, permission: 'audit.view' },
    { label: 'الأحداث الأمنية', href: '/admin/security/events', icon: Shield, permission: 'security.events.view' },
    { label: 'مراجعة الصلاحيات', href: '/admin/security/permission-review', icon: SearchCheck, permission: 'admins.manage' },
    { label: 'سجل الإشعارات', href: '/admin/notification-logs', icon: ScrollText, permission: 'notifications.logs.view' },

    // الإعدادات (H §16)
    { label: 'الفئات والأنشطة', href: '/admin/categories', icon: Tags, permission: 'catalog.manage' },
    { label: 'أيام التعطيل', href: '/admin/blackouts', icon: CalendarOff, permission: 'platform.manage' },
    { label: 'إعدادات المنصة', href: '/admin/settings/platform', icon: Settings, permission: 'platform.manage' },
    { label: 'قوالب الإشعارات', href: '/admin/notification-templates', icon: FileText, permission: 'platform.manage' },
    { label: 'الإشعارات', href: '/admin/notifs', icon: Bell, permission: 'platform.manage' },
    { label: 'التنبيهات الحرجة', href: '/admin/alerts', icon: Siren, permission: 'platform.manage' },
    { label: 'المشرفون', href: '/admin/admins', icon: KeyRound, permission: 'admins.manage' },

    { label: 'الملف الشخصي', href: '/admin/profile', icon: CircleUser },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const permissions = auth.permissions ?? [];

    const navItems: NavItem[] = allNavItems
        .filter((item) => !item.permission || permissions.includes(item.permission))
        .map(({ permission: _, ...rest }) => rest);

    const roleLabel = auth.role_label ?? 'مشرف';

    return (
        <div
            className="min-h-screen bg-[#F6F8F5] text-[#0A0A0A] font-arabic antialiased selection:bg-[#C8FF00] selection:text-[#0A0A0A] flex flex-col"
            dir="rtl"
        >
            <PortalHeader
                userLabel={auth.user?.name ?? 'مشرف النظام'}
                userSub={roleLabel}
                userAvatar={(auth.user?.name ?? 'م').charAt(0)}
                notificationsUrl="/admin/notifs"
            />

            {/* The prototype caps the body at max-w-7xl while the header spans full width. */}
            <div className="flex-1 flex max-w-7xl mx-auto w-full">
                <PortalSidebar
                    portalTag="ADMIN"
                    userLabel={auth.user?.name ?? 'مشرف النظام'}
                    userSub={roleLabel}
                    navItems={navItems}
                    logoutUrl="/admin/logout"
                    infoStyle="admin"
                    brandInHeader
                />
                {/*
                    The prototype's gutter: <main class="flex-1 p-0 sm:p-4 lg:p-6
                    flex justify-center pb-8"> around a max-w-6xl column. Without
                    it the page content sits flush against the rail's border.
                */}
                <main className="flex-1 min-w-0 p-0 sm:p-4 lg:p-6 pb-8 flex justify-center">
                    <div className="w-full max-w-6xl min-w-0 p-4 sm:p-8">{children}</div>
                </main>
            </div>
        </div>
    );
}

/** Exported for the nav-correctness test (Pest reads this file's source). */
export { allNavItems };
