import { Head, useForm } from '@inertiajs/react';
import { UserRound } from 'lucide-react';
import { BackLink } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import { Button, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * Creating an employee from the platform side is the exception, not the path.
 *
 * The normal route is an invitation from the company's own account manager,
 * which binds the phone the employee actually holds. Creating one here is for
 * support recovery — hence the note.
 */
export default function CreateEmployee({ companies }: { companies: { id: number; name: string }[] }) {
    const form = useForm({ name: '', email: '', password: '', phone: '', company_id: '' });

    return (
        <AdminLayout>
            <Head title="إضافة موظف" />

            <BackLink href="/admin/employees" label="العودة إلى الموظفين" />

            <PageHeader
                icon={UserRound}
                title="إضافة موظف"
                subtitle="إنشاء مباشر من لوحة المنصة — للحالات الاستثنائية ومعالجة البلاغات."
            />

            <Note tone="warning" title="المسار الطبيعي هو الدعوة">
                الموظف يُدعى عادةً من مسؤول الحساب في شركته، فيُربط رقم جواله بهويته عند قبوله الدعوة. الإنشاء المباشر من هنا
                يتجاوز ذلك التحقق.
            </Note>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/admin/employees');
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات الموظف">
                    <FormGrid>
                        <Field label="الاسم" htmlFor="emp-name" required error={form.errors.name}>
                            <input
                                id="emp-name"
                                type="text"
                                required
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="الشركة" htmlFor="emp-company" required error={form.errors.company_id}>
                            <select
                                id="emp-company"
                                required
                                value={form.data.company_id}
                                onChange={(event) => form.setData('company_id', event.target.value)}
                                className={`${INPUT} cursor-pointer`}
                            >
                                <option value="">اختر الشركة…</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="البريد الإلكتروني" htmlFor="emp-email" required error={form.errors.email}>
                            <input
                                id="emp-email"
                                type="email"
                                dir="ltr"
                                required
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field
                            label="رقم الجوال"
                            htmlFor="emp-phone"
                            hint="هوية الدخول — بدونه لا يستطيع الموظف الدخول"
                            error={form.errors.phone}
                        >
                            <input
                                id="emp-phone"
                                type="tel"
                                dir="ltr"
                                value={form.data.phone}
                                onChange={(event) => form.setData('phone', event.target.value)}
                                placeholder="05xxxxxxxx"
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field label="كلمة المرور المبدئية" htmlFor="emp-password" required error={form.errors.password}>
                            <input
                                id="emp-password"
                                type="password"
                                required
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                className={INPUT}
                            />
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormActions cancelHref="/admin/employees">
                    <Button type="submit" disabled={form.processing}>
                        إنشاء الموظف
                    </Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
