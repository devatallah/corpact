import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRightLeft, ChevronDown, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface NavItem {
    label: string;
    href: string;
    /**
     * The prototype's rail is lucide glyphs, not emoji. Portals still on the
     * pre-port nav pass `emoji`; whichever is supplied renders.
     */
    icon?: LucideIcon;
    emoji?: string;
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
    /**
     * Set when the portal renders `PortalHeader` above the shell. The prototype
     * puts the brand, the entity switcher and the identity up there, so the
     * rail drops all three and opens straight onto «القائمة الرئيسية».
     */
    brandInHeader?: boolean;
}

/** One company a multi-company account can act inside (`auth.memberships`). */
interface MembershipOption {
    id: number;
    /** The server sends `label` (OtpLoginService::options), never `name`. */
    label: string;
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
    brandInHeader = false,
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

    const [mobileOpen, setMobileOpen] = useState(false);
    const [switcherOpen, setSwitcherOpen] = useState(false);

    // The picker only earns its space when the account really has more than
    // one company to be in.
    const showContextSwitcher = Boolean(contextSwitchUrl) && memberships.length > 1;
    const activeMembership = memberships.find((membership) => membership.active);

    function isActive(href: string) {
        // Compare whole path segments, not raw prefixes: `/admin/support` is a
        // string prefix of `/admin/support-console`, so a startsWith() test lit
        // both rows at once. A child route (`/admin/companies/3/edit`) should
        // still mark its parent, hence the trailing-slash case.
        const path = url.split('?')[0].replace(/\/+$/, '') || '/';
        const target = href.replace(/\/+$/, '') || '/';

        return path === target || path.startsWith(`${target}/`);
    }

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [url]);

    return (
        <>
            {/* Mobile trigger */}
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="القائمة"
                className="fixed top-3 start-3 z-50 lg:hidden p-2 rounded-full bg-white border-[0.5px] border-[#0A0A0A]/10 text-[#0A0A0A] cursor-pointer"
            >
                ☰
            </button>

            {/* Mobile backdrop */}
            <div
                onClick={() => setMobileOpen(false)}
                className={`fixed inset-0 z-40 bg-[#0A0A0A]/60 lg:hidden ${mobileOpen ? 'block' : 'hidden'}`}
            />

            <aside
                className={`w-64 shrink-0 bg-white border-e-[0.5px] border-[#0A0A0A]/10 flex flex-col
                    ${brandInHeader ? 'p-5 justify-between' : ''}
                    max-lg:fixed max-lg:inset-y-0 max-lg:end-0 max-lg:z-50 max-lg:transition-transform
                    ${mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:translate-x-full lg:translate-x-0'}`}
            >
                {!brandInHeader && (
                    <>
                {/* Brand */}
                <div className="px-5 py-5 border-b-[0.5px] border-[#0A0A0A]/10">
                    <div className="flex items-center gap-2">
                        <span className="font-arabic font-extrabold tracking-tight text-2xl text-[#0A0A0A]">تيمات</span>
                        <span
                            className={`px-2 py-0.5 rounded-full bg-[#C8FF00] text-[#0A0A0A] text-[10px] font-black ${tagClass ?? ''}`}
                        >
                            {portalTag}
                        </span>
                    </div>
                    <div className="text-[9px] tracking-[2px] text-[#0A0A0A]/30 mt-1">TEAMAT</div>
                </div>

                {/* Identity */}
                {infoStyle === 'admin' ? (
                    <div className="flex items-center gap-2.5 px-5 py-4 border-b-[0.5px] border-[#0A0A0A]/10">
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                            style={userAvatarStyle ?? { background: '#0A0A0A' }}
                        >
                            {userAvatar ?? userLabel.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-[#0A0A0A] truncate">{userLabel}</div>
                            {userSub && <div className="text-[10px] text-[#0A0A0A]/50 truncate">{userSub}</div>}
                        </div>
                    </div>
                ) : (
                    <div className="px-5 py-4 border-b-[0.5px] border-[#0A0A0A]/10">
                        <div className="text-[10px] text-[#0A0A0A]/50">مرحباً</div>
                        <div className="text-xs font-bold text-[#0A0A0A] truncate">{userLabel}</div>
                        {userSub && <div className="text-[10px] text-[#0A0A0A]/50 truncate">{userSub}</div>}
                    </div>
                )}

                {showContextSwitcher && (
                    <div className="px-5 pt-3 pb-1">
                        <label
                            htmlFor="portal-context-switcher"
                            className="block text-[10px] text-[#0A0A0A]/50 mb-1"
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
                            className="w-full px-3 py-2 rounded-xl text-xs font-arabic bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 hover:border-[#0A0A0A]/30 focus-visible:ring-2 focus-visible:ring-[#C8FF00] outline-none cursor-pointer"
                        >
                            {memberships.map((membership) => (
                                <option key={membership.id} value={membership.id}>
                                    {membership.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                    </>
                )}

                <nav className={`flex-1 overflow-y-auto space-y-1 ${brandInHeader ? '' : 'px-3 py-5'}`}>
                    <span className="text-[11px] font-extrabold text-[#0A0A0A]/40 uppercase tracking-wider block mb-3 px-2">
                        القائمة الرئيسية
                    </span>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-colors ${
                                isActive(item.href)
                                    ? 'bg-[#0A0A0A] text-[#C8FF00]'
                                    : 'text-[#0A0A0A]/80 hover:bg-[#0A0A0A]/5 hover:text-[#0A0A0A]'
                            }`}
                        >
                            <span className={`shrink-0 ${isActive(item.href) ? 'text-[#C8FF00]' : 'text-[#0A0A0A]/70'}`}>
                                {item.icon ? <item.icon className="w-4 h-4" aria-hidden="true" /> : item.emoji}
                            </span>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span
                                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#C8FF00] text-[#0A0A0A] ${item.badgeClass ?? ''}`}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className={`pt-4 border-t-[0.5px] border-[#0A0A0A]/10 space-y-3 ${brandInHeader ? '' : 'm-5 mt-0'}`}>
                    {brandInHeader && showContextSwitcher && (
                        <button
                            type="button"
                            onClick={() => setSwitcherOpen((prev) => !prev)}
                            aria-expanded={switcherOpen}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A]/5 hover:bg-[#0A0A0A]/10 text-xs font-bold text-[#0A0A0A] transition-colors cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                <ArrowRightLeft className="w-3.5 h-3.5 text-[#0A0A0A]" aria-hidden="true" />
                                <span>تبديل المنشأة</span>
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-[#0A0A0A]/50" aria-hidden="true" />
                        </button>
                    )}

                    {brandInHeader && switcherOpen && (
                        <div className="rounded-xl border-[0.5px] border-[#0A0A0A]/10 overflow-hidden">
                            {memberships.map((membership) => (
                                <button
                                    key={membership.id}
                                    type="button"
                                    onClick={() => {
                                        setSwitcherOpen(false);

                                        if (!membership.active) {
                                            router.post(contextSwitchUrl as string, { context_id: membership.id });
                                        }
                                    }}
                                    className={`w-full text-start px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                                        membership.active ? 'bg-[#0A0A0A] text-[#C8FF00]' : 'text-[#0A0A0A]/80 hover:bg-[#0A0A0A]/5'
                                    }`}
                                >
                                    {membership.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => router.post(logoutUrl)}
                        className="w-full flex items-center gap-2 p-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
