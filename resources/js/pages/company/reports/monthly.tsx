import { Head } from '@inertiajs/react';
import { FileText, TrendingDown, TrendingUp } from 'lucide-react';
import { BackLink, ListStates } from '@/components/list-states';
import {
    Badge,
    Card,
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
import CompanyLayout from '@/layouts/company-layout';

/**
 * H §15 — التقرير الشهري من المنسّق المُدار.
 *
 * The point of this screen is the month-over-month column: a rate on its own
 * says nothing about whether the programme is working. Every delta shows its
 * previous value too, so "‎+4" is readable as 12→16 rather than as a mood.
 *
 * The recommendations are the coordinator's actual output — a cause paired
 * with an action, per community. They are the reason the report exists.
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

type Snapshot = {
    generated_for: {
        company_id: number;
        company_name: string;
        coordinator_service: boolean;
    };
    period: { key: string; label: string };
    previous_period: { key: string; label: string };
    completed_events: number;
    created_events: number;
    activation_rate: Kpi;
    attendance_rate: Kpi;
    cancellation_rate: Kpi;
    cancellation_reasons: { status: string; label: string; count: number }[];
    communities: { window_days: number; metric: Kpi };
    department_participation: {
        department_id: number | null;
        department_name: string;
        attendees: number;
        employees: number;
        rate: number;
    }[];
    attendance_count: number;
    company_spend: string;
    cost_per_participation: string;
    gmv: string;
    month_over_month: {
        activation_rate: Delta;
        attendance_rate: Delta;
        cancellation_rate: Delta;
        completed_events: Delta;
        active_communities: Delta;
        cost_per_participation_halalas: Delta;
    };
};

export default function CompanyMonthlyReport({
    report,
}: {
    company: { id: number; name: string };
    report: {
        id: number;
        period_key: string;
        status: string;
        note: string | null;
        generated_at: string | null;
        delivered_at: string | null;
        submitted_at: string | null;
        snapshot: Snapshot;
        recommendations: {
            id: number;
            community_id: number | null;
            community_name: string | null;
            cause: string;
            cause_label: string;
            action: string;
            action_label: string;
        }[];
    };
}) {
    const snapshot = report.snapshot;
    const mom = snapshot.month_over_month;

    return (
        <CompanyLayout>
            <Head title={`التقرير الشهري ${report.period_key}`} />

            <BackLink href="/company/reports" label="العودة إلى التقارير" />

            <PageHeader
                icon={FileText}
                title={`التقرير الشهري — ${snapshot.period.label}`}
                subtitle={`مقارنةً بـ${snapshot.previous_period.label} · سُلّم في ${
                    report.delivered_at
                        ? new Date(report.delivered_at).toLocaleDateString(
                              'ar-SA',
                          )
                        : '—'
                }`}
            />

            {report.note && <Note title="ملاحظة المنسّق">{report.note}</Note>}

            {/* ── المقارنة بالشهر السابق ── */}
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <DeltaCard
                    label="فعاليات مكتملة"
                    delta={mom.completed_events}
                />
                <DeltaCard
                    label="مجتمعات نشطة"
                    delta={mom.active_communities}
                />
                <DeltaCard
                    label="تكلفة المشاركة (هللة)"
                    delta={mom.cost_per_participation_halalas}
                    goodWhenDown
                />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="مشاركات موثّقة"
                    value={snapshot.attendance_count}
                />
                <StatCard
                    label="فعاليات أُنشئت"
                    value={snapshot.created_events}
                />
                <StatCard
                    label="إنفاق الشركة"
                    value={snapshot.company_spend}
                    hint="ريال"
                />
                <StatCard
                    label="تكلفة المشاركة"
                    value={snapshot.cost_per_participation}
                    hint="ريال"
                />
            </div>

            {/* ── التوصيات ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">
                    توصيات المنسّق
                </h2>

                <TableShell>
                    <Thead>
                        <Th>المجتمع</Th>
                        <Th>السبب المرصود</Th>
                        <Th>الإجراء المقترح</Th>
                    </Thead>
                    <Tbody>
                        {report.recommendations.map((recommendation) => (
                            <Tr key={recommendation.id}>
                                <Td className="font-extrabold text-ink">
                                    {recommendation.community_name ??
                                        'على مستوى الشركة'}
                                </Td>
                                <Td className="text-ink/85">
                                    {recommendation.cause_label}
                                </Td>
                                <Td>
                                    <Badge tone="lime">
                                        {recommendation.action_label}
                                    </Badge>
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={report.recommendations.length}
                            colSpan={3}
                            empty="لا توصيات في هذه الدورة."
                            emptyHint="لم يرصد المنسّق ما يستدعي تدخلاً هذا الشهر."
                        />
                    </Tbody>
                </TableShell>
            </Card>

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
                        <p className="text-xs text-ink/55">
                            لا إلغاءات في هذه الدورة.
                        </p>
                    )}
                </div>
            </Card>

            {/* ── المشاركة حسب الإدارة ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">
                    المشاركة حسب الإدارة
                </h2>
                <TableShell>
                    <Thead>
                        <Th>الإدارة</Th>
                        <Th>الموظفون</Th>
                        <Th>شاركوا</Th>
                        <Th>النسبة</Th>
                    </Thead>
                    <Tbody>
                        {snapshot.department_participation.map((row) => (
                            <Tr key={row.department_id ?? 'none'}>
                                <Td className="font-extrabold text-ink">
                                    {row.department_name}
                                </Td>
                                <Td className="font-mono text-ink/70">
                                    {row.employees}
                                </Td>
                                <Td className="font-mono font-bold text-ink">
                                    {row.attendees}
                                </Td>
                                <Td className="font-mono text-ink/70">
                                    {row.rate}٪
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={snapshot.department_participation.length}
                            colSpan={4}
                            empty="لا بيانات مشاركة."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            <Note title="معادلات هذا التقرير">
                معدل التفعيل: {snapshot.activation_rate.formula} — معدل الحضور:{' '}
                {snapshot.attendance_rate.formula}
            </Note>
        </CompanyLayout>
    );
}

/** فرق عن الشهر السابق — يعرض القيمتين، لأن «+4» وحدها لا تقول من أين. */
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
