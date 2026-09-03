import { Head } from '@inertiajs/react';
import { Scale } from 'lucide-react';
import {
    Pagination,
    ResultCount,
    SortableHeader,
} from '@/components/list-controls';
import { BackLink, ListStates } from '@/components/list-states';
import {
    Badge,
    Card,
    PageHeader,
    StatCard,
    Tbody,
    Td,
    Th,
    Thead,
    TableShell,
    Tr,
} from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §12.7 — reconciling a statement item by item.
 *
 * The provider's own books are per event, so the statement has to be readable
 * that way: one row per completed event with its gross, the commission taken,
 * and what is left. A correcting item points back at the row it corrects.
 */
type Item = {
    id: number;
    type: string;
    status: string;
    event_id: number;
    event_title: string | null;
    event_date: string | null;
    commission_rate_percent: number | null;
    gross_amount: string;
    commission_amount: string;
    vat_amount: string;
    net_amount: string;
    reason: string | null;
    corrects_item_id: number | null;
};

type Statement = {
    id: number;
    period_key: string;
    period_start: string | null;
    period_end: string | null;
    status: string;
    items_count: number;
    gross_amount: string;
    commission_amount: string;
    vat_amount: string;
    net_amount: string;
    approved_at: string | null;
    paid_at: string | null;
    payout_reference: string | null;
};

const STATUS: Record<
    string,
    { label: string; tone: 'neutral' | 'success' | 'warning' }
> = {
    draft: { label: 'قيد الإعداد', tone: 'neutral' },
    approved: { label: 'معتمد — بانتظار التحويل', tone: 'warning' },
    paid: { label: 'حُوِّل', tone: 'success' },
};

export default function PartnerSettlementShow({
    statement,
    items,
    sort,
}: {
    statement: Statement;
    items: Paginated<Item>;
    sort: SortState;
}) {
    return (
        <PartnerLayout>
            <Head title={`كشف ${statement.period_key}`} />

            <BackLink
                href="/partner/settlements"
                label="العودة إلى كشوف المستحقات"
            />

            <PageHeader
                icon={Scale}
                title={`كشف الفترة ${statement.period_key}`}
                subtitle={`من ${statement.period_start ?? '—'} إلى ${statement.period_end ?? '—'} · ${statement.items_count} بند`}
                actions={
                    <Badge tone={STATUS[statement.status]?.tone ?? 'neutral'}>
                        {STATUS[statement.status]?.label ?? statement.status}
                    </Badge>
                }
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="إجمالي الفعاليات"
                    value={statement.gross_amount}
                    hint="ريال"
                />
                <StatCard
                    label="عمولة المنصة"
                    value={`− ${statement.commission_amount}`}
                    hint="ريال"
                    tone="warning"
                />
                <StatCard
                    label="ضريبة القيمة المضافة"
                    value={statement.vat_amount}
                    hint="ريال"
                />
                <StatCard
                    label="الصافي المستحق"
                    value={statement.net_amount}
                    hint="ريال"
                    tone="success"
                />
            </div>

            {statement.payout_reference && (
                <Card padding="p-4">
                    <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-ink/60">مرجع التحويل البنكي</span>
                        <span
                            className="font-mono font-bold text-ink"
                            dir="ltr"
                        >
                            {statement.payout_reference}
                        </span>
                    </div>
                </Card>
            )}

            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">بنود الكشف</h2>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="الفعالية"
                                sortKey="event_id"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="التاريخ"
                                sortKey="event_date"
                                sort={sort}
                                initialDirection="desc"
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الإجمالي"
                                sortKey="gross_amount"
                                sort={sort}
                                initialDirection="desc"
                            />
                        </Th>
                        <Th>العمولة</Th>
                        <Th>
                            <SortableHeader
                                label="الصافي"
                                sortKey="net_amount"
                                sort={sort}
                                initialDirection="desc"
                            />
                        </Th>
                    </Thead>

                    <Tbody>
                        {items.data.map((item) => (
                            <Tr key={item.id}>
                                <Td>
                                    <span className="block font-extrabold text-ink">
                                        {item.event_title ??
                                            `فعالية #${item.event_id}`}
                                    </span>
                                    {item.corrects_item_id !== null && (
                                        <Badge tone="warning">
                                            تصحيح للبند #{item.corrects_item_id}
                                        </Badge>
                                    )}
                                    {item.reason && (
                                        <span className="mt-0.5 block text-[11px] text-ink/55">
                                            {item.reason}
                                        </span>
                                    )}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {item.event_date ?? '—'}
                                </Td>
                                <Td className="font-mono text-ink/85">
                                    {item.gross_amount}
                                </Td>
                                <Td>
                                    <span className="font-mono text-ink/85">
                                        − {item.commission_amount}
                                    </span>
                                    {item.commission_rate_percent !== null && (
                                        <span className="block font-mono text-[11px] text-ink/45">
                                            {item.commission_rate_percent}٪
                                        </span>
                                    )}
                                </Td>
                                <Td className="font-mono font-black text-ink">
                                    {item.net_amount}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={items.data.length}
                            colSpan={5}
                            empty="لا بنود في هذا الكشف."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={items} />
                    <Pagination page={items} />
                </div>
            </Card>
        </PartnerLayout>
    );
}
