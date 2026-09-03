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

export const SHELL = 'max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10';
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
export function Ring({ position, size = 500 }: { position: string; size?: 500 | 600 }) {
    return (
        <div
            aria-hidden="true"
            className={`absolute rounded-full border-[20px] sm:border-[32px] border-lime/[0.05] pointer-events-none w-96 h-96 ${
                size === 600 ? 'sm:w-[600px] sm:h-[600px]' : 'sm:w-[500px] sm:h-[500px]'
            } ${position}`}
        />
    );
}

/** The smaller, fainter ring heroes and closing bands use in their corners. */
export function CornerRing({ position }: { position: string }) {
    return (
        <div
            aria-hidden="true"
            className={`absolute w-80 h-80 rounded-full border-[24px] border-lime/[0.04] pointer-events-none ${position}`}
        />
    );
}

/** Lime on a dark ground, full ink on a light one. There is no muted variant. */
export function Eyebrow({ tone = 'ink', children }: { tone?: 'lime' | 'ink'; children: ReactNode }) {
    return (
        <span
            className={`inline-block font-sans text-[11px] font-extrabold uppercase tracking-[2.5px] mb-3 select-none ${
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
    const ledeScale = { base: 'text-base', lg: 'text-base sm:text-lg', '17': 'text-base sm:text-[17px]' }[ledeSize];

    return (
        <div className={`max-w-[640px] space-y-3 ${center ? 'mx-auto text-center' : ''}`}>
            {eyebrow && <Eyebrow tone={dark ? 'lime' : 'ink'}>{eyebrow}</Eyebrow>}
            <h2
                className={`text-2xl sm:text-3xl ${big ? 'lg:text-[36px]' : 'lg:text-[34px]'} font-extrabold font-arabic ${
                    dark ? 'text-white' : 'text-ink'
                }`}
            >
                {title}
            </h2>
            {lede && <p className={`${dark ? 'text-white/80' : 'text-ink/80'} ${ledeScale} leading-[1.8]`}>{lede}</p>}
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
    const edges = [borderTop ? `border-t-[0.5px] ${edge}` : '', borderBottom ? `border-b-[0.5px] ${edge}` : ''].join(' ');
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
            className={`rounded-[16px] transition-colors duration-150 relative overflow-hidden border-[0.5px] p-6 sm:p-7 space-y-4 ${
                dark ? 'bg-panel border-white/10' : 'bg-surface text-ink border-ink/10'
            }`}
        >
            {Icon && (
                <div className="w-12 h-12 rounded-full bg-lime flex items-center justify-center">
                    <Icon className="w-6 h-6 text-ink" aria-hidden="true" />
                </div>
            )}
            <h3 className={`text-lg sm:text-xl font-bold font-arabic ${dark ? 'text-white' : 'text-ink'}`}>{title}</h3>
            <p className={`text-sm sm:text-base leading-relaxed ${dark ? 'text-white/70' : 'text-ink/70'}`}>{body}</p>
        </div>
    );
}

/**
 * Dark-band card whose icon sits in a lime ring rather than a solid disc — the
 * shape the prototype reserves for "here is how we guarantee this" sections.
 */
export function RingCard({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
    return (
        <div className="p-6 sm:p-7 rounded-[16px] bg-[#111111] border-[0.5px] border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-full bg-lime/15 border-[0.5px] border-lime/30 flex items-center justify-center text-lime">
                <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-arabic text-white">{title}</h3>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed">{body}</p>
        </div>
    );
}

/** Light-band card with a 40px ink disc carrying a lime glyph. */
export function InkIconCard({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
    return (
        <div className="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-surface text-ink border-[0.5px] border-ink/10 p-6 sm:p-7 space-y-3">
            <div className="w-10 h-10 rounded-full bg-ink text-lime flex items-center justify-center">
                <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-arabic text-ink">{title}</h3>
            <p className="text-sm sm:text-base text-ink/70 leading-relaxed">{body}</p>
        </div>
    );
}

/** The quietest card: a tinted disc, an ink glyph, and smaller copy. */
export function SoftIconCard({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
    return (
        <div className="p-6 sm:p-7 rounded-[16px] bg-surface border-[0.5px] border-ink/10 space-y-3">
            <div className="w-10 h-10 rounded-full bg-page border-[0.5px] border-ink/10 flex items-center justify-center text-ink">
                <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold font-arabic text-ink">{title}</h3>
            <p className="text-sm text-ink/70 leading-relaxed">{body}</p>
        </div>
    );
}

/** Light-band card led by a number instead of an icon. */
export function NumberCard({ num, title, body }: { num: string; title: string; body: string }) {
    return (
        <div className="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-surface text-ink border-[0.5px] border-ink/10 p-6 sm:p-7 space-y-3">
            <span className="font-sans font-extrabold text-xl text-ink block">{num}</span>
            <h3 className="text-lg sm:text-xl font-bold font-arabic text-ink">{title}</h3>
            <p className="text-sm sm:text-base text-ink/70 leading-relaxed">{body}</p>
        </div>
    );
}

/**
 * A step in a four-across flow: a large lime numeral with a lime dot opposite.
 * The same card serves the home page (light) and the provider journey (dark).
 */
export function StepFlowCard({ num, title, body, dark = false }: { num: string; title: string; body: string; dark?: boolean }) {
    return (
        <div
            className={`p-6 sm:p-7 rounded-[16px] border-[0.5px] flex flex-col justify-between relative transition-colors ${
                dark ? 'bg-[#111111] text-white border-white/10 hover:border-lime/40' : 'bg-surface text-ink border-ink/10 hover:border-ink/30'
            }`}
        >
            <div>
                <div className="flex items-center justify-between mb-4">
                    <span className="font-sans font-extrabold text-2xl text-lime">{num}</span>
                    <span aria-hidden="true" className="w-2 h-2 rounded-full bg-lime" />
                </div>
                <h3 className={`text-lg sm:text-xl font-bold font-arabic mb-3 ${dark ? 'text-white' : 'text-ink'}`}>{title}</h3>
                <p className={`text-sm sm:text-[15px] leading-relaxed ${dark ? 'text-white/70' : 'text-ink/70'}`}>{body}</p>
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
            <div aria-hidden="true" className="absolute top-6 bottom-6 right-6 sm:right-7 w-[2px] bg-lime/40 -z-0" />
            {steps.map(([title, body], i) => (
                <div key={title} className="relative flex items-start gap-4 sm:gap-6 z-10 group">
                    <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-sans font-extrabold text-sm sm:text-base border-[0.5px] select-none bg-ink text-lime border-ink">
                        {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 p-5 sm:p-6 rounded-[16px] border-[0.5px] transition-colors bg-surface text-ink border-ink/10 group-hover:border-ink/30">
                        <h3 className="text-lg sm:text-xl font-bold font-arabic mb-2 text-ink">{title}</h3>
                        <p className="text-sm sm:text-base leading-relaxed text-ink/70">{body}</p>
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
export function SplitRules({ head, rules, dark = false }: { head: ReactNode; rules: string[]; dark?: boolean }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">{head}</div>
            <div className="lg:col-span-7 space-y-4">
                {rules.map((rule, i) => (
                    <div
                        key={rule}
                        className={`p-5 sm:p-6 rounded-[16px] border-[0.5px] flex items-start gap-4 ${
                            dark ? 'bg-[#111111] border-white/10' : 'bg-surface border-ink/10'
                        }`}
                    >
                        <div className="w-6 h-6 rounded-full bg-lime text-ink flex items-center justify-center shrink-0 mt-0.5 font-sans text-xs font-extrabold">
                            {String(i + 1).padStart(2, '0')}
                        </div>
                        <p className={`text-sm sm:text-base leading-relaxed ${dark ? 'text-white/85' : 'text-ink/80'}`}>{rule}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** A row of ticked statements — the provider page's category list. */
export function CheckRow({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
    return (
        <div className="p-4 sm:p-5 rounded-[12px] bg-surface border-[0.5px] border-ink/10 flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-ink text-lime flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span className="text-sm sm:text-base font-bold text-ink">{children}</span>
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
            className={`bg-ink text-white pt-36 ${tight ? 'pb-16' : 'pb-20'} px-4 sm:px-6 lg:px-8 border-b-[0.5px] border-white/10 relative overflow-hidden`}
        >
            <CornerRing position={ring} />
            <div className="max-w-[1120px] mx-auto relative z-10">
                <div className="max-w-[740px] space-y-4">
                    <Eyebrow tone="lime">{eyebrow}</Eyebrow>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-arabic text-white leading-tight">{title}</h1>
                    {lede && <p className="text-base sm:text-lg text-white/80 leading-[1.8] pt-1">{lede}</p>}
                    {actions && <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">{actions}</div>}
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
    outline: 'bg-transparent text-lime border-[0.5px] border-lime hover:bg-lime/10 active:bg-lime/20',
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
        <a href={href} className={`${BUTTON_BASE} ${BUTTON_TONE[variant]} ${block ? 'w-full sm:w-auto' : ''}`}>
            {children}
        </a>
    );
}

/** The same pill, as a form submit. */
export function SubmitButton({ children }: { children: ReactNode }) {
    return (
        <button type="submit" className={`${BUTTON_BASE} ${BUTTON_TONE.solid} w-full sm:w-auto`}>
            {children}
        </button>
    );
}

/* ── Forms ──────────────────────────────────────────────────────────────── */

export const FIELD =
    'w-full px-4 py-3 rounded-[10px] bg-page text-ink border-[0.5px] border-ink/15 text-sm focus:bg-surface transition-colors';

export function Label({ htmlFor, children, required = false }: { htmlFor: string; children: string; required?: boolean }) {
    return (
        <label htmlFor={htmlFor} className="block text-sm font-bold text-ink mb-2">
            {children} {required && <span className="text-danger">*</span>}
        </label>
    );
}

/**
 * The closing band every page ends on: a panel inside a ringed ink section,
 * headline on one side and the action on the other.
 */
export function ClosingBand({ title, cta = 'اطلب عرضاً', href = '/contact' }: { title: string; cta?: string; href?: string }) {
    return (
        <section className="bg-ink text-white py-16 sm:py-20 border-t-[0.5px] border-b-[0.5px] border-white/10 relative overflow-hidden">
            <CornerRing position="-bottom-24 -left-24" />
            <CornerRing position="-top-24 -right-24" />
            <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-[#111111] p-8 sm:p-12 rounded-[16px] border-[0.5px] border-white/10">
                    <div className="max-w-[640px] space-y-3">
                        <Eyebrow tone="lime">الخطوة القادمة</Eyebrow>
                        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white leading-tight font-arabic">{title}</h2>
                    </div>
                    <div className="shrink-0 w-full sm:w-auto">
                        <CtaButton href={href} block>
                            {cta}
                        </CtaButton>
                    </div>
                </div>
            </div>
        </section>
    );
}
