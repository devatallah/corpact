import PartnerLayout from '@/layouts/partner-layout';
import ConfirmModal from '@/components/confirm-modal';
import type { ActivityUnit, UnitSlot } from '@/types/models';
import { fmtDate } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';

interface Props {
    units: ActivityUnit[];
    slots: UnitSlot[];
    week_start: string;
    week_end: string;
}

const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function addDays(date: string, days: number): string {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

export default function Availability({ units, slots, week_start }: Props) {
    const [selectedUnit, setSelectedUnit] = useState<number | ''>(units[0]?.id ?? '');
    const [deleteSlot, setDeleteSlot] = useState<UnitSlot | null>(null);
    const form = useForm({ activity_unit_id: '', date: '', start_time: '', end_time: '', note: '' });

    const days = Array.from({ length: 7 }, (_, i) => addDays(week_start, i));
    const unitSlots = (unitId: number, day: string) =>
        slots.filter((s) => s.activity_unit_id === unitId && s.date.slice(0, 10) === day);

    const navigateWeek = (delta: number) => {
        router.get('/partner/availability', { date: addDays(week_start, delta * 7) }, { preserveState: false });
    };

    return (
        <PartnerLayout>
            <Head title="التقويم والتوفر" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800 }}>التقويم والتوفر</h1>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="act-btn" style={{ padding: '6px 14px', borderRadius: 8 }} onClick={() => navigateWeek(-1)}>→ الأسبوع السابق</button>
                    <b style={{ fontSize: 13 }}>{fmtDate(week_start)}</b>
                    <button className="act-btn" style={{ padding: '6px 14px', borderRadius: 8 }} onClick={() => navigateWeek(1)}>الأسبوع التالي ←</button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 16, borderRight: '4px solid #B8860A', fontSize: 13, color: '#6A5C48' }}>
                <b>تقويم المنصة هو مصدر الحقيقة الوحيد</b> — ليس نظامك الداخلي ولا دفترك. أي وقت يظهر متاحاً هنا يمكن أن
                يُحجز. سجّل حجوزاتك الخارجية أولاً بأول بوسم «حجز خارجي»؛ تعارضٌ سببه عدم التحديث يتحمّله المزوّد
                (إلغاء + انخفاض الموثوقية + سياسة إلغاء المزوّد).
            </div>

            {/* تسجيل حجز خارجي */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>تسجيل حجز خارجي</div>
                <div className="frow">
                    <div className="fg">
                        <label>الوحدة</label>
                        <select value={form.data.activity_unit_id} onChange={(e) => form.setData('activity_unit_id', e.target.value)}>
                            <option value="">اختر</option>
                            {units.map((u) => <option key={u.id} value={u.id}>{u.branch?.name ? `${u.branch.name} — ` : ''}{u.name}</option>)}
                        </select>
                    </div>
                    <div className="fg"><label>اليوم</label><input type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} /></div>
                    <div className="fg"><label>من</label><input type="time" value={form.data.start_time} onChange={(e) => form.setData('start_time', e.target.value)} /></div>
                    <div className="fg"><label>إلى</label><input type="time" value={form.data.end_time} onChange={(e) => form.setData('end_time', e.target.value)} /></div>
                    <div className="fg"><label>ملاحظة</label><input value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} placeholder="حجز خارجي" /></div>
                </div>
                {(form.errors as Record<string, string>).slot && <div style={{ fontSize: 12, color: '#C8410A', marginBottom: 6 }}>{(form.errors as Record<string, string>).slot}</div>}
                <button
                    className="act-btn"
                    style={{ background: '#B8860A', color: '#fff', borderColor: '#B8860A', padding: '9px 20px', borderRadius: 8 }}
                    disabled={form.processing || !form.data.activity_unit_id || !form.data.date || !form.data.start_time || !form.data.end_time}
                    onClick={() => form.post('/partner/availability/external', { onSuccess: () => { form.reset(); toastr.success('سُجّل الحجز الخارجي'); } })}
                >
                    تسجيل «حجز خارجي»
                </button>
            </div>

            {/* شبكة الأسبوع */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 700 }}>الوحدة:</label>
                    <select value={selectedUnit} onChange={(e) => setSelectedUnit(Number(e.target.value))}>
                        {units.map((u) => <option key={u.id} value={u.id}>{u.branch?.name ? `${u.branch.name} — ` : ''}{u.name}</option>)}
                    </select>
                </div>

                {units.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#8A7868', padding: 30 }}>أضف فروعاً ووحدات نشاط أولاً.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                        {days.map((day, i) => (
                            <div key={day} style={{ border: '1px solid rgba(0,0,0,.08)', borderRadius: 10, padding: 8, minHeight: 110 }}>
                                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6, textAlign: 'center' }}>{dayNames[i]}<br /><span style={{ color: '#8A7868', fontWeight: 400 }}>{day.slice(5)}</span></div>
                                {selectedUnit !== '' && unitSlots(selectedUnit as number, day).map((slot) => (
                                    <div
                                        key={slot.id}
                                        onClick={() => slot.booking_type === 'external' && setDeleteSlot(slot)}
                                        style={{
                                            background: slot.booking_type === 'internal' ? '#1A7A4A18' : '#B8860A18',
                                            color: slot.booking_type === 'internal' ? '#1A7A4A' : '#B8860A',
                                            borderRadius: 6, padding: '4px 6px', fontSize: 11, fontWeight: 700, marginBottom: 4,
                                            cursor: slot.booking_type === 'external' ? 'pointer' : 'default',
                                        }}
                                        title={slot.booking_type === 'external' ? 'اضغط للحذف' : `فعالية #${slot.event_id ?? ''}`}
                                    >
                                        {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                                        <br />{slot.booking_type === 'internal' ? 'حجز منصة' : (slot.note || 'حجز خارجي')}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
                <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11, color: '#8A7868' }}>
                    <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#1A7A4A', borderRadius: 3, marginLeft: 4 }} /> حجز منصة (لا يُحذف من هنا)</span>
                    <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#B8860A', borderRadius: 3, marginLeft: 4 }} /> حجز خارجي (اضغط للحذف)</span>
                    <span>ما عدا ذلك متاح ضمن أوقات عمل الفرع.</span>
                </div>
            </div>

            <ConfirmModal
                open={deleteSlot !== null}
                title="حذف الحجز الخارجي"
                message="سيُعرض هذا الوقت متاحاً للحجز فور الحذف."
                onConfirm={() => {
                    if (deleteSlot) {
                        router.delete(`/partner/availability/external/${deleteSlot.id}`, { onSuccess: () => toastr.success('حُذف الحجز الخارجي') });
                    }
                    setDeleteSlot(null);
                }}
                onCancel={() => setDeleteSlot(null)}
            />
        </PartnerLayout>
    );
}
