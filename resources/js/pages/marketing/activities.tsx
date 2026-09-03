import { Head } from '@inertiajs/react';
import {
    Activity,
    Bike,
    Circle,
    CircleDot,
    Crosshair,
    Dices,
    Dumbbell,
    Footprints,
    Gamepad2,
    Info,
    Key,
    Mountain,
    Palette,
    Sparkles,
    Target,
    Utensils,
    Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ClosingBand, Eyebrow, PageHero, Ring, SHELL } from '@/components/marketing/ui';
import MarketingLayout from '@/layouts/marketing-layout';

/** The catalogue, paired to the prototype's own glyph per activity. */
const ACTIVITIES: [string, string, LucideIcon][] = [
    ['رياضات المضرب', 'بادل وتنس وإسكواش للمجموعات التنافسية والودية في أفضل الملاعب.', Activity],
    ['كرة القدم', 'مباريات أسبوعية ودية تجمع فرق الأقسام المختلفة بحماس منتظم.', CircleDot],
    ['كرة الطائرة', 'نشاط جماعي يعزز التناغم والتنسيق السريع بين أعضاء الفريق.', Circle],
    ['البولينغ', 'تجربة حماسية خفيفة مناسبة لجميع مستويات اللياقة والاهتمامات.', Target],
    ['الرماية', 'تركيز ودقة في بيئات تدريبية آمنة ومجهزة بأحدث المعدات.', Crosshair],
    ['الدراجات', 'جولات دراجات جماعية في مسارات الرياض المعتمدة مع تجهيزات كاملة.', Bike],
    ['المشي والجري', 'مجتمعات لياقة صباحية ومسائية تشجع على أسلوب حياة صحي منتظم.', Footprints],
    ['الرياضات المائية', 'سباحة وتجديف وتجارب مائية متنوعة في مرافق متخصصة.', Waves],
    ['التسلّق', 'تحدي تسلق الجدران الداخلية للمغامرين وروح الإصرار الجماعي.', Mountain],
    ['غرف الألغاز', 'تحديات ذكاء تتطلب تفكيراً استراتيجياً وحلاً مشتركاً للمشكلات.', Key],
    ['الفنون والحرف', 'ورش رسم وفخار وأعمال يدوية لتفريغ الطاقات الإبداعية لدى الفريق.', Palette],
    ['الطبخ', 'تجارب طهي تفاعلية تدمج المهارات وتعزز روح التعاون والمرح.', Utensils],
    ['الألعاب اللوحية', 'جلسات استراتيجية ونقاشات مرحة في مساحات مخصصة ومريحة.', Dices],
    ['الرياضات الإلكترونية', 'بطولات ألعاب إلكترونية تنافسية لأصحاب الشغف الرقمي والتقني.', Gamepad2],
    ['اللياقة والكروس فيت', 'تمارين تدريبية جماعية تبني التحمل وتعزز الطاقة الإيجابية اليومية.', Dumbbell],
    ['اليوغا والتأمل', 'جلسات استرخاء وصفاء ذهني تساعد على استعادة التوازن وتخفيف ضغوط العمل.', Sparkles],
];

export default function Activities() {
    return (
        <MarketingLayout activeNav="/activities">
            <Head title="دليل الأنشطة" />

            <PageHero
                eyebrow="دليل الاهتمامات المشتركة"
                title="ما الذي يجمع فريقك؟"
                lede="من رياضات المضرب إلى الألعاب الذهنية والأنشطة الإبداعية؛ تيمات تغطي اهتمامات كل موظف وتبني منها مجتمعاً متكرراً."
            />

            {/* ── The catalogue ── */}
            <section className="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-page text-ink">
                <div className={SHELL}>
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {ACTIVITIES.map(([title, body, Icon]) => (
                                <div
                                    key={title}
                                    className="rounded-[16px] transition-colors duration-150 relative overflow-hidden bg-surface text-ink border-[0.5px] border-ink/10 p-6 sm:p-7 hover:border-ink/30 flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-lime flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-ink" aria-hidden="true" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold font-arabic text-ink">{title}</h3>
                                        <p className="text-xs sm:text-sm text-ink/70 leading-relaxed">{body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 sm:p-5 rounded-[12px] bg-sand border-[0.5px] border-ink/10 flex items-center gap-3">
                            <Info className="w-5 h-5 text-ink shrink-0" aria-hidden="true" />
                            <p className="text-sm font-bold text-ink">الفئات تتوسّع مع شبكة مزودي الخدمة في كل مدينة.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How the match is actually made ── */}
            <section className="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-ink text-white border-t-[0.5px] border-b-[0.5px] border-white/10">
                <Ring position="top-1/2 -translate-y-1/2 -right-40" size={600} />
                <div className={SHELL}>
                    <div className="max-w-[740px] mx-auto text-center space-y-6">
                        <Eyebrow tone="lime">الذكاء التشغيلي</Eyebrow>
                        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-arabic text-white">
                            كيف تُختار الفعالية ومزوّد الخدمة؟
                        </h2>
                        <p className="text-white/80 text-base sm:text-lg leading-[1.9]">
                            المجتمع يحدد الاهتمام، والنظام يقترح مزوّد الخدمة المناسب تلقائياً وفق معادلة دقيقة تشمل: الموقع
                            الجغرافي القريب، والسعة الاستيعابية المطلوبة، والتوفّر المعتمد، وتثبيت السعر الإجمالي مسبقاً.
                        </p>
                    </div>
                </div>
            </section>

            <ClosingBand title="استكشف كيف تنطلق مجتمعاتك بالنشاط الذي يفضله فريقك" cta="اطلب عرضاً لشركتك" />
        </MarketingLayout>
    );
}
