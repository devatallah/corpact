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
    /**
     * A15 — H §4/§18: «مبدّل سياق صريح للشركة». A3 shipped the endpoints and
     * the shared `auth.memberships` prop; when a portal passes a switch URL
     * the picker renders here. Omit it and the sidebar is unchanged.
     */
    contextSwitchUrl?: string;
}

/** One company a multi-company account can act inside (`auth.memberships`). */
interface MembershipOption {
    id: number;
    name: string;
    active?: boolean;
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
    contextSwitchUrl,
}: PortalSidebarProps) {
    // Fall back gracefully when rendered outside an Inertia app (tests, design previews).
    let url = '/';
    let memberships: MembershipOption[] = [];
    try {
        const page = usePage();
        url = page.url;
        memberships = ((page.props as Record<string, unknown>).auth as { memberships?: MembershipOption[] } | undefined)?.memberships ?? [];
    } catch {
        /* no Inertia context */
    }
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // The picker only earns its space when the account really has more than
    // one company to be in.
    const showContextSwitcher = Boolean(contextSwitchUrl) && memberships.length > 1;
    const activeMembership = memberships.find((membership) => membership.active);

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
                    <div className="ar">تيمات</div>
                    <div className="en">TEAMAT</div>
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

                {showContextSwitcher && (
                    <div style={{ padding: '10px 14px 4px' }}>
                        <label
                            htmlFor="portal-context-switcher"
                            style={{ display: 'block', fontSize: 10, color: '#6B7A99', marginBottom: 4 }}
                        >
                            الشركة الحالية
                        </label>
                        <select
                            id="portal-context-switcher"
                            value={activeMembership?.id ?? ''}
                            onChange={(e) => {
                                const contextId = Number(e.target.value);
                                if (contextId && contextId !== activeMembership?.id) {
                                    router.post(contextSwitchUrl as string, { context_id: contextId });
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontFamily: 'inherit',
                                background: 'rgba(255,255,255,.06)',
                                color: 'inherit',
                                border: '1px solid rgba(255,255,255,.14)',
                                direction: 'rtl',
                            }}
                        >
                            {memberships.map((membership) => (
                                <option key={membership.id} value={membership.id}>
                                    {membership.name}
                                </option>
                            ))}
                        </select>
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
