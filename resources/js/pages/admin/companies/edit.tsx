import AdminLayout from '@/layouts/admin-layout';
import type { Company } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    company: Company;
}

export default function CompaniesEdit({ company }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: company.name ?? '',
        email: company.email ?? '',
        password: '',
        domain: company.domain ?? '',
        sector: company.sector ?? '',
        employee_count: String(company.employee_count ?? ''),
        hr_name: company.hr_name ?? '',
        city: company.city ?? '',
        status: company.status ?? 'pending',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/companies/${company.id}`);
    }

    return (
        <AdminLayout>
            <Head title={`تعديل: ${company.name}`} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Link href="/admin/companies" style={{ color: '#6B7A99', textDecoration: 'none', fontSize: '14px' }}>
                    ← الشركات
                </Link>
                <span style={{ color: '#3D4A60' }}>/</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>تعديل: {company.name}</span>
            </div>

            {Object.keys(errors).length > 0 && (
                <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                    {Object.values(errors).map((error, i) => (
                        <p key={i} style={{ fontSize: '12px', color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div className="card" style={{ maxWidth: '600px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>تعديل بيانات الشركة</div>
                <form onSubmit={submit}>
                    <div className="frow">
                        <div className="fg">
                            <label>اسم الشركة *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="مثال: شركة التقنية المتقدمة"
                                required
                            />
                        </div>
                        <div className="fg">
                            <label>المسؤول</label>
                            <input
                                type="text"
                                value={data.hr_name}
                                onChange={(e) => setData('hr_name', e.target.value)}
                                placeholder="اسم مسؤول الموارد البشرية"
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
                                placeholder="info@company.sa"
                                dir="ltr"
                                required
                            />
                        </div>
                        <div className="fg">
                            <label>النطاق *</label>
                            <input
                                type="text"
                                value={data.domain}
                                onChange={(e) => setData('domain', e.target.value)}
                                placeholder="company.sa"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>القطاع *</label>
                            <input
                                type="text"
                                value={data.sector}
                                onChange={(e) => setData('sector', e.target.value)}
                                placeholder="تقنية المعلومات"
                            />
                        </div>
                        <div className="fg">
                            <label>المدينة *</label>
                            <input
                                type="text"
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                placeholder="الرياض"
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>عدد الموظفين *</label>
                            <input
                                type="number"
                                value={data.employee_count}
                                onChange={(e) => setData('employee_count', e.target.value)}
                                placeholder="50"
                                min={1}
                            />
                        </div>
                        <div className="fg">
                            <label>الحالة</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="pending">معلق</option>
                                <option value="review">قيد المراجعة</option>
                                <option value="active">نشط</option>
                                <option value="rejected">مرفوض</option>
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
                            href="/admin/companies"
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
