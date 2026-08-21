import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';

/* A13 — H §18 (المنسّق المُدار): لوحة موحّدة عبر الشركات المسندة إليه.
   شركة غير مسندة إليه لا تظهر هنا ولا يصلها بمعرّفها (404). */

interface ReportRow {
    id: number;
    company_id: number;
    company_name: string;
    period_key: string;
    status: string;
    delivered_at: string | null;
    submitted_at: string | null;
    activation_rate: number;
    completed_events: number;
    dormant_communities: number;
    recommendations_count: number;
}

interface Props {
    reports: ReportRow[];
    isPlatformAdmin: boolean;
}

const STATUS_LABEL: Record<string, string> = {
    generated: 'مُولَّد — بانتظار التوصيات',
    submitted: 'التوصيات مرفوعة',
};

const thStyle = { padding: '10px 14px', fontSize: 12, fontWeight: 600 } as const;
const tdStyle = { padding: '10px 14px', fontSize: 13 } as const;

export default function CoordinatorReportsIndex({ reports, isPlatformAdmin }: Props) {
    return (
        <AdminLayout>
            <Head title="التقارير الشهرية" />

            <div className="page-title">التقارير الشهرية</div>
            <div className="page-sub">
                {isPlatformAdmin
                    ? 'كل الشركات — بصفة أدمن المنصة'
                    : 'الشركات المسندة إليك فقط'}
                {' · '}تُولَّد آلياً في اليوم الثاني من كل شهر
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th style={thStyle}>الشركة</th>
                            <th style={thStyle}>الدورة</th>
                            <th style={thStyle}>معدل التفعيل</th>
                            <th style={thStyle}>فعاليات مكتملة</th>
                            <th style={thStyle}>مجتمعات خاملة</th>
                            <th style={thStyle}>التوصيات</th>
                            <th style={thStyle}>الحالة</th>
                            <th style={thStyle} />
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: 24, opacity: 0.7 }}>
                                    لم يُولَّد تقرير بعد — أول تقرير يصدر في اليوم الثاني من الشهر القادم.
                                </td>
                            </tr>
                        ) : (
                            reports.map((report) => (
                                <tr key={report.id}>
                                    <td style={tdStyle}>{report.company_name}</td>
                                    <td style={tdStyle}>{report.period_key}</td>
                                    <td style={tdStyle}>{report.activation_rate}%</td>
                                    <td style={tdStyle}>{report.completed_events}</td>
                                    <td style={tdStyle}>{report.dormant_communities}</td>
                                    <td style={tdStyle}>{report.recommendations_count}</td>
                                    <td style={tdStyle}>{STATUS_LABEL[report.status] ?? report.status}</td>
                                    <td style={tdStyle}>
                                        <Link href={`/coordinator/reports/${report.id}`} style={{ color: '#E03050', fontSize: 12 }}>
                                            فتح
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
