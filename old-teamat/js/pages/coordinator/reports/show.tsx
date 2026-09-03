import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

/* A13 — H §15 / G/المنسّق §3.

   اللقطة **غير قابلة للتعديل**: كل ما يكتبه المنسّق هنا توصيات من قائمتين
   مغلقتين + ملاحظة واحدة. سبب الإغلاق منصوص: «النص الحر لا يُنتج بيانات
   قابلة للتحليل» — واختيار القائمة هو ما يسمح لاحقاً بمعرفة أي تدخل نجح. */

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
    [key: string]: number | string | null;
    community_id: number | null;
    cause: string;
    action: string;
}

interface StoredRecommendation extends Recommendation {
    id: number;
    cause_label: string;
    action_label: string;
    community_name: string | null;
}

interface Props {
    report: {
        id: number;
        company_id: number;
        company_name: string;
        period_key: string;
        status: string;
        note: string | null;
        generated_at: string | null;
        delivered_at: string | null;
        submitted_at: string | null;
        snapshot: Snapshot;
        recommendations: StoredRecommendation[];
    };
    communities: { id: number; name: string }[];
    causeOptions: { value: string; label: string }[];
    actionOptions: { value: string; label: string }[];
    exports: { key: string; title: string }[];
}

const MOM_LABELS: Record<string, string> = {
    activation_rate: 'معدل التفعيل',
    attendance_rate: 'معدل الحضور',
    cancellation_rate: 'معدل الإلغاء',
    completed_events: 'الفعاليات المكتملة',
    active_communities: 'المجتمعات النشطة',
    cost_per_participation_halalas: 'التكلفة لكل مشاركة (هللة)',
};

const thStyle = { padding: '10px 14px', fontSize: 12, fontWeight: 600 } as const;
const tdStyle = { padding: '10px 14px', fontSize: 13 } as const;
const selectStyle = { padding: '8px 10px', border: '0.5px solid rgba(10,10,10,.15)', borderRadius: 8, width: '100%' } as const;

