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
    settlements: { total_spend: number }[];
}

interface Props {
    companyStats: { active: number; pending: number; review: number };
    clubStats: { active: number; pending: number };
    totalEmployees: number;
    monthlyRevenue: number;
    pendingRequests: number;
    pendingCompanies: number;
    pendingClubs: number;
    companiesThisMonth: number;
    clubsThisMonth: number;
    employeesThisMonth: number;
    revenueGrowth: number;
    last6Months: MonthData[];
    maxRevenue: number;
    recentRequests: RecentRequest[];
    topCompanies: TopCompany[];
}

export default function AdminDashboard({
    companyStats,
    clubStats,
    totalEmployees,
    monthlyRevenue,
    pendingRequests,
    pendingCompanies,
    pendingClubs,
    companiesThisMonth,
    clubsThisMonth,
    employeesThisMonth,
    revenueGrowth,
    last6Months,
    maxRevenue,
    recentRequests,
    topCompanies,
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
                    label="نادٍ مفعّل"
                    value={clubStats.active}
                    change={`+${clubsThisMonth} هذا الشهر`}
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
                    change={`${pendingCompanies} شركة · ${pendingClubs} نادي`}
                    color="#C8A600"
                />
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
                                href={req.type === 'company' ? '/admin/companies' : '/admin/clubs'}
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
                                <th>الإنفاق</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', color: '#6B7A99' }}>
                                        لا توجد بيانات
                                    </td>
                                </tr>
                            ) : (
                                topCompanies.map((company) => (
                                    <tr key={company.id}>
                                        <td style={{ fontWeight: 700, color: '#fff' }}>{company.name}</td>
                                        <td>{company.employees_count}</td>
                                        <td style={{ color: '#009E82', fontWeight: 700 }}>{company.events_count}</td>
                                        <td style={{ color: '#D4820A', fontWeight: 700 }}>
                                            {(company.settlements?.[0]?.total_spend ?? 0).toLocaleString()} ر
                                        </td>
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
