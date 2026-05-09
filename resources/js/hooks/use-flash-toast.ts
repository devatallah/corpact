import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import toastr from 'toastr';
import type { FlashToast } from '@/types/ui';

export function useFlashToast(): void {
    useEffect(() => {
        return router.on('navigate', () => {
            const page = (router as unknown as { page: { props: Record<string, unknown> } }).page;
            if (!page?.props?.flash) return;
            const flash = page.props.flash as Record<string, unknown>;

            const data = flash.toast as FlashToast | undefined;
            if (data) {
                toastr[data.type](data.message);
            }

            if (typeof flash.success === 'string' && flash.success) {
                toastr.success(flash.success);
            }
            if (typeof flash.error === 'string' && flash.error) {
                toastr.error(flash.error);
            }
        });
    }, []);
}
