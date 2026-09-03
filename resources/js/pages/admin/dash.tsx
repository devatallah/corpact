import { Head, Link } from '@inertiajs/react';
import { Activity, AlertTriangle, Building2, CircleCheckBig, Clock, TrendingUp, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { ListStates } from '@/components/list-states';
import { Badge, Card, CardTitle, Money, PageHeader, StatCard } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * H §20 — لوحة التشغيل المركزية. Not a vanity board: every card here answers
 * «هل المحرّك يعمل؟» — the ledger reconciles, the scheduled jobs ran, and the
 * ghost-event indicators are inside their bands.
 *
 * The numbers are permission-gated on the server, not hidden here: an account
 * without `revenue.view` is never sent the revenue props at all.
 */
type Stats = { total: number; pending: number; review: number; active: number; rejected: number };

type GhostWatch = {
    completed_events: number;
    post_completion_edited_events: number;
    post_completion_edit_rate: number;
    events_created: number;
    manual_state_change_events: number;
    manual_state_change_rate: number;
    locked_without_review: number;
    locked_without_review_rate: number;
};

type JobHealth = {
    jobs: { job: string; cadence_minutes: number; last_run_at: string | null; late: boolean }[];
    late_count: number;
};

export default function AdminDash({
    companyStats,
    partnerStats,
    totalEmployees,
    companiesThisMonth,
    partnersThisMonth,
    employeesThisMonth,
    pendingRequests,
    pendingCompanies,
    pendingPartners,
    recentRequests,
    topCompanies,
    canViewRevenue,
    canMonitorOps,
    ghostEventWatch,
    jobHealth,
    walletReconciliation,
    gatewayHealth,
    monthlyRevenue,
    revenueGrowth,
    last6Months,
    maxRevenue,
}: {
    companyStats: Stats;
    partnerStats: Stats;
    totalEmployees: number;
    companiesThisMonth: number;
    partnersThisMonth: number;
    employeesThisMonth: number;
    pendingRequests: number;
    pendingCompanies: number;
    pendingPartners: number;
    recentRequests: { name: string; type: string; type_label: string; status: string; created_at: string }[];
    topCompanies: { id: number; name: string; employees_count: number; events_count: number }[];
    canViewRevenue: boolean;
    canMonitorOps: boolean;
    ghostEventWatch: GhostWatch;
    jobHealth?: JobHealth;
    walletReconciliation?: { cached_halalas: number; ledger_halalas: number; difference_halalas: number; wallets: number; mismatched: number };
    gatewayHealth?: {
        window_hours: number;
        total: number;
        success_rate: number | null;
        failure_rate: number | null;
        stale_pending: number;
    };
    monthlyRevenue?: number;
    revenueGrowth?: number;
    last6Months?: { month: string; total: number }[];
    maxRevenue?: number;
}) {
    return (
        <AdminLayout>
            <Head title="لوحة التشغيل" />

            <PageHeader
                icon={Activity}
                title="لوحة التشغيل المركزية والمراقبة"
                subtitle="مراقبة صحة المحركات التشغيلية، ومطابقة سجلات الأرصدة، ومؤشرات الإنذار المبكر."
            />

            {/* ── هل المحرّكات تعمل؟ ── */}
            {canMonitorOps && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {walletReconciliation && <ReconciliationCard reconciliation={walletReconciliation} />}
                    {jobHealth && <JobHealthCard health={jobHealth} />}
                    {gatewayHealth && <GatewayHealthCard health={gatewayHealth} />}
                    <Card className="space-y-3">
                        <CardTitle
                            aside={
                                <Badge tone={pendingRequests > 0 ? 'warning' : 'success'}>
                                    {pendingRequests > 0 ? `${pendingRequests} بانتظار المراجعة` : 'لا طلبات معلّقة'}
                                </Badge>
                            }
                        >
                            طلبات التسجيل
                        </CardTitle>
                        <div className="space-y-1.5 pt-1">
                            <Row label="شركات بانتظار الاعتماد:" value={String(pendingCompanies)} />
                            <Row label="مزوّدون بانتظار الاعتماد:" value={String(pendingPartners)} />
                        </div>
                        <Link href="/admin/companies" className="text-[11px] font-bold text-ink hover:underline block pt-1">
                            مراجعة الطلبات ←
                        </Link>
                    </Card>
                </div>
            )}

            {/* ── العدّادات ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="الشركات المفعّلة" value={companyStats.active} hint={`+${companiesThisMonth} هذا الشهر`} />
                <StatCard label="مزوّدو الخدمة" value={partnerStats.active} hint={`+${partnersThisMonth} هذا الشهر`} />
                <StatCard label="الموظفون" value={totalEmployees} hint={`+${employeesThisMonth} هذا الشهر`} />
                {canViewRevenue ? (
                    <StatCard
                        label="عمولة الشهر الحالي"
                        value={<Money amount={monthlyRevenue ?? 0} />}
                        hint={`${(revenueGrowth ?? 0) >= 0 ? '+' : ''}${revenueGrowth ?? 0}٪ عن الشهر السابق`}
                        tone={(revenueGrowth ?? 0) >= 0 ? 'success' : 'danger'}
                    />
                ) : (
                    <StatCard label="طلبات معلّقة" value={pendingRequests} hint="شركات ومزوّدون" tone={pendingRequests > 0 ? 'warning' : 'ink'} />
                )}
            </div>

            {/* ── الإيراد على ٦ أشهر ── */}
            {canViewRevenue && last6Months && last6Months.length > 0 && (
                <Card padding="p-5" className="space-y-4">
                    <div className="flex items-center justify-between border-b-[0.5px] border-ink/10 pb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-ink" aria-hidden="true" />
                            <h2 className="text-sm font-extrabold text-ink">العمولة على الفعاليات المكتملة</h2>
                        </div>
                        <span className="text-[11px] text-ink/50">آخر ٦ أشهر</span>
                    </div>

                    <div className="flex items-end justify-between gap-2 h-40" dir="ltr">
                        {last6Months.map((month) => {
                            const height = Math.round((month.total / (maxRevenue || 1)) * 100);

                            return (
                                <div key={month.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                    <span className="text-[10px] font-mono text-ink/60">{Math.round(month.total).toLocaleString()}</span>
                                    <div
                                        className="w-full rounded-t-lg bg-lime border-[0.5px] border-lime"
                                        style={{ height: `${Math.max(height, 2)}%` }}
                                    />
                                    <span className="text-[10px] font-bold text-ink/70">{month.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* ── مؤشرات الإنذار المبكر (H §13) ── */}
            <Card padding="p-5" className="space-y-4">
                <div className="flex items-center justify-between border-b-[0.5px] border-ink/10 pb-3">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-ink" aria-hidden="true" />
                        <h2 className="text-sm font-extrabold text-ink">مؤشرات الإنذار المبكر</h2>
                    </div>
                    <span className="text-[11px] text-ink/50">آخر ٣٠ يوماً</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Indicator
                        label="تعديلات الحضور بعد الاكتمال"
                        rate={ghostEventWatch.post_completion_edit_rate}
                        detail={`${ghostEventWatch.post_completion_edited_events} من ${ghostEventWatch.completed_events} فعالية مكتملة`}
                        note="ارتفاع التعديل بعد انقضاء نافذة الـ٢٤ ساعة يشير إلى عدم دقة تسجيل الحضور."
                    />
                    <Indicator
                        label="التدخلات اليدوية في الحالات"
                        rate={ghostEventWatch.manual_state_change_rate}
                        detail={`${ghostEventWatch.manual_state_change_events} من ${ghostEventWatch.events_created} فعالية`}
                        note="تغيير الحالات يدوياً بدل الدورة التلقائية يشير إلى خلل تشغيلي."
                    />
                    <Indicator
                        label="أُقفلت بلا مراجعة"
                        rate={ghostEventWatch.locked_without_review_rate}
                        detail={`${ghostEventWatch.locked_without_review} فعالية`}
                        note="الخانة التي تسكنها الفعالية الشبح: اكتملت، أُقفلت، ولم يراجعها أحد."
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* ── أحدث الطلبات ── */}
                <Card padding="p-0" className="overflow-hidden">
                    <div className="p-4 border-b-[0.5px] border-ink/10 flex items-center justify-between">
                        <h2 className="text-sm font-extrabold text-ink">أحدث طلبات التسجيل</h2>
                        <Link href="/admin/companies" className="text-[11px] font-bold text-ink/70 hover:text-ink">
                            الكل ←
                        </Link>
                    </div>

                    <div className="divide-y-[0.5px] divide-ink/10">
                        {recentRequests.map((request, index) => (
                            <div key={`${request.type}-${index}`} className="p-4 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-extrabold text-ink truncate">{request.name}</span>
                                        <Badge tone="neutral">{request.type_label}</Badge>
                                    </div>
                                    <span className="text-[11px] text-ink/50">
                                        {new Date(request.created_at).toLocaleDateString('ar-SA')}
                                    </span>
                                </div>
                                <Badge tone={request.status === 'review' ? 'warning' : 'info'}>
                                    {request.status === 'review' ? 'قيد المراجعة' : 'جديد'}
                                </Badge>
                            </div>
                        ))}
                        <ListStates count={recentRequests.length} empty="لا توجد طلبات تسجيل جديدة." />
                    </div>
                </Card>

                {/* ── أنشط الشركات ── */}
                <Card padding="p-0" className="overflow-hidden">
                    <div className="p-4 border-b-[0.5px] border-ink/10 flex items-center justify-between">
                        <h2 className="text-sm font-extrabold text-ink">أنشط الشركات</h2>
                        <span className="text-[11px] text-ink/50">حسب عدد الموظفين</span>
                    </div>

                    <div className="divide-y-[0.5px] divide-ink/10">
                        {topCompanies.map((company) => (
                            <div key={company.id} className="p-4 flex items-center justify-between gap-3">
                                <span className="text-xs font-extrabold text-ink truncate">{company.name}</span>
                                <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono text-ink/70">
                                    <span className="flex items-center gap-1">
                                        <UserRound className="w-3 h-3" aria-hidden="true" />
                                        {company.employees_count}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3" aria-hidden="true" />
                                        {company.events_count}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <ListStates count={topCompanies.length} empty="لا توجد شركات مفعّلة بعد." />
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}

function Row({ label, value, tone = 'ink' }: { label: string; value: string; tone?: 'ink' | 'success' | 'danger' }) {
    const tones = { ink: 'text-ink', success: 'text-success', danger: 'text-danger' };

    return (
        <div className="flex items-center justify-between text-xs gap-2">
            <span className="text-ink/60">{label}</span>
            <span className={`font-mono font-bold ${tones[tone]}`}>{value}</span>
        </div>
    );
}

/** H §12.5 — الرصيد مشتق من الدفتر لا العكس؛ الفارق يجب أن يكون صفراً. */
function ReconciliationCard({
    reconciliation,
}: {
    reconciliation: { cached_halalas: number; ledger_halalas: number; difference_halalas: number; wallets: number; mismatched: number };
}) {
    const balanced = reconciliation.difference_halalas === 0 && reconciliation.mismatched === 0;
    const riyals = (halalas: number) => (halalas / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    return (
        <Card className="space-y-3">
            <CardTitle
                aside={
                    <Badge tone={balanced ? 'success' : 'danger'} icon={balanced ? CircleCheckBig : AlertTriangle}>
                        {balanced ? `متطابق (${reconciliation.wallets} محفظة)` : `${reconciliation.mismatched} محفظة غير مطابقة`}
                    </Badge>
                }
            >
                المطابقة اليومية للمحافظ
            </CardTitle>
            <div className="space-y-1.5 pt-1">
                <Row label="رصيد المحافظ المخزن:" value={`${riyals(reconciliation.cached_halalas)} ر.س`} />
                <Row label="مجموع حركات دفتر الأستاذ:" value={`${riyals(reconciliation.ledger_halalas)} ر.س`} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-ink/40 pt-1 border-t-[0.5px] border-ink/10">
                <span>الفارق المحاسبي:</span>
                <span className={`font-mono font-bold ${balanced ? 'text-success' : 'text-danger'}`}>
                    {riyals(reconciliation.difference_halalas)} ر.س
                </span>
            </div>
        </Card>
    );
}

/** H §20 — «الصمت ليس دليل نجاح»: مهمة لم تُنفَّذ خلال ضعف دوريتها متأخرة. */
function JobHealthCard({ health }: { health: JobHealth }) {
    const healthy = health.late_count === 0;

    return (
        <Card className="space-y-3">
            <CardTitle
                aside={
                    <Badge tone={healthy ? 'success' : 'danger'} icon={healthy ? CircleCheckBig : Clock}>
                        {healthy ? 'كل المهام في وقتها' : `${health.late_count} مهمة متأخرة`}
                    </Badge>
                }
            >
                المجدول الزمني (Cron Runner)
            </CardTitle>
            <p className="text-[11px] text-ink/70 leading-relaxed">
                «تنبيه إذا لم تُنفَّذ مهمة حرجة خلال ضعف دوريتها — الصمت ليس دليل نجاح.»
            </p>
            <div className="space-y-1.5 pt-1 border-t-[0.5px] border-ink/10">
                {health.jobs.slice(0, 4).map((job) => (
                    <div key={job.job} className="flex items-center justify-between text-[11px] gap-2">
                        <span className="text-ink/60 truncate font-mono">{job.job}</span>
                        <span className={`font-bold shrink-0 ${job.late ? 'text-danger' : 'text-success'}`}>
                            {job.late ? 'متأخرة' : 'في وقتها'}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function Indicator({ label, rate, detail, note }: { label: string; rate: number; detail: string; note: ReactNode }) {
    // Bands from H §13: under 5% is normal operation, 5–10% is worth a look.
    const tone = rate >= 10 ? 'danger' : rate >= 5 ? 'warning' : 'success';
    const tones = { danger: 'text-danger border-danger/20', warning: 'text-warning border-warning/20', success: 'text-success border-success/20' };

    return (
        <div className="p-4 rounded-xl bg-page border-[0.5px] border-ink/10 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-ink">{label}</span>
                <span className={`font-mono font-extrabold text-sm bg-surface px-2 py-0.5 rounded-lg border-[0.5px] ${tones[tone]}`}>
                    {rate}٪
                </span>
            </div>
            <div className="text-[11px] font-medium text-ink/60">{detail}</div>
            <p className="text-[11px] text-ink/70 leading-relaxed pt-1 border-t-[0.5px] border-ink/5">{note}</p>
        </div>
    );
}

/**
 * H §20 — صحة بوابة الدفع.
 *
 * `stale_pending` is the webhook check: an intent whose deadline has passed
 * while it is still `pending` means the gateway's callback never arrived. A
 * success rate alone would read as healthy while payments silently hang.
 */
function GatewayHealthCard({
    health,
}: {
    health: { window_hours: number; total: number; success_rate: number | null; failure_rate: number | null; stale_pending: number };
}) {
    const lagging = health.stale_pending > 0;

    return (
        <Card className="space-y-3">
            <CardTitle
                aside={
                    <Badge tone={lagging ? 'danger' : 'success'}>
                        {lagging ? `${health.stale_pending} ويبهوك متأخر` : 'البوابة سليمة'}
                    </Badge>
                }
            >
                بوابة الدفع الإلكتروني
            </CardTitle>

            <dl className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink/60">معدل نجاح الدفع (آخر ساعة)</dt>
                    <dd className="font-mono font-bold text-ink">
                        {health.success_rate === null ? '—' : `${health.success_rate}٪`}
                    </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink/60">معدل الإخفاق</dt>
                    <dd className="font-mono font-bold text-ink">
                        {health.failure_rate === null ? '—' : `${health.failure_rate}٪`}
                    </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink/60">نيّات انتهت مهلتها ولم تُغلق</dt>
                    <dd className={`font-mono font-bold ${lagging ? 'text-danger' : 'text-ink'}`}>{health.stale_pending}</dd>
                </div>
            </dl>

            <p className="text-[10px] text-ink/50 leading-relaxed pt-2 border-t-[0.5px] border-ink/10">
                {health.total === 0
                    ? 'لا محاولات دفع في آخر ساعة — المعدلات تظهر بعد أول محاولة.'
                    : 'نيّة تجاوزت مهلتها وبقيت معلّقة تعني أن ردّ البوابة لم يصل — لا أن الدفع فشل.'}
            </p>
        </Card>
    );
}
