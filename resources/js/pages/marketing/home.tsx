import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, ChartColumn, Check, Clock, Flame, MapPin, Repeat, Shield, ShieldCheck, Users, Wallet, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Band, ClosingBand, Eyebrow, FeatureCard, RingCard, SectionHead, SHELL, StepFlowCard } from '@/components/marketing/ui';
import MarketingLayout from '@/layouts/marketing-layout';

const STEPS: [string, string][] = [
    ['تفعيل الحساب', 'الشركة تفتح حسابها وتحدد مسارها المالي وتدعو موظفيها عبر مسار دخول سريع برمز يصل عبر واتساب.'],
    ['تكوّن المجتمعات', 'الموظفون يحددون اهتماماتهم الفعلية وينضمّون تلقائياً إلى مجتمعات متخصصة داخل نطاق الشركة.'],
    [
        'فعالية متكررة تلقائياً',
        'المجتمع يولّد فعاليته مع مزوّد الخدمة المناسب بجدول ثابت وتأكيد توفّر وتثبيت مسبق للسعر الإجمالي.',
    ],
    ['الحضور والقياس', 'الحضور يُسجَّل تلقائياً عند اكتمال الفعالية، وتنعكس مؤشرات التفاعل مباشرة في لوحة متابعة الشركة.'],
];

