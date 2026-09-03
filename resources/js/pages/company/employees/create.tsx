import { Head, useForm } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
import { BackLink } from '@/components/list-states';
import { FormActions, FormSection } from '@/components/portal/form';
import { Button, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';

/**
 * H §5 — دعوة موظف.
 *
 * The company never sets a password for an employee: it sends an invitation
 * and the employee activates their own account. That is why this form asks
 * for an email and nothing else — everything else is filled in by the person
 * it belongs to.
 */
export default function CompanyEmployeeCreate() {
    const form = useForm({ email: '' });

    return (
        <CompanyLayout>
            <Head title="دعوة موظف" />

            <BackLink href="/company/employees" label="العودة إلى الموظفين" />

            <PageHeader
                icon={UserPlus}
                title="دعوة موظف"
                subtitle="يصل الموظف رابط تفعيل صالح لمدة محدودة، ويكمل بياناته بنفسه."
            />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/company/employees');
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات الدعوة">
                    <Field
                        label="البريد الإلكتروني للموظف"
                        error={form.errors.email}
                        required
                    >
                        <input
                            type="email"
                            dir="ltr"
                            className={INPUT}
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                        />
                    </Field>

                    <Note title="لماذا لا نطلب كلمة مرور؟">
                        حساب الموظف ملكه لا ملك الشركة: هو من يضع كلمة مروره
                        ويؤكد بياناته عبر رابط الدعوة. الشركة تدير التفعيل
                        والقسم والحالة فقط.
                    </Note>
                </FormSection>

                <FormActions cancelHref="/company/employees">
                    <Button type="submit" disabled={form.processing}>
                        إرسال الدعوة
                    </Button>
                </FormActions>
            </form>
        </CompanyLayout>
    );
}
