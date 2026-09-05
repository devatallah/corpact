import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    ChartColumn,
    Check,
    Clock,
    Flame,
    MapPin,
    Repeat,
    Shield,
    ShieldCheck,
    Users,
    Wallet,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    Band,
    ClosingBand,
    Eyebrow,
    FeatureCard,
    RingCard,
    SectionHead,
    SHELL,
    StepFlowCard,
} from '@/components/marketing/ui';
import MarketingLayout from '@/layouts/marketing-layout';

const STEPS: [string, string][] = [
    [
        'تفعيل الحساب',
        'الشركة تفتح حسابها وتحدد مسارها المالي وتدعو موظفيها عبر مسار دخول سريع برمز يصل عبر واتساب.',
    ],
    [
        'تكوّن المجتمعات',
        'الموظفون يحددون اهتماماتهم الفعلية وينضمّون تلقائياً إلى مجتمعات متخصصة داخل نطاق الشركة.',
    ],
    [
        'فعالية متكررة تلقائياً',
        'المجتمع يولّد فعاليته مع مزوّد الخدمة المناسب بجدول ثابت وتأكيد توفّر وتثبيت مسبق للسعر الإجمالي.',
    ],
    [
        'الحضور والقياس',
        'الحضور يُسجَّل تلقائياً عند اكتمال الفعالية، وتنعكس مؤشرات التفاعل مباشرة في لوحة متابعة الشركة.',
    ],
];

/**
 * المجتمعات الثلاثة التي يستعرضها المُنتقي فوق بطاقة البطل.
 *
 * The chips are the page's one interactive claim: the product turns an
 * interest into a community that meets on a schedule, so a preview that
 * cannot switch interest undercuts the sentence beside it. Each entry is a
 * complete card — venue, quorum and all — because switching swaps the whole
 * panel, not a title.
 */
type Community = {
    id: string;
    name: string;
    buttonLabel: string;
    emoji: string;
    specificDate: string;
    timeRange: string;
    venue: string;
    venueDistrict: string;
    membersCount: number;
    confirmed: number;
    capacity: number;
    leader: string;
    walletShare: string;
    closingIn: string;
};

const COMMUNITIES: Community[] = [
    {
        id: 'padel',
        name: 'مجتمع البادل',
        buttonLabel: 'بادل',
        emoji: '🎾',
        specificDate: 'الخميس، 28 أغسطس',
        timeRange: '08:00 م - 10:00 م',
        venue: 'بادل إن (Padel In)',
        venueDistrict: 'حي النرجس، الرياض',
        membersCount: 28,
        confirmed: 6,
        capacity: 8,
        leader: 'فهد السعيد',
        walletShare: 'مغطى من محفظة المجتمع',
        closingIn: 'متبقي 4 ساعات على الإغلاق',
    },
    {
        id: 'football',
        name: 'مجتمع كرة القدم',
        buttonLabel: 'كرة القدم',
        emoji: '⚽',
        specificDate: 'الأربعاء، 27 أغسطس',
        timeRange: '09:00 م - 11:00 م',
        venue: 'ملاعب النخبة الرياضية',
        venueDistrict: 'الدرعية، الرياض',
        membersCount: 34,
        confirmed: 10,
        capacity: 12,
        leader: 'سلطان الحربي',
        walletShare: 'مغطى من محفظة المجتمع',
        closingIn: 'متبقي مقعدان فقط',
    },
    {
        id: 'chess',
        name: 'مجتمع الشطرنج',
        buttonLabel: 'شطرنج',
        emoji: '♟️',
        specificDate: 'الثلاثاء، 26 أغسطس',
        timeRange: '06:30 م - 08:30 م',
        venue: 'كافيه وساحة ذا مايند',
        venueDistrict: 'حي الملقا، الرياض',
        membersCount: 16,
        confirmed: 4,
        capacity: 6,
        leader: 'م. ياسر العمري',
        walletShare: 'مغطى من محفظة المجتمع',
        closingIn: 'تأكيد الحضور متاح الآن',
    },
];

/**
 * One of the two financial tracks, as the home page presents them: a full-bleed
 * card with a badge, a "best for" panel, and three ticked points. The ink one
 * carries lime accents; the white one inverts them.
 */
