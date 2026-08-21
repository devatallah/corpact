import AdminLayout from '@/layouts/admin-layout';
import StatCard from '@/components/stat-card';
import StatusBadge from '@/components/status-badge';
import { fmtDateTime } from '@/lib/utils';
import type { Company } from '@/types/models';
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

interface TopCompany extends Company {
    employees_count: number;
    events_count: number;
}

interface Props {
    companyStats: { active: number; pending: number; review: number };
    partnerStats: { active: number; pending: number };
    totalEmployees: number;
    monthlyRevenue: number;
    pendingRequests: number;
    pendingCompanies: number;
    pendingPartners: number;
    companiesThisMonth: number;
    partnersThisMonth: number;
    employeesThisMonth: number;
    revenueGrowth: number;
    last6Months: MonthData[];
    maxRevenue: number;
    recentRequests: RecentRequest[];
    topCompanies: TopCompany[];
    /**
     * A12 — H §13: مؤشر الإنذار المبكر لـ«الفعالية الشبح». الحضور تلقائي،
     * فارتفاع معدل التعديل بعد الاكتمال أو التغيير اليدوي للحالة إشارة إلى
     * فعاليات لم تُقم فعلاً. A13 يبني التقرير الكامل فوق نفس الأرقام.
     */
    ghostEventWatch: GhostEventWatch;
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
}: Props) {
    return (
        <AdminLayout>
            <Head title="لوحة التحكم" />

            <div className="page-title">لوحة التحكم</div>
            <div className="page-sub">نظرة عامة على المنصة</div>

            <div className="stat-row">
                <StatCard
                    emoji="🏢"
                    label="شركة مفعّلة"
                    value={companyStats.active}
                    change={`+${companiesThisMonth} هذا الشهر`}
                    color="#009E82"
                />
                <StatCard
                    emoji="🏟️"
                    label="شريك مفعّل"
                    value={partnerStats.active}
                    change={`+${partnersThisMonth} هذا الشهر`}
                    color="#5B7EFF"
                />
                <StatCard
                    emoji="👥"
                    label="موظف مسجّل"
                    value={totalEmployees.toLocaleString()}
                    change={`+${employeesThisMonth} هذا الشهر`}
                    color="#D4820A"
                />
                <StatCard
                    emoji="💰"
                    label="إيرادات الشهر (ريال)"
                    value={monthlyRevenue.toLocaleString()}
                    change={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}% عن الشهر السابق`}
                    color="#E03050"
                />
                <StatCard
                    emoji="⏳"
                    label="طلبات تحتاج مراجعة"
                    value={pendingRequests}
                    change={`${pendingCompanies} شركة · ${pendingPartners} شريك`}
                    color="#C8A600"
                />
            </div>

            {/* A12 — H §13: «يجب مراقبة معدل التعديلات بعد الاكتمال كمؤشر إنذار مبكر» */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <div className="card-title">إنذار مبكر — الفعالية الشبح (آخر 30 يوماً)</div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.7 }}>
                    الحضور تلقائي بالكامل، فالفعالية التي لم تُقم ولم يبلّغ عنها أحد تُحتسب مكتملة وتدخل
                    الصرف والفوترة. هذه الأرقام هي المؤشر المتفق عليه لكشف ذلك مبكراً.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{ghostEventWatch.post_completion_edit_rate}%</div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                            تعديل حضور بعد الاكتمال ({ghostEventWatch.post_completion_edited_events} من {ghostEventWatch.completed_events})
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{ghostEventWatch.manual_state_change_rate}%</div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                            تغيير حالة يدوي ({ghostEventWatch.manual_state_change_events} فعالية)
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{ghostEventWatch.locked_without_review}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                            أُقفلت نافذتها بلا مراجعة واحدة ({ghostEventWatch.locked_without_review_rate}%)
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{ghostEventWatch.absence_marks}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>حالات غياب مسجَّلة</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="card">
                    <div className="card-title">إيرادات آخر 6 أشهر (ريال)</div>
                    <div className="rev-bar-wrap">
                        {last6Months.map((m, i) => {
                            const height = maxRevenue > 0
                                ? Math.round((m.total / maxRevenue) * 100)
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
                                            ? { background: 'linear-gradient(180deg, #E03050, #B8001A)' }
                                            : isSecondLast
                                                ? { background: 'linear-gradient(180deg, #D4820A, #A05800)' }
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

                <div className="card">
                    <div className="card-title">آخر الطلبات</div>
                    {recentRequests.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#6B7A99', fontSize: '13px' }}>
                            لا توجد طلبات معلقة
                        </div>
                    ) : (
                        recentRequests.map((req) => (
                            <Link
                                key={req.id}
                                href={req.type === 'company' ? '/admin/companies' : '/admin/partners'}
                                style={{
                                    display: 'block',
                                    background: '#0F1117',
                                    border: '1px solid #232A3E',
                                    borderRight: `3px solid ${
                                        req.status === 'pending' ? '#D4820A'
                                            : req.status === 'review' ? '#5B7EFF'
                                                : '#232A3E'
                                    }`,
                                    borderRadius: '10px',
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    marginBottom: '8px',
                                    textDecoration: 'none',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{req.name}</span>
                                    <StatusBadge status={req.status} />
                                </div>
                                <div style={{ fontSize: '11px', color: '#6B7A99' }}>
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
                                    <td colSpan={4} style={{ textAlign: 'center', color: '#6B7A99' }}>
                                        لا توجد بيانات
                                    </td>
                                </tr>
                            ) : (
                                topCompanies.map((company) => (
                                    <tr key={company.id}>
                                        <td style={{ fontWeight: 700, color: '#fff' }}>{company.name}</td>
                                        <td>{company.employees_count}</td>
                                        <td style={{ color: '#009E82', fontWeight: 700 }}>{company.events_count}</td>
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
