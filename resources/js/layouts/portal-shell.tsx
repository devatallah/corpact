import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import PortalHeader from '@/components/portal-header';
import PortalSidebar from '@/components/portal-sidebar';
import type { NavItem } from '@/components/portal-sidebar';
import type { SharedProps } from '@/types';

/**
 * The desk shell shared by the admin, company and provider portals.
 *
 * The prototype spans the header full width and caps the body at max-w-7xl,
 * with the rail on the start edge and a max-w-6xl content column beside it.
 */
export default function PortalShell({
    navItems,
    logoutUrl,
    userLabel,
    userSub,
    notificationsUrl,
    contextSwitchUrl,
    children,
}: {
    navItems: NavItem[];
    logoutUrl: string;
    userLabel: string;
    userSub?: string;
    notificationsUrl?: string;
    contextSwitchUrl?: string;
    children: ReactNode;
}) {
    useFlashToasts();

    return (
        <div className="flex min-h-screen flex-col bg-page font-arabic text-ink antialiased">
            {/*
             * مبدّل السياق يُمرَّر للشريط الجانبي وحده هنا.
             *
             * كان يُمرَّر للاثنين، فيرى صاحب العضويتين المبدّل نفسه مرتين في
             * شاشة واحدة — مرة في الترويسة ومرة أسفل الشريط. لم يظهر العيب
             * لأن بوابة الشركة لم يكن فيها حساب بعضويتين أصلاً. بوابة الموظف
             * بلا شريط جانبي، فهي تمرّره للترويسة مباشرة ولا يمسّها هذا.
             */}
            <PortalHeader
                userLabel={userLabel}
                userSub={userSub}
                userAvatar={userLabel.charAt(0)}
                notificationsUrl={notificationsUrl}
            />

            <div className="mx-auto flex w-full max-w-7xl flex-1">
                <PortalSidebar
                    navItems={navItems}
                    logoutUrl={logoutUrl}
                    contextSwitchUrl={contextSwitchUrl}
                />

                <main className="flex min-w-0 flex-1 justify-center p-0 pb-8 sm:p-4 lg:p-6">
                    <div className="w-full max-w-6xl min-w-0 p-4 sm:p-8">
                        <div className="space-y-6">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}

/**
 * Flash messages arrive as shared props on every response; surfacing them is
 * the shell's job so no page has to remember. The ref keeps a re-render from
 * firing the same toast twice.
 */
export function useFlashToasts() {
    const { flash } = usePage<SharedProps>().props;
    const shown = useRef<string | null>(null);

    useEffect(() => {
        const message = flash?.success ?? flash?.error ?? null;

        if (!message || shown.current === message) {
            return;
        }

        shown.current = message;

        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);
}
