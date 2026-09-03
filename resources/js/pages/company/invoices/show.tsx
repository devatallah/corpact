import { Head } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
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
import CompanyLayout from '@/layouts/company-layout';

/**
 * H §12.8 — one invoice, itemised.
 *
 * The company is being asked to pay this, so every number that produced the
 * total is shown: the headcount, the per-employee fee, the minimum adjustment
 * if the contract has one, and the VAT.
 */
type Invoice = {
    id: number;
    serial: string | null;
    status: string;
    issuance_mode: string;
    period_start: string | null;
    period_end: string | null;
    activated_employees_count: number;
    departed_activated_count: number;
    fee_per_activated_employee: string;
    fees_subtotal: string;
    minimum_adjustment: string;
    subtotal: string;
    vat_rate_percent: number;
    vat_amount: string;
    total_amount: string;
    issued_at: string | null;
    due_at: string | null;
    paid_at: string | null;
};

type Item = {
    id: number;
    type: string;
    description: string | null;
    quantity: number;
    unit_amount: string;
    amount: string;
};

const STATUS: Record<
    string,
    { label: string; tone: 'neutral' | 'success' | 'warning' }
> = {
    issued: { label: 'صادرة', tone: 'warning' },
    paid: { label: 'مسددة', tone: 'success' },
    void: { label: 'ملغاة', tone: 'neutral' },
};

export default function CompanyInvoiceShow({
    invoice,
    items,
}: {
    company: { id: number; name: string };
    invoice: Invoice;
    items: Item[];
}) {
    return (
        <CompanyLayout>
            <Head title={`فاتورة ${invoice.serial ?? invoice.id}`} />

            <BackLink href="/company/invoices" label="العودة إلى الفواتير" />

            <PageHeader
                icon={Receipt}
                title={`فاتورة ${invoice.serial ?? `#${invoice.id}`}`}
                subtitle={`الفترة من ${invoice.period_start ?? '—'} إلى ${invoice.period_end ?? '—'}`}
                actions={
                    <Badge tone={STATUS[invoice.status]?.tone ?? 'neutral'}>
                        {STATUS[invoice.status]?.label ?? invoice.status}
                    </Badge>
                }
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="الموظفون المفعّلون"
                    value={invoice.activated_employees_count}
                />
                <StatCard
                    label="رسم الموظف الواحد"
                    value={invoice.fee_per_activated_employee}
                    hint="ريال"
                />
                <StatCard
                    label="قبل الضريبة"
                    value={invoice.subtotal}
                    hint="ريال"
                />
                <StatCard
                    label="الإجمالي"
                    value={invoice.total_amount}
                    hint={`شامل ضريبة ${invoice.vat_rate_percent}٪`}
                    tone="ink"
                />
            </div>

            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">
                    بنود الفاتورة
                </h2>

                <TableShell>
                    <Thead>
                        <Th>البند</Th>
                        <Th>الكمية</Th>
                        <Th>سعر الوحدة</Th>
                        <Th>المبلغ</Th>
                    </Thead>
                    <Tbody>
                        {items.map((item) => (
                            <Tr key={item.id}>
                                <Td className="font-bold text-ink">
                                    {item.description ?? item.type}
                                </Td>
                                <Td className="font-mono text-ink/70">
                                    {item.quantity}
                                </Td>
                                <Td className="font-mono text-ink/70">
                                    {item.unit_amount}
                                </Td>
                                <Td className="font-mono font-bold text-ink">
                                    {item.amount}
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={items.length}
                            colSpan={4}
                            empty="لا بنود مفصّلة لهذه الفاتورة."
                        />
                    </Tbody>
                </TableShell>

                <div className="ms-auto max-w-sm space-y-1.5 border-t-[0.5px] border-ink/10 pt-3 text-xs">
                    <Row label="مجموع الرسوم" value={invoice.fees_subtotal} />
                    {invoice.minimum_adjustment !== '0.00' && (
                        <Row
                            label="تسوية الحد الأدنى التعاقدي"
                            value={invoice.minimum_adjustment}
                        />
                    )}
                    <Row label="المجموع قبل الضريبة" value={invoice.subtotal} />
                    <Row
                        label={`ضريبة القيمة المضافة (${invoice.vat_rate_percent}٪)`}
                        value={invoice.vat_amount}
                    />
                    <div className="flex items-center justify-between border-t-[0.5px] border-ink/10 pt-1.5">
                        <span className="font-extrabold text-ink">
                            الإجمالي المستحق
                        </span>
                        <span className="font-mono font-black text-ink">
                            {invoice.total_amount} ر.س
                        </span>
                    </div>
                </div>
            </Card>

            <Card padding="p-4">
                <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                    <Meta label="صدرت في" value={invoice.issued_at} />
                    <Meta label="تستحق في" value={invoice.due_at} />
                    <Meta label="سُدِّدت في" value={invoice.paid_at} />
                </div>
            </Card>
        </CompanyLayout>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-ink/60">{label}</span>
            <span className="font-mono font-bold text-ink">{value} ر.س</span>
        </div>
    );
}

function Meta({ label, value }: { label: string; value: string | null }) {
    return (
        <div>
            <span className="block text-[11px] font-bold text-ink/50">
                {label}
            </span>
            <span className="font-mono text-ink">
                {value ? new Date(value).toLocaleDateString('ar-SA') : '—'}
            </span>
        </div>
    );
}
