import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

/**
 * H §18 — «كل إجراء مالي أو إلغائي يمر بنافذة تأكيد تعرض المبلغ والأثر صراحة».
 *
 * One confirm convention for the whole product: `window.confirm` is banned by
 * a test, because a browser dialog cannot state an amount or an effect and
 * cannot be read in Arabic type. `details` is where the amount and its
 * consequence go — a caller that only passes «هل أنت متأكد؟» has not met the
 * rule.
 */
export default function ConfirmModal({
    open,
    title,
    message,
    details,
    confirmLabel = 'تأكيد',
    confirmDisabled = false,
    cancelLabel = 'إلغاء',
    tone = 'default',
    busy = false,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    message: string;
    /** The amount and its effect, laid out as label/value rows. */
    details?: ReactNode;
    confirmLabel?: string;
    /**
     * Gate the confirm on something the dialog itself collects — an
     * acknowledgement the server cannot verify, like "I matched this against
     * the bank statement". Not a substitute for a server check; a way to stop
     * a dialog becoming a rubber stamp.
     */
    confirmDisabled?: boolean;
    cancelLabel?: string;
    tone?: 'default' | 'danger';
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const confirmRef = useRef<HTMLButtonElement>(null);
    const restoreTo = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        restoreTo.current = document.activeElement as HTMLElement | null;
        confirmRef.current?.focus();

        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
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
            className="fixed inset-0 z-[9999] bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <div
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                aria-describedby="confirm-modal-message"
                dir="rtl"
                className="bg-surface rounded-2xl border-[0.5px] border-ink/10 p-6 sm:p-7 w-full max-w-md font-arabic space-y-4"
            >
                <div className="space-y-2">
                    <h2 id="confirm-modal-title" className="text-base font-black text-ink">
                        {title}
                    </h2>
                    <p id="confirm-modal-message" className="text-xs text-ink/60 leading-relaxed">
                        {message}
                    </p>
                </div>

                {details && (
                    <div className="p-3.5 rounded-xl bg-page border-[0.5px] border-ink/10 space-y-1.5 text-xs">{details}</div>
                )}

                <div className="flex gap-2.5 justify-start pt-1">
                    <button
                        ref={confirmRef}
                        type="button"
                        onClick={onConfirm}
                        disabled={busy || confirmDisabled}
                        className={`min-w-24 px-5 py-2 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime ${
                            tone === 'danger'
                                ? 'bg-danger text-white border-danger hover:bg-[#c0301a]'
                                : 'bg-ink text-white border-ink hover:bg-[#1a1a1a]'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="min-w-24 px-5 py-2 rounded-full text-xs font-bold bg-surface text-ink border-[0.5px] border-ink/15 hover:bg-ink/5 transition-colors cursor-pointer"
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/** A label/value row for the `details` slot — the amount, then its effect. */
export function ConfirmRow({ label, value, strong = false }: { label: string; value: ReactNode; strong?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-ink/60">{label}</span>
            <span className={strong ? 'font-mono font-black text-ink' : 'font-mono font-bold text-ink/85'}>{value}</span>
        </div>
    );
}
