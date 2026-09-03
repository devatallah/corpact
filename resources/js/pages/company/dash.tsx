import { Head, Link } from '@inertiajs/react';
import { Activity, TrendingUp, UsersRound, Wallet } from 'lucide-react';
import { ListStates } from '@/components/list-states';
import {
    Badge,
    Card,
    Note,
    PageHeader,
    StatCard,
    Tbody,
    Td,
    Th,
    Thead,
    TableShell,
    Tr,
} from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';

/**
 * H §15 — لوحة مسؤول الحساب.
 *
 * Two KPIs carry the whole story and both are *ratios with their formula
 * printed*: activation (did people show up at all) and attendance (did the
 * seats they booked get used). A rate with no denominator is a vanity number,
 * so the numerator and denominator are shown next to every percentage.
 *
 * Spend is deliberately its own field and never called revenue.
 *
 * «إجمالي الأرصدة» here is the sum of the main wallet *and* every community
 * wallet, which is why it is larger than the figure on /company/wallet — that
 * screen shows only what is still undistributed. Two different questions, so
 * two different labels.
 */
type Kpi = {
    key: string;
    label: string;
    numerator: number;
    denominator: number;
    rate: number;
    formula: string;
};

type CommunityRow = {
    id: number;
    name: string;
    members_count?: number;
    events_count?: number;
    last_event_at?: string | null;
    category_name?: string | null;
};

