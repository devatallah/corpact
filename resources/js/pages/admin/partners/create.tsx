import { Head, useForm } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { CategoryPicker } from '@/components/category-picker';
import { BackLink } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import { Button, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * H §17 — إضافة مزوّد خدمة.
 *
 * A provider added here is active immediately, but its bank details still
 * have to be approved separately before anything can be transferred to it —
 * the two approvals are deliberately not the same act.
 */
export default function CreatePartner({
    categories,
}: {
    categories: { id: number; name: string; children?: { id: number; name: string }[] }[];
}) {
    const form = useForm<{
        name: string;
        email: string;
        password: string;
        city: string;
        district: string;
        contact_phone: string;
        commission_rate: string;
        category_ids: number[];
    }>({
        name: '',
        email: '',
        password: '',
        city: '',
        district: '',
        contact_phone: '',
        commission_rate: '',
        category_ids: [],
    });

    return (
        <AdminLayout>
            <Head title="إضافة مزوّد" />

            <BackLink href="/admin/partners" label="العودة إلى المزوّدين" />

            <PageHeader
                icon={Users}
                title="إضافة مزوّد خدمة"
                subtitle="يُفعَّل المزوّد فور إنشائه. اعتماد حسابه البنكي إجراء منفصل من صفحة إشراف المزوّدين."
            />

            <Note tone="warning" title="التفعيل لا يعني القابلية للصرف">
                المزوّد المفعّل يستقبل مجموعات الشركات فوراً، لكن كشوف مستحقاته تبقى غير قابلة للتحويل حتى يُعتمد حسابه البنكي.
            </Note>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/admin/partners');
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات المرفق">
                    <FormGrid>
                        <Field label="اسم المزوّد" htmlFor="partner-name" required error={form.errors.name}>
                            <input
                                id="partner-name"
                                type="text"
                                required
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="المدينة" htmlFor="partner-city" required error={form.errors.city}>
                            <input
                                id="partner-city"
                                type="text"
                                required
                                value={form.data.city}
                                onChange={(event) => form.setData('city', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="الحي" htmlFor="partner-district" required error={form.errors.district}>
                            <input
                                id="partner-district"
                                type="text"
                                required
                                value={form.data.district}
                                onChange={(event) => form.setData('district', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field
                            label="نسبة العمولة"
                            htmlFor="partner-commission"
                            required
                            hint="النسبة التي تقتطعها المنصة من كل فعالية"
                            error={form.errors.commission_rate}
                        >
                            <input
                                id="partner-commission"
                                type="number"
                                step="0.01"
                                min={0}
                                max={100}
                                required
                                value={form.data.commission_rate}
                                onChange={(event) => form.setData('commission_rate', event.target.value)}
                                className={`${INPUT} font-mono`}
                            />
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormSection title="حساب الدخول">
                    <FormGrid>
                        <Field label="البريد الإلكتروني" htmlFor="partner-email" required error={form.errors.email}>
                            <input
                                id="partner-email"
                                type="email"
                                dir="ltr"
                                required
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field label="كلمة المرور المبدئية" htmlFor="partner-password" required error={form.errors.password}>
                            <input
                                id="partner-password"
                                type="password"
                                required
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field
                            label="جوال التواصل"
                            htmlFor="partner-phone"
                            required
                            hint="هوية الدخول برمز التحقق"
                            error={form.errors.contact_phone}
                        >
                            <input
                                id="partner-phone"
                                type="tel"
                                dir="ltr"
                                required
                                value={form.data.contact_phone}
                                onChange={(event) => form.setData('contact_phone', event.target.value)}
                                placeholder="05xxxxxxxx"
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormSection title="الأنشطة" hint="ما يقدّمه المرفق — عليها يطابقه محرك الاقتراحات باهتمامات المجتمعات.">
                    <CategoryPicker
                        categories={categories}
                        selected={form.data.category_ids}
                        onChange={(ids) => form.setData('category_ids', ids)}
                        error={form.errors.category_ids}
                    />
                </FormSection>

                <FormActions cancelHref="/admin/partners">
                    <Button type="submit" disabled={form.processing || form.data.category_ids.length === 0}>
                        إنشاء المزوّد وتفعيله
                    </Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
