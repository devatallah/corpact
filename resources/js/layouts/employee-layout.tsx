import { Link, router, usePage } from '@inertiajs/react';

const navTabs = [
    { label: 'الرئيسية', href: '/employee/home', emoji: '🏠' },
    { label: 'استكشاف', href: '/employee/explore', emoji: '🧭' },
    { label: 'جديد', href: '/employee/create', emoji: '➕', special: true },
    { label: 'مجتمعي', href: '/employee/community', emoji: '👥' },
    { label: 'حسابي', href: '/employee/profile', emoji: '👤' },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const { url } = usePage();

    function isActive(href: string) {
        return url.startsWith(href);
    }

    return (
        <div className="portal-employee" dir="rtl">
            <div className="phone">
                {/* Top bar */}
                <div className="topbar">
                    <button
                        onClick={() => router.post('/employee/logout')}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: '#7A8BA8' }}
                    >
                        🚪
                    </button>
                    <div style={{ marginRight: 'auto', textAlign: 'left' }}>
                        <div className="logo-ar">تيمات</div>
                        <div className="logo-en">TEAMAT</div>
                    </div>
                </div>

                {/* Content */}
                <div className="content">
                    {children}
                </div>

                {/* Bottom nav */}
                <div className="bottom-nav">
                    {navTabs.map((tab) => (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`nb${isActive(tab.href) ? ' on' : ''}`}
                        >
                            {tab.special ? (
                                <div className="nb-special">{tab.emoji}</div>
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
