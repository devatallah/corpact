import { Head } from '@inertiajs/react';
import { Building2, ChevronDown, CircleCheckBig, FileSpreadsheet, ShieldCheck, Store, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import {
    Band,
    ClosingBand,
    Eyebrow,
    NumberCard,
    PageHero,
    RingCard,
    SectionHead,
    SHELL,
    StepTimeline,
} from '@/components/marketing/ui';
import MarketingLayout from '@/layouts/marketing-layout';

/** The three journeys the platform connects. Copy is the prototype's own. */
const JOURNEYS: { key: string; tab: string; icon: LucideIcon; title: string; steps: [string, string][] }[] = [
    {
        key: 'company',
        tab: 'الشركة',
        icon: Building2,
        title: 'رحلة مسؤول الحساب في الشركة',
        steps: [
            ['تفعيل الحساب وضبط الإعدادات', 'إنشاء حساب الشركة، وتعيين مسؤولي الحساب، وضبط سياسات المجموعات ونطاقات العمل.'],
            ['اختيار المسار المالي', 'تحديد مسار محفظة المجتمع (شحن مسبق) أو مسار دفع الموظف (رسوم النظام فقط).'],
            ['دعوة الموظفين', 'إرسال رابط التفعيل للموظفين للدخول السريع عبر رمز يصل في رسالة واتساب.'],
            ['اعتماد المجتمعات', 'مراجعة واعتماد المجتمعات المكوّنة وتعيين قادتها وتحديد سقوف الإنفاق إن وُجدت.'],
            ['متابعة المؤشرات الحية', 'الاطلاع على الفعاليات المكتملة ومعدلات التفاعل ونمو المجتمعات عبر لوحة تحكّم موثّقة.'],
        ],
    },
    {
        key: 'employee',
        tab: 'الموظف',
        icon: User,
        title: 'رحلة الموظف في مجتمعاته',
        steps: [
            ['الدخول السريع برمز واتساب', 'تسجيل دخول سلس وفوري دون الحاجة إلى كلمات مرور معقدة أو إجراءات مطوّلة.'],
            ['اختيار الاهتمامات الفعلية', 'تحديد الرياضات والأنشطة الذهنية والإبداعية التي يرغب الموظف في ممارستها فعلاً.'],
            ['الانضمام لمجتمع متخصص', 'الالتحاق بالمجتمع المناسب داخل الشركة والتواصل مع الزملاء المشاركين في نفس الشغف.'],
            ['تأكيد المشاركة في الفعالية', 'تأكيد الحضور في الموعد المجدول ودفع حصة الفرد إذا كان المسار المالي المختار يتطلب ذلك.'],
            ['الحضور والاستمتاع بالتجربة', 'التواجد في موقع مزوّد الخدمة؛ حيث يُسجّل الحضور آلياً بمجرد اكتمال الفعالية.'],
        ],
    },
    {
        key: 'provider',
        tab: 'مزوّد الخدمة',
        icon: Store,
        title: 'رحلة مزوّد الخدمة والمرفق',
        steps: [
            ['استقبال طلب الفعالية', 'تلقي طلب الفعالية المجدولة من مجتمع الشركة مع توضيح التاريخ والسعة المطلوبة.'],
            ['تأكيد التوفّر والمواعيد', 'تثبيت حجز المرفق ومطابقة السعر الإجمالي المعتمد عبر لوحة مزوّد الخدمة.'],
            ['استضافة الفعالية', 'استقبال مجموعة موظفي الشركة في المرفق وتقديم التجربة الرياضية أو الترفيهية المحددة.'],
            ['اكتمال الفعالية', 'تأكيد انتهاء النشاط وتسجيل الحضور المكتمل بنجاح داخل النظام.'],
            ['التسوية المالية الدورية', 'تحويل المستحقات المالية للمرفق وفق شروط التعاقد الواضحة والسجلات المعتمدة.'],
        ],
    },
];

const FAQ: [string, string][] = [
    [
        'كيف تضمن تيمات استمرار الفعاليات دون منظّم بشري؟',
        'النظام يعتمد على بنية المجتمع ذاتية الإدارة، حيث يتم ربط الاهتمامات بجدول زمني متكرر ومزوّد خدمة معتمد، مع تنبيهات وتأكيدات حضور آلية تحافظ على وتيرة النشاط.',
    ],
    [
        'ما الفرق بين محفظة المجتمع ودفع الموظف؟',
        'في مسار محفظة المجتمع، تشحن الشركة رصيداً وتتحمل تكلفة الفعاليات بالكامل. في مسار دفع الموظف، تدفع الشركة رسوم النظام فقط، ويدفع الموظف حصة الفرد عن كل فعالية يحضرها.',
    ],
    [
        'كيف يسجّل الموظفون دخولهم إلى المنصة؟',
        'يتم الدخول برمز تحقّق سريع يصل إلى رقم هاتف الموظف عبر تطبيق واتساب، دون الحاجة لإنشاء كلمات مرور أو تعبئة نماذج معقدة.',
    ],
    [
        'ما هي صلاحيات مسؤول الحساب في الشركة؟',
        'مسؤول الحساب في الشركة يملك لوحة تحكم كاملة تتيح له اعتماد المجتمعات، وتحديد سقوف الإنفاق، والاطلاع على سجل الفعاليات المكتملة والمؤشرات الإجمالية.',
    ],
    [
        'متى تصبح الفعالية «مكتملة» وتُحسب في المؤشرات؟',
        'تُعتبر الفعالية مكتملة بمجرد انتهاء موعدها المحدد لدى مزوّد الخدمة، ويكون لقادة المجتمع نافذة تصحيح مدتها ٢٤ ساعة لتدقيق الحضور قبل اعتماد السجل المالي النهائي.',
    ],
    [
        'ما هي خدمة المنسّق المُدار ومتى تحتاجها الشركة؟',
        'المنسّق المُدار هي خدمة اختيارية يتولى فيها فريق تيمات إدارة المجتمعات بالكامل وجدولة فعالياتها ومتابعة مزودي الخدمة نيابة عن الشركة، وهي مناسبة للفرق التي لا تملك وقتاً داخلياً للإشراف.',
    ],
];

export default function HowItWorks() {
    const [journey, setJourney] = useState(0);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const active = JOURNEYS[journey];

    return (
        <MarketingLayout activeNav="/how-it-works">
            <Head title="كيف تعمل تيمات" />

            <PageHero
                eyebrow="الآلية خطوة بخطوة"
                title="من الاهتمام إلى الفعالية المتكررة"
                lede="بنية تقنية متكاملة تربط الشركة والموظف ومزوّد الخدمة في مسار تلقائي خالٍ من التعقيد والتنسيق اليدوي."
                ring="-top-24 -right-24"
            />

            {/* ── The three journeys, one tab each ── */}
            <Band ground="page" gap={10}>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {JOURNEYS.map((j, i) => (
                        <button
                            key={j.key}
                            type="button"
                            onClick={() => setJourney(i)}
                            aria-pressed={journey === i}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm sm:text-base font-bold transition-colors select-none cursor-pointer border-[0.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime ${
                                journey === i
                                    ? 'bg-ink text-lime border-ink'
                                    : 'bg-surface text-ink border-ink/10 hover:border-ink/30'
                            }`}
                        >
                            <j.icon className="w-4 h-4" aria-hidden="true" />
                            <span>{j.tab}</span>
                        </button>
                    ))}
                </div>

                <div className="max-w-[760px] mx-auto pt-4 space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-extrabold font-arabic text-ink">{active.title}</h2>
                    </div>
                    <StepTimeline steps={active.steps} />
                </div>
            </Band>

            {/* ── What completion means — the unit of value ── */}
            <Band ground="ink" ring="-bottom-32 -left-32" borderTop borderBottom>
                <SectionHead
                    dark
                    eyebrow="دقة التوثيق"
                    title="ماذا يحدث عند اكتمال الفعالية؟"
                    lede="وحدة القيمة في تيمات هي «الفعالية المكتملة». عندما تنتهي الفعالية، تبدأ دورة تقنية محددة تضمن الدقة التامة:"
                    ledeSize="lg"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RingCard
                        icon={CircleCheckBig}
                        title="تسجيل الحضور التلقائي"
                        body="يُسجّل حضور المشاركين المؤكدين تلقائياً كمدخل أساسي في سجلات المنصة ولوحة الشركة."
                    />
                    <RingCard
                        icon={ShieldCheck}
                        title="نافذة تصحيح مدتها ٢٤ ساعة"
                        body="يملك قادة المجتمع ومسؤول الحساب في الشركة نافذة مدتها ٢٤ ساعة لتعديل أي حالة حضور قبل إغلاق السجل نهائياً."
                    />
                    <RingCard
                        icon={FileSpreadsheet}
                        title="تحديث مؤشرات التفاعل"
                        body="تُحتسب الفعالية المكتملة في معدلات التفاعل الإجمالية وسجل المجتمع دون أي تدخل يدوي."
                    />
                </div>
            </Band>

            {/* ── Financial transparency ── */}
            <Band ground="sand">
                <SectionHead
                    eyebrow="النزاهة والوضوح"
                    title="الشفافية المالية في تيمات"
                    lede="لا مفاجآت في الفواتير ولا رسوم خفية. نلتزم بقواعد محاسبية واضحة تحمي جميع الأطراف:"
                    ledeSize="lg"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <NumberCard
                        num="01"
                        title="تثبيت السعر الإجمالي"
                        body="السعر الإجمالي للفعالية يُثبَّت عند إنشائها ولا يتغيّر بتغيّر عدد المشاركين الحاضرين."
                    />
                    <NumberCard
                        num="02"
                        title="سجل مالي ثابت"
                        body="كل فعالية تولّد رقماً مرجعياً وسجلاً مالياً غير قابل للتعديل يوضح المسار وقيمة الفعالية."
                    />
                    <NumberCard
                        num="03"
                        title="سياسة استرداد واضحة"
                        body="في حال إلغاء الفعالية وفق الشروط الزمنية المعتمدة، تعود المبالغ مباشرة إلى محفظة المجتمع أو وسيلة الدفع الأصلية."
                    />
                </div>
            </Band>

            {/* ── FAQ accordion ── */}
            <section className="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-page text-ink">
                <div className={SHELL}>
                    <div className="space-y-10">
                    <div className="text-center max-w-[640px] mx-auto space-y-3">
                        <Eyebrow>الأسئلة الشائعة</Eyebrow>
                        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-arabic text-ink">
                            كل ما تحتاج معرفته عن آلية عمل تيمات
                        </h2>
                    </div>

                    <div className="space-y-4 max-w-[800px] mx-auto">
                        {FAQ.map(([q, a], i) => {
                            const open = openFaq === i;

                            return (
                                <div
                                    key={q}
                                    className={`rounded-[16px] border-[0.5px] transition-colors duration-150 overflow-hidden ${
                                        open ? 'bg-surface border-ink/30' : 'bg-surface/80 border-ink/10 hover:border-ink/20'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(open ? null : i)}
                                        aria-expanded={open}
                                        className="w-full py-5 px-6 text-right flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-ink cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
                                    >
                                        <span className="font-arabic leading-snug">{q}</span>
                                        <span
                                            className={`w-8 h-8 rounded-full bg-page border-[0.5px] border-ink/10 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                                                open ? 'rotate-180 bg-lime' : ''
                                            }`}
                                        >
                                            <ChevronDown className="w-4 h-4 text-ink" aria-hidden="true" />
                                        </span>
                                    </button>

                                    {open && (
                                        <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-ink/75 leading-relaxed border-t-[0.5px] border-ink/5">
                                            <p>{a}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        </div>
                    </div>
                </div>
            </section>

            <ClosingBand title="اطلب عرضاً مخصصاً لشركتك وشاهد كيف تعمل تيمات على أرض الواقع" />
        </MarketingLayout>
    );
}
