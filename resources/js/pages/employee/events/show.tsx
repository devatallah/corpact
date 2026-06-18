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
}

export default function EventShow({ event, payment, isJoined, isWaitlisted, waitlistPosition, waitlistCount, canManageAlternatives, isCreator, seriesEvents }: Props) {
    const color = event.category?.color ?? event.community?.color ?? '#009E82';
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
            <div style={{ padding: '16px 0 20px' }}>
                <div style={{ fontSize: 11, color: '#7A8BA8' }}>تفاصيل الفعالية</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{event.business?.name}</div>
                <div style={{ fontSize: 13, color: '#7A8BA8' }}>{event.business?.district}</div>
            </div>

            {/* Recurrence badge */}
            {(event.recurrence_type && event.recurrence_type !== 'none') && (
                <div style={{ background: '#1A5FAB10', border: '1px solid #1A5FAB33', borderRadius: 12, padding: '8px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1A5FAB' }}>
                        فعالية متكررة — {event.recurrence_type === 'daily' ? 'يومي' : event.recurrence_type === 'weekly' ? 'أسبوعي' : 'شهري'}
                    </span>
                    {event.recurrence_end_date && (
                        <span style={{ fontSize: 11, color: '#7A8BA8', marginRight: 'auto' }}>حتى {fmtDate(event.recurrence_end_date)}</span>
                    )}
                </div>
            )}

            {/* Occurrence badge */}
            {event.parent_event_id && (
                <div style={{ background: '#1A5FAB10', border: '1px solid #1A5FAB33', borderRadius: 12, padding: '8px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1A5FAB' }}>جزء من سلسلة فعاليات متكررة</span>
                    <span
                        onClick={() => router.get(`/employee/detail/${event.parent_event_id}`)}
                        style={{ fontSize: 11, color: '#1A5FAB', cursor: 'pointer', marginRight: 'auto', textDecoration: 'underline' }}
                    >
                        عرض السلسلة
                    </span>
                </div>
            )}

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div className="card" style={{ marginBottom: 0 }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>📅</div>
                    <div style={{ fontSize: 10, color: '#7A8BA8' }}>التاريخ</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtDate(event.event_date)}</div>
                </div>
                <div className="card" style={{ marginBottom: 0 }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>🕐</div>
                    <div style={{ fontSize: 10, color: '#7A8BA8' }}>الوقت</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtTime(event.start_time)}</div>
                </div>
                <div className="card" style={{ marginBottom: 0 }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>👥</div>
                    <div style={{ fontSize: 10, color: '#7A8BA8' }}>اللاعبون</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{event.participants_count}/{event.capacity}</div>
                </div>
                <div className="card" style={{ marginBottom: 0 }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>🏘️</div>
                    <div style={{ fontSize: 10, color: '#7A8BA8' }}>المجتمع</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{event.community?.name}</div>
                </div>
            </div>

            {/* Participants */}
            <div className="card">
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, textAlign: 'right' }}>اللاعبون ({event.participants_count}/{event.capacity})</div>
                <div style={{ height: 6, background: '#E4E9F2', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 6 }} />
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {joinedParticipants.map((p) => (
                        <div key={p.id} style={{ position: 'relative' }}>
                            <div
                                title={p.name}
                                style={{ width: 44, height: 44, borderRadius: '50%', background: `${color}20`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, border: `2px solid ${color}44` }}
                            >
                                {p.name?.charAt(0)}
                            </div>
                            {isCreator && p.id !== event.created_by && ['open', 'waiting_business', 'alternative_proposed'].includes(event.status) && (
                                <button
                                    onClick={() => setRemoveTarget({ id: p.id, name: p.name ?? '' })}
                                    title="إزالة"
                                    style={{ position: 'absolute', top: -4, left: -4, width: 18, height: 18, borderRadius: '50%', background: '#E03050', color: '#fff', border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px dashed #D0D5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B0B8C8', fontSize: 18 }}>+</div>
                    ))}
                </div>
            </div>

            {/* Series timeline */}
            {seriesEvents && seriesEvents.length > 0 && (
                <div className="card">
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
                        سلسلة الفعاليات ({seriesEvents.length + 1} فعاليات)
                    </div>
                    {/* Parent event */}
                    <div
                        onClick={() => {
                            const parentId = event.parent_event_id ?? event.id;
                            if (parentId !== event.id) router.get(`/employee/detail/${parentId}`);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: 10,
                            marginBottom: 6,
                            cursor: (event.parent_event_id ?? event.id) !== event.id ? 'pointer' : 'default',
                            background: !event.parent_event_id ? `${color}10` : 'transparent',
                            border: !event.parent_event_id ? `1px solid ${color}33` : '1px solid #E4E9F2',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: !event.parent_event_id ? color : '#4A5C78' }}>
                                {!event.parent_event_id ? 'الحالية' : fmtDate(event.parent_event?.event_date ?? '')}
                            </span>
                            {!event.parent_event_id && (
                                <span style={{ fontSize: 11, color: '#7A8BA8' }}>{fmtDate(event.event_date)}</span>
                            )}
                        </div>
                    </div>
                    <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {seriesEvents.map((se) => {
                            const isCurrent = se.id === event.id;
                            const statusColor = se.status === 'cancelled' ? '#E03050' : se.status === 'completed' ? '#7A8BA8' : '#009E82';
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
                                        background: isCurrent ? `${color}10` : 'transparent',
                                        border: isCurrent ? `1px solid ${color}33` : '1px solid #E4E9F2',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? color : '#4A5C78' }}>
                                            {fmtDate(se.event_date)}
                                        </span>
                                        <span style={{ fontSize: 11, color: '#7A8BA8' }}>
                                            {fmtTime(se.start_time)}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: statusColor }}>
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
                <div className="card" style={{ border: '1px solid #F59E0B33', background: '#F59E0B08' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, textAlign: 'right', color: '#F59E0B' }}>
                        قائمة الانتظار ({waitlistCount})
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {waitlistEntries.map((p, idx) => (
                            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div
                                    title={p.name}
                                    style={{ width: 38, height: 38, borderRadius: '50%', background: '#F59E0B18', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, border: '2px dashed #F59E0B44' }}
                                >
                                    {p.name?.charAt(0)}
                                </div>
                                <span style={{ fontSize: 9, color: '#F59E0B', fontWeight: 600 }}>#{idx + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Alternative proposed */}
            {event.status === 'alternative_proposed' && event.alternatives && event.alternatives.filter((a) => a.status === 'proposed').length > 0 && (
                <div className="card" style={{ border: '1px solid #1A5FAB44', background: '#1A5FAB08' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1A5FAB', marginBottom: 10 }}>وقت بديل مقترح من المنشأة</div>
                    {event.alternatives.filter((a) => a.status === 'proposed').map((alt) => (
                        <div key={alt.id}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: '#7A8BA8' }}>التاريخ</div>
                                    <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtDate(alt.proposed_date)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: '#7A8BA8' }}>الوقت</div>
                                    <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtTime(alt.proposed_start_time)} - {fmtTime(alt.proposed_end_time)}</div>
                                </div>
                                {alt.proposed_venues_count && (
                                    <div>
                                        <div style={{ fontSize: 10, color: '#7A8BA8' }}>المرافق</div>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{alt.proposed_venues_count}</div>
                                    </div>
                                )}
                                {alt.proposed_amount && (
                                    <div>
                                        <div style={{ fontSize: 10, color: '#7A8BA8' }}>المبلغ</div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A5FAB' }}>{Number(alt.proposed_amount).toLocaleString()} ريال</div>
                                    </div>
                                )}
                            </div>
                            {alt.notes && <div style={{ fontSize: 12, color: '#4A5C78', marginTop: 8 }}>{alt.notes}</div>}
                            {canManageAlternatives && (
                                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                                    <button
                                        onClick={() => router.post(`/employee/detail/${event.id}/alternatives/${alt.id}/accept`, {}, { onSuccess: () => toastr.success('تم قبول الوقت البديل') })}
                                        style={{ flex: 2, padding: '10px 16px', background: '#0CA678', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                    >
                                        قبول الوقت البديل
                                    </button>
                                    <button
                                        onClick={() => router.post(`/employee/detail/${event.id}/alternatives/${alt.id}/reject`, {}, { onSuccess: () => toastr.success('تم رفض الوقت البديل') })}
                                        style={{ flex: 1, padding: '10px 16px', background: 'none', color: '#E03050', border: '1px solid #E03050', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                    >
                                        رفض
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {!canManageAlternatives && (
                        <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 10, textAlign: 'center' }}>بانتظار رد منشئ الفعالية</div>
                    )}
                </div>
            )}

            {/* Payment */}
            <div style={{ background: '#009E8210', border: '1px solid #009E8233', borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
                {/* Wallet balance */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#7A8BA8' }}>رصيد محفظة المجتمع</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F1923' }}>{payment.community_balance.toLocaleString()} ريال</span>
                </div>

                <div style={{ height: 1, background: '#009E8222', margin: '8px 0' }} />

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F1923' }}>إجمالي الحجز</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#0F1923' }}>{payment.total_amount.toLocaleString()} ريال</span>
                </div>

                {/* Wallet deduction */}
                {payment.community_contribution > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#7A8BA8' }}>خصم من المحفظة</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#009E82' }}>{payment.community_contribution.toLocaleString()} ريال</span>
                    </div>
                )}

                {/* Remaining after wallet */}
                {payment.community_contribution > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#7A8BA8' }}>المتبقي على اللاعبين</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0F1923' }}>{payment.remaining.toLocaleString()} ريال</span>
                    </div>
                )}

                <div style={{ height: 1, background: '#009E8222', margin: '8px 0' }} />

                {/* Per player */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>حصة كل لاعب</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#009E82' }}>{payment.player_payment.toLocaleString()} ريال</span>
                </div>
                {payment.player_payment <= 0 && payment.total_amount > 0 && (
                    <div style={{ marginTop: 8, background: '#009E8218', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#009E82', textAlign: 'center' }}>
                        مغطى بالكامل من رصيد المجتمع
                    </div>
                )}
                {!event.budget_deducted_at && payment.community_contribution > 0 && (
                    <div style={{ marginTop: 8, background: '#F59E0B18', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#B8860A', textAlign: 'center' }}>
                        سيتم خصم مساهمة المجتمع بعد موافقة المنشأة
                    </div>
                )}
            </div>

            {/* Action buttons */}
            {event.status === 'completed' || event.status === 'cancelled' || event.status === 'rejected' ? (
                <div style={{ background: '#E4E9F2', borderRadius: 16, padding: 16, textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#7A8BA8' }}>
                    {event.status === 'completed' ? 'الفعالية منتهية' : event.status === 'rejected' ? 'الفعالية مرفوضة' : 'الفعالية ملغاة'}
                </div>
            ) : isWaitlisted ? (
                <>
                    <div style={{ background: '#F59E0B18', border: '1px solid #F59E0B44', borderRadius: 16, padding: 16, textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#F59E0B', marginBottom: 12 }}>
                        أنت في قائمة الانتظار (الترتيب: #{waitlistPosition})
                    </div>
                    <button
                        onClick={handleLeaveWaitlist}
                        style={{ width: '100%', padding: 14, background: '#E4E9F2', color: '#7A8BA8', border: 'none', borderRadius: 16, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        إلغاء التسجيل من قائمة الانتظار
                    </button>
                </>
            ) : isJoined ? (
                <>
                    <div style={{ background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 16, padding: 16, textAlign: 'center', fontSize: 15, fontWeight: 700, color, marginBottom: 12 }}>
                        ✓ أنت منضم في هذه الفعالية
                    </div>
                    {!isCreator && (event.status === 'open' || event.status === 'waiting_business') && (
                        <button
                            onClick={handleLeave}
                            style={{ width: '100%', padding: 14, background: '#E4E9F2', color: '#7A8BA8', border: 'none', borderRadius: 16, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            مغادرة الفعالية
                        </button>
                    )}
                </>
            ) : event.status === 'open' && event.participants_count < event.capacity ? (
                <button
                    onClick={handleJoin}
                    style={{ width: '100%', padding: 16, background: color, color: '#fff', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                    انضم للفعالية
                </button>
            ) : canJoinWaitlist ? (
                <button
                    onClick={handleJoinWaitlist}
                    style={{ width: '100%', padding: 16, background: '#F59E0B', color: '#fff', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                    انضم لقائمة الانتظار {waitlistCount > 0 ? `(${waitlistCount} منتظرين)` : ''}
                </button>
            ) : event.status === 'waiting_business' ? (
                <div style={{ background: '#F59E0B18', border: '1px solid #F59E0B44', borderRadius: 16, padding: 16, textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#F59E0B' }}>
                    بانتظار رد المنشأة
                </div>
            ) : event.status === 'confirmed' ? (
                <div>
                    <div style={{ background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 16, padding: 16, textAlign: 'center', fontSize: 15, fontWeight: 700, color }}>
                        الفعالية مؤكدة
                    </div>
                    {event.payment_deadline && (
                        <div style={{ background: '#F59E0B18', border: '1px solid #F59E0B44', borderRadius: 12, padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#F59E0B', marginTop: 8 }}>
                            مهلة الدفع: {new Date(event.payment_deadline).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>
            ) : event.status === 'alternative_proposed' ? (
                <div style={{ background: '#1A5FAB18', border: '1px solid #1A5FAB44', borderRadius: 16, padding: 16, textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#1A5FAB' }}>
                    بانتظار الرد على الوقت البديل
                </div>
            ) : (
                <div style={{ background: '#E4E9F2', borderRadius: 16, padding: 16, textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#7A8BA8' }}>
                    الفعالية مكتملة
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
                        style={{ flex: 1, padding: 12, background: '#E4E9F2', color: '#7A8BA8', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
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
                        style={{ flex: 1, padding: 12, background: '#E0305018', color: '#E03050', border: '1px solid #E0305033', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        إلغاء كل السلسلة
                    </button>
                </div>
            )}

            {/* Remove member confirmation */}
            {removeTarget && (
                <div
                    onClick={() => setRemoveTarget(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{ background: '#1B2234', borderRadius: 16, padding: '24px 20px', width: '100%', maxWidth: 360, textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 10 }}>إزالة لاعب</div>
                        <div style={{ fontSize: 13, color: '#7A8BA8', marginBottom: 20, lineHeight: 1.7 }}>
                            هل تريد إزالة <span style={{ color: '#fff', fontWeight: 700 }}>{removeTarget.name}</span> من الفعالية؟
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={confirmRemove}
                                style={{ flex: 1, padding: '10px 16px', background: '#E03050', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                                إزالة
                            </button>
                            <button
                                onClick={() => setRemoveTarget(null)}
                                style={{ flex: 1, padding: '10px 16px', background: 'none', color: '#7A8BA8', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
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
