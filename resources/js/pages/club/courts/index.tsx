import ClubLayout from '@/layouts/club-layout';
import SportIcon from '@/components/sport-icon';
import StatusBadge from '@/components/status-badge';
import type { Club, Court, Sport } from '@/types/models';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toastr from 'toastr';

interface Props {
    club: Club;
    courts: Court[];
    sports: Sport[];
}

export default function CourtsIndex({ club, courts, sports }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Court | null>(null);

    const DURATIONS = [60, 90, 120];

    const form = useForm({
        name: '',
        sport_id: sports.length > 0 ? String(sports[0].id) : '',
        status: 'active',
        pricings: {} as Record<string, string>,
    });

    useEffect(() => {
        if (editingItem) {
            const pricings: Record<string, string> = {};
            editingItem.pricings?.forEach((p) => {
                pricings[String(p.duration_minutes)] = String(p.price);
            });
            form.setData({
                name: editingItem.name,
                sport_id: String(editingItem.sport_id),
                status: editingItem.status,
                pricings,
            });
        } else if (!showCreate) {
            form.reset();
        }
    }, [editingItem]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            form.put('/club/courts/' + editingItem.id, {
                onSuccess: () => {
                    setEditingItem(null);
                    toastr.success('تم تعديل الملعب بنجاح');
                },
            });
        } else {
            form.post('/club/courts', {
                onSuccess: () => {
                    setShowCreate(false);
                    form.reset();
                    toastr.success('تم إضافة الملعب بنجاح');
                },
            });
        }
    };

    return (
        <ClubLayout>
            <Head title="إدارة الملاعب" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <div className="page-title">إدارة الملاعب</div>
                    <div className="page-sub">حدد الملاعب وأنواعها وأسعارها</div>
                </div>
                <button
                    onClick={() => { form.reset(); setShowCreate(true); }}
                    className="act-btn btn-reject"
                    style={{ background: '#C8410A', color: '#fff', borderColor: '#C8410A' }}
                >
                    + إضافة ملعب
                </button>
            </div>

            <div>
                {courts.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 40, color: '#8A7868' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🏟️</div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>لا توجد ملاعب مسجلة</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>أضف ملعبك الأول من الزر أعلاه</div>
                    </div>
                ) : (
                    courts.map((court) => {
                        const sportName = court.sport?.name ?? '';
                        const pricingSummary =
                            court.pricings && court.pricings.length > 0
                                ? court.pricings
                                      .map((p) => `${p.duration_minutes} د: ${p.price.toLocaleString()} ر`)
                                      .join(' · ')
                                : 'لم يُحدد سعر';

                        return (
                            <div className="card" style={{ marginBottom: 14 }} key={court.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <SportIcon icon={court.sport?.icon} size={26} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 15, fontWeight: 800 }}>{court.name}</div>
                                            <div style={{ fontSize: 12, color: '#8A7868' }}>{sportName} &middot; {pricingSummary}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <StatusBadge status={court.status} />
                                        <button
                                            onClick={() => setEditingItem(court)}
                                            style={{ background: '#F7F4F0', border: '1px solid #EAE4DC', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                                        >
                                            تعديل
                                        </button>
                                    </div>
                                </div>

                                {/* Pricings */}
                                {court.pricings && court.pricings.length > 0 && (
                                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {court.pricings.map((pricing) => (
                                            <span
                                                key={pricing.id}
                                                style={{ background: '#F7F4F0', border: '1px solid #EAE4DC', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#1C1410' }}
                                            >
                                                {pricing.duration_minutes} دقيقة — {pricing.price.toLocaleString()} ريال
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل ملعب' : 'إضافة ملعب'}
                            <button className="close-btn" onClick={() => { setShowCreate(false); setEditingItem(null); }}>×</button>
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="frow">
                                <div className="fg">
                                    <label>اسم الملعب</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        required
                                    />
                                    {form.errors.name && <div className="form-error">{form.errors.name}</div>}
                                </div>
                                <div className="fg">
                                    <label>نوع الرياضة</label>
                                    <select
                                        value={form.data.sport_id}
                                        onChange={(e) => form.setData('sport_id', e.target.value)}
                                    >
                                        {sports.map((sport) => (
                                            <option key={sport.id} value={String(sport.id)}>
                                                <SportIcon icon={sport.icon} size={16} /> {sport.name}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.sport_id && <div className="form-error">{form.errors.sport_id}</div>}
                                </div>
                            </div>
                            <div className="frow">
                                <div className="fg">
                                    <label>الحالة</label>
                                    <select
                                        value={form.data.status}
                                        onChange={(e) => form.setData('status', e.target.value)}
                                    >
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                    {form.errors.status && <div className="form-error">{form.errors.status}</div>}
                                </div>
                                <div className="fg" />
                            </div>
                            {/* Pricing Section */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#8A7868', fontWeight: 600, marginBottom: 8 }}>الأسعار حسب مدة الحجز</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {DURATIONS.map((dur) => {
                                        const enabled = form.data.pricings[String(dur)] !== undefined;
                                        return (
                                            <div
                                                key={dur}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    background: '#F7F4F0',
                                                    border: '1px solid #EAE4DC',
                                                    borderRadius: 10,
                                                    padding: '10px 14px',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={enabled}
                                                        onChange={(e) => {
                                                            const next = { ...form.data.pricings };
                                                            if (e.target.checked) {
                                                                next[String(dur)] = '';
                                                            } else {
                                                                delete next[String(dur)];
                                                            }
                                                            form.setData('pricings', next);
                                                        }}
                                                        style={{ width: 18, height: 18, accentColor: '#C8410A', cursor: 'pointer' }}
                                                    />
                                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1C1410' }}>{dur} دقيقة</span>
                                                </div>
                                                {enabled && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="السعر"
                                                            value={form.data.pricings[String(dur)] ?? ''}
                                                            onChange={(e) => {
                                                                const next = { ...form.data.pricings };
                                                                next[String(dur)] = e.target.value;
                                                                form.setData('pricings', next);
                                                            }}
                                                            style={{
                                                                width: 100,
                                                                padding: '7px 10px',
                                                                borderRadius: 8,
                                                                border: '1px solid #EAE4DC',
                                                                fontSize: 13,
                                                                color: '#1C1410',
                                                                background: '#fff',
                                                                outline: 'none',
                                                                textAlign: 'center',
                                                            }}
                                                        />
                                                        <span style={{ fontSize: 12, color: '#8A7868' }}>ريال</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="panel-actions">
                                <button type="submit" className="pa-approve" disabled={form.processing}>حفظ</button>
                                <button type="button" className="pa-reject" onClick={() => { setShowCreate(false); setEditingItem(null); }}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ClubLayout>
    );
}
