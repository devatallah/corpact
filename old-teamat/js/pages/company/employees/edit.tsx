import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import toastr from 'toastr';
import PasswordInput from '@/components/password-input';
import CompanyLayout from '@/layouts/company-layout';
import type { Department, Employee } from '@/types/models';

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
                <Link href="/company/employees" style={{ color: 'rgba(10,10,10,.55)', textDecoration: 'none', fontSize: 14 }}>
                    ← الموظفون
                </Link>
                <span style={{ color: '#0A0A0A' }}>/</span>
                <span style={{ fontWeight: 700 }}>تعديل: {employee.name}</span>
            </div>

            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: '#D9381E10', border: '1px solid #D9381E33', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#D9381E', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div style={{ background: '#fff', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 16, padding: 32, maxWidth: 500 }}>
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
                        <PasswordInput
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
                        <select
                            className="fi"
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
                        <button type="submit" className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] bg-[#0A0A0A] text-[#C8FF00] border-[#0A0A0A] hover:bg-[#0A0A0A]/90" style={{ flex: 1 }} disabled={form.processing}>
                            حفظ التعديلات
                        </button>
                        <Link
                            href="/company/employees"
                            style={{ padding: '12px 24px', background: '#F6F8F5', borderRadius: 10, color: 'rgba(10,10,10,.6)', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </CompanyLayout>
    );
}
