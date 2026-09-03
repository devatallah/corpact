import AdminLayout from '@/layouts/admin-layout';
import StatCard from '@/components/stat-card';
import StatusBadge from '@/components/status-badge';
import { fmtDateTime, fmtHalalas } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

interface RecentRequest {
    id: number;
    type: string;
    type_label: string;
    name: string;
    status: string;
    created_at: string;
}

interface MonthData {
    month: string;
    total: number;
}

/**
 * الشركة هنا إسقاط صريح من الخادم (id + الاسم + العدّادان) لا نموذج كامل —
 * شروط العقد والرقم الضريبي وبيانات التواصل لا تصل هذه الشاشة أصلاً.
 */
interface TopCompany {
    id: number;
    name: string;
    employees_count: number;
    events_count: number;
}

interface Props {
    companyStats: { active: number; pending: number; review: number };
    partnerStats: { active: number; pending: number };
    totalEmployees: number;
    pendingRequests: number;
    pendingCompanies: number;
    pendingPartners: number;
    companiesThisMonth: number;
    partnersThisMonth: number;
    employeesThisMonth: number;
    /**
     * H §4: أرقام الإيراد تصل فقط لمن يملك `revenue.view` — الخادم يحذف
     * الخصائص الأربع التالية لغيره، فالشاشة تُبنى بدونها لا تخفيها بـ CSS.
     */
    canViewRevenue: boolean;
    monthlyRevenue?: number;
    revenueGrowth?: number;
    last6Months?: MonthData[];
    maxRevenue?: number;
    canMonitorOps: boolean;
    jobHealth?: JobHealth;
    walletReconciliation?: WalletReconciliation;
    recentRequests: RecentRequest[];
    topCompanies: TopCompany[];
    /**
     * A12 — H §13: مؤشر الإنذار المبكر لـ«الفعالية الشبح». الحضور تلقائي،
     * فارتفاع معدل التعديل بعد الاكتمال أو التغيير اليدوي للحالة إشارة إلى
     * فعاليات لم تُقم فعلاً. A13 يبني التقرير الكامل فوق نفس الأرقام.
     */
    ghostEventWatch: GhostEventWatch;
}

/** H §20 — صحة المهام المجدولة: الدورية ومتى نفّذت آخر مرة. */
interface JobHealth {
    jobs: { job: string; cadence_minutes: number; last_run_at: string | null; late: boolean }[];
    late_count: number;
}

/** H §12.5 — الرصيد المخزَّن مقابل مجموع الدفتر؛ الفارق يجب أن يكون صفراً. */
interface WalletReconciliation {
    cached_halalas: number;
    ledger_halalas: number;
    difference_halalas: number;
    wallets: number;
    mismatched: number;
}

interface GhostEventWatch {
    completed_events: number;
    post_completion_edited_events: number;
    post_completion_edit_rate: number;
    absence_marks: number;
    events_created: number;
    manual_state_change_events: number;
    manual_state_change_rate: number;
    locked_without_review: number;
    locked_without_review_rate: number;
}

