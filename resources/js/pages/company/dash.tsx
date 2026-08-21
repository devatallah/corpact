import CompanyLayout from '@/layouts/company-layout';
import StatCard from '@/components/stat-card';
import { fmtDateTime } from '@/lib/utils';
import type { Company, ActivityLog } from '@/types/models';
import { Head } from '@inertiajs/react';

/* A13 — H §18: «لوحة الشركة: التفعيل، المشاركة حسب الإدارة، الإنفاق،
   المجتمعات النشطة والخاملة». **معدل التفعيل هو المؤشر الأول لا عدد
   المسجلين** (G/الشركة §6)، و«نشط» للمجتمع = أقام فعالية مكتملة خلال 30
   يوماً، لا عدد أعضائه. */

interface Metric { numerator: number; denominator: number; rate: number; formula: string }

interface CommunityRow { id: number; name: string; last_completed_at: string | null; leaderless_dormant: boolean }

interface DepartmentRow { department_id: number | null; department_name: string; attendees: number; employees: number; rate: number }

interface LeaderboardEntry { id: number; name: string; avatar?: string | null; department_name?: string | null; events_count: number; }
interface Leaderboard { top_employees: LeaderboardEntry[]; top_departments: LeaderboardEntry[]; top_communities: LeaderboardEntry[]; }

interface Props {
    company: Company;
    stats: {
        period: { key: string; label: string };
        activation: Metric;
        attendance: Metric;
        active_communities: number;
        dormant_communities: number;
        completed_events: number;
        attendance_count: number;
        cost_per_participation: string;
        company_spend: string;
        company_spend_halalas: number;
        wallet_balance: string;
        wallet_balance_halalas: number;
        active_employees: number;
    };
    communityActivity: { window_days: number; active: CommunityRow[]; dormant: CommunityRow[] };
    departmentParticipation: DepartmentRow[];
    recentActivity: ActivityLog[];
    leaderboard: Leaderboard;
}

const rankColors = ['#D4A017', '#9CA3AF', '#CD7F32'];

export default function HrDashboard({ company, stats, communityActivity, departmentParticipation, recentActivity, leaderboard }: Props) {
    return (
        <CompanyLayout>
            <Head title="لوحة التحكم" />

            <div className="page-title">لوحة التحكم</div>
            <div className="page-sub">{company.name} — {stats.period.label}</div>

            <div className="stat-row">
                <StatCard
                    emoji="✅"
                    label="معدل التفعيل — المؤشر الأول"
                    value={`${stats.activation.rate}%`}
                    change={`${stats.activation.numerator} من ${stats.activation.denominator} موظفاً نشطاً`}
                    color="#059669"
                />
                <StatCard
                    emoji="🏘️"
                    label={`المجتمعات النشطة (${communityActivity.window_days} يوماً)`}
                    value={stats.active_communities}
                    change={`${stats.dormant_communities} خاملاً`}
                    color="#0CA678"
                />
                <StatCard
                    emoji="💸"
                    label="التكلفة لكل مشاركة"
                    value={`${stats.cost_per_participation} ر`}
                    change={`إنفاق ${stats.company_spend} ÷ ${stats.attendance_count} مشاركة`}
                    color="#D4820A"
                />
                <StatCard
                    emoji="💰"
                    label="الرصيد المتبقي"
                    value={`${stats.wallet_balance} ر`}
                    color="#E03050"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
                <div className="card" style={{ marginBottom: 0 }}>
                    <div className="sec-title">المشاركة حسب الإدارة</div>
                    <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 10 }}>
                        منسوبة للإدارة وقت الفعالية لا للإدارة الحالية
                    </div>
                    {departmentParticipation.length === 0 ? (
                        <div style={{ fontSize: 13, color: '#7A8BA8', padding: '16px 0' }}>
                            لا توجد إدارات ولا مشاركات بعد
                        </div>
                    ) : (
                        departmentParticipation.map((row) => (
                            <div key={row.department_id ?? 'none'} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>{row.department_name}</span>
                                    <span style={{ fontSize: 11, color: '#7A8BA8' }}>
                                        {row.attendees}/{row.employees}
                                    </span>
                                </div>
                                <div className="bar-w">
                                    <div className="bar-f" style={{ width: `${Math.min(100, row.rate)}%`, background: row.rate === 0 ? '#E03050' : '#0CA678' }} />
                                </div>
                            </div>
                        ))
                    )}
                    {communityActivity.dormant.length > 0 && (
                        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #F0EDE8' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>مجتمعات خاملة تحتاج تدخلاً</div>
                            <div style={{ fontSize: 12, color: '#7A8BA8' }}>
                                {communityActivity.dormant.map((c) => c.name).join(' · ')}
                            </div>
                        </div>
                    )}
                </div>

                <div className="card" style={{ marginBottom: 0 }}>
                    <div className="sec-title">آخر النشاطات</div>
                    {recentActivity.length === 0 ? (
                        <div style={{ fontSize: 13, color: '#7A8BA8', padding: '16px 0' }}>
                            لا توجد نشاطات حديثة
                        </div>
                    ) : (
                        recentActivity.map((activity) => (
                            <div key={activity.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 10,
                                    background: '#0CA67818', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16, flexShrink: 0
                                }}>
                                    📋
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, lineHeight: 1.4 }}>{activity.description}</div>
                                    <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 3 }}>
                                        {fmtDateTime(activity.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {/* Leaderboard */}
            {(leaderboard.top_departments.length > 0 || leaderboard.top_employees.length > 0) && (
                <div style={{ marginTop: 24 }}>
                    <div className="page-title" style={{ fontSize: 16, marginBottom: 16 }}>ترتيب النشاط هذا الشهر</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {/* Departments */}
                        {leaderboard.top_departments.length > 0 && (
                            <div className="card">
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>الأقسام</div>
                                {leaderboard.top_departments.slice(0, 5).map((dept, idx) => (
                                    <div key={dept.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: idx < leaderboard.top_departments.length - 1 ? '1px solid #F0EDE8' : 'none' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: rankColors[idx] ?? '#E4E9F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                                        <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{dept.name}</div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#8A7868' }}>{dept.events_count}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Employees */}
                        {leaderboard.top_employees.length > 0 && (
                            <div className="card">
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>الموظفين الأكثر نشاطا</div>
                                {leaderboard.top_employees.slice(0, 5).map((emp, idx) => (
                                    <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: idx < leaderboard.top_employees.length - 1 ? '1px solid #F0EDE8' : 'none' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: rankColors[idx] ?? '#E4E9F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                                            {emp.department_name && <div style={{ fontSize: 10, color: '#8A7868' }}>{emp.department_name}</div>}
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#8A7868' }}>{emp.events_count}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </CompanyLayout>
    );
}
