import { Toaster, toast } from 'teamat-ui';
import { useEffect } from 'react';

// toast MUST come from 'teamat-ui' (re-exported from the bundle's sonner) —
// importing 'sonner' directly bundles a second copy whose module-scope state
// never reaches the mounted <Toaster/>.

export const Toasts = () => {
    useEffect(() => {
        const t = setTimeout(() => {
            toast('Event created', {
                description: 'Padel session scheduled for Thursday, 7:00 PM.',
            });
            toast.success('Settings saved successfully');
        }, 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', minHeight: 340 }}>
            <Toaster />
        </div>
    );
};
