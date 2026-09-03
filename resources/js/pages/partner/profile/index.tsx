import { Head, useForm } from '@inertiajs/react';
import { Store } from 'lucide-react';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Field,
    INPUT,
    Note,
    PageHeader,
} from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';
import { partnerStatus } from '@/lib/status';

/**
 * H §17 — ملف المرفق.
 *
 * The current password is required on every save, including one that only
 * changes a phone number: this account accepts bookings and owns the bank
 * details, so an unattended session must not be able to rewrite it.
 */
export default function PartnerProfile({
    partner,
}: {
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
                title={partner.trade_name || partner.name}
                subtitle="بياناتك كما تظهر للشركات في نتائج البحث وعلى الطلبات."
                actions={
                    <Badge tone={partnerStatus(partner.status).tone}>
                        {partnerStatus(partner.status).label}
                    </Badge>
                }
            />

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
