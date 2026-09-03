import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';
import CompanyLayout from '@/layouts/company-layout';
import type { Company } from '@/types/models';
import { Head, Link } from '@inertiajs/react';

/* A13 — H §15: التقرير الشهري كما وصل مسؤول الحساب — **لقطة ثابتة** لا
   يُعاد حسابها، والتوصيات أزواج (سبب ← إجراء) من قائمتين مغلقتين. */

interface Metric { numerator: number; denominator: number; rate: number; formula: string }
interface Delta { current: number; previous: number; change: number }

interface Snapshot {
    period: { key: string; label: string };
    previous_period: { key: string; label: string };
    completed_events: number;
    created_events: number;
    activation_rate: Metric;
    attendance_rate: Metric;
    cancellation_rate: Metric;
    cancellation_reasons: { status: string; label: string; count: number }[];
    communities: {
        window_days: number;
        active: { id: number; name: string }[];
        dormant: { id: number; name: string; last_completed_at: string | null }[];
    };
    department_participation: { department_name: string; attendees: number; employees: number; rate: number }[];
    attendance_count: number;
    company_spend: string;
    cost_per_participation: string;
    gmv: string;
    month_over_month: Record<string, Delta>;
}

interface Recommendation {
    id: number;
    community_name: string | null;
    cause_label: string;
    action_label: string;
}

interface Props {
    company: Company;
    report: {
        id: number;
        period_key: string;
        status: string;
        note: string | null;
        generated_at: string | null;
        delivered_at: string | null;
        submitted_at: string | null;
        snapshot: Snapshot;
        recommendations: Recommendation[];
    };
}

const MOM_LABELS: Record<string, string> = {
    activation_rate: 'معدل التفعيل',
    attendance_rate: 'معدل الحضور',
    cancellation_rate: 'معدل الإلغاء',
    completed_events: 'الفعاليات المكتملة',
    active_communities: 'المجتمعات النشطة',
    cost_per_participation_halalas: 'التكلفة لكل مشاركة (هللة)',
};

const thStyle = { padding: '10px 14px', fontSize: 12, color: 'rgba(10,10,10,.6)', fontWeight: 600 } as const;
const tdStyle = { padding: '10px 14px', fontSize: 13 } as const;

function ChangeBadge({ change, invert }: { change: number; invert?: boolean }) {
    const good = invert ? change <= 0 : change >= 0;
    const color = change === 0 ? 'rgba(10,10,10,.55)' : good ? '#2E7D32' : '#D9381E';
    const sign = change > 0 ? '+' : '';
    return <span style={{ color, fontWeight: 700, fontSize: 12 }}>{sign}{change}</span>;
}

