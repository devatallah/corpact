import { Head } from '@inertiajs/react';
import { Building, Database, FileText, LayoutDashboard, Lock, ShieldCheck, Wallet } from 'lucide-react';
import {
    Band,
    ClosingBand,
    CtaButton,
    Eyebrow,
    FeatureCard,
    InkIconCard,
    PageHero,
    SectionHead,
    SoftIconCard,
    SplitRules,
} from '@/components/marketing/ui';
import MarketingLayout from '@/layouts/marketing-layout';

const GOVERNANCE = [
    'اعتماد المجتمعات الجديدة قبل إطلاق فعالياتها لضمان التوافق مع قيم وثقافة الشركة.',
    'تحديد الميزانية وسقف الإنفاق لكل مجتمع أو قسم بمرونة تامة.',
    'متابعة الحضور الموثّق والفعاليات المكتملة أولاً بأول.',
    'إمكانية إسناد المهام للمنسّق المُدار لضمان أعلى مستويات الفعالية التشغيلية.',
];

export default function ForCompanies() {
    return (
        <MarketingLayout activeNav="/for-companies">
            <Head title="حلول الشركات" />

            <PageHero
                eyebrow="حلول الشركات"
                title="ثقافة تُقاس، لا تُفترض"
                lede="حوّل المبادرات المتفرقة إلى مجتمعات حقيقية مستمرة، واجعل التقارب بين فرق العمل أثراً ملموساً تدعمه بيانات دقيقة."
                actions={
                    <>
                        <CtaButton href="/contact">احجز عرضاً لفريقك</CtaButton>
                        <CtaButton href="/model" variant="outline">
                            استكشف النموذج المالي
                        </CtaButton>
                    </>
                }
            />

            {/* ── What the company actually gets ── */}
            <Band ground="page">
                <SectionHead eyebrow="القيمة المضافة" title="ما الذي يحصل عليه فريقك مع تيمات؟" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeatureCard
                        icon={LayoutDashboard}
                        title="لوحة مؤشرات موثّقة"
                        body="بيانات فورية عن الفعاليات المكتملة، ومعدلات تفعيل الموظفين، والمجتمعات الأكثر نشاطاً لدعم قرارات إدارة رأس المال البشري."
                    />
                    <FeatureCard
                        icon={Wallet}
                        title="تحكّم دقيق في الميزانية"
                        body="محفظة مالية واضحة تمنع تجاوز النفقات، مع تقارير شهرية مفصلة لكل ريال يُصرف على فعاليات الموظفين."
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="صلاحيات متعددة المستويات"
                        body="أدوات مخصصة لمسؤول الحساب في الشركة لاعتماد قادة المجتمعات وتحديد الضوابط والموافقة على الأنشطة."
                    />
                    <FeatureCard
                        icon={FileText}
                        title="تقارير دورية جاهزة"
                        body="ملخصات تنفيذية دورية توضح أثر المنصة على اندماج الفرق وتفاعلهم الإيجابي المستمر."
                    />
                </div>
            </Band>

            {/* ── Governance: the split-rules band ── */}
            <Band ground="ink" ring="top-1/2 -translate-y-1/2 -right-40" ringSize={600} borderTop borderBottom>
                <SplitRules
                    dark
                    rules={GOVERNANCE}
                    head={
                        <div className="space-y-4">
                            <Eyebrow tone="lime">الحوكمة والأمان</Eyebrow>
                            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold font-arabic text-white leading-tight">
                                التحكم والصلاحيات لمسؤول الحساب في الشركة
                            </h2>
                            <p className="text-white/80 text-base leading-[1.8]">
                                صُممت تيمات لتمنح الشركات السيطرة الكاملة على البيئة المؤسسية دون إغراق المسؤولين في التفاصيل اليومية:
                            </p>
                        </div>
                    }
                />
            </Band>

            {/* ── Privacy and data protection ── */}
            <Band ground="sand">
                <SectionHead
                    eyebrow="حماية البيانات"
                    title="الخصوصية والأمان في كل تفاعل"
                    lede="نلتزم بأعلى معايير أمن المعلومات والخصوصية المؤسسية داخل المملكة العربية السعودية:"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InkIconCard
                        icon={Database}
                        title="بيانات داخل المنصة"
                        body="جميع التفاعلات وسجلات الحضور والاهتمامات موثّقة داخل بيئة مشفرة ومحمية لا تعتمد على قنوات تواصل خارجية غير منضبطة."
                    />
                    <InkIconCard
                        icon={Lock}
                        title="صلاحيات وصول مقيدة"
                        body="وصول موجه فقط للمسؤولين المعتمدين مع فصل كامل لسجلات كل شركة ومجتمعاتها."
                    />
                    <InkIconCard
                        icon={ShieldCheck}
                        title="سجلات تدقيق مالية"
                        body="كل عملية خصم أو تسوية تملك سجلاً محاسبياً واضحاً قابل للمطابقة والمراجعة في أي وقت."
                    />
                </div>
            </Band>

            {/* ── Who this is honestly for ── */}
            <Band ground="page">
                <SectionHead
                    eyebrow="الملاءمة التشغيلية"
                    title="لمن تصلح تيمات؟"
                    lede="نطرح حلولنا بصدق ووضوح للشركات التي تحقق معها المنصة أعلى عائد على الاستثمار في بيئة العمل:"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SoftIconCard
                        icon={Building}
                        title="شركات تضم ٥٠ موظفاً فأكثر"
                        body="حيث تتسع قاعدة الاهتمامات وتتنوع الهوايات وتبرز الحاجة لمجتمعات فرعية متعددة."
                    />
                    <SoftIconCard
                        icon={Building}
                        title="فرق عمل موزّعة على عدة مواقع أو مكاتب"
                        body="عندما يحتاج الموظفون في الفروع المختلفة إلى مساحات مشتركة للتواصل الواقعي وبناء العلاقات المهنية."
                    />
                    <SoftIconCard
                        icon={Building}
                        title="شركات تملك برامج رفاهية موظفين وتبحث عن أثر مستمر"
                        body="لمن يرغب في تجاوز الفعاليات السنوية المعزولة وبناء ثقافة تواصل تتكرر أسبوعياً وشهرياً."
                    />
                </div>
            </Band>

            <ClosingBand title="احجز عرضاً تقديمياً مخصصاً لفريقك وشاهد أثر المنصة بالأرقام والمؤشرات" cta="احجز عرضاً لفريقك" />
        </MarketingLayout>
    );
}
