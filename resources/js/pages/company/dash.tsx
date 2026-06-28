import CompanyLayout from '@/layouts/company-layout';
import StatCard from '@/components/stat-card';
import { fmtDateTime } from '@/lib/utils';
import type { Company, ActivityLog } from '@/types/models';
import { Head } from '@inertiajs/react';

interface CommunityParticipation {
    community_name: string;
    member_count: number;
    total_employees: number;
    rate: number;
}

interface LeaderboardEntry { id: number; name: string; avatar?: string | null; department_name?: string | null; events_count: number; }
interface Leaderboard { top_employees: LeaderboardEntry[]; top_departments: LeaderboardEntry[]; top_communities: LeaderboardEntry[]; }

interface Props {
    company: Company;
    stats: {
        active_employees: number;
        communities: number;
        monthly_events: number;
        wallet_balance: number;
    };
    communityParticipation: CommunityParticipation[];
    recentActivity: ActivityLog[];
    leaderboard: Leaderboard;
}

const rankColors = ['#D4A017', '#9CA3AF', '#CD7F32'];

export default function HrDashboard({ company, stats, communityParticipation, recentActivity, leaderboard }: Props) {
    return (
        <CompanyLayout>
            <Head title="لوحة التحكم" />

            <div className="page-title">لوحة التحكم</div>
            <div className="page-sub">{company.name}</div>

            <div className="stat-row">
                <StatCard
                    emoji="👥"
                    label="الموظفون النشطون"
                    value={stats.active_employees}
                    change={`من ${company.employee_count} موظف`}
                    color="#18A86B"
                />
                <StatCard
                    emoji="🏘️"
                    label="المجتمعات النشطة"
                    value={stats.communities}
                    color="#18A86B"
                />
                <StatCard
                    emoji="📅"
                    label="الفعاليات هذا الشهر"
                    value={stats.monthly_events}
                    color="#D4820A"
                />
                <StatCard
                    emoji="💰"
                    label="الرصيد المتبقي"
                    value={`${stats.wallet_balance.toLocaleString()} ر`}
                    color="#E03050"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
                <div className="card" style={{ marginBottom: 0 }}>
                    <div className="sec-title">نشاط المجتمعات</div>
                    {communityParticipation.length === 0 ? (
                        <div style={{ fontSize: 13, color: '#999', padding: '16px 0' }}>
                            لا توجد مجتمعات بعد
                        </div>
                    ) : (
                        communityParticipation.map((cp, i) => (
                            <div key={i} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>{cp.community_name}</span>
                                    <span style={{ fontSize: 11, color: '#999' }}>
                                        {cp.member_count}/{cp.total_employees}
                                    </span>
                                </div>
                                <div className="bar-w">
                                    <div className="bar-f" style={{ width: `${cp.rate}%`, background: '#18A86B' }} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="card" style={{ marginBottom: 0 }}>
                    <div className="sec-title">آخر النشاطات</div>
                    {recentActivity.length === 0 ? (
                        <div style={{ fontSize: 13, color: '#999', padding: '16px 0' }}>
                            لا توجد نشاطات حديثة
                        </div>
                    ) : (
                        recentActivity.map((activity) => (
                            <div key={activity.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 10,
                                    background: '#18A86B18', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16, flexShrink: 0
                                }}>
                                    📋
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, lineHeight: 1.4 }}>{activity.description}</div>
                                    <div style={{ fontSize: 10, color: '#999', marginTop: 3 }}>
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
                                    <div key={dept.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: idx < leaderboard.top_departments.length - 1 ? '1px solid #EBEBEB' : 'none' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: rankColors[idx] ?? '#EBEBEB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                                        <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{dept.name}</div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#666' }}>{dept.events_count}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Employees */}
                        {leaderboard.top_employees.length > 0 && (
                            <div className="card">
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>الموظفين الأكثر نشاطا</div>
                                {leaderboard.top_employees.slice(0, 5).map((emp, idx) => (
                                    <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: idx < leaderboard.top_employees.length - 1 ? '1px solid #EBEBEB' : 'none' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: rankColors[idx] ?? '#EBEBEB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                                            {emp.department_name && <div style={{ fontSize: 10, color: '#666' }}>{emp.department_name}</div>}
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#666' }}>{emp.events_count}</div>
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