export default function MonthlyReport({ company, report }: Props) {
    const s = report.snapshot;

    return (
        <CompanyLayout>
            <Head title={`التقرير الشهري ${report.period_key}`} />

            <div style={{ marginBottom: 20 }}>
                <PageHeader
                    title={<>التقرير الشهري — {report.period_key}</>}
                    subtitle={<>
                    {company.name} · لقطة ثابتة وُلِّدت في {report.generated_at ? new Date(report.generated_at).toLocaleDateString('ar-SA') : '—'}
                    </>}
                />
                <Link href="/company/reports" style={{ fontSize: 12, color: '#0A0A0A' }}>← عودة إلى التقارير</Link>
            </div>

            <div className="stat-row">
                <StatCard emoji="✅" label="معدل التفعيل" value={`${s.activation_rate.rate}%`} change={`${s.activation_rate.numerator} من ${s.activation_rate.denominator}`} color="#2E7D32" />
                <StatCard emoji="📅" label="الفعاليات المكتملة" value={s.completed_events} change={`${s.created_events} أُنشئت`} color="#0A0A0A" />
                <StatCard emoji="😴" label="المجتمعات الخاملة" value={s.communities.dormant.length} change={`${s.communities.active.length} نشطاً`} color="#D9381E" />
                <StatCard emoji="💸" label="التكلفة لكل مشاركة" value={`${s.cost_per_participation} ر.س`} change={`إنفاق ${s.company_spend}`} color="#C87D00" />
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto', marginBottom: 16 }}>
                <div style={{ padding: '14px 20px', borderBottom: '0.5px solid rgba(10,10,10,.1)', fontSize: 14, fontWeight: 700 }}>
                    المقارنة بالشهر السابق ({s.previous_period.key})
                </div>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th style={thStyle}>المؤشر</th>
                            <th style={thStyle}>{s.period.key}</th>
                            <th style={thStyle}>{s.previous_period.key}</th>
                            <th style={thStyle}>الفرق</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(s.month_over_month).map(([key, delta]) => (
                            <tr key={key}>
                                <td style={tdStyle}>{MOM_LABELS[key] ?? key}</td>
                                <td style={tdStyle}>{delta.current}</td>
                                <td style={tdStyle}>{delta.previous}</td>
                                <td style={tdStyle}>
                                    <ChangeBadge change={delta.change} invert={key === 'cancellation_rate' || key === 'cost_per_participation_halalas'} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '0.5px solid rgba(10,10,10,.1)', fontSize: 14, fontWeight: 700 }}>المجتمعات الخاملة</div>
                    <table className="portal-table">
                        <tbody>
                            {s.communities.dormant.length === 0 ? (
                                <tr><td style={{ ...tdStyle, textAlign: 'center', color: 'rgba(10,10,10,.55)', padding: 24 }}>لا مجتمع خاملاً — كل المجتمعات أقامت فعالية مكتملة.</td></tr>
                            ) : (
                                s.communities.dormant.map((community) => (
                                    <tr key={community.id}>
                                        <td style={tdStyle}>{community.name}</td>
                                        <td style={tdStyle}>
                                            {community.last_completed_at
                                                ? `آخر فعالية: ${new Date(community.last_completed_at).toLocaleDateString('ar-SA')}`
                                                : 'لم تُقم فعالية مكتملة بعد'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '0.5px solid rgba(10,10,10,.1)', fontSize: 14, fontWeight: 700 }}>أسباب الإلغاء</div>
                    <table className="portal-table">
                        <tbody>
                            {s.cancellation_reasons.every((row) => row.count === 0) ? (
                                <tr><td style={{ ...tdStyle, textAlign: 'center', color: 'rgba(10,10,10,.55)', padding: 24 }}>لا إلغاءات في هذه الدورة.</td></tr>
                            ) : (
                                s.cancellation_reasons.filter((row) => row.count > 0).map((row) => (
                                    <tr key={row.status}>
                                        <td style={tdStyle}>{row.label}</td>
                                        <td style={tdStyle}>{row.count}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <div style={{ padding: '14px 20px', borderBottom: '0.5px solid rgba(10,10,10,.1)' }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>التوصيات</div>
                    <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginTop: 3 }}>
                        مختارة من قائمة أسباب وإجراءات مغلقة — لا نص حر، كي يمكن لاحقاً معرفة أي تدخل نجح فعلاً
                    </div>
                </div>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th style={thStyle}>المجتمع</th>
                            <th style={thStyle}>السبب</th>
                            <th style={thStyle}>الإجراء المقترح</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.recommendations.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: 'rgba(10,10,10,.55)', padding: 24 }}>
                                    لا توصيات مرفقة — التحليل والتوصيات تُرفق مع خدمة المنسّق المُدار.
                                </td>
                            </tr>
                        ) : (
                            report.recommendations.map((recommendation) => (
                                <tr key={recommendation.id}>
                                    <td style={tdStyle}>{recommendation.community_name ?? 'على مستوى الشركة'}</td>
                                    <td style={tdStyle}>{recommendation.cause_label}</td>
                                    <td style={tdStyle}>{recommendation.action_label}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {report.note && (
                    <div style={{ padding: '14px 20px', borderTop: '0.5px solid rgba(10,10,10,.1)', fontSize: 13, background: '#FEF9E0' }}>
                        <strong style={{ fontSize: 12, color: 'rgba(10,10,10,.55)' }}>ملاحظة المنسّق:</strong>
                        <div style={{ marginTop: 4 }}>{report.note}</div>
                    </div>
                )}
            </div>
        </CompanyLayout>
    );
}
