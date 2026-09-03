import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * H §18 — «كل قائمة لها ثلاث حالات إلزامية بنص عربي محدد: فارغة · تحميل · خطأ».
 *
 * Every list in the portals is server-rendered through Inertia, so "loading"
 * is the transition between two visits and "error" is a failed one. Both were
 * previously invisible (only the top progress bar) and "empty" was a
 * copy-pasted `<td colSpan>` string. This is the single component that
 * renders the three states with real Arabic copy.
 */

type Tone = 'empty' | 'loading' | 'error';

const TONES: Record<Tone, { color: string; icon: string }> = {
    empty: { color: 'rgb(10 10 10 / 0.55)', icon: '📭' },
    loading: { color: 'rgb(10 10 10 / 0.40)', icon: '⏳' },
    error: { color: '#D9381E', icon: '⚠️' },
};

export function ListState({
    tone,
    title,
    hint,
    action,
}: {
    tone: Tone;
    title: string;
    hint?: string;
    action?: React.ReactNode;
}) {
    const { color, icon } = TONES[tone];

    return (
        <div
            role={tone === 'error' ? 'alert' : 'status'}
            className="flex flex-col items-center gap-2 px-5 py-9 text-center"
        >
            <div className="text-2xl" aria-hidden>
                {icon}
            </div>
            <div className="text-sm font-bold" style={{ color }}>{title}</div>
            {hint && <div className="text-xs text-[#0A0A0A]/55 leading-loose max-w-[460px]">{hint}</div>}
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
        const inertia = document;

        const onStart = () => {
            setLoading(true);
            setFailed(false);
        };
        const onFinish = () => setLoading(false);
        const onError = () => {
            setLoading(false);
            setFailed(true);
        };

        inertia.addEventListener('inertia:start', onStart);
        inertia.addEventListener('inertia:finish', onFinish);
        inertia.addEventListener('inertia:error', onError);
        inertia.addEventListener('inertia:exception', onError);

        return () => {
            inertia.removeEventListener('inertia:start', onStart);
            inertia.removeEventListener('inertia:finish', onFinish);
            inertia.removeEventListener('inertia:error', onError);
            inertia.removeEventListener('inertia:exception', onError);
        };
    }, []);

    return { loading, failed };
}

/**
 * Drop-in row for a `<tbody>`: renders exactly one of the three states, or
 * nothing when the list has rows and nothing is in flight.
 */
export default function ListStates({
    count,
    columns,
    emptyTitle,
    emptyHint,
    action,
}: {
    count: number;
    columns: number;
    emptyTitle: string;
    emptyHint?: string;
    action?: React.ReactNode;
}) {
    const { loading, failed } = useListStatus();

    if (failed) {
        return (
            <tr>
                <td colSpan={columns} className="p-0">
                    <ListState
                        tone="error"
                        title="تعذّر تحميل البيانات"
                        hint="حدث خطأ أثناء جلب القائمة. تحقق من الاتصال ثم أعد المحاولة."
                        action={
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center h-8 px-3 rounded-full text-[11px] font-bold font-arabic bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 hover:border-[#0A0A0A]/30 hover:bg-[#0A0A0A]/5 transition-colors cursor-pointer"
                            >
                                إعادة المحاولة
                            </button>
                        }
                    />
                </td>
            </tr>
        );
    }

    if (loading && count === 0) {
        return (
            <tr>
                <td colSpan={columns} className="p-0">
                    <ListState tone="loading" title="جارٍ التحميل…" hint="نجلب البيانات الآن." />
                </td>
            </tr>
        );
    }

    if (count === 0) {
        return (
            <tr>
                <td colSpan={columns} className="p-0">
                    <ListState tone="empty" title={emptyTitle} hint={emptyHint} action={action} />
                </td>
            </tr>
        );
    }

    return null;
}

/**
 * Back path for screens that are not a portal root — H §18: «لا شاشة بلا مسار
 * رجوع واضح».
 */
export function BackLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1.5 mb-3 h-8 px-3 rounded-full text-[11px] font-bold font-arabic bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 hover:border-[#0A0A0A]/30 hover:bg-[#0A0A0A]/5 transition-colors"
        >
            <span aria-hidden>→</span>
            <span>{label}</span>
        </Link>
    );
}
