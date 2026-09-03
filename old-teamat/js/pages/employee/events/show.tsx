import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';
import AttendancePanel from '@/components/attendance-panel';
import type {AttendancePanelData} from '@/components/attendance-panel';
import ConfirmModal from '@/components/confirm-modal';
import { Screen } from '@/components/employee/ui';
import StatusBadge from '@/components/status-badge';
import EmployeeLayout from '@/layouts/employee-layout';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event, Employee, Community, Partner, EventAlternative } from '@/types/models';

/** A10 — H §12.2: القيم بالريال للعرض (سلاسل)؛ الحساب هللات على الخادم. */
interface PaymentBreakdown {
    total_amount: string;
    vat_amount: string;
    community_balance: string;
    subsidy: string;
    remaining: string;
    /** السقف الملزم المعروض عند الانضمام — لا يُتجاوز أبداً */
    max_share: string;
    share_locked: boolean;
    final_share: string | null;
    collection_deadline_at: string | null;
    participants_count: number;
    min_participants: number;
    capacity: number;
}

interface MyPaymentIntent {
    id: number;
    amount: string;
    status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded';
    expires_at: string | null;
    paid_at: string | null;
    payment_url: string | null;
}

interface SeriesEvent {
    id: number;
    event_date: string;
    start_time: string;
    status: string;
    participants_count: number;
    capacity: number;
}

/** A10 — H §12.4: الإلغاء المشروع استرداد كامل دائماً — النسب المتدرجة ماتت. */
interface RefundPreview {
    percentage: number;
    policy_label: string;
}

interface Props {
    event: Event & {
        community: Community;
        partner: Partner;
        participants: (Employee & { pivot?: { seat_status?: string; position?: number | null } })[];
        waitlist_entries: (Employee & { pivot?: { seat_status?: string; position?: number | null } })[];
    };
    payment: PaymentBreakdown;
    myIntent?: MyPaymentIntent | null;
    isJoined: boolean;
    isWaitlisted: boolean;
    waitlistPosition: number | null;
    waitlistCount: number;
    seatOfferExpiresAt?: string | null;
    canManageAlternatives: boolean;
    isCreator: boolean;
    canCancel?: boolean;
    canApproveProposal?: boolean;
    canExtendRegistration?: boolean;
    registrationOpen?: boolean;
    seriesEvents: SeriesEvent[];
    refundPreview: RefundPreview | null;
    comments?: EventCommentItem[];
    canComment?: boolean;
    /** A12 — H §13: قائمة الحضور ونافذة الـ24 ساعة والنتائج (بعد الاكتمال فقط) */
    attendancePanel?: AttendancePanelData | null;
}

interface EventCommentItem {
    id: number;
    body: string;
    created_at: string;
    edited_at?: string | null;
    can_modify?: boolean;
    employee?: { id: number; name: string };
}

