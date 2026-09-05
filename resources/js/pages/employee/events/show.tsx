import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    CircleCheckBig,
    Clock,
    MapPin,
    MessageSquare,
    Pencil,
    Timer,
    TriangleAlert,
    Users,
    Trash2,
    Flag,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { BackLink, ListState } from '@/components/list-states';
import { Badge, Button, INPUT } from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';
import { eventStatus } from '@/lib/status';

/**
 * H §12.2 — the share is a *binding ceiling*, not a price.
 *
 * Before registration closes the employee is shown «حصتك بحد أقصى … وتقل كلما
 * انضم زملاؤك»: the number can only fall as more people join, never rise. Once
 * the roll closes, the share locks and becomes a claim with a deadline. Those
 * are two different promises and this screen must not blur them.
 */
type PaymentBreakdown = {
    total_amount: string;
    vat_amount: string;
    community_balance: string;
    subsidy: string;
    remaining: string;
    max_share: string;
    share_locked: boolean;
    final_share: string | null;
    collection_deadline_at: string | null;
    participants_count: number;
    min_participants: number;
    capacity: number | null;
};

type EventModel = {
    id: number;
    title: string;
    description: string | null;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    status: string;
    capacity: number | null;
    participants_count: number | null;
    min_participants: number | null;
    community?: { id: number; name: string } | null;
    partner?: { id: number; name: string } | null;
    category?: { id: number; name: string } | null;
    alternatives?: Alternative[];
    participants?: { id: number; name: string }[];
    created_by?: number | null;
};

type Intent = {
    id: number;
    amount: string;
    status: string;
    expires_at: string | null;
};

type RosterRow = {
    employee_id: number;
    name: string | null;
    attendance_status: string | null;
    attendance_reason: string | null;
};

type SeriesOccurrence = {
    id: number;
    event_date: string;
    start_time: string | null;
    status: string;
    participants_count: number | null;
    capacity: number | null;
};

type Alternative = {
    id: number;
    proposed_date: string;
    proposed_start_time: string;
    proposed_end_time: string | null;
    proposed_venues_count: number | null;
    proposed_amount: string | number | null;
    notes: string | null;
    status: string;
};

type AttendancePanel = {
    roster: RosterRow[];
    window_closes_at: string | null;
    window_open: boolean;
    locked_at: string | null;
    can_edit: boolean;
    edit_mode: string | null;
    reason_required: boolean;
    notice: string | null;
    results: ResultRow[];
    units: { key: string; label: string; kind: string; direction: string; precision: number }[];
    can_enter_results: boolean;
    can_correct_results: boolean;
};

type ResultRow = {
    id: number;
    employee_id: number;
    employee_name: string | null;
    unit: string;
    unit_label: string;
    value: number;
    value_formatted: string;
    corrections_count: number;
};

type Comment = {
    id: number;
    body: string;
    created_at: string;
    employee?: { id: number; name: string } | null;
    can_edit?: boolean;
};

