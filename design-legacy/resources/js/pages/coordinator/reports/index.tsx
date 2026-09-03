import FilterTabs from '@/components/filter-tabs';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AdminLayout from '@/layouts/admin-layout';
import type { PaginatedResult } from '@/types/models';
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
    reports: PaginatedResult<ReportRow>;
    isPlatformAdmin: boolean;
    filters: { search?: string; status?: string; sort?: string; dir?: string };
    sort: SortState;
}

const STATUS_LABEL: Record<string, string> = {
    generated: 'مُولَّد — بانتظار التوصيات',
    submitted: 'التوصيات مرفوعة',
};

const statusOptions = [
    { label: 'الكل', value: '' },
    { label: 'بانتظار التوصيات', value: 'generated' },
    { label: 'التوصيات مرفوعة', value: 'submitted' },
];

const thStyle = { padding: '10px 14px', fontSize: 12, fontWeight: 600 } as const;
const tdStyle = { padding: '10px 14px', fontSize: 13 } as const;

export default function CoordinatorReportsIndex({ reports, isPlatformAdmin, filters, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        status: filters?.status,
        sort: filters?.sort,
        dir: filters?.dir,
    });

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

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث باسم الشركة أو الدورة (2026-08)..."
                    style={{ flex: 1, minWidth: 220, padding: '10px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                />
                <FilterTabs options={statusOptions} current={filters?.status ?? ''} />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th style={thStyle}>الشركة</th>
                            <SortableHeader label="الدورة" sortKey="period_key" sort={sort} initialDirection="desc" style={thStyle} />
                            <th style={thStyle}>معدل التفعيل</th>
                            <th style={thStyle}>فعاليات مكتملة</th>
                            <th style={thStyle}>مجتمعات خاملة</th>
                            <th style={thStyle}>التوصيات</th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} style={thStyle} />
                            <th style={thStyle} />
                        </tr>
                    </thead>
                    <tbody>
                        <ListStates
                            count={reports.data.length}
                            columns={8}
                            emptyTitle="لم يُولَّد تقرير بعد"
                            emptyHint="أول تقرير يصدر في اليوم الثاني من الشهر القادم. إن كنت تبحث أو تفلتر، وسّع المدى."
                        />
                        {reports.data.map((report) => (
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
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination links={reports.links} />
        </AdminLayout>
    );
}
