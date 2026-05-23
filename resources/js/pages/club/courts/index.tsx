import ClubLayout from '@/layouts/club-layout';
import SportIcon from '@/components/sport-icon';
import StatusBadge from '@/components/status-badge';
import TimePicker from '@/components/time-picker';
import type { Club, Court, CourtPricing, Sport } from '@/types/models';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toastr from 'toastr';

interface PricingFormData {
    duration_minutes: string;
    price: string;
    is_peak: boolean;
    label: string;
    start_time: string;
    end_time: string;
    days: number[];
}

interface Props {
    club: Club;
    courts: Court[];
    sports: Sport[];
}

const DURATIONS = [60, 90, 120];
const DAY_LABELS = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

function emptyPricingForm(): PricingFormData {
    return { duration_minutes: '60', price: '', is_peak: false, label: '', start_time: '', end_time: '', days: [] };
}

/* ── Pricing Form (shared for add & edit) ── */
function PricingForm({ data, onChange, onSubmit, onCancel, processing, submitLabel }: {
    data: PricingFormData;
    onChange: (field: keyof PricingFormData, value: unknown) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    processing: boolean;
    submitLabel: string;
}) {
    function toggleDay(day: number) {
        const current = data.days;
        const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
        onChange('days', next);
    }

    return (
        <form onSubmit={onSubmit} style={{ background: '#fff', border: '2px solid #C8410A33', borderRadius: 10, padding: '12px 14px', marginTop: 8 }}>
            {/* Duration + Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <select
                    value={data.duration_minutes}
                    onChange={(e) => onChange('duration_minutes', e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #EAE4DC', fontSize: 13, background: '#fff', outline: 'none', fontFamily: 'inherit' }}
                >
                    {DURATIONS.map((d) => (
                        <option key={d} value={String(d)}>{d} دقيقة</option>
                    ))}
                </select>
                <input
                    type="number"
                    min="0"
                    placeholder="السعر"
                    value={data.price}
                    onChange={(e) => onChange('price', e.target.value)}
                    required
                    style={{ width: 100, padding: '7px 10px', borderRadius: 8, border: '1px solid #EAE4DC', fontSize: 13, background: '#fff', outline: 'none', textAlign: 'center' }}
                />
                <span style={{ fontSize: 12, color: '#8A7868' }}>ريال</span>
            </div>

            {/* Peak toggle + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
                    <input
                        type="checkbox"
                        checked={data.is_peak}
                        onChange={(e) => onChange('is_peak', e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#E03050', cursor: 'pointer' }}
                    />
                    <span style={{ color: data.is_peak ? '#E03050' : '#8A7868', fontWeight: 600 }}>
                        {data.is_peak ? 'ذروة' : 'خارج الذروة'}
                    </span>
                </label>
                <input
                    type="text"
                    placeholder="تسمية (مثال: ساعات المساء)"
                    value={data.label}
                    onChange={(e) => onChange('label', e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #EAE4DC', fontSize: 12, background: '#fff', outline: 'none' }}
                />
            </div>

            {/* Time range */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#8A7868', minWidth: 30 }}>من</span>
                <TimePicker value={data.start_time} onChange={(v) => onChange('start_time', v)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #EAE4DC', fontSize: 12 }} />
                <span style={{ fontSize: 11, color: '#8A7868', minWidth: 30 }}>إلى</span>
                <TimePicker value={data.end_time} onChange={(v) => onChange('end_time', v)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #EAE4DC', fontSize: 12 }} />
            </div>

            {/* Days */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                {DAY_LABELS.map((label, dayIdx) => {
                    const isActive = data.days.includes(dayIdx);
                    return (
                        <button key={dayIdx} type="button" onClick={() => toggleDay(dayIdx)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${isActive ? '#C8410A' : '#EAE4DC'}`, background: isActive ? '#C8410A' : '#fff', color: isActive ? '#fff' : '#8A7868', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={processing} style={{ background: '#C8410A', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{submitLabel}</button>
                <button type="button" onClick={onCancel} style={{ background: '#F7F4F0', color: '#8A7868', border: '1px solid #EAE4DC', borderRadius: 8, padding: '6px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>إلغاء</button>
            </div>
        </form>
    );
}

/* ── Main Component ── */
export default function CourtsIndex({ club, courts, sports }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Court | null>(null);

    // Court form (name, sport, status only)
    const courtForm = useForm({ name: '', sport_id: sports.length > 0 ? String(sports[0].id) : '', status: 'active' });

    // Pricing add/edit state
    const [addingPricingFor, setAddingPricingFor] = useState<number | null>(null);
    const [editingPricing, setEditingPricing] = useState<CourtPricing | null>(null);
    const [pricingForm, setPricingForm] = useState<PricingFormData>(emptyPricingForm());
    const [pricingProcessing, setPricingProcessing] = useState(false);

    useEffect(() => {
        if (editingItem) {
            courtForm.setData({ name: editingItem.name, sport_id: String(editingItem.sport_id), status: editingItem.status });
        } else if (!showCreate) {
            courtForm.reset();
        }
    }, [editingItem]);

    const handleCourtSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            courtForm.put('/club/courts/' + editingItem.id, { onSuccess: () => { setEditingItem(null); toastr.success('تم تعديل الملعب بنجاح'); } });
        } else {
            courtForm.post('/club/courts', { onSuccess: () => { setShowCreate(false); courtForm.reset(); toastr.success('تم إضافة الملعب بنجاح'); } });
        }
    };

    function startAddPricing(courtId: number) {
        setAddingPricingFor(courtId);
        setEditingPricing(null);
        setPricingForm(emptyPricingForm());
    }

    function startEditPricing(pricing: CourtPricing) {
        setEditingPricing(pricing);
        setAddingPricingFor(null);
        setPricingForm({
            duration_minutes: String(pricing.duration_minutes),
            price: String(pricing.price),
            is_peak: pricing.is_peak ?? false,
            label: pricing.label ?? '',
            start_time: pricing.start_time?.slice(0, 5) ?? '',
            end_time: pricing.end_time?.slice(0, 5) ?? '',
            days: pricing.days ?? [],
        });
    }

    function cancelPricingForm() {
        setAddingPricingFor(null);
        setEditingPricing(null);
    }

    function updatePricingField(field: keyof PricingFormData, value: unknown) {
        setPricingForm((prev) => ({ ...prev, [field]: value }));
    }

    function submitAddPricing(e: React.FormEvent, courtId: number) {
        e.preventDefault();
        setPricingProcessing(true);
        router.visit(`/club/courts/${courtId}/pricings`, {
            method: 'post',
            data: pricingForm as never,
            preserveScroll: true,
            onSuccess: () => { setAddingPricingFor(null); setPricingForm(emptyPricingForm()); toastr.success('تم إضافة السعر بنجاح'); },
            onFinish: () => setPricingProcessing(false),
        });
    }

    function submitEditPricing(e: React.FormEvent, courtId: number, pricingId: number) {
        e.preventDefault();
        setPricingProcessing(true);
        router.visit(`/club/courts/${courtId}/pricings/${pricingId}`, {
            method: 'put',
            data: pricingForm as never,
            preserveScroll: true,
            onSuccess: () => { setEditingPricing(null); toastr.success('تم تحديث السعر بنجاح'); },
            onFinish: () => setPricingProcessing(false),
        });
    }

    function deletePricing(courtId: number, pricingId: number) {
        if (!confirm('هل أنت متأكد من حذف هذا السعر؟')) return;
        router.delete(`/club/courts/${courtId}/pricings/${pricingId}`, {
            preserveScroll: true,
            onSuccess: () => toastr.success('تم حذف السعر بنجاح'),
        });
    }

    return (
        <ClubLayout>
            <Head title="إدارة الملاعب" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <div className="page-title">إدارة الملاعب</div>
                    <div className="page-sub">حدد الملاعب وأنواعها وأسعارها</div>
                </div>
                <button
                    onClick={() => { courtForm.reset(); setShowCreate(true); }}
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
                    courts.map((court) => (
                        <div className="card" style={{ marginBottom: 14 }} key={court.id}>
                            {/* Court header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <SportIcon icon={court.sport?.icon} size={26} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 800 }}>{court.name}</div>
                                        <div style={{ fontSize: 12, color: '#8A7868' }}>{court.sport?.name ?? ''}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <StatusBadge status={court.status} />
                                    <button onClick={() => setEditingItem(court)} style={{ background: '#F7F4F0', border: '1px solid #EAE4DC', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>تعديل</button>
                                </div>
                            </div>

                            {/* Pricings list */}
                            {court.pricings && court.pricings.length > 0 && (
                                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {court.pricings.map((pricing) => (
                                        <div key={pricing.id}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: pricing.status === 'inactive' ? '#F7F4F0AA' : '#F7F4F0', border: '1px solid #EAE4DC', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#1C1410', flexWrap: 'wrap', opacity: pricing.status === 'inactive' ? 0.5 : 1 }}>
                                                <span style={{ fontWeight: 700 }}>{pricing.duration_minutes} دقيقة — {pricing.price.toLocaleString()} ريال</span>
                                                {pricing.is_peak ? (
                                                    <span style={{ background: '#E03050', color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 10 }}>ذروة</span>
                                                ) : (
                                                    <span style={{ background: '#10B981', color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 10 }}>خارج الذروة</span>
                                                )}
                                                {pricing.status === 'inactive' && (
                                                    <span style={{ background: '#8A7868', color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 10 }}>معطّل</span>
                                                )}
                                                {pricing.label && <span style={{ color: '#8A7868' }}>{pricing.label}</span>}
                                                {pricing.start_time && pricing.end_time && (
                                                    <span style={{ color: '#8A7868' }}>{pricing.start_time.slice(0, 5)} - {pricing.end_time.slice(0, 5)}</span>
                                                )}
                                                {pricing.days && pricing.days.length > 0 && (
                                                    <span style={{ color: '#8A7868' }}>{pricing.days.map((d) => DAY_LABELS[d]).join('، ')}</span>
                                                )}
                                                {/* Action buttons */}
                                                <div style={{ marginRight: 'auto', display: 'flex', gap: 4 }}>
                                                    <button
                                                        onClick={() => router.post(`/club/courts/${court.id}/pricings/${pricing.id}/toggle`, {}, { preserveScroll: true })}
                                                        style={{ background: 'none', border: `1px solid ${pricing.status === 'active' ? '#F59E0B33' : '#10B98133'}`, borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', color: pricing.status === 'active' ? '#F59E0B' : '#10B981' }}
                                                    >
                                                        {pricing.status === 'active' ? 'تعطيل' : 'تفعيل'}
                                                    </button>
                                                    <button onClick={() => startEditPricing(pricing)} style={{ background: 'none', border: '1px solid #EAE4DC', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', color: '#8A7868' }}>تعديل</button>
                                                    <button onClick={() => deletePricing(court.id, pricing.id)} style={{ background: 'none', border: '1px solid #E0305033', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', color: '#E03050' }}>حذف</button>
                                                </div>
                                            </div>

                                            {/* Inline edit form */}
                                            {editingPricing?.id === pricing.id && (
                                                <PricingForm
                                                    data={pricingForm}
                                                    onChange={updatePricingField}
                                                    onSubmit={(e) => submitEditPricing(e, court.id, pricing.id)}
                                                    onCancel={cancelPricingForm}
                                                    processing={pricingProcessing}
                                                    submitLabel="حفظ التعديل"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Inline add form */}
                            {addingPricingFor === court.id && (
                                <PricingForm
                                    data={pricingForm}
                                    onChange={updatePricingField}
                                    onSubmit={(e) => submitAddPricing(e, court.id)}
                                    onCancel={cancelPricingForm}
                                    processing={pricingProcessing}
                                    submitLabel="إضافة"
                                />
                            )}

                            {/* Add pricing button */}
                            {addingPricingFor !== court.id && (
                                <button
                                    onClick={() => startAddPricing(court.id)}
                                    style={{ marginTop: 10, width: '100%', background: '#C8410A', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                    + إضافة سعر
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Court Create/Edit Panel (name, sport, status only) */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل ملعب' : 'إضافة ملعب'}
                            <button className="close-btn" onClick={() => { setShowCreate(false); setEditingItem(null); }}>×</button>
                        </h3>
                        <form onSubmit={handleCourtSubmit}>
                            <div className="frow">
                                <div className="fg">
                                    <label>اسم الملعب</label>
                                    <input type="text" value={courtForm.data.name} onChange={(e) => courtForm.setData('name', e.target.value)} required />
                                    {courtForm.errors.name && <div className="form-error">{courtForm.errors.name}</div>}
                                </div>
                                <div className="fg">
                                    <label>نوع الرياضة</label>
                                    <select value={courtForm.data.sport_id} onChange={(e) => courtForm.setData('sport_id', e.target.value)}>
                                        {sports.map((sport) => (
                                            <option key={sport.id} value={String(sport.id)}>{sport.name}</option>
                                        ))}
                                    </select>
                                    {courtForm.errors.sport_id && <div className="form-error">{courtForm.errors.sport_id}</div>}
                                </div>
                            </div>
                            <div className="frow">
                                <div className="fg">
                                    <label>الحالة</label>
                                    <select value={courtForm.data.status} onChange={(e) => courtForm.setData('status', e.target.value)}>
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                    {courtForm.errors.status && <div className="form-error">{courtForm.errors.status}</div>}
                                </div>
                                <div className="fg" />
                            </div>
                            <div className="panel-actions">
                                <button type="submit" className="pa-approve" disabled={courtForm.processing}>حفظ</button>
                                <button type="button" className="pa-reject" onClick={() => { setShowCreate(false); setEditingItem(null); }}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ClubLayout>
    );
}
