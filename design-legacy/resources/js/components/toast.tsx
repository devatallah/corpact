import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: number;
    type: ToastType;
    text: string;
}

let toastId = 0;

export default function Toast() {
    // Fall back gracefully when rendered outside an Inertia app (tests, design previews).
    let page: ReturnType<typeof usePage> | null = null;
    try {
        page = usePage();
    } catch {
        /* no Inertia context */
    }
    const flash = (page?.props as Record<string, unknown>)?.flash as Record<string, string> | undefined;
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        if (flash?.success) {
            addToast('success', flash.success);
        }
        if (flash?.error) {
            addToast('error', flash.error);
        }
        if (flash?.info) {
            addToast('info', flash.info);
        }
    }, [flash?.success, flash?.error, flash?.info]);

    function addToast(type: ToastType, text: string) {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, type, text }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }

    if (toasts.length === 0) return null;

    const colors: Record<ToastType, { bg: string; border: string; text: string }> = {
        success: { bg: 'rgba(200,255,0,0.1)', border: 'rgba(200,255,0,0.3)', text: '#0A0A0A' },
        error: { bg: 'rgba(192,57,43,0.08)', border: 'rgba(192,57,43,0.25)', text: '#c0392b' },
        info: { bg: 'rgba(10,10,10,0.05)', border: 'rgba(10,10,10,0.1)', text: '#0A0A0A' },
    };

    return (
        <div style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            pointerEvents: 'none',
        }}>
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    style={{
                        background: colors[toast.type].bg,
                        border: `1px solid ${colors[toast.type].border}`,
                        color: colors[toast.type].text,
                        backdropFilter: 'blur(12px)',
                        padding: '12px 24px',
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "'Almarai', sans-serif",
                        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                        pointerEvents: 'auto',
                        animation: 'toastIn 0.3s ease',
                        direction: 'rtl',
                        minWidth: 280,
                        textAlign: 'center',
                    }}
                >
                    {toast.type === 'success' && '✓ '}
                    {toast.type === 'error' && '✕ '}
                    {toast.text}
                </div>
            ))}
        </div>
    );
}
