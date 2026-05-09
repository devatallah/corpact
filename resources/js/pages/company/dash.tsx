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
}

export default function HrDashboard({ company, stats, communityParticipation, recentActivity }: Props) {
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
                    color="#3B5BDB"
                />
                <StatCard
                    emoji="🏘️"
                    label="المجتمعات النشطة"
                    value={stats.communities}
                    color="#0CA678"
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
                        <div style={{ fontSize: 13, color: '#7A8BA8', padding: '16px 0' }}>
                            لا توجد مجتمعات بعد
                        </div>
                    ) : (
                        communityParticipation.map((cp, i) => (
                            <div key={i} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>{cp.community_name}</span>
                                    <span style={{ fontSize: 11, color: '#7A8BA8' }}>
                                        {cp.member_count}/{cp.total_employees}
                                    </span>
                                </div>
                                <div className="bar-w">
                                    <div className="bar-f" style={{ width: `${cp.rate}%`, background: '#0CA678' }} />
                                </div>
                            </div>
                        ))
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
        </CompanyLayout>
    );
}