/** The interest chips above the hero card. Only the first is selected. */
const CHIPS: [string, string][] = [
    ['🎾', 'بادل'],
    ['⚽', 'كرة القدم'],
    ['♟️', 'شطرنج'],
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
            className={`p-8 sm:p-10 rounded-[16px] border-[0.5px] flex flex-col justify-between relative overflow-hidden ${
                dark ? 'bg-ink text-white border-white/15' : 'bg-surface text-ink border-ink/15'
            }`}
        >
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${dark ? 'bg-lime text-ink' : 'bg-ink text-lime'}`}
                    >
                        <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <span
                        className={`text-[11px] font-sans font-extrabold uppercase tracking-[1.5px] py-1 px-3.5 rounded-full border-[0.5px] ${
                            dark ? 'bg-white/10 text-lime border-lime/30' : 'bg-ink/5 text-ink border-ink/20'
                        }`}
                    >
                        {badge}
                    </span>
                </div>

                <h3 className={`text-2xl sm:text-3xl font-extrabold font-arabic mb-3 ${dark ? 'text-white' : 'text-ink'}`}>{title}</h3>
                <p className={`text-base leading-relaxed mb-6 ${dark ? 'text-white/70' : 'text-ink/70'}`}>{body}</p>

                <div
                    className={`p-4 rounded-[12px] border-[0.5px] mb-6 ${dark ? 'bg-white/5 border-white/10' : 'bg-page border-ink/10'}`}
                >
                    <span className={`text-xs font-bold block mb-1 ${dark ? 'text-lime' : 'text-ink'}`}>الخيار الأمثل لـ:</span>
                    <p className={`text-xs sm:text-sm leading-relaxed ${dark ? 'text-white/80' : 'text-ink/80'}`}>{bestFor}</p>
                </div>

                <ul className="space-y-3 mb-6">
                    {points.map((point) => (
                        <li key={point} className={`flex items-center gap-3 text-sm ${dark ? 'text-white/90' : 'text-ink/90'}`}>
                            <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                    dark ? 'bg-lime text-ink' : 'bg-ink text-lime'
                                }`}
                            >
                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
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
        <li className="flex items-center gap-3 text-sm sm:text-base text-white/90">
            <span className="w-5 h-5 rounded-full bg-lime text-ink flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span>{children}</span>
        </li>
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
            <section className="min-h-[88vh] bg-[#F8FAF7] text-ink pt-32 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 flex items-center relative overflow-hidden border-b-[0.5px] border-ink/10">
                <div
                    aria-hidden="true"
                    className="absolute -top-32 -left-32 w-96 h-96 sm:w-[540px] sm:h-[540px] rounded-full border-[28px] border-lime/20 pointer-events-none"
                />
                <div
                    aria-hidden="true"
                    className="absolute -bottom-40 -right-40 w-96 h-96 sm:w-[600px] sm:h-[600px] rounded-full border-[28px] border-ink/[0.03] pointer-events-none"
                />

                <div className="max-w-[1180px] mx-auto w-full relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        <div className="lg:col-span-6 space-y-6">
                            <Eyebrow>TEAMAT · SAUDI ARABIA</Eyebrow>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[50px] font-extrabold font-arabic text-ink leading-[1.2] tracking-tight">
                                الاهتمام المشترك لا يكفي — التكرار هو ما يبني الفريق
                            </h1>

                            <p className="text-base sm:text-lg text-ink/80 font-normal leading-[1.8] max-w-[540px]">
                                تيمات تحوّل اهتمامات موظفيك إلى مجتمعات، والمجتمعات إلى فعاليات تتكرر تلقائياً — دون أن يحتاج أحد إلى تنظيمها.
                            </p>

                            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime text-[16px] py-3.5 px-7 font-bold bg-ink text-white border-[0.5px] border-ink hover:bg-[#1a1a1a] hover:border-[#222222]"
                                >
                                    اطلب عرضاً
                                    <ArrowLeft className="w-4 h-4 ml-1" aria-hidden="true" />
                                </Link>
                                <Link
                                    href="/how-it-works"
                                    className="inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime text-[16px] py-3.5 px-7 font-bold bg-transparent text-ink border-[0.5px] border-ink hover:bg-ink/5 active:bg-ink/10"
                                >
                                    كيف تعمل تيمات
                                </Link>
                            </div>

                            <div className="pt-4 border-t-[0.5px] border-ink/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink/70 font-medium">
                                {['تثبيت حجز وإصدار فواتير ضريبية', 'بدون أي جهود تنظيمية داخلية'].map((point) => (
                                    <span key={point} className="flex items-center gap-1.5">
                                        <Check className="w-4 h-4 text-ink" aria-hidden="true" />
                                        <span>{point}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-6 w-full">
                            <div className="w-full max-w-[500px] mx-auto lg:mr-auto lg:ml-0 text-right font-arabic">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="text-[11px] font-bold text-ink/70">استعراض المجتمعات والفعاليات:</span>
                                    <div className="flex items-center gap-1.5 overflow-x-auto">
                                        {CHIPS.map(([emoji, label], i) => (
                                            <button
                                                key={label}
                                                type="button"
                                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border-[0.5px] whitespace-nowrap ${
                                                    i === 0
                                                        ? 'bg-ink text-lime border-ink shadow-sm font-extrabold scale-[1.02]'
                                                        : 'bg-surface/80 text-ink/70 border-ink/10 hover:border-ink/30 hover:text-ink'
                                                }`}
                                            >
                                                <span className="ml-1">{emoji}</span>
                                                <span>{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative pt-3 pb-1">
                                    <div aria-hidden="true" className="absolute -inset-1.5 bg-lime/10 rounded-[28px] blur-md pointer-events-none" />

                                    {/* Community strip, tucked behind the event panel */}
                                    <div className="relative z-10 mx-3 p-4 rounded-[18px] bg-[#161616] text-white border-[0.5px] border-white/20 shadow-xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-lime text-ink flex items-center justify-center text-xl shrink-0 font-bold shadow-sm">
                                                🎾
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-sm sm:text-base font-extrabold text-white">مجتمع البادل</h2>
                                                    <span className="text-[10px] bg-lime/20 text-lime px-2 py-0.5 rounded-full font-bold border-[0.5px] border-lime/30">
                                                        نشط
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-white/60 pt-0.5">28 موظفاً منضماً · الليدر: فهد السعيد</p>
                                            </div>
                                        </div>
                                        <div className="text-left shrink-0">
                                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 justify-end">
                                                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                تأكيد تلقائي
                                            </span>
                                            <span className="text-[11px] text-white/50 block font-mono">مغطى من محفظة المجتمع</span>
                                        </div>
                                    </div>

                                    {/* The event panel itself */}
                                    <div className="relative z-20 -mt-2 p-5 sm:p-6 rounded-[22px] bg-ink text-white border-[0.5px] border-white/20 shadow-2xl space-y-4.5">
                                        <div className="flex items-start justify-between gap-2 border-b-[0.5px] border-white/10 pb-3">
                                            <div>
                                                <span className="text-[10px] font-extrabold font-sans text-lime uppercase tracking-wider block">
                                                    UPCOMING EVENT · الفعالية القادمة
                                                </span>
                                                <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">تأكيد حضور الجولة القادمة</h3>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full bg-lime/15 text-lime text-[11px] font-bold border-[0.5px] border-lime/30 shrink-0">
                                                حجز مؤكد
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                            <div className="p-3 rounded-[12px] bg-panel border-[0.5px] border-white/10 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lime shrink-0">
                                                    <Calendar className="w-4 h-4" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <span className="text-white/45 text-[10px] block">الموعد المحدد</span>
                                                    <span className="font-bold text-white text-xs">الخميس، 28 أغسطس</span>
                                                    <span className="text-lime text-[11px] font-mono block">08:00 م - 10:00 م</span>
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-[12px] bg-panel border-[0.5px] border-white/10 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lime shrink-0">
                                                    <MapPin className="w-4 h-4" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <span className="text-white/45 text-[10px] block">المرفق والموقع</span>
                                                    <span className="font-bold text-white text-xs truncate block">بادل إن (Padel In)</span>
                                                    <span className="text-white/60 text-[11px] block">حي النرجس، الرياض</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3.5 rounded-[14px] bg-panel border-[0.5px] border-white/10 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-white/70 font-medium">اكتمال نصاب الحجز:</span>
                                                <span className="text-lime font-bold font-mono">6 من 8 مقاعد مؤكدة (75%)</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden" dir="ltr">
                                                <div className="h-full bg-lime rounded-full transition-all duration-300" style={{ width: '75%' }} />
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-white/50 pt-0.5">
                                                <span>متبقي 2 مقاعد للتأكيد</span>
                                                <span className="font-mono text-white/70">متبقي 4 ساعات على الإغلاق</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-1">
                                            <button
                                                type="button"
                                                className="w-full py-3.5 px-4 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-[0.5px] shadow-lg bg-lime text-ink border-lime hover:bg-lime-hover hover:scale-[1.01]"
                                            >
                                                <Zap className="w-4 h-4 text-ink" aria-hidden="true" />
                                                <span>تأكيد الحضور بضغطة زر واحدة (RSVP)</span>
                                            </button>
                                            <div className="flex items-center justify-between text-[11px] text-white/50 px-1">
                                                <span className="flex items-center gap-1 text-white/70">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-lime" aria-hidden="true" />
                                                    بدون مجموعات خارجية أو جمع مالي يدوي
                                                </span>
                                                <span className="font-mono text-lime text-[10px]">تأكيد فوري</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <SectionHead big eyebrow="دورة النظام" title="كيف تضمن تيمات الاستمرار التلقائي" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {STEPS.map(([title, body], i) => (
                        <StepFlowCard key={title} num={String(i + 1).padStart(2, '0')} title={title} body={body} />
                    ))}
                </div>
            </Band>

            {/* ── The community as the unit of construction ── */}
            <Band ground="ink" ring="top-1/2 -translate-y-1/2 -right-40" ringSize={600} borderTop borderBottom>
                <SectionHead
                    dark
                    big
                    ledeSize="17"
                    eyebrow="الهيكل التقني"
                    title="المجتمع هو وحدة البناء"
                    lede="المجتمع في تيمات ليس مجموعة محادثة — بل كيان له قادة ومحفظة وجدول فعاليات. هذا ما يجعل التكرار خاصية في النظام لا مجهوداً بشرياً."
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <TrackCard
                        dark
                        icon={Wallet}
                        badge="تحمّل كامل للأنشطة"
                        title="محفظة المجتمع"
                        body="الشركة تشحن رصيداً في محفظة المجتمعات، ويُخصم ثمن كل فعالية منه تلقائياً عند اكتمالها."
                        bestFor="الأنسب للشركات التي تتحمّل تكلفة الأنشطة بالكامل وتضع ميزانية محددة للتفاعل."
                        points={['شحن رصيد مسبق للمجتمعات', 'خصم مباشر عند اكتمال الفعالية', 'تحكّم كامل في سقف الميزانية']}
                    />
                    <TrackCard
                        dark={false}
                        icon={Users}
                        badge="توسّع بتكلفة ثابتة"
                        title="دفع الموظف"
                        body="الشركة تدفع مقابل استخدام النظام فقط، بينما يدفع كل موظف حصته المحددة عن كل فعالية يشارك فيها."
                        bestFor="الأنسب للتوسّع الواسع في الشركات الكبيرة بتكلفة تشغيلية ثابتة ومدروسة."
                        points={['الشركة تدفع رسوم النظام فقط', 'الموظف يدفع حصة الفرد للفعالية', 'مرونة عالية في عدد الفعاليات']}
                    />
                </div>
            </Band>

            {/* ── The optional managed service ── */}
            <section className="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-sand text-ink border-t-[0.5px] border-b-[0.5px] border-ink/10">
                <div className={SHELL}>
                    <div className="p-8 sm:p-12 rounded-[16px] bg-ink text-white border-[0.5px] border-white/10 relative overflow-hidden">
                        <div className="max-w-[700px] space-y-6">
                            <div className="inline-flex items-center gap-2">
                                <span className="text-[11px] font-sans font-extrabold uppercase tracking-[2px] py-1 px-3 rounded-full bg-lime text-ink">
                                    خدمة اختيارية
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-arabic text-white leading-snug">
                                المنسّق المُدار
                            </h2>
                            <p className="text-white/80 text-base sm:text-lg leading-[1.8]">
                                لا يوجد داخل فريقك من يملك وقت التنسيق؟ المنسّق المُدار خدمة اختيارية يتولّى فيها فريق تيمات إدارة مجتمعاتك
                                وجدولة فعالياتها ومتابعة موفري الخدمة بالكامل.
                            </p>
                            <ul className="space-y-3 pt-2">
                                <TickedLine>إدارة وتنشيط المجتمعات وجداولها</TickedLine>
                                <TickedLine>التنسيق المستمر مع مزودي الخدمة وتثبيت المواعيد</TickedLine>
                                <TickedLine>متابعة الحضور وإصدار تقارير دورية لمسؤول الحساب في الشركة</TickedLine>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── The provider network ── */}
            <section className="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-surface text-ink">
                <div className={SHELL}>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-page p-8 sm:p-10 rounded-[16px] border-[0.5px] border-ink/10">
                        <div className="max-w-[600px] space-y-3">
                            <Eyebrow>شبكة الملاعب والمرافق</Eyebrow>
                            <h2 className="text-2xl sm:text-3xl font-extrabold font-arabic text-ink">شبكة موثوقة من مزودي الخدمة</h2>
                            <p className="text-ink/70 text-base leading-relaxed">
                                نربط مجتمعات الشركات بأفضل المرافق الرياضية والإبداعية والترفيهية في الرياض مع التزام كامل بتثبيت الأسعار
                                والتسوية الدقيقة.
                            </p>
                        </div>
                        <div className="shrink-0">
                            <Link
                                href="/for-providers"
                                className="inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime text-[15px] py-3 px-6 font-bold bg-ink text-white border-[0.5px] border-ink hover:bg-[#1a1a1a] hover:border-[#222222]"
                            >
                                تعرّف على نموذج مزودي الخدمة
                                <ArrowLeft className="w-4 h-4 ml-1" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <ClosingBand title="ابدأ بمجتمع واحد واختبر التكرار التلقائي في شركتك" />
        </MarketingLayout>
    );
}
