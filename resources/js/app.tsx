import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import 'toastr/build/toastr.min.css';
import toastr from 'toastr';
toastr.options.positionClass = 'toast-top-left';
toastr.options.closeButton = true;
toastr.options.timeOut = 4000;
const appName = import.meta.env.VITE_APP_NAME || 'Teamat';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#009E82',
    },
});
