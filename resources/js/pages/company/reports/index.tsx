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

const breakdownColors = ['#1A56DB', '#0F7B6C', '#B45309', '#059669'];

function StatusBadge({ status }: { status: 'active' | 'moderate' | 'inactive' }) {
    const map = {
        active: { bg: '#D1FAE5', color: '#059669', label: 'نشط' },
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
                background: '#F3F4F6',
                color: '#6B7280',
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
                background: '#D1FAE5',
                color: '#059669',
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

    const cardStyle: React.CSSProperties = {
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
    };

    const cardHeaderStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #E5E7EB',
    };

    const tableStyle: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'collapse',
    };

    const thStyle: React.CSSProperties = {
        background: '#F9FAFB',
        padding: '12px 14px',
        textAlign: 'right',
        fontWeight: 600,
        fontSize: 13,
        color: '#374151',
        borderBottom: '1px solid #E5E7EB',
    };

    const tdStyle: React.CSSProperties = {
        padding: '12px 14px',
        fontSize: 14,
        color: '#111827',
        borderBottom: '1px solid #E5E7EB',
    };

    return (
        <CompanyLayout>
            <Head title="التقارير والإحصائيات" />

            {/* Page header */}
            <div style={{ marginBottom: 24 }}>
                <h1 className="page-title">التقارير والإحصائيات</h1>
                <p className="page-sub">ملخص شامل لأداء البرنامج</p>
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
                        ⚠ تنبيه: {inactiveEmployees.length} موظفاً لم يشاركوا في أي نشاط خلال آخر ٣٠ يوماً.
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
                    change={`↑ ${employeeActivity.participated_at_least_once} شارك فعلياً`}
                    color="#1A56DB"
                />
                <StatCard
                    emoji="📈"
                    label="معدل المشاركة"
                    value={`${employeeActivity.participation_rate}%`}
                    change={monthlyChange ?? undefined}
                    color="#0F7B6C"
                />
                <StatCard
                    emoji="💰"
                    label="الميزانية المتبقية"
                    value={budgetConsumption.remaining.toLocaleString()}
                    change={`من أصل ${budgetConsumption.total_budget.toLocaleString()} ريال`}
                    color="#B45309"
                />
                <StatCard
                    emoji="🎯"
                    label="إجمالي الحجوزات"
                    value={totalBookings}
                    color="#111827"
                />
            </div>

            {/* Two-column grid */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {/* Budget consumption card */}
                <div ref={budgetRef} style={{ ...cardStyle, flex: '1 1 340px', minWidth: 0 }}>
                    <div style={cardHeaderStyle}>
                        <span className="sec-title" style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
                            استهلاك الميزانية
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 600,
                                background: '#DBEAFE',
                                color: '#1A56DB',
                            }}>
                                {budgetConsumption.used_pct}% مُستخدم
                            </span>
                            <button className="no-print" onClick={() => printCard(budgetRef.current, 'استهلاك الميزانية')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                ⬇️ تحميل
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '20px 20px 0' }}>
                        {/* Large progress bar */}
                        <div style={{
                            height: 24,
                            borderRadius: 8,
                            background: '#E5E7EB',
                            overflow: 'hidden',
                            marginBottom: 12,
                        }}>
                            <div style={{
                                width: `${Math.min(budgetConsumption.used_pct, 100)}%`,
                                height: '100%',
                                background: '#1A56DB',
                                borderRadius: 8,
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
                            color: '#6B7280',
                            marginBottom: 16,
                        }}>
                            <span>المستخدم: <strong style={{ color: '#111827' }}>{budgetConsumption.used.toLocaleString()}</strong></span>
                            <span>المتبقي: <strong style={{ color: '#059669' }}>{budgetConsumption.remaining.toLocaleString()}</strong></span>
                            <span>الكلي: <strong style={{ color: '#111827' }}>{budgetConsumption.total_budget.toLocaleString()}</strong></span>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '0 0 16px' }} />

                        {/* Per-community breakdown */}
                        <div style={{ paddingBottom: 20 }}>
                            {budgetConsumption.breakdown.map((item, i) => (
                                <div key={i} style={{ marginBottom: 14 }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 13,
                                        marginBottom: 6,
                                        color: '#374151',
                                    }}>
                                        <span style={{ fontWeight: 500 }}>{item.community_name}</span>
                                        <span style={{ color: '#6B7280' }}>
                                            {item.amount.toLocaleString()} ({item.pct}%)
                                        </span>
                                    </div>
                                    <div style={{
                                        height: 8,
                                        background: '#E5E7EB',
                                        borderRadius: 99,
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            width: `${Math.min(item.pct, 100)}%`,
                                            height: '100%',
                                            background: breakdownColors[i % breakdownColors.length],
                                            borderRadius: 99,
                                            transition: 'width 0.4s ease',
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Most booked activities card */}
                <div ref={activitiesRef} style={{ ...cardStyle, flex: '1 1 300px', minWidth: 0 }}>
                    <div style={cardHeaderStyle}>
                        <span className="sec-title" style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
                            الأنشطة الأكثر حجزاً
                        </span>
                        <button className="no-print" onClick={() => printCard(activitiesRef.current, 'الأنشطة الأكثر حجزاً')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                            ⬇️ تحميل
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
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
                                        <td style={{ ...tdStyle, color: '#9CA3AF', fontWeight: 600 }}>{i + 1}</td>
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
                                        <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#9CA3AF' }}>
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
            <div ref={communitiesRef} style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <span className="sec-title" style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
                        صحة المجتمعات
                    </span>
                    <button className="no-print" onClick={() => printCard(communitiesRef.current, 'صحة المجتمعات')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                        ⬇️ تحميل
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
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
                                    <td style={{ ...tdStyle, color: community.leader_name ? '#111827' : '#9CA3AF' }}>
                                        {community.leader_name ?? '—'}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        <StatusBadge status={community.status} />
                                    </td>
                                </tr>
                            ))}
                            {communitiesReport.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#9CA3AF' }}>
                                        لا توجد مجتمعات
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inactive employees table */}
            <div ref={inactiveRef} id="inactive" style={cardStyle}>
                <div style={cardHeaderStyle}>
                    <span className="sec-title" style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
                        موظفون غير مشاركين
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 600,
                            background: '#FEE2E2',
                            color: '#DC2626',
                        }}>
                            {inactiveEmployees.length}
                        </span>
                        <button className="no-print" onClick={() => printCard(inactiveRef.current, 'موظفون غير مشاركين')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                            ⬇️ تحميل
                        </button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
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
                                    <td style={{ ...tdStyle, color: '#6B7280', direction: 'ltr', textAlign: 'right' }}>
                                        {employee.email}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center', color: '#6B7280' }}>
                                        {employee.joined_date}
                                    </td>
                                    <td style={{ ...tdStyle, color: employee.community_name ? '#111827' : '#9CA3AF' }}>
                                        {employee.community_name ?? '—'}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        {employee.last_event_date ? (
                                            <span style={{ color: '#6B7280' }}>{employee.last_event_date}</span>
                                        ) : (
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 10px',
                                                borderRadius: 99,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                background: '#FEE2E2',
                                                color: '#DC2626',
                                            }}>
                                                لم يشارك أبداً
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {inactiveEmployees.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#9CA3AF' }}>
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
