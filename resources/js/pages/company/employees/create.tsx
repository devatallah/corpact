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
                <Link href="/company/employees" style={{ color: '#999', textDecoration: 'none', fontSize: 14 }}>
                    ← الموظفون
                </Link>
                <span style={{ color: '#EBEBEB' }}>/</span>
                <span style={{ fontWeight: 700 }}>دعوة موظف جديد</span>
            </div>

            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: '#E0305010', border: '1px solid #E0305033', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div className="card" style={{ maxWidth: 500 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>دعوة موظف</div>
                <div style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>سيصل الموظف رابط دعوة للانضمام للمنصة</div>
                <form onSubmit={handleSubmit}>
                    <div className="fg" style={{ marginBottom: 24 }}>
                        <label>البريد الإلكتروني *</label>
                        <input
                            type="email"
                            dir="ltr"
                            placeholder="employee@company.com"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" className="ac-btn" style={{ flex: 1 }} disabled={form.processing}>
                            إرسال الدعوة
                        </button>
                        <Link
                            href="/company/employees"
                            className="ac-btn secondary"
                            style={{ padding: '12px 24px', textDecoration: 'none', textAlign: 'center' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </CompanyLayout>
    );
}
