import { Link, router, usePage } from '@inertiajs/react';

const navLinks = [
    { label: 'لوحة التحكم', href: '/company/dash' },
    { label: 'الموظفون', href: '/company/employees' },
    { label: 'المجتمعات', href: '/company/communities' },
    { label: 'الفعاليات', href: '/company/events' },
    { label: 'المحفظة', href: '/company/wallet' },
    { label: 'التقارير', href: '/company/reports' },
];

const moreLinks = [
    { label: 'الأقسام', href: '/company/departments' },
    { label: 'البطولات', href: '/company/leagues' },
    { label: 'طلبات المجتمعات', href: '/company/community-requests' },
];

const mobTabs = [
    { label: 'الرئيسية', href: '/company/dash', emoji: '📊' },
    { label: 'الموظفون', href: '/company/employees', emoji: '👥' },
    { label: 'المجتمعات', href: '/company/communities', emoji: '🏘️' },
    { label: 'الفعاليات', href: '/company/events', emoji: '📅' },
    { label: 'المزيد', href: '#more', emoji: '⋯' },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
    const { url, props } = usePage();
    const auth = (props as Record<string, unknown>).auth as { user?: { name?: string } } | undefined;
    const company = (props as Record<string, unknown>).company as { name?: string } | undefined;
    const name = company?.name ?? auth?.user?.name ?? 'الشركة';
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);
    const unread = (props as Record<string, unknown>).unreadNotifications as number | undefined;

    function isActive(href: string) {
        if (href === '/company/dash') return url === '/company/dash';
        return url.startsWith(href);
    }

    return (
        <div className="portal-company" dir="rtl">
            <nav className="topnav">
                <div className="topnav-inner">
                    <div className="topnav-right">
                        <Link href="/company/dash" className="topnav-logo">تيمات</Link>
                        <div className="topnav-links">
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} className={`topnav-link${isActive(link.href) ? ' on' : ''}`}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="topnav-left">
                        <Link href="/company/notifications" className="topnav-bell">
                            🔔
                            {(unread ?? 0) > 0 && <span className="dot" />}
                        </Link>
                        <Link href="/company/profile" className="topnav-avatar">{initials}</Link>
                        <button
                            className="hamburger"
                            onClick={() => {
                                const el = document.getElementById('co-mob-menu');
                                if (el) el.style.display = el.style.display === 'block' ? 'none' : 'block';
                            }}
                        >☰</button>
                    </div>
                </div>
                <div id="co-mob-menu" style={{ display: 'none', padding: '8px 24px 16px', borderTop: '1px solid #EBEBEB' }}>
                    {[...navLinks, ...moreLinks].map((link) => (
                        <Link key={link.href} href={link.href} style={{ display: 'block', padding: '10px 0', fontSize: 14, fontWeight: isActive(link.href) ? 600 : 400, color: isActive(link.href) ? '#0A0A0A' : '#666', textDecoration: 'none', borderBottom: '1px solid #F5F5F5' }}>
                            {link.label}
                        </Link>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <Link href="/company/profile" style={{ flex: 1, textAlign: 'center', padding: 8, borderRadius: 8, background: '#F5F5F5', fontSize: 13, fontWeight: 500, color: '#0A0A0A', textDecoration: 'none' }}>الملف الشخصي</Link>
                        <button onClick={() => router.post('/company/logout')} style={{ flex: 1, padding: 8, borderRadius: 8, background: '#FEF2F2', fontSize: 13, fontWeight: 500, color: '#EF4444', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>تسجيل خروج</button>
                    </div>
                </div>
            </nav>

            <div className="main">{children}</div>

            <div className="mob-nav">
                <div className="mob-nav-inner">
                    {mobTabs.map((tab) => (
                        <Link key={tab.href} href={tab.href === '#more' ? '/company/wallet' : tab.href} className={`mob-link${isActive(tab.href) ? ' on' : ''}`}>
                            <span className="ico">{tab.emoji}</span>
                            <span>{tab.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
