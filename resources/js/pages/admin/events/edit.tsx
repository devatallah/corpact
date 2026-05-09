import AdminLayout from '@/layouts/admin-layout';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import TimePicker from '@/components/time-picker';
import toastr from 'toastr';

interface Props {
    event: Event;
}

export default function EventsEdit({ event }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        date: fmtDate(event.event_date),
        start_time: fmtTime(event.start_time),
        end_time: '',
        capacity: event.capacity ?? 4,
        courts_count: event.courts_count ?? 1,
        company_subsidy: event.company_subsidy ?? 0,
        notes: event.notes ?? '',
        status: event.status ?? 'open',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/events/${event.id}`, { onSuccess: () => toastr.success('تم التحديث بنجاح.') });
    }

    return (
        <AdminLayout>
            <Head title={`تعديل فعالية #${event.id}`} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Link href="/admin/events" style={{ color: '#6B7A99', textDecoration: 'none', fontSize: '14px' }}>
                    ← الفعاليات
                </Link>
                <span style={{ color: '#3D4A60' }}>/</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>تعديل فعالية #{event.id}</span>
            </div>

            {Object.keys(errors).length > 0 && (
                <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                    {Object.values(errors).map((error, i) => (
                        <p key={i} style={{ fontSize: '12px', color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div className="card" style={{ maxWidth: '600px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>تعديل الفعالية</div>
                <div style={{ fontSize: '13px', color: '#6B7A99', marginBottom: '20px' }}>
                    {event.community?.name ?? '-'} — {event.club?.name ?? '-'} — {event.sport?.name ?? '-'}
                </div>
                <form onSubmit={submit}>
                    <div className="frow">
                        <div className="fg">
                            <label>التاريخ</label>
                            <input
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                dir="ltr"
                            />
                        </div>
                        <div className="fg">
                            <label>وقت البداية</label>
                            <TimePicker value={data.start_time} onChange={(v) => setData('start_time', v)} dir="ltr" />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>عدد الملاعب</label>
                            <input
                                type="number"
                                value={data.courts_count}
                                onChange={(e) => setData('courts_count', Math.max(1, parseInt(e.target.value) || 1))}
                                min={1}
                            />
                        </div>
                        <div className="fg">
                            <label>عدد المشاركين</label>
                            <input
                                type="number"
                                value={data.capacity}
                                onChange={(e) => setData('capacity', Math.max(2, parseInt(e.target.value) || 2))}
                                min={2}
                            />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>مبلغ الدعم (ريال)</label>
                            <input
                                type="number"
                                value={data.company_subsidy}
                                onChange={(e) => setData('company_subsidy', Math.max(0, parseFloat(e.target.value) || 0))}
                                min={0}
                                dir="ltr"
                            />
                        </div>
                        <div className="fg">
                            <label>الحالة</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="open">مفتوح</option>
                                <option value="waiting_club">بانتظار النادي</option>
                                <option value="confirmed">مؤكد</option>
                                <option value="completed">مكتمل</option>
                                <option value="cancelled">ملغي</option>
                            </select>
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg" style={{ gridColumn: '1 / -1' }}>
                            <label>ملاحظات</label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="ملاحظات إضافية..."
                                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                        <button
                            type="submit"
                            disabled={processing}
                            className="act-btn btn-approve"
                            style={{ flex: 1, padding: '12px' }}
                        >
                            حفظ التعديلات
                        </button>
                        <Link
                            href="/admin/events"
                            style={{ padding: '12px 24px', background: '#232A3E', borderRadius: '10px', color: '#6B7A99', fontSize: '14px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
