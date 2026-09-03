import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: ReactNode;
    /** One line under the title, at `text-xs` and 60% ink. */
    subtitle?: ReactNode;
    /** Optional lucide glyph before the title, as the prototype's screens carry. */
    icon?: LucideIcon;
    /** Buttons or stat pills, pushed to the far end of the row. */
    actions?: ReactNode;
}

/**
 * The screen header — a white card on the page ground, not a bare heading.
 *
 * Every prototype screen opens with this block, so it lives in one place:
 * `rounded-2xl` on a hairline, `text-xl font-extrabold` title, `text-xs`
 * muted subtitle, and anything actionable pushed to the opposite end.
 */
export default function PageHeader({ title, subtitle, icon: Icon, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-[0.5px] border-[#0A0A0A]/10 mb-5">
            <div className="min-w-0">
                <h1 className="flex items-center gap-2 text-xl font-extrabold text-[#0A0A0A] mb-1">
                    {Icon && <Icon className="w-5 h-5 text-[#0A0A0A]/70 shrink-0" aria-hidden="true" />}
                    {title}
                </h1>
                {subtitle && <p className="text-xs text-[#0A0A0A]/60">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2.5 flex-wrap shrink-0">{actions}</div>}
        </div>
    );
}
