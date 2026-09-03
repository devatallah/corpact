import { Head, Link } from '@inertiajs/react';
import { Ban, Receipt } from 'lucide-react';
import {
    FilterSelect,
    Pagination,
    ResultCount,
    SearchInput,
    SortableHeader,
    Toolbar,
} from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import {
    Badge,
    Card,
    Note,
    PageHeader,
    StatCard,
    Tbody,
    Td,
    Th,
    Thead,
    TableShell,
    Tr,
} from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §12.8 — the company's own invoices.
 *
 * Drafts are never shown: an invoice the company can see is one Teamat has
 * issued and stands behind. The block banner is first because an overdue
 * invoice stops event creation, and that is the consequence the account
 * manager is actually feeling when they open this page.
 */
type Invoice = {
    id: number;
    serial: string | null;
    status: string;
    period_start: string | null;
    period_end: string | null;
    activated_employees_count: number;
    fee_per_activated_employee: string;
    subtotal: string;
    vat_amount: string;
    vat_rate_percent: number;
    total_amount: string;
    issued_at: string | null;
    due_at: string | null;
    paid_at: string | null;
    is_overdue?: boolean;
};

const STATUS: Record<
    string,
    { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }
> = {
    issued: { label: 'صادرة', tone: 'warning' },
    paid: { label: 'مسددة', tone: 'success' },
    void: { label: 'ملغاة', tone: 'neutral' },
};

export default function CompanyInvoices({
    invoices,
    filters,
    sort,
    summary,
}: {
    company: { id: number; name: string };
    invoices: Paginated<Invoice>;
    filters: { search?: string; status?: string };
    sort: SortState;
    summary: {
        outstanding: string;
        overdue_count: number;
        event_creation_blocked: boolean;
        block_reason: string | null;
    };
}) {
    return (
        <CompanyLayout>
            <Head title="الفواتير" />

            <PageHeader
                icon={Receipt}
                title="فواتير رسوم النظام"
                subtitle="فاتورة شهرية محسوبة على عدد الموظفين المفعّلين خلال الدورة، بحد أدنى تعاقدي إن وُجد."
            />

            {summary.event_creation_blocked && (
                <Note tone="danger" title="إنشاء الفعاليات موقوف">
                    {summary.block_reason ??
                        'يوجد مستحق متأخر على الحساب. يُرفع الحجب تلقائياً فور تسجيل السداد.'}
                </Note>
            )}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <StatCard
                    label="المستحق غير المسدَّد"
                    value={summary.outstanding}
                    hint="ريال"
                    tone={summary.outstanding === '0.00' ? 'ink' : 'warning'}
                />
                <StatCard
                    label="فواتير متأخرة"
                    value={summary.overdue_count}
                    tone={summary.overdue_count > 0 ? 'danger' : 'success'}
                />
                <StatCard
                    label="حالة إنشاء الفعاليات"
                    value={summary.event_creation_blocked ? 'موقوف' : 'مفتوح'}
                    tone={summary.event_creation_blocked ? 'danger' : 'success'}
                />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث بالرقم التسلسلي…"
                    />
                    <FilterSelect
                        name="status"
                        label="حالة الفاتورة"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['issued', 'صادرة'],
                            ['paid', 'مسددة'],
                            ['void', 'ملغاة'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="الرقم التسلسلي"
                                sortKey="serial"
                                sort={sort}
                            />
                        </Th>
                        <Th>الفترة</Th>
                        <Th>الموظفون المفعّلون</Th>
                        <Th>
                            <SortableHeader
                                label="الإجمالي"
                                sortKey="total_amount"
                                sort={sort}
                                initialDirection="desc"
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الاستحقاق"
                                sortKey="due_at"
                                sort={sort}
                                initialDirection="desc"
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الحالة"
                                sortKey="status"
                                sort={sort}
                            />
                        </Th>
                    </Thead>

                    <Tbody>
                        {invoices.data.map((invoice) => (
                            <Tr key={invoice.id}>
                                <Td>
                                    <Link
                                        href={`/company/invoices/${invoice.id}`}
                                        className="font-mono font-extrabold text-ink hover:underline"
                                    >
                                        {invoice.serial ?? `#${invoice.id}`}
                                    </Link>
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {invoice.period_start} →{' '}
                                    {invoice.period_end}
                                </Td>
                                <Td>
                                    <span className="font-mono font-bold text-ink">
                                        {invoice.activated_employees_count}
                                    </span>
                                    <span className="block font-mono text-[11px] text-ink/45">
                                        × {invoice.fee_per_activated_employee}
                                    </span>
                                </Td>
                                <Td>
                                    <span className="font-mono font-black text-ink">
                                        {invoice.total_amount}
                                    </span>
                                    <span className="block font-mono text-[11px] text-ink/45">
                                        ضريبة {invoice.vat_amount}
                                    </span>
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {invoice.due_at
                                        ? new Date(
                                              invoice.due_at,
                                          ).toLocaleDateString('ar-SA')
                                        : '—'}
                                </Td>
                                <Td>
                                    <Badge
                                        tone={
                                            STATUS[invoice.status]?.tone ??
                                            'neutral'
                                        }
                                    >
                                        {STATUS[invoice.status]?.label ??
                                            invoice.status}
                                    </Badge>
                                    {invoice.is_overdue && (
                                        <Badge tone="danger" icon={Ban}>
                                            متأخرة
                                        </Badge>
                                    )}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={invoices.data.length}
                            colSpan={6}
                            empty="لا توجد فواتير صادرة."
                            emptyHint="تصدر أول فاتورة بعد اكتمال أول دورة شهرية من تفعيل الحساب."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={invoices} />
                    <Pagination page={invoices} />
                </div>
            </Card>
        </CompanyLayout>
    );
}
