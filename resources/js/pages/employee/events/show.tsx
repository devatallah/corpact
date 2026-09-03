import { Head, Link, router, useForm } from '@inertiajs/react';
import { CalendarDays, CircleCheckBig, Clock, MapPin, MessageSquare, Timer, TriangleAlert, Users } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { BackLink, ListState } from '@/components/list-states';
import { Badge } from '@/components/portal/ui';
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
};

type Intent = { id: number; amount: string; status: string; expires_at: string | null };

type RosterRow = {
    employee_id: number;
    name: string | null;
    attendance_status: string | null;
    attendance_reason: string | null;
};

type AttendancePanel = {
    roster: RosterRow[];
    window_closes_at: string | null;
    window_open: boolean;
    locked_at: string | null;
    can_edit: boolean;
    reason_required: boolean;
    notice: string | null;
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
    refundPreview,
    registrationOpen,
    attendancePanel,
    comments,
    canComment,
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
    seriesEvents: unknown[];
    refundPreview: { percentage: number; policy_label: string } | null;
    attendancePanel: AttendancePanel | null;
    comments: Comment[];
    canComment: boolean;
}) {
    const [leaving, setLeaving] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const commentForm = useForm({ body: '' });
    const status = eventStatus(event.status);

    return (
        <EmployeeLayout>
            <Head title={event.title} />

            <BackLink href="/employee/home" label="العودة إلى الرئيسية" />

            {/* ── الترويسة ── */}
            <div className="p-4 bg-surface rounded-2xl border-[0.5px] border-ink/15 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="text-[11px] text-ink/60 mb-0.5 truncate">{event.community?.name ?? '—'}</div>
                        <h1 className="text-base font-black text-ink leading-snug">{event.title}</h1>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                </div>

                {event.description && <p className="text-xs text-ink/70 leading-relaxed">{event.description}</p>}

                <div className="grid grid-cols-2 gap-2 text-xs text-ink/70 pt-2 border-t-[0.5px] border-ink/10">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="font-mono text-[11px]">{event.event_date ?? '—'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="font-mono text-[11px]">
                            {event.start_time ?? '—'}
                            {event.end_time ? ` - ${event.end_time}` : ''}
                        </span>
                    </span>
                    <span className="flex items-center gap-1.5 col-span-2 min-w-0">
                        <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{event.partner?.name ?? 'لم يُحدَّد المرفق بعد'}</span>
                    </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t-[0.5px] border-ink/10">
                    <span className="flex items-center gap-1.5 text-ink/70">
                        <Users className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="font-mono">
                            {payment.participants_count} / {payment.capacity ?? '—'} مقعد
                        </span>
                    </span>
                    <span className="text-ink/50">النصاب {payment.min_participants}</span>
                </div>
            </div>

            {/* ── الحصة: سقف ملزم قبل الإغلاق، مبلغ مقفل بعده ── */}
            <div className="p-4 bg-ink text-white rounded-2xl space-y-3">
                {payment.share_locked ? (
                    <>
                        <div className="text-center">
                            <div className="text-xs text-white/60">حصتك النهائية</div>
                            <div className="text-[28px] font-black text-lime font-mono leading-tight">
                                {payment.final_share} <span className="text-sm font-normal text-white/80">ر.س</span>
                            </div>
                            <div className="text-[11px] text-white/50">أُقفلت الحصة عند إغلاق التسجيل ولن تتغيّر</div>
                        </div>

                        {myIntent && myIntent.status === 'pending' && (
                            <Link
                                href={`/employee/payments/${myIntent.id}`}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-lime text-ink text-sm font-black px-5 py-3 transition-colors hover:bg-lime-hover"
                            >
                                <Timer className="w-4 h-4" aria-hidden="true" />
                                <span>أكمل السداد ({myIntent.amount} ر.س)</span>
                            </Link>
                        )}

                        {myIntent && myIntent.status === 'paid' && (
                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-success">
                                <CircleCheckBig className="w-4 h-4" aria-hidden="true" />
                                <span>سُدِّدت حصتك</span>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="text-center">
                            <div className="text-xs text-white/60">حصتك بحد أقصى</div>
                            <div className="text-[28px] font-black text-lime font-mono leading-tight">
                                {payment.max_share} <span className="text-sm font-normal text-white/80">ر.س</span>
                            </div>
                            <div className="text-[11px] text-white/50">وتقل كلما انضم زملاؤك — لن ترتفع أبداً</div>
                        </div>

                        <div className="space-y-1.5 pt-3 border-t-[0.5px] border-white/15 text-xs">
                            <Row label="التكلفة الإجمالية للفعالية" value={`${payment.total_amount} ر.س`} />
                            <Row label="دعم محفظة المجتمع" value={`${payment.subsidy} ر.س`} />
                            <Row label="المتبقي على المشاركين" value={`${payment.remaining} ر.س`} strong />
                        </div>
                    </>
                )}

                {payment.collection_deadline_at && (
                    <div className="text-center text-[11px] text-white/50 font-mono pt-1">
                        مهلة السداد حتى {new Date(payment.collection_deadline_at).toLocaleString('ar-SA')}
                    </div>
                )}
            </div>

            {/* ── عرض مقعد لقائمة الانتظار ── */}
            {seatOfferExpiresAt && (
                <div className="p-4 rounded-2xl bg-warning-tint border-[0.5px] border-warning/30 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-black text-warning">
                        <TriangleAlert className="w-4 h-4" aria-hidden="true" />
                        <span>عُرض عليك مقعد شاغر</span>
                    </div>
                    <p className="text-[11px] text-ink/70 leading-relaxed">
                        الأسبق يفوز — يسقط العرض تلقائياً عند انتهاء المهلة ويُعرض على التالي في القائمة.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => router.post(`/employee/detail/${event.id}/waitlist-offer/accept`)}
                            className="rounded-xl bg-ink text-white text-xs font-bold py-2.5 cursor-pointer"
                        >
                            قبول المقعد
                        </button>
                        <button
                            type="button"
                            onClick={() => router.post(`/employee/detail/${event.id}/waitlist-offer/decline`)}
                            className="rounded-xl bg-surface text-ink border-[0.5px] border-ink/15 text-xs font-bold py-2.5 cursor-pointer"
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
                        onClick={() => router.post(`/employee/detail/${event.id}/join`)}
                        className="w-full rounded-full bg-lime text-ink border-[0.5px] border-lime hover:bg-lime-hover text-sm font-black px-5 py-3.5 cursor-pointer transition-colors"
                    >
                        {(payment.capacity ?? 0) - payment.participants_count > 0 ? 'أكّد حضورك' : 'انضم لقائمة الانتظار'}
                    </button>
                )}

                {isJoined && (
                    <div className="p-3.5 bg-surface rounded-2xl border-[0.5px] border-ink/15 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-success">
                            <CircleCheckBig className="w-4 h-4" aria-hidden="true" />
                            مقعدك محجوز
                        </span>
                        {registrationOpen && (
                            <button
                                type="button"
                                onClick={() => setLeaving(true)}
                                className="text-[11px] font-bold text-danger hover:underline cursor-pointer"
                            >
                                إلغاء مشاركتي
                            </button>
                        )}
                    </div>
                )}

                {isWaitlisted && (
                    <div className="p-3.5 bg-surface rounded-2xl border-[0.5px] border-ink/15 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-ink">
                            أنت في قائمة الانتظار — الترتيب {waitlistPosition ?? '—'} من {waitlistCount}
                        </span>
                        <button
                            type="button"
                            onClick={() => router.post(`/employee/detail/${event.id}/leave-waitlist`)}
                            className="text-[11px] font-bold text-danger hover:underline cursor-pointer"
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
                        <h2 className="text-xs font-black text-ink">سجل الحضور</h2>
                        {attendancePanel.window_open ? (
                            <Badge tone="warning">نافذة التعديل مفتوحة</Badge>
                        ) : (
                            <Badge tone="neutral">أُقفل السجل</Badge>
                        )}
                    </div>

                    {attendancePanel.notice && (
                        <p className="text-[11px] text-ink/60 leading-relaxed px-1">{attendancePanel.notice}</p>
                    )}

                    <div className="bg-surface rounded-2xl border-[0.5px] border-ink/15 divide-y-[0.5px] divide-ink/10">
                        {attendancePanel.roster.map((row) => (
                            <div key={row.employee_id} className="p-3 flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-ink truncate">{row.name ?? '—'}</span>
                                <Badge tone={row.attendance_status === 'attended' ? 'success' : row.attendance_status === 'absent' ? 'danger' : 'neutral'}>
                                    {row.attendance_status === 'attended' ? 'حضر' : row.attendance_status === 'absent' ? 'غاب' : 'لم يُسجَّل'}
                                </Badge>
                            </div>
                        ))}
                        {attendancePanel.roster.length === 0 && <ListState tone="empty" title="لا مشاركين مسجّلين." />}
                    </div>
                </section>
            )}

            {/* ── التعليقات ── */}
            <section className="space-y-2.5">
                <div className="flex items-center gap-1.5 px-1">
                    <MessageSquare className="w-3.5 h-3.5 text-ink" aria-hidden="true" />
                    <h2 className="text-xs font-black text-ink">نقاش الفعالية</h2>
                </div>

                {canComment && (
                    <form
                        onSubmit={(submitEvent) => {
                            submitEvent.preventDefault();
                            commentForm.post(`/employee/detail/${event.id}/comments`, {
                                preserveScroll: true,
                                onSuccess: () => commentForm.reset(),
                            });
                        }}
                        className="flex items-end gap-2"
                    >
                        <textarea
                            rows={2}
                            value={commentForm.data.body}
                            onChange={(changeEvent) => commentForm.setData('body', changeEvent.target.value)}
                            placeholder="اكتب تعليقاً لزملائك…"
                            aria-label="تعليق جديد"
                            className="flex-1 px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink resize-none"
                        />
                        <button
                            type="submit"
                            disabled={commentForm.processing || commentForm.data.body.trim() === ''}
                            className="rounded-xl bg-ink text-white text-xs font-bold px-4 py-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                            نشر
                        </button>
                    </form>
                )}

                <div className="bg-surface rounded-2xl border-[0.5px] border-ink/15 divide-y-[0.5px] divide-ink/10">
                    {comments.map((comment) => (
                        <div key={comment.id} className="p-3 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-black text-ink">{comment.employee?.name ?? '—'}</span>
                                <span className="text-[10px] text-ink/45 font-mono">
                                    {new Date(comment.created_at).toLocaleDateString('ar-SA')}
                                </span>
                            </div>
                            <p className="text-xs text-ink/80 leading-relaxed">{comment.body}</p>
                        </div>
                    ))}
                    {comments.length === 0 && <ListState tone="empty" title="لا تعليقات بعد." />}
                </div>
            </section>

            {/* ── الإلغاء ── */}
            {canCancel && (
                <button
                    type="button"
                    onClick={() => setCancelling(true)}
                    className="w-full rounded-full bg-danger-tint text-danger border-[0.5px] border-danger/25 text-xs font-bold px-5 py-3 cursor-pointer"
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
                        <ConfirmRow label="في قائمة الانتظار الآن" value={`${waitlistCount} زميل`} />
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
                        <ConfirmRow label="المشاركون" value={String(payment.participants_count)} />
                        <ConfirmRow label="سياسة الاسترداد" value={refundPreview?.policy_label ?? '—'} strong />
                        <ConfirmRow label="نسبة الاسترداد" value={`${refundPreview?.percentage ?? 0}٪`} />
                    </>
                }
                confirmLabel="تأكيد الإلغاء"
                onConfirm={() => {
                    router.delete(`/employee/detail/${event.id}`);
                    setCancelling(false);
                }}
                onCancel={() => setCancelling(false)}
            />
        </EmployeeLayout>
    );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-white/60">{label}</span>
            <span className={strong ? 'font-mono font-black text-lime' : 'font-mono font-bold text-white'}>{value}</span>
        </div>
    );
}
