import ClubLayout from '@/layouts/club-layout';
import SportIcon from '@/components/sport-icon';
import type { Sport } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    sports: Sport[];
}

export default function CourtCreate({ sports }: Props) {
    const form = useForm({
        name: '',
        sport_id: '',
        status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/club/courts');
    };

    return (
        <ClubLayout>
            <Head title="إضافة ملعب" />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/club/courts" style={{ color: '#8A7868', textDecoration: 'none', fontSize: 14 }}>← الملاعب</Link>
                <span style={{ color: '#C8D0E0' }}>/</span>
                <span style={{ fontWeight: 700 }}>إضافة ملعب</span>
            </div>

            {/* Errors */}
            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: '#C8410A10', border: '1px solid #C8410A33', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#C8410A', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 32, maxWidth: 500 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>إضافة ملعب جديد</div>
                <form onSubmit={handleSubmit}>
                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>اسم الملعب *</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="مثال: ملعب 1"
                            required
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>نوع الرياضة *</label>
                        <select
                            value={form.data.sport_id}
                            onChange={(e) => form.setData('sport_id', e.target.value)}
                        >
                            <option value="">اختر الرياضة</option>
                            {sports.map((sport) => (
                                <option key={sport.id} value={String(sport.id)}>
                                    <SportIcon icon={sport.icon} size={16} /> {sport.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="fg" style={{ marginBottom: 24 }}>
                        <label>الحالة</label>
                        <select
                            value={form.data.status}
                            onChange={(e) => form.setData('status', e.target.value)}
                        >
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="act-btn btn-reject"
                            style={{ flex: 1, background: '#C8410A', color: '#fff', borderColor: '#C8410A' }}
                        >
                            حفظ
                        </button>
                        <Link
                            href="/club/courts"
                            style={{ padding: '12px 24px', background: '#E2E8F4', borderRadius: 10, color: '#4A5C78', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </ClubLayout>
    );
}
