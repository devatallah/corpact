import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, Home, Trophy, User, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import PortalHeader from '@/components/portal-header';
import { useFlashToasts } from '@/layouts/portal-shell';
import type { SharedProps } from '@/types';

/**
 * The employee shell — a phone-shaped column, not a desk.
 *
 * The prototype gives the employee no rail: a max-w-2xl card centred on the
 * page, a sticky company strip at its top, and a five-tab bar stuck to the
 * bottom. It is the same app an employee opens on their phone, framed.
 */
const TABS: { label: string; href: string; icon: LucideIcon }[] = [
    { label: 'الرئيسية', href: '/employee/home', icon: Home },
    { label: 'مجتمعاتي', href: '/employee/community', icon: UsersRound },
    { label: 'فعالياتي', href: '/employee/explore', icon: CalendarDays },
    { label: 'اللوحات', href: '/employee/leaderboards', icon: Trophy },
    { label: 'حسابي', href: '/employee/profile', icon: User },
];

export default function EmployeeLayout({
    children,
    /** The company whose membership is active — the strip names it. */
    companyName,
}: {
    children: ReactNode;
    companyName?: string;
}) {
    useFlashToasts();

    const page = usePage<SharedProps>();
    const { auth } = page.props;
    const memberships = auth.memberships ?? [];
    const activeCompany = companyName ?? memberships.find((membership) => membership.active)?.label ?? 'شركتك';
    const path = page.url.split('?')[0];

    return (
        <div className="min-h-screen bg-page text-ink font-arabic antialiased flex flex-col">
            <PortalHeader
                userLabel={auth.user?.name ?? 'الموظف'}
                userSub="موظف"
                notificationsUrl="/employee/notifications"
                contextSwitchUrl="/employee/context/switch"
            />

            <main className="flex-1 p-0 sm:p-4 lg:p-6 flex justify-center pb-8">
                <div className="w-full max-w-2xl">
                    <div className="min-h-full flex flex-col justify-between">
                        <div className="sticky top-0 z-30 bg-page/90 backdrop-blur-md px-4 py-3 border-b-[0.5px] border-ink/10 flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-ink text-lime font-black text-xs flex items-center justify-center shrink-0">
                                    {activeCompany.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] text-ink/50 font-bold">مجتمعات منسوبي</div>
                                    <div className="text-xs font-black text-ink leading-tight truncate">{activeCompany}</div>
                                </div>
                            </div>
                        </div>

                        <div className="px-3.5 sm:px-4 pt-4 flex-1 max-w-xl mx-auto w-full">
                            <div className="space-y-5 pb-6">{children}</div>
                        </div>

                        <nav
                            aria-label="التنقل السريع"
                            className="sticky bottom-0 z-40 bg-surface/95 backdrop-blur-md border-t-[0.5px] border-ink/15 px-2 py-1.5 shrink-0 max-w-xl mx-auto w-full"
                        >
                            <div className="grid grid-cols-5 gap-1">
                                {TABS.map((tab) => {
                                    const active = path === tab.href || path.startsWith(`${tab.href}/`);

                                    return (
                                        <Link
                                            key={tab.href}
                                            href={tab.href}
                                            aria-current={active ? 'page' : undefined}
                                            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
                                                active ? 'text-ink font-black' : 'text-ink/50 hover:text-ink font-medium'
                                            }`}
                                        >
                                            <tab.icon className="w-5 h-5" aria-hidden="true" />
                                            <span className="text-[10px] mt-0.5">{tab.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                    </div>
                </div>
            </main>
        </div>
    );
}
