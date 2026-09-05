import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Home,
    ShieldCheck,
    Trophy,
    User,
    UsersRound,
} from 'lucide-react';
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

/**
 * تبويب القائد — يُضاف ولا يُستبدل.
 *
 * القائد موظف أولاً: تبويباته الخمسة تبقى كما هي، ويُضاف إليها بابه. تبويب
 * واحد لا ثلاثة لأن الشريط السفلي على شاشة الهاتف لا يحتمل ثمانية، ولأن
 * قائد مجتمعين يحتاج أن يختار أيّهما قبل أن يفتح أداة — وهو ما تفعله صفحة
 * «قيادتي».
 */
const LEADER_TAB = {
    label: 'قيادتي',
    href: '/employee/leadership',
    icon: ShieldCheck,
};

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
    const leadership = (auth as { leadership?: unknown[] }).leadership ?? [];
    const tabs = leadership.length > 0 ? [...TABS, LEADER_TAB] : TABS;
    const activeCompany =
        companyName ??
        memberships.find((membership) => membership.active)?.label ??
        'شركتك';
    const path = page.url.split('?')[0];

    return (
        <div className="flex min-h-screen flex-col bg-page font-arabic text-ink antialiased">
            <PortalHeader
                userLabel={auth.user?.name ?? 'الموظف'}
                userSub="موظف"
                notificationsUrl="/employee/notifications"
                contextSwitchUrl="/employee/context/switch"
                logoutUrl="/employee/logout"
            />

            {/* لا حشوة سفلية على الحاوية: كانت تدفع الشريط اللاصق 32px فوق
                حافة الشاشة فلا يستقر عليها. المسافة تحت المحتوى تُعطى للمحتوى
                نفسه (`pb-24` أدناه) حتى لا يختفي آخر سطر خلف الشريط. */}
            <main className="flex flex-1 justify-center p-0 sm:p-4 lg:p-6">
                <div className="w-full max-w-2xl">
                    <div className="flex min-h-full flex-col">
                        <div className="sticky top-0 z-30 flex items-center justify-between border-b-[0.5px] border-ink/10 bg-page/90 px-4 py-3 backdrop-blur-md">
                            <div className="flex min-w-0 items-center gap-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink text-xs font-black text-lime">
                                    {activeCompany.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-bold text-ink/50">
                                        مجتمعات منسوبي
                                    </div>
                                    <div className="truncate text-xs leading-tight font-black text-ink">
                                        {activeCompany}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto w-full max-w-xl flex-1 px-3.5 pt-4 sm:px-4">
                            {/* مسافة تكفي ارتفاع الشريط الثابت، فلا يحجب آخر
                                عنصر في الصفحة. */}
                            <div className="space-y-5 pb-24">{children}</div>
                        </div>
                    </div>
                </div>
            </main>

            {/*
                الشريط خارج <main> عمداً: `position: fixed` يفقد إسناده إلى
                إطار العرض إن حمل أيُّ سلف transform/filter/contain، وسلفه
                داخل المحتوى عرضة لذلك مع أي حركة تُضاف لاحقاً. هنا ابنٌ مباشر
                للجذر، فلا سلف بينه وبين الصفحة.

                و`pb-[max(...,env(safe-area-inset-bottom))]` يرفعه فوق شريط
                الصفحة الرئيسية في آيفون — بدونه تقع التبويبات تحته فلا تُنقر.
            */}
            <nav
                aria-label="التنقل السريع"
                className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-xl border-t-[0.5px] border-ink/15 bg-surface/95 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur-md"
            >
                <div
                    className="grid gap-1"
                    style={{
                        gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
                    }}
                >
                    {tabs.map((tab) => {
                        const active =
                            path === tab.href ||
                            path.startsWith(`${tab.href}/`);

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                aria-current={active ? 'page' : undefined}
                                className={`flex flex-col items-center justify-center rounded-xl py-1 transition-colors ${
                                    active
                                        ? 'font-black text-ink'
                                        : 'font-medium text-ink/50 hover:text-ink'
                                }`}
                            >
                                <tab.icon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                                <span className="mt-0.5 text-[10px]">
                                    {tab.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
