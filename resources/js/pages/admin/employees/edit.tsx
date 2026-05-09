import AdminLayout from '@/layouts/admin-layout';
import type { Company, Employee } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    employee: Employee & { company?: Company };
    companies: Company[];
}

export default function EmployeesEdit({ employee, companies }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: employee.name ?? '',
        email: employee.email ?? '',
        password: '',
        phone: employee.phone ?? '',
        company_id: String(employee.company_id ?? ''),
        department: employee.department ?? '',
        status: employee.status ?? 'active',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/employees/${employee.id}`);
    }

    return (
        <AdminLayout>
            <Head title={`تعديل: ${employee.name}`} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Link href="/admin/employees" style={{ color: '#6B7A99', textDecoration: 'none', fontSize: '14px' }}>
                    ← الموظفون
                </Link>
                <span style={{ color: '#3D4A60' }}>/</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>تعديل: {employee.name}</span>
            </div>

            {Object.keys(errors).length > 0 && (
                <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                    {Object.values(errors).map((error, i) => (
                        <p key={i} style={{ fontSize: '12px', color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div className="card" style={{ maxWidth: '600px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>تعديل بيانات الموظف</div>
                <form onSubmit={submit}>
                    <div className="frow">
                        <div className="fg">
                            <label>الاسم *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="اسم الموظف"
                                required
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>البريد الإلكتروني *</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="example@email.com"
                                dir="ltr"
                                required
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>رقم الجوال</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="05xxxxxxxx"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>الشركة *</label>
                            <select
                                value={data.company_id}
                                onChange={(e) => setData('company_id', e.target.value)}
                                required
                            >
                                <option value="">اختر الشركة</option>
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>القسم</label>
                            <input
                                type="text"
                                value={data.department}
                                onChange={(e) => setData('department', e.target.value)}
                                placeholder="مثال: الموارد البشرية"
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>الحالة</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                        <button
                            type="submit"
                            disabled={processing}
                            className="act-btn btn-approve"
                            style={{ flex: 1, padding: '12px' }}
                        >
                            حفظ التعديلات
                        </button>
                        <Link
                            href="/admin/employees"
                            style={{ padding: '12px 24px', background: '#232A3E', borderRadius: '10px', color: '#6B7A99', fontSize: '14px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
