import { Head, useForm } from '@inertiajs/react';
import { UserCog } from 'lucide-react';
import { BackLink } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Field,
    INPUT,
    Note,
    PageHeader,
} from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';
import { employeeStatus } from '@/lib/status';

/**
 * H §5 — تعديل موظف.
 *
 * Moving someone between departments changes their future attribution only —
 * past participations stay credited to the department they belonged to on the
 * day of the event, which is why departmental reports don't rewrite
 * themselves after a reorganisation.
 */
export default function CompanyEmployeeEdit({
    employee,
    departments,
}: {
    employee: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        employee_number: string | null;
        status: string;
        department_id: number | null;
        department?: { id: number; name: string } | null;
    };
    departments: { id: number; name: string }[];
}) {
    const form = useForm({
        name: employee.name,
        email: employee.email,
        phone: employee.phone ?? '',
        employee_number: employee.employee_number ?? '',
        department_id: employee.department_id
            ? String(employee.department_id)
            : '',
        status: employee.status === 'inactive' ? 'inactive' : 'active',
        password: '',
    });

    return (
        <CompanyLayout>
            <Head title={`تعديل ${employee.name}`} />

            <BackLink href="/company/employees" label="العودة إلى الموظفين" />

            <PageHeader
                icon={UserCog}
                title={employee.name}
                subtitle={employee.department?.name ?? 'بلا إدارة'}
                actions={
                    <Badge tone={employeeStatus(employee.status).tone}>
                        {employeeStatus(employee.status).label}
                    </Badge>
                }
            />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.put(`/company/employees/${employee.id}`, {
                        preserveScroll: true,
                    });
                }}
                className="space-y-6"
            >
                <FormSection title="البيانات الأساسية">
                    <FormGrid>
                        <Field label="الاسم" error={form.errors.name} required>
                            <input
                                className={INPUT}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                        </Field>

                        <Field
                            label="البريد الإلكتروني"
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

                        <Field label="الجوال" error={form.errors.phone}>
                            <input
                                dir="ltr"
                                className={INPUT}
                                value={form.data.phone}
                                onChange={(event) =>
                                    form.setData('phone', event.target.value)
                                }
                            />
                        </Field>

                        <Field
                            label="الرقم الوظيفي"
                            error={form.errors.employee_number}
                        >
                            <input
                                dir="ltr"
                                className={INPUT}
                                value={form.data.employee_number}
                                onChange={(event) =>
                                    form.setData(
                                        'employee_number',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormSection
                    title="القسم والحالة"
                    hint="نقل الموظف بين الأقسام يغيّر إسناده المستقبلي فقط — مشاركاته السابقة تبقى منسوبة لقسمه وقتها."
                >
                    <FormGrid>
                        <Field label="القسم" error={form.errors.department_id}>
                            <select
                                className={INPUT}
                                value={form.data.department_id}
                                onChange={(event) =>
                                    form.setData(
                                        'department_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">— بلا إدارة —</option>
                                {departments.map((department) => (
                                    <option
                                        key={department.id}
                                        value={department.id}
                                    >
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field
                            label="الحالة"
                            error={form.errors.status}
                            hint="المفعَّل فقط يدخل في احتساب الفاتورة."
                            required
                        >
                            <select
                                className={INPUT}
                                value={form.data.status}
                                onChange={(event) =>
                                    form.setData('status', event.target.value)
                                }
                            >
                                <option value="active">مفعّل</option>
                                <option value="inactive">معطّل</option>
                            </select>
                        </Field>
                    </FormGrid>

                    <Field
                        label="كلمة مرور جديدة"
                        error={form.errors.password}
                        hint="اتركها فارغة لإبقاء كلمة المرور الحالية."
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

                    <Note title="تعطيل ≠ حذف">
                        تعطيل الحساب ينهي جلسات الموظف ويزيل قياداته، لكن حضوره
                        ومشاركاته تبقى في تقارير الشركة كما هي.
                    </Note>
                </FormSection>

                <FormActions cancelHref="/company/employees">
                    <Button type="submit" disabled={form.processing}>
                        حفظ التعديلات
                    </Button>
                </FormActions>
            </form>
        </CompanyLayout>
    );
}
