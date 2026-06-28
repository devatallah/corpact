import CompanyLayout from '@/layouts/company-layout';
import StatCard from '@/components/stat-card';
import { Head } from '@inertiajs/react';
import { useRef } from 'react';
import { printCard } from '@/lib/print-card';

interface EmployeeActivityData {
    total_employees: number;
    participated_at_least_once: number;
    never_participated: number;
    participation_rate: number;
    monthly_rates: { month: string; count: number; rate: number }[];
}

interface BudgetConsumptionData {
    total_budget: number;
    used: number;
    remaining: number;
    used_pct: number;
    breakdown: { community_name: string; amount: number; pct: number }[];
    avg_per_employee: number;
}

interface MostBookedActivity {
    category_name: string;
    bookings: number;
    unique_participants: number;
    change_pct: number | null;
}

interface CommunityReportItem {
    community_name: string;
    icon: string;
    members: number;
    events_this_month: number;
    attendance_rate: number;
    leader_name: string | null;
    last_event_date: string | null;
    status: 'active' | 'moderate' | 'inactive';
}

interface InactiveEmployeeItem {
    id: number;
    name: string;
    email: string;
    joined_date: string;
    community_name: string | null;
    last_event_date: string | null;
}

interface Props {
    employeeActivity: EmployeeActivityData;
    budgetConsumption: BudgetConsumptionData;
    mostBookedActivities: MostBookedActivity[];
    communitiesReport: CommunityReportItem[];
    inactiveEmployees: InactiveEmployeeItem[];
}

const breakdownColors = ['#18A86B', '#0E7C4A', '#D4820A', '#18A86B'];

function ReportStatusBadge({ status }: { status: 'active' | 'moderate' | 'inactive' }) {
    const map = {
        active: { bg: '#18A86B18', color: '#18A86B', label: 'نشط' },
        moderate: { bg: '#FEF3C7', color: '#B45309', label: 'متوسط' },
        inactive: { bg: '#FEE2E2', color: '#DC2626', label: 'خامل' },
    };
    const s = map[status];
    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 600,
            background: s.bg,
            color: s.color,
        }}>
            {s.label}
        </span>
    );
}

function ChangeBadge({ change_pct }: { change_pct: number | null }) {
    if (change_pct === null || change_pct === 0) {
        return (
            <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 600,
                background: '#FAFAFA',
                color: '#999',
            }}>
                —
            </span>
        );
    }
    if (change_pct > 0) {
        return (
            <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 600,
                background: '#18A86B18',
                color: '#18A86B',
            }}>
                ↑ {change_pct}%
            </span>
        );
    }
    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 600,
            background: '#FEE2E2',
            color: '#DC2626',
        }}>
            ↓ {Math.abs(change_pct)}%
        </span>
    );
}

