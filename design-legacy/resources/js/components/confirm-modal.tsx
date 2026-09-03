import { useEffect } from 'react';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, confirmLabel = 'تأكيد', cancelLabel = 'إلغاء', onConfirm, onCancel }: ConfirmModalProps) {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div
            onClick={onCancel}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#1A1F2E', border: '1px solid #2A3148', borderRadius: 14,
                    padding: '28px 32px', minWidth: 340, maxWidth: 440,
                    boxShadow: '0 20px 60px rgba(0,0,0,.4)',
                }}
            >
                <div style={{ fontSize: 16, fontWeight: 700, color: '#E8EAF0', marginBottom: 10 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#9CA3BC', lineHeight: 1.7, marginBottom: 24 }}>{message}</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start' }}>
                    <button
                        onClick={onConfirm}
                        className="act-btn btn-approve"
                        style={{ minWidth: 90 }}
                    >
                        {confirmLabel}
                    </button>
                    <button
                        onClick={onCancel}
                        className="act-btn"
                        style={{ minWidth: 90, background: '#232A3E', color: '#9CA3BC', borderColor: '#2A3148' }}
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
