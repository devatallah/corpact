import CompanyLayout from '@/layouts/company-layout';
import SportIcon from '@/components/sport-icon';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import toastr from 'toastr';

interface Props {
    employees: { id: number; name: string }[];
    sports: { id: number; name: string; icon: string }[];
}

export default function CommunityCreate({ employees, sports }: Props) {
    const form = useForm({
        name: '',
        description: '',
        sport_id: '',
        leader_id: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.post('/company/communities', {
            onSuccess: () => toastr.success('تم إنشاء المجتمع بنجاح'),
        });
    }

    return (
        <CompanyLayout>
            <Head title="إنشاء مجتمع" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/company/communities" style={{ color: '#7A8BA8', textDecoration: 'none', fontSize: 14 }}>
                    ← المجتمعات
                </Link>
                <span style={{ color: '#C8D0E0' }}>/</span>
                <span style={{ fontWeight: 700 }}>إنشاء مجتمع</span>
            </div>

            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: '#E0305010', border: '1px solid #E0305033', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 32, maxWidth: 600 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>إنشاء مجتمع جديد</div>
                <form onSubmit={handleSubmit}>
                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label className="fl">اسم المجتمع *</label>
                        <input
                            type="text"
                            className="fi"
                            placeholder="مثال: فريق كرة القدم"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            required
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label className="fl">الوصف</label>
                        <textarea
                            className="fi"
                            rows={3}
                            placeholder="وصف المجتمع..."
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                        <div className="fg">
                            <label className="fl">الرياضة *</label>
                            <select
                                className="fi"
                                value={form.data.sport_id}
                                onChange={(e) => form.setData('sport_id', e.target.value)}
                                required
                            >
                                <option value="">اختر الرياضة</option>
                                {sports.map((sport) => (
                                    <option key={sport.id} value={sport.id}>
                                        <SportIcon icon={sport.icon} size={16} /> {sport.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="fg">
                            <label className="fl">القائد *</label>
                            <select
                                className="fi"
                                value={form.data.leader_id}
                                onChange={(e) => form.setData('leader_id', e.target.value)}
                                required
                            >
                                <option value="">اختر القائد</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" className="ac-btn" style={{ flex: 1 }} disabled={form.processing}>
                            إنشاء
                        </button>
                        <Link
                            href="/company/communities"
                            style={{ padding: '12px 24px', background: '#E2E8F4', borderRadius: 10, color: '#4A5C78', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </CompanyLayout>
    );
}
