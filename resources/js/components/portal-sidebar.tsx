import { Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export interface NavItem {
    label: string;
    href: string;
    emoji: string;
    badge?: number;
    badgeClass?: string;
}

interface PortalSidebarProps {
    portalTag: string;
    tagClass?: string;
    userLabel: string;
    userSub?: string;
    userAvatar?: string;
    userAvatarStyle?: React.CSSProperties;
    navItems: NavItem[];
    logoutUrl: string;
    /** 'admin-info' style (avatar + name row) or 'co-info' style (label/name/sub stacked) */
    infoStyle?: 'admin' | 'company';
}

export default function PortalSidebar({
    portalTag,
    tagClass,
    userLabel,
    userSub,
    userAvatar,
    userAvatarStyle,
    navItems,
    logoutUrl,
    infoStyle = 'admin',
}: PortalSidebarProps) {
    const { url } = usePage();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    function isActive(href: string) {
        return url.startsWith(href);
    }

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [url]);

    return (
        <>
            {/* Mobile hamburger */}
            <button className="menu-toggle" onClick={() => setMobileOpen(true)}>☰</button>

            {/* Mobile backdrop */}
            <div
                className={`sidebar-backdrop${mobileOpen ? ' open' : ''}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar */}
            <div className={`sidebar${collapsed ? ' small' : ''}${mobileOpen ? ' open' : ''}`}>
                <div className="logo">
                    <div className="ar">كورباكت</div>
                    <div className="en">CORPACT</div>
                    <div className={`tag${tagClass ? ' ' + tagClass : ''}`}>{portalTag}</div>
                </div>

                {infoStyle === 'admin' ? (
                    <div className="admin-info">
                        <div className="admin-avatar" style={userAvatarStyle}>
                            {userAvatar ?? userLabel.charAt(0)}
                        </div>
                        <div>
                            <div className="admin-name">{userLabel}</div>
                            {userSub && <div className="admin-role">{userSub}</div>}
                        </div>
                    </div>
                ) : (
                    <div className="co-info">
                        <div className="lbl">مرحباً</div>
                        <div className="nm">{userLabel}</div>
                        {userSub && <div className="sb">{userSub}</div>}
                    </div>
                )}

                <nav className="portal-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`ni${isActive(item.href) ? ' on' : ''}`}
                        >
                            <span>{item.emoji}</span>
                            <span className="nl">{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className={`nb${item.badgeClass ? ' ' + item.badgeClass : ''}`}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <button className="logout-btn" onClick={() => router.post(logoutUrl)}>
                    <span>🚪</span>
                    <span className="nl">تسجيل الخروج</span>
                </button>

            </div>
        </>
    );
}
