import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * The employee portal's composition primitives, lifted verbatim from
 * teamat.ai.studio's `employee_n0_*` screens.
 *
 * These exist because the employee pages were 900+ hand-written inline style
 * objects — recolouring those never made them look like the prototype, because
 * the prototype's look *is* its composition: 14px cards on a /15 hairline,
 * font-black section labels at text-xs, dotted status pills, and a #F6F8F5
 * inset strip for the money line. One place to change, eighteen pages to fix.
 */

/** `space-y-5 pb-6` — the gap rhythm between sections on every employee screen. */
export function Screen({ children }: { children: ReactNode }) {
    return <div className="space-y-5 pb-6">{children}</div>;
}

/** A titled block. The prototype's headings are `text-xs font-black`, not h2-sized. */
export function Section({
    title,
    icon: Icon,
    action,
    children,
}: {
    title?: ReactNode;
    icon?: LucideIcon;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="space-y-2.5">
            {(title || action) && (
                <div className="flex items-center justify-between gap-2">
                    {title && (
                        <h2 className="text-xs font-black text-[#0A0A0A] flex items-center gap-1.5">
                            {Icon && <Icon className="w-3.5 h-3.5 text-[#0A0A0A]/60" aria-hidden="true" />}
                            {title}
                        </h2>
                    )}
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}

/** The white card every list row and panel is built from. */
export function Card({
    children,
    interactive = false,
    className = '',
    onClick,
}: {
    children: ReactNode;
    interactive?: boolean;
    className?: string;
    onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`p-3.5 bg-white rounded-2xl border-[0.5px] border-[#0A0A0A]/15 space-y-2 ${
                interactive ? 'hover:border-[#0A0A0A]/30 transition-all cursor-pointer' : ''
            } ${className}`}
        >
            {children}
        </div>
    );
}

type Tone = 'lime' | 'success' | 'warning' | 'danger' | 'neutral';

const TONES: Record<Tone, { pill: string; dot: string }> = {
    lime: { pill: 'bg-[#C8FF00]/15 text-[#0A0A0A] border-[#C8FF00]/40', dot: 'bg-[#C8FF00]' },
    success: { pill: 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/25', dot: 'bg-[#2E7D32]' },
    warning: { pill: 'bg-[#FEF9E0] text-[#C87D00] border-[#C87D00]/30', dot: 'bg-[#C87D00]' },
    danger: { pill: 'bg-[#FDEDEC] text-[#D9381E] border-[#D9381E]/25', dot: 'bg-[#D9381E]' },
    neutral: { pill: 'bg-[#F6F8F5] text-[#0A0A0A]/60 border-[#0A0A0A]/10', dot: 'bg-[#0A0A0A]/30' },
};

/** Status pill with the leading dot the prototype uses on every event row. */
export function Pill({ tone = 'neutral', dot = true, children }: { tone?: Tone; dot?: boolean; children: ReactNode }) {
    const t = TONES[tone];

    return (
        <span
            className={`inline-flex items-center rounded-full border-[0.5px] whitespace-nowrap select-none font-arabic text-xs px-2.5 py-1 gap-1.5 font-bold ${t.pill}`}
        >
            {dot && <span aria-hidden="true" className={`w-2 h-2 rounded-full shrink-0 ${t.dot}`} />}
            <span>{children}</span>
        </span>
    );
}

/** The tinted strip a card uses for its money line. */
export function InsetRow({ children }: { children: ReactNode }) {
    return <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#F6F8F5] text-xs">{children}</div>;
}

/** Bottom meta line: timing on one end, the affordance on the other. */
export function MetaRow({ left, right }: { left?: ReactNode; right?: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-2 text-[11px] text-[#0A0A0A]/60 pt-0.5">
            <span className="min-w-0 truncate">{left}</span>
            {right && <span className="font-bold text-[#0A0A0A] shrink-0">{right}</span>}
        </div>
    );
}

/** The community/category line above a card's title. */
export function CardEyebrow({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
    return (
        <div className="flex items-center gap-1 text-[11px] text-[#0A0A0A]/60 mb-0.5">
            {icon && <span aria-hidden="true">{icon}</span>}
            <span className="truncate">{children}</span>
        </div>
    );
}

/** Card title — `font-black`, tight leading, never larger than `text-sm` in this portal. */
export function CardTitle({ children }: { children: ReactNode }) {
    return <h3 className="text-xs sm:text-sm font-black text-[#0A0A0A] leading-snug">{children}</h3>;
}

/** The ink hero panel the prototype uses for the one thing needing action now. */
export function HeroCard({ children }: { children: ReactNode }) {
    return <div className="p-4 sm:p-5 bg-[#0A0A0A] text-white rounded-2xl space-y-3">{children}</div>;
}
