import { Head, useForm } from '@inertiajs/react';
import {
    Download,
    FileText,
    Plus,
    Trash2,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { BackLink, ListStates } from '@/components/list-states';
import { FormActions, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    INPUT,
    Note,
    PageHeader,
    StatCard,
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import { coordinatorReportStatus } from '@/lib/status';

/**
 * H §15 — تحرير التقرير الشهري.
 *
 * The recommendations are the coordinator's whole output, and they are a
 * *closed* vocabulary on purpose: a cause from a fixed list paired with an
 * action from a fixed list. Free text would make the corpus unusable for the
 * automation these recommendations are meant to train.
 *
 * Saving does more than save: it stamps the report as submitted. That single
 * fact is the one thing a coordinator most needs to know before clicking, so
 * the confirm names it rather than the flash message afterwards.
 *
 * The snapshot itself is immutable — it was measured at generation time and
 * nothing on this screen can rewrite it.
 */
type Kpi = {
    key: string;
    label: string;
    numerator: number;
    denominator: number;
    rate: number;
    formula: string;
};
type Delta = { current: number; previous: number; change: number };

type Recommendation = {
    id: number;
    community_id: number | null;
    community_name: string | null;
    cause: string;
    cause_label: string;
    action: string;
    action_label: string;
};

type Draft = { cause: string; action: string; community_id: string };

export default function CoordinatorReportShow({
    report,
    communities,
    causeOptions,
    actionOptions,
    exports,
}: {
    report: {
        id: number;
        company_id: number;
        company_name: string;
        period_key: string;
        status: string;
        note: string | null;
        generated_at: string | null;
        delivered_at: string | null;
        submitted_at: string | null;
        snapshot: {
            period: { key: string; label: string };
            previous_period: { key: string; label: string };
            completed_events: number;
            created_events: number;
            activation_rate: Kpi;
            attendance_rate: Kpi;
            cancellation_rate: Kpi;
            cancellation_reasons: {
                status: string;
                label: string;
                count: number;
            }[];
            communities: {
                window_days: number;
                dormant: { id: number; name: string }[];
                metric: Kpi;
            };
            attendance_count: number;
            company_spend: string;
            cost_per_participation: string;
            month_over_month: Record<string, Delta>;
        };
        recommendations: Recommendation[];
    };
    communities: { id: number; name: string }[];
    causeOptions: { value: string; label: string }[];
    actionOptions: { value: string; label: string }[];
    exports: { key: string; title: string }[];
}) {
    const snapshot = report.snapshot;
    const mom = snapshot.month_over_month;

    const form = useForm<{ recommendations: Draft[]; note: string }>({
        recommendations: report.recommendations.map((row) => ({
            cause: row.cause,
            action: row.action,
            community_id:
                row.community_id === null ? '' : String(row.community_id),
        })),
        note: report.note ?? '',
    });

    const [saving, setSaving] = useState(false);

    const update = (index: number, patch: Partial<Draft>) => {
        form.setData(
            'recommendations',
            form.data.recommendations.map((row, position) =>
                position === index ? { ...row, ...patch } : row,
            ),
        );
    };

    const complete = form.data.recommendations.every(
        (row) => row.cause && row.action,
    );

    return (
        <AdminLayout>
            <Head
                title={`تقرير ${report.company_name} — ${report.period_key}`}
            />

            <BackLink href="/coordinator/reports" label="العودة إلى التقارير" />

            <PageHeader
                icon={FileText}
                title={report.company_name}
                subtitle={`دورة ${snapshot.period.label} — مقارنةً بـ${snapshot.previous_period.label}`}
                actions={
                    <Badge tone={coordinatorReportStatus(report.status).tone}>
                        {coordinatorReportStatus(report.status).label}
                    </Badge>
                }
            />

            {/* ── المؤشرات ── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <DeltaCard
                    label="معدل التفعيل"
                    delta={mom.activation_rate}
                    suffix="٪"
                />
                <DeltaCard
                    label="معدل الحضور"
                    delta={mom.attendance_rate}
                    suffix="٪"
                />
                <DeltaCard
                    label="معدل الإلغاء"
                    delta={mom.cancellation_rate}
                    suffix="٪"
                    goodWhenDown
                />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="فعاليات مكتملة"
                    value={snapshot.completed_events}
                />
                <StatCard
                    label="فعاليات أُنشئت"
                    value={snapshot.created_events}
                />
                <StatCard
                    label="مشاركات موثّقة"
                    value={snapshot.attendance_count}
                />
                <StatCard
                    label="مجتمعات خاملة"
                    value={snapshot.communities.dormant.length}
                    tone={
                        snapshot.communities.dormant.length > 0
                            ? 'warning'
                            : 'success'
                    }
                    hint={`بلا فعالية خلال ${snapshot.communities.window_days} يوماً`}
                />
            </div>

            {snapshot.communities.dormant.length > 0 && (
                <Card padding="p-4" className="space-y-2">
                    <h2 className="text-sm font-extrabold text-ink">
                        المجتمعات الخاملة
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                        {snapshot.communities.dormant.map((community) => (
                            <Badge key={community.id} tone="warning">
                                {community.name}
                            </Badge>
                        ))}
                    </div>
                    <p className="text-[11px] text-ink/55">
                        هذه هي المرشّحة لتوصية — اربط كل واحدة بسبب وإجراء
                        أدناه.
                    </p>
                </Card>
            )}

            {/* ── أسباب الإلغاء ── */}
            <Card padding="p-4" className="space-y-3">
                <h2 className="text-sm font-extrabold text-ink">
                    أسباب الإلغاء
                </h2>
                <div className="flex flex-wrap gap-2">
                    {snapshot.cancellation_reasons.map((reason) => (
                        <span
                            key={reason.status}
                            className="inline-flex items-center gap-2 rounded-full border-[0.5px] border-ink/12 bg-ink/5 px-3 py-1.5 text-[11px] font-bold"
                        >
                            {reason.label}
                            <span className="font-mono font-black text-ink">
                                {reason.count}
                            </span>
                        </span>
                    ))}
                    {snapshot.cancellation_reasons.length === 0 && (
                        <span className="text-xs text-ink/55">لا إلغاءات.</span>
                    )}
                </div>
            </Card>

            {/* ── التوصيات ── */}
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setSaving(true);
                }}
                className="space-y-6"
            >
                <FormSection
                    title="التوصيات"
                    hint="سبب من قائمة مغلقة، وإجراء من قائمة مغلقة — النص الحر يجعل هذه التوصيات غير قابلة للاستعمال في الأتمتة لاحقاً."
                >
                    <div className="space-y-3">
                        {form.data.recommendations.map((row, index) => (
                            <div
                                key={index}
                                className="space-y-2 rounded-2xl border-[0.5px] border-ink/12 bg-page p-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-bold text-ink/60">
                                        توصية {index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            form.setData(
                                                'recommendations',
                                                form.data.recommendations.filter(
                                                    (_, position) =>
                                                        position !== index,
                                                ),
                                            )
                                        }
                                        aria-label="حذف التوصية"
                                        className="rounded-lg bg-danger/8 p-1 text-danger transition-colors hover:bg-danger/15"
                                    >
                                        <Trash2
                                            className="h-3 w-3"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    <select
                                        aria-label="المجتمع"
                                        className={INPUT}
                                        value={row.community_id}
                                        onChange={(event) =>
                                            update(index, {
                                                community_id:
                                                    event.target.value,
                                            })
                                        }
                                    >
                                        <option value="">
                                            على مستوى الشركة
                                        </option>
                                        {communities.map((community) => (
                                            <option
                                                key={community.id}
                                                value={community.id}
                                            >
                                                {community.name}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        aria-label="السبب"
                                        className={INPUT}
                                        value={row.cause}
                                        onChange={(event) =>
                                            update(index, {
                                                cause: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="">— السبب —</option>
                                        {causeOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        aria-label="الإجراء"
                                        className={INPUT}
                                        value={row.action}
                                        onChange={(event) =>
                                            update(index, {
                                                action: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="">— الإجراء —</option>
                                        {actionOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}

                        <ListStates
                            count={form.data.recommendations.length}
                            empty="لا توصيات بعد."
                            emptyHint="أضف توصية واحدة على الأقل قبل الإرسال — التقرير بلا توصيات لا يقدّم للشركة شيئاً."
                        />
                    </div>

                    <Button
                        type="button"
                        tone="soft"
                        icon={Plus}
                        disabled={form.data.recommendations.length >= 20}
                        onClick={() =>
                            form.setData('recommendations', [
                                ...form.data.recommendations,
                                { cause: '', action: '', community_id: '' },
                            ])
                        }
                    >
                        توصية أخرى
                    </Button>

                    <div>
                        <label
                            htmlFor="report-note"
                            className="mb-1.5 block text-[11px] font-bold text-ink"
                        >
                            ملاحظة على التقرير — واحدة اختيارية
                        </label>
                        <textarea
                            id="report-note"
                            rows={3}
                            className={INPUT}
                            value={form.data.note}
                            onChange={(event) =>
                                form.setData('note', event.target.value)
                            }
                        />
                        {form.errors.note && (
                            <p className="mt-1 text-[11px] text-danger">
                                {form.errors.note}
                            </p>
                        )}
                    </div>

                    <Note tone="warning" title="الحفظ يُرسل التقرير">
                        حفظ التوصيات يختم التقرير كـ«مُرسَل» ويسجّل وقت الإرسال.
                        أكمل توصياتك قبل الحفظ.
                    </Note>
                </FormSection>

                <FormActions cancelHref="/coordinator/reports">
                    <Button
                        type="submit"
                        disabled={form.processing || !complete}
                    >
                        حفظ وإرسال التقرير
                    </Button>
                </FormActions>
            </form>

            {/* ── لقطة القياس ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-extrabold text-ink">
                        لقطة القياس
                    </h2>
                    <span className="font-mono text-[10px] text-ink/45">
                        وُلِّدت{' '}
                        {report.generated_at
                            ? new Date(report.generated_at).toLocaleString(
                                  'ar-SA',
                              )
                            : '—'}
                    </span>
                </div>

                <TableShell>
                    <Thead>
                        <Th>المؤشر</Th>
                        <Th>القيمة</Th>
                        <Th>الصيغة</Th>
                    </Thead>
                    <Tbody>
                        {[
                            snapshot.activation_rate,
                            snapshot.attendance_rate,
                            snapshot.cancellation_rate,
                        ].map((kpi) => (
                            <Tr key={kpi.key}>
                                <Td className="font-extrabold text-ink">
                                    {kpi.label}
                                </Td>
                                <Td className="font-mono font-black whitespace-nowrap text-ink">
                                    {kpi.rate}٪
                                    <span className="block text-[10px] font-normal text-ink/50">
                                        {kpi.numerator} / {kpi.denominator}
                                    </span>
                                </Td>
                                <Td className="max-w-md text-[11px] text-ink/60">
                                    {kpi.formula}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </TableShell>

                <Note title="اللقطة لا تُعدَّل">
                    قيم هذا التقرير قيست وقت توليده وحُفظت كما هي. تغيّر
                    البيانات لاحقاً لا يعيد كتابة تقرير سُلّم للشركة.
                </Note>
            </Card>

            {/* ── التصدير ── */}
            {exports.length > 0 && (
                <Card padding="p-4" className="space-y-3">
                    <h2 className="text-sm font-extrabold text-ink">التصدير</h2>
                    <div className="flex flex-wrap gap-2">
                        {exports.map((row) => (
                            <a
                                key={row.key}
                                href={`/coordinator/reports/${report.id}/export/${row.key}?format=xlsx`}
                                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-bold text-lime transition-opacity hover:opacity-90"
                            >
                                <Download
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                {row.title}
                            </a>
                        ))}
                    </div>
                </Card>
            )}

            <ConfirmModal
                open={saving}
                title="حفظ وإرسال التقرير"
                message="تُحفظ التوصيات ويُختم التقرير كـ«مُرسَل» بوقت الإرسال. راجع توصياتك — بعد الإرسال يدخل التقرير مسار التسليم للشركة."
                details={
                    <>
                        <ConfirmRow
                            label="الشركة"
                            value={report.company_name}
                            strong
                        />
                        <ConfirmRow label="الدورة" value={report.period_key} />
                        <ConfirmRow
                            label="عدد التوصيات"
                            value={`${form.data.recommendations.length}`}
                            strong
                        />
                        <ConfirmRow
                            label="ملاحظة"
                            value={
                                form.data.note.trim() ? 'مرفقة' : 'بلا ملاحظة'
                            }
                        />
                    </>
                }
                confirmLabel="نعم، احفظ وأرسل"
                onConfirm={() => {
                    form.post(
                        `/coordinator/reports/${report.id}/recommendations`,
                        { preserveScroll: true },
                    );
                    setSaving(false);
                }}
                onCancel={() => setSaving(false)}
            />
        </AdminLayout>
    );
}

/** فرق عن الشهر السابق — بالقيمتين، لأن «+4» وحدها لا تقول من أين. */
function DeltaCard({
    label,
    delta,
    suffix = '',
    goodWhenDown = false,
}: {
    label: string;
    delta: Delta;
    suffix?: string;
    goodWhenDown?: boolean;
}) {
    const up = delta.change > 0;
    const flat = delta.change === 0;
    const good = flat ? null : goodWhenDown ? !up : up;
    const Icon = up ? TrendingUp : TrendingDown;

    return (
        <Card padding="p-4" className="space-y-2">
            <span className="block text-[11px] text-ink/55">{label}</span>

            <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-black text-ink">
                    {delta.current}
                    {suffix}
                </span>
                {!flat && (
                    <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${good ? 'text-success' : 'text-danger'}`}
                        dir="ltr"
                    >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {delta.change > 0 ? '+' : ''}
                        {delta.change}
                        {suffix}
                    </span>
                )}
            </div>

            <span className="block font-mono text-[11px] text-ink/45">
                الشهر السابق: {delta.previous}
                {suffix}
            </span>
        </Card>
    );
}
