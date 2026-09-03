import { usePage } from '@inertiajs/react';
import { Activity, Bell, Calendar, CircleUser, ClipboardList, Receipt, Settings, ShieldCheck, Tags, TrendingUp, Trophy, Users, UsersRound, Wallet } from 'lucide-react';
import PortalHeader from '@/components/portal-header';
import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage().props;
    const unread = (usePage().props as Record<string, unknown>).unreadNotifications as number | undefined;
    const pendingRequests = (usePage().props as Record<string, unknown>).pendingCommunityRequests as number | undefined;

    const navItems: NavItem[] = [
        { label: 'لوحة التحكم', href: '/company/dash', icon: Activity },
        { label: 'الأقسام', href: '/company/departments', icon: Tags },
        { label: 'الموظفون', href: '/company/employees', icon: Users },
        { label: 'المجتمعات', href: '/company/communities', icon: UsersRound },
        { label: 'طلبات المجتمعات', href: '/company/community-requests', icon: ClipboardList, badge: pendingRequests },
        { label: 'الفعاليات', href: '/company/events', icon: Calendar },
        { label: 'البطولات', href: '/company/leagues', icon: Trophy },
        { label: 'المحفظة', href: '/company/wallet', icon: Wallet },
        // A15 — H §18 (مسؤول الحساب): «المالية: … الفواتير» + H §19: ملخص
        // سجل التدقيق لشركته. الصفحتان كانتا بلا رابط في الشريط.
        { label: 'الفواتير', href: '/company/invoices', icon: Receipt },
        { label: 'التقارير', href: '/company/reports', icon: TrendingUp },
        { label: 'سجل التدقيق', href: '/company/audit', icon: ShieldCheck },
        { label: 'الإشعارات', href: '/company/notifications', icon: Bell, badge: unread },
        { label: 'الإعدادات', href: '/company/settings', icon: Settings },
        { label: 'الملف الشخصي', href: '/company/profile', icon: CircleUser },
    ];

    return (
        <div
            className="min-h-screen bg-[#F6F8F5] text-[#0A0A0A] font-arabic antialiased selection:bg-[#C8FF00] selection:text-[#0A0A0A] flex flex-col"
            dir="rtl"
        >
            <PortalHeader
                userLabel={auth.user?.name ?? 'الشركة'}
                userSub={auth.user && 'contact_name' in auth.user ? (auth.user as { contact_name: string }).contact_name : undefined}
                notificationsUrl="/company/notifications"
                contextSwitchUrl="/company/context/switch"
            />

            {/* Full-width header over a max-w-7xl body, as the prototype lays it out. */}
            <div className="flex-1 flex max-w-7xl mx-auto w-full">
                <PortalSidebar
                    portalTag="COMPANY"
                    userLabel={auth.user?.name ?? 'الشركة'}
                    userSub={auth.user && 'contact_name' in auth.user ? (auth.user as { contact_name: string }).contact_name : undefined}
                    navItems={navItems}
                    logoutUrl="/company/logout"
                    infoStyle="company"
                    brandInHeader
                    contextSwitchUrl="/company/context/switch"
                />
                <main className="flex-1 min-w-0 p-0 sm:p-4 lg:p-6 pb-8 flex justify-center">
                    <div className="w-full max-w-6xl min-w-0 p-4 sm:p-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
