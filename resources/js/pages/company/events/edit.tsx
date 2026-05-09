import CompanyLayout from '@/layouts/company-layout';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import TimePicker from '@/components/time-picker';

interface Props {
    event: Event;
}

export default function EventEdit({ event }: Props) {
    const form = useForm({
        date: fmtDate(event.event_date),
        start_time: fmtTime(event.start_time),
        capacity: event.capacity ?? 4,
        courts_count: event.courts_count ?? 1,
        company_subsidy: event.company_subsidy ?? 0,
        notes: event.notes ?? '',
        status: event.status ?? 'open',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.put(`/company/events/${event.id}`);
    }

    return (
        <CompanyLayout>
            <Head title={`تعديل فعالية #${event.id}`} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/company/events" style={{ color: '#7A8BA8', textDecoration: 'none', fontSize: 14 }}>
                    ← الفعاليات
                </Link>
                <span style={{ color: '#C8D0E0' }}>/</span>
                <span style={{ fontWeight: 700 }}>تعديل فعالية #{event.id}</span>
            </div>

            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: '#E0305010', border: '1px solid #E0305033', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 32, maxWidth: 600 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>تعديل الفعالية</div>
                <div style={{ fontSize: 13, color: '#7A8BA8', marginBottom: 20 }}>
                    {event.community?.name ?? '-'} — {event.club?.name ?? '-'} — {event.sport?.name ?? '-'}
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="frow">
                        <div className="fg">
                            <label>التاريخ</label>
                            <input type="date" dir="ltr" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} />
                        </div>
                        <div className="fg">
                            <label>وقت البداية</label>
                            <TimePicker value={form.data.start_time} onChange={(v) => form.setData('start_time', v)} dir="ltr" />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>عدد الملاعب</label>
                            <input type="number" min={1} value={form.data.courts_count} onChange={(e) => form.setData('courts_count', Math.max(1, parseInt(e.target.value) || 1))} />
                        </div>
                        <div className="fg">
                            <label>عدد المشاركين</label>
                            <input type="number" min={2} value={form.data.capacity} onChange={(e) => form.setData('capacity', Math.max(2, parseInt(e.target.value) || 2))} />
                        </div>
                    </div>

                    <div className="frow">
                        <div className="fg">
                            <label>دعم الشركة (ريال)</label>
                            <input type="number" min={0} step={0.01} dir="ltr" value={form.data.company_subsidy} onChange={(e) => form.setData('company_subsidy', parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="fg">
                            <label>الحالة</label>
                            <select value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
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
                            <textarea value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} placeholder="ملاحظات إضافية..." style={{ width: '100%', minHeight: 80, resize: 'vertical' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                        <button type="submit" className="ac-btn" style={{ flex: 1 }} disabled={form.processing}>
                            حفظ التعديلات
                        </button>
                        <Link
                            href="/company/events"
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
