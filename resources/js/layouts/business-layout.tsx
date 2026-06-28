import { Link, router, usePage } from '@inertiajs/react';
import type { Auth } from '@/types/auth';

const allNavLinks = [
    { label: 'لوحة التحكم', href: '/business/dash', permission: 'dashboard.view' },
    { label: 'طلبات الحجز', href: '/business/requests', permission: 'bookings.view' },
    { label: 'الجدول', href: '/business/schedule', permission: 'schedule.view' },
    { label: 'المرافق', href: '/business/venues', permission: 'venues.view' },
    { label: 'التسويات', href: '/business/settlements', permission: 'settlements.view' },
    { label: 'التقارير', href: '/business/reports', permission: 'reports.view' },
];

const moreLinks = [
    { label: 'الخصومات', href: '/business/discounts', permission: 'discounts.view' },
    { label: 'الموظفون', href: '/business/staff', permission: 'staff.view' },
];

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
    const { url, props } = usePage<{ auth: Auth }>();
    const { auth } = props;
    const permissions = (auth.businessPermissions ?? auth.permissions ?? []) as string[];
    const user = auth.user as { name?: string } | undefined;
    const name = user?.name ?? 'المنشأة';
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);

    function can(permission: string) {
        return permissions.includes(permission);
    }

    function isActive(href: string) {
        if (href === '/business/dash') return url === '/business/dash';
        return url.startsWith(href);
    }

    const visibleNavLinks = allNavLinks.filter(l => can(l.permission));
    const visibleMoreLinks = moreLinks.filter(l => can(l.permission));

    const mobTabs = [
        { label: 'الرئيسية', href: '/business/dash', emoji: '📊', permission: 'dashboard.view' },
        { label: 'الحجوزات', href: '/business/requests', emoji: '📋', permission: 'bookings.view' },
        { label: 'المرافق', href: '/business/venues', emoji: '🏟️', permission: 'venues.view' },
        { label: 'التسويات', href: '/business/settlements', emoji: '💰', permission: 'settlements.view' },
        { label: 'المزيد', href: '/business/profile', emoji: '⋯', permission: 'profile.view' },
    ].filter(t => can(t.permission));

    return (
        <div className="portal-business" dir="rtl">
            <nav className="topnav">
                <div className="topnav-inner">
                    <div className="topnav-right">
                        <Link href="/business/dash" className="topnav-logo">تيمات</Link>
                        <div className="topnav-links">
                            {visibleNavLinks.map((link) => (
                                <Link key={link.href} href={link.href} className={`topnav-link${isActive(link.href) ? ' on' : ''}`}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="topnav-left">
                        <Link href="/business/profile" className="topnav-avatar">{initials}</Link>
                        <button
                            className="hamburger"
                            onClick={() => {
                                const el = document.getElementById('biz-mob-menu');
                                if (el) el.style.display = el.style.display === 'block' ? 'none' : 'block';
                            }}
                        >☰</button>
                    </div>
                </div>
                <div id="biz-mob-menu" style={{ display: 'none', padding: '8px 24px 16px', borderTop: '1px solid #EBEBEB' }}>
                    {[...visibleNavLinks, ...visibleMoreLinks].map((link) => (
                        <Link key={link.href} href={link.href} style={{ display: 'block', padding: '10px 0', fontSize: 14, fontWeight: isActive(link.href) ? 600 : 400, color: isActive(link.href) ? '#0A0A0A' : '#666', textDecoration: 'none', borderBottom: '1px solid #F5F5F5' }}>
                            {link.label}
                        </Link>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <Link href="/business/profile" style={{ flex: 1, textAlign: 'center', padding: 8, borderRadius: 8, background: '#F5F5F5', fontSize: 13, fontWeight: 500, color: '#0A0A0A', textDecoration: 'none' }}>الملف الشخصي</Link>
                        <button onClick={() => router.post('/business/logout')} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#FEF2F2', fontSize: 13, fontWeight: 500, color: '#EF4444', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>تسجيل خروج</button>
                    </div>
                </div>
            </nav>

            <div className="main">{children}</div>

            <div className="mob-nav">
                <div className="mob-nav-inner">
                    {mobTabs.map((tab) => (
                        <Link key={tab.href} href={tab.href} className={`mob-link${isActive(tab.href) ? ' on' : ''}`}>
                            <span className="ico">{tab.emoji}</span>
                            <span>{tab.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
