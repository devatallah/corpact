import AdminLayout from '@/layouts/admin-layout';
import type { Business } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    business: Business;
}

export default function businesssEdit({ business }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: business.name ?? '',
        city: business.city ?? '',
        district: business.district ?? '',
        email: business.email ?? '',
        contact_phone: business.contact_phone ?? '',
        commission_rate: String(business.commission_rate ?? 15),
        status: business.status ?? 'pending',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/businesses/${business.id}`);
    }

    return (
        <AdminLayout>
            <Head title={`تعديل: ${business.name}`} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Link href="/admin/businesses" style={{ color: '#6B7A99', textDecoration: 'none', fontSize: '14px' }}>
                    ← المنشآت
                </Link>
                <span style={{ color: '#3D4A60' }}>/</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>تعديل: {business.name}</span>
            </div>

            {Object.keys(errors).length > 0 && (
                <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                    {Object.values(errors).map((error, i) => (
                        <p key={i} style={{ fontSize: '12px', color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div className="card" style={{ maxWidth: '600px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>تعديل بيانات المنشأة</div>
                <form onSubmit={submit}>
                    <div className="frow">
                        <div className="fg">
                            <label>اسم المنشأة</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="frow" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="fg">
                            <label>المدينة</label>
                            <input
                                type="text"
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                            />
                        </div>
                        <div className="fg">
                            <label>الحي</label>
                            <input
                                type="text"
                                value={data.district}
                                onChange={(e) => setData('district', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="frow" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="fg">
                            <label>البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <div className="fg">
                            <label>رقم الهاتف</label>
                            <input
                                type="text"
                                value={data.contact_phone}
                                onChange={(e) => setData('contact_phone', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="frow" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="fg">
                            <label>نسبة العمولة (%)</label>
                            <input
                                type="number"
                                value={data.commission_rate}
                                onChange={(e) => setData('commission_rate', e.target.value)}
                                min={0}
                                max={100}
                                step={0.1}
                            />
                        </div>
                        <div className="fg">
                            <label>الحالة</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="pending">معلق</option>
                                <option value="active">نشط</option>
                                <option value="rejected">مرفوض</option>
                                <option value="suspended">معلّق</option>
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
