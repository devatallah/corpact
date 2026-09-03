import { Head, Link, useForm } from '@inertiajs/react';
import { Store } from 'lucide-react';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import { Badge, Button, Card, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';
import { partnerStatus } from '@/lib/status';

/**
 * H §17 — ملف المرفق.
 *
 * The current password is required on every save, including one that only
 * changes a phone number: this account accepts bookings and owns the bank
 * details, so an unattended session must not be able to rewrite it.
 */
type Step = { key: string; label: string; hint: string; href: string; done: boolean; count?: number };

export default function PartnerProfile({
    partner,
    activation,
}: {
    activation: Step[];
    partner: {
        id: number;
        name: string;
        trade_name: string | null;
        email: string;
        contact_name: string | null;
        contact_phone: string | null;
        city: string | null;
        district: string | null;
        status: string;
        commercial_registration?: string | null;
    };
}) {
    const form = useForm({
        name: partner.name,
        contact_name: partner.contact_name ?? '',
        contact_phone: partner.contact_phone ?? '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    return (
        <PartnerLayout>
            <Head title="ملف المرفق" />

            <PageHeader
                icon={Store}
                title="ملف مزوّد الخدمة ومعالج التفعيل"
                subtitle="إدارة البيانات التجارية، والفروع، والوحدات، والحساب البنكي المعتمد للصرف."
                actions={
                    <Badge tone={partnerStatus(partner.status).tone}>
                        {partnerStatus(partner.status).label}
                    </Badge>
                }
            />

            {/* ── معالج التفعيل ── */}
            <Card padding="p-4" className="space-y-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h2 className="text-sm font-extrabold text-ink">خطوات التفعيل</h2>
                    <Badge tone={activation.every((step) => step.done) ? 'success' : 'warning'}>
                        {activation.filter((step) => step.done).length} من {activation.length} مكتملة
                    </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {activation.map((step, index) => (
                        <Link key={step.key} href={step.href} className="block">
                            <div
                                className={`rounded-xl border-[0.5px] p-3 h-full transition-colors ${
                                    step.done
                                        ? 'border-success/25 bg-success-tint'
                                        : 'border-warning/30 bg-warning-tint hover:border-warning/50'
                                }`}
                            >
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span
                                        className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 ${
                                            step.done ? 'bg-success text-white' : 'bg-warning text-white'
                                        }`}
                                    >
                                        {step.done ? '✓' : index + 1}
                                    </span>
                                    <span className="text-[11px] font-extrabold text-ink">{step.label}</span>
                                </div>
                                <span className="block text-[10px] text-ink/55">{step.hint}</span>
                                {step.count !== undefined && (
                                    <span className="block font-mono text-[10px] text-ink/45 mt-0.5">{step.count} مسجَّل</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {!activation.every((step) => step.done) && (
                    <Note tone="warning" title="لا تصلك طلبات قبل اكتمال الخطوات الأربع">
                        الشركات لا ترى مرافقك في الاقتراح الآلي حتى تكتمل الوحدات، ولا يُصرف لك حتى يُعتمد حسابك البنكي.
                    </Note>
                )}
            </Card>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.put('/partner/profile', {
                        preserveScroll: true,
                        onSuccess: () => form.setData('current_password', ''),
                    });
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات المرفق">
                    <FormGrid columns={2}>
                        <Field
                            label="اسم المنشأة"
                            error={form.errors.name}
                            required
                        >
                            <input
                                className={INPUT}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                        </Field>

                        <Field
                            label="الاسم التجاري"
                            hint="لتغييره راجع فريق تيمات — يظهر للشركات على الطلبات."
                        >
                            <input
                                className={`${INPUT} bg-ink/5 text-ink/60`}
                                value={partner.trade_name ?? '—'}
                                readOnly
                            />
                        </Field>

                        <Field
                            label="اسم مسؤول التواصل"
                            error={form.errors.contact_name}
                        >
                            <input
                                className={INPUT}
                                value={form.data.contact_name}
                                onChange={(event) =>
                                    form.setData(
                                        'contact_name',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>

                        <Field
                            label="جوال مسؤول التواصل"
                            error={form.errors.contact_phone}
                        >
                            <input
                                dir="ltr"
                                className={INPUT}
                                value={form.data.contact_phone}
                                onChange={(event) =>
                                    form.setData(
                                        'contact_phone',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>

                        <Field
                            label="البريد الإلكتروني"
                            hint="مفتاح الدخول — لتغييره راجع فريق تيمات."
                        >
                            <input
                                dir="ltr"
                                className={`${INPUT} bg-ink/5 text-ink/60`}
                                value={partner.email}
                                readOnly
                            />
                        </Field>

                        <Field label="المدينة">
                            <input
                                className={`${INPUT} bg-ink/5 text-ink/60`}
                                value={partner.city ?? '—'}
                                readOnly
                            />
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormSection
                    title="كلمة المرور"
                    hint="اترك حقلي الجديدة فارغين إن كنت تعدّل البيانات فقط."
                >
                    <FormGrid columns={2}>
                        <Field
                            label="كلمة المرور الجديدة"
                            error={form.errors.password}
                        >
                            <input
                                type="password"
                                dir="ltr"
                                autoComplete="new-password"
                                className={INPUT}
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                            />
                        </Field>

                        <Field label="تأكيد كلمة المرور الجديدة">
                            <input
                                type="password"
                                dir="ltr"
                                autoComplete="new-password"
                                className={INPUT}
                                value={form.data.password_confirmation}
                                onChange={(event) =>
                                    form.setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    </FormGrid>

                    <Field
                        label="كلمة المرور الحالية"
                        error={form.errors.current_password}
                        required
                    >
                        <input
                            type="password"
                            dir="ltr"
                            autoComplete="current-password"
                            className={INPUT}
                            value={form.data.current_password}
                            onChange={(event) =>
                                form.setData(
                                    'current_password',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>

                    <Note title="لماذا كلمة المرور في كل حفظ؟">
                        هذا الحساب يقبل الحجوزات ويملك بيانات التحويل البنكي.
                        تأكيد الهوية عند كل تعديل يمنع العبث بجلسة مفتوحة على
                        جهاز الاستقبال.
                    </Note>
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={form.processing}>
                        حفظ التغييرات
                    </Button>
                </FormActions>
            </form>
        </PartnerLayout>
    );
}
