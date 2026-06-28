import CompanyLayout from '@/layouts/company-layout';
import StatusBadge from '@/components/status-badge';
import CategoryIcon from '@/components/category-icon';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event, Employee, Community, Business, Category, EventAlternative } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';

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
        category: Category;
        creator: Employee;
        participants: (Employee & { pivot?: { status: string; joined_at: string } })[];
        alternatives?: EventAlternative[];
    };
    communityMembers: Employee[];
    joinedIds: number[];
    seriesEvents: SeriesEvent[];
    refundPreview: RefundPreview | null;
}

export default function EventShow({ event, communityMembers, joinedIds, seriesEvents, refundPreview }: Props) {
    const [processing, setProcessing] = useState<number | null>(null);
    const [cancelProcessing, setCancelProcessing] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const canCancel = ['open', 'waiting_business', 'alternative_proposed', 'confirmed'].includes(event.status);
    const canManageMembers = ['open', 'waiting_business', 'alternative_proposed'].includes(event.status);

    const joinedParticipants = event.participants?.filter(
        (p) => p.pivot?.status === 'joined',
    ) ?? [];

    const fillPercent = event.capacity > 0
        ? Math.round((event.participants_count / event.capacity) * 100)
        : 0;

    const isFull = event.participants_count >= event.capacity;

    function toggleMember(employeeId: number, isJoined: boolean) {
        setProcessing(employeeId);
        const url = isJoined
            ? `/company/events/${event.id}/remove-member`
            : `/company/events/${event.id}/add-member`;

        router.post(url, { employee_id: employeeId }, {
            preserveScroll: true,
            onSuccess: () => {
                toastr.success(isJoined ? 'تمت إزالة العضو بنجاح' : 'تمت إضافة العضو بنجاح');
            },
            onFinish: () => setProcessing(null),
        });
    }

    return (
        <CompanyLayout>
            <Head title={`فعالية #${event.id}`} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13 }}>
                <Link href="/company/events" style={{ color: '#999', textDecoration: 'none' }}>الفعاليات</Link>
                <span style={{ color: '#EBEBEB' }}>/</span>
                <span style={{ fontWeight: 700 }}>فعالية #{event.id}</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                        <CategoryIcon icon={event.category?.icon} size={16} /> {event.community?.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#999' }}>
                        {event.business?.name} — {fmtDate(event.event_date)} — {fmtTime(event.start_time)}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={event.status} />
                    {canCancel && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={cancelProcessing}
                            style={{ padding: '6px 14px', borderRadius: 10, border: '1px solid #E03050', background: 'none', color: '#E03050', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: cancelProcessing ? 0.5 : 1 }}
                        >
                            إلغاء الفعالية
                        </button>
                    )}
                </div>
            </div>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
                <div className="card">
                    <div style={{ fontSize: 11, color: '#999' }}>اللاعبون</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: fillPercent >= 100 ? '#18A86B' : undefined }}>
                        {event.participants_count}/{event.capacity}
                    </div>
                    <div className="bar-w" style={{ marginTop: 8 }}>
                        <div className="bar-f" style={{ width: `${fillPercent}%`, background: '#18A86B' }} />
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 11, color: '#999' }}>عدد المرافق</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{event.venues_count}</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 11, color: '#999' }}>إجمالي التكلفة</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{Number(event.total_amount).toLocaleString()} ريال</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 11, color: '#999' }}>حصة كل لاعب</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{Number(event.cost_per_person).toLocaleString()} ريال</div>
                </div>
                {Number(event.community_contribution) > 0 && (
                    <div className="card">
                        <div style={{ fontSize: 11, color: '#999' }}>خصم من المحفظة</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#18A86B' }}>{Number(event.community_contribution).toLocaleString()} ريال</div>
                        {!event.budget_deducted_at && (
                            <div style={{ fontSize: 10, color: '#B8860A', marginTop: 4 }}>بانتظار موافقة المنشأة</div>
                        )}
                    </div>
                )}
            </div>

            {/* Recurrence info */}
            {event.recurrence_type && event.recurrence_type !== 'none' && (
                <div className="card" style={{ background: '#18A86B08', borderColor: '#18A86B33', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#18A86B' }}>
                        فعالية متكررة — {event.recurrence_type === 'daily' ? 'يومي' : event.recurrence_type === 'weekly' ? 'أسبوعي' : 'شهري'}
                    </span>
                    {event.recurrence_end_date && (
                        <span style={{ fontSize: 11, color: '#999', marginRight: 'auto' }}>حتى {fmtDate(event.recurrence_end_date)}</span>
                    )}
                </div>
            )}
            {event.parent_event_id && (
                <div className="card" style={{ background: '#18A86B08', borderColor: '#18A86B33', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#18A86B' }}>جزء من سلسلة فعاليات متكررة</span>
                    <Link
                        href={`/company/events/${event.parent_event_id}`}
                        style={{ fontSize: 11, color: '#18A86B', marginRight: 'auto', textDecoration: 'underline' }}
                    >
                        عرض السلسلة
                    </Link>
                </div>
            )}

            {/* Series timeline */}
            {seriesEvents && seriesEvents.length > 0 && (
                <div className="card">
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
                        سلسلة الفعاليات ({seriesEvents.length + 1} فعاليات)
                    </div>
                    <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {seriesEvents.map((se) => {
                            const isCurrent = se.id === event.id;
                            const statusColor = se.status === 'cancelled' ? '#E03050' : se.status === 'completed' ? '#999' : '#18A86B';
                            const statusLbl = se.status === 'cancelled' ? 'ملغية' : se.status === 'completed' ? 'منتهية' : `${se.participants_count}/${se.capacity}`;
                            return (
                                <Link
                                    key={se.id}
                                    href={`/company/events/${se.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 12px',
                                        borderRadius: 10,
                                        textDecoration: 'none',
                                        background: isCurrent ? '#18A86B10' : '#fff',
                                        border: isCurrent ? '1px solid #18A86B33' : '1px solid #EBEBEB',
                                        color: 'inherit',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? '#18A86B' : '#666' }}>
                                            {fmtDate(se.event_date)}
                                        </span>
                                        <span style={{ fontSize: 11, color: '#999' }}>
                                            {fmtTime(se.start_time)}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: statusColor }}>
                                        {statusLbl}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Payment deadline notice */}
            {event.status === 'confirmed' && event.payment_deadline && (
                <div style={{ background: '#FFF3E0', border: '1px solid #FFB74D44', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#E65100' }}>مهلة الدفع</div>
                        <div style={{ fontSize: 11, color: '#BF360C' }}>يجب إتمام الدفع خلال 30 دقيقة من الموافقة</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#E65100' }}>
                        {new Date(event.payment_deadline).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            )}

            {/* Joined participants */}
            <div className="card">
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
                    المنضمون ({joinedParticipants.length}/{event.capacity})
                </div>
                {joinedParticipants.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', fontSize: 13, padding: '16px 0' }}>
                        لا يوجد منضمون بعد
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {joinedParticipants.map((p) => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#FAFAFA', borderRadius: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#18A86B20', color: '#18A86B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                                        {p.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                                        <div style={{ fontSize: 11, color: '#999' }}>{p.email}</div>
                                    </div>
                                </div>
                                {canManageMembers && (
                                    <button
                                        onClick={() => toggleMember(p.id, true)}
                                        disabled={processing === p.id}
                                        style={{ background: 'none', border: '1px solid #E03050', color: '#E03050', borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: processing === p.id ? 0.5 : 1 }}
                                    >
                                        إزالة
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add members from community */}
            {canManageMembers && (
                <div className="card">
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
                        أعضاء المجتمع
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
                        اختر الموظفين لإضافتهم أو إزالتهم من الفعالية
                    </div>
                    {communityMembers.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#999', fontSize: 13, padding: '16px 0' }}>
                            لا يوجد أعضاء في المجتمع
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {communityMembers.map((member) => {
                                const isJoined = joinedIds.includes(member.id);
                                const isProcessing = processing === member.id;

                                return (
                                    <div
                                        key={member.id}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '10px 12px', borderRadius: 10,
                                            background: isJoined ? '#18A86B08' : '#fff',
                                            border: `1px solid ${isJoined ? '#18A86B44' : '#EBEBEB'}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 14, fontWeight: 700,
                                                background: isJoined ? '#18A86B20' : '#EBEBEB20',
                                                color: isJoined ? '#18A86B' : '#999',
                                            }}>
                                                {member.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{member.name}</div>
                                                <div style={{ fontSize: 11, color: '#999' }}>{member.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleMember(member.id, isJoined)}
                                            disabled={isProcessing || (!isJoined && isFull)}
                                            style={{
                                                background: isJoined ? 'none' : '#18A86B',
                                                border: isJoined ? '1px solid #E03050' : 'none',
                                                color: isJoined ? '#E03050' : '#fff',
                                                borderRadius: 10, padding: '6px 14px', fontSize: 11, fontWeight: 700,
                                                cursor: isProcessing || (!isJoined && isFull) ? 'not-allowed' : 'pointer',
                                                fontFamily: 'inherit',
                                                opacity: isProcessing || (!isJoined && isFull) ? 0.5 : 1,
                                            }}
                                        >
                                            {isJoined ? 'إزالة' : 'إضافة'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {isFull && (
                        <div style={{ marginTop: 10, background: '#FFF3E0', border: '1px solid #FFB74D44', borderRadius: 10, padding: '8px 12px', fontSize: 11, color: '#E65100', textAlign: 'center' }}>
                            الفعالية مكتملة العدد — أزل موظف لإضافة آخر
                        </div>
                    )}
                </div>
            )}

            {/* Proposed Alternatives */}
            {event.status === 'alternative_proposed' && event.alternatives && event.alternatives.filter((a) => a.status === 'proposed').length > 0 && (
                <div className="card">
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, color: '#18A86B' }}>
                        وقت بديل مقترح من المنشأة
                    </div>
                    {event.alternatives.filter((a) => a.status === 'proposed').map((alt) => (
                        <div key={alt.id} style={{ background: '#18A86B08', border: '1px solid #18A86B22', borderRadius: 12, padding: 16, marginBottom: 10 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#999' }}>التاريخ</div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtDate(alt.proposed_date)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#999' }}>من</div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtTime(alt.proposed_start_time)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#999' }}>إلى</div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtTime(alt.proposed_end_time)}</div>
                                </div>
                                {alt.proposed_venues_count && (
                                    <div>
                                        <div style={{ fontSize: 11, color: '#999' }}>عدد المرافق</div>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{alt.proposed_venues_count}</div>
                                    </div>
                                )}
                                {alt.proposed_amount && (
                                    <div>
                                        <div style={{ fontSize: 11, color: '#999' }}>المبلغ</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#18A86B' }}>{Number(alt.proposed_amount).toLocaleString()} ريال</div>
                                    </div>
                                )}
                            </div>
                            {alt.notes && (
                                <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>{alt.notes}</div>
                            )}
                            <div style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '8px 0' }}>
                                بانتظار رد منشئ الفعالية
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Accepted/Rejected alternatives history */}
            {event.alternatives && event.alternatives.filter((a) => a.status !== 'proposed').length > 0 && (
                <div className="card">
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#999' }}>سجل البدائل</div>
                    {event.alternatives.filter((a) => a.status !== 'proposed').map((alt) => (
                        <div key={alt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #EBEBEB' }}>
                            <div style={{ fontSize: 12 }}>
                                {fmtDate(alt.proposed_date)} — {fmtTime(alt.proposed_start_time)} إلى {fmtTime(alt.proposed_end_time)}
                                {alt.proposed_amount ? ` — ${Number(alt.proposed_amount).toLocaleString()} ريال` : ''}
                            </div>
                            <span className={`badge ${alt.status === 'accepted' ? 'b-confirmed' : 'b-rejected'}`}>
                                {alt.status === 'accepted' ? 'مقبول' : 'مرفوض'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Notes */}
            {event.notes && (
                <div className="card">
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>ملاحظات</div>
                    <div style={{ fontSize: 13, color: '#666' }}>{event.notes}</div>
                </div>
            )}

            {/* Cancel confirmation modal with refund info */}
            {showCancelModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={() => setShowCancelModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
                    <div style={{ position: 'relative', background: '#fff', borderRadius: 16, padding: '28px 24px', width: '90%', maxWidth: 380, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E0305014', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <span style={{ fontSize: 22 }}>⚠</span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>إلغاء الفعالية</div>
                        <div style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>
                            هل أنت متأكد من إلغاء هذه الفعالية؟ لا يمكن التراجع عن هذا الإجراء.
                        </div>

                        {/* Refund policy info */}
                        {refundPreview && refundPreview.original_contribution > 0 && (
                            <div style={{ background: '#FAFAFA', border: '1px solid #EBEBEB', borderRadius: 12, padding: '14px 16px', marginBottom: 16, textAlign: 'right' }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#999', marginBottom: 10 }}>سياسة الاسترداد</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: '#999' }}>المبلغ المدفوع من المحفظة</span>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>{refundPreview.original_contribution.toLocaleString()} ريال</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: '#999' }}>نسبة الاسترداد</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: refundPreview.percentage > 0 ? '#18A86B' : '#E03050' }}>{refundPreview.percentage}%</span>
                                </div>
                                <div style={{ height: 1, background: '#EBEBEB', margin: '8px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>مبلغ الاسترداد</span>
                                    <span style={{ fontSize: 18, fontWeight: 900, color: refundPreview.refund_amount > 0 ? '#18A86B' : '#E03050' }}>
                                        {refundPreview.refund_amount.toLocaleString()} ريال
                                    </span>
                                </div>
                                <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 8, fontSize: 11, textAlign: 'center', background: refundPreview.percentage === 100 ? '#18A86B18' : refundPreview.percentage > 0 ? '#F59E0B18' : '#E0305018', color: refundPreview.percentage === 100 ? '#18A86B' : refundPreview.percentage > 0 ? '#F59E0B' : '#E03050' }}>
                                    {refundPreview.policy_label}
                                    {refundPreview.percentage === 100 && ' — الإلغاء قبل 24 ساعة أو أكثر'}
                                    {refundPreview.percentage === 50 && ' — الإلغاء قبل 4 إلى 24 ساعة'}
                                    {refundPreview.percentage === 0 && ' — الإلغاء قبل أقل من 4 ساعات'}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="ac-btn secondary"
                                style={{ flex: 1, padding: '10px 0' }}
                            >
                                تراجع
                            </button>
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelProcessing(true);
                                    router.post(`/company/events/${event.id}/cancel`, {}, {
                                        preserveScroll: true,
                                        onSuccess: () => toastr.success('تم إلغاء الفعالية بنجاح'),
                                        onFinish: () => setCancelProcessing(false),
                                    });
                                }}
                                disabled={cancelProcessing}
                                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: '#E03050', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: cancelProcessing ? 0.5 : 1 }}
                            >
                                نعم، إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CompanyLayout>
    );
}
