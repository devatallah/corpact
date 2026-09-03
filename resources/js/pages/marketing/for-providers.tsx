import { Head } from '@inertiajs/react';
import { Building2, CalendarCheck, Check, Receipt, Repeat } from 'lucide-react';
import {
    Band,
    CheckRow,
    ClosingBand,
    CtaButton,
    Eyebrow,
    FeatureCard,
    FIELD,
    Label,
    PageHero,
    SectionHead,
    SHELL,
    StepFlowCard,
    SubmitButton,
} from '@/components/marketing/ui';
import MarketingLayout from '@/layouts/marketing-layout';

const STEPS: [string, string][] = [
    ['تقديم الطلب المبدئي', 'تعبئة النموذج بالمعلومات الأساسية حول المرفق وسعته وموقعه الجغرافي ونوع الأنشطة المقدمة.'],
    ['توثيق المرفق والخدمات', 'مراجعة معايير الجودة والتأكد من مطابقة المرفق لمتطلبات استضافة مجموعات الشركات.'],
    ['ضبط التوفّر والأسعار المعتمدة', 'تحديد فترات التوفّر والسعر الإجمالي للفعاليات وإدراجه في محرك اقتراحات النظام.'],
    ['استقبال أول فعالية', 'تلقي أول فعالية من مجتمع شركة وتأكيد الحضور وبدء الدورة المتكررة.'],
];

const CATEGORIES = [
    'رياضات المضرب (بادل، تنس، ريشة طائرة، إسكواش)',
    'الملاعب الجماعية (كرة قدم، طائرة، سلة)',
    'صالات اللياقة البدنية والكروس فيت المتخصصة',
    'الأنشطة المائية والسباحة ومراكز التجديف',
    'أنشطة المغامرات والتسلق ومسارات الرماية',
    'مراكز الأنشطة الذهنية، غرف الألغاز، والألعاب اللوحية',
    'استوديوهات الفنون والحرف وورش الطبخ التفاعلية',
    'صالات الرياضات الإلكترونية والمحاكاة التنافسية',
];

const CITIES: [string, string][] = [
    ['الرياض', 'الرياض (المرحلة الحالية)'],
    ['جدة', 'جدة (قريباً)'],
    ['المنطقة الشرقية', 'المنطقة الشرقية (قريباً)'],
];

const ACTIVITY_OPTIONS: [string, string][] = [
    ['', 'اختر نوع النشاط'],
    ['padel-racket', 'رياضات المضرب (بادل، تنس، إسكواش)'],
    ['team-sports', 'ملاعب جماعية (كرة قدم، طائرة، سلة)'],
    ['fitness', 'لياقة بدنية وكروس فيت'],
    ['water', 'أنشطة مائية وسباحة'],
    ['adventure', 'مغامرات وتسلق ورماية'],
    ['mind-games', 'أنشطة ذهنية وغرف ألغاز وألعاب لوحية'],
    ['arts-cooking', 'فنون وحرف وورش طبخ'],
    ['esports', 'رياضات إلكترونية ومحاكاة'],
    ['other', 'أخرى'],
];

