import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Portal primitives, transcribed from the prototype's app screens.
 *
 * The portals share one grammar: a white header card at the top of every
 * screen, white `rounded-2xl` cards on the #F6F8F5 ground, 0.5px hairlines
 * for every edge, and a lime pill for the one primary action. Writing that
 * per screen is how the previous frontend drifted to 131 off-palette values,
 * so it lives here once.
 */

/* ── Surfaces ───────────────────────────────────────────────────────────── */

export const CARD = 'bg-surface rounded-2xl border-[0.5px] border-ink/10';

export function Card({
    children,
    className = '',
    padding = 'p-4',
    id,
}: {
    children: ReactNode;
    className?: string;
    padding?: string;
    /** مرساة اختيارية — يقصدها رابط من شاشة أخرى فيهبط عند القسم لا فوقه. */
    id?: string;
}) {
    return (
        <div id={id} className={`${CARD} ${padding} ${className}`}>
            {children}
        </div>
    );
}

/** The header card every portal screen opens on. */
export function PageHeader({
    icon: Icon,
    title,
    badge,
    subtitle,
    actions,
}: {
    icon?: LucideIcon;
    title: string;
    /** A count that belongs to the title — «7 موظفاً مسجلاً» — not a status. */
    badge?: string;
    subtitle?: string;
    actions?: ReactNode;
}) {
    return (
        <div
            className={`flex flex-col justify-between gap-4 sm:flex-row sm:items-center ${CARD} p-5`}
        >
            <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                    {Icon && (
                        <Icon
                            className="h-5 w-5 shrink-0 text-ink"
                            aria-hidden="true"
                        />
                    )}
                    <h1 className="min-w-0 text-lg font-extrabold text-ink sm:text-xl">
                        {title}
                    </h1>
                    {badge && (
                        <span className="shrink-0 rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-lime">
                            {badge}
                        </span>
                    )}
                </div>
                {subtitle && (
                    <p className="text-xs leading-relaxed text-ink/60">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                /*
                 * `shrink-0` بلا التفاف كان يدفع أزرار الترويسة خارج الشاشة على
                 * الهاتف، فيتمدّد المستند كله ويظهر شريط تمرير أفقي في كل صفحة
                 * لها أكثر من زر. الالتفاف على العرض الصغير، وعدم الانكماش من
                 * `sm` فصاعداً حيث يتّسع السطر أصلاً.
                 */
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}

/** A titled block inside a card — the prototype's `flex justify-between` row. */
export function CardTitle({
    children,
    aside,
}: {
    children: ReactNode;
    aside?: ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-ink">{children}</span>
            {aside}
        </div>
    );
}

/** A single figure: label above, mono value below. */
export function StatCard({
    label,
    value,
    hint,
    tone = 'ink',
}: {
    label: string;
    value: ReactNode;
    hint?: string;
    tone?: 'ink' | 'success' | 'warning' | 'danger';
}) {
    const tones = {
        ink: 'text-ink',
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
    };

    return (
        <div className={`${CARD} space-y-1 p-4`}>
            <span className="block text-[11px] font-bold text-ink/50">
                {label}
            </span>
            <span
                className={`block font-mono text-xl font-black ${tones[tone]}`}
            >
                {value}
            </span>
            {hint && (
                <span className="block text-[11px] text-ink/45">{hint}</span>
            )}
        </div>
    );
}

/* ── Status ─────────────────────────────────────────────────────────────── */

export type BadgeTone =
    | 'neutral'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'lead'
    | 'lime';

const BADGE_TONES: Record<BadgeTone, string> = {
    neutral: 'bg-ink/5 text-ink/70 border-ink/10',
    success: 'bg-success-tint text-success border-success/25',
    warning: 'bg-warning-tint text-warning border-warning/25',
    danger: 'bg-danger-tint text-danger border-danger/25',
    info: 'bg-info-tint text-info border-info/25',
    lead: 'bg-lead-tint text-lead border-lead/25',
    lime: 'bg-lime/20 text-ink border-lime/40',
};

export function Badge({
    tone = 'neutral',
    icon: Icon,
    children,
}: {
    tone?: BadgeTone;
    icon?: LucideIcon;
    children: ReactNode;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border-[0.5px] px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${BADGE_TONES[tone]}`}
        >
            {Icon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
            {children}
        </span>
    );
}

/** An amount in ريال — always mono, always with the unit. */
export function Money({
    amount,
    className = '',
}: {
    amount: number | string | null | undefined;
    className?: string;
}) {
    const value = Number(amount ?? 0);

    return (
        <span className={`font-mono font-bold whitespace-nowrap ${className}`}>
            {value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}{' '}
            <span className="text-[0.85em] font-normal opacity-70">ر.س</span>
        </span>
    );
}

/**
 * The prototype's side-ruled note. Used wherever a screen states a rule the
 * user is expected to act on rather than a value they can change.
 */
export function Note({
    tone = 'ink',
    title,
    children,
}: {
    tone?: 'ink' | 'info' | 'warning' | 'danger';
    title?: string;
    children: ReactNode;
}) {
    const tones = {
        ink: 'border-r-ink bg-ink/5 text-ink',
        info: 'border-r-info bg-info-tint text-ink',
        warning: 'border-r-warning bg-warning-tint text-ink',
        danger: 'border-r-danger bg-danger-tint text-ink',
    };

    return (
        <div
            role="note"
            className={`rounded-xl border-[0.5px] border-r-[3px] border-ink/10 p-3.5 sm:p-4 ${tones[tone]}`}
        >
            <div className="space-y-1 text-xs leading-relaxed">
                {title && <h5 className="font-extrabold">{title}</h5>}
                <div className="font-medium text-ink/85">{children}</div>
            </div>
        </div>
    );
}

/* ── Actions ────────────────────────────────────────────────────────────── */

const BUTTON_BASE =
    'inline-flex items-center justify-center gap-2 font-bold rounded-full transition-colors duration-150 cursor-pointer ' +
    'select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';

const BUTTON_TONES = {
    primary: 'bg-lime text-ink border-[0.5px] border-lime hover:bg-lime-hover',
    ink: 'bg-ink text-white border-[0.5px] border-ink hover:bg-[#1a1a1a]',
    soft: 'bg-ink/5 text-ink border-[0.5px] border-ink/10 hover:bg-ink/10 rounded-xl',
    danger: 'bg-danger-tint text-danger border-[0.5px] border-danger/25 hover:bg-danger/15 rounded-xl',
} as const;

const BUTTON_SIZES = {
    sm: 'text-xs px-3.5 py-2',
    md: 'text-sm px-5 py-2.5',
} as const;

export type ButtonTone = keyof typeof BUTTON_TONES;

export function Button({
    tone = 'primary',
    size = 'sm',
    icon: Icon,
    className = '',
    children,
    ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: ButtonTone;
    size?: keyof typeof BUTTON_SIZES;
    icon?: LucideIcon;
}) {
    return (
        <button
            {...rest}
            className={`${BUTTON_BASE} ${BUTTON_TONES[tone]} ${BUTTON_SIZES[size]} ${className}`}
        >
            {Icon && (
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            {children}
        </button>
    );
}

/** The same shapes as an Inertia link. */
export function ButtonLink({
    href,
    tone = 'primary',
    size = 'sm',
    icon: Icon,
    className = '',
    children,
}: {
    href: string;
    tone?: ButtonTone;
    size?: keyof typeof BUTTON_SIZES;
    icon?: LucideIcon;
    className?: string;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`${BUTTON_BASE} ${BUTTON_TONES[tone]} ${BUTTON_SIZES[size]} ${className}`}
        >
            {Icon && (
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            {children}
        </Link>
    );
}

/** A square glyph button for a row's inline actions. */
export function IconButton({
    icon: Icon,
    label,
    tone = 'soft',
    ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: LucideIcon;
    label: string;
    tone?: 'soft' | 'danger';
}) {
    const tones = {
        soft: 'bg-ink/5 hover:bg-ink/10 text-ink',
        danger: 'bg-danger-tint hover:bg-danger/15 text-danger',
    };

    return (
        <button
            {...rest}
            type="button"
            title={label}
            aria-label={label}
            className={`cursor-pointer rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
        >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
    );
}

/* ── Tables ─────────────────────────────────────────────────────────────── */

export function TableShell({ children }: { children: ReactNode }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">{children}</table>
        </div>
    );
}

export function Thead({ children }: { children: ReactNode }) {
    return (
        <thead>
            <tr className="border-b-[0.5px] border-ink/10 bg-ink/[0.02] font-bold text-ink/60">
                {children}
            </tr>
        </thead>
    );
}

export function Tbody({ children }: { children: ReactNode }) {
    return <tbody className="divide-y-[0.5px] divide-ink/10">{children}</tbody>;
}

export function Tr({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <tr className={`transition-colors hover:bg-ink/[0.02] ${className}`}>
            {children}
        </tr>
    );
}

export function Th({
    children,
    className = '',
}: {
    children?: ReactNode;
    className?: string;
}) {
    return <th className={`p-3 font-bold ${className}`}>{children}</th>;
}

export function Td({
    children,
    className = '',
    dir,
}: {
    children?: ReactNode;
    className?: string;
    dir?: 'ltr' | 'rtl';
}) {
    return (
        <td dir={dir} className={`p-3 align-top ${className}`}>
            {children}
        </td>
    );
}

/* ── Forms ──────────────────────────────────────────────────────────────── */

export const INPUT =
    'w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface text-ink ' +
    'focus:outline-none focus:border-ink transition-colors';

export function Field({
    label,
    htmlFor,
    error,
    hint,
    required = false,
    children,
}: {
    label: string;
    htmlFor?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label
                htmlFor={htmlFor}
                className="block text-xs font-extrabold text-ink"
            >
                {label} {required && <span className="text-danger">*</span>}
            </label>
            {children}
            {hint && !error && (
                <p className="text-[11px] text-ink/50">{hint}</p>
            )}
            {error && (
                <p className="text-[11px] font-bold text-danger">{error}</p>
            )}
        </div>
    );
}
