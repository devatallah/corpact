import { Head } from '@inertiajs/react';
import { ChartColumn } from 'lucide-react';
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
import PartnerLayout from '@/layouts/partner-layout';

/**
 * H §11 — تقارير المزوّد.
 *
 * The heatmap is the part worth acting on: it shows when demand actually
 * lands, so the provider can price the quiet slots differently instead of
 * guessing. Its own insight line names the quietest slots outright.
 *
 * Every riyal figure here is what the company was billed, before Teamat's
 * commission — the amount actually transferred is on the settlements screen.
 */
export default function PartnerReports({
    overview,
    monthlyRevenue,
    topCompanies,
    demandHeatmap,
}: {
    partner: { id: number; name: string; trade_name?: string | null };
    overview: {
        bookings: number;
        revenue: number;
        companies: number;
        avg_booking: number;
        bookings_change_pct: number;
        revenue_change_pct: number;
    };
    monthlyRevenue: { month: string; amount: number; is_current: boolean }[];
    topCompanies: {
        company_name: string;
        bookings: number;
        revenue: number;
        last_booking: string | null;
    }[];
    demandHeatmap: {
        heatmap: {
            slot: string;
            label: string;
            days: Record<string, { count: number; intensity: string }>;
        }[];
        insight: string;
    };
}) {
    const maxMonth = Math.max(...monthlyRevenue.map((row) => row.amount), 1);
    const dayNames = Object.keys(demandHeatmap.heatmap[0]?.days ?? {});

    return (
        <PartnerLayout>
            <Head title="التقارير" />

            <PageHeader
                icon={ChartColumn}
                title="التقارير"
                subtitle="طلبك ومواسمك وأكثر الشركات تعاملاً معك."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="حجوزات الشهر"
                    value={overview.bookings}
                    hint={changeHint(overview.bookings_change_pct)}
                    tone={
                        overview.bookings_change_pct >= 0
                            ? 'success'
                            : undefined
                    }
                />
                <StatCard
                    label="قيمة الحجوزات"
                    value={overview.revenue.toFixed(2)}
                    hint={`ريال — ${changeHint(overview.revenue_change_pct)}`}
                />
                <StatCard label="شركات تعاملت معك" value={overview.companies} />
                <StatCard
                    label="متوسط قيمة الحجز"
                    value={overview.avg_booking.toFixed(2)}
                    hint="ريال"
                />
            </div>

            {/* ── ستة أشهر ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">
                    آخر ستة أشهر
                </h2>

                <div className="space-y-2">
                    {monthlyRevenue.map((row) => (
                        <div
                            key={row.month}
                            className="flex items-center gap-3"
                        >
                            <span
                                className={`w-14 shrink-0 text-[11px] ${row.is_current ? 'font-black text-ink' : 'text-ink/60'}`}
                            >
                                {row.month}
                            </span>
                            <div
                                className="h-4 flex-1 overflow-hidden rounded-full bg-ink/8"
                                dir="ltr"
                            >
                                <div
                                    className={`h-full rounded-full ${row.is_current ? 'bg-ink' : 'bg-lime'}`}
                                    style={{
                                        width: `${Math.max((row.amount / maxMonth) * 100, row.amount > 0 ? 3 : 0)}%`,
                                    }}
                                />
                            </div>
                            <span className="w-24 shrink-0 text-end font-mono text-[11px] font-bold text-ink">
                                {row.amount.toFixed(2)}
                            </span>
                        </div>
                    ))}
                    <ListStates
                        count={monthlyRevenue.length}
                        empty="لا بيانات بعد."
                    />
                </div>
            </Card>

            {/* ── خريطة الطلب ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-extrabold text-ink">
                        خريطة الطلب
                    </h2>
                    <span className="text-[11px] font-bold text-ink/70">
                        {demandHeatmap.insight}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] border-separate border-spacing-1">
                        <thead>
                            <tr>
                                <th className="w-12" />
                                {dayNames.map((day) => (
                                    <th
                                        key={day}
                                        className="pb-1 text-[10px] font-bold text-ink/60"
                                    >
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {demandHeatmap.heatmap.map((row) => (
                                <tr key={row.slot}>
                                    <th className="pe-2 text-start text-[11px] font-extrabold text-ink">
                                        {row.label}
                                    </th>
                                    {dayNames.map((day) => {
                                        const cell = row.days[day];

                                        return (
                                            <td key={day} className="p-0">
                                                <div
                                                    className={`flex h-9 items-center justify-center rounded-lg font-mono text-[11px] font-bold ${INTENSITY[cell?.intensity ?? 'low']}`}
                                                    title={`${day} ${row.label}: ${cell?.count ?? 0} حجزاً`}
                                                >
                                                    {cell?.count ?? 0}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Note title="ماذا تفعل بهذه الخريطة؟">
                    الفتحات الباهتة أوقات وحداتك فيها فارغة. تسعير أقلّ لها، أو
                    إتاحتها لباقات أطول، يملأ ساعات لا تدرّ شيئاً الآن.
                </Note>
            </Card>

            {/* ── أكثر الشركات ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">
                    أكثر الشركات تعاملاً معك
                </h2>

                <TableShell>
                    <Thead>
                        <Th>الشركة</Th>
                        <Th>الحجوزات</Th>
                        <Th>القيمة</Th>
                        <Th>آخر حجز</Th>
                    </Thead>
                    <Tbody>
                        {topCompanies.map((row) => (
                            <Tr key={row.company_name}>
                                <Td className="font-extrabold text-ink">
                                    {row.company_name}
                                </Td>
                                <Td className="font-mono font-bold text-ink">
                                    {row.bookings}
                                </Td>
                                <Td className="font-mono text-ink/80">
                                    {row.revenue.toFixed(2)}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {row.last_booking
                                        ? new Date(
                                              row.last_booking,
                                          ).toLocaleDateString('ar-SA')
                                        : '—'}
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={topCompanies.length}
                            colSpan={4}
                            empty="لا حجوزات بعد."
                            emptyHint="تظهر الشركات هنا بعد أول حجز مؤكد."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            <Note title="هذه الأرقام قبل العمولة">
                ما تراه هنا هو ما فُوترت به الشركة. المبلغ الذي يصلك فعلاً — بعد
                عمولة تيمات — تجده في كشوف التسوية.
            </Note>
        </PartnerLayout>
    );
}

const INTENSITY: Record<string, string> = {
    low: 'bg-ink/5 text-ink/40',
    medium: 'bg-lime/40 text-ink',
    high: 'bg-lime text-ink',
};

function changeHint(pct: number) {
    if (pct === 0) {
        return 'كالشهر الماضي';
    }

    return `${pct > 0 ? '+' : ''}${pct}٪ عن الشهر الماضي`;
}
