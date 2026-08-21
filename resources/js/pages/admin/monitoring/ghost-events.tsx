import StatCard from '@/components/stat-card';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';

/* A13 — H §13 ⟶ §15: الإنذار المبكر لـ«الفعالية الشبح».

   الحضور التلقائي يعني أن فعالية لم تُقم فعلاً ولم يبلّغ عنها أحد ستُحتسب
   مكتملة فتُصرف للمزوّد وتدخل الفوترة. النص صريح: «يجب مراقبة معدل التعديلات
   بعد الاكتمال كمؤشر إنذار مبكر». والرقم وحده لا يقول شيئاً — **ارتفاعه**
   على خط الأساس هو الإشارة، ومعناه عطل تشغيلي في الميدان لا نشاط إداري. */

interface WeekRow {
    label: string;
    completed_events: number;
    post_completion_edited_events: number;
    post_completion_edit_rate: number;
    events_created: number;
    manual_state_change_events: number;
    manual_state_change_rate: number;
    locked_without_review: number;
    locked_without_review_rate: number;
}

interface ManualChange {
    id: number;
    event_id: number;
    event_title: string;
    company_name: string;
    from_status: string | null;
    to_status: string;
    reason: string | null;
    created_at: string;
}

interface Props {
    weeks: WeekRow[];
    latest: WeekRow;
    baseline: {
        post_completion_edit_rate: number;
        manual_state_change_rate: number;
        locked_without_review_rate: number;
    };
    companyId: number | null;
    companies: { id: number; name: string }[];
    recentManualChanges: ManualChange[];
}

const thStyle = { padding: '10px 14px', fontSize: 12, fontWeight: 600 } as const;
const tdStyle = { padding: '10px 14px', fontSize: 13 } as const;

function spikeColor(latest: number, baseline: number): string {
    if (baseline === 0) return latest > 0 ? '#D4820A' : '#0CA678';
    if (latest >= baseline * 2) return '#E03050';
    if (latest > baseline * 1.25) return '#D4820A';
    return '#0CA678';
}

function spikeNote(latest: number, baseline: number): string {
    if (baseline === 0 && latest === 0) return 'لا حركة على هذا المؤشر';
    if (latest >= baseline * 2 && baseline > 0) return `قفزة على خط الأساس ${baseline}% — يستحق فحصاً`;
    if (latest > baseline * 1.25 && baseline > 0) return `أعلى من خط الأساس ${baseline}%`;
    return `خط الأساس ${baseline}%`;
}

export default function GhostEventMonitor({ weeks, latest, baseline, companyId, companies, recentManualChanges }: Props) {
    function filterCompany(value: string) {
        router.get('/admin/monitoring/ghost-events', value === '' ? {} : { company_id: value }, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="مراقبة الفعالية الشبح" />

            <div className="page-title">الإنذار المبكر — الفعالية الشبح</div>
            <div className="page-sub">
                مراقبة أسبوعية لمعدل التعديل بعد الاكتمال ومعدل التدخل اليدوي. الارتفاع المفاجئ يعني أن الفعاليات
                لا تقع كما تُسجَّل — عطل تشغيلي، لا مؤشر نشاط إداري.
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, opacity: 0.7, display: 'block', marginBottom: 4 }}>الشركة</label>
                <select
                    value={companyId ?? ''}
                    onChange={(e) => filterCompany(e.target.value)}
                    style={{ padding: '8px 10px', border: '1px solid #232A3E', borderRadius: 8, minWidth: 220 }}
                >
                    <option value="">كل الشركات</option>
                    {companies.map((company) => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                </select>
            </div>

            <div className="stat-row">
                <StatCard
                    emoji="✏️"
                    label="تعديل الحضور بعد الاكتمال — الأسبوع الأخير"
                    value={`${latest.post_completion_edit_rate}%`}
                    change={spikeNote(latest.post_completion_edit_rate, baseline.post_completion_edit_rate)}
                    color={spikeColor(latest.post_completion_edit_rate, baseline.post_completion_edit_rate)}
                />
                <StatCard
                    emoji="🛠️"
                    label="تغيير الحالة يدوياً — الأسبوع الأخير"
                    value={`${latest.manual_state_change_rate}%`}
                    change={spikeNote(latest.manual_state_change_rate, baseline.manual_state_change_rate)}
                    color={spikeColor(latest.manual_state_change_rate, baseline.manual_state_change_rate)}
                />
                <StatCard
                    emoji="👻"
                    label="أُقفلت نافذتها بلا مراجعة"
                    value={`${latest.locked_without_review_rate}%`}
                    change={`${latest.locked_without_review} فعالية — الخانة التي تسكنها الفعالية الشبح`}
                    color={spikeColor(latest.locked_without_review_rate, baseline.locked_without_review_rate)}
                />
                <StatCard
                    emoji="📅"
                    label="فعاليات مكتملة — الأسبوع الأخير"
                    value={latest.completed_events}
                    change={`${latest.events_created} أُنشئت`}
                    color="#3B5BDB"
                />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #232A3E', fontSize: 14, fontWeight: 700 }}>
                    الأسابيع الثمانية الأخيرة
                </div>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th style={thStyle}>الأسبوع</th>
                            <th style={thStyle}>مكتملة</th>
                            <th style={thStyle}>عُدِّل حضورها</th>
                            <th style={thStyle}>معدل التعديل</th>
                            <th style={thStyle}>تدخل يدوي</th>
                            <th style={thStyle}>معدل التدخل</th>
                            <th style={thStyle}>بلا مراجعة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map((week) => (
                            <tr key={week.label}>
                                <td style={tdStyle}>{week.label}</td>
                                <td style={tdStyle}>{week.completed_events}</td>
                                <td style={tdStyle}>{week.post_completion_edited_events}</td>
                                <td style={{ ...tdStyle, color: spikeColor(week.post_completion_edit_rate, baseline.post_completion_edit_rate), fontWeight: 700 }}>
                                    {week.post_completion_edit_rate}%
                                </td>
                                <td style={tdStyle}>{week.manual_state_change_events}</td>
                                <td style={{ ...tdStyle, color: spikeColor(week.manual_state_change_rate, baseline.manual_state_change_rate), fontWeight: 700 }}>
                                    {week.manual_state_change_rate}%
                                </td>
                                <td style={tdStyle}>{week.locked_without_review}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #232A3E' }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>آخر التدخلات اليدوية</div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 3 }}>كل تدخل يدوي يحمل سبباً مكتوباً — اقرأ السبب قبل أن تتدخل مرة أخرى</div>
                </div>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th style={thStyle}>الفعالية</th>
                            <th style={thStyle}>الشركة</th>
                            <th style={thStyle}>من ← إلى</th>
                            <th style={thStyle}>السبب</th>
                            <th style={thStyle}>الوقت</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentManualChanges.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', padding: 24, opacity: 0.7 }}>
                                    لا تدخلات يدوية مسجّلة — وهذه هي الحالة الصحية.
                                </td>
                            </tr>
                        ) : (
                            recentManualChanges.map((change) => (
                                <tr key={change.id}>
                                    <td style={tdStyle}>{change.event_title}</td>
                                    <td style={tdStyle}>{change.company_name}</td>
                                    <td style={tdStyle}>{change.from_status ?? '—'} ← {change.to_status}</td>
                                    <td style={tdStyle}>{change.reason ?? '—'}</td>
                                    <td style={tdStyle}>{new Date(change.created_at).toLocaleString('ar-SA')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
