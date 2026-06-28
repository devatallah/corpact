import BusinessLayout from '@/layouts/business-layout';
import { Head, useForm } from '@inertiajs/react';
import toastr from 'toastr';

interface Props {
    business: {
        id: number;
        name: string;
        email: string;
        contact_name: string | null;
        contact_phone: string | null;
    };
}

export default function businessProfile({ business }: Props) {
    const form = useForm({
        name: business.name ?? '',
        contact_name: business.contact_name ?? '',
        contact_phone: business.contact_phone ?? '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.put('/business/profile', {
            onSuccess: () => {
                form.setData('current_password', '');
                form.setData('password', '');
                form.setData('password_confirmation', '');
                toastr.success('تم تحديث الملف الشخصي بنجاح.');
            },
        });
    }

    return (
        <BusinessLayout>
            <Head title="الملف الشخصي" />

            <div className="page-title">الملف الشخصي</div>
            <div className="page-sub">تعديل بيانات الحساب وكلمة المرور</div>

            <div className="card" style={{ maxWidth: 600 }}>
                {Object.keys(form.errors).length > 0 && (
                    <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                        {Object.values(form.errors).map((error, i) => (
                            <p key={i} style={{ fontSize: 12, color: '#EF4444', margin: '0 0 4px' }}>{error}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="frow">
                        <div className="fg">
                            <label>اسم المنشأة *</label>
                            <input
                                type="text"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                        </div>
                        <div className="fg">
                            <label>البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={business.email}
                                disabled
                                dir="ltr"
                                style={{ opacity: 0.5 }}
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>اسم المسؤول</label>
                            <input
                                type="text"
                                value={form.data.contact_name}
                                onChange={(e) => form.setData('contact_name', e.target.value)}
                                placeholder="اسم المسؤول"
                            />
                        </div>
                        <div className="fg">
                            <label>رقم الجوال</label>
                            <input
                                type="text"
                                value={form.data.contact_phone}
                                onChange={(e) => form.setData('contact_phone', e.target.value)}
                                placeholder="05xxxxxxxx"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #EBEBEB', margin: '20px 0', paddingTop: 20 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A', marginBottom: 16 }}>تغيير كلمة المرور</div>
                        <div className="frow">
                            <div className="fg">
                                <label>كلمة المرور الحالية *</label>
                                <input
                                    type="password"
                                    value={form.data.current_password}
                                    onChange={(e) => form.setData('current_password', e.target.value)}
                                    placeholder="أدخل كلمة المرور الحالية"
                                    dir="ltr"
                                    autoComplete="current-password"
                                />
                            </div>
                            <div className="fg" />
                        </div>
                        <div className="frow">
                            <div className="fg">
                                <label>كلمة المرور الجديدة</label>
                                <input
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="اتركها فارغة للإبقاء"
                                    dir="ltr"
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="fg">
                                <label>تأكيد كلمة المرور</label>
                                <input
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                    placeholder="أعد كتابة كلمة المرور"
                                    dir="ltr"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="panel-actions">
                        <button type="submit" className="pa-approve" disabled={form.processing}>حفظ التغييرات</button>
                    </div>
                </form>
            </div>
        </BusinessLayout>
    );
}
