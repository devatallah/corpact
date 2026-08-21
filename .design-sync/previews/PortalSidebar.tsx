import { PortalSidebar } from 'teamat-ui';

// PortalSidebar renders the full تيمات portal sidebar; it is themed by the
// enclosing portal class (.portal-admin dark / .portal-company light), exactly
// as admin-layout.tsx and company-layout.tsx compose it. The first nav item
// uses href "/" so the active state shows outside Inertia (url falls back to "/").
// Preview-only CSS: the 420px capture viewport is below the app's 768px mobile
// breakpoint (which moves the sidebar off-canvas), so we pin the desktop
// (sticky, in-flow) presentation and hide the mobile hamburger; we also cap
// the in-app 100vh height to the demo frame.
const fitStyle = [
    '.ds-portal-fit .sidebar{position:sticky;top:0;height:100%;min-height:0;right:auto;box-shadow:none;transition:none;}',
    '.ds-portal-fit .menu-toggle{display:none !important;}',
].join('\n');

export const AdminPortal = () => (
    <div
        className="portal-admin ds-portal-fit"
        dir="rtl"
        style={{ minHeight: 0, height: 680, display: 'flex', flexDirection: 'row' }}
    >
        <style>{fitStyle}</style>
        <PortalSidebar
            portalTag="ADMIN"
            userLabel="مشرف النظام"
            userSub="مدير عام"
            userAvatar="م"
            userAvatarStyle={{ background: 'linear-gradient(135deg,#E03050,#B8001A)' }}
            navItems={[
                { label: 'لوحة التحكم', href: '/', emoji: '📊' },
                { label: 'الشركات', href: '/admin/companies', emoji: '🏢' },
                { label: 'الأعمال', href: '/admin/businesses', emoji: '🏟️' },
                { label: 'الموظفون', href: '/admin/employees', emoji: '👥' },
                { label: 'الفئات', href: '/admin/categories', emoji: '⚽' },
                { label: 'الفعاليات', href: '/admin/events', emoji: '📅' },
                { label: 'الإيرادات', href: '/admin/revenue', emoji: '💰' },
                { label: 'الإشعارات', href: '/admin/notifs', emoji: '🔔', badge: 3 },
                { label: 'الملف الشخصي', href: '/admin/profile', emoji: '👤' },
            ]}
            logoutUrl="#"
            infoStyle="admin"
        />
        <div
            className="main"
            style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
        >
            <div className="page-title" style={{ fontSize: 15, fontWeight: 800 }}>
                لوحة التحكم
            </div>
            <div
                style={{
                    height: 72,
                    borderRadius: 14,
                    background: '#161B27',
                    border: '1px solid #232A3E',
                }}
            />
            <div
                style={{
                    height: 72,
                    borderRadius: 14,
                    background: '#161B27',
                    border: '1px solid #232A3E',
                }}
            />
            <div
                style={{
                    flex: 1,
                    borderRadius: 14,
                    background: '#161B27',
                    border: '1px solid #232A3E',
                }}
            />
        </div>
    </div>
);

export const CompanyPortal = () => (
    <div
        className="portal-company ds-portal-fit"
        dir="rtl"
        style={{ minHeight: 0, height: 680, display: 'flex', flexDirection: 'row' }}
    >
        <style>{fitStyle}</style>
        <PortalSidebar
            portalTag="COMPANY"
            userLabel="شركة الاتحاد للتقنية"
            userSub="أحمد العتيبي"
            navItems={[
                { label: 'لوحة التحكم', href: '/', emoji: '📊' },
                { label: 'الأقسام', href: '/company/departments', emoji: '🏷️' },
                { label: 'الموظفون', href: '/company/employees', emoji: '👥' },
                { label: 'المجتمعات', href: '/company/communities', emoji: '🏘️' },
                { label: 'طلبات المجتمعات', href: '/company/community-requests', emoji: '📋', badge: 2 },
                { label: 'الفعاليات', href: '/company/events', emoji: '📅' },
                { label: 'البطولات', href: '/company/leagues', emoji: '🏆' },
                { label: 'المحفظة', href: '/company/wallet', emoji: '💳' },
                { label: 'الإشعارات', href: '/company/notifications', emoji: '🔔', badge: 5 },
            ]}
            logoutUrl="#"
            infoStyle="company"
        />
        <div
            className="main"
            style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
        >
            <div className="page-title" style={{ fontSize: 15, fontWeight: 800 }}>
                لوحة التحكم
            </div>
            <div
                style={{
                    height: 72,
                    borderRadius: 14,
                    background: '#ffffff',
                    border: '1px solid #E2E6F0',
                }}
            />
            <div
                style={{
                    height: 72,
                    borderRadius: 14,
                    background: '#ffffff',
                    border: '1px solid #E2E6F0',
                }}
            />
            <div
                style={{
                    flex: 1,
                    borderRadius: 14,
                    background: '#ffffff',
                    border: '1px solid #E2E6F0',
                }}
            />
        </div>
    </div>
);