export default function CoordinatorReportShow({ report, communities, causeOptions, actionOptions, exports }: Props) {
    const s = report.snapshot;

    const [rows, setRows] = useState<Recommendation[]>(
        report.recommendations.map((r) => ({ community_id: r.community_id, cause: r.cause, action: r.action })),
    );
    const [note, setNote] = useState(report.note ?? '');
    const [saving, setSaving] = useState(false);

    function addRow() {
        setRows([...rows, { community_id: null, cause: causeOptions[0].value, action: actionOptions[0].value }]);
    }

    function updateRow(index: number, patch: Partial<Pick<Recommendation, 'community_id' | 'cause' | 'action'>>) {
        setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } as Recommendation : row)));
    }

    function removeRow(index: number) {
        setRows(rows.filter((_, i) => i !== index));
    }

    function submit() {
        setSaving(true);
        router.post(
            `/coordinator/reports/${report.id}/recommendations`,
            { recommendations: rows, note },
            { preserveScroll: true, onFinish: () => setSaving(false) },
        );
    }

    return (
        <AdminLayout>
            <Head title={`تقرير ${report.company_name} — ${report.period_key}`} />

            <PageHeader
                title={<>{report.company_name} — {report.period_key}</>}
                subtitle={<>
                لقطة ثابتة لا يُعاد حسابها · وُلِّدت {report.generated_at ? new Date(report.generated_at).toLocaleDateString('ar-SA') : '—'}
                </>}
            />
            <Link href="/coordinator/reports" style={{ fontSize: 12, color: '#D9381E' }}>← كل التقارير</Link>

            <div className="stat-row" style={{ marginTop: 16 }}>
                <StatCard emoji="✅" label="معدل التفعيل" value={`${s.activation_rate.rate}%`} change={`${s.activation_rate.numerator} من ${s.activation_rate.denominator}`} color="#2E7D32" />
                <StatCard emoji="📅" label="الفعاليات المكتملة" value={s.completed_events} change={`${s.created_events} أُنشئت`} color="#0A0A0A" />
                <StatCard emoji="😴" label="المجتمعات الخاملة" value={s.communities.dormant.length} change={`${s.communities.active.length} نشطاً`} color="#D9381E" />
                <StatCard emoji="🚫" label="معدل الإلغاء" value={`${s.cancellation_rate.rate}%`} change={`${s.cancellation_rate.numerator} من ${s.cancellation_rate.denominator}`} color="#C87D00" />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {exports.map((item) => (
                    <span key={item.key} style={{ display: 'inline-flex', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 8, overflow: 'hidden', fontSize: 12 }}>
                        <span style={{ padding: '8px 10px', opacity: 0.75 }}>{item.title}</span>
                        <a href={`/coordinator/reports/${report.id}/export/${item.key}?format=xlsx`} style={{ padding: '8px 10px', borderRight: '0.5px solid rgba(10,10,10,.1)', color: '#D9381E' }}>Excel</a>
                        <a href={`/coordinator/reports/${report.id}/export/${item.key}?format=pdf`} target="_blank" rel="noreferrer" style={{ padding: '8px 10px', borderRight: '0.5px solid rgba(10,10,10,.1)', color: '#D9381E' }}>PDF</a>
                    </span>
                ))}
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
                                <td style={tdStyle}>{delta.change > 0 ? `+${delta.change}` : delta.change}</td>
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
                                <tr><td style={{ ...tdStyle, textAlign: 'center', padding: 24, opacity: 0.7 }}>لا مجتمع خاملاً هذه الدورة.</td></tr>
                            ) : (
                                s.communities.dormant.map((community) => (
                                    <tr key={community.id}>
                                        <td style={tdStyle}>{community.name}</td>
                                        <td style={tdStyle}>
                                            {community.last_completed_at
                                                ? new Date(community.last_completed_at).toLocaleDateString('ar-SA')
                                                : 'بلا فعالية مكتملة'}
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
                            {s.cancellation_reasons.filter((row) => row.count > 0).length === 0 ? (
                                <tr><td style={{ ...tdStyle, textAlign: 'center', padding: 24, opacity: 0.7 }}>لا إلغاءات.</td></tr>
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

            <div className="card">
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>التوصيات</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 14 }}>
                    السبب والإجراء من قائمتين مغلقتين. لا تكتب في حقل الملاحظة ما يمكن اختياره من القائمة.
                </div>

                {rows.map((row, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                        <div>
                            <label style={{ fontSize: 11, opacity: 0.7, display: 'block', marginBottom: 4 }}>المجتمع</label>
                            <select
                                value={row.community_id ?? ''}
                                onChange={(e) => updateRow(index, { community_id: e.target.value === '' ? null : Number(e.target.value) })}
                                style={selectStyle}
                            >
                                <option value="">على مستوى الشركة</option>
                                {communities.map((community) => (
                                    <option key={community.id} value={community.id}>{community.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, opacity: 0.7, display: 'block', marginBottom: 4 }}>السبب</label>
                            <select value={row.cause} onChange={(e) => updateRow(index, { cause: e.target.value })} style={selectStyle}>
                                {causeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, opacity: 0.7, display: 'block', marginBottom: 4 }}>الإجراء</label>
                            <select value={row.action} onChange={(e) => updateRow(index, { action: e.target.value })} style={selectStyle}>
                                {actionOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <button type="button" onClick={() => removeRow(index)} className="pill" style={{ height: 36 }}>حذف</button>
                    </div>
                ))}

                <button type="button" onClick={addRow} className="pill" style={{ marginTop: 8 }}>+ إضافة توصية</button>

                <div style={{ marginTop: 16 }}>
                    <label style={{ fontSize: 11, opacity: 0.7, display: 'block', marginBottom: 4 }}>ملاحظة واحدة (اختيارية)</label>
                    <textarea
                        value={note}
                        maxLength={1000}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        style={{ ...selectStyle, resize: 'vertical' }}
                        placeholder="ما لا يمكن اختياره من القائمة فقط."
                    />
                </div>

                <button type="button" onClick={submit} disabled={saving} className="pill on" style={{ marginTop: 12 }}>
                    {saving ? 'جارٍ الحفظ…' : 'حفظ التوصيات'}
                </button>
            </div>
        </AdminLayout>
    );
}
