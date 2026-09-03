import { Head, useForm } from '@inertiajs/react';
import { UserRound } from 'lucide-react';
import { BackLink } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import { Badge, Button, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * H §16 — تعديل موظف من لوحة المنصة.
 *
 * Moving an employee between companies is the heavy action here: reports are
 * attributed to the department and company *at the time of the event*, so a
 * move does not rewrite history — it starts a new membership from today.
 */
type EmployeeModel = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    company_id: number;
    department_id: number | null;
    employee_number: string | null;
    anonymized_at: string | null;
    company?: { id: number; name: string } | null;
};

const EMPLOYEE_STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
    active: { label: 'مفعّل', tone: 'success' },
    pending_verification: { label: 'بانتظار التفعيل', tone: 'warning' },
    invited: { label: 'مدعو', tone: 'warning' },
    inactive: { label: 'معطّل', tone: 'neutral' },
    banned: { label: 'محظور', tone: 'danger' },
};

export default function EditEmployee({
    employee,
    companies,
    departments,
}: {
    employee: EmployeeModel;
    companies: { id: number; name: string }[];
    departments: { id: number; name: string; company_id: number }[];
}) {
    const form = useForm({
        name: employee.name,
        email: employee.email,
        password: '',
        phone: employee.phone ?? '',
        company_id: String(employee.company_id),
        department_id: employee.department_id === null ? '' : String(employee.department_id),
        status: employee.status,
    });

    const availableDepartments = departments.filter((department) => String(department.company_id) === form.data.company_id);

    return (
        <AdminLayout>
            <Head title={employee.name} />

            <BackLink href="/admin/employees" label="العودة إلى الموظفين" />

            <PageHeader
                icon={UserRound}
                title={employee.name}
                subtitle={employee.company?.name ?? undefined}
                actions={
                    <>
                        <Badge tone={EMPLOYEE_STATUS[employee.status]?.tone ?? 'neutral'}>
                            {EMPLOYEE_STATUS[employee.status]?.label ?? employee.status}
                        </Badge>
                        {employee.anonymized_at && <Badge tone="neutral">مُخفى الهوية</Badge>}
                    </>
                }
            />

            <Note title="نقل الموظف بين الشركات">
                التقارير التاريخية تُنسب للشركة والإدارة وقت وقوع الفعالية لا وقت قراءتها. النقل يبدأ عضوية جديدة من اليوم ولا
                يعيد كتابة ما مضى.
            </Note>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.put(`/admin/employees/${employee.id}`, { preserveScroll: true });
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات الموظف">
                    <FormGrid>
                        <Field label="الاسم" htmlFor="e-name" error={form.errors.name}>
                            <input
                                id="e-name"
                                type="text"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="البريد الإلكتروني" htmlFor="e-email" error={form.errors.email}>
                            <input
                                id="e-email"
                                type="email"
                                dir="ltr"
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field label="رقم الجوال" htmlFor="e-phone" hint="هوية الدخول" error={form.errors.phone}>
                            <input
                                id="e-phone"
                                type="tel"
                                dir="ltr"
                                value={form.data.phone}
                                onChange={(event) => form.setData('phone', event.target.value)}
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field label="الشركة" htmlFor="e-company" error={form.errors.company_id}>
                            <select
                                id="e-company"
                                value={form.data.company_id}
                                onChange={(event) => {
                                    form.setData('company_id', event.target.value);
                                    form.setData('department_id', '');
                                }}
                                className={`${INPUT} cursor-pointer`}
                            >
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="الإدارة" htmlFor="e-department" error={form.errors.department_id}>
                            <select
                                id="e-department"
                                value={form.data.department_id}
                                onChange={(event) => form.setData('department_id', event.target.value)}
                                className={`${INPUT} cursor-pointer`}
                            >
                                <option value="">— بلا إدارة —</option>
                                {availableDepartments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="حالة الحساب" htmlFor="e-status" error={form.errors.status}>
                            <select
                                id="e-status"
                                value={form.data.status}
                                onChange={(event) => form.setData('status', event.target.value)}
                                className={`${INPUT} cursor-pointer`}
                            >
                                <option value="active">مفعّل</option>
                                <option value="pending_verification">بانتظار التفعيل</option>
                                <option value="inactive">معطّل</option>
                                <option value="banned">محظور</option>
                            </select>
                        </Field>

                        <Field label="كلمة مرور جديدة" htmlFor="e-password" hint="اتركها فارغة للإبقاء عليها" error={form.errors.password}>
                            <input
                                id="e-password"
                                type="password"
                                autoComplete="new-password"
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                className={INPUT}
                            />
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormActions cancelHref="/admin/employees">
                    <Button type="submit" disabled={form.processing}>
                        حفظ التعديلات
                    </Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}
