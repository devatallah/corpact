import { Head, router, useForm } from '@inertiajs/react';
import {
    CalendarClock,
    CircleCheckBig,
    Phone,
    TriangleAlert,
    X,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { BackLink } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    INPUT,
    Note,
    PageHeader,
    StatCard,
} from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';
import { providerRequestStatus } from '@/lib/status';
import { Deadline } from '@/pages/partner/requests/queue';
import type { ProviderRequestRow } from '@/pages/partner/requests/queue';

/**
 * H §11 — صفحة القرار.
 *
 * Four different answers with four different consequences, so each one names
 * its own before it is taken:
 *
 *  · قبول — يحجز الوحدة في التقويم فوراً.
 *  · رفض — يحتاج سبباً، ويُحسب في الموثوقية.
 *  · وقت بديل — لا يرفض ولا يقبل: يعيد الكرة إلى منشئ الفعالية.
 *  · إلغاء بعد القبول — الأشد أثراً على الموثوقية، ويردّ مساهمة المجتمع كاملة.
 *
 * The last one is deliberately the hardest to reach on the page. Its confirm
 * names the effect but never the score: H §11 keeps the numeric reliability
 * value out of the provider's sight in v1 — they are shown which behaviours
 * count, not the running total those behaviours produce.
 */
export default function PartnerRequestDecision({
    request,
    can_decide: canDecide,
}: {
    request: ProviderRequestRow;
    can_decide: boolean;
}) {
    const [accepting, setAccepting] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const rejectForm = useForm({ reason: '' });
    const cancelForm = useForm({ reason: '', stale_availability: false });
    const altForm = useForm({
        proposed_date: '',
        proposed_start_time: '',
        proposed_venues_count: '',
        proposed_amount: '',
        notes: '',
    });

    const meta = providerRequestStatus(request.status);
    const event = request.event;

    return (
        <PartnerLayout>
            <Head title={`طلب #${request.id}`} />

            <BackLink
                href="/partner/requests-queue"
                label="العودة إلى الطلبات"
            />

            <PageHeader
                icon={CalendarClock}
                title={event?.community_name ?? `طلب #${request.id}`}
                subtitle={event?.company_name ?? '—'}
                actions={<Badge tone={meta.tone}>{meta.label}</Badge>}
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="الموعد المطلوب"
                    value={request.requested_date}
                    hint={`${request.start_time} · ${request.duration_minutes} دقيقة`}
                />
                <StatCard
                    label="الوحدة"
                    value={request.unit?.name ?? '—'}
                    hint={
                        request.quantity > 1
                            ? `×${request.quantity}`
                            : undefined
                    }
                />
                <StatCard
                    label="عدد المشاركين"
                    value={
                        request.frozen_participants_count ??
                        event?.participants_count ??
                        0
                    }
                    hint="العدد المجمَّد وقت الإرسال"
                />
                <StatCard
                    label="الإجمالي"
                    value={String(request.total_amount ?? '—')}
                    hint="ريال — قبل العمولة"
                />
            </div>

            {/* ── جهة الاتصال والمهلة ── */}
            <Card
                padding="p-4"
                className="flex flex-wrap items-center justify-between gap-3"
            >
                <div className="flex min-w-0 items-center gap-2">
                    <Phone
                        className="h-4 w-4 shrink-0 text-ink"
                        aria-hidden="true"
                    />
                    <span className="text-xs text-ink/70">
                        منشئ الفعالية:{' '}
                        <span className="font-bold text-ink">
                            {event?.creator_name ?? '—'}
                        </span>
                        {event?.creator_phone && (
                            <>
                                {' '}
                                —{' '}
                                <a
                                    href={`tel:${event.creator_phone}`}
                                    className="font-mono font-bold text-ink hover:underline"
                                    dir="ltr"
                                >
                                    {event.creator_phone}
                                </a>
                            </>
                        )}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[11px] text-ink/50">المهلة</span>
                    <Deadline
                        deadline={request.deadline_at}
                        pending={request.status === 'pending'}
                        late={request.late_response}
                    />
                </div>
            </Card>

            {!canDecide && (
                <Note tone="warning" title="هذا الطلب لم يعد يقبل قراراً">
                    {request.status === 'expired'
                        ? 'انتهت مهلة الردّ، فانتقل الطلب تلقائياً — ولا يمكن قبوله الآن.'
                        : `حالة الطلب الآن «${meta.label}». الصفحة معروضة للاطلاع والسجل.`}
                    {request.rejection_reason && (
                        <span className="mt-1 block">
                            سبب الرفض المسجّل: {request.rejection_reason}
                        </span>
                    )}
                    {request.cancellation_reason && (
                        <span className="mt-1 block">
                            سبب الإلغاء المسجّل: {request.cancellation_reason}
                        </span>
                    )}
                </Note>
            )}

            {canDecide && (
                <>
                    {/* ── القرار السريع ── */}
                    <Card
                        padding="p-4"
                        className="flex flex-wrap items-center gap-2"
                    >
                        <Button
                            type="button"
                            icon={CircleCheckBig}
                            onClick={() => setAccepting(true)}
                        >
                            قبول الطلب
                        </Button>
                        <Button
                            type="button"
                            tone="danger"
                            icon={X}
                            onClick={() => {
                                rejectForm.setData('reason', '');
                                setRejecting(true);
                            }}
                        >
                            رفض الطلب
                        </Button>
                        <span className="text-[11px] text-ink/50">
                            أو اقترح وقتاً بديلاً من النموذج أدناه.
                        </span>
                    </Card>

                    {/* ── الوقت البديل ── */}
                    <form
                        onSubmit={(submitEvent) => {
                            submitEvent.preventDefault();
                            altForm.post(
                                `/partner/requests-queue/${request.id}/propose-alternative`,
                                { preserveScroll: true },
                            );
                        }}
                        className="space-y-6"
                    >
                        <FormSection
                            title="اقتراح وقت بديل"
                            hint="لا يقبل الطلب ولا يرفضه — يعيده إلى منشئ الفعالية ليقرّ الموعد الجديد أو يعتذر."
                        >
                            <FormGrid>
                                <Field
                                    label="التاريخ البديل"
                                    error={altForm.errors.proposed_date}
                                    required
                                >
                                    <input
                                        type="date"
                                        dir="ltr"
                                        className={INPUT}
                                        value={altForm.data.proposed_date}
                                        onChange={(changeEvent) =>
                                            altForm.setData(
                                                'proposed_date',
                                                changeEvent.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <Field
                                    label="وقت البداية"
                                    error={altForm.errors.proposed_start_time}
                                    required
                                >
                                    <input
                                        type="time"
                                        dir="ltr"
                                        className={INPUT}
                                        value={altForm.data.proposed_start_time}
                                        onChange={(changeEvent) =>
                                            altForm.setData(
                                                'proposed_start_time',
                                                changeEvent.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <Field
                                    label="عدد الملاعب/الوحدات"
                                    error={altForm.errors.proposed_venues_count}
                                >
                                    <input
                                        type="number"
                                        min="1"
                                        dir="ltr"
                                        className={INPUT}
                                        value={
                                            altForm.data.proposed_venues_count
                                        }
                                        onChange={(changeEvent) =>
                                            altForm.setData(
                                                'proposed_venues_count',
                                                changeEvent.target.value,
                                            )
                                        }
                                    />
                                </Field>

                                <Field
                                    label="المبلغ البديل"
                                    error={altForm.errors.proposed_amount}
                                    hint="اتركه فارغاً لإبقاء السعر كما هو."
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        dir="ltr"
                                        className={INPUT}
                                        value={altForm.data.proposed_amount}
                                        onChange={(changeEvent) =>
                                            altForm.setData(
                                                'proposed_amount',
                                                changeEvent.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </FormGrid>

                            <Field
                                label="ملاحظة لمنشئ الفعالية"
                                error={altForm.errors.notes}
                            >
                                <input
                                    className={INPUT}
                                    value={altForm.data.notes}
                                    onChange={(changeEvent) =>
                                        altForm.setData(
                                            'notes',
                                            changeEvent.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </FormSection>

                        <FormActions>
                            <Button
                                type="submit"
                                disabled={
                                    altForm.processing ||
                                    !altForm.data.proposed_date ||
                                    !altForm.data.proposed_start_time
                                }
                            >
                                إرسال الاقتراح
                            </Button>
                        </FormActions>
                    </form>
                </>
            )}

            {/* ── الإلغاء بعد القبول ── */}
            {request.status === 'accepted' && (
                <FormSection
                    title="إلغاء حجز مقبول"
                    hint="الملاذ الأخير: تُلغى الفعالية على الشركة بعد أن اعتمدت عليك، فالأثر على موثوقيتك هو الأشد."
                >
                    <Button
                        type="button"
                        tone="danger"
                        icon={TriangleAlert}
                        onClick={() => {
                            cancelForm.setData('reason', '');
                            setCancelling(true);
                        }}
                    >
                        إلغاء الحجز
                    </Button>
                </FormSection>
            )}

            {/* ── التأكيدات ── */}
            <ConfirmModal
                open={accepting}
                title="قبول الطلب"
                message="تُحجز الوحدة في تقويم المنصة فوراً باسم هذه الفعالية، ولا يمكن لغيرها حجزها في الفتحة نفسها. الإلغاء بعد القبول يخصم من موثوقيتك."
                details={
                    <>
                        <ConfirmRow
                            label="الوحدة"
                            value={request.unit?.name ?? '—'}
                            strong
                        />
                        <ConfirmRow
                            label="الموعد"
                            value={`${request.requested_date} · ${request.start_time}`}
                            strong
                        />
                        <ConfirmRow
                            label="المدة"
                            value={`${request.duration_minutes} دقيقة`}
                        />
                        <ConfirmRow
                            label="الإجمالي"
                            value={`${request.total_amount ?? '—'} ر.س`}
                            strong
                        />
                    </>
                }
                confirmLabel="نعم، اقبل واحجز"
                onConfirm={() => {
                    router.post(
                        `/partner/requests-queue/${request.id}/accept`,
                        {},
                        { preserveScroll: true },
                    );
                    setAccepting(false);
                }}
                onCancel={() => setAccepting(false)}
            />

            <ConfirmModal
                open={rejecting}
                tone="danger"
                title="رفض الطلب"
                message="يُبلَّغ منشئ الفعالية بالرفض وسببه، ويبحث عن مرفق آخر. يُحتسب الرفض ضمن مؤشر موثوقيتك."
                details={
                    <>
                        <ConfirmRow
                            label="الموعد المطلوب"
                            value={`${request.requested_date} · ${request.start_time}`}
                            strong
                        />
                        <ConfirmRow
                            label="الإجمالي"
                            value={`${request.total_amount ?? '—'} ر.س`}
                        />
                        <div className="pt-2">
                            <label
                                htmlFor="reject-reason"
                                className="mb-1 block text-[11px] font-bold text-ink"
                            >
                                سبب الرفض
                            </label>
                            <textarea
                                id="reject-reason"
                                rows={2}
                                value={rejectForm.data.reason}
                                onChange={(changeEvent) =>
                                    rejectForm.setData(
                                        'reason',
                                        changeEvent.target.value,
                                    )
                                }
                                className="w-full rounded-xl border-[0.5px] border-ink/20 bg-surface px-3 py-2 text-xs focus:border-ink focus:outline-none"
                            />
                            {rejectForm.errors.reason && (
                                <p className="mt-1 text-[11px] text-danger">
                                    {rejectForm.errors.reason}
                                </p>
                            )}
                        </div>
                    </>
                }
                confirmLabel="تأكيد الرفض"
                onConfirm={() => {
                    rejectForm.post(
                        `/partner/requests-queue/${request.id}/reject`,
                        {
                            preserveScroll: true,
                            onSuccess: () => setRejecting(false),
                        },
                    );
                }}
                onCancel={() => setRejecting(false)}
            />

            <ConfirmModal
                open={cancelling}
                tone="danger"
                title="إلغاء حجز مقبول"
                message="تُلغى الفعالية على الشركة بعد أن اعتمدت عليك. تُعاد مساهمة المجتمع كاملةً إلى محفظته، وتُطبَّق سياسة إلغاء المزوّد."
                details={
                    <>
                        <ConfirmRow
                            label="الموعد"
                            value={`${request.requested_date} · ${request.start_time}`}
                            strong
                        />
                        <ConfirmRow
                            label="الشركة"
                            value={event?.company_name ?? '—'}
                        />
                        <ConfirmRow
                            label="يُعاد للمجتمع"
                            value={`${request.total_amount ?? '—'} ر.س — كاملاً`}
                            strong
                        />
                        <ConfirmRow
                            label="أثر الموثوقية"
                            value="الأشد بين كل التصرفات المسجَّلة"
                            strong
                        />
                        <div className="pt-2">
                            <label
                                htmlFor="cancel-reason"
                                className="mb-1 block text-[11px] font-bold text-ink"
                            >
                                سبب الإلغاء
                            </label>
                            <textarea
                                id="cancel-reason"
                                rows={2}
                                value={cancelForm.data.reason}
                                onChange={(changeEvent) =>
                                    cancelForm.setData(
                                        'reason',
                                        changeEvent.target.value,
                                    )
                                }
                                className="w-full rounded-xl border-[0.5px] border-ink/20 bg-surface px-3 py-2 text-xs focus:border-ink focus:outline-none"
                            />
                            {cancelForm.errors.reason && (
                                <p className="mt-1 text-[11px] text-danger">
                                    {cancelForm.errors.reason}
                                </p>
                            )}

                            <label className="mt-2 flex items-center gap-2 text-[11px] text-ink/80">
                                <input
                                    type="checkbox"
                                    checked={cancelForm.data.stale_availability}
                                    onChange={(changeEvent) =>
                                        cancelForm.setData(
                                            'stale_availability',
                                            changeEvent.target.checked,
                                        )
                                    }
                                    className="h-3.5 w-3.5 rounded border-ink/25 accent-ink"
                                />
                                السبب أن تقويمي لم يكن محدَّثاً
                            </label>
                        </div>
                    </>
                }
                confirmLabel="نعم، ألغِ الحجز"
                onConfirm={() => {
                    cancelForm.post(
                        `/partner/requests-queue/${request.id}/cancel`,
                        {
                            preserveScroll: true,
                            onSuccess: () => setCancelling(false),
                        },
                    );
                }}
                onCancel={() => setCancelling(false)}
            />
        </PartnerLayout>
    );
}
