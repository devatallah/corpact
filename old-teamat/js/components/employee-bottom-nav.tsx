import { Link, usePage } from '@inertiajs/react';
import { Calendar, Compass, House, Trophy, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Tab {
    label: string;
    href: string;
    icon: LucideIcon;
    /** Shows the pulsing dot when the shared `unreadNotifications` prop is set. */
    badge?: boolean;
}

/**
 * The employee tab bar — ported from teamat.ai.studio (`#employee-bottom-nav`).
 *
 * The prototype's employee portal is phone-shaped: no rail, a `max-w-2xl`
 * column, and this five-up bar pinned to the bottom of it. Its own tabs are
 * الرئيسية / مجتمعاتي / فعالياتي / اللوحات / حسابي; «فعالياتي» has no list route
 * here, so that slot goes to استكشاف, which is where this platform surfaces
 * events to join.
 */
const TABS: Tab[] = [
    { label: 'الرئيسية', href: '/employee/home', icon: House, badge: true },
    { label: 'مجتمعاتي', href: '/employee/community', icon: Compass },
    { label: 'استكشاف', href: '/employee/explore', icon: Calendar },
    { label: 'اللوحات', href: '/employee/leaderboards', icon: Trophy },
    { label: 'حسابي', href: '/employee/profile', icon: User },
];

export default function EmployeeBottomNav() {
    const page = usePage();
    const unread = ((page.props as Record<string, unknown>).unreadNotifications as number) ?? 0;

    function isActive(href: string) {
        const path = page.url.split('?')[0].replace(/\/+$/, '') || '/';
        const target = href.replace(/\/+$/, '');

        return path === target || path.startsWith(`${target}/`);
    }

    return (
        <nav
            id="employee-bottom-nav"
            aria-label="التنقل الرئيسي"
            className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t-[0.5px] border-[#0A0A0A]/15 px-2 py-1.5 shrink-0 max-w-xl mx-auto w-full"
        >
            <div className="grid grid-cols-5 gap-1">
                {TABS.map((tab) => {
                    const active = isActive(tab.href);

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            aria-current={active ? 'page' : undefined}
                            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
                                active ? 'text-[#0A0A0A] font-black' : 'text-[#0A0A0A]/50 hover:text-[#0A0A0A] font-medium'
                            }`}
                        >
                            <tab.icon
                                className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`}
                                aria-hidden="true"
                            />
                            <span className="text-[10px] mt-0.5">{tab.label}</span>
                            {tab.badge && unread > 0 && (
                                <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
