import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Destructive actions get the danger tone; everything else is the ink primary. */
    tone?: 'default' | 'danger';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = 'تأكيد',
    cancelLabel = 'إلغاء',
    tone = 'default',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const confirmRef = useRef<HTMLButtonElement>(null);
    const restoreTo = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        restoreTo.current = document.activeElement as HTMLElement | null;
        confirmRef.current?.focus();

        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };

        window.addEventListener('keydown', handler);

        return () => {
            window.removeEventListener('keydown', handler);
            restoreTo.current?.focus?.();
        };
    }, [open, onCancel]);

    if (!open) {
        return null;
    }

    return (
        <div
            onClick={onCancel}
            className="fixed inset-0 z-[9999] bg-[#0A0A0A]/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                aria-describedby="confirm-modal-message"
                dir="rtl"
                className="bg-white rounded-2xl border-[0.5px] border-[#0A0A0A]/10 p-6 sm:p-7 w-full max-w-md font-arabic"
            >
                <h2 id="confirm-modal-title" className="text-base font-black text-[#0A0A0A] mb-2.5">
                    {title}
                </h2>
                <p id="confirm-modal-message" className="text-xs text-[#0A0A0A]/55 leading-relaxed mb-6">
                    {message}
                </p>

                <div className="flex gap-2.5 justify-start">
                    <button
                        ref={confirmRef}
                        type="button"
                        onClick={onConfirm}
                        className={`min-w-24 px-5 py-2 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] ${
                            tone === 'danger'
                                ? 'bg-[#D9381E] text-white border-[#D9381E] hover:bg-[#c0301a]'
                                : 'bg-[#0A0A0A] text-white border-[#0A0A0A] hover:bg-[#1a1a1a]'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="min-w-24 px-5 py-2 rounded-full text-xs font-bold bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/15 hover:border-[#0A0A0A]/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00]"
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
