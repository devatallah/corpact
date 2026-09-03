import { Head, useForm } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { BackLink } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import { Button, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * H §16 — إنشاء شركة مباشرة من لوحة الأدمن.
 *
 * A company created here is approved on the spot (the platform admin vouched
 * for it), so the contract terms have to be set right after — a company with
 * no terms is invisible to the monthly invoicing run.
 */
export default function CreateCompany() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        domain: '',
        sector: '',
        city: '',
        contact_name: '',
        contact_phone: '',
    });

    return (
        <AdminLayout>
            <Head title="إضافة شركة" />

            <BackLink href="/admin/companies" label="العودة إلى الشركات" />

            <PageHeader
                icon={Building2}
                title="إضافة شركة"
                subtitle="تُعتمد الشركة فور إنشائها من هنا. اضبط شروط العقد بعدها مباشرة من صفحة التعديل."
            />

            <Note tone="warning" title="بعد الإنشاء: شروط العقد">
                الشركة بلا شروط عقد لا تدخل دورة الفوترة الشهرية إطلاقاً — لن تصدر لها فاتورة ولن يظهر ذلك كخطأ.
            </Note>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/admin/companies');
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات الشركة">
                    <FormGrid>
                        <Field label="اسم الشركة" htmlFor="company-name" required error={form.errors.name}>
                            <input
                                id="company-name"
                                type="text"
                                required
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="القطاع" htmlFor="company-sector" required error={form.errors.sector}>
                            <input
                                id="company-sector"
                                type="text"
                                required
                                value={form.data.sector}
                                onChange={(event) => form.setData('sector', event.target.value)}
                                placeholder="مثال: تقنية"
                                className={INPUT}
                            />
                        </Field>

                        <Field label="المدينة" htmlFor="company-city" required error={form.errors.city}>
                            <input
                                id="company-city"
                                type="text"
                                required
                                value={form.data.city}
                                onChange={(event) => form.setData('city', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field
                            label="نطاق البريد المؤسسي"
                            htmlFor="company-domain"
                            required
                            hint="بدونه لا يُطابَق بريد الموظف بشركته"
                            error={form.errors.domain}
                        >
                            <input
                                id="company-domain"
                                type="text"
                                dir="ltr"
                                required
                                value={form.data.domain}
                                onChange={(event) => form.setData('domain', event.target.value)}
                                placeholder="example.sa"
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormSection title="حساب مسؤول الحساب" hint="بريد الدخول لبوابة الشركة، وبيانات مسؤول الحساب فيها.">
                    <FormGrid>
                        <Field label="البريد الإلكتروني" htmlFor="company-email" required error={form.errors.email}>
                            <input
                                id="company-email"
                                type="email"
                                dir="ltr"
                                required
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field label="كلمة المرور المبدئية" htmlFor="company-password" required error={form.errors.password}>
                            <input
                                id="company-password"
                                type="password"
                                required
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="اسم مسؤول الحساب" htmlFor="company-contact" error={form.errors.contact_name}>
                            <input
                                id="company-contact"
                                type="text"
                                value={form.data.contact_name}
                                onChange={(event) => form.setData('contact_name', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field
                            label="جوال مسؤول الحساب"
                            htmlFor="company-phone"
                            hint="هوية الدخول برمز التحقق"
                            error={form.errors.contact_phone}
                        >
                            <input
                                id="company-phone"
                                type="tel"
                                dir="ltr"
                                value={form.data.contact_phone}
                                onChange={(event) => form.setData('contact_phone', event.target.value)}
                                placeholder="05xxxxxxxx"
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormActions cancelHref="/admin/companies">
                    <Button type="submit" disabled={form.processing}>
                        إنشاء الشركة واعتمادها
                    </Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
