import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Marketing page primitives, transcribed from the prototype's own DOM.
 *
 * Every band on the public site is the same shape: a decorative ring bleeding
 * off one corner, an uppercase eyebrow at tracking-[2.5px], an h2, a lede at
 * leading-[1.8], then a card grid. Writing that per page is how the first
 * attempt drifted, so it lives here once — and the class strings below are the
 * prototype's, not an approximation of them.
 */

export const SHELL =
    'max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10';
export const BAND = 'relative py-12 md:py-16 lg:py-[72px] overflow-hidden';

/** Grounds a section can sit on. Anything else is off-palette. */
export type Ground = 'ink' | 'page' | 'surface' | 'sand';

const GROUND: Record<Ground, string> = {
    ink: 'bg-ink text-white',
    page: 'bg-page text-ink',
    surface: 'bg-surface text-ink',
    sand: 'bg-sand text-ink',
};

export function isDark(ground: Ground) {
    return ground === 'ink';
}

/** The big ring a band carries — a thick lime outline bleeding off one edge. */
export function Ring({
    position,
    size = 500,
}: {
    position: string;
    size?: 500 | 600;
}) {
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute h-96 w-96 rounded-full border-[20px] border-lime/[0.05] sm:border-[32px] ${
                size === 600
                    ? 'sm:h-[600px] sm:w-[600px]'
                    : 'sm:h-[500px] sm:w-[500px]'
            } ${position}`}
        />
    );
}

/** The smaller, fainter ring heroes and closing bands use in their corners. */
export function CornerRing({ position }: { position: string }) {
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute h-80 w-80 rounded-full border-[24px] border-lime/[0.04] ${position}`}
        />
    );
}

/** Lime on a dark ground, full ink on a light one. There is no muted variant. */
export function Eyebrow({
    tone = 'ink',
    children,
}: {
    tone?: 'lime' | 'ink';
    children: ReactNode;
}) {
    return (
        <span
            className={`mb-3 inline-block font-sans text-[11px] font-extrabold tracking-[2.5px] uppercase select-none ${
                tone === 'lime' ? 'text-lime' : 'text-ink'
            }`}
        >
            {children}
        </span>
    );
}

export function SectionHead({
    eyebrow,
    title,
    lede,
    dark = false,
    center = false,
    /** The home page runs its headings two pixels larger than the sub-pages do. */
    big = false,
    ledeSize = 'base',
}: {
    eyebrow?: string;
    title: string;
    lede?: string;
    dark?: boolean;
    center?: boolean;
    big?: boolean;
    ledeSize?: 'base' | 'lg' | '17';
}) {
    const ledeScale = {
        base: 'text-base',
        lg: 'text-base sm:text-lg',
        '17': 'text-base sm:text-[17px]',
    }[ledeSize];

    return (
        <div
            className={`max-w-[640px] space-y-3 ${center ? 'mx-auto text-center' : ''}`}
        >
            {eyebrow && (
                <Eyebrow tone={dark ? 'lime' : 'ink'}>{eyebrow}</Eyebrow>
            )}
            <h2
                className={`text-2xl sm:text-3xl ${big ? 'lg:text-[36px]' : 'lg:text-[34px]'} font-arabic font-extrabold ${
                    dark ? 'text-white' : 'text-ink'
                }`}
            >
                {title}
            </h2>
            {lede && (
                <p
                    className={`${dark ? 'text-white/80' : 'text-ink/80'} ${ledeScale} leading-[1.8]`}
                >
                    {lede}
                </p>
            )}
        </div>
    );
}

/** A band: ground, optional ring, and the standard vertical rhythm. */
export function Band({
    ground,
    ring,
    ringSize,
    borderTop = false,
    borderBottom = false,
    gap = 12,
    children,
}: {
    ground: Ground;
    ring?: string;
    ringSize?: 500 | 600;
    borderTop?: boolean;
    borderBottom?: boolean;
    gap?: 8 | 10 | 12;
    children: ReactNode;
}) {
    const dark = isDark(ground);
    const edge = dark ? 'border-white/10' : 'border-ink/10';
    const edges = [
        borderTop ? `border-t-[0.5px] ${edge}` : '',
        borderBottom ? `border-b-[0.5px] ${edge}` : '',
    ].join(' ');
    const gaps = { 8: 'space-y-8', 10: 'space-y-10', 12: 'space-y-12' };

    return (
        <section className={`${BAND} ${GROUND[ground]} ${edges}`}>
            {ring && <Ring position={ring} size={ringSize} />}
            <div className={SHELL}>
                <div className={gaps[gap]}>{children}</div>
            </div>
        </section>
    );
}