export default function ForProviders() {
    return (
        <MarketingLayout activeNav="/for-providers">
            <Head title="شبكة مزودي الخدمة" />

            <PageHero
                eyebrow="شركاء المرافق والأنشطة"
                title="طلب متكرر، لا حجوزات متفرقة"
                lede="استقبل مجموعات شركات مؤكدة وفق جداول ثابتة، واملأ فترات الإشغال المنخفض مع تسوية مالية دقيقة لكل فعالية مكتملة."
                ring="-top-24 -right-24"
                actions={
                    <>
                        <CtaButton href="#join">انضم كمزوّد خدمة</CtaButton>
                        <CtaButton href="/activities" variant="outline">
                            دليل الأنشطة
                        </CtaButton>
                    </>
                }
            />

            {/* ── Why providers partner ── */}
            <Band ground="page">
                <SectionHead eyebrow="مزايا الشراكة" title="لماذا يفضل مزودو الخدمة الشراكة مع تيمات؟" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeatureCard
                        icon={Repeat}
                        title="فعاليات مجدولة تتكرر"
                        body="مجتمعات الموظفين تمارس أنشطتها بانتظام دوري (أسبوعي/شهري)، مما يضمن تدفقاً متكرراً وثابتاً للإيرادات."
                    />
                    <FeatureCard
                        icon={Building2}
                        title="مجموعات مؤكدة من شركات"
                        body="التعامل مع مجموعات مؤسسية منظمة وملتزمة بالحضور والمواعيد دون إهدار لسعة المرفق."
                    />
                    <FeatureCard
                        icon={Receipt}
                        title="تسوية مالية واضحة"
                        body="تحويلات مالية دورية دقيقة ومطابقة لكل فعالية مكتملة دون تأخير أو خلافات محاسبية."
                    />
                    <FeatureCard
                        icon={CalendarCheck}
                        title="تعبئة أوقات منخفضة الإشغال"
                        body="إمكانية توجيه فعاليات الشركات في الفترات التي تشهد طلباً منخفضاً لتحقيق الاستفادة القصوى من طاقتك الاستيعابية."
                    />
                </div>
            </Band>

            {/* ── Joining, four steps across ── */}
            <Band ground="ink" ring="-bottom-32 -left-32" borderTop borderBottom>
                <SectionHead dark eyebrow="خطوات الانضمام" title="كيف ينضم مزوّد الخدمة إلى شبكة تيمات؟" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {STEPS.map(([title, body], i) => (
                        <StepFlowCard key={title} dark num={String(i + 1).padStart(2, '0')} title={title} body={body} />
                    ))}
                </div>
            </Band>

            {/* ── The categories we recruit ── */}
            <Band ground="sand" gap={8}>
                <SectionHead
                    eyebrow="نطاق الخدمات"
                    title="الفئات التي نبحث عنها في شبكة تيمات"
                    lede="نستقطب المرافق المتميزة في مدينة الرياض عبر عدة قطاعات حيوية:"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CATEGORIES.map((c) => (
                        <CheckRow key={c} icon={Check}>
                            {c}
                        </CheckRow>
                    ))}
                </div>
            </Band>

            {/* ── The application form ── */}
            <section id="join" className="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-page text-ink">
                <div className={SHELL}>
                    <div className="max-w-[800px] mx-auto space-y-8">
                        <div className="text-center space-y-3">
                            <Eyebrow>سجّل مرفقك الآن</Eyebrow>
                            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-arabic text-ink">
                                انضم كمزوّد خدمة معتمد
                            </h2>
                            <p className="text-ink/70 text-base max-w-[560px] mx-auto">
                                أدخل بيانات المرفق وسيتواصل معك فريق الشراكات خلال يومي عمل لإتمام التوثيق.
                            </p>
                        </div>

                        <form className="p-6 sm:p-8 lg:p-10 rounded-[16px] bg-surface border-[0.5px] border-ink/10 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="provider-facility" required>
                                        اسم المنشأة / المرفق
                                    </Label>
                                    <input
                                        id="provider-facility"
                                        type="text"
                                        required
                                        placeholder="مثال: ملاعب أرينا الرياض"
                                        className={FIELD}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="provider-city" required>
                                        المدينة
                                    </Label>
                                    <select id="provider-city" required className={`${FIELD} cursor-pointer`}>
                                        {CITIES.map(([value, text]) => (
                                            <option key={value} value={value}>
                                                {text}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="provider-activity" required>
                                        نوع النشاط الأساسي
                                    </Label>
                                    <select id="provider-activity" required className={`${FIELD} cursor-pointer`}>
                                        {ACTIVITY_OPTIONS.map(([value, text]) => (
                                            <option key={text} value={value}>
                                                {text}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="provider-capacity" required>
                                        السعة القصوى للفعالية الواحدة
                                    </Label>
                                    <input
                                        id="provider-capacity"
                                        type="text"
                                        required
                                        placeholder="مثال: 20 إلى 50 شخصاً"
                                        className={FIELD}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="provider-contact-name">اسم المشرف أو مسؤول المنشأة</Label>
                                    <input id="provider-contact-name" type="text" placeholder="الاسم" className={FIELD} />
                                </div>
                                <div>
                                    <Label htmlFor="provider-phone" required>
                                        رقم جوال التواصل
                                    </Label>
                                    <input
                                        id="provider-phone"
                                        type="tel"
                                        dir="ltr"
                                        required
                                        placeholder="05XXXXXXXX"
                                        className={`${FIELD} text-right`}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="provider-notes">ملاحظات عن المرفق أو أوقات التوفر المفضلة (اختياري)</Label>
                                <textarea
                                    id="provider-notes"
                                    rows={3}
                                    placeholder="تفاصيل التجهيزات، التوفر الصباحي أو المسائي..."
                                    className={FIELD}
                                />
                            </div>

                            <div>
                                <SubmitButton>
                                    <Building2 className="w-4 h-4 ml-2" aria-hidden="true" />
                                    تقديم طلب الانضمام
                                </SubmitButton>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <ClosingBand title="سجّل مرفقك مع تيمات وابدأ في استقبال فعاليات الشركات المجدولة" cta="سجّل الآن" href="#join" />
        </MarketingLayout>
    );
}
