import { Head, Link } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Card, Note, PageHeader, StatCard, TableShell, Tbody, Td, Th, Thead, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §15 — تقارير المنسّق المُدار.
 *
 * The coordinator's queue. A report is generated automatically, gets its
 * recommendations from a human, is submitted, and only then delivered to the
 * company — so the status column is the actual work queue, and «مُسلَّم» is
 * the only state the company can see.
 *
 * Dormant communities are surfaced as their own column because they are the
 * single most common thing a coordinator is paid to notice.
 */
export const REPORT_STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
    generated: { label: 'مولَّد — بانتظار التوصيات', tone: 'warning' },
    submitted: { label: 'مُرسَل للمراجعة', tone: 'warning' },
    delivered: { label: 'مُسلَّم للشركة', tone: 'success' },
};

type ReportRow = {
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
};

export default function CoordinatorReports({
    reports,
    isPlatformAdmin,
    filters,
    sort,
}: {
    reports: Paginated<ReportRow>;
    isPlatformAdmin: boolean;
    filters: { search?: string; status?: string };
    sort: SortState;
}) {
    const awaiting = reports.data.filter((row) => row.status !== 'delivered').length;

    return (
        <AdminLayout>
            <Head title="تقارير المنسّق" />

            <PageHeader
                icon={ClipboardList}
                title="تقارير المنسّق المُدار"
                subtitle="التقرير يُولَّد آلياً، وتُضيف أنت التوصيات — ثم يُسلَّم للشركة."
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي التقارير" value={reports.total} />
                <StatCard
                    label="في هذه الصفحة تنتظر عملاً"
                    value={awaiting}
                    tone={awaiting > 0 ? 'warning' : 'success'}
                    hint={awaiting > 0 ? 'لم تُسلَّم بعد' : 'كلها مُسلَّمة'}
                />
            </div>

            {!isPlatformAdmin && (
                <Note title="نطاقك">
                    ترى تقارير الشركات المسندة إليك فقط. شركة خارج إسنادك غير موجودة بالنسبة لهذه الصفحة — لا محجوبة.
                </Note>
            )}

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالشركة أو الدورة…" />
                    <FilterSelect
                        name="status"
                        label="الحالة"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['generated', 'مولَّد — بانتظار التوصيات'],
                            ['submitted', 'مُرسَل للمراجعة'],
                            ['delivered', 'مُسلَّم للشركة'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>الشركة</Th>
                        <Th>
                            <SortableHeader label="الدورة" sortKey="period_key" sort={sort} />
                        </Th>
                        <Th>معدل التفعيل</Th>
                        <Th>فعاليات مكتملة</Th>
                        <Th>مجتمعات خاملة</Th>
                        <Th>التوصيات</Th>
                        <Th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                        </Th>
                    </Thead>

                    <Tbody>
                        {reports.data.map((report) => (
                            <Tr key={report.id}>
                                <Td>
                                    <Link href={`/coordinator/reports/${report.id}`} className="font-extrabold text-ink hover:underline">
                                        {report.company_name}
                                    </Link>
                                </Td>
                                <Td className="font-mono text-ink/85">{report.period_key}</Td>
                                <Td className="font-mono font-bold text-ink">{report.activation_rate}٪</Td>
                                <Td className="font-mono text-ink/80">{report.completed_events}</Td>
                                <Td>
                                    <span
                                        className={`font-mono font-bold ${report.dormant_communities > 0 ? 'text-warning' : 'text-ink/60'}`}
                                    >
                                        {report.dormant_communities}
                                    </span>
                                </Td>
                                <Td>
                                    {report.recommendations_count === 0 ? (
                                        <Badge tone="warning">لا توصيات بعد</Badge>
                                    ) : (
                                        <span className="font-mono font-bold text-ink">{report.recommendations_count}</span>
                                    )}
                                </Td>
                                <Td>
                                    <Badge tone={REPORT_STATUS[report.status]?.tone ?? 'neutral'}>
                                        {REPORT_STATUS[report.status]?.label ?? report.status}
                                    </Badge>
                                    {report.delivered_at && (
                                        <span className="block font-mono text-[10px] text-ink/45 mt-0.5">
                                            {new Date(report.delivered_at).toLocaleDateString('ar-SA')}
                                        </span>
                                    )}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={reports.data.length}
                            colSpan={7}
                            empty="لا تقارير مطابقة."
                            emptyHint="تُولَّد التقارير آلياً في بداية كل دورة للشركات المشتركة في خدمة المنسّق المُدار."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={reports} />
                    <Pagination page={reports} />
                </div>
            </Card>
        </AdminLayout>
    );
}
