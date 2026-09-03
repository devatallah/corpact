import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * H §18 — «كل قائمة لها ثلاث حالات إلزامية بنص عربي محدد: فارغة · تحميل · خطأ».
 *
 * Every list in the portals is server-rendered through Inertia, so "loading"
 * is the transition between two visits and "error" is a failed one. Both are
 * otherwise invisible (only the top progress bar moves), and "empty" tends to
 * become a copy-pasted `<td colSpan>` string. This is the one component that
 * renders the three states, with the copy the spec names.
 */

type Tone = 'empty' | 'loading' | 'error';

const TONES: Record<Tone, { className: string; icon: string }> = {
    empty: { className: 'text-ink/55', icon: '📭' },
    loading: { className: 'text-ink/40', icon: '⏳' },
    error: { className: 'text-danger', icon: '⚠️' },
};

export function ListState({ tone, title, hint, action }: { tone: Tone; title: string; hint?: string; action?: ReactNode }) {
    const { className, icon } = TONES[tone];

    return (
        <div role={tone === 'error' ? 'alert' : 'status'} className="flex flex-col items-center gap-2 px-5 py-9 text-center">
            <div className="text-2xl" aria-hidden="true">
                {icon}
            </div>
            <div className={`text-sm font-bold ${className}`}>{title}</div>
            {hint && <div className="text-xs text-ink/55 leading-loose max-w-[460px]">{hint}</div>}
            {action}
        </div>
    );
}

/**
 * Tracks Inertia's navigation lifecycle so a list can say «جارٍ التحميل…»
 * while the next page is in flight and «تعذّر تحميل البيانات» when it fails.
 */
export function useListStatus() {
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        // Inertia dispatches its lifecycle events on `document`.
        const onStart = () => {
            setLoading(true);
            setFailed(false);
        };
        const onFinish = () => setLoading(false);
        const onError = () => {
            setLoading(false);
            setFailed(true);
        };

        document.addEventListener('inertia:start', onStart);
        document.addEventListener('inertia:finish', onFinish);
        document.addEventListener('inertia:error', onError);
        document.addEventListener('inertia:exception', onError);

        return () => {
            document.removeEventListener('inertia:start', onStart);
            document.removeEventListener('inertia:finish', onFinish);
            document.removeEventListener('inertia:error', onError);
            document.removeEventListener('inertia:exception', onError);
        };
    }, []);

    return { loading, failed, retry: () => window.location.reload() };
}

/**
 * The whole rule in one call: give it the row count and it renders the right
 * state, or nothing at all when there are rows to show.
 *
 * ```tsx
 * <ListStates count={rows.length} empty="لا توجد سجلات." colSpan={6} />
 * ```
 */
export function ListStates({
    count,
    empty,
    emptyHint,
    colSpan,
}: {
    count: number;
    empty: string;
    emptyHint?: string;
    /** Set when the states render inside a table body. */
    colSpan?: number;
}) {
    const { loading, failed, retry } = useListStatus();

    let state: ReactNode = null;

    if (failed) {
        state = (
            <ListState
                tone="error"
                title="تعذّر تحميل البيانات"
                hint="حدث خطأ أثناء جلب السجلات. تحقق من الاتصال ثم أعد المحاولة."
                action={
                    <button
                        type="button"
                        onClick={retry}
                        className="mt-1 px-3.5 py-1.5 rounded-full text-xs font-bold bg-ink text-white cursor-pointer"
                    >
                        إعادة المحاولة
                    </button>
                }
            />
        );
    } else if (loading) {
        state = <ListState tone="loading" title="جارٍ التحميل…" hint="نجلب أحدث السجلات الآن." />;
    } else if (count === 0) {
        state = <ListState tone="empty" title={empty} hint={emptyHint} />;
    }

    if (state === null) {
        return null;
    }

    return colSpan === undefined ? (
        state
    ) : (
        <tr>
            <td colSpan={colSpan}>{state}</td>
        </tr>
    );
}

/**
 * H §18 — «لا شاشة بلا مسار رجوع واضح». Every detail screen opens with one.
 */
export function BackLink({ href, label }: { href: string; label: string }) {
    return (
        <Link href={href} className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/70 hover:text-ink transition-colors">
            <span aria-hidden="true">→</span>
            <span>{label}</span>
        </Link>
    );
}
