import { Link, usePage } from '@inertiajs/react';
import { CircleAlert, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { BrandLockup } from '@/components/brand';
import type { SharedProps } from '@/types';

/**
 * The two doors, from the prototype's auth screens.
 *
 * `customer` is the light one every employee, leader, account manager and
 * provider comes through. `internal` is the ink one for Teamat's own staff —
 * it looks different on purpose: «حساب واحد هنا يكفي للوصول إلى كل الأموال».
 */
export default function AuthLayout({
    variant = 'customer',
    title,
    subtitle,
    eyebrow,
    children,
    footer,
}: {
    variant?: 'customer' | 'internal';
    title: string;
    subtitle?: ReactNode;
    /** The lime pill above the title, on the internal door. */
    eyebrow?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
}) {
    const internal = variant === 'internal';

    // The auth controllers redirect with an explanation — «انتهت صلاحية رابط
    // الدعوة…», «انتهت صلاحية الجلسة…» — and there is no portal shell here to
    // toast it, so the door itself has to say why it turned someone away.
    const { flash } = usePage<SharedProps>().props;
    const notice = flash?.error ?? (flash?.status && flash.status !== 'otp-sent' ? flash.status : null);
    const isError = Boolean(flash?.error);

    return (
        <div
            className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-arabic relative overflow-hidden ${
                internal ? 'bg-ink text-white' : 'bg-page text-ink'
            }`}
        >
            {internal && (
                <div
                    aria-hidden="true"
                    className="absolute -top-32 -left-32 w-96 h-96 rounded-full border-[28px] border-lime/10 pointer-events-none"
                />
            )}

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4 relative z-10">
                <Link href="/" className="inline-block" aria-label="الصفحة الرئيسية لمنصة تيمات">
                    <BrandLockup size={36} tone={internal ? 'white' : 'ink'} />
                </Link>

                <div>
                    {eyebrow}
                    <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${internal ? 'text-white' : 'text-ink'}`}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p className={`text-xs sm:text-sm mt-1 ${internal ? 'text-white/60' : 'text-ink/60'}`}>{subtitle}</p>
                    )}
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
                <div
                    className={`py-8 px-6 sm:px-8 rounded-2xl border-[0.5px] space-y-6 ${
                        internal ? 'bg-panel border-white/15' : 'bg-surface border-ink/15'
                    }`}
                >
                    {notice && (
                        <div
                            role={isError ? 'alert' : 'status'}
                            className={`p-3.5 rounded-xl border-[0.5px] flex items-start gap-2.5 text-xs font-bold ${
                                isError
                                    ? 'bg-danger-tint border-danger/30 text-danger'
                                    : 'bg-success-tint border-success/30 text-success'
                            }`}
                        >
                            {isError ? (
                                <CircleAlert className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
                            ) : (
                                <Info className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
                            )}
                            <span className="leading-relaxed">{notice}</span>
                        </div>
                    )}

                    {children}
                </div>

                {footer && <div className="text-center mt-4">{footer}</div>}
            </div>
        </div>
    );
}

/** The pill above the internal door's title. */
export function AuthEyebrow({ children }: { children: ReactNode }) {
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime/20 text-lime border-[0.5px] border-lime/40 text-xs font-bold mb-2">
            {children}
        </div>
    );
}

/** The submit pill both doors use. */
export function AuthSubmit({ children, disabled = false }: { children: ReactNode; disabled?: boolean }) {
    return (
        <button
            type="submit"
            disabled={disabled}
            className="inline-flex items-center justify-center gap-2.5 font-bold rounded-full transition-colors duration-150 cursor-pointer select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime disabled:opacity-50 disabled:cursor-not-allowed bg-lime text-ink border-[0.5px] border-lime hover:bg-lime-hover text-base px-6 py-3 h-12 w-full"
        >
            {children}
        </button>
    );
}

/** A labelled field on the customer door. */
export function AuthField({
    label,
    htmlFor,
    hint,
    error,
    dark = false,
    children,
}: {
    label: string;
    htmlFor?: string;
    hint?: string;
    error?: string;
    dark?: boolean;
    children: ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <div className={`flex items-center justify-between text-xs font-extrabold ${dark ? 'text-white/90' : 'text-ink'}`}>
                <label htmlFor={htmlFor}>{label}</label>
                {hint && <span className={`text-[11px] font-mono ${dark ? 'text-white/50' : 'text-ink/50'}`}>{hint}</span>}
            </div>
            {children}
            {error && <p className="text-[11px] font-bold text-danger">{error}</p>}
        </div>
    );
}

const AUTH_INPUT_BASE =
    'w-full p-3 rounded-xl border-[0.5px] border-ink/20 font-bold text-ink bg-surface ' +
    'placeholder-ink/30 focus:outline-none focus:border-ink transition-colors';

/** Names and free text — Arabic, at reading size. */
export const AUTH_INPUT_LIGHT = `${AUTH_INPUT_BASE} text-sm font-arabic`;

/**
 * Phones, emails and codes. These are read digit by digit and compared against
 * something the user is holding, so they get the tabular face — and never the
 * Arabic one, which would render Latin digits unevenly.
 */
export const AUTH_INPUT_MONO = `${AUTH_INPUT_BASE} text-base font-mono`;

export const AUTH_INPUT_DARK =
    'w-full p-3 rounded-xl border-[0.5px] border-white/20 text-sm text-white bg-white/5 ' +
    'placeholder-white/30 focus:border-lime focus:ring-1 focus:ring-lime focus:outline-none transition-colors';
