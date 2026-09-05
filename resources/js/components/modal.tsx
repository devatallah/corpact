import { X } from 'lucide-react';
import { useEffect, useRef  } from 'react';
import type {ReactNode} from 'react';

/**
 * غلاف نافذة عام: طبقة، ومفتاح هروب، وإعادة التركيز لما فُتحت منه.
 *
 * أُخرج غلافاً مشتركاً لأن كل نافذة جديدة كانت تعيد كتابة الطبقة ومعالج
 * المفتاح — ونسيان أحدهما لا يظهر في الشاشة، يظهر لمن يتنقّل بلوحة المفاتيح
 * وحده. على الهاتف تُلصق بالأسفل كورقة، وعلى الشاشة الكبيرة تتوسّط.
 */
export default function Modal({
    open,
    title,
    subtitle,
    onClose,
    children,
    footer,
    labelledBy = 'modal-title',
}: {
    open: boolean;
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    labelledBy?: string;
}) {
    const restoreTo = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        restoreTo.current = document.activeElement as HTMLElement | null;

        function onKey(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        window.addEventListener('keydown', onKey);

        return () => {
            window.removeEventListener('keydown', onKey);
            restoreTo.current?.focus?.();
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        >
            <div
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                dir="rtl"
                className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-[0.5px] border-ink/10 bg-page font-arabic sm:rounded-3xl"
            >
                <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b-[0.5px] border-ink/10 bg-surface px-5 py-4">
                    <div className="min-w-0">
                        <h2
                            id={labelledBy}
                            className="text-sm font-black text-ink"
                        >
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-[11px] leading-relaxed text-ink/55">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="إغلاق"
                        className="cursor-pointer rounded-full p-1.5 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </header>

                <div className="p-5">{children}</div>

                {footer && (
                    <footer className="sticky bottom-0 border-t-[0.5px] border-ink/10 bg-surface px-5 py-4">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
}