/** The prototype's feature card: 48px solid lime disc, title, body. */
export function FeatureCard({
    icon: Icon,
    title,
    body,
    dark = false,
}: {
    icon?: LucideIcon;
    title: string;
    body: string;
    dark?: boolean;
}) {
    return (
        <div
            className={`relative space-y-4 overflow-hidden rounded-[16px] border-[0.5px] p-6 transition-colors duration-150 sm:p-7 ${
                dark
                    ? 'border-white/10 bg-panel'
                    : 'border-ink/10 bg-surface text-ink'
            }`}
        >
            {Icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime">
                    <Icon className="h-6 w-6 text-ink" aria-hidden="true" />
                </div>
            )}
            <h3
                className={`font-arabic text-lg font-bold sm:text-xl ${dark ? 'text-white' : 'text-ink'}`}
            >
                {title}
            </h3>
            <p
                className={`text-sm leading-relaxed sm:text-base ${dark ? 'text-white/70' : 'text-ink/70'}`}
            >
                {body}
            </p>
        </div>
    );
}

/**
 * Dark-band card whose icon sits in a lime ring rather than a solid disc — the
 * shape the prototype reserves for "here is how we guarantee this" sections.
 */
export function RingCard({
    icon: Icon,
    title,
    body,
}: {
    icon: LucideIcon;
    title: string;
    body: string;
}) {
    return (
        <div className="space-y-3 rounded-[16px] border-[0.5px] border-white/10 bg-[#111111] p-6 sm:p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-[0.5px] border-lime/30 bg-lime/15 text-lime">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-arabic text-lg font-bold text-white sm:text-xl">
                {title}
            </h3>
            <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                {body}
            </p>
        </div>
    );
}

/** Light-band card with a 40px ink disc carrying a lime glyph. */
export function InkIconCard({
    icon: Icon,
    title,
    body,
}: {
    icon: LucideIcon;
    title: string;
    body: string;
}) {
    return (
        <div className="relative space-y-3 overflow-hidden rounded-[16px] border-[0.5px] border-ink/10 bg-surface p-6 text-ink transition-colors duration-150 sm:p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-lime">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-arabic text-lg font-bold text-ink sm:text-xl">
                {title}
            </h3>
            <p className="text-sm leading-relaxed text-ink/70 sm:text-base">
                {body}
            </p>
        </div>
    );
}

/** The quietest card: a tinted disc, an ink glyph, and smaller copy. */
export function SoftIconCard({
    icon: Icon,
    title,
    body,
}: {
    icon: LucideIcon;
    title: string;
    body: string;
}) {
    return (
        <div className="space-y-3 rounded-[16px] border-[0.5px] border-ink/10 bg-surface p-6 sm:p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-[0.5px] border-ink/10 bg-page text-ink">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-arabic text-lg font-bold text-ink">{title}</h3>
            <p className="text-sm leading-relaxed text-ink/70">{body}</p>
        </div>
    );
}

/** Light-band card led by a number instead of an icon. */
export function NumberCard({
    num,
    title,
    body,
}: {
    num: string;
    title: string;
    body: string;
}) {
    return (
        <div className="relative space-y-3 overflow-hidden rounded-[16px] border-[0.5px] border-ink/10 bg-surface p-6 text-ink transition-colors duration-150 sm:p-7">
            <span className="block font-sans text-xl font-extrabold text-ink">
                {num}
            </span>
            <h3 className="font-arabic text-lg font-bold text-ink sm:text-xl">
                {title}
            </h3>
            <p className="text-sm leading-relaxed text-ink/70 sm:text-base">
                {body}
            </p>
        </div>
    );
}

