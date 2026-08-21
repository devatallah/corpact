import StatCard from '@/components/stat-card';
import CompanyLayout from '@/layouts/company-layout';
import type { Company } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';

/* A13 — H §15: كل رقم على هذه الصفحة يأتي من قاموس المؤشرات في الخادم.
   لا معادلة تُحسب في الواجهة، و«معدل التفعيل» هو المؤشر الأول لا عدد
   المسجلين (G/الشركة §6). حجم التداول والإنفاق حقلان منفصلان لا يُجمعان. */

interface Metric {
    key: string;
    label: string;
    numerator: number;
    denominator: number;
    rate: number;
    formula: string;
}

interface CommunityRow {
    id: number;
    name: string;
    last_completed_at: string | null;
    leaderless_dormant: boolean;
}

interface DepartmentRow {
    department_id: number | null;
    department_name: string;
    attendees: number;
    employees: number;
    rate: number;
}

interface Kpi {
    period: { key: string; label: string; start: string; end: string };
    activation_rate: Metric;
    attendance_rate: Metric;
    cancellation_rate: Metric;
    cancellation_reasons: Record<string, number>;
    department_participation: DepartmentRow[];
    communities: {
        window_days: number;
        as_of: string;
        active: CommunityRow[];
        dormant: CommunityRow[];
        metric: Metric;
    };
    completed_events: number;
    created_events: number;
    attendance_count: number;
    company_spend: string;
    company_spend_halalas: number;
    gmv: string;
    gmv_halalas: number;
    cost_per_participation: string;
    cost_per_participation_halalas: number;
}

interface MonthlyReportRow {
    id: number;
    period_key: string;
    delivered_at: string | null;
    activation_rate: number;
    completed_events: number;
    recommendations_count: number;
}

interface Props {
    company: Company;
    period: { key: string; label: string; start: string; end: string };
    periodOptions: { key: string; label: string }[];
    kpi: Kpi;
    exports: { key: string; title: string }[];
    monthlyReports: MonthlyReportRow[];
}

const CANCELLATION_LABELS: Record<string, string> = {
    cancelled_min_not_met: 'لم يبلغ الحد الأدنى',
    cancelled_provider: 'إلغاء من المزوّد',
    cancelled_company: 'إلغاء من الشركة',
    cancelled_payment_failed: 'فشل التحصيل',
};

const cardStyle = { padding: 0, overflow: 'hidden' } as const;
const thStyle = { padding: '10px 14px', fontSize: 12, color: '#666', fontWeight: 600 } as const;
const tdStyle = { padding: '10px 14px', fontSize: 13 } as const;

function sectionHeader(title: string, sub?: string) {
    return (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0EDE8' }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
            {sub && <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{sub}</div>}
        </div>
    );
}

function fmtDate(value: string | null) {
    return value ? new Date(value).toLocaleDateString('ar-SA') : '—';
}

