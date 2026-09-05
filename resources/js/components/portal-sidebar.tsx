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
        memberships =
            (
                (page.props as Record<string, unknown>).auth as
                    | { memberships?: Membership[] }
                    | undefined
            )?.memberships ?? [];
    } catch {
        /* no Inertia context */
    }

    const [mobileOpen, setMobileOpen] = useState(false);
    const [switcherOpen, setSwitcherOpen] = useState(false);

    const showContextSwitcher =
        Boolean(contextSwitchUrl) && memberships.length > 1;

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
                className="fixed start-4 bottom-4 z-50 cursor-pointer rounded-full bg-ink p-3 text-lime shadow-lg lg:hidden"
            >
                <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div
                onClick={() => setMobileOpen(false)}
                className={`fixed inset-0 z-40 bg-ink/60 lg:hidden ${mobileOpen ? 'block' : 'hidden'}`}
            />

            <aside
                aria-label="القائمة الرئيسية"
                /*
                 * الدرج يُثبَّت على `start` لا `end`.
                 *
                 * `translate-x-full` إزاحة فيزيائية موجبة — نحو اليمين دائماً،
                 * لا تنقلب مع اتجاه الصفحة. وتثبيته على `end` يعني في RTL
                 * الحافة اليسرى، فالإخفاء كان يدفعه يميناً **إلى داخل الشاشة**
                 * (256→512 على عرض 390) بدل أن يخرجه منها. على `start` — أي
                 * اليمين في RTL — تُخرجه الإزاحة نفسها من الشاشة كما يُقصد،
                 * ويأتي من الجهة التي فيها زر القائمة.
                 *
                 * وعلى الشاشة الكبيرة يلتصق أسفل الترويسة (61px) ويمرّر محتواه
                 * وحده: كان يمرّ مع الصفحة فيغيب التنقّل كلما نزل المستعمل في
                 * قائمة طويلة — وقائمة الأدمن اثنان وثلاثون عنصراً. `self-start`
                 * شرط لا زينة: أب flex يمدّ ابنه إلى كامل الارتفاع، وعنصرٌ
                 * بطول أبيه لا يلتصق لأنه بلا مساحة يتحرك فيها.
                 */
                className={`flex w-64 max-w-[85vw] shrink-0 flex-col justify-between border-e-[0.5px] border-ink/10 bg-surface p-5 max-lg:fixed max-lg:inset-y-0 max-lg:start-0 max-lg:z-50 max-lg:overflow-y-auto max-lg:transition-transform lg:sticky lg:top-[61px] lg:h-[calc(100vh_-_61px)] lg:self-start lg:overflow-y-auto ${mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:translate-x-full lg:translate-x-0'}`}
            >
                <div className="space-y-6">
                    <div>
                        <div className="mb-3 flex items-center justify-between px-2">
                            <span className="text-[11px] font-extrabold tracking-wider text-ink/40 uppercase">
                                القائمة الرئيسية
                            </span>
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                aria-label="إغلاق القائمة"
                                className="cursor-pointer rounded-lg p-1 text-ink/50 hover:bg-ink/5 lg:hidden"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
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
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-extrabold transition-colors ${
                                            active
                                                ? 'bg-ink text-lime'
                                                : 'text-ink/80 hover:bg-ink/5 hover:text-ink'
                                        }`}
                                    >
                                        <span
                                            className={`shrink-0 ${active ? 'text-lime' : 'text-ink/70'}`}
                                        >
                                            <item.icon
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="flex-1 truncate">
                                            {item.label}
                                        </span>
                                        {item.badge !== undefined &&
                                            item.badge > 0 && (
                                                <span className="rounded-full bg-lime px-1.5 py-0.5 text-[10px] font-black text-ink">
                                                    {item.badge}
                                                </span>
                                            )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div className="space-y-3 border-t-[0.5px] border-ink/10 pt-4">
                    {showContextSwitcher && (
                        <>
                            <button
                                type="button"
                                onClick={() => setSwitcherOpen((prev) => !prev)}
                                aria-expanded={switcherOpen}
                                className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-ink/5 p-2.5 text-xs font-bold text-ink transition-colors hover:bg-ink/10"
                            >
                                <span className="flex items-center gap-2">
                                    <ArrowRightLeft
                                        className="h-3.5 w-3.5 text-ink"
                                        aria-hidden="true"
                                    />
                                    <span>تبديل المنشأة</span>
                                </span>
                                <ChevronDown
                                    className="h-3.5 w-3.5 text-ink/50"
                                    aria-hidden="true"
                                />
                            </button>

                            {switcherOpen && (
                                <div className="overflow-hidden rounded-xl border-[0.5px] border-ink/10">
                                    {memberships.map((membership) => (
                                        <button
                                            key={membership.id}
                                            type="button"
                                            onClick={() => {
                                                setSwitcherOpen(false);

                                                if (!membership.active) {
                                                    router.post(
                                                        contextSwitchUrl as string,
                                                        {
                                                            context_id:
                                                                membership.id,
                                                        },
                                                    );
                                                }
                                            }}
                                            className={`w-full cursor-pointer px-3 py-2 text-start text-xs font-bold transition-colors ${
                                                membership.active
                                                    ? 'bg-ink text-lime'
                                                    : 'text-ink/80 hover:bg-ink/5'
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
                        className="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-xs font-bold text-danger transition-colors hover:bg-danger-tint"
                    >
                        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
