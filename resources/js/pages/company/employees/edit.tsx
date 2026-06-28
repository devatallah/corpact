import CompanyLayout from '@/layouts/company-layout';
import type { Department, Employee } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import toastr from 'toastr';

interface Props {
    employee: Employee;
    departments: Department[];
}

export default function EmployeeEdit({ employee, departments }: Props) {
    const form = useForm({
        name: employee.name ?? '',
        email: employee.email ?? '',
        password: '',
        phone: employee.phone ?? '',
        department_id: String(employee.department_id ?? ''),
        status: employee.status,
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.put(`/company/employees/${employee.id}`, {
            onSuccess: () => toastr.success('تم تعديل بيانات الموظف بنجاح'),
        });
    }

    return (
        <CompanyLayout>
            <Head title={`تعديل: ${employee.name}`} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/company/employees" style={{ color: '#999', textDecoration: 'none', fontSize: 14 }}>
                    ← الموظفون
                </Link>
                <span style={{ color: '#EBEBEB' }}>/</span>
                <span style={{ fontWeight: 700 }}>تعديل: {employee.name}</span>
            </div>

            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: '#E0305010', border: '1px solid #E0305033', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div className="card" style={{ maxWidth: 500 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>تعديل بيانات الموظف</div>
                <form onSubmit={handleSubmit}>
                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>الاسم</label>
                        <input
                            type="text"
                            placeholder="اسم الموظف"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>البريد الإلكتروني</label>
                        <input
                            type="email"
                            dir="ltr"
                            placeholder="email@example.com"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>كلمة المرور الجديدة</label>
                        <input
                            type="password"
                            dir="ltr"
                            placeholder="اتركه فارغاً للإبقاء على الحالية"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>رقم الجوال</label>
                        <input
                            type="text"
                            dir="ltr"
                            placeholder="05xxxxxxxx"
                            value={form.data.phone}
                            onChange={(e) => form.setData('phone', e.target.value)}
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>القسم</label>
                        <select
                            value={form.data.department_id}
                            onChange={(e) => form.setData('department_id', e.target.value)}
                        >
                            <option value="">بدون قسم</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="fg" style={{ marginBottom: 24 }}>
                        <label>الحالة</label>
                        <select
                            value={form.data.status}
                            onChange={(e) => form.setData('status', e.target.value)}
                        >
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" className="ac-btn" style={{ flex: 1 }} disabled={form.processing}>
                            حفظ التعديلات
                        </button>
                        <Link
                            href="/company/employees"
                            className="ac-btn secondary"
                            style={{ padding: '12px 24px', textDecoration: 'none', textAlign: 'center' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </CompanyLayout>
    );
}