/**
 * A step in a four-across flow: a large lime numeral with a lime dot opposite.
 * The same card serves the home page (light) and the provider journey (dark).
 */
export function StepFlowCard({
    num,
    title,
    body,
    dark = false,
}: {
    num: string;
    title: string;
    body: string;
    dark?: boolean;
}) {
    return (
        <div
            className={`relative flex flex-col justify-between rounded-[16px] border-[0.5px] p-6 transition-colors sm:p-7 ${
                dark
                    ? 'border-white/10 bg-[#111111] text-white hover:border-lime/40'
                    : 'border-ink/10 bg-surface text-ink hover:border-ink/30'
            }`}
        >
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <span className="font-sans text-2xl font-extrabold text-lime">
                        {num}
                    </span>
                    <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full bg-lime"
                    />
                </div>
                <h3
                    className={`mb-3 font-arabic text-lg font-bold sm:text-xl ${dark ? 'text-white' : 'text-ink'}`}
                >
                    {title}
                </h3>
                <p
                    className={`text-sm leading-relaxed sm:text-[15px] ${dark ? 'text-white/70' : 'text-ink/70'}`}
                >
                    {body}
                </p>
            </div>
        </div>
    );
}

/**
 * A vertical timeline of numbered steps — the shape the prototype uses for its
 * three journeys. The lime rail runs behind the discs, inset from the start
 * edge so it threads them rather than sitting beside them.
 */
