import { Head, useForm } from '@inertiajs/react';
import { Settings, ShieldCheck } from 'lucide-react';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import { Badge, Button, Card, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';

/**
 * H §5 — إعدادات الشركة.
 *
 * These five switches decide who may spend the company's money and on whose
 * behalf. `default_subsidy` is stored in halalas — the field converts, and
 * says the riyal figure back to the reader, because a subsidy entered as 50
 * when the system expects 5000 is a silent hundred-fold error.
 */
const FUNDING_LABELS: Record<string, { label: string; hint: string }> = {
    community_wallet: {
        label: 'محفظة المجتمع',
        hint: 'تُخصم تكلفة الفعالية كاملة من رصيد المجتمع — لا يدفع الموظف شيئاً.',
    },
    employee_paid: {
        label: 'على حساب الموظف',
        hint: 'يدفع كل مشارك نصيبه بنفسه عبر بوابة الدفع.',
    },
    mixed: {
        label: 'مشترك',
        hint: 'تدعم الشركة جزءاً من التكلفة، ويدفع الموظف الباقي.',
    },
};

export default function CompanySettings({
    settings,
    fundingModes,
    official,
}: {
    official: {
        name: string;
        commercial_registration: string | null;
        vat_number: string | null;
        domain: string | null;
    };
    settings: {
        employee_can_create_event: boolean;
        default_funding_mode: string;
        default_subsidy: number;
        registration_close_hours: number;
        allow_absence_marking: boolean;
    };
    fundingModes: string[];
}) {
    const form = useForm({
        employee_can_create_event: settings.employee_can_create_event,
        default_funding_mode: settings.default_funding_mode,
        default_subsidy: String(settings.default_subsidy),
        registration_close_hours: String(settings.registration_close_hours),
        allow_absence_marking: settings.allow_absence_marking,
    });

    const subsidyRiyals = (
        Number(form.data.default_subsidy || 0) / 100
    ).toFixed(2);

    return (
        <CompanyLayout>
            <Head title="إعدادات الشركة" />

            <PageHeader
                icon={Settings}
                title="إعدادات حساب المنشأة والسياسات"
                badge="إعدادات الحوكمة"
                subtitle="النطاق البريدي، وسياسات الدعم الافتراضية، والضوابط التي تُبنى عليها كل فعالية جديدة."
            />

            <Card padding="p-4" className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <ShieldCheck className="w-4 h-4 text-ink" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">البيانات الرسمية للمنشأة</h2>
                    <Badge tone="info">حماية أمنية مشددة</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <OfficialField label="اسم المنشأة" value={official.name} />
                    <OfficialField label="رقم السجل التجاري" value={official.commercial_registration} mono />
                    <OfficialField label="الرقم الضريبي (ZATCA)" value={official.vat_number} mono />
                    <OfficialField
                        label="النطاق البريدي للموظفين"
                        value={official.domain ? `@${official.domain}` : null}
                        mono
                    />
                </div>

                <Note tone="warning" title="لماذا لا يُعدَّل النطاق البريدي من هنا؟">
                    هذا النطاق يسمح بالتسجيل المباشر والتحقق الفوري لكل من يملك بريداً عليه. تغييره يفتح الباب لمن ليس موظفاً
                    لديك، فهو صلاحية أدمن تيمات وحده — راجع مدير حسابك لتعديله.
                </Note>
            </Card>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.put('/company/settings', { preserveScroll: true });
                }}
                className="space-y-6"
            >
                <FormSection title="من ينشئ الفعاليات">
                    <Toggle
                        label="السماح للموظفين بإنشاء الفعاليات"
                        hint="عند الإيقاف، ينحصر إنشاء الفعاليات في قادة المجتمعات ومسؤول الحساب."
                        checked={form.data.employee_can_create_event}
                        onChange={(value) =>
                            form.setData('employee_can_create_event', value)
                        }
                    />

                    <Toggle
                        label="السماح بتسجيل الغياب"
                        hint="يمكّن قائد المجتمع من تعليم من لم يحضر — وعليه تُبنى نسبة الحضور في تقاريرك."
                        checked={form.data.allow_absence_marking}
                        onChange={(value) =>
                            form.setData('allow_absence_marking', value)
                        }
                    />
                </FormSection>

                <FormSection
                    title="التمويل الافتراضي"
                    hint="يمكن لقائد المجتمع تغييره لكل فعالية على حدة — هذا ما يبدأ به."
                >
                    <FormGrid columns={2}>
                        <Field
                            label="مصدر التمويل"
                            error={form.errors.default_funding_mode}
                            required
                        >
                            <select
                                className={INPUT}
                                value={form.data.default_funding_mode}
                                onChange={(event) =>
                                    form.setData(
                                        'default_funding_mode',
                                        event.target.value,
                                    )
                                }
                            >
                                {fundingModes.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {FUNDING_LABELS[mode]?.label ?? mode}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field
                            label="قيمة الدعم (بالهللة)"
                            error={form.errors.default_subsidy}
                            hint={`= ${subsidyRiyals} ريال لكل مشارك.`}
                            required
                        >
                            <input
                                type="number"
                                min="0"
                                dir="ltr"
                                className={INPUT}
                                value={form.data.default_subsidy}
                                onChange={(event) =>
                                    form.setData(
                                        'default_subsidy',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    </FormGrid>

                    <Note
                        title={
                            FUNDING_LABELS[form.data.default_funding_mode]
                                ?.label ?? 'مصدر التمويل'
                        }
                    >
                        {FUNDING_LABELS[form.data.default_funding_mode]?.hint ??
                            '—'}
                    </Note>
                </FormSection>

                <FormSection title="أفق التوليد الآلي المسبق" hint="مضبوط نظامياً على 14 يوماً — القالب يولّد كل فعالية قبل موعدها بأسبوعين.">
                    <div className="rounded-xl border-[0.5px] border-ink/12 bg-page px-3.5 py-3 flex items-center justify-between">
                        <span className="text-xs text-ink/70">أفق التوليد</span>
                        <span className="font-mono text-sm font-black text-ink">14 يوماً</span>
                    </div>
                </FormSection>

                <FormSection title="إغلاق التسجيل">
                    <Field
                        label="ساعات الإغلاق قبل الموعد"
                        error={form.errors.registration_close_hours}
                        hint="بعدها لا يُقبل تسجيل جديد ولا انسحاب — والحجز عند المرفق يصبح نهائياً. من ساعة إلى 168 ساعة (أسبوع)."
                        required
                    >
                        <input
                            type="number"
                            min="1"
                            max="168"
                            dir="ltr"
                            className={INPUT}
                            value={form.data.registration_close_hours}
                            onChange={(event) =>
                                form.setData(
                                    'registration_close_hours',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                </FormSection>

                <ComplianceNote />

                <FormActions>
                    <Button type="submit" disabled={form.processing}>
                        حفظ الإعدادات
                    </Button>
                </FormActions>
            </form>
        </CompanyLayout>
    );
}

function Toggle({
    label,
    hint,
    checked,
    onChange,
}: {
    label: string;
    hint: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-[0.5px] border-ink/12 bg-page p-3.5">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink/25 accent-ink"
            />
            <span className="min-w-0">
                <span className="block text-xs font-extrabold text-ink">
                    {label}
                </span>
                <span className="block text-[11px] leading-relaxed text-ink/55">
                    {hint}
                </span>
            </span>
        </label>
    );
}

/** حقل رسمي يُعرض ولا يُحرَّر — بمظهر يقول ذلك قبل أن يُنقر. */
function OfficialField({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) {
    return (
        <div className="rounded-xl border-[0.5px] border-ink/12 bg-page px-3 py-2">
            <span className="block text-[10px] text-ink/50">{label}</span>
            <span className={`block text-xs font-bold text-ink ${mono ? 'font-mono' : ''}`} dir={mono ? 'ltr' : undefined}>
                {value ?? 'غير مسجَّل'}
            </span>
        </div>
    );
}

/** ملاحظة الامتثال — تظهر مرة واحدة أسفل الإعدادات. */
export function ComplianceNote() {
    return (
        <Note title="استضافة البيانات والامتثال">
            جميع البيانات مستضافة داخل المملكة العربية السعودية، وممتثلة لنظام حماية البيانات الشخصية (PDPL) والمعايير المحاسبية
            لهيئة الزكاة والضريبة والجمارك (ZATCA).
        </Note>
    );
}
