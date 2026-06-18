import CompanyLayout from '@/layouts/company-layout';
import StatusBadge from '@/components/status-badge';
import CategoryIcon from '@/components/category-icon';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event, Employee, Community, Business, Category, EventAlternative } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';

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
    refundPreview: RefundPreview | null;
}

export default function EventShow({ event, communityMembers, joinedIds, refundPreview }: Props) {
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

    const cardStyle: React.CSSProperties = { background: '#fff', border: '1px solid #E4E9F2', borderRadius: 14, padding: '16px 18px', marginBottom: 14 };
    const labelStyle: React.CSSProperties = { fontSize: 11, color: '#7A8BA8' };
    const valueStyle: React.CSSProperties = { fontSize: 14, fontWeight: 700 };

    return (
        <CompanyLayout>
            <Head title={`فعالية #${event.id}`} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13 }}>
                <Link href="/company/events" style={{ color: '#7A8BA8', textDecoration: 'none' }}>الفعاليات</Link>
                <span style={{ color: '#C0C8D8' }}>/</span>
                <span style={{ fontWeight: 700 }}>فعالية #{event.id}</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                        <CategoryIcon icon={event.category?.icon} size={16} /> {event.community?.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#7A8BA8' }}>
                        {event.business?.name} — {fmtDate(event.event_date)} — {fmtTime(event.start_time)}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={event.status} />
                    {canCancel && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={cancelProcessing}
                            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E03050', background: 'none', color: '#E03050', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: cancelProcessing ? 0.5 : 1 }}
                        >
                            إلغاء الفعالية
                        </button>
                    )}
                </div>
            </div>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
                <div style={cardStyle}>
                    <div style={labelStyle}>اللاعبون</div>
                    <div style={{ ...valueStyle, color: fillPercent >= 100 ? '#0CA678' : undefined }}>
                        {event.participants_count}/{event.capacity}
                    </div>
                    <div style={{ height: 4, background: '#E4E9F2', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${fillPercent}%`, background: '#0CA678', borderRadius: 4 }} />
                    </div>
                </div>
                <div style={cardStyle}>
                    <div style={labelStyle}>عدد المرافق</div>
                    <div style={valueStyle}>{event.venues_count}</div>
                </div>
                <div style={cardStyle}>
                    <div style={labelStyle}>إجمالي التكلفة</div>
                    <div style={valueStyle}>{Number(event.total_amount).toLocaleString()} ريال</div>
                </div>
                <div style={cardStyle}>
                    <div style={labelStyle}>حصة كل لاعب</div>
                    <div style={valueStyle}>{Number(event.cost_per_person).toLocaleString()} ريال</div>
                </div>
                {Number(event.community_contribution) > 0 && (
                    <div style={cardStyle}>
                        <div style={labelStyle}>خصم من المحفظة</div>
                        <div style={{ ...valueStyle, color: '#009E82' }}>{Number(event.community_contribution).toLocaleString()} ريال</div>
                    </div>
                )}
            </div>

            {/* Joined participants */}
            <div style={cardStyle}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
                    المنضمون ({joinedParticipants.length}/{event.capacity})
                </div>
                {joinedParticipants.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#7A8BA8', fontSize: 13, padding: '16px 0' }}>
                        لا يوجد منضمون بعد
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {joinedParticipants.map((p) => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8F9FC', borderRadius: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#009E8220', color: '#009E82', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                                        {p.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                                        <div style={{ fontSize: 11, color: '#7A8BA8' }}>{p.email}</div>
                                    </div>
                                </div>
                                {canManageMembers && (
                                    <button
                                        onClick={() => toggleMember(p.id, true)}
                                        disabled={processing === p.id}
                                        style={{ background: 'none', border: '1px solid #E03050', color: '#E03050', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: processing === p.id ? 0.5 : 1 }}
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
                <div style={cardStyle}>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
                        أعضاء المجتمع
                    </div>
                    <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 12 }}>
                        اختر الموظفين لإضافتهم أو إزالتهم من الفعالية
                    </div>
                    {communityMembers.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#7A8BA8', fontSize: 13, padding: '16px 0' }}>
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
                                            background: isJoined ? '#009E8208' : '#fff',
                                            border: `1px solid ${isJoined ? '#009E8244' : '#E4E9F2'}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 14, fontWeight: 700,
                                                background: isJoined ? '#009E8220' : '#E4E9F220',
                                                color: isJoined ? '#009E82' : '#7A8BA8',
                                            }}>
                                                {member.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{member.name}</div>
                                                <div style={{ fontSize: 11, color: '#7A8BA8' }}>{member.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleMember(member.id, isJoined)}
                                            disabled={isProcessing || (!isJoined && isFull)}
                                            style={{
                                                background: isJoined ? 'none' : '#009E82',
                                                border: isJoined ? '1px solid #E03050' : 'none',
                                                color: isJoined ? '#E03050' : '#fff',
                                                borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700,
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
                <div style={cardStyle}>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, color: '#1A5FAB' }}>
                        وقت بديل مقترح من المنشأة
                    </div>
                    {event.alternatives.filter((a) => a.status === 'proposed').map((alt) => (
                        <div key={alt.id} style={{ background: '#1A5FAB08', border: '1px solid #1A5FAB22', borderRadius: 12, padding: 16, marginBottom: 10 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#7A8BA8' }}>التاريخ</div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtDate(alt.proposed_date)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#7A8BA8' }}>من</div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtTime(alt.proposed_start_time)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#7A8BA8' }}>إلى</div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtTime(alt.proposed_end_time)}</div>
                                </div>
                                {alt.proposed_venues_count && (
                                    <div>
                                        <div style={{ fontSize: 11, color: '#7A8BA8' }}>عدد المرافق</div>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{alt.proposed_venues_count}</div>
                                    </div>
                                )}
                                {alt.proposed_amount && (
                                    <div>
                                        <div style={{ fontSize: 11, color: '#7A8BA8' }}>المبلغ</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A5FAB' }}>{Number(alt.proposed_amount).toLocaleString()} ريال</div>
                                    </div>
                                )}
                            </div>
                            {alt.notes && (
                                <div style={{ fontSize: 12, color: '#4A5C78', marginBottom: 12 }}>{alt.notes}</div>
                            )}
                            <div style={{ fontSize: 12, color: '#7A8BA8', textAlign: 'center', padding: '8px 0' }}>
                                بانتظار رد منشئ الفعالية
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Accepted/Rejected alternatives history */}
            {event.alternatives && event.alternatives.filter((a) => a.status !== 'proposed').length > 0 && (
                <div style={cardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#7A8BA8' }}>سجل البدائل</div>
                    {event.alternatives.filter((a) => a.status !== 'proposed').map((alt) => (
                        <div key={alt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E4E9F2' }}>
                            <div style={{ fontSize: 12 }}>
                                {fmtDate(alt.proposed_date)} — {fmtTime(alt.proposed_start_time)} إلى {fmtTime(alt.proposed_end_time)}
                                {alt.proposed_amount ? ` — ${Number(alt.proposed_amount).toLocaleString()} ريال` : ''}
                            </div>
                            <span style={{
                                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                                background: alt.status === 'accepted' ? '#0CA67818' : '#E0305018',
                                color: alt.status === 'accepted' ? '#0CA678' : '#E03050',
                            }}>
                                {alt.status === 'accepted' ? 'مقبول' : 'مرفوض'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Notes */}
            {event.notes && (
                <div style={cardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>ملاحظات</div>
                    <div style={{ fontSize: 13, color: '#4A5C78' }}>{event.notes}</div>
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
                        <div style={{ fontSize: 13, color: '#7A8BA8', marginBottom: 16 }}>
                            هل أنت متأكد من إلغاء هذه الفعالية؟ لا يمكن التراجع عن هذا الإجراء.
                        </div>

                        {/* Refund policy info */}
                        {refundPreview && refundPreview.original_contribution > 0 && (
                            <div style={{ background: '#F8F9FC', border: '1px solid #E4E9F2', borderRadius: 12, padding: '14px 16px', marginBottom: 16, textAlign: 'right' }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#7A8BA8', marginBottom: 10 }}>سياسة الاسترداد</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: '#7A8BA8' }}>المبلغ المدفوع من المحفظة</span>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>{refundPreview.original_contribution.toLocaleString()} ريال</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: '#7A8BA8' }}>نسبة الاسترداد</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: refundPreview.percentage > 0 ? '#0CA678' : '#E03050' }}>{refundPreview.percentage}%</span>
                                </div>
                                <div style={{ height: 1, background: '#E4E9F2', margin: '8px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>مبلغ الاسترداد</span>
                                    <span style={{ fontSize: 18, fontWeight: 900, color: refundPreview.refund_amount > 0 ? '#0CA678' : '#E03050' }}>
                                        {refundPreview.refund_amount.toLocaleString()} ريال
                                    </span>
                                </div>
                                <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 8, fontSize: 11, textAlign: 'center', background: refundPreview.percentage === 100 ? '#0CA67818' : refundPreview.percentage > 0 ? '#F59E0B18' : '#E0305018', color: refundPreview.percentage === 100 ? '#0CA678' : refundPreview.percentage > 0 ? '#F59E0B' : '#E03050' }}>
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
                                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #E4E9F2', background: '#fff', color: '#4A5C78', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
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