export function StepTimeline({ steps }: { steps: [string, string][] }) {
    return (
        <div className="relative space-y-6 sm:space-y-8">
            <div
                aria-hidden="true"
                className="absolute top-6 right-6 bottom-6 -z-0 w-[2px] bg-lime/40 sm:right-7"
            />
            {steps.map(([title, body], i) => (
                <div
                    key={title}
                    className="group relative z-10 flex items-start gap-4 sm:gap-6"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[0.5px] border-ink bg-ink font-sans text-sm font-extrabold text-lime select-none sm:h-14 sm:w-14 sm:text-base">
                        {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 rounded-[16px] border-[0.5px] border-ink/10 bg-surface p-5 text-ink transition-colors group-hover:border-ink/30 sm:p-6">
                        <h3 className="mb-2 font-arabic text-lg font-bold text-ink sm:text-xl">
                            {title}
                        </h3>
                        <p className="text-sm leading-relaxed text-ink/70 sm:text-base">
                            {body}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * A split band: a headline column beside a numbered list of rules. The
 * prototype uses this wherever the point is "here is the set of things you
 * control", rather than a grid of equal features.
 */
export function SplitRules({
    head,
    rules,
    dark = false,
}: {
    head: ReactNode;
    rules: string[];
    dark?: boolean;
}) {
    return (
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">{head}</div>
            <div className="space-y-4 lg:col-span-7">
                {rules.map((rule, i) => (
                    <div
                        key={rule}
                        className={`flex items-start gap-4 rounded-[16px] border-[0.5px] p-5 sm:p-6 ${
                            dark
                                ? 'border-white/10 bg-[#111111]'
                                : 'border-ink/10 bg-surface'
                        }`}
                    >
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime font-sans text-xs font-extrabold text-ink">
                            {String(i + 1).padStart(2, '0')}
                        </div>
                        <p
                            className={`text-sm leading-relaxed sm:text-base ${dark ? 'text-white/85' : 'text-ink/80'}`}
                        >
                            {rule}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** A row of ticked statements — the provider page's category list. */
export function CheckRow({
    icon: Icon,
    children,
}: {
    icon: LucideIcon;
    children: ReactNode;
}) {
    return (
        <div className="flex items-center gap-3 rounded-[12px] border-[0.5px] border-ink/10 bg-surface p-4 sm:p-5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-lime">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold text-ink sm:text-base">
                {children}
            </span>
        </div>
    );
}

/** The page-opening hero used by every screen except home. */
export function PageHero({
    eyebrow,
    title,
    lede,
    actions,
    ring = '-top-24 -left-24',
    tight = false,
}: {
    eyebrow: string;
    title: string;
    lede?: string;
    actions?: ReactNode;
    ring?: string;
    /** The contact hero sits a little closer to the form below it. */
    tight?: boolean;
}) {
    return (
        <section
            className={`bg-ink pt-36 text-white ${tight ? 'pb-16' : 'pb-20'} relative overflow-hidden border-b-[0.5px] border-white/10 px-4 sm:px-6 lg:px-8`}
        >
            <CornerRing position={ring} />
            <div className="relative z-10 mx-auto max-w-[1120px]">
                <div className="max-w-[740px] space-y-4">
                    <Eyebrow tone="lime">{eyebrow}</Eyebrow>
                    <h1 className="font-arabic text-3xl leading-tight font-extrabold text-white sm:text-4xl md:text-5xl">
                        {title}
                    </h1>
                    {lede && (
                        <p className="pt-1 text-base leading-[1.8] text-white/80 sm:text-lg">
                            {lede}
                        </p>
                    )}
                    {actions && (
                        <div className="flex flex-col items-stretch gap-4 pt-4 sm:flex-row sm:items-center">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

const BUTTON_BASE =
    'inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors duration-150 select-none ' +
    'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime disabled:opacity-50 ' +
    'disabled:cursor-not-allowed text-[16px] py-3.5 px-7 font-bold';

const BUTTON_TONE = {
    solid: 'bg-lime text-ink border-[0.5px] border-lime hover:bg-lime-hover hover:border-lime-hover active:opacity-90',
    outline:
        'bg-transparent text-lime border-[0.5px] border-lime hover:bg-lime/10 active:bg-lime/20',
} as const;

/** Lime pill CTA, and its outlined sibling. */
export function CtaButton({
    href,
    children,
    variant = 'solid',
    block = false,
}: {
    href: string;
    children: ReactNode;
    variant?: 'solid' | 'outline';
    block?: boolean;
}) {
    return (
        <a
            href={href}
            className={`${BUTTON_BASE} ${BUTTON_TONE[variant]} ${block ? 'w-full sm:w-auto' : ''}`}
        >
            {children}
        </a>
    );
}

/** The same pill, as a form submit. */
export function SubmitButton({
    children,
    disabled = false,
}: {
    children: ReactNode;
    disabled?: boolean;
}) {
    return (
        <button
            type="submit"
            disabled={disabled}
            className={`${BUTTON_BASE} ${BUTTON_TONE.solid} w-full sm:w-auto`}
        >
            {children}
        </button>
    );
}

/* ── Forms ──────────────────────────────────────────────────────────────── */

export const FIELD =
    'w-full px-4 py-3 rounded-[10px] bg-page text-ink border-[0.5px] border-ink/15 text-sm focus:bg-surface transition-colors';

export function Label({
    htmlFor,
    children,
    required = false,
}: {
    htmlFor: string;
    children: string;
    required?: boolean;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-2 block text-sm font-bold text-ink"
        >
            {children} {required && <span className="text-danger">*</span>}
        </label>
    );
}

/**
 * The closing band every page ends on: a panel inside a ringed ink section,
 * headline on one side and the action on the other.
 */
export function ClosingBand({
    title,
    cta = 'اطلب عرضاً',
    href = '/contact',
}: {
    title: string;
    cta?: string;
    href?: string;
}) {
    return (
        <section className="relative overflow-hidden border-t-[0.5px] border-b-[0.5px] border-white/10 bg-ink py-16 text-white sm:py-20">
            <CornerRing position="-bottom-24 -left-24" />
            <CornerRing position="-top-24 -right-24" />
            <div className="relative z-10 mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-start justify-between gap-8 rounded-[16px] border-[0.5px] border-white/10 bg-[#111111] p-8 sm:p-12 md:flex-row md:items-center">
                    <div className="max-w-[640px] space-y-3">
                        <Eyebrow tone="lime">الخطوة القادمة</Eyebrow>
                        <h2 className="font-arabic text-2xl leading-tight font-extrabold text-white sm:text-3xl lg:text-[34px]">
                            {title}
                        </h2>
                    </div>
                    <div className="w-full shrink-0 sm:w-auto">
                        <CtaButton href={href} block>
                            {cta}
                        </CtaButton>
                    </div>
                </div>
            </div>
        </section>
    );
}
