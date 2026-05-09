import CompanyLayout from '@/layouts/company-layout';
import type { Employee } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import toastr from 'toastr';

interface Props {
    employee: Employee;
}

export default function EmployeeEdit({ employee }: Props) {
    const form = useForm({
        name: employee.name ?? '',
        email: employee.email ?? '',
        password: '',
        phone: employee.phone ?? '',
        department: employee.department ?? '',
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
                <Link href="/company/employees" style={{ color: '#7A8BA8', textDecoration: 'none', fontSize: 14 }}>
                    ← الموظفون
                </Link>
                <span style={{ color: '#C8D0E0' }}>/</span>
                <span style={{ fontWeight: 700 }}>تعديل: {employee.name}</span>
            </div>

            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: '#E0305010', border: '1px solid #E0305033', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 32, maxWidth: 500 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>تعديل بيانات الموظف</div>
                <form onSubmit={handleSubmit}>
                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label className="fl">الاسم</label>
                        <input
                            type="text"
                            className="fi"
                            placeholder="اسم الموظف"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label className="fl">البريد الإلكتروني</label>
                        <input
                            type="email"
                            className="fi"
                            dir="ltr"
                            placeholder="email@example.com"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label className="fl">كلمة المرور الجديدة</label>
                        <input
                            type="password"
                            className="fi"
                            dir="ltr"
                            placeholder="اتركه فارغاً للإبقاء على الحالية"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label className="fl">رقم الجوال</label>
                        <input
                            type="text"
                            className="fi"
                            dir="ltr"
                            placeholder="05xxxxxxxx"
                            value={form.data.phone}
                            onChange={(e) => form.setData('phone', e.target.value)}
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label className="fl">القسم</label>
                        <input
                            type="text"
                            className="fi"
                            placeholder="القسم"
                            value={form.data.department}
                            onChange={(e) => form.setData('department', e.target.value)}
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 24 }}>
                        <label className="fl">الحالة</label>
                        <select
                            className="fi"
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
                            style={{ padding: '12px 24px', background: '#E2E8F4', borderRadius: 10, color: '#4A5C78', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </CompanyLayout>
    );
}