export default function EventShow({
    event,
    payment,
    myIntent,
    isJoined,
    isWaitlisted,
    waitlistPosition,
    waitlistCount,
    seatOfferExpiresAt,
    canCancel,
    canManageAlternatives,
    canApproveProposal,
    canExtendRegistration,
    isCreator,
    refundPreview,
    registrationOpen,
    attendancePanel,
    comments,
    canComment,
    seriesEvents,
}: {
    event: EventModel;
    payment: PaymentBreakdown;
    myIntent: Intent | null;
    isJoined: boolean;
    isWaitlisted: boolean;
    waitlistPosition: number | null;
    waitlistCount: number;
    seatOfferExpiresAt: string | null;
    canManageAlternatives: boolean;
    isCreator: boolean;
    canCancel: boolean;
    canApproveProposal: boolean;
    canExtendRegistration: boolean;
    registrationOpen: boolean;
    seriesEvents: SeriesOccurrence[];
    refundPreview: { percentage: number; policy_label: string } | null;
    attendancePanel: AttendancePanel | null;
    comments: Comment[];
    canComment: boolean;
}) {
    const [leaving, setLeaving] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [extending, setExtending] = useState(false);
    const [rejectingProposal, setRejectingProposal] = useState(false);
    const [removing, setRemoving] = useState<{ id: number; name: string } | null>(null);
    const proposalForm = useForm({ reason: '' });
    const commentForm = useForm({ body: '' });
    const status = eventStatus(event.status);

    return (
        <EmployeeLayout>
            <Head title={event.title} />

            <BackLink href="/employee/home" label="العودة إلى الرئيسية" />

            {/* ── الترويسة ── */}
            <div className="space-y-3 rounded-2xl border-[0.5px] border-ink/15 bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="mb-0.5 truncate text-[11px] text-ink/60">
                            {event.community?.name ?? '—'}
                        </div>
                        <h1 className="text-base leading-snug font-black text-ink">
                            {event.title}
                        </h1>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                </div>

                {event.description && (
                    <p className="text-xs leading-relaxed text-ink/70">
                        {event.description}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-2 border-t-[0.5px] border-ink/10 pt-2 text-xs text-ink/70">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span className="font-mono text-[11px]">
                            {event.event_date ?? '—'}
                        </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span className="font-mono text-[11px]">
                            {event.start_time ?? '—'}
                            {event.end_time ? ` - ${event.end_time}` : ''}
                        </span>
                    </span>
                    <span className="col-span-2 flex min-w-0 items-center gap-1.5">
                        <MapPin
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span className="truncate">
                            {event.partner?.name ?? 'لم يُحدَّد المرفق بعد'}
                        </span>
                    </span>
                </div>

                <div className="flex items-center justify-between border-t-[0.5px] border-ink/10 pt-2 text-[11px]">
                    <span className="flex items-center gap-1.5 text-ink/70">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="font-mono">
                            {payment.participants_count} /{' '}
                            {payment.capacity ?? '—'} مقعد
                        </span>
                    </span>
                    <span className="text-ink/50">
                        النصاب {payment.min_participants}
                    </span>
                </div>
            </div>

            {/* ── الحصة: سقف ملزم قبل الإغلاق، مبلغ مقفل بعده ── */}
            <div className="space-y-3 rounded-2xl bg-ink p-4 text-white">
                {payment.share_locked ? (
                    <>
                        <div className="text-center">
                            <div className="text-xs text-white/60">
                                حصتك النهائية
                            </div>
                            <div className="font-mono text-[28px] leading-tight font-black text-lime">
                                {payment.final_share}{' '}
                                <span className="text-sm font-normal text-white/80">
                                    ر.س
                                </span>
                            </div>
                            <div className="text-[11px] text-white/50">
                                أُقفلت الحصة عند إغلاق التسجيل ولن تتغيّر
                            </div>
                        </div>

                        {myIntent && myIntent.status === 'pending' && (
                            <Link
                                href={`/employee/payments/${myIntent.id}`}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-black text-ink transition-colors hover:bg-lime-hover"
                            >
                                <Timer className="h-4 w-4" aria-hidden="true" />
                                <span>أكمل السداد ({myIntent.amount} ر.س)</span>
                            </Link>
                        )}

                        {myIntent && myIntent.status === 'paid' && (
                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-success">
                                <CircleCheckBig
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                <span>سُدِّدت حصتك</span>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="text-center">
                            <div className="text-xs text-white/60">
                                حصتك بحد أقصى
                            </div>
                            <div className="font-mono text-[28px] leading-tight font-black text-lime">
                                {payment.max_share}{' '}
                                <span className="text-sm font-normal text-white/80">
                                    ر.س
                                </span>
                            </div>
                            <div className="text-[11px] text-white/50">
                                وتقل كلما انضم زملاؤك — لن ترتفع أبداً
                            </div>
                        </div>

                        <div className="space-y-1.5 border-t-[0.5px] border-white/15 pt-3 text-xs">
                            <Row
                                label="التكلفة الإجمالية للفعالية"
                                value={`${payment.total_amount} ر.س`}
                            />
                            <Row
                                label="دعم محفظة المجتمع"
                                value={`${payment.subsidy} ر.س`}
                            />
                            <Row
                                label="المتبقي على المشاركين"
                                value={`${payment.remaining} ر.س`}
                                strong
                            />
                        </div>
                    </>
                )}

                {payment.collection_deadline_at && (
                    <div className="pt-1 text-center font-mono text-[11px] text-white/50">
                        مهلة السداد حتى{' '}
                        {new Date(
                            payment.collection_deadline_at,
                        ).toLocaleString('ar-SA')}
                    </div>
                )}
            </div>

            {/* ── عرض مقعد لقائمة الانتظار ── */}
            {seatOfferExpiresAt && (
                <div className="space-y-2.5 rounded-2xl border-[0.5px] border-warning/30 bg-warning-tint p-4">
                    <div className="flex items-center gap-1.5 text-xs font-black text-warning">
                        <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                        <span>عُرض عليك مقعد شاغر</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-ink/70">
                        الأسبق يفوز — يسقط العرض تلقائياً عند انتهاء المهلة
                        ويُعرض على التالي في القائمة.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                router.post(
                                    `/employee/detail/${event.id}/waitlist-offer/accept`,
                                )
                            }
                            className="cursor-pointer rounded-xl bg-ink py-2.5 text-xs font-bold text-white"
                        >
                            قبول المقعد
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                router.post(
                                    `/employee/detail/${event.id}/waitlist-offer/decline`,
                                )
                            }
                            className="cursor-pointer rounded-xl border-[0.5px] border-ink/15 bg-surface py-2.5 text-xs font-bold text-ink"
                        >
                            اعتذار
                        </button>
                    </div>
                </div>
            )}

            {/* ── مشاركتي ── */}
            <div className="space-y-2.5">
                {!isJoined && !isWaitlisted && registrationOpen && (
                    <button
                        type="button"
                        onClick={() =>
                            router.post(`/employee/detail/${event.id}/join`)
                        }
                        className="w-full cursor-pointer rounded-full border-[0.5px] border-lime bg-lime px-5 py-3.5 text-sm font-black text-ink transition-colors hover:bg-lime-hover"
                    >
                        {(payment.capacity ?? 0) - payment.participants_count >
                        0
                            ? 'أكّد حضورك'
                            : 'انضم لقائمة الانتظار'}
                    </button>
                )}

                {isJoined && (
                    <div className="flex items-center justify-between gap-2 rounded-2xl border-[0.5px] border-ink/15 bg-surface p-3.5">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-success">
                            <CircleCheckBig
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                            مقعدك محجوز
                        </span>
                        {registrationOpen && (
                            <button
                                type="button"
                                onClick={() => setLeaving(true)}
                                className="cursor-pointer text-[11px] font-bold text-danger hover:underline"
                            >
                                إلغاء مشاركتي
                            </button>
                        )}
                    </div>
                )}

                {isWaitlisted && (
                    <div className="flex items-center justify-between gap-2 rounded-2xl border-[0.5px] border-ink/15 bg-surface p-3.5">
                        <span className="text-xs font-bold text-ink">
                            أنت في قائمة الانتظار — الترتيب{' '}
                            {waitlistPosition ?? '—'} من {waitlistCount}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                router.post(
                                    `/employee/detail/${event.id}/leave-waitlist`,
                                )
                            }
                            className="cursor-pointer text-[11px] font-bold text-danger hover:underline"
                        >
                            مغادرة القائمة
                        </button>
                    </div>
                )}
            </div>

            {/* ── الحضور بعد الاكتمال ── */}
            {attendancePanel && (
                <section className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-black text-ink">
                            سجل الحضور
                        </h2>
                        {attendancePanel.window_open ? (
                            <Badge tone="warning">نافذة التعديل مفتوحة</Badge>
                        ) : (
                            <Badge tone="neutral">أُقفل السجل</Badge>
                        )}
                    </div>

                    {attendancePanel.notice && (
                        <p className="px-1 text-[11px] leading-relaxed text-ink/60">
                            {attendancePanel.notice}
                        </p>
                    )}

                    <div className="divide-y-[0.5px] divide-ink/10 rounded-2xl border-[0.5px] border-ink/15 bg-surface">
                        {attendancePanel.roster.map((row) => (
                            <RosterEntry
                                key={row.employee_id}
                                row={row}
                                eventId={event.id}
                                panel={attendancePanel}
                                result={attendancePanel.results.find(
                                    (r) => r.employee_id === row.employee_id,
                                )}
                            />
                        ))}
                        {attendancePanel.roster.length === 0 && (
                            <ListState
                                tone="empty"
                                title="لا مشاركين مسجّلين."
                            />
                        )}
                    </div>

                    {attendancePanel.can_edit && attendancePanel.reason_required && (
                        <p className="px-1 text-[10px] leading-relaxed text-warning">
                            نافذة الـ24 ساعة أُقفلت — أي تعديل الآن يتطلب سبباً موثَّقاً ويظهر في مراقبة الفعاليات الشبح.
                        </p>
                    )}
                </section>
            )}

            {/* ── التعليقات ── */}
            <section className="space-y-2.5">
                <div className="flex items-center gap-1.5 px-1">
                    <MessageSquare
                        className="h-3.5 w-3.5 text-ink"
                        aria-hidden="true"
                    />
                    <h2 className="text-xs font-black text-ink">
                        نقاش الفعالية
                    </h2>
                </div>

                {canComment && (
                    <form
                        onSubmit={(submitEvent) => {
                            submitEvent.preventDefault();
                            commentForm.post(
                                `/employee/detail/${event.id}/comments`,
                                {
                                    preserveScroll: true,
                                    onSuccess: () => commentForm.reset(),
                                },
                            );
                        }}
                        className="flex items-end gap-2"
                    >
                        <textarea
                            rows={2}
                            value={commentForm.data.body}
                            onChange={(changeEvent) =>
                                commentForm.setData(
                                    'body',
                                    changeEvent.target.value,
                                )
                            }
                            placeholder="اكتب تعليقاً لزملائك…"
                            aria-label="تعليق جديد"
                            className="flex-1 resize-none rounded-xl border-[0.5px] border-ink/20 bg-surface px-3 py-2 text-xs focus:border-ink focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={
                                commentForm.processing ||
                                commentForm.data.body.trim() === ''
                            }
                            className="shrink-0 cursor-pointer rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            نشر
                        </button>
                    </form>
                )}

                <div className="divide-y-[0.5px] divide-ink/10 rounded-2xl border-[0.5px] border-ink/15 bg-surface">
                    {comments.map((comment) => (
                        <CommentRow key={comment.id} comment={comment} />
                    ))}
                    {comments.length === 0 && (
                        <ListState tone="empty" title="لا تعليقات بعد." />
                    )}
                </div>
            </section>

            {/* ── بقية السلسلة ── */}
            {seriesEvents.length > 1 && (
                <section className="space-y-2">
                    <h2 className="px-1 text-xs font-black text-ink">هذه الفعالية من سلسلة متكررة</h2>
                    <p className="px-1 text-[11px] leading-relaxed text-ink/60">
                        القالب يولّد كل موعد قبله بأسبوعين. تسجيلك هنا يخصّ هذا الموعد وحده — لكل موعد تسجيله.
                    </p>

                    <div className="divide-y-[0.5px] divide-ink/10 rounded-2xl border-[0.5px] border-ink/15 bg-surface">
                        {seriesEvents.map((occurrence) => {
                            const current = occurrence.id === event.id;

                            return (
                                <Link
                                    key={occurrence.id}
                                    href={`/employee/detail/${occurrence.id}`}
                                    className={`flex items-center justify-between gap-2 p-2.5 ${current ? 'bg-lime/12' : ''}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] font-bold text-ink" dir="ltr">
                                            {occurrence.event_date}
                                            {occurrence.start_time ? ` · ${occurrence.start_time.slice(0, 5)}` : ''}
                                        </span>
                                        {current && <Badge tone="lime">هذه</Badge>}
                                    </span>

                                    <span className="flex shrink-0 items-center gap-2">
                                        <span className="font-mono text-[10px] text-ink/50">
                                            {occurrence.participants_count ?? 0}/{occurrence.capacity ?? '—'}
                                        </span>
                                        <Badge tone={eventStatus(occurrence.status).tone}>
                                            {eventStatus(occurrence.status).label}
                                        </Badge>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── المشاركون (لمنشئ الفعالية) ── */}
            {isCreator &&
                ['open', 'pending_provider', 'provider_alternative', 'booked'].includes(event.status) && (
                    <section className="space-y-2.5">
                        <h2 className="px-1 text-xs font-black text-ink">
                            المشاركون ({(event.participants ?? []).length})
                        </h2>

                        <div className="divide-y-[0.5px] divide-ink/10 rounded-2xl border-[0.5px] border-ink/15 bg-surface">
                            {(event.participants ?? []).map((participant) => (
                                <div
                                    key={participant.id}
                                    className="flex items-center justify-between gap-2 p-3"
                                >
                                    <span className="truncate text-xs font-bold text-ink">
                                        {participant.name}
                                    </span>
                                    {participant.id !== event.created_by ? (
                                        <button
                                            type="button"
                                            onClick={() => setRemoving(participant)}
                                            aria-label="إزالة المشارك"
                                            className="rounded-lg bg-danger/8 p-1.5 text-danger transition-colors hover:bg-danger/15"
                                        >
                                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                                        </button>
                                    ) : (
                                        <Badge tone="neutral">أنت المنشئ</Badge>
                                    )}
                                </div>
                            ))}
                            {(event.participants ?? []).length === 0 && (
                                <ListState tone="empty" title="لا مشاركين بعد." />
                            )}
                        </div>
                    </section>
                )}

            {/* ── وقت بديل اقترحه المزوّد ── */}
            {canManageAlternatives &&
                (event.alternatives ?? []).filter((alt) => alt.status === 'proposed').length > 0 && (
                    <section className="space-y-2.5">
                        <h2 className="px-1 text-xs font-black text-ink">وقت بديل اقترحه المزوّد</h2>

                        <p className="px-1 text-[11px] leading-relaxed text-ink/60">
                            المرفق لم يرفض ولم يقبل — اقترح موعداً آخر. قبولك ينقل الفعالية إلى الموعد الجديد ويُعلم المشاركين؛
                            رفضك يعيد البحث عن مرفق آخر.
                        </p>

                        {(event.alternatives ?? [])
                            .filter((alt) => alt.status === 'proposed')
                            .map((alt) => (
                                <div
                                    key={alt.id}
                                    className="space-y-2 rounded-2xl border-[0.5px] border-warning/30 bg-warning-tint p-3"
                                >
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="font-mono text-xs font-black text-ink" dir="ltr">
                                            {alt.proposed_date} · {alt.proposed_start_time?.slice(0, 5)}
                                            {alt.proposed_end_time ? `–${alt.proposed_end_time.slice(0, 5)}` : ''}
                                        </span>
                                        {alt.proposed_amount !== null && (
                                            <span className="font-mono text-xs font-bold text-ink">
                                                {alt.proposed_amount} ر.س
                                            </span>
                                        )}
                                    </div>

                                    {alt.notes && <p className="text-[11px] leading-relaxed text-ink/70">{alt.notes}</p>}

                                    <div className="flex gap-1.5">
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                router.post(
                                                    `/employee/detail/${event.id}/alternatives/${alt.id}/accept`,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            اقبل الموعد البديل
                                        </Button>
                                        <Button
                                            type="button"
                                            tone="danger"
                                            onClick={() =>
                                                router.post(
                                                    `/employee/detail/${event.id}/alternatives/${alt.id}/reject`,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            ارفض
                                        </Button>
                                    </div>
                                </div>
                            ))}
                    </section>
                )}

            {/* ── اعتماد اقتراح الفعالية ── */}
            {canApproveProposal && (
                <section className="space-y-2.5">
                    <h2 className="px-1 text-xs font-black text-ink">اقتراح بانتظار اعتمادك</h2>
                    <p className="px-1 text-[11px] leading-relaxed text-ink/60">
                        اقترحها عضو في مجتمعك. اعتمادك يفتح التسجيل ويبدأ البحث عن مرفق؛ رفضك يُعلمه بالسبب ولا يُنشئ شيئاً.
                    </p>
                    <div className="flex gap-1.5 px-1">
                        <Button
                            type="button"
                            onClick={() =>
                                router.post(`/employee/detail/${event.id}/proposal/approve`, {}, { preserveScroll: true })
                            }
                        >
                            اعتماد الاقتراح
                        </Button>
                        <Button type="button" tone="danger" onClick={() => setRejectingProposal(true)}>
                            رفض
                        </Button>
                    </div>
                </section>
            )}

            {/* ── تمديد التسجيل ── */}
            {canExtendRegistration && (
                <section className="space-y-2 rounded-2xl border-[0.5px] border-ink/15 bg-surface p-3">
                    <h2 className="text-xs font-black text-ink">لم يبلغ النصاب بعد</h2>
                    <p className="text-[11px] leading-relaxed text-ink/60">
                        يمكنك تمديد التسجيل 24 ساعة — مرة واحدة فقط لهذه الفعالية. بدون التمديد تُلغى تلقائياً عند الإغلاق إن لم
                        يكتمل العدد.
                    </p>
                    <Button type="button" onClick={() => setExtending(true)}>
                        مدّد التسجيل 24 ساعة
                    </Button>
                </section>
            )}

            {/* ── الإلغاء ── */}
            {canCancel && (
                <button
                    type="button"
                    onClick={() => setCancelling(true)}
                    className="w-full cursor-pointer rounded-full border-[0.5px] border-danger/25 bg-danger-tint px-5 py-3 text-xs font-bold text-danger"
                >
                    إلغاء الفعالية
                </button>
            )}

            <ConfirmModal
                open={leaving}
                tone="danger"
                title="إلغاء مشاركتك"
                message="سيُعرض مقعدك على أول من في قائمة الانتظار، ولن يكون بإمكانك استعادته إن امتلأت الفعالية."
                details={
                    <>
                        <ConfirmRow label="الفعالية" value={event.title} />
                        <ConfirmRow
                            label="في قائمة الانتظار الآن"
                            value={`${waitlistCount} زميل`}
                        />
                    </>
                }
                confirmLabel="إلغاء مشاركتي"
                onConfirm={() => {
                    router.post(`/employee/detail/${event.id}/leave`);
                    setLeaving(false);
                }}
                onCancel={() => setLeaving(false)}
            />

            <ConfirmModal
                open={cancelling}
                tone="danger"
                title="إلغاء الفعالية بالكامل"
                message="سيُبلَّغ كل المشاركين والمزوّد، وتُطبَّق سياسة الاسترداد المعلنة."
                details={
                    <>
                        <ConfirmRow label="الفعالية" value={event.title} />
                        <ConfirmRow
                            label="المشاركون"
                            value={String(payment.participants_count)}
                        />
                        <ConfirmRow
                            label="سياسة الاسترداد"
                            value={refundPreview?.policy_label ?? '—'}
                            strong
                        />
                        <ConfirmRow
                            label="نسبة الاسترداد"
                            value={`${refundPreview?.percentage ?? 0}٪`}
                        />
                    </>
                }
                confirmLabel="تأكيد الإلغاء"
                onConfirm={() => {
                    router.delete(`/employee/detail/${event.id}`);
                    setCancelling(false);
                }}
                onCancel={() => setCancelling(false)}
            />
            <ConfirmModal
                open={removing !== null}
                tone="danger"
                title="إزالة مشارك"
                message="يخرج المشارك من الفعالية ويُعاد مقعده للمتاح. إن كان قد سدّد حصته يُردّ إليه المبلغ، وإن كانت هناك قائمة انتظار يُعرض المقعد على أولها."
                details={removing && <ConfirmRow label="المشارك" value={removing.name} strong />}
                confirmLabel="نعم، أزل المشارك"
                onConfirm={() => {
                    router.post(`/employee/detail/${event.id}/remove/${removing?.id}`, {}, { preserveScroll: true });
                    setRemoving(null);
                }}
                onCancel={() => setRemoving(null)}
            />

            <ConfirmModal
                open={extending}
                title="تمديد التسجيل 24 ساعة"
                message="يُمدَّد باب التسجيل يوماً واحداً — مرة واحدة فقط لهذه الفعالية. إن لم يكتمل النصاب بعد التمديد تُلغى تلقائياً."
                details={
                    <>
                        <ConfirmRow label="الفعالية" value={event.title} strong />
                        <ConfirmRow
                            label="المشاركون الآن"
                            value={`${event.participants_count ?? 0} من نصاب ${event.min_participants ?? '—'}`}
                            strong
                        />
                    </>
                }
                confirmLabel="نعم، مدّد 24 ساعة"
                onConfirm={() => {
                    router.post(`/employee/detail/${event.id}/extend-registration`, {}, { preserveScroll: true });
                    setExtending(false);
                }}
                onCancel={() => setExtending(false)}
            />

            <ConfirmModal
                open={rejectingProposal}
                tone="danger"
                title="رفض الاقتراح"
                message="يُبلَّغ مقترح الفعالية بالرفض وسببه، ولا تُنشأ الفعالية. يمكنه التقدّم باقتراح آخر."
                details={
                    <div className="pt-2">
                        <label htmlFor="proposal-reason" className="mb-1 block text-[11px] font-bold text-ink">
                            سبب الرفض
                        </label>
                        <textarea
                            id="proposal-reason"
                            rows={2}
                            value={proposalForm.data.reason}
                            onChange={(event) => proposalForm.setData('reason', event.target.value)}
                            className="w-full rounded-xl border-[0.5px] border-ink/20 bg-surface px-3 py-2 text-xs focus:border-ink focus:outline-none"
                        />
                    </div>
                }
                confirmLabel="تأكيد الرفض"
                onConfirm={() => {
                    proposalForm.post(`/employee/detail/${event.id}/proposal/reject`, {
                        preserveScroll: true,
                        onSuccess: () => setRejectingProposal(false),
                    });
                }}
                onCancel={() => setRejectingProposal(false)}
            />
        </EmployeeLayout>
    );
}

function Row({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-white/60">{label}</span>
            <span
                className={
                    strong
                        ? 'font-mono font-black text-lime'
                        : 'font-mono font-bold text-white'
                }
            >
                {value}
            </span>
        </div>
    );
}

/**
 * صف واحد في سجل الحضور — تعليم الحضور وتسجيل النتيجة معاً.
 *
 * H §13: نافذة التصحيح 24 ساعة. بعدها التعديل ما زال ممكناً لحامل الصلاحية،
 * لكنه يشترط سبباً موثَّقاً ويظهر في مؤشرات الإنذار المبكر — ولذلك يُطلب السبب
 * في الواجهة لا في رسالة خطأ بعد المحاولة.
 *
 * النتيجة تُسجَّل هنا لأنها من نفس اللحظة: القائد يُنهي الفعالية فيعلّم الحضور
 * ويُدخل النتائج معاً. لوحة المهارة تقرأ هذه النتائج — وبلا هذا النموذج تبقى فارغة.
 */
function RosterEntry({
    row,
    eventId,
    panel,
    result,
}: {
    row: RosterRow;
    eventId: number;
    panel: AttendancePanel;
    result?: ResultRow;
}) {
    const [open, setOpen] = useState(false);
    const attendance = useForm({ attendance_status: 'attended', reason: '' });
    const entry = useForm({ unit: panel.units[0]?.key ?? '', value: '', notes: '' });
    const correction = useForm({ value: '', reason: '' });

    const mark = (status: 'attended' | 'absent') => {
        attendance.setData('attendance_status', status);
        attendance.transform((data) => ({ ...data, attendance_status: status }));
        attendance.post(`/employee/detail/${eventId}/attendance/${row.employee_id}`, {
            preserveScroll: true,
            onSuccess: () => attendance.setData('reason', ''),
        });
    };

    const needsReason = panel.reason_required;

    return (
        <div className="space-y-2 p-3">
            <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-bold text-ink">{row.name ?? '—'}</span>

                <div className="flex shrink-0 items-center gap-1.5">
                    <Badge
                        tone={
                            row.attendance_status === 'attended'
                                ? 'success'
                                : row.attendance_status === 'absent'
                                  ? 'danger'
                                  : 'neutral'
                        }
                    >
                        {row.attendance_status === 'attended'
                            ? 'حضر'
                            : row.attendance_status === 'absent'
                              ? 'غاب'
                              : 'لم يُسجَّل'}
                    </Badge>

                    {(panel.can_edit || panel.can_enter_results) && (
                        <button
                            type="button"
                            onClick={() => setOpen(!open)}
                            aria-label="تعديل الحضور والنتيجة"
                            className="rounded-lg bg-ink/5 p-1.5 text-ink transition-colors hover:bg-ink/10"
                        >
                            <Pencil className="h-3 w-3" aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>

            {result && (
                <span className="block font-mono text-[10px] text-ink/55">
                    {result.unit_label}: {result.value_formatted}
                    {result.corrections_count > 0 && ` · صُحّحت ${result.corrections_count} مرة`}
                </span>
            )}

            {open && (
                <div className="space-y-2 rounded-xl border-[0.5px] border-ink/12 bg-page p-2.5">
                    {panel.can_edit && (
                        <div className="space-y-1.5">
                            {needsReason && (
                                <input
                                    placeholder="سبب التعديل بعد إقفال النافذة — إلزامي"
                                    className={INPUT}
                                    value={attendance.data.reason}
                                    onChange={(event) => attendance.setData('reason', event.target.value)}
                                />
                            )}
                            <div className="flex gap-1.5">
                                <Button
                                    type="button"
                                    disabled={attendance.processing || (needsReason && !attendance.data.reason.trim())}
                                    onClick={() => mark('attended')}
                                >
                                    حضر
                                </Button>
                                <Button
                                    type="button"
                                    tone="danger"
                                    disabled={attendance.processing || (needsReason && !attendance.data.reason.trim())}
                                    onClick={() => mark('absent')}
                                >
                                    غاب
                                </Button>
                            </div>
                            {attendance.errors.attendance_status && (
                                <p className="text-[10px] text-danger">{attendance.errors.attendance_status}</p>
                            )}
                        </div>
                    )}

                    {panel.can_enter_results && !result && (
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                entry.post(`/employee/detail/${eventId}/results/${row.employee_id}`, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        entry.reset();
                                        setOpen(false);
                                    },
                                });
                            }}
                            className="space-y-1.5 border-t-[0.5px] border-ink/10 pt-2"
                        >
                            <span className="block text-[10px] font-bold text-ink/60">تسجيل نتيجة — تغذّي لوحة المهارة</span>
                            <div className="flex gap-1.5">
                                <select
                                    className={INPUT}
                                    value={entry.data.unit}
                                    onChange={(event) => entry.setData('unit', event.target.value)}
                                >
                                    {panel.units.map((unit) => (
                                        <option key={unit.key} value={unit.key}>
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    step="any"
                                    dir="ltr"
                                    placeholder="القيمة"
                                    className={INPUT}
                                    value={entry.data.value}
                                    onChange={(event) => entry.setData('value', event.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={entry.processing || entry.data.value === ''}>
                                حفظ النتيجة
                            </Button>
                            {entry.errors.value && <p className="text-[10px] text-danger">{entry.errors.value}</p>}
                        </form>
                    )}

                    {panel.can_correct_results && result && (
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                correction.post(`/employee/results/${result.id}/correct`, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        correction.reset();
                                        setOpen(false);
                                    },
                                });
                            }}
                            className="space-y-1.5 border-t-[0.5px] border-ink/10 pt-2"
                        >
                            <span className="block text-[10px] font-bold text-ink/60">
                                تصحيح النتيجة — القيمة القديمة تبقى في السجل
                            </span>
                            <input
                                type="number"
                                step="any"
                                dir="ltr"
                                placeholder="القيمة المصحَّحة"
                                className={INPUT}
                                value={correction.data.value}
                                onChange={(event) => correction.setData('value', event.target.value)}
                            />
                            <input
                                placeholder="سبب التصحيح — إلزامي ويُسجَّل"
                                className={INPUT}
                                value={correction.data.reason}
                                onChange={(event) => correction.setData('reason', event.target.value)}
                            />
                            <Button
                                type="submit"
                                disabled={
                                    correction.processing ||
                                    correction.data.value === '' ||
                                    correction.data.reason.trim().length < 3
                                }
                            >
                                حفظ التصحيح
                            </Button>
                            {correction.errors.reason && (
                                <p className="text-[10px] text-danger">{correction.errors.reason}</p>
                            )}
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * تعليق واحد — تحرير وحذف لصاحبه، وإبلاغ لغيره.
 *
 * `can_edit` يصل من الخادم لأن نافذة التحرير محدودة زمنياً؛ الواجهة لا تحسبها
 * بنفسها حتى لا يظهر زر يرفضه الخادم. والإبلاغ متاح على تعليقات الآخرين وحدها
 * — الإبلاغ عن نفسك ليس إجراءً.
 */
function CommentRow({ comment }: { comment: Comment }) {
    const [editing, setEditing] = useState(false);
    const [reporting, setReporting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const edit = useForm({ body: comment.body });
    const report = useForm({ reason: '' });

    return (
        <div className="space-y-1 p-3">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black text-ink">{comment.employee?.name ?? '—'}</span>

                <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-ink/45">
                        {new Date(comment.created_at).toLocaleDateString('ar-SA')}
                    </span>

                    {comment.can_edit ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setEditing(!editing)}
                                aria-label="تعديل التعليق"
                                className="rounded p-1 text-ink/50 transition-colors hover:text-ink"
                            >
                                <Pencil className="h-2.5 w-2.5" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeleting(true)}
                                aria-label="حذف التعليق"
                                className="rounded p-1 text-danger/70 transition-colors hover:text-danger"
                            >
                                <Trash2 className="h-2.5 w-2.5" aria-hidden="true" />
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setReporting(!reporting)}
                            aria-label="الإبلاغ عن التعليق"
                            className="rounded p-1 text-ink/40 transition-colors hover:text-warning"
                        >
                            <Flag className="h-2.5 w-2.5" aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>

            {editing ? (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        edit.patch(`/employee/comments/${comment.id}`, {
                            preserveScroll: true,
                            onSuccess: () => setEditing(false),
                        });
                    }}
                    className="space-y-1.5"
                >
                    <textarea
                        rows={2}
                        className={INPUT}
                        value={edit.data.body}
                        onChange={(event) => edit.setData('body', event.target.value)}
                    />
                    <div className="flex gap-1.5">
                        <Button type="submit" disabled={edit.processing || !edit.data.body.trim()}>
                            حفظ
                        </Button>
                        <Button type="button" tone="soft" onClick={() => setEditing(false)}>
                            إلغاء
                        </Button>
                    </div>
                </form>
            ) : (
                <p className="text-[11px] leading-relaxed text-ink/75">{comment.body}</p>
            )}

            {reporting && (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        report.post(`/employee/comments/${comment.id}/report`, {
                            preserveScroll: true,
                            onSuccess: () => setReporting(false),
                        });
                    }}
                    className="space-y-1.5 rounded-xl border-[0.5px] border-warning/25 bg-warning-tint p-2"
                >
                    <span className="block text-[10px] font-bold text-warning">
                        يصل البلاغ لقائد المجتمع — لا يُحذف التعليق تلقائياً.
                    </span>
                    <input
                        placeholder="سبب البلاغ (اختياري)"
                        className={INPUT}
                        value={report.data.reason}
                        onChange={(event) => report.setData('reason', event.target.value)}
                    />
                    <Button type="submit" disabled={report.processing}>
                        أبلغ
                    </Button>
                </form>
            )}

            <ConfirmModal
                open={deleting}
                tone="danger"
                title="حذف التعليق"
                message="يُحذف تعليقك من نقاش الفعالية نهائياً."
                confirmLabel="نعم، احذفه"
                onConfirm={() => {
                    router.delete(`/employee/comments/${comment.id}`, { preserveScroll: true });
                    setDeleting(false);
                }}
                onCancel={() => setDeleting(false)}
            />
        </div>
    );
}