export default function ReportsIndex({
    employeeActivity,
    budgetConsumption,
    mostBookedActivities,
    communitiesReport,
    inactiveEmployees,
}: Props) {
    const budgetRef = useRef<HTMLDivElement>(null);
    const activitiesRef = useRef<HTMLDivElement>(null);
    const communitiesRef = useRef<HTMLDivElement>(null);
    const inactiveRef = useRef<HTMLDivElement>(null);

    const totalBookings = mostBookedActivities.reduce((sum, a) => sum + a.bookings, 0);

    const monthlyChange = (() => {
        const rates = employeeActivity.monthly_rates;
        if (rates.length < 2) return null;
        const last = rates[rates.length - 1].rate;
        const prev = rates[rates.length - 2].rate;
        const diff = last - prev;
        return diff >= 0
            ? `↑ ${diff.toFixed(1)}% عن الشهر الماضي`
            : `↓ ${Math.abs(diff).toFixed(1)}% عن الشهر الماضي`;
    })();

    const cardHeaderStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #EBEBEB',
    };

    const thStyle: React.CSSProperties = {
        background: '#FAFAFA',
        padding: '12px 14px',
        textAlign: 'right',
        fontWeight: 600,
        fontSize: 13,
        color: '#0A0A0A',
        borderBottom: '1px solid #EBEBEB',
    };

    const tdStyle: React.CSSProperties = {
        padding: '12px 14px',
        fontSize: 14,
        color: '#0A0A0A',
        borderBottom: '1px solid #EBEBEB',
    };

    return (
        <CompanyLayout>
            <Head title="التقارير والإحصائيات" />

            {/* Page header */}
            <div style={{ marginBottom: 24 }}>
                <div className="page-title">التقارير والإحصائيات</div>
                <div className="page-sub">ملخص شامل لأداء البرنامج</div>
            </div>

            {/* Alert box */}
            {inactiveEmployees.length > 0 && (
                <div style={{
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    color: '#B45309',
                    borderRadius: 10,
                    padding: '14px 18px',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    fontSize: 14,
                    fontWeight: 500,
                }}>
                    <span>
                        تنبيه: {inactiveEmployees.length} موظفاً لم يشاركوا في أي نشاط خلال آخر 30 يوماً.
                    </span>
                    <a
                        href="#inactive"
                        style={{
                            color: '#92400E',
                            fontWeight: 700,
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        عرض القائمة ←
                    </a>
                </div>
            )}

            {/* Stat cards */}
            <div className="stat-row">
                <StatCard
                    emoji="📊"
                    label="الموظفون المنضمون"
                    value={employeeActivity.total_employees}
                    change={`${employeeActivity.participated_at_least_once} شارك فعلياً`}
                    color="#18A86B"
                />
                <StatCard
                    emoji="📈"
                    label="معدل المشاركة"
                    value={`${employeeActivity.participation_rate}%`}
                    change={monthlyChange ?? undefined}
                    color="#0E7C4A"
                />
                <StatCard
                    emoji="💰"
                    label="الميزانية المتبقية"
                    value={budgetConsumption.remaining.toLocaleString()}
                    change={`من أصل ${budgetConsumption.total_budget.toLocaleString()} ريال`}
                    color="#D4820A"
                />
                <StatCard
                    emoji="🎯"
                    label="إجمالي الحجوزات"
                    value={totalBookings}
                    color="#0A0A0A"
                />
            </div>

            {/* Two-column grid */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {/* Budget consumption card */}
                <div ref={budgetRef} className="card" style={{ flex: '1 1 340px', minWidth: 0, padding: 0, overflow: 'hidden' }}>
                    <div style={cardHeaderStyle}>
                        <span className="sec-title" style={{ margin: 0 }}>
                            استهلاك الميزانية
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="badge" style={{ background: '#18A86B18', color: '#18A86B' }}>
                                {budgetConsumption.used_pct}% مُستخدم
                            </span>
                            <button className="no-print" onClick={() => printCard(budgetRef.current, 'استهلاك الميزانية')} style={{ background: 'none', border: '1px solid #EBEBEB', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                                تحميل
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '20px 20px 0' }}>
                        {/* Large progress bar */}
                        <div className="bar-w" style={{ height: 24, marginBottom: 12 }}>
                            <div className="bar-f" style={{
                                width: `${Math.min(budgetConsumption.used_pct, 100)}%`,
                                background: '#18A86B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                paddingRight: 10,
                                paddingLeft: 10,
                                boxSizing: 'border-box',
                                transition: 'width 0.4s ease',
                            }}>
                                {budgetConsumption.used_pct > 20 && (
                                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                        {budgetConsumption.used.toLocaleString()} ريال
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Meta row */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 13,
                            color: '#999',
                            marginBottom: 16,
                        }}>
                            <span>المستخدم: <strong style={{ color: '#0A0A0A' }}>{budgetConsumption.used.toLocaleString()}</strong></span>
                            <span>المتبقي: <strong style={{ color: '#18A86B' }}>{budgetConsumption.remaining.toLocaleString()}</strong></span>
                            <span>الكلي: <strong style={{ color: '#0A0A0A' }}>{budgetConsumption.total_budget.toLocaleString()}</strong></span>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #EBEBEB', margin: '0 0 16px' }} />

                        {/* Per-community breakdown */}
                        <div style={{ paddingBottom: 20 }}>
                            {budgetConsumption.breakdown.map((item, i) => (
                                <div key={i} style={{ marginBottom: 14 }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 13,
                                        marginBottom: 6,
                                        color: '#0A0A0A',
                                    }}>
                                        <span style={{ fontWeight: 500 }}>{item.community_name}</span>
                                        <span style={{ color: '#999' }}>
                                            {item.amount.toLocaleString()} ({item.pct}%)
                                        </span>
                                    </div>
                                    <div className="bar-w" style={{ height: 8 }}>
                                        <div className="bar-f" style={{
                                            width: `${Math.min(item.pct, 100)}%`,
                                            background: breakdownColors[i % breakdownColors.length],
                                            transition: 'width 0.4s ease',
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Most booked activities card */}
                <div ref={activitiesRef} className="card" style={{ flex: '1 1 300px', minWidth: 0, padding: 0, overflow: 'hidden' }}>
                    <div style={cardHeaderStyle}>
                        <span className="sec-title" style={{ margin: 0 }}>
                            الأنشطة الأكثر حجزاً
                        </span>
                        <button className="no-print" onClick={() => printCard(activitiesRef.current, 'الأنشطة الأكثر حجزاً')} style={{ background: 'none', border: '1px solid #EBEBEB', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                            تحميل
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, width: 36 }}>#</th>
                                    <th style={thStyle}>النشاط</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>الحجوزات</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>التغيير</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mostBookedActivities.map((activity, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                        <td style={{ ...tdStyle, color: '#999', fontWeight: 600 }}>{i + 1}</td>
                                        <td style={{ ...tdStyle, fontWeight: 500 }}>{activity.category_name}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>
                                            {activity.bookings.toLocaleString()}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <ChangeBadge change_pct={activity.change_pct} />
                                        </td>
                                    </tr>
                                ))}
                                {mostBookedActivities.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#999' }}>
                                            لا توجد بيانات
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Communities health table */}
            <div ref={communitiesRef} className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 20 }}>
                <div style={cardHeaderStyle}>
                    <span className="sec-title" style={{ margin: 0 }}>
                        صحة المجتمعات
                    </span>
                    <button className="no-print" onClick={() => printCard(communitiesRef.current, 'صحة المجتمعات')} style={{ background: 'none', border: '1px solid #EBEBEB', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                        تحميل
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>المجتمع</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>الأعضاء</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>الفعاليات/شهر</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>معدل الحضور</th>
                                <th style={thStyle}>قائد المجتمع</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {communitiesReport.map((community, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                    <td style={tdStyle}>
                                        <span style={{ marginLeft: 8 }}>{community.icon}</span>
                                        <span style={{ fontWeight: 600 }}>{community.community_name}</span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>{community.members}</td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>{community.events_this_month}</td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        <span style={{ fontWeight: 600 }}>{community.attendance_rate}%</span>
                                    </td>
                                    <td style={{ ...tdStyle, color: community.leader_name ? '#0A0A0A' : '#999' }}>
                                        {community.leader_name ?? '—'}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        <ReportStatusBadge status={community.status} />
                                    </td>
                                </tr>
                            ))}
                            {communitiesReport.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#999' }}>
                                        لا توجد مجتمعات
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inactive employees table */}
            <div ref={inactiveRef} id="inactive" className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 20 }}>
                <div style={cardHeaderStyle}>
                    <span className="sec-title" style={{ margin: 0 }}>
                        موظفون غير مشاركين
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                            {inactiveEmployees.length}
                        </span>
                        <button className="no-print" onClick={() => printCard(inactiveRef.current, 'موظفون غير مشاركين')} style={{ background: 'none', border: '1px solid #EBEBEB', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                            تحميل
                        </button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>الموظف</th>
                                <th style={thStyle}>البريد</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>تاريخ الانضمام</th>
                                <th style={thStyle}>المجتمع</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>آخر نشاط</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inactiveEmployees.map((employee, i) => (
                                <tr key={employee.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                    <td style={{ ...tdStyle, fontWeight: 600 }}>{employee.name}</td>
                                    <td style={{ ...tdStyle, color: '#999', direction: 'ltr', textAlign: 'right' }}>
                                        {employee.email}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center', color: '#999' }}>
                                        {employee.joined_date}
                                    </td>
                                    <td style={{ ...tdStyle, color: employee.community_name ? '#0A0A0A' : '#999' }}>
                                        {employee.community_name ?? '—'}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        {employee.last_event_date ? (
                                            <span style={{ color: '#999' }}>{employee.last_event_date}</span>
                                        ) : (
                                            <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                                                لم يشارك أبداً
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {inactiveEmployees.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#999' }}>
                                        جميع الموظفين نشطون
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </CompanyLayout>
    );
}
