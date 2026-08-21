import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';
import type { Auth } from '@/types/auth';
import { usePage } from '@inertiajs/react';

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
    { label: 'لوحة التحكم', href: '/admin/dash', emoji: '📊' },

    // الشركات والعقود · المزوّدون · الفعاليات (H §16)
    { label: 'الشركات والعقود', href: '/admin/companies', emoji: '🏢', permission: 'platform.manage' },
    { label: 'المزوّدون', href: '/admin/partners', emoji: '🏟️', permission: 'platform.manage' },
    { label: 'إشراف المزوّدين', href: '/admin/providers/oversight', emoji: '🧭', permission: 'platform.manage' },
    { label: 'الموظفون', href: '/admin/employees', emoji: '👥', permission: 'platform.manage' },
    { label: 'المجتمعات', href: '/admin/communities', emoji: '👫', permission: 'platform.manage' },
    { label: 'الفعاليات', href: '/admin/events', emoji: '📅', permission: 'platform.manage' },
    { label: 'مراقبة الفعاليات الشبح', href: '/admin/monitoring/ghost-events', emoji: '👻', permission: 'platform.manage' },
    // A13's coordinator report lives outside /admin on purpose (its own group,
    // no platform permissions). H §15 gives أدمن تيمات a copy, so the link is
    // gated on `platform.manage`; the coordinator's own shell is still to come.
    { label: 'تقارير المنسّق المُدار', href: '/coordinator/reports', emoji: '🗒️', permission: 'platform.manage' },

    // المالية (H §16) — الأدمن المالي
    { label: 'الإيرادات', href: '/admin/revenue', emoji: '💰', permission: 'revenue.view' },
    { label: 'اعتماد التحويلات', href: '/admin/finance/topups', emoji: '🏦', permission: 'wallet.topup.approve' },
    { label: 'فشل المدفوعات', href: '/admin/payments/failures', emoji: '⚠️', permission: 'payments.failures.view' },
    { label: 'التسويات', href: '/admin/finance/settlements', emoji: '📑', permission: 'settlement.approve' },
    { label: 'الفواتير', href: '/admin/finance/invoices', emoji: '🧾', permission: 'invoice.approve' },
    { label: 'شروط العقود', href: '/admin/finance/terms', emoji: '📐', permission: 'invoice.approve' },

    // الدعم وسجل التدقيق (H §16 + §19)
    { label: 'مركز الدعم', href: '/admin/support-console', emoji: '🎧', permission: 'support.search' },
    { label: 'رسائل الدعم', href: '/admin/support', emoji: '💬', permission: 'support.messages.manage' },
    { label: 'سجل التدقيق', href: '/admin/audit', emoji: '🧾', permission: 'audit.view' },
    { label: 'الأحداث الأمنية', href: '/admin/security/events', emoji: '🛡️', permission: 'security.events.view' },
    { label: 'مراجعة الصلاحيات', href: '/admin/security/permission-review', emoji: '🔍', permission: 'admins.manage' },
    { label: 'سجل الإشعارات', href: '/admin/notification-logs', emoji: '📜', permission: 'notifications.logs.view' },

    // الإعدادات (H §16)
    { label: 'الفئات والأنشطة', href: '/admin/categories', emoji: '⚽', permission: 'catalog.manage' },
    { label: 'أيام التعطيل', href: '/admin/blackouts', emoji: '🚫', permission: 'platform.manage' },
    { label: 'إعدادات المنصة', href: '/admin/settings/platform', emoji: '🎚️', permission: 'platform.manage' },
    { label: 'قوالب الإشعارات', href: '/admin/notification-templates', emoji: '📝', permission: 'platform.manage' },
    { label: 'الإشعارات', href: '/admin/notifs', emoji: '🔔', permission: 'platform.manage' },
    { label: 'التنبيهات الحرجة', href: '/admin/alerts', emoji: '🚨', permission: 'platform.manage' },
    { label: 'المشرفون', href: '/admin/admins', emoji: '🛡️', permission: 'admins.manage' },

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
            <div className="main">{children}</div>
        </div>
    );
}

/** Exported for the nav-correctness test (Pest reads this file's source). */
export { allNavItems };
