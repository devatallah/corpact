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
        <div className="min-h-screen bg-page text-ink font-arabic antialiased flex flex-col">
            <PortalHeader
                userLabel={userLabel}
                userSub={userSub}
                userAvatar={userLabel.charAt(0)}
                notificationsUrl={notificationsUrl}
                contextSwitchUrl={contextSwitchUrl}
            />

            <div className="flex-1 flex max-w-7xl mx-auto w-full">
                <PortalSidebar navItems={navItems} logoutUrl={logoutUrl} contextSwitchUrl={contextSwitchUrl} />

                <main className="flex-1 min-w-0 p-0 sm:p-4 lg:p-6 pb-8 flex justify-center">
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
