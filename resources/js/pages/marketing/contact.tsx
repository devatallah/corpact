import { Head } from '@inertiajs/react';
import { Globe, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { Eyebrow, FIELD, Label, PageHero, SHELL, SubmitButton } from '@/components/marketing/ui';
import MarketingLayout from '@/layouts/marketing-layout';

const HEADCOUNT: [string, string][] = [
    ['', 'اختر نطاق عدد الموظفين'],
    ['less-than-50', 'أقل من ٥٠ موظفاً'],
    ['50-200', '٥٠ إلى ٢٠٠ موظف'],
    ['201-500', '٢٠١ إلى ٥٠٠ موظف'],
    ['500-plus', 'أكثر من ٥٠٠ موظف'],
];

const TRACKS: [string, string][] = [
    ['', 'اختر المسار المالي'],
    ['community-wallet', 'مسار محفظة المجتمع (الشركة تتحمل التكلفة)'],
    ['employee-pay', 'مسار دفع الموظف (الموظف يدفع حصته)'],
    ['undecided', 'غير محدد بعد (نحتاج استشارة)'],
];

/** One row of the direct-channels list: lime disc for the links, tinted for the facts. */
function Channel({
    icon: Icon,
    label,
    value,
    href,
    ltr = false,
    divider = false,
}: {
    icon: typeof Mail;
    label: string;
    value: string;
    href?: string;
    ltr?: boolean;
    divider?: boolean;
}) {
    const body = (
        <>
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    href ? 'bg-lime text-ink' : 'bg-white/10 text-lime'
                }`}
            >
                <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
                <span className="text-[11px] text-white/50">{label}</span>
                {ltr ? (
                    <span dir="ltr" className={`font-sans text-xs sm:text-sm text-right ${href ? 'font-bold' : ''}`}>
                        {value}
                    </span>
                ) : (
                    <span className="text-xs sm:text-sm">{value}</span>
                )}
            </div>
        </>
    );

    const shell = `flex items-center gap-3 text-white/80 ${divider ? 'pt-2 border-t-[0.5px] border-white/10' : ''}`;

    return href ? (
        <a
            href={href}
            {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={`${shell} hover:text-lime transition-colors`}
        >
            {body}
        </a>
    ) : (
        <div className={shell}>{body}</div>
    );
}

export default function Contact() {
    return (
        <MarketingLayout activeNav="">
            <Head title="اطلب عرضاً" />

            <PageHero
                eyebrow="الخطوة الأولى"
                title="ابدأ تحويل الاهتمامات إلى استمرار"
                lede="أرسل بيانات شركتك وسيقوم فريق تيمات بالرد عليك بعرض مخصص خلال يوم عمل واحد."
                tight
            />

            <section className="relative py-12 md:py-16 lg:py-[72px] overflow-hidden bg-page text-ink">
                <div className={SHELL}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        <div className="lg:col-span-8">
                            <form className="p-6 sm:p-8 lg:p-10 rounded-[16px] bg-surface border-[0.5px] border-ink/10 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <Label htmlFor="lead-name" required>
                                            الاسم الكامل
                                        </Label>
                                        <input id="lead-name" type="text" required placeholder="مثال: محمد بن سعود" className={FIELD} />
                                    </div>
                                    <div>
                                        <Label htmlFor="lead-company" required>
                                            اسم الشركة
                                        </Label>
                                        <input
                                            id="lead-company"
                                            type="text"
                                            required
                                            placeholder="مثال: شركة الرواد للتقنية"
                                            className={FIELD}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <Label htmlFor="lead-email" required>
                                            البريد الإلكتروني للعمل
                                        </Label>
                                        <input
                                            id="lead-email"
                                            type="email"
                                            dir="ltr"
                                            required
                                            placeholder="name@company.com"
                                            className={`${FIELD} text-right`}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lead-phone" required>
                                            رقم الجوال
                                        </Label>
                                        <input
                                            id="lead-phone"
                                            type="tel"
                                            dir="ltr"
                                            required
                                            placeholder="05XXXXXXXX"
                                            className={`${FIELD} text-right`}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <Label htmlFor="lead-employees" required>
                                            عدد الموظفين
                                        </Label>
                                        <select id="lead-employees" required className={`${FIELD} cursor-pointer`}>
                                            {HEADCOUNT.map(([value, text]) => (
                                                <option key={text} value={value}>
                                                    {text}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="lead-track" required>
                                            المسار المالي المفضّل
                                        </Label>
                                        <select id="lead-track" required className={`${FIELD} cursor-pointer`}>
                                            {TRACKS.map(([value, text]) => (
                                                <option key={text} value={value}>
                                                    {text}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="lead-message">رسالة أو ملاحظات إضافية (اختياري)</Label>
                                    <textarea
                                        id="lead-message"
                                        rows={4}
                                        placeholder="أخبرنا عن التحديات أو التطلعات الحالية لفريقك..."
                                        className={FIELD}
                                    />
                                </div>

                                <div>
                                    <SubmitButton>
                                        <Send className="w-4 h-4 ml-2" aria-hidden="true" />
                                        أرسل الطلب
                                    </SubmitButton>
                                </div>
                            </form>
                        </div>

                        {/* Direct channels, for anyone who would rather not fill a form. */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-6 sm:p-8 rounded-[16px] bg-ink text-white border-[0.5px] border-white/10 space-y-6">
                                <div>
                                    <Eyebrow tone="lime">قنوات الدعم</Eyebrow>
                                    <h3 className="text-xl font-bold font-arabic text-white mb-2">تواصل مباشر</h3>
                                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                                        يمكنك أيضاً التواصل مع مسؤولي الحسابات لدينا مباشرة عبر القنوات المعتمدة:
                                    </p>
                                </div>

                                <div className="space-y-4 text-sm pt-2 border-t-[0.5px] border-white/10">
                                    <Channel
                                        icon={Mail}
                                        label="البريد الإلكتروني"
                                        value="contact@teamat.app"
                                        href="mailto:contact@teamat.app"
                                        ltr
                                    />
                                    <Channel
                                        icon={MessageCircle}
                                        label="واتساب الأعمال"
                                        value="+966 50 000 0000"
                                        href="https://wa.me/966500000000"
                                        ltr
                                    />
                                    <Channel icon={MapPin} label="المقر" value="تيمات — الرياض، المملكة العربية السعودية" divider />
                                    <Channel icon={Globe} label="الموقع الرسمي" value="teamat.app" ltr />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
