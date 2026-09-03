import { Head, Link, router } from '@inertiajs/react';
import { ChartColumn, Download, FileText } from 'lucide-react';
import {
    Pagination,
    ResultCount,
    SortableHeader,
} from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import {
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
import { eventStatus } from '@/lib/status';
import type { Paginated, SortState } from '@/types';

/**
 * H §15 — تقارير مسؤول الحساب.
 *
 * Every figure here comes from the KPI dictionary, and each one is shown with
 * its own formula. That is the whole design: the same word ("participation",
 * "attendance") means one thing platform-wide, and the reader can check the
 * definition without leaving the page.
 *
 * Spend and GMV are deliberately separate cards with separate names — GMV is
 * money collected on providers' behalf, not company money and not revenue.
 */
type Kpi = {
    key: string;
    label: string;
    numerator: number;
    denominator: number;
    rate: number;
    formula: string;
};

type Snapshot = {
    period: { key: string; label: string };
    activation_rate: Kpi;
    attendance_rate: Kpi;
    cancellation_rate: Kpi;
    cancellation_reasons: Record<string, number>;
    department_participation: {
        department_id: number | null;
        department_name: string;
        attendees: number;
        employees: number;
        rate: number;
    }[];
    communities: {
        window_days: number;
        as_of: string;
        active: unknown[];
        dormant: unknown[];
        metric: Kpi;
    };
    completed_events: number;
    created_events: number;
    attendance_count: number;
    company_spend: string;
    gmv: string;
    cost_per_participation: string;
};

export default function CompanyReports({
    company,
    period,
    periodOptions,
    kpi,
    exports,
    monthlyReports,
    monthlySort,
}: {
    company: { id: number; name: string };
    period: { key: string; label: string };
    periodOptions: { key: string; label: string }[];
    kpi: Snapshot;
    exports: { key: string; title: string }[];
    monthlyReports: Paginated<{
        id: number;
        period_key: string;
        delivered_at: string | null;
        activation_rate: number;
        completed_events: number;
        recommendations_count: number;
    }>;
    monthlySort: SortState;
    unreadNotifications: number;
}) {
    return (
        <CompanyLayout>
            <Head title="التقارير" />

            <PageHeader
                icon={ChartColumn}
                title="تقارير الأداء والمؤشرات التحليلية"
                badge={`خاص بـ${company.name}`}
                subtitle="مؤشرات التفعيل، ونسبة الحضور، والتكلفة لكل مشاركة، وتحليل الإدارات — كل رقم بصيغته."
                actions={
                    <select
                        aria-label="الدورة"
                        className="rounded-full border-[0.5px] border-ink/20 bg-surface px-3 py-2 text-xs font-bold text-ink"
                        value={period.key}
                        onChange={(event) =>
                            router.get(
                                '/company/reports',
                                { period: event.target.value },
                                { preserveState: true, replace: true },
                            )
                        }
                    >
                        {periodOptions.map((option) => (
                            <option key={option.key} value={option.key}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                }
            />

            {/* ── المؤشرات بصيغتها ── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <RateCard kpi={kpi.activation_rate} />
                <RateCard kpi={kpi.attendance_rate} />
                <RateCard kpi={kpi.cancellation_rate} invert />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="فعاليات مكتملة" value={kpi.completed_events} />
                <StatCard label="فعاليات أُنشئت" value={kpi.created_events} />
                <StatCard label="مشاركات موثّقة" value={kpi.attendance_count} />
                <StatCard
                    label="تكلفة المشاركة"
                    value={kpi.cost_per_participation}
                    hint="ريال"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <StatCard
                    label="إنفاق شركتك"
                    value={kpi.company_spend}
                    hint="ريال — ما صُرف فعلاً من محافظك"
                />
                <StatCard
                    label="حجم التداول (GMV)"
                    value={kpi.gmv}
                    hint="ريال — قيمة النشاط، ليست إنفاقك ولا إيراد تيمات"
                />
            </div>

            {/* ── أسباب الإلغاء ── */}
            <Card padding="p-4" className="space-y-3">
                <h2 className="text-sm font-extrabold text-ink">
                    أسباب الإلغاء
                </h2>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(kpi.cancellation_reasons).map(
                        ([status, count]) => (
                            <span
                                key={status}
                                className="inline-flex items-center gap-2 rounded-full border-[0.5px] border-ink/12 bg-ink/5 px-3 py-1.5 text-[11px] font-bold"
                            >
                                {eventStatus(status).label}
                                <span className="font-mono font-black text-ink">
                                    {count}
                                </span>
                            </span>
                        ),
                    )}
                </div>
                <p className="text-[11px] leading-relaxed text-ink/55">
                    «ألغاها المزوّد» و«ألغتها الشركة» يُحسبان منفصلين لأن أثرهما
                    على الاسترداد مختلف — الأول يعيد المبلغ كاملاً للمحفظة.
                </p>
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
                        {kpi.department_participation.map((row) => (
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
                            count={kpi.department_participation.length}
                            colSpan={4}
                            empty="لا بيانات مشاركة في هذه الدورة."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            {/* ── التصدير ── */}
            <Card padding="p-4" className="space-y-3">
                <h2 className="text-sm font-extrabold text-ink">التصدير</h2>
                <div className="flex flex-wrap gap-2">
                    {exports.map((row) => (
                        <div
                            key={row.key}
                            className="inline-flex items-center gap-1.5"
                        >
                            <a
                                href={`/company/reports/export/${row.key}?format=xlsx&period=${period.key}`}
                                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-bold text-lime transition-opacity hover:opacity-90"
                            >
                                <Download
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                {row.title} — Excel
                            </a>
                            <a
                                href={`/company/reports/export/${row.key}?format=pdf&period=${period.key}`}
                                className="inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-ink/12 bg-ink/5 px-3 py-2 text-xs font-bold text-ink transition-colors hover:bg-ink/10"
                            >
                                PDF
                            </a>
                        </div>
                    ))}
                    {exports.length === 0 && (
                        <p className="text-xs text-ink/55">
                            لا تصديرات متاحة لدورك.
                        </p>
                    )}
                </div>
                <Note title="كل تنزيل مسجَّل">
                    التصدير يحمل بيانات موظفيك، فيُقيَّد في سجل التدقيق باسمك
                    ووقته ونطاقه — هذا يحميك أنت أيضاً عند أي مساءلة.
                </Note>
            </Card>

            {/* ── تقارير المنسّق الشهرية ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-ink" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">
                        التقارير الشهرية المُسلَّمة
                    </h2>
                </div>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="الدورة"
                                sortKey="period_key"
                                sort={monthlySort}
                            />
                        </Th>
                        <Th>معدل التفعيل</Th>
                        <Th>فعاليات مكتملة</Th>
                        <Th>توصيات</Th>
                        <Th>
                            <SortableHeader
                                label="سُلّم في"
                                sortKey="delivered_at"
                                sort={monthlySort}
                            />
                        </Th>
                    </Thead>
                    <Tbody>
                        {monthlyReports.data.map((report) => (
                            <Tr key={report.id}>
                                <Td>
                                    <Link
                                        href={`/company/reports/monthly/${report.id}`}
                                        className="font-extrabold text-ink hover:underline"
                                    >
                                        {report.period_key}
                                    </Link>
                                </Td>
                                <Td className="font-mono font-bold text-ink">
                                    {report.activation_rate}٪
                                </Td>
                                <Td className="font-mono text-ink/80">
                                    {report.completed_events}
                                </Td>
                                <Td className="font-mono text-ink/80">
                                    {report.recommendations_count}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {report.delivered_at
                                        ? new Date(
                                              report.delivered_at,
                                          ).toLocaleDateString('ar-SA')
                                        : '—'}
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={monthlyReports.data.length}
                            colSpan={5}
                            empty="لا تقارير شهرية مُسلَّمة."
                            emptyHint="التقرير الشهري خدمة المنسّق المُدار — يظهر هنا بعد تسليمه، لا قبله."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={monthlyReports} />
                    <Pagination page={monthlyReports} />
                </div>
            </Card>
        </CompanyLayout>
    );
}

/** المؤشر ومعادلته — نسبة بلا مقام رقمٌ للزينة. */
function RateCard({ kpi, invert = false }: { kpi: Kpi; invert?: boolean }) {
    const bar = invert ? 'bg-danger' : 'bg-lime';

    return (
        <Card padding="p-5" className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-extrabold text-ink">
                    {kpi.label}
                </span>
                <span className="font-mono text-3xl font-black text-ink">
                    {kpi.rate}٪
                </span>
            </div>

            <div
                className="h-2 w-full overflow-hidden rounded-full bg-ink/10"
                dir="ltr"
            >
                <div
                    className={`h-full ${bar} rounded-full`}
                    style={{ width: `${Math.min(kpi.rate, 100)}%` }}
                />
            </div>

            <span className="block font-mono text-[11px] text-ink/60">
                {kpi.numerator} من {kpi.denominator}
            </span>

            <p className="border-t-[0.5px] border-ink/10 pt-2 text-[11px] leading-relaxed text-ink/55">
                {kpi.formula}
            </p>
        </Card>
    );
}
