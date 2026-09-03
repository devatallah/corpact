import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    // Fall back gracefully when rendered outside an Inertia app (tests, design previews).
    let isOpen: boolean | undefined = true;
    try {
        isOpen = usePage().props.sidebarOpen as boolean | undefined;
    } catch {
        /* no Inertia context */
    }

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
