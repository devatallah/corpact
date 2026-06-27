import EmployeeLayout from '@/layouts/employee-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event, Employee, Community, Business, EventAlternative } from '@/types/models';
import toastr from 'toastr';

interface PaymentBreakdown {
    total_amount: number;
    community_balance: number;
    community_contribution: number;
    remaining: number;
    player_payment: number;
    cost_per_person: number;
    capacity: number;
}

interface SeriesEvent {
    id: number;
    event_date: string;
    start_time: string;
    status: string;
    participants_count: number;
    capacity: number;
}

interface RefundPreview {
    percentage: number;
    refund_amount: number;
    original_contribution: number;
    hours_until_event: number;
    policy_label: string;
}

interface Props {
    event: Event & {
        community: Community;
        business: Business;
        participants: (Employee & { pivot?: { status: string; position?: number } })[];
        waitlist_entries: (Employee & { pivot?: { status: string; position?: number } })[];
    };
    payment: PaymentBreakdown;
    isJoined: boolean;
    isWaitlisted: boolean;
    waitlistPosition: number | null;
    waitlistCount: number;
    canManageAlternatives: boolean;
    isCreator: boolean;
    seriesEvents: SeriesEvent[];
    refundPreview: RefundPreview | null;
}

export default function EventShow({ event, payment, isJoined, isWaitlisted, waitlistPosition, waitlistCount, canManageAlternatives, isCreator, seriesEvents, refundPreview }: Props) {
    const color = event.category?.color ?? event.community?.color ?? '#18A86B';
    const pct =
        event.capacity > 0
            ? Math.round((event.participants_count / event.capacity) * 100)
            : 0;

    const joinedParticipants = event.participants?.filter(
        (p) => (p as Employee & { pivot?: { status: string } }).pivot?.status === 'joined',
    ) ?? [];
    const emptySlots = Math.max(0, event.capacity - joinedParticipants.length);

    const waitlistEntries = event.waitlist_entries ?? [];

    const isFull = event.participants_count >= event.capacity;
    const canJoinWaitlist = isFull && !isJoined && !isWaitlisted && !['completed', 'cancelled', 'rejected'].includes(event.status);

    const [removeTarget, setRemoveTarget] = useState<{ id: number; name: string } | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelProcessing, setCancelProcessing] = useState(false);
    const canCancel = isCreator && !['cancelled', 'completed', 'rejected'].includes(event.status);

    function confirmRemove() {
        if (!removeTarget) return;
        router.post(`/employee/detail/${event.id}/remove/${removeTarget.id}`, {}, {
            preserveScroll: true,
            onSuccess: () => toastr.success('تم إزالة اللاعب من الفعالية'),
        });
        setRemoveTarget(null);
    }

    function handleJoin() {
        router.post(`/employee/detail/${event.id}/join`, {}, {
            onSuccess: () => toastr.success('تم الانضمام للفعالية بنجاح'),
        });
    }

    function handleJoinWaitlist() {
        router.post(`/employee/detail/${event.id}/join`, {}, {
            onSuccess: () => toastr.success('تم تسجيلك في قائمة الانتظار'),
        });
    }

    function handleLeave() {
        router.post(`/employee/detail/${event.id}/leave`, {}, {
            onSuccess: () => toastr.success('تم مغادرة الفعالية'),
        });
    }

    function handleLeaveWaitlist() {
        router.post(`/employee/detail/${event.id}/leave-waitlist`, {}, {
            onSuccess: () => toastr.success('تم إلغاء تسجيلك من قائمة الانتظار'),
        });
    }

    return (
        <EmployeeLayout>
            <Head title="تفاصيل الفعالية" />

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.5px' }}>{event.business?.name}</h1>
                <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{event.business?.district}</p>
            </div>

            {/* Recurrence badge */}
            {(event.recurrence_type && event.recurrence_type !== 'none') && (
                <div className="card" style={{ background: '#EFF6FF', borderColor: '#93C5FD', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#2563EB' }}>
                        فعالية متكررة — {event.recurrence_type === 'daily' ? 'يومي' : event.recurrence_type === 'weekly' ? 'أسبوعي' : 'شهري'}
                    </span>
                    {event.recurrence_end_date && (
                        <span style={{ fontSize: 12, color: '#999', marginRight: 'auto' }}>حتى {fmtDate(event.recurrence_end_date)}</span>
                    )}
                </div>
            )}

            {/* Occurrence badge */}
            {event.parent_event_id && (
                <div className="card" style={{ background: '#EFF6FF', borderColor: '#93C5FD', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#2563EB' }}>جزء من سلسلة فعاليات متكررة</span>
                    <span
                        onClick={() => router.get(`/employee/detail/${event.parent_event_id}`)}
                        style={{ fontSize: 12, color: '#2563EB', cursor: 'pointer', marginRight: 'auto', textDecoration: 'underline' }}
                    >
                        عرض السلسلة
                    </span>
                </div>
            )}

            {/* Info grid */}
            <div className="metrics" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="metric">
                    <div style={{ fontSize: 20, marginBottom: 6 }}>📅</div>
                    <div className="label">التاريخ</div>
                    <div className="value" style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{fmtDate(event.event_date)}</div>
                </div>
                <div className="metric">
                    <div style={{ fontSize: 20, marginBottom: 6 }}>🕐</div>
                    <div className="label">الوقت</div>
                    <div className="value" style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{fmtTime(event.start_time)}</div>
                </div>
                <div className="metric">
                    <div style={{ fontSize: 20, marginBottom: 6 }}>👥</div>
                    <div className="label">اللاعبون</div>
                    <div className="value" style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{event.participants_count}/{event.capacity}</div>
                </div>
                <div className="metric">
                    <div style={{ fontSize: 20, marginBottom: 6 }}>🏘️</div>
                    <div className="label">المجتمع</div>
                    <div className="value" style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{event.community?.name}</div>
                </div>
            </div>

            {/* Participants */}
            <div className="card">
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, textAlign: 'right' }}>اللاعبون ({event.participants_count}/{event.capacity})</div>
                <div className="bar-wrap" style={{ marginBottom: 16 }}>
                    <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {joinedParticipants.map((p) => (
                        <div key={p.id} style={{ position: 'relative' }}>
                            <div
                                title={p.name}
                                style={{ width: 44, height: 44, borderRadius: '50%', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, border: `2px solid ${color}44` }}
                            >
                                {p.name?.charAt(0)}
                            </div>
                            {isCreator && p.id !== event.created_by && ['open', 'waiting_business', 'alternative_proposed'].includes(event.status) && (
                                <button
                                    onClick={() => setRemoveTarget({ id: p.id, name: p.name ?? '' })}
                                    title="إزالة"
                                    style={{ position: 'absolute', top: -4, left: -4, width: 18, height: 18, borderRadius: '50%', background: '#EF4444', color: '#fff', border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px dashed #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 18 }}>+</div>
                    ))}
                </div>
            </div>

            {/* Series timeline */}
            {seriesEvents && seriesEvents.length > 0 && (
                <div className="card">
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                        سلسلة الفعاليات ({seriesEvents.length + 1} فعاليات)
                    </div>
                    {/* Parent event */}
                    <div
                        onClick={() => {
                            const parentId = event.parent_event_id ?? event.id;
                            if (parentId !== event.id) router.get(`/employee/detail/${parentId}`);
                        }}
                        className="list-row"
                        style={{
                            borderRadius: 10,
                            cursor: (event.parent_event_id ?? event.id) !== event.id ? 'pointer' : 'default',
                            background: !event.parent_event_id ? `${color}08` : 'transparent',
                            border: !event.parent_event_id ? `1px solid ${color}33` : '1px solid #EBEBEB',
                            marginBottom: 6,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: !event.parent_event_id ? color : '#666' }}>
                                {!event.parent_event_id ? 'الحالية' : fmtDate(event.parent_event?.event_date ?? '')}
                            </span>
                            {!event.parent_event_id && (
                                <span style={{ fontSize: 12, color: '#999' }}>{fmtDate(event.event_date)}</span>
                            )}
                        </div>
                    </div>
                    <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {seriesEvents.map((se) => {
                            const isCurrent = se.id === event.id;
                            const statusColor = se.status === 'cancelled' ? '#EF4444' : se.status === 'completed' ? '#999' : '#18A86B';
                            const statusLabel = se.status === 'cancelled' ? 'ملغية' : se.status === 'completed' ? 'منتهية' : `${se.participants_count}/${se.capacity}`;
                            return (
                                <div
                                    key={se.id}
                                    onClick={() => !isCurrent && router.get(`/employee/detail/${se.id}`)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 12px',
                                        borderRadius: 10,
                                        cursor: isCurrent ? 'default' : 'pointer',
                                        background: isCurrent ? `${color}08` : 'transparent',
                                        border: isCurrent ? `1px solid ${color}33` : '1px solid #EBEBEB',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? color : '#666' }}>
                                            {fmtDate(se.event_date)}
                                        </span>
                                        <span style={{ fontSize: 12, color: '#999' }}>
                                            {fmtTime(se.start_time)}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>
                                        {statusLabel}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Waiting list */}
            {waitlistCount > 0 && (
                <div className="card" style={{ borderColor: '#F59E0B44', background: '#FFFBEB' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, textAlign: 'right', color: '#D97706' }}>
                        قائمة الانتظار ({waitlistCount})
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {waitlistEntries.map((p, idx) => (
                            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div
                                    title={p.name}
                                    style={{ width: 38, height: 38, borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, border: '2px dashed #F59E0B44' }}
                                >
                                    {p.name?.charAt(0)}
                                </div>
                                <span style={{ fontSize: 10, color: '#D97706', fontWeight: 600 }}>#{idx + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Alternative proposed */}
            {event.status === 'alternative_proposed' && event.alternatives && event.alternatives.filter((a) => a.status === 'proposed').length > 0 && (
                <div className="card" style={{ borderColor: '#93C5FD', background: '#EFF6FF' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#2563EB', marginBottom: 12 }}>وقت بديل مقترح من المنشأة</div>
                    {event.alternatives.filter((a) => a.status === 'proposed').map((alt) => (
                        <div key={alt.id}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div>
                                    <div style={{ fontSize: 12, color: '#999' }}>التاريخ</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{fmtDate(alt.proposed_date)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, color: '#999' }}>الوقت</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{fmtTime(alt.proposed_start_time)} - {fmtTime(alt.proposed_end_time)}</div>
                                </div>
                                {alt.proposed_venues_count && (
                                    <div>
                                        <div style={{ fontSize: 12, color: '#999' }}>المرافق</div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{alt.proposed_venues_count}</div>
                                    </div>
                                )}
                                {alt.proposed_amount && (
                                    <div>
                                        <div style={{ fontSize: 12, color: '#999' }}>المبلغ</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#2563EB' }}>{Number(alt.proposed_amount).toLocaleString()} ريال</div>
                                    </div>
                                )}
                            </div>
                            {alt.notes && <div style={{ fontSize: 13, color: '#666', marginTop: 10 }}>{alt.notes}</div>}
                            {canManageAlternatives && (
                                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                                    <button
                                        onClick={() => router.post(`/employee/detail/${event.id}/alternatives/${alt.id}/accept`, {}, { onSuccess: () => toastr.success('تم قبول الوقت البديل') })}
                                        className="btn btn-primary"
                                        style={{ flex: 2 }}
                                    >
                                        قبول الوقت البديل
                                    </button>
                                    <button
                                        onClick={() => router.post(`/employee/detail/${event.id}/alternatives/${alt.id}/reject`, {}, { onSuccess: () => toastr.success('تم رفض الوقت البديل') })}
                                        className="btn btn-danger"
                                        style={{ flex: 1 }}
                                    >
                                        رفض
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {!canManageAlternatives && (
                        <div style={{ fontSize: 12, color: '#999', marginTop: 12, textAlign: 'center' }}>بانتظار رد منشئ الفعالية</div>
                    )}
                </div>
            )}

            {/* Payment */}
            <div className="card" style={{ background: '#ECFDF3', borderColor: '#18A86B33' }}>
                {/* Wallet balance */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#666' }}>رصيد محفظة المجتمع</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{payment.community_balance.toLocaleString()} ريال</span>
                </div>

                <div style={{ height: 1, background: '#18A86B22', margin: '8px 0' }} />

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>إجمالي الحجز</span>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{payment.total_amount.toLocaleString()} ريال</span>
                </div>

                {/* Wallet deduction */}
                {payment.community_contribution > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: '#666' }}>خصم من المحفظة</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#18A86B' }}>{payment.community_contribution.toLocaleString()} ريال</span>
                    </div>
                )}

                {/* Remaining after wallet */}
                {payment.community_contribution > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: '#666' }}>المتبقي على اللاعبين</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{payment.remaining.toLocaleString()} ريال</span>
                    </div>
                )}

                <div style={{ height: 1, background: '#18A86B22', margin: '8px 0' }} />

                {/* Per player */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>حصة كل لاعب</span>
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#18A86B' }}>{payment.player_payment.toLocaleString()} ريال</span>
                </div>
                {payment.player_payment <= 0 && payment.total_amount > 0 && (
                    <div style={{ marginTop: 8, background: '#18A86B18', borderRadius: 10, padding: '6px 10px', fontSize: 12, color: '#18A86B', textAlign: 'center' }}>
                        مغطى بالكامل من رصيد المجتمع
                    </div>
                )}
                {!event.budget_deducted_at && payment.community_contribution > 0 && (
                    <div style={{ marginTop: 8, background: '#FEF3C7', borderRadius: 10, padding: '6px 10px', fontSize: 12, color: '#92400E', textAlign: 'center' }}>
                        سيتم خصم مساهمة المجتمع بعد موافقة المنشأة
                    </div>
                )}
            </div>

            {/* Action buttons */}
            {event.status === 'completed' || event.status === 'cancelled' || event.status === 'rejected' ? (
                <div className="card" style={{ textAlign: 'center', background: '#F5F5F5', borderColor: '#EBEBEB' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#999' }}>
                        {event.status === 'completed' ? 'الفعالية منتهية' : event.status === 'rejected' ? 'الفعالية مرفوضة' : 'الفعالية ملغاة'}
                    </div>
                    {event.status === 'cancelled' && event.refund_amount != null && event.refund_amount > 0 && (
                        <div style={{ fontSize: 13, color: '#18A86B', marginTop: 6 }}>
                            تم استرداد {Number(event.refund_amount).toLocaleString()} ريال ({event.refund_percentage}%)
                        </div>
                    )}
                    {event.status === 'cancelled' && event.refund_percentage === 0 && (
                        <div style={{ fontSize: 13, color: '#EF4444', marginTop: 6 }}>
                            لم يتم استرداد أي مبلغ
                        </div>
                    )}
                </div>
            ) : isWaitlisted ? (
                <>
                    <div className="card" style={{ background: '#FFFBEB', borderColor: '#F59E0B44', textAlign: 'center' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#D97706' }}>
                            أنت في قائمة الانتظار (الترتيب: #{waitlistPosition})
                        </div>
                    </div>
                    <button
                        onClick={handleLeaveWaitlist}
                        className="btn btn-outline btn-full"
                        style={{ padding: '14px 20px' }}
                    >
                        إلغاء التسجيل من قائمة الانتظار
                    </button>
                </>
            ) : isJoined ? (
                <>
                    <div className="card" style={{ background: `${color}08`, borderColor: `${color}44`, textAlign: 'center' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color }}>
                            ✓ أنت منضم في هذه الفعالية
                        </div>
                    </div>
                    {!isCreator && (event.status === 'open' || event.status === 'waiting_business') && (
                        <button
                            onClick={handleLeave}
                            className="btn btn-outline btn-full"
                            style={{ padding: '14px 20px', marginBottom: 12 }}
                        >
                            مغادرة الفعالية
                        </button>
                    )}
                </>
            ) : event.status === 'open' && event.participants_count < event.capacity ? (
                <button
                    onClick={handleJoin}
                    className="btn btn-primary btn-full"
                    style={{ padding: '14px 20px', marginBottom: 12 }}
                >
                    انضم للفعالية
                </button>
            ) : canJoinWaitlist ? (
                <button
                    onClick={handleJoinWaitlist}
                    className="btn btn-full"
                    style={{ padding: '14px 20px', background: '#D97706', color: '#fff' }}
                >
                    انضم لقائمة الانتظار {waitlistCount > 0 ? `(${waitlistCount} منتظرين)` : ''}
                </button>
            ) : event.status === 'waiting_business' ? (
                <div className="card" style={{ background: '#FFFBEB', borderColor: '#F59E0B44', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#D97706' }}>بانتظار رد المنشأة</div>
                </div>
            ) : event.status === 'confirmed' ? (
                <div>
                    <div className="card" style={{ background: `${color}08`, borderColor: `${color}44`, textAlign: 'center' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color }}>الفعالية مؤكدة</div>
                    </div>
                    {event.payment_deadline && (
                        <div className="card" style={{ background: '#FFFBEB', borderColor: '#F59E0B44', textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#D97706' }}>
                                مهلة الدفع: {new Date(event.payment_deadline).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    )}
                </div>
            ) : event.status === 'alternative_proposed' ? (
                <div className="card" style={{ background: '#EFF6FF', borderColor: '#93C5FD', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#2563EB' }}>بانتظار الرد على الوقت البديل</div>
                </div>
            ) : (
                <div className="card" style={{ background: '#F5F5F5', borderColor: '#EBEBEB', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#999' }}>الفعالية مكتملة</div>
                </div>
            )}

            {/* Cancel series button for recurring event creators */}
            {isCreator && event.recurrence_type && event.recurrence_type !== 'none' && !event.parent_event_id && !['cancelled', 'completed'].includes(event.status) && (
                <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => {
                            if (confirm('هل تريد إلغاء هذه الفعالية فقط؟')) {
                                router.delete(`/employee/detail/${event.id}`, {
                                    onSuccess: () => toastr.success('تم إلغاء الفعالية'),
                                });
                            }
                        }}
                        className="btn btn-outline"
                        style={{ flex: 1 }}
                    >
                        إلغاء هذه الفعالية
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('هل تريد إلغاء كل الفعاليات المستقبلية في السلسلة؟')) {
                                router.delete(`/employee/detail/${event.id}?cancel_series=1`, {
                                    onSuccess: () => toastr.success('تم إلغاء سلسلة الفعاليات'),
                                });
                            }
                        }}
                        className="btn btn-danger"
                        style={{ flex: 1 }}
                    >
                        إلغاء كل السلسلة
                    </button>
                </div>
            )}

            {/* Cancel event button (creator only, non-recurring) */}
            {canCancel && !(event.recurrence_type && event.recurrence_type !== 'none' && !event.parent_event_id) && (
                <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelProcessing}
                    className="btn btn-danger btn-full"
                    style={{ padding: '14px 20px', marginTop: 12, opacity: cancelProcessing ? 0.5 : 1 }}
                >
                    إلغاء الفعالية
                </button>
            )}

            {/* Cancel event confirmation with refund info */}
            {showCancelModal && (
                <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
                    <div className="modal modal-dark" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EF444418', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <span style={{ fontSize: 22 }}>⚠</span>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>إلغاء الفعالية</div>
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', marginBottom: 16, lineHeight: 1.7 }}>
                            هل أنت متأكد من إلغاء هذه الفعالية؟ لا يمكن التراجع عن هذا الإجراء.
                        </div>

                        {/* Refund policy info */}
                        {refundPreview && refundPreview.original_contribution > 0 && (
                            <div style={{ background: '#2A2A2A', borderRadius: 12, padding: '14px 16px', marginBottom: 16, textAlign: 'right' }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.5)', marginBottom: 10 }}>سياسة الاسترداد</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>المبلغ المدفوع من المحفظة</span>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{refundPreview.original_contribution.toLocaleString()} ريال</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>نسبة الاسترداد</span>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: refundPreview.percentage > 0 ? '#18A86B' : '#EF4444' }}>{refundPreview.percentage}%</span>
                                </div>
                                <div style={{ height: 1, background: '#3A3A3A', margin: '8px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>مبلغ الاسترداد</span>
                                    <span style={{ fontSize: 20, fontWeight: 700, color: refundPreview.refund_amount > 0 ? '#18A86B' : '#EF4444' }}>
                                        {refundPreview.refund_amount.toLocaleString()} ريال
                                    </span>
                                </div>
                                <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 10, fontSize: 12, textAlign: 'center', background: refundPreview.percentage === 100 ? '#18A86B18' : refundPreview.percentage > 0 ? '#F59E0B18' : '#EF444418', color: refundPreview.percentage === 100 ? '#18A86B' : refundPreview.percentage > 0 ? '#F59E0B' : '#EF4444' }}>
                                    {refundPreview.policy_label}
                                    {refundPreview.percentage === 100 && ' — الإلغاء قبل 24 ساعة أو أكثر'}
                                    {refundPreview.percentage === 50 && ' — الإلغاء قبل 4 إلى 24 ساعة'}
                                    {refundPreview.percentage === 0 && ' — الإلغاء قبل أقل من 4 ساعات'}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelProcessing(true);
                                    router.delete(`/employee/detail/${event.id}`, {
                                        onSuccess: () => toastr.success('تم إلغاء الفعالية'),
                                        onFinish: () => setCancelProcessing(false),
                                    });
                                }}
                                disabled={cancelProcessing}
                                className="btn"
                                style={{ flex: 1, background: '#EF4444', color: '#fff', opacity: cancelProcessing ? 0.5 : 1 }}
                            >
                                نعم، إلغاء
                            </button>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="btn"
                                style={{ flex: 1, background: 'transparent', color: 'rgba(255,255,255,.5)', border: '1px solid #3A3A3A' }}
                            >
                                تراجع
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove member confirmation */}
            {removeTarget && (
                <div className="modal-overlay" onClick={() => setRemoveTarget(null)}>
                    <div className="modal modal-dark" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>إزالة لاعب</div>
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', marginBottom: 20, lineHeight: 1.7 }}>
                            هل تريد إزالة <span style={{ color: '#fff', fontWeight: 600 }}>{removeTarget.name}</span> من الفعالية؟
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={confirmRemove}
                                className="btn"
                                style={{ flex: 1, background: '#EF4444', color: '#fff' }}
                            >
                                إزالة
                            </button>
                            <button
                                onClick={() => setRemoveTarget(null)}
                                className="btn"
                                style={{ flex: 1, background: 'transparent', color: 'rgba(255,255,255,.5)', border: '1px solid #3A3A3A' }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </EmployeeLayout>
    );
}