export default function EventShow({ event, payment, myIntent = null, isJoined, isWaitlisted, waitlistPosition, waitlistCount, seatOfferExpiresAt = null, canManageAlternatives, isCreator, canCancel = false, canApproveProposal = false, canExtendRegistration = false, registrationOpen = true, seriesEvents, refundPreview, comments = [], canComment, attendancePanel = null }: Props) {
    const color = event.category?.color ?? event.community?.color ?? '#0A0A0A';
    const pct =
        event.capacity > 0
            ? Math.round((event.participants_count / event.capacity) * 100)
            : 0;

    const joinedParticipants = event.participants?.filter(
        (p) => (p as Employee & { pivot?: { seat_status?: string } }).pivot?.seat_status === 'reserved',
    ) ?? [];
    const emptySlots = Math.max(0, event.capacity - joinedParticipants.length);

    const waitlistEntries = event.waitlist_entries ?? [];

    // آلة حالات H §9: الانضمام متاح قبل إغلاق التسجيل في هذه الحالات فقط
    const joinableStatuses = ['open', 'pending_provider', 'provider_alternative', 'booked'];
    const deadStatuses = ['completed', 'settled', 'expired', 'rejected', 'cancelled_min_not_met', 'cancelled_provider', 'cancelled_company', 'cancelled_payment_failed'];
    const isCancelledStatus = event.status.startsWith('cancelled');
    const isFull = event.is_full ?? event.participants_count >= event.capacity;
    const canJoin = joinableStatuses.includes(event.status) && registrationOpen && !isFull && !isJoined && !isWaitlisted;
    const canJoinWaitlist = isFull && !isJoined && !isWaitlisted && registrationOpen && joinableStatuses.includes(event.status);

    const [removeTarget, setRemoveTarget] = useState<{ id: number; name: string } | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelProcessing, setCancelProcessing] = useState(false);
    // canCancel يأتي من الخادم: صلاحية event.cancel + حالة booked/confirmed (H §9)

    // H §18: «كل إجراء مالي أو إلغائي يمر بنافذة تأكيد تعرض المبلغ والأثر
    // صراحة» — نافذة واحدة مشتركة بدل نوافذ المتصفح.
    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        message: string;
        confirmLabel: string;
        run: () => void;
    } | null>(null);

    function runConfirmAction() {
        const pending = confirmAction;
        setConfirmAction(null);
        pending?.run();
    }

    /** سياسة الاسترداد المعروضة في نافذة الإلغاء — نفس مصدر نافذة الإلغاء المفردة. */
    const refundClause = refundPreview
        ? ` نسبة الاسترداد ${refundPreview.percentage}% — ${refundPreview.policy_label}.`
        : '';

    function confirmRemove() {
        if (!removeTarget) {
return;
}

        router.post(`/employee/detail/${event.id}/remove/${removeTarget.id}`, {}, {
            preserveScroll: true,
            onSuccess: () => toastr.success('تم إزالة اللاعب من الفعالية'),
        });
        setRemoveTarget(null);
    }

    // Comments — تعليقات الأعضاء تحت الفعالية فقط (H §6)
    const [commentBody, setCommentBody] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editCommentBody, setEditCommentBody] = useState('');

    function submitComment(e: React.FormEvent) {
        e.preventDefault();

        if (!commentBody.trim()) {
return;
}

        router.post(`/employee/detail/${event.id}/comments`, { body: commentBody }, {
            preserveScroll: true,
            onSuccess: () => {
                setCommentBody('');
                toastr.success('تم نشر التعليق');
            },
        });
    }

    function submitEditComment(e: React.FormEvent, commentId: number) {
        e.preventDefault();
        router.patch(`/employee/comments/${commentId}`, { body: editCommentBody }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCommentId(null);
                toastr.success('تم تعديل التعليق');
            },
        });
    }

    function deleteComment(commentId: number) {
        setConfirmAction({
            title: 'حذف التعليق',
            message: 'يُحذف تعليقك من صفحة الفعالية ولا يظهر للمشاركين بعد ذلك. الحذف متاح خلال 15 دقيقة من نشره فقط، ولا يمكن التراجع عنه.',
            confirmLabel: 'حذف التعليق',
            run: () =>
                router.delete(`/employee/comments/${commentId}`, {
                    preserveScroll: true,
                    onSuccess: () => toastr.success('تم حذف التعليق'),
                }),
        });
    }

    function reportComment(commentId: number) {
        const reason = prompt('سبب التبليغ (اختياري) — يصل التبليغ لمسؤول الحساب في شركتك:');

        if (reason === null) {
return;
}

        router.post(`/employee/comments/${commentId}/report`, { reason: reason || null }, {
            preserveScroll: true,
            onSuccess: () => toastr.success('تم إرسال التبليغ لمسؤول الحساب'),
        });
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

    // H §10: عرض المقعد الشاغر بمهلة — قبول أو رفض
    function handleAcceptSeatOffer() {
        router.post(`/employee/detail/${event.id}/waitlist-offer/accept`, {}, {
            onSuccess: () => toastr.success('تم تأكيد مقعدك في الفعالية'),
        });
    }

    function handleDeclineSeatOffer() {
        router.post(`/employee/detail/${event.id}/waitlist-offer/decline`, {}, {
            onSuccess: () => toastr.success('تم رفض العرض'),
        });
    }

    // H §7: اعتماد/رفض اقتراح الموظف (قائد/منسّق)
    function handleApproveProposal() {
        router.post(`/employee/detail/${event.id}/proposal/approve`, {}, {
            onSuccess: () => toastr.success('تم اعتماد الاقتراح ونشر الفعالية'),
        });
    }

    function handleRejectProposal() {
        const reason = prompt('سبب الرفض (اختياري):');

        if (reason === null) {
return;
}

        router.post(`/employee/detail/${event.id}/proposal/reject`, { reason }, {
            onSuccess: () => toastr.success('تم رفض الاقتراح'),
        });
    }

    return (
        <EmployeeLayout>
            <Head title="تفاصيل الفعالية" />

            <Screen>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 className="text-lg font-black text-[#0A0A0A]">{event.partner?.name}</h1>
                <p className="text-[11px] text-[#0A0A0A]/55 mt-0.5">{event.partner?.district}</p>
            </div>

            {/* A8 — مولّدة من قالب تكرار (H §8) */}
            {event.template_id && (
                <div className="card" style={{ background: '#F6F8F5', borderColor: 'rgba(10,10,10,.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A' }}>فعالية متكررة — مولّدة من قالب</span>
                </div>
            )}

            {/* A8 — H §8: أُعيدت جدولتها مرة لعدم اكتمال العدد */}
            {(event.reschedule_attempt ?? 0) > 0 && event.original_starts_at && (
                <div className="card" style={{ background: '#FEF9E0', borderColor: 'rgba(200,125,0,.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>⏭️</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#C87D00' }}>
                        أُعيدت جدولتها مرة — لم يكتمل العدد في الموعد الأصلي ({fmtDate(event.original_starts_at)}). إن لم يكتمل هذه المرة تُلغى نهائياً.
                    </span>
                </div>
            )}

            {/* Occurrence badge */}
            {event.parent_event_id && (
                <div className="card" style={{ background: '#F6F8F5', borderColor: 'rgba(10,10,10,.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A' }}>جزء من سلسلة فعاليات متكررة</span>
                    <span
                        onClick={() => router.get(`/employee/detail/${event.parent_event_id}`)}
                        style={{ fontSize: 12, color: '#0A0A0A', cursor: 'pointer', marginRight: 'auto', textDecoration: 'underline' }}
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
                            {isCreator && p.id !== event.created_by && ['open', 'pending_provider', 'provider_alternative', 'booked'].includes(event.status) && (
                                <button
                                    onClick={() => setRemoveTarget({ id: p.id, name: p.name ?? '' })}
                                    title="إزالة"
                                    style={{ position: 'absolute', top: -4, left: -4, width: 18, height: 18, borderRadius: '50%', background: '#D9381E', color: '#fff', border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    {Array.from({ length: emptySlots }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px dashed rgba(10,10,10,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(10,10,10,.5)', fontSize: 18 }}>+</div>
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

                            if (parentId !== event.id) {
router.get(`/employee/detail/${parentId}`);
}
                        }}
                        className="list-row"
                        style={{
                            borderRadius: 10,
                            cursor: (event.parent_event_id ?? event.id) !== event.id ? 'pointer' : 'default',
                            background: !event.parent_event_id ? `${color}08` : 'transparent',
                            border: !event.parent_event_id ? `1px solid ${color}33` : '0.5px solid rgba(10,10,10,.1)',
                            marginBottom: 6,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: !event.parent_event_id ? color : 'rgba(10,10,10,.6)' }}>
                                {!event.parent_event_id ? 'الحالية' : fmtDate(event.parent_event?.event_date ?? '')}
                            </span>
                            {!event.parent_event_id && (
                                <span style={{ fontSize: 12, color: 'rgba(10,10,10,.5)' }}>{fmtDate(event.event_date)}</span>
                            )}
                        </div>
                    </div>
                    <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {seriesEvents.map((se) => {
                            const isCurrent = se.id === event.id;
                            const statusColor = se.status.startsWith('cancelled') || se.status === 'expired' ? '#EF4444' : se.status === 'completed' ? 'rgba(10,10,10,.5)' : '#0A0A0A';
                            const statusLabel = se.status.startsWith('cancelled') || se.status === 'expired' ? 'ملغية' : se.status === 'completed' ? 'مكتملة' : `${se.participants_count}/${se.capacity}`;

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
                                        border: isCurrent ? `1px solid ${color}33` : '0.5px solid rgba(10,10,10,.1)',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? color : 'rgba(10,10,10,.6)' }}>
                                            {fmtDate(se.event_date)}
                                        </span>
                                        <span style={{ fontSize: 12, color: 'rgba(10,10,10,.5)' }}>
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
                <div className="card" style={{ borderColor: 'rgba(200,125,0,.3)44', background: '#FEF9E0' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, textAlign: 'right', color: '#C87D00' }}>
                        قائمة الانتظار ({waitlistCount})
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {waitlistEntries.map((p, idx) => (
                            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div
                                    title={p.name}
                                    style={{ width: 38, height: 38, borderRadius: '50%', background: '#FEF9E0', color: '#C87D00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, border: '2px dashed rgba(200,125,0,.27)' }}
                                >
                                    {p.name?.charAt(0)}
                                </div>
                                <span style={{ fontSize: 10, color: '#C87D00', fontWeight: 600 }}>#{idx + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Alternative proposed */}
            {event.status === 'provider_alternative' && event.alternatives && event.alternatives.filter((a) => a.status === 'proposed').length > 0 && (
                <div className="card" style={{ borderColor: 'rgba(10,10,10,.1)', background: '#F6F8F5' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', marginBottom: 12 }}>وقت بديل مقترح من الشريك</div>
                    {event.alternatives.filter((a) => a.status === 'proposed').map((alt) => (
                        <div key={alt.id}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div>
                                    <div style={{ fontSize: 12, color: 'rgba(10,10,10,.5)' }}>التاريخ</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{fmtDate(alt.proposed_date)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, color: 'rgba(10,10,10,.5)' }}>الوقت</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{fmtTime(alt.proposed_start_time)} - {fmtTime(alt.proposed_end_time)}</div>
                                </div>
                                {alt.proposed_venues_count && (
                                    <div>
                                        <div style={{ fontSize: 12, color: 'rgba(10,10,10,.5)' }}>المرافق</div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{alt.proposed_venues_count}</div>
                                    </div>
                                )}
                                {alt.proposed_amount && (
                                    <div>
                                        <div style={{ fontSize: 12, color: 'rgba(10,10,10,.5)' }}>المبلغ</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A' }}>{Number(alt.proposed_amount).toLocaleString()} ريال</div>
                                    </div>
                                )}
                            </div>
                            {alt.notes && <div style={{ fontSize: 13, color: 'rgba(10,10,10,.6)', marginTop: 10 }}>{alt.notes}</div>}
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
                        <div style={{ fontSize: 12, color: 'rgba(10,10,10,.5)', marginTop: 12, textAlign: 'center' }}>بانتظار رد منشئ الفعالية</div>
                    )}
                </div>
            )}

            {/* Payment — A10 (H §12.2): الحصة القصوى سقف ملزم، والنهائية تُقفل عند الإغلاق */}
            <div className="card" style={{ background: '#E8F5E9', borderColor: '#0A0A0A33' }}>
                {/* Wallet balance */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'rgba(10,10,10,.6)' }}>رصيد محفظة المجتمع</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{Number(payment.community_balance).toLocaleString()} ريال</span>
                </div>

                <div style={{ height: 1, background: '#0A0A0A22', margin: '8px 0' }} />

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>إجمالي الفعالية (شامل الضريبة)</span>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{Number(payment.total_amount).toLocaleString()} ريال</span>
                </div>

                {/* Subsidy */}
                {Number(payment.subsidy) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: 'rgba(10,10,10,.6)' }}>دعم المجتمع</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A' }}>{Number(payment.subsidy).toLocaleString()} ريال</span>
                    </div>
                )}

                {/* Remaining after subsidy */}
                {Number(payment.subsidy) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: 'rgba(10,10,10,.6)' }}>المتبقي على المشاركين</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{Number(payment.remaining).toLocaleString()} ريال</span>
                    </div>
                )}

                <div style={{ height: 1, background: '#0A0A0A22', margin: '8px 0' }} />

                {payment.share_locked && payment.final_share !== null ? (
                    <>
                        {/* الحصة النهائية المقفلة عند الإغلاق — لا تتغير بعدها أبداً */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>حصة الفرد النهائية</span>
                            <span style={{ fontSize: 22, fontWeight: 700, color: '#0A0A0A' }}>{Number(payment.final_share).toLocaleString()} ريال</span>
                        </div>
                        <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(10,10,10,.6)' }}>
                            قُفلت عند إغلاق التسجيل ولن تتغير — ولن يُطلب منك مبلغ إضافي بعد الدفع أبداً
                        </div>
                    </>
                ) : (
                    <>
                        {/* H §12.2: «حصتك بحد أقصى … وتقل كلما انضم زملاؤك» — وعد ملزم */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>حصتك بحد أقصى</span>
                            <span style={{ fontSize: 22, fontWeight: 700, color: '#0A0A0A' }}>{Number(payment.max_share).toLocaleString()} ريال</span>
                        </div>
                        {Number(payment.max_share) > 0 && (
                            <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(10,10,10,.6)' }}>
                                وتقل كلما انضم زملاؤك — هذا السقف وعد ملزم لا يُتجاوز أبداً
                            </div>
                        )}
                    </>
                )}
                {Number(payment.max_share) <= 0 && Number(payment.total_amount) > 0 && (
                    <div style={{ marginTop: 8, background: '#0A0A0A18', borderRadius: 10, padding: '6px 10px', fontSize: 12, color: '#0A0A0A', textAlign: 'center' }}>
                        مغطى بالكامل من رصيد المجتمع
                    </div>
                )}
                {!event.budget_deducted_at && Number(payment.subsidy) > 0 && !payment.share_locked && (
                    <div style={{ marginTop: 8, background: '#FEF9E0', borderRadius: 10, padding: '6px 10px', fontSize: 12, color: '#C87D00', textAlign: 'center' }}>
                        يُحجز دعم المجتمع من المحفظة عند إغلاق التسجيل
                    </div>
                )}
            </div>

            {/* A10 — مطالبة الدفع الخاصة بك (H §12.3): مقعدك محجوز طوال النافذة */}
            {myIntent && myIntent.status === 'pending' && myIntent.payment_url && (
                <div className="card" style={{ background: '#FEF9E0', borderColor: 'rgba(200,125,0,.3)66' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#C87D00', marginBottom: 4 }}>
                        حصتك النهائية {Number(myIntent.amount).toLocaleString()} ريال — بانتظار الدفع
                    </div>
                    <div style={{ fontSize: 12, color: '#C87D00', marginBottom: 10 }}>
                        مقعدك محجوز طوال المهلة{myIntent.expires_at ? ` (حتى ${fmtTime(myIntent.expires_at)})` : ''} — إغلاق الصفحة لا يلغي شيئاً وتستأنف من نفس الرابط.
                    </div>
                    <a href={myIntent.payment_url} className="btn btn-primary btn-full" style={{ padding: '12px 20px', textAlign: 'center', display: 'block' }}>
                        ادفع حصتك الآن
                    </a>
                </div>
            )}
            {myIntent && myIntent.status === 'paid' && (
                <div className="card" style={{ background: '#E8F5E9', borderColor: '#0A0A0A44', textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A' }}>دفعت حصتك ({Number(myIntent.amount).toLocaleString()} ريال) — لن يُطلب منك أي مبلغ إضافي</div>
                </div>
            )}

            {/* Action buttons — آلة حالات H §9 + قواعد الانضمام H §10 */}
            {event.status === 'pending_approval' && canApproveProposal && (
                <div className="card" style={{ background: '#F6F8F5', borderColor: 'rgba(10,10,10,.1)' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', textAlign: 'center', marginBottom: 10 }}>
                        اقتراح فعالية بانتظار اعتمادك (خلال 48 ساعة وإلا رُفض تلقائياً)
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={handleApproveProposal} className="btn btn-primary" style={{ flex: 1 }}>اعتماد ونشر</button>
                        <button onClick={handleRejectProposal} className="btn btn-danger" style={{ flex: 1 }}>رفض</button>
                    </div>
                </div>
            )}
            {deadStatuses.includes(event.status) ? (
                <div className="card" style={{ textAlign: 'center', background: '#F6F8F5', borderColor: 'rgba(10,10,10,.1)' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(10,10,10,.5)' }}>
                        <StatusBadge status={event.status} />
                    </div>
                    {isCancelledStatus && event.refund_amount != null && event.refund_amount > 0 && (
                        <div style={{ fontSize: 13, color: '#0A0A0A', marginTop: 6 }}>
                            تم استرداد {Number(event.refund_amount).toLocaleString()} ريال ({event.refund_percentage}%)
                        </div>
                    )}
                    {isCancelledStatus && event.refund_percentage === 0 && (
                        <div style={{ fontSize: 13, color: '#EF4444', marginTop: 6 }}>
                            لم يتم استرداد أي مبلغ
                        </div>
                    )}
                </div>
            ) : isWaitlisted ? (
                <>
                    {seatOfferExpiresAt ? (
                        <div className="card" style={{ background: '#E8F5E9', borderColor: '#0A0A0A66' }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#0A0A0A', textAlign: 'center', marginBottom: 6 }}>
                                شغر مقعد لك — أكّد انضمامك قبل انتهاء المهلة
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(10,10,10,.6)', textAlign: 'center', marginBottom: 10 }}>
                                تنتهي المهلة: {new Date(seatOfferExpiresAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={handleAcceptSeatOffer} className="btn btn-primary" style={{ flex: 1 }}>تأكيد المقعد</button>
                                <button onClick={handleDeclineSeatOffer} className="btn btn-outline" style={{ flex: 1 }}>رفض العرض</button>
                            </div>
                        </div>
                    ) : (
                        <div className="card" style={{ background: '#FEF9E0', borderColor: 'rgba(200,125,0,.3)44', textAlign: 'center' }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: '#C87D00' }}>
                                أنت في قائمة الانتظار (الترتيب: #{waitlistPosition})
                            </div>
                        </div>
                    )}
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
                        {event.free_withdrawal_until && new Date(event.free_withdrawal_until) > new Date() && (
                            <div style={{ fontSize: 12, color: '#C87D00', marginTop: 6 }}>
                                تغيّر موعد الفعالية — لك انسحاب حر حتى {new Date(event.free_withdrawal_until).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </div>
                    {!isCreator && joinableStatuses.includes(event.status) && registrationOpen && (
                        <button
                            onClick={handleLeave}
                            className="btn btn-outline btn-full"
                            style={{ padding: '14px 20px', marginBottom: 12 }}
                        >
                            الانسحاب من الفعالية (حر قبل إغلاق التسجيل)
                        </button>
                    )}
                    {!registrationOpen && !deadStatuses.includes(event.status) && (
                        <div style={{ fontSize: 12, color: 'rgba(10,10,10,.5)', textAlign: 'center', marginBottom: 12 }}>
                            أُغلق التسجيل — لا انسحاب باسترداد بعد الإغلاق
                        </div>
                    )}
                </>
            ) : canJoin ? (
                <button
                    onClick={handleJoin}
                    className="btn btn-primary btn-full"
                    style={{ padding: '14px 20px', marginBottom: 12 }}
                >
                    انضم للفعالية{event.cost_per_person > 0 ? ` — حصتك بحد أقصى ${Number(event.cost_per_person).toLocaleString()} ر.س وتقل كلما انضم زملاؤك` : ''}
                </button>
            ) : canJoinWaitlist ? (
                <button
                    onClick={handleJoinWaitlist}
                    className="btn btn-full"
                    style={{ padding: '14px 20px', background: '#C87D00', color: '#0A0A0A' }}
                >
                    انضم لقائمة الانتظار {waitlistCount > 0 ? `(${waitlistCount} منتظرين)` : ''}
                </button>
            ) : event.status === 'pending_provider' ? (
                <div className="card" style={{ background: '#FEF9E0', borderColor: 'rgba(200,125,0,.3)44', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#C87D00' }}>بلغت الحد الأدنى — بانتظار رد المزوّد</div>
                </div>
            ) : event.status === 'booked' ? (
                <div className="card" style={{ background: '#E8F5E9', borderColor: '#0A0A0A44', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A' }}>قبل المزوّد — الوحدة محجوزة والتسجيل مستمر حتى الإغلاق</div>
                </div>
            ) : event.status === 'awaiting_payment' ? (
                <div className="card" style={{ background: '#FEF9E0', borderColor: 'rgba(200,125,0,.3)44', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#C87D00' }}>أُغلق التسجيل — جارٍ التحصيل</div>
                </div>
            ) : event.status === 'confirmed' || event.status === 'in_progress' ? (
                <div className="card" style={{ background: `${color}08`, borderColor: `${color}44`, textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color }}>{event.status === 'confirmed' ? 'الفعالية مؤكدة' : 'الفعالية جارية الآن'}</div>
                </div>
            ) : event.status === 'provider_alternative' ? (
                <div className="card" style={{ background: '#F6F8F5', borderColor: 'rgba(10,10,10,.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A' }}>بانتظار رد المنشئ على الوقت البديل (خلال 12 ساعة)</div>
                </div>
            ) : event.status === 'pending_approval' ? (
                <div className="card" style={{ background: '#F6F8F5', borderColor: 'rgba(10,10,10,.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A' }}>اقتراح بانتظار اعتماد قائد المجتمع أو المنسّق</div>
                </div>
            ) : (
                <div className="card" style={{ background: '#F6F8F5', borderColor: 'rgba(10,10,10,.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(10,10,10,.5)' }}>أُغلق التسجيل</div>
                </div>
            )}

            {/* A8 — H §24: تمديد التسجيل 24 ساعة مرة واحدة (بديل فتحها على مجتمعات أخرى) */}
            {canExtendRegistration && (
                <div className="card" style={{ background: '#FEF9E0', borderColor: 'rgba(200,125,0,.3)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#C87D00' }}>العدد لم يبلغ الحد الأدنى بعد</div>
                        <div style={{ fontSize: 12, color: '#C87D00', marginTop: 2 }}>
                            تستطيع تمديد التسجيل 24 ساعة — مرة واحدة فقط. إن أُغلق التسجيل دون اكتمال العدد تُعاد الجدولة تلقائياً +7 أيام (مرة واحدة) ثم تُلغى.
                        </div>
                    </div>
                    <button
                        className="btn btn-outline"
                        style={{ borderColor: 'rgba(200,125,0,.3)', color: '#C87D00' }}
                        onClick={() =>
                            setConfirmAction({
                                title: 'تمديد التسجيل 24 ساعة',
                                message: 'يُمدَّد باب التسجيل 24 ساعة إضافية لبلوغ الحد الأدنى، والتمديد متاح مرة واحدة فقط لهذه الفعالية. إن أُغلق التسجيل بعدها دون اكتمال العدد تُعاد الجدولة تلقائياً +7 أيام مرة واحدة ثم تُلغى الفعالية.',
                                confirmLabel: 'تمديد 24 ساعة',
                                run: () =>
                                    router.post(`/employee/detail/${event.id}/extend-registration`, {}, {
                                        onSuccess: () => toastr.success('مُدد التسجيل 24 ساعة'),
                                    }),
                            })
                        }
                    >
                        تمديد التسجيل 24 ساعة
                    </button>
                </div>
            )}

            {/* أزرار سلسلة قديمة مرحّلة (أم لها تكرارات) — القوالب الجديدة تدار من صفحة القوالب */}
            {isCreator && !event.parent_event_id && seriesEvents.length > 0 && !event.template_id && !['cancelled', 'completed'].includes(event.status) && (
                <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                    <button
                        onClick={() =>
                            setConfirmAction({
                                title: 'إلغاء هذه الفعالية',
                                message: `تُلغى هذه الفعالية وحدها وتبقى بقية فعاليات السلسلة كما هي. يُفكّ حجز المزوّد وتُعاد حصص المشاركين وفق سياسة الاسترداد.${refundClause} لا يمكن التراجع عن الإلغاء.`,
                                confirmLabel: 'إلغاء الفعالية',
                                run: () =>
                                    router.delete(`/employee/detail/${event.id}`, {
                                        onSuccess: () => toastr.success('تم إلغاء الفعالية'),
                                    }),
                            })
                        }
                        className="btn btn-outline"
                        style={{ flex: 1 }}
                    >
                        إلغاء هذه الفعالية
                    </button>
                    <button
                        onClick={() =>
                            setConfirmAction({
                                title: 'إلغاء كل السلسلة',
                                message: `تُلغى هذه الفعالية وكل فعاليات السلسلة القادمة دفعة واحدة. يُفكّ حجز المزوّد في كلٍّ منها وتُعاد حصص المشاركين وفق سياسة الاسترداد.${refundClause} الفعاليات المكتملة لا تُمس. لا يمكن التراجع عن الإلغاء.`,
                                confirmLabel: 'إلغاء كل السلسلة',
                                run: () =>
                                    router.delete(`/employee/detail/${event.id}?cancel_series=1`, {
                                        onSuccess: () => toastr.success('تم إلغاء سلسلة الفعاليات'),
                                    }),
                            })
                        }
                        className="btn btn-danger"
                        style={{ flex: 1 }}
                    >
                        إلغاء كل السلسلة
                    </button>
                </div>
            )}

            {/* Cancel event button */}
            {canCancel && !(!event.parent_event_id && seriesEvents.length > 0 && !event.template_id) && (
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
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EF444418', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <span style={{ fontSize: 22 }}>⚠</span>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>إلغاء الفعالية</div>
                        <div style={{ fontSize: 14, color: 'rgba(10,10,10,.55)', marginBottom: 16, lineHeight: 1.7 }}>
                            هل أنت متأكد من إلغاء هذه الفعالية؟ لا يمكن التراجع عن هذا الإجراء.
                        </div>

                        {/* A10 — H §12.4: الإلغاء المشروع = استرداد كامل دائماً */}
                        {refundPreview && (
                            <div style={{ background: '#F6F8F5', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 12, padding: '14px 16px', marginBottom: 16, textAlign: 'right' }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(10,10,10,.55)', marginBottom: 10 }}>سياسة الاسترداد</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, color: 'rgba(10,10,10,.55)' }}>نسبة الاسترداد</span>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A' }}>{refundPreview.percentage}%</span>
                                </div>
                                <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 10, fontSize: 12, textAlign: 'center', background: '#0A0A0A18', color: '#0A0A0A' }}>
                                    {refundPreview.policy_label}
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
                                style={{ flex: 1, background: '#D9381E', color: '#fff', opacity: cancelProcessing ? 0.5 : 1 }}
                            >
                                نعم، إلغاء
                            </button>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="btn"
                                style={{ flex: 1, background: 'transparent', color: 'rgba(10,10,10,.55)', border: '0.5px solid rgba(10,10,10,.15)' }}
                            >
                                تراجع
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* A12 — H §13: الحضور والنتائج (تظهر بعد اكتمال الفعالية) */}
            {attendancePanel && <AttendancePanel eventId={event.id} data={attendancePanel} />}

            {/* Comments — تعليقات الأعضاء تحت الفعالية فقط (H §6) */}
            <div className="card">
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>التعليقات</div>

                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} style={{ borderBottom: '1px solid #F6F8F5', padding: '10px 0' }}>
                            {editingCommentId === comment.id ? (
                                <form onSubmit={(e) => submitEditComment(e, comment.id)} style={{ display: 'flex', gap: 8 }}>
                                    <input
                                        type="text"
                                        value={editCommentBody}
                                        onChange={(e) => setEditCommentBody(e.target.value)}
                                        style={{ flex: 1, fontSize: 13 }}
                                        maxLength={500}
                                    />
                                    <button type="submit" className="btn btn-primary" style={{ fontSize: 12 }}>حفظ</button>
                                    <button type="button" className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => setEditingCommentId(null)}>إلغاء</button>
                                </form>
                            ) : (
                                <>
                                    <div style={{ fontSize: 13, lineHeight: 1.7 }}>{comment.body}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(10,10,10,.5)', marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>
                                            {comment.employee?.name} · {fmtDate(comment.created_at)}
                                            {comment.edited_at && <span> · (مُعدَّل)</span>}
                                        </span>
                                        <span style={{ display: 'flex', gap: 8 }}>
                                            {comment.can_modify && (
                                                <>
                                                    <button
                                                        onClick={() => {
 setEditingCommentId(comment.id); setEditCommentBody(comment.body); 
}}
                                                        className="btn btn-outline"
                                                        style={{ padding: '1px 8px', fontSize: 10 }}
                                                    >
                                                        تعديل
                                                    </button>
                                                    <button onClick={() => deleteComment(comment.id)} className="btn btn-danger" style={{ padding: '1px 8px', fontSize: 10 }}>
                                                        حذف
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => reportComment(comment.id)} className="btn btn-outline" style={{ padding: '1px 8px', fontSize: 10, color: '#EF4444' }}>
                                                تبليغ
                                            </button>
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{ fontSize: 13, color: 'rgba(10,10,10,.5)' }}>لا توجد تعليقات بعد.</div>
                )}

                {canComment && (
                    <form onSubmit={submitComment} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <input
                            type="text"
                            value={commentBody}
                            onChange={(e) => setCommentBody(e.target.value)}
                            placeholder="اكتب تعليقا... (نص فقط)"
                            maxLength={500}
                            style={{ flex: 1, fontSize: 13 }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ fontSize: 13 }} disabled={!commentBody.trim()}>
                            إرسال
                        </button>
                    </form>
                )}
            </div>

            {/* Remove member confirmation */}
            {removeTarget && (
                <div className="modal-overlay" onClick={() => setRemoveTarget(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>إزالة لاعب</div>
                        <div style={{ fontSize: 14, color: 'rgba(10,10,10,.55)', marginBottom: 20, lineHeight: 1.7 }}>
                            هل تريد إزالة <span style={{ color: '#0A0A0A', fontWeight: 600 }}>{removeTarget.name}</span> من الفعالية؟
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={confirmRemove}
                                className="btn"
                                style={{ flex: 1, background: '#D9381E', color: '#fff' }}
                            >
                                إزالة
                            </button>
                            <button
                                onClick={() => setRemoveTarget(null)}
                                className="btn"
                                style={{ flex: 1, background: 'transparent', color: 'rgba(10,10,10,.55)', border: '0.5px solid rgba(10,10,10,.15)' }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={confirmAction !== null}
                title={confirmAction?.title ?? ''}
                message={confirmAction?.message ?? ''}
                confirmLabel={confirmAction?.confirmLabel ?? 'تأكيد'}
                onConfirm={runConfirmAction}
                onCancel={() => setConfirmAction(null)}
            />
            </Screen>
        </EmployeeLayout>
    );
}
