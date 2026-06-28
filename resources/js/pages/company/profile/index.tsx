import CompanyLayout from '@/layouts/company-layout';
import { Head, useForm } from '@inertiajs/react';
import toastr from 'toastr';

interface Props {
    company: {
        id: number;
        name: string;
        email: string;
        hr_name: string | null;
        hr_phone: string | null;
    };
}

export default function CompanyProfile({ company }: Props) {
    const form = useForm({
        name: company.name ?? '',
        hr_name: company.hr_name ?? '',
        hr_phone: company.hr_phone ?? '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.put('/company/profile', {
            onSuccess: () => {
                form.setData('current_password', '');
                form.setData('password', '');
                form.setData('password_confirmation', '');
                toastr.success('تم تحديث الملف الشخصي بنجاح.');
            },
        });
    }

    return (
        <CompanyLayout>
            <Head title="الملف الشخصي" />

            <div className="page-title">الملف الشخصي</div>
            <div className="page-sub" style={{ marginBottom: 24 }}>تعديل بيانات الحساب وكلمة المرور</div>

            <div className="card" style={{ maxWidth: 600 }}>
                {Object.keys(form.errors).length > 0 && (
                    <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                        {Object.values(form.errors).map((error, i) => (
                            <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="frow">
                        <div className="fg">
                            <label>اسم الشركة *</label>
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
                                value={company.email}
                                disabled
                                dir="ltr"
                                style={{ opacity: 0.5 }}
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>اسم مسؤول HR</label>
                            <input
                                type="text"
                                value={form.data.hr_name}
                                onChange={(e) => form.setData('hr_name', e.target.value)}
                                placeholder="اسم المسؤول"
                            />
                        </div>
                        <div className="fg">
                            <label>رقم جوال HR</label>
                            <input
                                type="text"
                                value={form.data.hr_phone}
                                onChange={(e) => form.setData('hr_phone', e.target.value)}
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
        </CompanyLayout>
    );
}
