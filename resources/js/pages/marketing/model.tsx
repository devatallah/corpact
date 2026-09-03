import { Head } from '@inertiajs/react';
import { Cpu, FileCheck, Receipt, RefreshCw, ShieldCheck, UserCheck, Users, Wallet } from 'lucide-react';
import { Band, ClosingBand, Eyebrow, FeatureCard, PageHero, RingCard, SectionHead, SHELL } from '@/components/marketing/ui';
import MarketingLayout from '@/layouts/marketing-layout';

/** The two tracks, compared row by row. Column A is the highlighted one. */
const COMPARISON: [string, string, string][] = [
    ['من يتحمّل تكلفة الفعالية؟', 'الشركة بالكامل عبر شحن محفظة المجتمع.', 'الموظف يدفع حصة الفرد المحددة لكل فعالية.'],
    ['التزام الشركة المالي', 'رسوم النظام + رصيد المحفظة المشحون.', 'رسوم النظام فقط لكل موظف مفعّل.'],
    ['سرعة التوسّع', 'مرتبطة بحجم الميزانية المخصصة للأنشطة.', 'توسّع غير محدود بعدد الفعاليات بتكلفة ثابتة على الشركة.'],
    [
        'الأنسب لـ',
        'الشركات التي تضع ميزانية رفاهية وتتحمل التكاليف.',
        'الشركات الكبيرة الراغبة بتمكين الموظفين بتكلفة تشغيلية منخفضة.',
    ],
];

export default function Model() {
    return (
        <MarketingLayout activeNav="/model">
            <Head title="النموذج المالي" />

            <PageHero
                eyebrow="النموذج المالي"
                title="نموذج واضح — تدفع مقابل ما يكتمل"
                lede="بنية تسعير عادلة ومباشرة ترتكز على القيمة المحققة والفعاليات المكتملة دون التزامات غامضة أو رسوم مخفية."
                ring="-top-24 -right-24"
            />

            {/* ── The three cost elements ── */}
            <Band ground="page">
                <SectionHead eyebrow="عناصر التكلفة" title="ثلاثة عناصر تشكل هيكل التسعير" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={Cpu}
                        title="رسوم النظام"
                        body="تُحتسب لكل موظف مفعّل، وتغطي الوصول الكامل للمنصة، وإدارة المجتمعات، ولوحة التحكم والتقارير الحية."
                    />
                    <FeatureCard
                        icon={Receipt}
                        title="حصة الفعالية"
                        body="تُدفع عبر محفظة المجتمع أو من الموظف مباشرة حسب المسار المختار، وتغطي تكلفة حجز المرفق والنشاط الفعلي."
                    />
                    <FeatureCard
                        icon={UserCheck}
                        title="المنسّق المُدار"
                        body="خدمة اختيارية تُضاف عند الحاجة ليتولى فريق تيمات الإشراف التشغيلي وجدولة الفعاليات نيابة عن الشركة."
                    />
                </div>
            </Band>

            {/* ── The two tracks, side by side ── */}
            <Band ground="sand" borderTop borderBottom>
                <SectionHead
                    eyebrow="مقارنة المسارين"
                    title="اختر المسار المالي الذي يلائم ميزانيتك"
                    lede="نوفر مسارين ماليين مرنين لتحقيق التوازن الأمثل بين التزام الشركة ومشاركة الموظف:"
                />

                {/* Wide table: scrolls in its own container rather than the page. */}
                <div className="bg-surface p-6 sm:p-8 rounded-[16px] border-[0.5px] border-ink/10">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-right border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b-[0.5px] border-ink/10">
                                    <th className="py-4 px-5 text-sm font-bold text-ink/60 font-sans uppercase">وجه المقارنة</th>
                                    <th className="py-4 px-5 text-base sm:text-lg font-extrabold text-ink bg-lime/15 rounded-t-[12px]">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-5 h-5 text-ink" aria-hidden="true" />
                                            <span>مسار محفظة المجتمع</span>
                                        </div>
                                    </th>
                                    <th className="py-4 px-5 text-base sm:text-lg font-extrabold text-ink bg-surface rounded-t-[12px] border-[0.5px] border-b-0 border-ink/10">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-5 h-5 text-ink" aria-hidden="true" />
                                            <span>مسار دفع الموظف</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-[0.5px] divide-ink/10 text-sm sm:text-base">
                                {COMPARISON.map(([aspect, wallet, employee]) => (
                                    <tr key={aspect} className="transition-colors hover:bg-black/[0.02]">
                                        <td className="py-5 px-5 font-bold text-ink align-top w-1/4">{aspect}</td>
                                        <td className="py-5 px-5 text-ink/85 bg-lime/10 leading-relaxed align-top w-[37.5%]">{wallet}</td>
                                        <td className="py-5 px-5 text-ink/85 bg-surface border-x-[0.5px] border-ink/10 leading-relaxed align-top w-[37.5%]">
                                            {employee}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Band>

            {/* ── Pricing principles ── */}
            <Band ground="ink" ring="-bottom-32 -left-32" borderBottom>
                <SectionHead dark eyebrow="مبادئ التسعير" title="الشفافية في كل مرحلة مالية" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RingCard
                        icon={ShieldCheck}
                        title="السعر يُثبَّت عند إنشاء الفعالية"
                        body="السعر الإجمالي للفعالية مع مزوّد الخدمة معتمد وثابت ولا يتأثر بتغير أعداد الحضور في اللحظات الأخيرة."
                    />
                    <RingCard
                        icon={RefreshCw}
                        title="الاسترداد يعود لوسيلة الدفع الأصلية"
                        body="في حال حدوث أي إلغاء وفق الشروط المعتمدة، تُعاد المبالغ فوراً لمحفظة المجتمع أو بطاقة الموظف."
                    />
                    <RingCard
                        icon={FileCheck}
                        title="سجل مالي دائم وغير قابل للتعديل"
                        body="كل معاملة مالية موثقة برقم مرجعي وتفاصيل كاملة تتيح لمسؤول الحساب في الشركة تدقيقها بسهولة."
                    />
                </div>
            </Band>

            {/* ── Why there is no public price list ── */}
            <section className="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-page text-ink">
                <div className={SHELL}>
                    <div className="max-w-[800px] mx-auto p-8 sm:p-10 rounded-[16px] bg-surface border-[0.5px] border-ink/10 text-center space-y-4">
                        <Eyebrow>تسعير مخصص</Eyebrow>
                        <h2 className="text-2xl sm:text-3xl font-extrabold font-arabic text-ink">احصل على عرض مالي مخصص لشركتك</h2>
                        <p className="text-ink/70 text-base sm:text-lg leading-relaxed max-w-[620px] mx-auto">
                            نظراً لأن القيمة النهائية لرسوم النظام تعتمد على عدد الموظفين المفعّلين والمسار المالي المختار، يقوم
                            فريقنا بإعداد عرض مالي مفصل يلائم حجم شركتك واحتياجاتها بدقة.
                        </p>
                    </div>
                </div>
            </section>

            <ClosingBand title="اطلب عرضاً مخصصاً لشركتك واكتشف الخيار المالي الأنسب لفرق عملك" cta="اطلب عرضاً مخصصاً" />
        </MarketingLayout>
    );
}
