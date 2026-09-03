import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRightLeft, ChevronDown, LogOut, Menu, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { Membership } from '@/types/auth';

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: number;
}

/**
 * The portal rail, from the prototype: a white 256px column with a hairline
 * on its content edge, «القائمة الرئيسية» over a stack of pill rows, and the
 * entity switcher plus sign-out pinned to the bottom.
 */
export default function PortalSidebar({
    navItems,
    logoutUrl,
    contextSwitchUrl,
}: {
    navItems: NavItem[];
    logoutUrl: string;
    /**
     * H §4/§18 — «مبدّل سياق صريح للشركة». When a portal passes a switch URL
     * and the account holds more than one membership, the picker renders.
     */
    contextSwitchUrl?: string;
}) {
    // Fall back gracefully when rendered outside an Inertia app (tests, design previews).
    let url = '/';
    let memberships: Membership[] = [];

    try {
        const page = usePage();
        url = page.url;
        memberships = ((page.props as Record<string, unknown>).auth as { memberships?: Membership[] } | undefined)?.memberships ?? [];
    } catch {
        /* no Inertia context */
    }

    const [mobileOpen, setMobileOpen] = useState(false);
    const [switcherOpen, setSwitcherOpen] = useState(false);

    const showContextSwitcher = Boolean(contextSwitchUrl) && memberships.length > 1;

    function isActive(href: string) {
        // Compare whole path segments, not raw prefixes: `/admin/support` is a
        // string prefix of `/admin/support-console`, so a startsWith() test lit
        // both rows at once. A child route (`/admin/companies/3/edit`) should
        // still mark its parent, hence the trailing-slash case.
        const path = url.split('?')[0].replace(/\/+$/, '') || '/';
        const target = href.replace(/\/+$/, '') || '/';

        return path === target || path.startsWith(`${target}/`);
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="فتح القائمة"
                className="fixed bottom-4 start-4 z-50 lg:hidden p-3 rounded-full bg-ink text-lime shadow-lg cursor-pointer"
            >
                <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            <div
                onClick={() => setMobileOpen(false)}
                className={`fixed inset-0 z-40 bg-ink/60 lg:hidden ${mobileOpen ? 'block' : 'hidden'}`}
            />

            <aside
                aria-label="القائمة الرئيسية"
                className={`w-64 bg-surface border-e-[0.5px] border-ink/10 p-5 flex flex-col justify-between shrink-0
                    max-lg:fixed max-lg:inset-y-0 max-lg:end-0 max-lg:z-50 max-lg:overflow-y-auto max-lg:transition-transform
                    ${mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:translate-x-full lg:translate-x-0'}`}
            >
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-3 px-2">
                            <span className="text-[11px] font-extrabold text-ink/40 uppercase tracking-wider">القائمة الرئيسية</span>
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                aria-label="إغلاق القائمة"
                                className="lg:hidden p-1 rounded-lg text-ink/50 hover:bg-ink/5 cursor-pointer"
                            >
                                <X className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const active = isActive(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        aria-current={active ? 'page' : undefined}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-colors ${
                                            active ? 'bg-ink text-lime' : 'text-ink/80 hover:bg-ink/5 hover:text-ink'
                                        }`}
                                    >
                                        <span className={`shrink-0 ${active ? 'text-lime' : 'text-ink/70'}`}>
                                            <item.icon className="w-4 h-4" aria-hidden="true" />
                                        </span>
                                        <span className="flex-1 truncate">{item.label}</span>
                                        {item.badge !== undefined && item.badge > 0 && (
                                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-lime text-ink">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div className="pt-4 border-t-[0.5px] border-ink/10 space-y-3">
                    {showContextSwitcher && (
                        <>
                            <button
                                type="button"
                                onClick={() => setSwitcherOpen((prev) => !prev)}
                                aria-expanded={switcherOpen}
                                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-ink/5 hover:bg-ink/10 text-xs font-bold text-ink transition-colors cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <ArrowRightLeft className="w-3.5 h-3.5 text-ink" aria-hidden="true" />
                                    <span>تبديل المنشأة</span>
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-ink/50" aria-hidden="true" />
                            </button>

                            {switcherOpen && (
                                <div className="rounded-xl border-[0.5px] border-ink/10 overflow-hidden">
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
                                                membership.active ? 'bg-ink text-lime' : 'text-ink/80 hover:bg-ink/5'
                                            }`}
                                        >
                                            {membership.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => router.post(logoutUrl)}
                        className="w-full flex items-center gap-2 p-2 text-xs font-bold text-danger hover:bg-danger-tint rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
