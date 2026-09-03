import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from 'sonner';

const appName = import.meta.env.VITE_APP_NAME || 'تيمات';

createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),
    strictMode: true,
    withApp(app) {
        return (
            <>
                {app}
                <Toaster
                    dir="rtl"
                    position="bottom-left"
                    toastOptions={{
                        classNames: {
                            toast: 'font-arabic text-xs rounded-2xl border hairline bg-surface text-ink',
                        },
                    }}
                />
            </>
        );
    },
    progress: {
        // The one accent, on the one thing that signals "working".
        color: '#C8FF00',
    },
});
