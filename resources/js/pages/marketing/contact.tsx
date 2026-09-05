import { Head, useForm, usePage } from '@inertiajs/react';
import { Globe, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import {
    Eyebrow,
    FIELD,
    Label,
    PageHero,
    SHELL,
    SubmitButton,
} from '@/components/marketing/ui';
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
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    href ? 'bg-lime text-ink' : 'bg-white/10 text-lime'
                }`}
            >
                <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
                <span className="text-[11px] text-white/50">{label}</span>
                {ltr ? (
                    <span
                        dir="ltr"
                        className={`text-right font-sans text-xs sm:text-sm ${href ? 'font-bold' : ''}`}
                    >
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
            {...(href.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            className={`${shell} transition-colors hover:text-lime`}
        >
            {body}
        </a>
    ) : (
        <div className={shell}>{body}</div>
    );
}

/** رسالة خطأ حقل واحد، بنفس نبرة بقية النماذج. */
function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1.5 text-[13px] font-bold text-danger">{message}</p>
    );
}

export default function Contact() {
    const flash = (usePage().props.flash ?? {}) as { success?: string };

    const form = useForm({
        name: '',
        company_name: '',
        email: '',
        phone: '',
        employees_range: '',
        financial_track: '',
        message: '',
    });

    return (
        <MarketingLayout activeNav="">
            <Head title="اطلب عرضاً" />

            <PageHero
                eyebrow="الخطوة الأولى"
                title="ابدأ تحويل الاهتمامات إلى استمرار"
                lede="أرسل بيانات شركتك وسيقوم فريق تيمات بالرد عليك بعرض مخصص خلال يوم عمل واحد."
                tight
            />

            <section className="relative overflow-hidden bg-page py-12 text-ink md:py-16 lg:py-[72px]">
                <div className={SHELL}>
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
                        <div className="lg:col-span-8">
                            <form
                                id="form"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.post('/support', {
                                        preserveScroll: true,
                                        onSuccess: () => form.reset(),
                                    });
                                }}
                                className="space-y-6 rounded-[16px] border-[0.5px] border-ink/10 bg-surface p-6 sm:p-8 lg:p-10"
                            >
                                {flash.success && (
                                    <p className="rounded-[10px] border-[0.5px] border-success/25 bg-success-tint px-4 py-3 text-sm font-bold text-success">
                                        {flash.success}
                                    </p>
                                )}

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="lead-name" required>
                                            الاسم الكامل
                                        </Label>
                                        <input
                                            id="lead-name"
                                            type="text"
                                            required
                                            placeholder="مثال: محمد بن سعود"
                                            className={FIELD}
                                            name="name"
                                            value={form.data.name}
                                            onChange={(event) =>
                                                form.setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <FieldError
                                            message={form.errors.name}
                                        />
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
                                            name="company_name"
                                            value={form.data.company_name}
                                            onChange={(event) =>
                                                form.setData(
                                                    'company_name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <FieldError
                                            message={form.errors.company_name}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                                            name="email"
                                            value={form.data.email}
                                            onChange={(event) =>
                                                form.setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <FieldError
                                            message={form.errors.email}
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
                                            name="phone"
                                            value={form.data.phone}
                                            onChange={(event) =>
                                                form.setData(
                                                    'phone',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <FieldError
                                            message={form.errors.phone}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <Label
                                            htmlFor="lead-employees"
                                            required
                                        >
                                            عدد الموظفين
                                        </Label>
                                        <select
                                            id="lead-employees"
                                            required
                                            className={`${FIELD} cursor-pointer`}
                                            name="employees_range"
                                            value={form.data.employees_range}
                                            onChange={(event) =>
                                                form.setData(
                                                    'employees_range',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            {HEADCOUNT.map(([value, text]) => (
                                                <option
                                                    key={text}
                                                    value={value}
                                                >
                                                    {text}
                                                </option>
                                            ))}
                                        </select>
                                        <FieldError
                                            message={
                                                form.errors.employees_range
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lead-track" required>
                                            المسار المالي المفضّل
                                        </Label>
                                        <select
                                            id="lead-track"
                                            required
                                            className={`${FIELD} cursor-pointer`}
                                            name="financial_track"
                                            value={form.data.financial_track}
                                            onChange={(event) =>
                                                form.setData(
                                                    'financial_track',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            {TRACKS.map(([value, text]) => (
                                                <option
                                                    key={text}
                                                    value={value}
                                                >
                                                    {text}
                                                </option>
                                            ))}
                                        </select>
                                        <FieldError
                                            message={
                                                form.errors.financial_track
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="lead-message">
                                        رسالة أو ملاحظات إضافية (اختياري)
                                    </Label>
                                    <textarea
                                        id="lead-message"
                                        rows={4}
                                        placeholder="أخبرنا عن التحديات أو التطلعات الحالية لفريقك..."
                                        className={FIELD}
                                        name="message"
                                        value={form.data.message}
                                        onChange={(event) =>
                                            form.setData(
                                                'message',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <FieldError message={form.errors.message} />
                                </div>

                                <div>
                                    <SubmitButton disabled={form.processing}>
                                        <Send
                                            className="ml-2 h-4 w-4"
                                            aria-hidden="true"
                                        />
                                        {form.processing
                                            ? 'جارٍ الإرسال…'
                                            : 'أرسل الطلب'}
                                    </SubmitButton>
                                </div>
                            </form>
                        </div>

                        {/* Direct channels, for anyone who would rather not fill a form. */}
                        <div className="space-y-6 lg:col-span-4">
                            <div className="space-y-6 rounded-[16px] border-[0.5px] border-white/10 bg-ink p-6 text-white sm:p-8">
                                <div>
                                    <Eyebrow tone="lime">قنوات الدعم</Eyebrow>
                                    <h3 className="mb-2 font-arabic text-xl font-bold text-white">
                                        تواصل مباشر
                                    </h3>
                                    <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
                                        يمكنك أيضاً التواصل مع مسؤولي الحسابات
                                        لدينا مباشرة عبر القنوات المعتمدة:
                                    </p>
                                </div>

                                <div className="space-y-4 border-t-[0.5px] border-white/10 pt-2 text-sm">
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
                                    <Channel
                                        icon={MapPin}
                                        label="المقر"
                                        value="تيمات — الرياض، المملكة العربية السعودية"
                                        divider
                                    />
                                    <Channel
                                        icon={Globe}
                                        label="الموقع الرسمي"
                                        value="teamat.app"
                                        ltr
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
