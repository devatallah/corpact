import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CompaniesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        domain: '',
        sector: '',
        employee_count: '',
        hr_name: '',
        hr_phone: '',
        city: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/companies');
    }

    return (
        <AdminLayout>
            <Head title="إضافة شركة" />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Link href="/admin/companies" style={{ color: '#6B7A99', textDecoration: 'none', fontSize: '14px' }}>
                    ← الشركات
                </Link>
                <span style={{ color: '#3D4A60' }}>/</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>إضافة شركة</span>
            </div>

            {Object.keys(errors).length > 0 && (
                <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                    {Object.values(errors).map((error, i) => (
                        <p key={i} style={{ fontSize: '12px', color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div className="card" style={{ maxWidth: '600px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>إضافة شركة جديدة</div>
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
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>كلمة المرور *</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••"
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
                                required
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
                                required
                            />
                        </div>
                        <div className="fg">
                            <label>المدينة *</label>
                            <input
                                type="text"
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                placeholder="الرياض"
                                required
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>المسؤول</label>
                            <input
                                type="text"
                                value={data.hr_name}
                                onChange={(e) => setData('hr_name', e.target.value)}
                                placeholder="اسم مسؤول الموارد البشرية"
                            />
                        </div>
                        <div className="fg">
                            <label>هاتف المسؤول</label>
                            <input
                                type="text"
                                value={data.hr_phone}
                                onChange={(e) => setData('hr_phone', e.target.value)}
                                placeholder="05xxxxxxxx"
                                dir="ltr"
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
                                required
                            />
                        </div>
                        <div className="fg" />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                        <button
                            type="submit"
                            disabled={processing}
                            className="act-btn btn-approve"
                            style={{ flex: 1, padding: '12px' }}
                        >
                            حفظ
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
