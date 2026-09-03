import { Head, useForm } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import { Button, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';

/**
 * H §5 — ملف الشركة.
 *
 * Every save on this screen requires the current password, including a change
 * of nothing but the logo: this is the account that can move the company's
 * wallet, so an unattended open session must not be able to rewrite it.
 */
export default function CompanyProfile({
    company,
}: {
    company: {
        id: number;
        name: string;
        email: string;
        commercial_registration: string | null;
        contact_name: string | null;
        contact_phone: string | null;
        logo: string | null;
        sector: string | null;
        city: string | null;
    };
}) {
    const form = useForm<{
        name: string;
        commercial_registration: string;
        contact_name: string;
        contact_phone: string;
        current_password: string;
        password: string;
        password_confirmation: string;
        logo: File | null;
    }>({
        name: company.name,
        commercial_registration: company.commercial_registration ?? '',
        contact_name: company.contact_name ?? '',
        contact_phone: company.contact_phone ?? '',
        current_password: '',
        password: '',
        password_confirmation: '',
        logo: null,
    });

    return (
        <CompanyLayout>
            <Head title="ملف الشركة" />

            <PageHeader
                icon={Building2}
                title="ملف الشركة"
                subtitle="بيانات شركتك كما تظهر للمرافق وفي الفواتير."
            />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/company/profile', {
                        forceFormData: true,
                        preserveScroll: true,
                        // Laravel reads the method override from the body.
                        headers: { 'X-HTTP-Method-Override': 'PUT' },
                        onSuccess: () => form.setData('current_password', ''),
                    });
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات الشركة">
                    <FormGrid columns={2}>
                        <Field
                            label="اسم الشركة"
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
                            label="السجل التجاري"
                            error={form.errors.commercial_registration}
                        >
                            <input
                                dir="ltr"
                                className={INPUT}
                                value={form.data.commercial_registration}
                                onChange={(event) =>
                                    form.setData(
                                        'commercial_registration',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>

                        <Field
                            label="اسم مسؤول الحساب"
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
                            label="جوال مسؤول الحساب"
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
                    </FormGrid>

                    <Field
                        label="البريد الإلكتروني"
                        hint="لتغيير بريد الدخول راجع فريق تيمات — البريد مفتاح الحساب."
                    >
                        <input
                            dir="ltr"
                            className={`${INPUT} bg-ink/5 text-ink/60`}
                            value={company.email}
                            readOnly
                        />
                    </Field>

                    <Field
                        label="شعار الشركة"
                        error={form.errors.logo}
                        hint="jpg أو png أو webp، بحد أقصى 2 ميجابايت."
                    >
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="w-full text-xs text-ink/80 file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-2 file:text-[11px] file:font-bold file:text-lime"
                            onChange={(event) =>
                                form.setData(
                                    'logo',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                        />
                    </Field>
                </FormSection>

                <FormSection
                    title="كلمة المرور"
                    hint="اتركي حقلي الجديدة فارغين إن كنت تعدّلين البيانات فقط."
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
                        هذا الحساب يوزّع رصيد المحفظة ويعتمد طلبات المجتمعات.
                        تأكيد الهوية عند كل تعديل يمنع أن يعبث بجلسة مفتوحة من
                        يمرّ بالجهاز.
                    </Note>
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={form.processing}>
                        حفظ التغييرات
                    </Button>
                </FormActions>
            </form>
        </CompanyLayout>
    );
}