export default function ReportsIndex({ company, period, periodOptions, kpi, exports, monthlyReports }: Props) {
    const cancellations = Object.entries(kpi.cancellation_reasons);
    const totalCancelled = cancellations.reduce((sum, [, count]) => sum + count, 0);

    function changePeriod(key: string) {
        router.get('/company/reports', { period: key }, { preserveScroll: true, preserveState: false });
    }

    return (
        <CompanyLayout>
            <Head title="التقارير والمؤشرات" />

            <div style={{ marginBottom: 20 }}>
                <div className="page-title">التقارير والمؤشرات</div>
                <div className="page-sub">{company.name} — {period.label} (بتوقيت الرياض)</div>
            </div>

            <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>الفترة</label>
                    <select
                        value={period.key}
                        onChange={(e) => changePeriod(e.target.value)}
                        style={{ padding: '8px 10px', border: '1px solid #DDD', borderRadius: 8, minWidth: 160 }}
                    >
                        {periodOptions.map((option) => (
                            <option key={option.key} value={option.key}>{option.label}</option>
                        ))}
                    </select>
                </div>
                <span style={{ flex: 1 }} />
                <div>
                    <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>التصدير</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {exports.map((item) => (
                            <span key={item.key} style={{ display: 'inline-flex', border: '1px solid #DDD', borderRadius: 8, overflow: 'hidden' }}>
                                <span style={{ padding: '8px 10px', fontSize: 12, background: '#FAFAFA' }}>{item.title}</span>
                                <a
                                    href={`/company/reports/export/${item.key}?format=xlsx&period=${period.key}`}
                                    style={{ padding: '8px 10px', fontSize: 12, borderRight: '1px solid #DDD', color: '#1A56DB' }}
                                >
                                    Excel
                                </a>
                                <a
                                    href={`/company/reports/export/${item.key}?format=pdf&period=${period.key}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ padding: '8px 10px', fontSize: 12, borderRight: '1px solid #DDD', color: '#1A56DB' }}
                                >
                                    PDF
                                </a>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* المؤشر الأول: معدل التفعيل */}
            <div className="stat-row">
                <StatCard
                    emoji="✅"
                    label="معدل التفعيل — المؤشر الأول"
                    value={`${kpi.activation_rate.rate}%`}
                    change={`${kpi.activation_rate.numerator} من ${kpi.activation_rate.denominator} موظفاً نشطاً`}
                    color="#059669"
                />
                <StatCard
                    emoji="🎯"
                    label="معدل الحضور"
                    value={`${kpi.attendance_rate.rate}%`}
                    change={`${kpi.attendance_rate.numerator} من ${kpi.attendance_rate.denominator} مقعداً محجوزاً`}
                    color="#1A56DB"
                />
                <StatCard
                    emoji="🏘️"
                    label={`المجتمعات النشطة (${kpi.communities.window_days} يوماً)`}
                    value={`${kpi.communities.active.length}`}
                    change={`${kpi.communities.dormant.length} خاملاً من ${kpi.communities.metric.denominator}`}
                    color="#0CA678"
                />
                <StatCard
                    emoji="🚫"
                    label="معدل الإلغاء"
                    value={`${kpi.cancellation_rate.rate}%`}
                    change={`${kpi.cancellation_rate.numerator} ملغاة من ${kpi.cancellation_rate.denominator} منشأة`}
                    color="#DC2626"
                />
            </div>

            {/* الإنفاق وحجم التداول — بطاقتان منفصلتان صراحةً (H §15) */}
            <div className="stat-row">
                <StatCard
                    emoji="💸"
                    label="التكلفة لكل مشاركة"
                    value={`${kpi.cost_per_participation} ر.س`}
                    change={`إنفاق ${kpi.company_spend} ÷ ${kpi.attendance_count} مشاركة`}
                    color="#B45309"
                />
                <StatCard
                    emoji="🧾"
                    label="إنفاق الشركة في الفترة"
                    value={`${kpi.company_spend} ر.س`}
                    change="ما خرج فعلاً من محافظ الشركة"
                    color="#8A7868"
                />
                <StatCard
                    emoji="📊"
                    label="حجم التداول — ليس ما تدفعه لتيمات"
                    value={`${kpi.gmv} ر.س`}
                    change="قيمة الفعاليات المكتملة"
                    color="#6B7280"
                />
                <StatCard
                    emoji="📅"
                    label="الفعاليات المكتملة"
                    value={kpi.completed_events}
                    change={`${kpi.created_events} فعالية أُنشئت`}
                    color="#3B5BDB"
                />
            </div>

            <div className="card" style={{ background: '#FFF8E6', border: '1px solid #F0D9A0', fontSize: 13, marginBottom: 16 }}>
                ℹ️ «حجم التداول» ليس ما تدفعه لتيمات ولا إيراداً لها. ما تدفعه الشركة هو رسوم النظام + الدعم الذي اخترت
                تحمّله + خدمة المنسّق إن تعاقدت عليها — وتراه في صفحة الفواتير.
            </div>

            {/* المشاركة حسب الإدارة */}
            <div className="card" style={{ ...cardStyle, marginBottom: 16 }}>
                {sectionHeader('المشاركة حسب الإدارة', 'الحاضرون منسوبون للإدارة وقت الفعالية لا لإدارتهم الحالية')}
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th style={thStyle}>الإدارة</th>
                            <th style={thStyle}>حضروا</th>
                            <th style={thStyle}>موظفو الإدارة</th>
                            <th style={thStyle}>النسبة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kpi.department_participation.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#888', padding: 24 }}>
                                    لا توجد إدارات ولا مشاركات في هذه الفترة.
                                </td>
                            </tr>
                        ) : (
                            kpi.department_participation.map((row) => (
                                <tr key={row.department_id ?? 'none'}>
                                    <td style={tdStyle}>{row.department_name}</td>
                                    <td style={tdStyle}>{row.attendees}</td>
                                    <td style={tdStyle}>{row.employees}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="bar-wrap" style={{ flex: 1, maxWidth: 160 }}>
                                                <div className="bar-fill" style={{ width: `${Math.min(100, row.rate)}%`, background: row.rate === 0 ? '#DC2626' : '#059669' }} />
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: 700 }}>{row.rate}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* المجتمعات النشطة والخاملة */}
                <div className="card" style={cardStyle}>
                    {sectionHeader('المجتمعات النشطة والخاملة', `النشط: أقام فعالية مكتملة خلال ${kpi.communities.window_days} يوماً`)}
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th style={thStyle}>المجتمع</th>
                                <th style={thStyle}>الحالة</th>
                                <th style={thStyle}>آخر فعالية مكتملة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kpi.communities.active.length === 0 && kpi.communities.dormant.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: '#888', padding: 24 }}>
                                        لا توجد مجتمعات بعد.
                                    </td>
                                </tr>
                            ) : (
                                [
                                    ...kpi.communities.active.map((c) => ({ ...c, active: true })),
                                    ...kpi.communities.dormant.map((c) => ({ ...c, active: false })),
                                ].map((row) => (
                                    <tr key={row.id}>
                                        <td style={tdStyle}>{row.name}</td>
                                        <td style={tdStyle}>
                                            <span className="pill" style={{ background: row.active ? '#D1FAE5' : '#FEE2E2', color: row.active ? '#059669' : '#DC2626' }}>
                                                {row.active ? 'نشط' : 'خامل'}
                                            </span>
                                            {row.leaderless_dormant && (
                                                <span style={{ fontSize: 11, color: '#B45309', marginRight: 6 }}>بلا قائد</span>
                                            )}
                                        </td>
                                        <td style={tdStyle}>{fmtDate(row.last_completed_at)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* أسباب الإلغاء */}
                <div className="card" style={cardStyle}>
                    {sectionHeader('أسباب الإلغاء', 'السبب حالة من آلة الحالات لا نص حر')}
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th style={thStyle}>السبب</th>
                                <th style={thStyle}>العدد</th>
                                <th style={thStyle}>من الملغاة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {totalCancelled === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: '#888', padding: 24 }}>
                                        لا إلغاءات في هذه الفترة.
                                    </td>
                                </tr>
                            ) : (
                                cancellations.map(([status, count]) => (
                                    <tr key={status}>
                                        <td style={tdStyle}>{CANCELLATION_LABELS[status] ?? status}</td>
                                        <td style={tdStyle}>{count}</td>
                                        <td style={tdStyle}>
                                            {totalCancelled === 0 ? '0%' : `${Math.round((count / totalCancelled) * 100)}%`}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* التقارير الشهرية المُسلَّمة */}
            <div className="card" style={cardStyle}>
                {sectionHeader('التقارير الشهرية', 'تصل آلياً في اليوم الثاني من كل شهر — لقطة ثابتة لا يُعاد حسابها')}
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th style={thStyle}>الدورة</th>
                            <th style={thStyle}>معدل التفعيل</th>
                            <th style={thStyle}>فعاليات مكتملة</th>
                            <th style={thStyle}>توصيات</th>
                            <th style={thStyle}>وصل في</th>
                            <th style={thStyle} />
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyReports.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#888', padding: 24 }}>
                                    لم يصل تقرير شهري بعد — أول تقرير يصل في اليوم الثاني من الشهر القادم.
                                </td>
                            </tr>
                        ) : (
                            monthlyReports.map((report) => (
                                <tr key={report.id}>
                                    <td style={tdStyle}>{report.period_key}</td>
                                    <td style={tdStyle}>{report.activation_rate}%</td>
                                    <td style={tdStyle}>{report.completed_events}</td>
                                    <td style={tdStyle}>{report.recommendations_count}</td>
                                    <td style={tdStyle}>{fmtDate(report.delivered_at)}</td>
                                    <td style={tdStyle}>
                                        <Link href={`/company/reports/monthly/${report.id}`} style={{ color: '#1A56DB', fontSize: 12 }}>
                                            عرض التقرير
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </CompanyLayout>
    );
}
