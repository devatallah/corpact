import CompanyLayout from '@/layouts/company-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import toastr from 'toastr';

export default function EmployeeCreate() {
    const form = useForm({ email: '' });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.post('/company/employees', {
            onSuccess: () => toastr.success('تم إرسال الدعوة بنجاح'),
        });
    }

    return (
        <CompanyLayout>
            <Head title="دعوة موظف" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/company/employees" style={{ color: 'rgba(10,10,10,.55)', textDecoration: 'none', fontSize: 14 }}>
                    ← الموظفون
                </Link>
                <span style={{ color: '#0A0A0A' }}>/</span>
                <span style={{ fontWeight: 700 }}>دعوة موظف جديد</span>
            </div>

            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: '#D9381E10', border: '1px solid #D9381E33', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#D9381E', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div style={{ background: '#fff', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 16, padding: 32, maxWidth: 500 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>دعوة موظف</div>
                <div style={{ fontSize: 13, color: 'rgba(10,10,10,.55)', marginBottom: 20 }}>سيصل الموظف رابط دعوة للانضمام للمنصة</div>
                <form onSubmit={handleSubmit}>
                    <div className="fg" style={{ marginBottom: 24 }}>
                        <label className="fl">البريد الإلكتروني *</label>
                        <input
                            type="email"
                            dir="ltr"
                            className="fi"
                            placeholder="employee@company.com"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" style={{ flex: 1, padding: 12, background: '#0A0A0A', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} disabled={form.processing}>
                            إرسال الدعوة
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
