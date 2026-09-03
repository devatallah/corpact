import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Card } from '@/components/portal/ui';

/**
 * The create/edit form shell.
 *
 * Every admin form is the same shape: a white card per logical section, a
 * grid of fields inside it, and one action row pinned to the bottom. Keeping
 * it here means a new form is a list of fields rather than a layout decision.
 */
export function FormSection({
    title,
    hint,
    children,
}: {
    title: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <Card padding="p-5" className="space-y-4">
            <div>
                <h2 className="text-sm font-extrabold text-ink">{title}</h2>
                {hint && (
                    <p className="mt-0.5 text-[11px] leading-relaxed text-ink/55">
                        {hint}
                    </p>
                )}
            </div>
            {children}
        </Card>
    );
}

export function FormGrid({
    children,
    columns = 3,
}: {
    children: ReactNode;
    columns?: 2 | 3;
}) {
    return (
        <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''} gap-4`}
        >
            {children}
        </div>
    );
}

/**
 * The action row. `cancelHref` is the H §18 back path out of a whole-screen
 * form, never a bare submit.
 *
 * It is omitted only for a form that lives *inside* a screen it does not own
 * — the top-up panel on the wallet, the template editor on the templates
 * page. There, «إلغاء» must dismiss the panel, not navigate the user off the
 * screen; those forms pass their own cancel button as a child, and the screen
 * keeps its back path in the header.
 */
export function FormActions({
    cancelHref,
    children,
}: {
    cancelHref?: string;
    children: ReactNode;
}) {
    return (
        <div className="flex items-center gap-2 pt-1">
            {children}
            {cancelHref && (
                <Link
                    href={cancelHref}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-[0.5px] border-ink/10 bg-ink/5 px-3.5 py-2 text-xs font-bold text-ink transition-colors hover:bg-ink/10"
                >
                    إلغاء
                </Link>
            )}
        </div>
    );
}
