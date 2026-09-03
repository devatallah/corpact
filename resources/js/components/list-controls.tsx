import { Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Paginated, SortState } from '@/types';

/**
 * H §18 — «كل قائمة: بحث + فلترة + ترتيب + ترقيم صفحات (20 عنصراً)».
 *
 * The four controls travel together in the URL, so they share one helper:
 * every change keeps the other parameters, drops `page` (page 3 of the old
 * ordering means nothing under the new one) and replaces rather than pushes.
 */
export function visitWith(changes: Record<string, string | number | null>) {
    const url = new URL(window.location.href);
    const params: Record<string, string> = {};

    url.searchParams.forEach((value, name) => {
        params[name] = value;
    });

    delete params.page;

    for (const [name, value] of Object.entries(changes)) {
        if (value === null || value === '') {
            delete params[name];
        } else {
            params[name] = String(value);
        }
    }

    router.get(window.location.pathname, params, { preserveState: true, replace: true, preserveScroll: true });
}

/**
 * Search box that waits for the typing to stop. Uncontrolled after mount so a
 * server round-trip cannot yank the caret back.
 */
export function SearchInput({ value = '', placeholder = 'ابحث…' }: { value?: string; placeholder?: string }) {
    const [term, setTerm] = useState(value);
    const first = useRef(true);

    useEffect(() => {
        if (first.current) {
            first.current = false;

            return;
        }

        const timer = setTimeout(() => visitWith({ search: term }), 350);

        return () => clearTimeout(timer);
    }, [term]);

    return (
        <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink/40 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" aria-hidden="true" />
            <input
                type="search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className="w-full pl-3 pr-9 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink transition-colors"
            />
        </div>
    );
}

/** A filter `<select>` that visits on change. */
export function FilterSelect({
    name,
    value,
    options,
    label,
}: {
    name: string;
    value?: string | null;
    options: [string, string][];
    label: string;
}) {
    return (
        <select
            aria-label={label}
            value={value ?? ''}
            onChange={(event) => visitWith({ [name]: event.target.value })}
            className="p-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface text-ink focus:outline-none focus:border-ink cursor-pointer"
        >
            {options.map(([optionValue, text]) => (
                <option key={optionValue} value={optionValue}>
                    {text}
                </option>
            ))}
        </select>
    );
}

/** The card the search box and its filters sit in. */
export function Toolbar({ children }: { children: ReactNode }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{children}</div>
    );
}

/**
 * A sortable column head. `sortKey` is a whitelisted key on the server
 * (`App\Support\Lists\ListSort`), never a raw column name.
 *
 * RTL: the arrow follows the label in DOM order, so it renders to its left —
 * where an Arabic reader expects it. Both glyphs are vertical, so neither
 * flips with the writing direction.
 */
export function SortableHeader({
    label,
    sortKey,
    sort,
    initialDirection = 'asc',
}: {
    label: string;
    sortKey: string;
    sort?: SortState | null;
    /** First-click direction — `desc` for dates and amounts, `asc` for text. */
    initialDirection?: 'asc' | 'desc';
}) {
    const active = sort?.key === sortKey;
    const direction = active ? sort?.direction : null;
    const next = active ? (direction === 'asc' ? 'desc' : 'asc') : initialDirection;

    return (
        <button
            type="button"
            onClick={() => visitWith({ sort: sortKey, dir: next })}
            aria-label={`ترتيب حسب ${label}`}
            className="inline-flex items-center gap-1.5 font-bold cursor-pointer bg-transparent border-0 p-0 text-inherit"
        >
            <span>{label}</span>
            <span aria-hidden="true" className={active ? 'text-ink' : 'text-ink/25'}>
                {direction === 'asc' ? '▲' : '▼'}
            </span>
        </button>
    );
}

/** The paginator. Laravel's own labels, rendered in Arabic. */
export function Pagination<T>({ page }: { page: Paginated<T> }) {
    if (page.links.length <= 3) {
        return null;
    }

    const base =
        'inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-full text-xs font-bold border-[0.5px] transition-colors';

    return (
        <nav aria-label="ترقيم الصفحات" className="flex flex-wrap justify-center gap-1.5 pt-4">
            {page.links.map((link, index) => {
                const label = link.label
                    .replace('&laquo;', '«')
                    .replace('&raquo;', '»')
                    .replace('Previous', 'السابق')
                    .replace('Next', 'التالي');

                if (!link.url) {
                    return (
                        <span key={index} className={`${base} border-ink/10 bg-surface text-ink/40 cursor-default`}>
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        preserveState
                        preserveScroll
                        aria-current={link.active ? 'page' : undefined}
                        className={`${base} ${
                            link.active
                                ? 'bg-ink text-lime border-ink'
                                : 'bg-surface text-ink border-ink/10 hover:border-ink/30 hover:bg-ink/5'
                        }`}
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}

/** «عرض ١–٢٠ من ١٣٤» — the count line under a list. */
export function ResultCount<T>({ page }: { page: Paginated<T> }) {
    if (page.total === 0) {
        return null;
    }

    return (
        <p className="text-[11px] text-ink/45 font-mono">
            عرض {page.from ?? 0}–{page.to ?? 0} من {page.total}
        </p>
    );
}

/**
 * Minutes left until an ISO deadline, ticking every 30 seconds.
 *
 * A payment deadline that renders once and then sits still is worse than no
 * countdown at all: the employee reads «٤٥ دقيقة» on a page they opened an
 * hour ago and believes it.
 */
export function useMinutesLeft(deadline: string | null | undefined) {
    const [minutes, setMinutes] = useState<number | null>(null);

    useEffect(() => {
        if (!deadline) {
            return;
        }

        const tick = () => setMinutes(Math.max(0, Math.round((new Date(deadline).getTime() - Date.now()) / 60000)));

        // Deferred, not synchronous: reading the clock is a side effect, and
        // the first read belongs after paint like every later one.
        const first = setTimeout(tick, 0);
        const timer = setInterval(tick, 30_000);

        return () => {
            clearTimeout(first);
            clearInterval(timer);
        };
    }, [deadline]);

    return minutes;
}
