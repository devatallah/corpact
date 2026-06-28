import BusinessLayout from '@/layouts/business-layout';
import CategoryIcon from '@/components/category-icon';
import StatusBadge from '@/components/status-badge';
import FilterTabs from '@/components/filter-tabs';
import Pagination from '@/components/pagination';
import type { Business, Event, EventAlternative, PaginatedResult } from '@/types/models';
import { fmtDate, fmtTime, fmtDateTime } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import TimePicker from '@/components/time-picker';
import toastr from 'toastr';

interface Props {
    business: Business;
    events: PaginatedResult<Event>;
    filters: { status?: string };
    pendingCount: number;
}

const statusFilters = [
    { label: 'الكل', value: '' },
    { label: 'معلق', value: 'waiting_business' },
    { label: 'مقبول', value: 'confirmed' },
    { label: 'مرفوض', value: 'rejected' },
    { label: 'وقت بديل', value: 'alternative_proposed' },
];

function statusBorderColor(status: string): string {
    switch (status) {
        case 'waiting_business':
            return '#B8860A';
        case 'confirmed':
            return '#1A7A4A';
        case 'rejected':
            return '#C8410A';
        case 'alternative_proposed':
            return '#1A5FAB';
        default:
            return '#8A7868';
    }
}

function RequestCard({ event }: { event: Event }) {
    const [showAlt, setShowAlt] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const rejectForm = useForm({ reason: '' });
    const altForm = useForm({
        proposed_date: '',
        proposed_start_time: '',
    });

    const submitAlternative = () => {
        altForm.post(`/business/requests/${event.id}/propose-alternative`, {
            onSuccess: () => {
                setShowAlt(false);
                toastr.success('تم إرسال الوقت البديل بنجاح');
            },
        });
    };

    const handleApprove = () => {
        router.post(`/business/requests/${event.id}/approve`, {}, {
            onSuccess: () => toastr.success('تم قبول الحجز بنجاح'),
        });
    };

    const handleReject = () => {
        setShowRejectDialog(true);
    };

    const submitReject = () => {
        rejectForm.post(`/business/requests/${event.id}/reject`, {
            onSuccess: () => {
                setShowRejectDialog(false);
                toastr.success('تم رفض الحجز');
            },
        });
    };

    return (
        <div className="card" style={{ borderRight: `4px solid ${statusBorderColor(event.status)}`, marginBottom: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{event.company?.name}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`badge b-${event.status}`} style={{ background: `${statusBorderColor(event.status)}18`, color: statusBorderColor(event.status) }}>
                            <CategoryIcon icon={event.category?.icon} size={14} /> {event.category?.name}
                        </span>
                        <span style={{ fontSize: 11, color: '#8A7868' }}>{fmtDateTime(event.created_at)}</span>
                    </div>
                </div>
                <StatusBadge status={event.status} />
            </div>

            {/* Details Grid */}
            <div className="req-grid">
                <div className="ri">
                    <div className="rl">📅 التاريخ</div>
                    <div className="rv">{fmtDate(event.event_date)}</div>
                </div>
                <div className="ri">
                    <div className="rl">🕐 الوقت</div>
                    <div className="rv">{fmtTime(event.start_time)}</div>
                </div>
                <div className="ri">
                    <div className="rl">🏟️ عدد المرافق</div>
                    <div className="rv">{event.venues_count} {event.venues_count > 1 ? 'مرافق' : 'مرفق'}</div>
                </div>
                <div className="ri">
                    <div className="rl">👥 عدد اللاعبين</div>
                    <div className="rv">{event.capacity} لاعبين</div>
                </div>
                <div className="ri">
                    <div className="rl">💰 إجمالي المبلغ</div>
                    <div className="rv" style={{ color: '#1A7A4A', fontSize: 16 }}>{event.total_amount.toLocaleString()} ريال</div>
                </div>
                <div className="ri">
                    <div className="rl">📐 الحساب</div>
                    <div className="rv" style={{ color: '#8A7868', fontSize: 11 }}>
                        {event.venues_count} مرفق &times; {event.venues_count > 0 ? Math.round(event.total_amount / event.venues_count).toLocaleString() : 0} ر
                    </div>
                </div>
            </div>

            {/* Proposed alternative info */}
            {event.status === 'alternative_proposed' && event.alternatives && event.alternatives.length > 0 && (() => {
                const alt = event.alternatives.find((a) => a.status === 'proposed') ?? event.alternatives[event.alternatives.length - 1];
                return (
                    <div style={{ background: 'rgba(26,95,171,.06)', border: '1px solid rgba(26,95,171,.25)', borderRadius: 10, padding: '12px 16px', marginTop: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A5FAB', marginBottom: 10 }}>الوقت البديل المقترح</div>
                        <div className="req-grid">
                            <div className="ri">
                                <div className="rl">📅 التاريخ</div>
                                <div className="rv">{fmtDate(alt.proposed_date)}</div>
                            </div>
                            <div className="ri">
                                <div className="rl">🕐 من</div>
                                <div className="rv">{fmtTime(alt.proposed_start_time)}</div>
                            </div>
                            <div className="ri">
                                <div className="rl">🕐 إلى</div>
                                <div className="rv">{fmtTime(alt.proposed_end_time)}</div>
                            </div>
                            {alt.proposed_venues_count && (
                                <div className="ri">
                                    <div className="rl">🏟️ مرافق</div>
                                    <div className="rv">{alt.proposed_venues_count}</div>
                                </div>
                            )}
                            {alt.proposed_amount && (
                                <div className="ri">
                                    <div className="rl">💰 المبلغ</div>
                                    <div className="rv" style={{ color: '#1A5FAB' }}>{Number(alt.proposed_amount).toLocaleString()} ريال</div>
                                </div>
                            )}
                        </div>
                        {alt.notes && <div style={{ fontSize: 12, color: '#4A5C78', marginTop: 8 }}>{alt.notes}</div>}
                        <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 6 }}>بانتظار رد الشركة</div>
                    </div>
                );
            })()}

            {/* Rejection reason */}
            {event.status === 'rejected' && event.rejection_reason && (
                <div style={{ background: '#C8410A18', border: '1px solid #C8410A33', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#C8410A', fontWeight: 700, marginTop: 10 }}>
                    سبب الرفض: {event.rejection_reason}
                </div>
            )}

            {/* Alternative form */}
            {event.status === 'waiting_business' && showAlt && (
                <div style={{ background: 'rgba(26,95,171,.06)', border: '1px solid rgba(26,95,171,.25)', borderRadius: 12, padding: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A5FAB', marginBottom: 14 }}>اقتراح وقت وتفاصيل بديلة</div>
                    <div className="frow">
                        <div className="fg">
                            <label>التاريخ البديل</label>
                            <input
                                type="date"
                                value={altForm.data.proposed_date}
                                onChange={(e) => altForm.setData('proposed_date', e.target.value)}
                            />
                            {altForm.errors.proposed_date && <div style={{ fontSize: 11, color: '#C8410A', marginTop: 4 }}>{altForm.errors.proposed_date}</div>}
                        </div>
                        <div className="fg">
                            <label>وقت البداية</label>
                            <TimePicker value={altForm.data.proposed_start_time} onChange={(v) => altForm.setData('proposed_start_time', v)} />
                            {altForm.errors.proposed_start_time && <div style={{ fontSize: 11, color: '#C8410A', marginTop: 4 }}>{altForm.errors.proposed_start_time}</div>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            className="act-btn btn-alt"
                            style={{ flex: 2, background: '#1A5FAB', color: '#fff', borderColor: '#1A5FAB' }}
                            onClick={submitAlternative}
                            disabled={altForm.processing || !altForm.data.proposed_date || !altForm.data.proposed_start_time}
                        >
                            {altForm.processing ? 'جارٍ الإرسال...' : 'إرسال الوقت البديل'}
                        </button>
                        <button
                            className="act-btn"
                            style={{ flex: 1, background: '#EAE4DC', color: '#8A7868', border: 'none' }}
                            onClick={() => { setShowAlt(false); altForm.reset(); }}
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {/* Reject reason dialog */}
            {showRejectDialog && (
                <div style={{ background: 'rgba(200,65,10,.06)', border: '1px solid rgba(200,65,10,.25)', borderRadius: 12, padding: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#C8410A', marginBottom: 12 }}>سبب الرفض</div>
                    <div className="fg" style={{ marginBottom: 12 }}>
                        <textarea
                            value={rejectForm.data.reason}
                            onChange={(e) => rejectForm.setData('reason', e.target.value)}
                            placeholder="اكتب سبب رفض الحجز..."
                            style={{ minHeight: 80 }}
                        />
                        {rejectForm.errors.reason && (
                            <div style={{ fontSize: 11, color: '#C8410A', marginTop: 4 }}>{rejectForm.errors.reason}</div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            className="act-btn btn-reject"
                            style={{ flex: 2 }}
                            onClick={submitReject}
                            disabled={rejectForm.processing || !rejectForm.data.reason.trim()}
                        >
                            {rejectForm.processing ? 'جارٍ الرفض...' : 'تأكيد الرفض'}
                        </button>
                        <button
                            className="act-btn"
                            style={{ flex: 1, background: '#EAE4DC', color: '#8A7868', border: 'none' }}
                            onClick={() => { setShowRejectDialog(false); rejectForm.reset(); }}
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            {event.status === 'waiting_business' && !showAlt && !showRejectDialog && (
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        className="act-btn btn-reject"
                        style={{ flex: 1 }}
                        onClick={handleReject}
                    >
                        رفض
                    </button>
                    <button
                        className="act-btn btn-alt"
                        style={{ flex: 1, background: '#D4820A20', color: '#D4820A', border: '1px solid #D4820A44' }}
                        onClick={() => setShowAlt(true)}
                    >
                        وقت بديل
                    </button>
                    <button
                        className="act-btn btn-approve"
                        style={{ flex: 2 }}
                        onClick={handleApprove}
                    >
                        قبول الحجز
                    </button>
                </div>
            )}
        </div>
    );
}

export default function BookingRequests({ business, events, filters, pendingCount }: Props) {
    return (
        <BusinessLayout>
            <Head title="طلبات الحجز" />

            <div style={{ marginBottom: 24 }}>
                <div className="page-title">طلبات الحجز</div>
                <div className="page-sub">{pendingCount} طلبات معلقة من أصل {events.total}</div>
            </div>

            <FilterTabs
                options={statusFilters}
                current={filters.status ?? ''}
            />

            <div>
                {events.data.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 40, color: '#8A7868' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>لا توجد طلبات حجز</div>
                    </div>
                ) : (
                    events.data.map((event) => (
                        <RequestCard key={event.id} event={event} />
                    ))
                )}
            </div>

            <Pagination links={events.links} />
        </BusinessLayout>
    );
}