function TrackCard({
    icon: Icon,
    badge,
    title,
    body,
    bestFor,
    points,
    dark,
}: {
    icon: LucideIcon;
    badge: string;
    title: string;
    body: string;
    bestFor: string;
    points: string[];
    dark: boolean;
}) {
    return (
        <div
            className={`relative flex flex-col justify-between overflow-hidden rounded-[16px] border-[0.5px] p-8 sm:p-10 ${
                dark
                    ? 'border-white/15 bg-ink text-white'
                    : 'border-ink/15 bg-surface text-ink'
            }`}
        >
            <div>
                <div className="mb-6 flex items-center justify-between">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${dark ? 'bg-lime text-ink' : 'bg-ink text-lime'}`}
                    >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span
                        className={`rounded-full border-[0.5px] px-3.5 py-1 font-sans text-[11px] font-extrabold tracking-[1.5px] uppercase ${
                            dark
                                ? 'border-lime/30 bg-white/10 text-lime'
                                : 'border-ink/20 bg-ink/5 text-ink'
                        }`}
                    >
                        {badge}
                    </span>
                </div>

                <h3
                    className={`mb-3 font-arabic text-2xl font-extrabold sm:text-3xl ${dark ? 'text-white' : 'text-ink'}`}
                >
                    {title}
                </h3>
                <p
                    className={`mb-6 text-base leading-relaxed ${dark ? 'text-white/70' : 'text-ink/70'}`}
                >
                    {body}
                </p>

                <div
                    className={`mb-6 rounded-[12px] border-[0.5px] p-4 ${dark ? 'border-white/10 bg-white/5' : 'border-ink/10 bg-page'}`}
                >
                    <span
                        className={`mb-1 block text-xs font-bold ${dark ? 'text-lime' : 'text-ink'}`}
                    >
                        الخيار الأمثل لـ:
                    </span>
                    <p
                        className={`text-xs leading-relaxed sm:text-sm ${dark ? 'text-white/80' : 'text-ink/80'}`}
                    >
                        {bestFor}
                    </p>
                </div>

                <ul className="mb-6 space-y-3">
                    {points.map((point) => (
                        <li
                            key={point}
                            className={`flex items-center gap-3 text-sm ${dark ? 'text-white/90' : 'text-ink/90'}`}
                        >
                            <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                    dark
                                        ? 'bg-lime text-ink'
                                        : 'bg-ink text-lime'
                                }`}
                            >
                                <Check
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                            </span>
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/** A ticked line on a dark panel. */
function TickedLine({ children }: { children: ReactNode }) {
    return (
        <li className="flex items-center gap-3 text-sm text-white/90 sm:text-base">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-ink">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span>{children}</span>
        </li>
    );
}

/**
 * بطاقة البطل: مُنتقي المجتمع، ثم بطاقة الفعالية القادمة الخاصة به.
 *
 * الحالتان الوحيدتان هنا: أي مجتمع مُختار، وهل ضغط الزائر «تأكيد الحضور».
 * تبديل المجتمع يُلغي التأكيد لأن التأكيد يخصّ فعالية بعينها، وعدّاد المقاعد
 * والنسبة يُشتقّان ولا يُخزَّنان حتى لا يفترقا عن الشريط الذي يمثّلانه.
 */
function HeroPreview() {
    const [activeId, setActiveId] = useState(COMMUNITIES[0].id);
    const [rsvped, setRsvped] = useState(false);

    const community =
        COMMUNITIES.find((entry) => entry.id === activeId) ?? COMMUNITIES[0];
    const confirmed = rsvped ? community.confirmed + 1 : community.confirmed;
    const percent = Math.round((confirmed / community.capacity) * 100);
    const remaining = community.capacity - confirmed;

    return (
        <div className="mx-auto w-full max-w-[500px] text-right font-arabic lg:mr-auto lg:ml-0">
            <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-ink/70">
                    استعراض المجتمعات والفعاليات:
                </span>
                <div
                    role="tablist"
                    aria-label="اختر مجتمعاً"
                    className="flex items-center gap-1.5 overflow-x-auto"
                >
                    {COMMUNITIES.map((entry) => {
                        const active = entry.id === community.id;

                        return (
                            <button
                                key={entry.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => {
                                    setActiveId(entry.id);
                                    // التأكيد يخصّ فعالية بعينها، فلا يُحمل معه إلى مجتمع آخر.
                                    setRsvped(false);
                                }}
                                className={`cursor-pointer rounded-full border-[0.5px] px-3 py-1 text-xs font-bold whitespace-nowrap transition-all ${
                                    active
                                        ? 'scale-[1.02] border-ink bg-ink font-extrabold text-lime shadow-sm'
                                        : 'border-ink/10 bg-surface/80 text-ink/70 hover:border-ink/30 hover:text-ink'
                                }`}
                            >
                                <span className="ml-1">{entry.emoji}</span>
                                <span>{entry.buttonLabel}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="relative pt-3 pb-1">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1.5 rounded-[28px] bg-lime/10 blur-md"
                />

                {/* Community strip, tucked behind the event panel */}
                <div className="relative z-10 mx-3 flex items-center justify-between gap-3 rounded-[18px] border-[0.5px] border-white/20 bg-[#161616] p-4 text-white shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime text-xl font-bold text-ink shadow-sm">
                            {community.emoji}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-extrabold text-white sm:text-base">
                                    {community.name}
                                </h2>
                                <span className="rounded-full border-[0.5px] border-lime/30 bg-lime/20 px-2 py-0.5 text-[10px] font-bold text-lime">
                                    نشط
                                </span>
                            </div>
                            <p className="pt-0.5 text-[11px] text-white/60">
                                {community.membersCount} موظفاً منضماً · الليدر:{' '}
                                {community.leader}
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 text-left">
                        <span className="flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-400">
                            <span
                                aria-hidden="true"
                                className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"
                            />
                            تأكيد تلقائي
                        </span>
                        <span className="block font-mono text-[11px] text-white/50">
                            {community.walletShare}
                        </span>
                    </div>
                </div>

                {/* The event panel itself */}
                <div className="relative z-20 -mt-2 space-y-4.5 rounded-[22px] border-[0.5px] border-white/20 bg-ink p-5 text-white shadow-2xl sm:p-6">
                    <div className="flex items-start justify-between gap-2 border-b-[0.5px] border-white/10 pb-3">
                        <div>
                            <span className="block font-sans text-[10px] font-extrabold tracking-wider text-lime uppercase">
                                UPCOMING EVENT · الفعالية القادمة
                            </span>
                            <h3 className="mt-0.5 text-base font-extrabold text-white sm:text-lg">
                                تأكيد حضور الجولة القادمة
                            </h3>
                        </div>
                        <span className="shrink-0 rounded-full border-[0.5px] border-lime/30 bg-lime/15 px-2.5 py-1 text-[11px] font-bold text-lime">
                            حجز مؤكد
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-[12px] border-[0.5px] border-white/10 bg-panel p-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-lime">
                                <Calendar
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                            </div>
                            <div>
                                <span className="block text-[10px] text-white/45">
                                    الموعد المحدد
                                </span>
                                <span className="text-xs font-bold text-white">
                                    {community.specificDate}
                                </span>
                                <span className="block font-mono text-[11px] text-lime">
                                    {community.timeRange}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-[12px] border-[0.5px] border-white/10 bg-panel p-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-lime">
                                <MapPin
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                            </div>
                            <div>
                                <span className="block text-[10px] text-white/45">
                                    المرفق والموقع
                                </span>
                                <span className="block truncate text-xs font-bold text-white">
                                    {community.venue}
                                </span>
                                <span className="block text-[11px] text-white/60">
                                    {community.venueDistrict}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 rounded-[14px] border-[0.5px] border-white/10 bg-panel p-3.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-white/70">
                                اكتمال نصاب الحجز:
                            </span>
                            <span className="font-mono font-bold text-lime">
                                {confirmed} من {community.capacity} مقاعد مؤكدة
                                ({percent}%)
                            </span>
                        </div>
                        <div
                            className="h-2 w-full overflow-hidden rounded-full bg-white/10"
                            dir="ltr"
                        >
                            <div
                                className="h-full rounded-full bg-lime transition-all duration-300"
                                style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between pt-0.5 text-[11px] text-white/50">
                            <span>
                                {remaining > 0
                                    ? `متبقي ${remaining} مقاعد للتأكيد`
                                    : 'اكتمل النصاب المطلوب بالكامل!'}
                            </span>
                            <span className="font-mono text-white/70">
                                {community.closingIn}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2 pt-1">
                        <button
                            type="button"
                            aria-pressed={rsvped}
                            onClick={() => setRsvped((previous) => !previous)}
                            className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-[0.5px] px-4 py-3.5 text-sm font-extrabold shadow-lg transition-all ${
                                rsvped
                                    ? 'scale-[1.01] border-emerald-400 bg-emerald-500 text-white'
                                    : 'border-lime bg-lime text-ink hover:scale-[1.01] hover:bg-lime-hover'
                            }`}
                        >
                            {rsvped ? (
                                <>
                                    <Check
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        تم تأكيد حضورك بنجاح! (انقر للتراجع)
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Zap
                                        className="h-4 w-4 text-ink"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        تأكيد الحضور بضغطة زر واحدة (RSVP)
                                    </span>
                                </>
                            )}
                        </button>
                        <div className="flex items-center justify-between px-1 text-[11px] text-white/50">
                            <span className="flex items-center gap-1 text-white/70">
                                <ShieldCheck
                                    className="h-3.5 w-3.5 text-lime"
                                    aria-hidden="true"
                                />
                                بدون مجموعات خارجية أو جمع مالي يدوي
                            </span>
                            <span className="font-mono text-[10px] text-lime">
                                تأكيد فوري
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MarketingHome() {
    return (
        <MarketingLayout headerTheme="light" activeNav="">
            <Head title="فعاليات متكررة تلقائياً للموظفين" />

            {/*
                ── Hero — the one light band, which is why the header runs light here.
                Two rings bleed off opposite corners: lime at 20% top-start, ink at
                3% bottom-end. The card is ink, not white: it is a product vignette
                of the exact moment this platform exists to produce — a booking that
                reached quorum and can be confirmed in one tap.
            */}
            <section className="relative flex min-h-[88vh] items-center overflow-hidden border-b-[0.5px] border-ink/10 bg-[#F8FAF7] px-4 pt-32 pb-16 text-ink sm:px-6 lg:px-8 lg:pb-24">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full border-[28px] border-lime/20 sm:h-[540px] sm:w-[540px]"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-40 -bottom-40 h-96 w-96 rounded-full border-[28px] border-ink/[0.03] sm:h-[600px] sm:w-[600px]"
                />

                <div className="relative z-10 mx-auto w-full max-w-[1180px]">
                    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                        <div className="space-y-6 lg:col-span-6">
                            <Eyebrow>TEAMAT · SAUDI ARABIA</Eyebrow>

                            <h1 className="font-arabic text-3xl leading-[1.2] font-extrabold tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[50px]">
                                الاهتمام المشترك لا يكفي — التكرار هو ما يبني
                                الفريق
                            </h1>

                            <p className="max-w-[540px] text-base leading-[1.8] font-normal text-ink/80 sm:text-lg">
                                تيمات تحوّل اهتمامات موظفيك إلى مجتمعات،
                                والمجتمعات إلى فعاليات تتكرر تلقائياً — دون أن
                                يحتاج أحد إلى تنظيمها.
                            </p>

                            <div className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:items-center">
                                <Link
                                    href="/contact"
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-[0.5px] border-ink bg-ink px-7 py-3.5 text-[16px] font-bold whitespace-nowrap text-white transition-colors duration-150 select-none hover:border-[#222222] hover:bg-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none"
                                >
                                    اطلب عرضاً
                                    <ArrowLeft
                                        className="ml-1 h-4 w-4"
                                        aria-hidden="true"
                                    />
                                </Link>
                                <Link
                                    href="/how-it-works"
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-[0.5px] border-ink bg-transparent px-7 py-3.5 text-[16px] font-bold whitespace-nowrap text-ink transition-colors duration-150 select-none hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none active:bg-ink/10"
                                >
                                    كيف تعمل تيمات
                                </Link>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t-[0.5px] border-ink/10 pt-4 text-xs font-medium text-ink/70">
                                {[
                                    'تثبيت حجز وإصدار فواتير ضريبية',
                                    'بدون أي جهود تنظيمية داخلية',
                                ].map((point) => (
                                    <span
                                        key={point}
                                        className="flex items-center gap-1.5"
                                    >
                                        <Check
                                            className="h-4 w-4 text-ink"
                                            aria-hidden="true"
                                        />
                                        <span>{point}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="w-full lg:col-span-6">
                            <HeroPreview />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── The problem ── */}
            <Band ground="ink" ring="-bottom-32 -left-32" borderBottom>
                <SectionHead
                    dark
                    big
                    ledeSize="17"
                    eyebrow="التحدي الحقيقي"
                    title="المنظّم المفقود"
                    lede="كل شركة جرّبت النشاط الجماعي تعرف النمط: فعالية أولى ناجحة، ثم صمت. السبب ليس ضعف الحماس — بل أن الاستمرار كان معلّقاً على شخص واحد يتطوّع بوقته. عندما ينشغل، يتوقف كل شيء."
                />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <FeatureCard
                        dark
                        icon={Flame}
                        title="الحماس يبدأ ثم ينطفئ"
                        body="تبدأ الفكرة بنشاط واحد بحضور عالٍ، لكن بدون بنية تقنية تتولى التكرار، تتلاشى التجربة تدريجياً وتعود الفرق إلى عزلتها اليومية."
                    />
                    <FeatureCard
                        dark
                        icon={Clock}
                        title="التنسيق عبء إضافي على موظف"
                        body="البحث عن مواعيد وتأكيد مشاركات وجمع المبالغ يستهلك ساعات عمل من موظف متطوّع لم يُعيَّن لهذه المهمة في الأساس."
                    />
                    <FeatureCard
                        dark
                        icon={ChartColumn}
                        title="لا بيانات تُثبت الأثر"
                        body="الأنشطة التقليدية تتم خارج أي سياق موثّق، فلا تملك الشركة أي مؤشرات تقيس تفاعل الموظفين أو تكرار مشاركتهم."
                    />
                </div>
            </Band>

            {/* ── How the loop closes ── */}
            <Band ground="page">
                <SectionHead
                    big
                    eyebrow="دورة النظام"
                    title="كيف تضمن تيمات الاستمرار التلقائي"
                />
                <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {STEPS.map(([title, body], i) => (
                        <StepFlowCard
                            key={title}
                            num={String(i + 1).padStart(2, '0')}
                            title={title}
                            body={body}
                        />
                    ))}
                </div>
            </Band>

            {/* ── The community as the unit of construction ── */}
            <Band
                ground="ink"
                ring="top-1/2 -translate-y-1/2 -right-40"
                ringSize={600}
                borderTop
                borderBottom
            >
                <SectionHead
                    dark
                    big
                    ledeSize="17"
                    eyebrow="الهيكل التقني"
                    title="المجتمع هو وحدة البناء"
                    lede="المجتمع في تيمات ليس مجموعة محادثة — بل كيان له قادة ومحفظة وجدول فعاليات. هذا ما يجعل التكرار خاصية في النظام لا مجهوداً بشرياً."
                />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <RingCard
                        icon={Users}
                        title="قادة المجتمع"
                        body="أعضاء يملكون صلاحية جدولة الفعاليات وتأكيد الحضور مع نافذة تصحيح مدتها ٢٤ ساعة."
                    />
                    <RingCard
                        icon={Shield}
                        title="محفظة مخصصة"
                        body="سجل مالي ثابت لكل مجتمع، يضمن وضوح الصرف والتسوية المالية الفورية مع مزوّد الخدمة."
                    />
                    <RingCard
                        icon={Repeat}
                        title="توليد تلقائي للفعاليات"
                        body="جدولة دورية وفق توفّر المرفق وسعته المعتمدة دون الحاجة لمتابعة يدوية."
                    />
                </div>
            </Band>

            {/* ── The two financial tracks ── */}
            <Band ground="page">
                <SectionHead
                    big
                    ledeSize="17"
                    eyebrow="المرونة المالية"
                    title="مساران ماليان يناسبان هيكل ميزانيتك"
                    lede="تختار الشركة المسار المالي الذي يلائم سياستها التشغيلية، مع الحفاظ على تجربة مستخدم موحدة للموظفين."
                />
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <TrackCard
                        dark
                        icon={Wallet}
                        badge="تحمّل كامل للأنشطة"
                        title="محفظة المجتمع"
                        body="الشركة تشحن رصيداً في محفظة المجتمعات، ويُخصم ثمن كل فعالية منه تلقائياً عند اكتمالها."
                        bestFor="الأنسب للشركات التي تتحمّل تكلفة الأنشطة بالكامل وتضع ميزانية محددة للتفاعل."
                        points={[
                            'شحن رصيد مسبق للمجتمعات',
                            'خصم مباشر عند اكتمال الفعالية',
                            'تحكّم كامل في سقف الميزانية',
                        ]}
                    />
                    <TrackCard
                        dark={false}
                        icon={Users}
                        badge="توسّع بتكلفة ثابتة"
                        title="دفع الموظف"
                        body="الشركة تدفع مقابل استخدام النظام فقط، بينما يدفع كل موظف حصته المحددة عن كل فعالية يشارك فيها."
                        bestFor="الأنسب للتوسّع الواسع في الشركات الكبيرة بتكلفة تشغيلية ثابتة ومدروسة."
                        points={[
                            'الشركة تدفع رسوم النظام فقط',
                            'الموظف يدفع حصة الفرد للفعالية',
                            'مرونة عالية في عدد الفعاليات',
                        ]}
                    />
                </div>
            </Band>

            {/* ── The optional managed service ── */}
            <section className="relative overflow-hidden border-t-[0.5px] border-b-[0.5px] border-ink/10 bg-sand py-12 text-ink md:py-16 lg:py-[72px]">
                <div className={SHELL}>
                    <div className="relative overflow-hidden rounded-[16px] border-[0.5px] border-white/10 bg-ink p-8 text-white sm:p-12">
                        <div className="max-w-[700px] space-y-6">
                            <div className="inline-flex items-center gap-2">
                                <span className="rounded-full bg-lime px-3 py-1 font-sans text-[11px] font-extrabold tracking-[2px] text-ink uppercase">
                                    خدمة اختيارية
                                </span>
                            </div>
                            <h2 className="font-arabic text-2xl leading-snug font-extrabold text-white sm:text-3xl lg:text-[34px]">
                                المنسّق المُدار
                            </h2>
                            <p className="text-base leading-[1.8] text-white/80 sm:text-lg">
                                لا يوجد داخل فريقك من يملك وقت التنسيق؟ المنسّق
                                المُدار خدمة اختيارية يتولّى فيها فريق تيمات
                                إدارة مجتمعاتك وجدولة فعالياتها ومتابعة موفري
                                الخدمة بالكامل.
                            </p>
                            <ul className="space-y-3 pt-2">
                                <TickedLine>
                                    إدارة وتنشيط المجتمعات وجداولها
                                </TickedLine>
                                <TickedLine>
                                    التنسيق المستمر مع مزودي الخدمة وتثبيت
                                    المواعيد
                                </TickedLine>
                                <TickedLine>
                                    متابعة الحضور وإصدار تقارير دورية لمسؤول
                                    الحساب في الشركة
                                </TickedLine>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── The provider network ── */}
            <section className="relative overflow-hidden bg-surface py-12 text-ink md:py-16 lg:py-[72px]">
                <div className={SHELL}>
                    <div className="flex flex-col items-start justify-between gap-8 rounded-[16px] border-[0.5px] border-ink/10 bg-page p-8 sm:p-10 md:flex-row md:items-center">
                        <div className="max-w-[600px] space-y-3">
                            <Eyebrow>شبكة الملاعب والمرافق</Eyebrow>
                            <h2 className="font-arabic text-2xl font-extrabold text-ink sm:text-3xl">
                                شبكة موثوقة من مزودي الخدمة
                            </h2>
                            <p className="text-base leading-relaxed text-ink/70">
                                نربط مجتمعات الشركات بأفضل المرافق الرياضية
                                والإبداعية والترفيهية في الرياض مع التزام كامل
                                بتثبيت الأسعار والتسوية الدقيقة.
                            </p>
                        </div>
                        <div className="shrink-0">
                            <Link
                                href="/for-providers"
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-[0.5px] border-ink bg-ink px-6 py-3 text-[15px] font-bold whitespace-nowrap text-white transition-colors duration-150 select-none hover:border-[#222222] hover:bg-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none"
                            >
                                تعرّف على نموذج مزودي الخدمة
                                <ArrowLeft
                                    className="ml-1 h-4 w-4"
                                    aria-hidden="true"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <ClosingBand title="ابدأ بمجتمع واحد واختبر التكرار التلقائي في شركتك" />
        </MarketingLayout>
    );
}
