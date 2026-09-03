import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/** "2026-05-03T00:00:00.000000Z" → "2026-05-03" */
export function fmtDate(v: string | null | undefined): string {
    return v ? String(v).slice(0, 10) : '';
}

/** "19:00:00" → "19:00" */
export function fmtTime(v: string | null | undefined): string {
    return v ? String(v).slice(0, 5) : '';
}

/** "2026-05-03T14:30:00.000000Z" → "2026-05-03 14:30" */
export function fmtDateTime(v: string | null | undefined): string {
    if (!v) return '';
    const s = String(v);
    return s.length > 16 ? s.slice(0, 10) + ' ' + s.slice(11, 16) : s;
}

/**
 * المبالغ تُخزَّن بالهللة كعدد صحيح (H §12.5). هذه الدالة للعرض فقط —
 * لا تُستخدم في أي حساب.
 */
export function fmtHalalas(v: number | null | undefined, decimals = 2): string {
    if (v === null || v === undefined) {
        return "—";
    }

    return (v / 100).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}
