import PageHeader from '@/components/page-header';
import FilterTabs from '@/components/filter-tabs';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import StatCard from '@/components/stat-card';
import StatusBadge from '@/components/status-badge';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import PartnerLayout from '@/layouts/partner-layout';
import type { PaginatedResult, Partner } from '@/types/models';
import { Head, Link } from '@inertiajs/react';

interface StatementRow {
    id: number;
    period_key: string;
    period_start: string | null;
    period_end: string | null;
    status: string;
    items_count: number;
    gross_amount: string;
    commission_amount: string;
    net_amount: string;
    paid_at: string | null;
}

interface Totals {
    paid_net: string;
    draft_net: string;
    approved_net: string;
    unstated_net: string;
    payouts_blocked: boolean;
}

interface Props {
    partner: Partner;
    statements: PaginatedResult<StatementRow>;
    totals: Totals;
    filters?: { status?: string; search?: string; sort?: string; dir?: string };
    sort: SortState;
}

/**
 * الخادم يقبل `status` (مسودة/معتمد/مدفوع) منذ A11 وكانت الشاشة تُعلنه في
 * `Props` ثم تهمله — فلترة بلا واجهة. صار له ضابط ظاهر (H §18).
 */
const statusOptions = [
    { label: 'الكل', value: '' },
    { label: 'مسودة', value: 'draft' },
    { label: 'معتمد', value: 'approved' },
    { label: 'مدفوع', value: 'paid' },
];

export default function SettlementsIndex({ statements, totals, filters, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        status: filters?.status,
        sort: filters?.sort,
        dir: filters?.dir,
    });

    return (
        <PartnerLayout>
            <Head title="التسويات" />

            <div style={{ marginBottom: 24 }}>
                <PageHeader
                    title={<>المستحقات والتسويات</>}
                    subtitle={<>
                    بند التسوية يُنشأ عند اكتمال الفعالية — لا قبله. الكشف يُولَّد كل 15 يوماً ويمر بمسودة ← معتمد ←
                    مدفوع. العمولة تُقتطع من مستحقاتك ولا تُضاف على السعر المعروض.
                    </>}
                />
            </div>

            {totals.payouts_blocked && (
                <div
                    className="card"
                    style={{ borderColor: '#C87D00', color: '#C87D00', fontWeight: 700, marginBottom: 16 }}
                >
                    حسابك البنكي غير معتمد — لا يمكن صرف أي كشف قبل اعتماده. حدّث بياناتك من صفحة الحساب البنكي.
                </div>
            )}

            <div className="stat-row">
                <StatCard emoji="✅" label="مصروف إليك (ريال)" value={totals.paid_net} color="#2E7D32" />
                <StatCard emoji="🕐" label="معتمد بانتظار الصرف" value={totals.approved_net} color="#0A0A0A" />
                <StatCard emoji="📝" label="مسودة قيد المراجعة" value={totals.draft_net} color="#C87D00" />
                <StatCard emoji="⏭️" label="بنود للكشف القادم" value={totals.unstated_net} color="rgba(10,10,10,.55)" />
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالفترة أو مرجع التحويل..."
                    style={{ flex: 1, minWidth: 200, padding: '9px 14px', background: '#fff', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 10, fontSize: 13, color: '#0A0A0A', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                />
                <FilterTabs options={statusOptions} current={filters?.status ?? ''} />
            </div>

            <div className="card">
                <div style={{ overflow: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <SortableHeader label="الفترة" sortKey="period_end" sort={sort} initialDirection="desc" />
                                <SortableHeader label="الفعاليات" sortKey="items_count" sort={sort} initialDirection="desc" />
                                <SortableHeader label="الإجمالي" sortKey="gross_amount" sort={sort} initialDirection="desc" />
                                <SortableHeader label="العمولة" sortKey="commission_amount" sort={sort} initialDirection="desc" />
                                <SortableHeader label="الصافي" sortKey="net_amount" sort={sort} initialDirection="desc" />
                                <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <ListStates
                                count={statements.data.length}
                                columns={7}
                                emptyTitle="لا كشوف بعد"
                                emptyHint="أول كشف تسوية يُولَّد بعد اكتمال فعالياتك في الفترة. إن كنت تبحث أو تفلتر، وسّع المدى."
                            />
                            {statements.data.map((row) => (
                                <tr key={row.id}>
                                    <td style={{ fontWeight: 700 }}>
                                        {row.period_key}
                                        <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)' }}>
                                            {row.period_start} → {row.period_end}
                                        </div>
                                    </td>
                                    <td>{row.items_count}</td>
                                    <td>{row.gross_amount} ر</td>
                                    <td style={{ color: '#C87D00' }}>−{row.commission_amount} ر</td>
                                    <td style={{ fontWeight: 700 }}>{row.net_amount} ر</td>
                                    <td>
                                        <StatusBadge status={row.status} />
                                    </td>
                                    <td>
                                        <Link
                                            href={`/partner/settlements/${row.id}`}
                                            style={{ color: '#0A0A0A', fontWeight: 700 }}
                                        >
                                            التفاصيل
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination links={statements.links} />
            </div>
        </PartnerLayout>
    );
}
