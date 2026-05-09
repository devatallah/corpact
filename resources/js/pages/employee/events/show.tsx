import EmployeeLayout from '@/layouts/employee-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event, Employee, Community, Club, EventAlternative } from '@/types/models';
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

interface Props {
    event: Event & {
        community: Community;
        club: Club;
        participants: (Employee & { pivot?: { status: string } })[];
    };
    payment: PaymentBreakdown;
    isJoined: boolean;
    canManageAlternatives: boolean;
    isCreator: boolean;
}

export default function EventShow({ event, payment, isJoined, canManageAlternatives, isCreator }: Props) {
    const color = event.sport?.color ?? event.community?.color ?? '#009E82';
    const pct =
        event.capacity > 0
            ? Math.round((event.participants_count / event.capacity) * 100)
            : 0;

    const joinedParticipants = event.participants?.filter(
        (p) => (p as Employee & { pivot?: { status: string } }).pivot?.status === 'joined',
    ) ?? [];
    const emptySlots = Math.max(0, event.capacity - joinedParticipants.length);

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

    function handleLeave() {
        router.post(`/employee/detail/${event.id}/leave`, {}, {
            onSuccess: () => toastr.success('تم مغادرة الفعالية'),
        });
    }

    return (
        <EmployeeLayout>
            <Head title="تفاصيل الفعالية" />

            {/* Header */}
            <div style={{ padding: '16px 0 20px' }}>
                <div style={{ fontSize: 11, color: '#7A8BA8' }}>تفاصيل الفعالية</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{event.club?.name}</div>
                <div style={{ fontSize: 13, color: '#7A8BA8' }}>{event.club?.district}</div>
            </div>

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
                            {isCreator && p.id !== event.created_by && ['open', 'waiting_club', 'alternative_proposed'].includes(event.status) && (
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

            {/* Alternative proposed */}
            {event.status === 'alternative_proposed' && event.alternatives && event.alternatives.filter((a) => a.status === 'proposed').length > 0 && (
                <div className="card" style={{ border: '1px solid #1A5FAB44', background: '#1A5FAB08' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1A5FAB', marginBottom: 10 }}>وقت بديل مقترح من النادي</div>
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
                                {alt.proposed_courts_count && (
                                    <div>
                                        <div style={{ fontSize: 10, color: '#7A8BA8' }}>الملاعب</div>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{alt.proposed_courts_count}</div>
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
            </div>

            {/* Action buttons */}
            {event.status === 'completed' || event.status === 'cancelled' || event.status === 'rejected' ? (
                <div style={{ background: '#E4E9F2', borderRadius: 16, padding: 16, textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#7A8BA8' }}>
                    {event.status === 'completed' ? 'الفعالية منتهية' : event.status === 'rejected' ? 'الفعالية مرفوضة' : 'الفعالية ملغاة'}
                </div>
            ) : isJoined ? (
                <>
                    <div style={{ background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 16, padding: 16, textAlign: 'center', fontSize: 15, fontWeight: 700, color, marginBottom: 12 }}>
                        ✓ أنت منضم في هذه الفعالية
                    </div>
                    {!isCreator && (event.status === 'open' || event.status === 'waiting_club') && (
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
            ) : event.status === 'waiting_club' ? (
                <div style={{ background: '#F59E0B18', border: '1px solid #F59E0B44', borderRadius: 16, padding: 16, textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#F59E0B' }}>
                    بانتظار رد النادي
                </div>
            ) : event.status === 'confirmed' ? (
                <div style={{ background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 16, padding: 16, textAlign: 'center', fontSize: 15, fontWeight: 700, color }}>
                    الفعالية مؤكدة
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