export default function CompanyDash({
    stats,
    communityActivity,
    departmentParticipation,
    recentActivity,
    leaderboard,
}: {
    company: { id: number; name: string };
    stats: {
        period: { key: string; label: string };
        activation: Kpi;
        attendance: Kpi;
        active_communities: number;
        dormant_communities: number;
        completed_events: number;
        attendance_count: number;
        cost_per_participation: string;
        company_spend: string;
        wallet_balance: string;
        active_employees: number;
    };
    communityActivity: {
        window_days: number;
        active: CommunityRow[];
        dormant: CommunityRow[];
    };
    departmentParticipation: {
        department_id: number | null;
        department_name: string;
        attendees: number;
        employees: number;
        rate: number;
    }[];
    recentActivity: {
        id: number;
        description: string | null;
        created_at: string | null;
        actor_name?: string | null;
    }[];
    leaderboard: {
        top_employees: {
            employee_id: number;
            name: string | null;
            events_count: number;
        }[];
    };
}) {
    return (
        <CompanyLayout>
            <Head title="لوحة التحكم" />

            <PageHeader
                icon={Activity}
                title="لوحة القيادة"
                subtitle={`مؤشرات الدورة الحالية — ${stats.period.label}`}
            />

            {/* ── المؤشران الأساسيان، بصيغتهما ── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <RateCard kpi={stats.activation} />
                <RateCard kpi={stats.attendance} />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="فعاليات مكتملة"
                    value={stats.completed_events}
                    hint="في الدورة الحالية"
                />
                <StatCard
                    label="مشاركات موثّقة"
                    value={stats.attendance_count}
                    hint="حضور مسجَّل"
                />
                <StatCard
                    label="الموظفون النشطون"
                    value={stats.active_employees}
                />
                <StatCard
                    label="رصيد المحفظة"
                    value={stats.wallet_balance}
                    hint="ريال"
                    tone="success"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <StatCard
                    label="إنفاق الشركة"
                    value={stats.company_spend}
                    hint="ريال في الدورة"
                />
                <StatCard
                    label="تكلفة المشاركة الواحدة"
                    value={stats.cost_per_participation}
                    hint="الإنفاق ÷ عدد المشاركات الموثّقة"
                />
            </div>

            {/* ── المجتمعات: نشطة وخاملة ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card padding="p-0" className="overflow-hidden">
                    <div className="flex items-center justify-between border-b-[0.5px] border-ink/10 p-4">
                        <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink">
                            <UsersRound
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                            مجتمعات نشطة
                        </h2>
                        <Badge tone="success">{stats.active_communities}</Badge>
                    </div>
                    <div className="divide-y-[0.5px] divide-ink/10">
                        {communityActivity.active.map((community) => (
                            <div
                                key={community.id}
                                className="flex items-center justify-between gap-2 p-3.5"
                            >
                                <span className="truncate text-xs font-extrabold text-ink">
                                    {community.name}
                                </span>
                                <span className="shrink-0 font-mono text-[11px] text-ink/60">
                                    {community.events_count ?? 0} فعالية
                                </span>
                            </div>
                        ))}
                        <ListStates
                            count={communityActivity.active.length}
                            empty="لا مجتمعات نشطة في هذه المدة."
                        />
                    </div>
                </Card>

                <Card padding="p-0" className="overflow-hidden">
                    <div className="flex items-center justify-between border-b-[0.5px] border-ink/10 p-4">
                        <h2 className="text-sm font-extrabold text-ink">
                            مجتمعات خاملة
                        </h2>
                        <Badge
                            tone={
                                stats.dormant_communities > 0
                                    ? 'warning'
                                    : 'success'
                            }
                        >
                            {stats.dormant_communities}
                        </Badge>
                    </div>
                    <div className="divide-y-[0.5px] divide-ink/10">
                        {communityActivity.dormant.map((community) => (
                            <div
                                key={community.id}
                                className="flex items-center justify-between gap-2 p-3.5"
                            >
                                <span className="truncate text-xs font-extrabold text-ink">
                                    {community.name}
                                </span>
                                <Link
                                    href={`/company/communities/${community.id}/edit`}
                                    className="shrink-0 text-[11px] font-bold text-ink hover:underline"
                                >
                                    راجعه ←
                                </Link>
                            </div>
                        ))}
                        <ListStates
                            count={communityActivity.dormant.length}
                            empty="لا مجتمعات خاملة."
                            emptyHint={`كل المجتمعات أقامت فعالية خلال ${communityActivity.window_days} يوماً.`}
                        />
                    </div>
                </Card>
            </div>

            {/* ── المشاركة حسب الإدارة ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-ink">
                        المشاركة حسب الإدارة
                    </h2>
                    <span className="text-[11px] text-ink/50">
                        بالإسناد وقت الحدث
                    </span>
                </div>

                <TableShell>
                    <Thead>
                        <Th>الإدارة</Th>
                        <Th>الموظفون</Th>
                        <Th>شاركوا</Th>
                        <Th>النسبة</Th>
                    </Thead>
                    <Tbody>
                        {departmentParticipation.map((row) => (
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
                                <Td>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-1.5 max-w-[120px] flex-1 overflow-hidden rounded-full bg-ink/10"
                                            dir="ltr"
                                        >
                                            <div
                                                className="h-full rounded-full bg-lime"
                                                style={{
                                                    width: `${Math.min(row.rate, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="font-mono text-[11px] text-ink/60">
                                            {row.rate}٪
                                        </span>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={departmentParticipation.length}
                            colSpan={4}
                            empty="لا بيانات مشاركة بعد."
                        />
                    </Tbody>
                </TableShell>

                <Note title="لماذا «بالإسناد وقت الحدث»؟">
                    نقل موظف بين الإدارات لا يعيد كتابة تاريخه: مشاركاته تبقى
                    منسوبة للإدارة التي كان فيها يوم الفعالية، فلا تتضخّم أرقام
                    إدارة على حساب أخرى بمجرد إعادة هيكلة.
                </Note>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* ── الأكثر نشاطاً ── */}
                <Card padding="p-0" className="overflow-hidden">
                    <div className="flex items-center justify-between border-b-[0.5px] border-ink/10 p-4">
                        <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink">
                            <TrendingUp
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                            الأكثر نشاطاً
                        </h2>
                        <span className="text-[11px] text-ink/50">
                            هذا الشهر
                        </span>
                    </div>
                    <div className="divide-y-[0.5px] divide-ink/10">
                        {leaderboard.top_employees
                            .slice(0, 5)
                            .map((row, index) => (
                                <div
                                    key={row.employee_id}
                                    className="flex items-center gap-3 p-3"
                                >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-black text-lime">
                                        {index + 1}
                                    </span>
                                    <span className="flex-1 truncate text-xs font-bold text-ink">
                                        {row.name ?? '—'}
                                    </span>
                                    <span className="font-mono text-[11px] text-ink/60">
                                        {row.events_count} فعالية
                                    </span>
                                </div>
                            ))}
                        <ListStates
                            count={leaderboard.top_employees.length}
                            empty="لا مشاركات موثّقة بعد."
                        />
                    </div>
                </Card>

                {/* ── آخر النشاط ── */}
                <Card padding="p-0" className="overflow-hidden">
                    <div className="flex items-center justify-between border-b-[0.5px] border-ink/10 p-4">
                        <h2 className="text-sm font-extrabold text-ink">
                            آخر النشاط
                        </h2>
                        <Link
                            href="/company/audit"
                            className="text-[11px] font-bold text-ink/70 hover:text-ink"
                        >
                            سجل التدقيق ←
                        </Link>
                    </div>
                    <div className="divide-y-[0.5px] divide-ink/10">
                        {recentActivity.slice(0, 6).map((log) => (
                            <div key={log.id} className="p-3">
                                <p className="text-[11px] leading-relaxed text-ink/80">
                                    {log.description ?? '—'}
                                </p>
                                <span className="font-mono text-[10px] text-ink/45">
                                    {log.created_at
                                        ? new Date(
                                              log.created_at,
                                          ).toLocaleString('ar-SA')
                                        : '—'}
                                </span>
                            </div>
                        ))}
                        <ListStates
                            count={recentActivity.length}
                            empty="لا نشاط مسجّل بعد."
                        />
                    </div>
                </Card>
            </div>

            <Card
                padding="p-4"
                className="flex items-center justify-between gap-3"
            >
                <div className="flex min-w-0 items-center gap-2">
                    <Wallet
                        className="h-4 w-4 shrink-0 text-ink"
                        aria-hidden="true"
                    />
                    <span className="text-xs text-ink/70">
                        رصيد محفظتك الحالي{' '}
                        <span className="font-mono font-black text-ink">
                            {stats.wallet_balance}
                        </span>{' '}
                        ر.س
                    </span>
                </div>
                <Link
                    href="/company/wallet"
                    className="shrink-0 text-xs font-bold text-ink hover:underline"
                >
                    إدارة المحفظة ←
                </Link>
            </Card>
        </CompanyLayout>
    );
}

/** A ratio with its own numerator, denominator and formula — never a bare percentage. */
function RateCard({ kpi }: { kpi: Kpi }) {
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
                    className="h-full rounded-full bg-lime"
                    style={{ width: `${Math.min(kpi.rate, 100)}%` }}
                />
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] text-ink/60">
                <span>
                    {kpi.numerator} من {kpi.denominator}
                </span>
            </div>

            <p className="border-t-[0.5px] border-ink/10 pt-2 text-[11px] leading-relaxed text-ink/55">
                {kpi.formula}
            </p>
        </Card>
    );
}
