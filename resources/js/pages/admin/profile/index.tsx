import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import toastr from 'toastr';

interface Props {
    admin: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    };
}

export default function AdminProfile({ admin }: Props) {
    const form = useForm({
        name: admin.name ?? '',
        email: admin.email ?? '',
        phone: admin.phone ?? '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.put('/admin/profile', {
            onSuccess: () => {
                form.setData('current_password', '');
                form.setData('password', '');
                form.setData('password_confirmation', '');
                toastr.success('تم تحديث الملف الشخصي بنجاح.');
            },
        });
    }

    return (
        <AdminLayout>
            <Head title="الملف الشخصي" />

            <div className="page-title">الملف الشخصي</div>
            <div className="page-sub">تعديل بيانات الحساب وكلمة المرور</div>

            <div className="card" style={{ maxWidth: 600 }}>
                {Object.keys(form.errors).length > 0 && (
                    <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                        {Object.values(form.errors).map((error, i) => (
                            <p key={i} style={{ fontSize: '12px', color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="frow">
                        <div className="fg">
                            <label>الاسم *</label>
                            <input
                                type="text"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                        </div>
                        <div className="fg">
                            <label>البريد الإلكتروني *</label>
                            <input
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
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
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                placeholder="05xxxxxxxx"
                                dir="ltr"
                            />
                        </div>
                        <div className="fg" />
                    </div>

                    <div style={{ borderTop: '1px solid #232A3E', margin: '20px 0', paddingTop: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>تغيير كلمة المرور</div>
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
        </AdminLayout>
    );
}
