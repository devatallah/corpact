import BusinessLayout from '@/layouts/business-layout';
import CategoryIcon from '@/components/category-icon';
import StatusBadge from '@/components/status-badge';
import TimePicker from '@/components/time-picker';
import type { Business, Venue, VenuePricing, Category } from '@/types/models';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
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
    business: Business;
    venues: Venue[];
    categories: Category[];
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
export default function venuesIndex({ business, venues, categories }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Venue | null>(null);

    // Venue form (name, category, status only)
    const venueForm = useForm({ name: '', category_id: '', parent_category_id: '', status: 'active' });

    // Pricing add/edit state
    const [addingPricingFor, setAddingPricingFor] = useState<number | null>(null);
    const [editingPricing, setEditingPricing] = useState<VenuePricing | null>(null);
    const [pricingForm, setPricingForm] = useState<PricingFormData>(emptyPricingForm());
    const [pricingProcessing, setPricingProcessing] = useState(false);

    useEffect(() => {
        if (editingItem) {
            const cat = editingItem.category;
            const parentId = cat?.parent_id ? String(cat.parent_id) : String(editingItem.category_id);
            venueForm.setData({ name: editingItem.name, category_id: String(editingItem.category_id), parent_category_id: parentId, status: editingItem.status });
        } else if (!showCreate) {
            venueForm.reset();
        }
    }, [editingItem]);

    const modalSubcategories = useMemo(() => {
        if (!venueForm.data.parent_category_id) return [];
        const parent = categories.find((c) => String(c.id) === venueForm.data.parent_category_id);
        return parent?.children ?? [];
    }, [venueForm.data.parent_category_id, categories]);

    const handlevenueSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            venueForm.put('/business/venues/' + editingItem.id, { onSuccess: () => { setEditingItem(null); toastr.success('تم تعديل المرفق بنجاح'); } });
        } else {
            venueForm.post('/business/venues', { onSuccess: () => { setShowCreate(false); venueForm.reset(); toastr.success('تم إضافة المرفق بنجاح'); } });
        }
    };

    function startAddPricing(venueId: number) {
        setAddingPricingFor(venueId);
        setEditingPricing(null);
        setPricingForm(emptyPricingForm());
    }

    function startEditPricing(pricing: VenuePricing) {
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

    function submitAddPricing(e: React.FormEvent, venueId: number) {
        e.preventDefault();
        setPricingProcessing(true);
        router.visit(`/business/venues/${venueId}/pricings`, {
            method: 'post',
            data: pricingForm as never,
            preserveScroll: true,
            onSuccess: () => { setAddingPricingFor(null); setPricingForm(emptyPricingForm()); toastr.success('تم إضافة السعر بنجاح'); },
            onFinish: () => setPricingProcessing(false),
        });
    }

    function submitEditPricing(e: React.FormEvent, venueId: number, pricingId: number) {
        e.preventDefault();
        setPricingProcessing(true);
        router.visit(`/business/venues/${venueId}/pricings/${pricingId}`, {
            method: 'put',
            data: pricingForm as never,
            preserveScroll: true,
            onSuccess: () => { setEditingPricing(null); toastr.success('تم تحديث السعر بنجاح'); },
            onFinish: () => setPricingProcessing(false),
        });
    }

    function deletePricing(venueId: number, pricingId: number) {
        if (!confirm('هل أنت متأكد من حذف هذا السعر؟')) return;
        router.delete(`/business/venues/${venueId}/pricings/${pricingId}`, {
            preserveScroll: true,
            onSuccess: () => toastr.success('تم حذف السعر بنجاح'),
        });
    }

    return (
        <BusinessLayout>
            <Head title="إدارة المرافق" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <div className="page-title">إدارة المرافق</div>
                    <div className="page-sub">حدد المرافق وأنواعها وأسعارها</div>
                </div>
                <button
                    onClick={() => { venueForm.reset(); setShowCreate(true); }}
                    className="act-btn btn-reject"
                    style={{ background: '#C8410A', color: '#fff', borderColor: '#C8410A' }}
                >
                    + إضافة مرفق
                </button>
            </div>

            <div>
                {venues.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 40, color: '#8A7868' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🏟️</div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>لا توجد مرافق مسجلة</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>أضف مرفقك الأول من الزر أعلاه</div>
                    </div>
                ) : (
                    venues.map((venue) => (
                        <div className="card" style={{ marginBottom: 14 }} key={venue.id}>
                            {/* Venue header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CategoryIcon icon={venue.category?.icon} size={26} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 800 }}>{venue.name}</div>
                                        <div style={{ fontSize: 12, color: '#8A7868' }}>{venue.category?.name ?? ''}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <StatusBadge status={venue.status} />
                                    <button onClick={() => setEditingItem(venue)} style={{ background: '#F7F4F0', border: '1px solid #EAE4DC', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>تعديل</button>
                                </div>
                            </div>

                            {/* Pricings list */}
                            {venue.pricings && venue.pricings.length > 0 && (
                                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {venue.pricings.map((pricing) => (
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
                                                        onClick={() => router.post(`/business/venues/${venue.id}/pricings/${pricing.id}/toggle`, {}, { preserveScroll: true })}
                                                        style={{ background: 'none', border: `1px solid ${pricing.status === 'active' ? '#F59E0B33' : '#10B98133'}`, borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', color: pricing.status === 'active' ? '#F59E0B' : '#10B981' }}
                                                    >
                                                        {pricing.status === 'active' ? 'تعطيل' : 'تفعيل'}
                                                    </button>
                                                    <button onClick={() => startEditPricing(pricing)} style={{ background: 'none', border: '1px solid #EAE4DC', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', color: '#8A7868' }}>تعديل</button>
                                                    <button onClick={() => deletePricing(venue.id, pricing.id)} style={{ background: 'none', border: '1px solid #E0305033', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', color: '#E03050' }}>حذف</button>
                                                </div>
                                            </div>

                                            {/* Inline edit form */}
                                            {editingPricing?.id === pricing.id && (
                                                <PricingForm
                                                    data={pricingForm}
                                                    onChange={updatePricingField}
                                                    onSubmit={(e) => submitEditPricing(e, venue.id, pricing.id)}
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
                            {addingPricingFor === venue.id && (
                                <PricingForm
                                    data={pricingForm}
                                    onChange={updatePricingField}
                                    onSubmit={(e) => submitAddPricing(e, venue.id)}
                                    onCancel={cancelPricingForm}
                                    processing={pricingProcessing}
                                    submitLabel="إضافة"
                                />
                            )}

                            {/* Add pricing button */}
                            {addingPricingFor !== venue.id && (
                                <button
                                    onClick={() => startAddPricing(venue.id)}
                                    style={{ marginTop: 10, width: '100%', background: '#C8410A', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                    + إضافة سعر
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Venue Create/Edit Panel (name, category, status only) */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل مرفق' : 'إضافة مرفق'}
                            <button className="close-btn" onClick={() => { setShowCreate(false); setEditingItem(null); }}>×</button>
                        </h3>
                        <form onSubmit={handlevenueSubmit}>
                            <div className="frow">
                                <div className="fg">
                                    <label>اسم المرفق</label>
                                    <input type="text" value={venueForm.data.name} onChange={(e) => venueForm.setData('name', e.target.value)} required />
                                    {venueForm.errors.name && <div className="form-error">{venueForm.errors.name}</div>}
                                </div>
                                <div className="fg">
                                    <label>الفئة</label>
                                    <select
                                        value={venueForm.data.parent_category_id}
                                        onChange={(e) => {
                                            const parentId = e.target.value;
                                            const parent = categories.find((c) => String(c.id) === parentId);
                                            const hasChildren = (parent?.children?.length ?? 0) > 0;
                                            venueForm.setData({
                                                ...venueForm.data,
                                                parent_category_id: parentId,
                                                category_id: hasChildren ? '' : parentId,
                                            });
                                        }}
                                    >
                                        <option value="">اختر الفئة</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {venueForm.errors.category_id && <div className="form-error">{venueForm.errors.category_id}</div>}
                                </div>
                            </div>
                            <div className="frow">
                                <div className="fg">
                                    <label>الفئة الفرعية</label>
                                    <select
                                        value={venueForm.data.category_id}
                                        onChange={(e) => venueForm.setData('category_id', e.target.value)}
                                        disabled={!venueForm.data.parent_category_id || modalSubcategories.length === 0}
                                    >
                                        <option value="">{venueForm.data.parent_category_id ? 'اختر الفئة الفرعية' : 'اختر الفئة أولاً'}</option>
                                        {modalSubcategories.map((sub) => (
                                            <option key={sub.id} value={String(sub.id)}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="fg">
                                    <label>الحالة</label>
                                    <select value={venueForm.data.status} onChange={(e) => venueForm.setData('status', e.target.value)}>
                                        <option value="active">نشط</option>
                                        <option value="closed">مغلق</option>
                                            <option value="maintenance">صيانة</option>
                                    </select>
                                    {venueForm.errors.status && <div className="form-error">{venueForm.errors.status}</div>}
                                </div>
                            </div>
                            <div className="panel-actions">
                                <button type="submit" className="pa-approve" disabled={venueForm.processing}>حفظ</button>
                                <button type="button" className="pa-reject" onClick={() => { setShowCreate(false); setEditingItem(null); }}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </BusinessLayout>
    );
}
