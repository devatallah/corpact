import { usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Bell,
    Building2,
    Calendar,
    CalendarOff,
    CircleUser,
    ClipboardList,
    Compass,
    FileSpreadsheet,
    FileText,
    Ghost,
    Headphones,
    KeyRound,
    Landmark,
    MessageSquare,
    Receipt,
    Ruler,
    Scale,
    ScrollText,
    SearchCheck,
    Settings,
    Shield,
    ShieldCheck,
    Siren,
    Tags,
    TrendingUp,
    UserRound,
    Users,
    UsersRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { NavItem } from '@/components/portal-sidebar';
import PortalShell from '@/layouts/portal-shell';
import type { SharedProps } from '@/types';

/**
 * H §16 — لوحة أدمن تيمات، وفصل الأدوار: `platform_admin` (كل شيء عدا
 * الاعتماد المالي) · `finance_admin` (الاعتمادات المالية) · `support_agent`
 * (قراءة وتدخل محدود).
 *
 * Every `permission` below is a real string from `App\Enums\Role::permissions()`
 * and matches the middleware on the route it links to — a nav gated on a
 * permission the backend never grants renders for nobody, which is exactly
 * how the pre-A3 vocabulary hid nine working screens.
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

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<SharedProps>().props;
    const permissions = auth.permissions ?? [];

    const navItems: NavItem[] = allNavItems
        .filter((item) => !item.permission || permissions.includes(item.permission))
        .map((item): NavItem => ({ label: item.label, href: item.href, icon: item.icon, badge: item.badge }));

    return (
        <PortalShell
            navItems={navItems}
            logoutUrl="/admin/logout"
            userLabel={auth.user?.name ?? 'مشرف النظام'}
            userSub={auth.role_label ?? 'مشرف'}
            notificationsUrl="/admin/notifs"
        >
            {children}
        </PortalShell>
    );
}

/** Exported for the nav-correctness test (Pest reads this file's source). */
export { allNavItems };
