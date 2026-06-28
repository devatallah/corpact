import { Link, router, usePage } from '@inertiajs/react';
import '../../css/main.css';
import '../../css/employee.css';

const navLinks = [
    { label: 'الرئيسية', href: '/employee/home' },
    { label: 'استكشاف', href: '/employee/explore' },
    { label: 'مجتمعاتي', href: '/employee/community' },
    { label: 'تقاريري', href: '/employee/reports' },
];

const mobTabs = [
    { label: 'الرئيسية', href: '/employee/home', emoji: '🏠' },
    { label: 'استكشاف', href: '/employee/explore', emoji: '🧭' },
    { label: 'جديد', href: '/employee/create', emoji: '➕', special: true },
    { label: 'مجتمعي', href: '/employee/community', emoji: '👥' },
    { label: 'تقاريري', href: '/employee/reports', emoji: '📊' },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const { url, props } = usePage();
    const auth = (props as Record<string, unknown>).auth as { user?: { name?: string } } | undefined;
    const employee = (props as Record<string, unknown>).employee as { name?: string } | undefined;
    const name = employee?.name ?? auth?.user?.name ?? '';
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);
    const unread = (props as Record<string, unknown>).unreadNotifications as number | undefined;

    function isActive(href: string) {
        return url.startsWith(href);
    }

    return (
        <div className="portal-employee" dir="rtl">
            {/* Desktop Top Nav */}
            <nav className="topnav">
                <div className="topnav-inner">
                    <div className="topnav-right">
                        <Link href="/employee/home" className="topnav-logo" style={{ textDecoration: 'none', color: '#0A0A0A' }}>
                            تيمات
                        </Link>
                        <div className="topnav-links">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`topnav-link${isActive(link.href) ? ' on' : ''}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="topnav-left">
                        <Link href="/employee/create" className="topnav-new">
                            ➕ فعالية جديدة
                        </Link>
                        <Link href="/employee/notifications" className="topnav-bell">
                            🔔
                            {(unread ?? 0) > 0 && <span className="dot" />}
                        </Link>
                        <Link href="/employee/profile" className="topnav-avatar">
                            {initials}
                        </Link>
                        <button
                            className="hamburger"
                            onClick={() => {
                                const el = document.getElementById('mob-menu');
                                if (el) el.style.display = el.style.display === 'block' ? 'none' : 'block';
                            }}
                        >
                            ☰
                        </button>
                    </div>
                </div>
                {/* Mobile dropdown menu */}
                <div id="mob-menu" style={{ display: 'none', padding: '8px 24px 16px', borderTop: '1px solid #EBEBEB' }}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            style={{
                                display: 'block',
                                padding: '10px 0',
                                fontSize: 14,
                                fontWeight: isActive(link.href) ? 600 : 400,
                                color: isActive(link.href) ? '#0A0A0A' : '#666',
                                textDecoration: 'none',
                                borderBottom: '1px solid #F5F5F5',
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <Link href="/employee/profile" style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: 8, background: '#F5F5F5', fontSize: 13, fontWeight: 500, color: '#0A0A0A', textDecoration: 'none' }}>
                            الملف الشخصي
                        </Link>
                        <button onClick={() => router.post('/employee/logout')} style={{ flex: 1, padding: '8px', borderRadius: 8, background: '#FEF2F2', fontSize: 13, fontWeight: 500, color: '#EF4444', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                            تسجيل خروج
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="emain">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <div className="mob-nav">
                <div className="mob-nav-inner">
                    {mobTabs.map((tab) => (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`mob-link${isActive(tab.href) ? ' on' : ''}`}
                        >
                            {tab.special ? (
                                <div className="mob-new">{tab.emoji}</div>
                            ) : (
                                <span className="ico">{tab.emoji}</span>
                            )}
                            <span>{tab.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