export default function AdminDashboard({
    companyStats,
    partnerStats,
    totalEmployees,
    canViewRevenue,
    monthlyRevenue,
    pendingRequests,
    pendingCompanies,
    pendingPartners,
    companiesThisMonth,
    partnersThisMonth,
    employeesThisMonth,
    revenueGrowth,
    last6Months,
    maxRevenue,
    recentRequests,
    topCompanies,
    ghostEventWatch,
    canMonitorOps,
    jobHealth,
    walletReconciliation,
}: Props) {
    // الرسم يُبنى فقط حين وصلت أرقامه فعلاً؛ غيابها ليس صفراً بل «لا صلاحية».
    const showRevenue = canViewRevenue && last6Months !== undefined && monthlyRevenue !== undefined;

    return (
        <AdminLayout>
            <Head title="لوحة التحكم" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-[0.5px] border-[#0A0A0A]/10 mb-5">
                <div>
                    <h1 className="text-xl font-extrabold text-[#0A0A0A] mb-1">لوحة التحكم</h1>
                    <p className="text-xs text-[#0A0A0A]/60">نظرة عامة على المنصة</p>
                </div>
            </div>

            {(walletReconciliation || (canMonitorOps && jobHealth)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    {walletReconciliation && (
                        <div className="bg-white p-4 rounded-2xl border-[0.5px] border-[#0A0A0A]/10 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-[#0A0A0A]">المطابقة اليومية للمحافظ</span>
                                <span
                                    className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                        walletReconciliation.mismatched === 0
                                            ? 'text-[#2E7D32] bg-[#E8F5E9]'
                                            : 'text-[#D9381E] bg-[#FDEDEC]'
                                    }`}
                                >
                                    {walletReconciliation.mismatched === 0
                                        ? `متطابق (${walletReconciliation.wallets} محفظة)`
                                        : `${walletReconciliation.mismatched} محفظة غير متطابقة`}
                                </span>
                            </div>
                            <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#0A0A0A]/60">رصيد المحافظ المخزَّن:</span>
                                    <span className="font-mono font-bold text-[#0A0A0A]">{fmtHalalas(walletReconciliation.cached_halalas)} ر.س</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#0A0A0A]/60">مجموع حركات دفتر الأستاذ:</span>
                                    <span className="font-mono font-bold text-[#0A0A0A]">{fmtHalalas(walletReconciliation.ledger_halalas)} ر.س</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t-[0.5px] border-[#0A0A0A]/10">
                                    <span className="text-[#0A0A0A]/40">الفارق المحاسبي:</span>
                                    <span className={`font-mono font-bold ${walletReconciliation.difference_halalas === 0 ? 'text-[#2E7D32]' : 'text-[#D9381E]'}`}>
                                        {fmtHalalas(walletReconciliation.difference_halalas)} ر.س
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {canMonitorOps && jobHealth && (
                        <div className="bg-white p-4 rounded-2xl border-[0.5px] border-[#0A0A0A]/10 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-extrabold text-[#0A0A0A]">المهام المجدولة</span>
                                <span
                                    className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                        jobHealth.late_count === 0
                                            ? 'text-[#2E7D32] bg-[#E8F5E9]'
                                            : 'text-[#D9381E] bg-[#FDEDEC]'
                                    }`}
                                >
                                    {jobHealth.late_count === 0 ? 'كل المهام في وقتها' : `${jobHealth.late_count} مهمة متأخرة`}
                                </span>
                            </div>
                            <p className="text-[11px] text-[#0A0A0A]/70 leading-relaxed">
                                تُعدّ المهمة متأخرة إذا لم تُنفَّذ خلال ضعف دوريتها — الصمت ليس دليل نجاح.
                            </p>
                            <div className="space-y-1 pt-1 border-t-[0.5px] border-[#0A0A0A]/10 max-h-44 overflow-y-auto">
                                {jobHealth.jobs.filter((job) => job.late).slice(0, 6).map((job) => (
                                    <div key={job.job} className="flex items-center justify-between gap-2 text-[11px]">
                                        <span className="font-mono text-[#0A0A0A]/70 truncate" dir="ltr">{job.job}</span>
                                        <span className="text-[#D9381E] font-bold whitespace-nowrap">
                                            {job.last_run_at ? fmtDateTime(job.last_run_at) : 'لم تُنفَّذ بعد'}
                                        </span>
                                    </div>
                                ))}
                                {jobHealth.late_count === 0 && (
                                    <div className="text-[11px] text-[#0A0A0A]/50">آخر فحص: جميع المهام نُفِّذت ضمن دوريتها.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="stat-row">
                <StatCard
                    emoji="🏢"
                    label="شركة مفعّلة"
                    value={companyStats.active}
                    change={`+${companiesThisMonth} هذا الشهر`}
                    color="#2E7D32"
                />
                <StatCard
                    emoji="🏟️"
                    label="شريك مفعّل"
                    value={partnerStats.active}
                    change={`+${partnersThisMonth} هذا الشهر`}
                    color="#0A0A0A"
                />
                <StatCard
                    emoji="👥"
                    label="موظف مسجّل"
                    value={totalEmployees.toLocaleString()}
                    change={`+${employeesThisMonth} هذا الشهر`}
                    color="#C87D00"
                />
                {showRevenue && (
                    <StatCard
                        emoji="💰"
                        label="إيرادات الشهر (ريال)"
                        value={monthlyRevenue.toLocaleString()}
                        change={`${(revenueGrowth ?? 0) >= 0 ? '+' : ''}${revenueGrowth ?? 0}% عن الشهر السابق`}
                        color="#D9381E"
                    />
                )}
                <StatCard
                    emoji="⏳"
                    label="طلبات تحتاج مراجعة"
                    value={pendingRequests}
                    change={`${pendingCompanies} شركة · ${pendingPartners} شريك`}
                    color="#C87D00"
                />
            </div>

            {/* A12 — H §13: «يجب مراقبة معدل التعديلات بعد الاكتمال كمؤشر إنذار مبكر» */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <div className="card-title">إنذار مبكر — الفعالية الشبح (آخر 30 يوماً)</div>
                <div style={{ fontSize: 12, color: 'rgba(10,10,10,.6)', marginBottom: 12, lineHeight: 1.7 }}>
                    الحضور تلقائي بالكامل، فالفعالية التي لم تُقم ولم يبلّغ عنها أحد تُحتسب مكتملة وتدخل
                    الصرف والفوترة. هذه الأرقام هي المؤشر المتفق عليه لكشف ذلك مبكراً.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{ghostEventWatch.post_completion_edit_rate}%</div>
                        <div style={{ fontSize: 12, color: 'rgba(10,10,10,.6)' }}>
                            تعديل حضور بعد الاكتمال ({ghostEventWatch.post_completion_edited_events} من {ghostEventWatch.completed_events})
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{ghostEventWatch.manual_state_change_rate}%</div>
                        <div style={{ fontSize: 12, color: 'rgba(10,10,10,.6)' }}>
                            تغيير حالة يدوي ({ghostEventWatch.manual_state_change_events} فعالية)
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{ghostEventWatch.locked_without_review}</div>
                        <div style={{ fontSize: 12, color: 'rgba(10,10,10,.6)' }}>
                            أُقفلت نافذتها بلا مراجعة واحدة ({ghostEventWatch.locked_without_review_rate}%)
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{ghostEventWatch.absence_marks}</div>
                        <div style={{ fontSize: 12, color: 'rgba(10,10,10,.6)' }}>حالات غياب مسجَّلة</div>
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: showRevenue ? '1.6fr 1fr' : '1fr',
                    gap: '16px',
                    marginBottom: '16px',
                }}
            >
                {showRevenue && (
                    <div className="card">
                        <div className="card-title">إيرادات آخر 6 أشهر (ريال)</div>
                        <div className="rev-bar-wrap">
                            {last6Months.map((m, i) => {
                                const height = (maxRevenue ?? 0) > 0
                                    ? Math.round((m.total / (maxRevenue as number)) * 100)
                                    : 0;
                                const isLast = i === last6Months.length - 1;
                                const isSecondLast = i === last6Months.length - 2;
                                return (
                                    <div
                                        key={i}
                                        className="rev-bar"
                                        style={{
                                            height: `${height}%`,
                                            ...(isLast
                                                ? { background: 'linear-gradient(180deg, #D9381E, #D9381E)' }
                                                : isSecondLast
                                                    ? { background: 'linear-gradient(180deg, #C87D00, #C87D00)' }
                                                    : {}),
                                        }}
                                    />
                                );
                            })}
                        </div>
                        <div className="rev-label">
                            {last6Months.map((m, i) => (
                                <span key={i}>{m.month}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="card">
                    <div className="card-title">آخر الطلبات</div>
                    {recentRequests.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(10,10,10,.55)', fontSize: '13px' }}>
                            لا توجد طلبات معلقة
                        </div>
                    ) : (
                        recentRequests.map((req) => (
                            <Link
                                key={req.id}
                                href={req.type === 'company' ? '/admin/companies' : '/admin/partners'}
                                style={{
                                    display: 'block',
                                    background: '#F6F8F5',
                                    border: '0.5px solid rgba(10,10,10,.1)',
                                    borderRight: `3px solid ${
                                        req.status === 'pending' ? '#C87D00'
                                            : req.status === 'review' ? '#0A0A0A'
                                                : 'rgba(10,10,10,.1)'
                                    }`,
                                    borderRadius: '10px',
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    marginBottom: '8px',
                                    textDecoration: 'none',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0A0A0A' }}>{req.name}</span>
                                    <StatusBadge status={req.status} />
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(10,10,10,.55)' }}>
                                    {req.type_label} · {fmtDateTime(req.created_at)}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-title">أكثر الشركات نشاطاً</div>
                <div style={{ overflow: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>الشركة</th>
                                <th>الموظفون</th>
                                <th>الفعاليات</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', color: 'rgba(10,10,10,.55)' }}>
                                        لا توجد بيانات
                                    </td>
                                </tr>
                            ) : (
                                topCompanies.map((company) => (
                                    <tr key={company.id}>
                                        <td style={{ fontWeight: 700, color: '#0A0A0A' }}>{company.name}</td>
                                        <td>{company.employees_count}</td>
                                        <td style={{ color: '#2E7D32', fontWeight: 700 }}>{company.events_count}</td>
                                        <td>
                                            <StatusBadge status="active" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
