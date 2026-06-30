import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function businesssCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        city: '',
        district: '',
        email: '',
        contact_phone: '',
        commission_rate: '15',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/businesses');
    }

    return (
        <AdminLayout>
            <Head title="إضافة مزود خدمة" />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Link href="/admin/businesses" style={{ color: '#6B7A99', textDecoration: 'none', fontSize: '14px' }}>
                    ← مزودو الخدمة
                </Link>
                <span style={{ color: '#3D4A60' }}>/</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>إضافة مزود خدمة</span>
            </div>

            {Object.keys(errors).length > 0 && (
                <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                    {Object.values(errors).map((error, i) => (
                        <p key={i} style={{ fontSize: '12px', color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div className="card" style={{ maxWidth: '600px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>إضافة مزود خدمة جديد</div>
                <form onSubmit={submit}>
                    <div className="frow">
                        <div className="fg">
                            <label>اسم مزود الخدمة *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="مثال: مزود خدمة الرياض"
                                required
                            />
                        </div>
                    </div>

                    <div className="frow" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                        <div className="fg">
                            <label>الحي *</label>
                            <input
                                type="text"
                                value={data.district}
                                onChange={(e) => setData('district', e.target.value)}
                                placeholder="العليا"
                                required
                            />
                        </div>
                    </div>

                    <div className="frow" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="fg">
                            <label>البريد الإلكتروني *</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="info@business.com"
                                dir="ltr"
                                required
                            />
                        </div>
                        <div className="fg">
                            <label>رقم الهاتف *</label>
                            <input
                                type="text"
                                value={data.contact_phone}
                                onChange={(e) => setData('contact_phone', e.target.value)}
                                placeholder="05xxxxxxxx"
                                dir="ltr"
                                required
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>نسبة العمولة (%) *</label>
                            <input
                                type="number"
                                value={data.commission_rate}
                                onChange={(e) => setData('commission_rate', e.target.value)}
                                min={0}
                                max={100}
                                step={0.1}
                                required
                            />
                        </div>
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
                            href="/admin/businesses"
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
