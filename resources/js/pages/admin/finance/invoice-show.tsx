import { Head, router } from '@inertiajs/react';
import { CircleCheckBig, Receipt } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { BackLink, ListStates } from '@/components/list-states';
import { Badge, Button, Card, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * H §12.8 / §12.9 — فاتورة رسوم النظام، مفصّلة.
 *
 * Each line carries its own tax treatment and issuer, because a single
 * invoice can mix flows where Teamat is principal with flows where it is
 * not. Collapsing that into one VAT figure is what makes a return wrong.
 */
type Item = {
    id: number;
    type: string;
    description: string | null;
    quantity: number;
    unit_amount: string;
    amount: string;
    vat_amount: string;
    total_amount: string;
    tax_treatment: string | null;
    invoice_issuer: string | null;
};

type Invoice = {
    id: number;
    serial: string | null;
    invoice_uuid: string | null;
    company: { id: number; name: string } | null;
    period_key: string;
    period_start: string | null;
    period_end: string | null;
    status: string;
    issuance_mode: string;
    activated_employees_count: number;
    departed_activated_count: number;
    fee_per_activated_employee: string;
    fees_subtotal: string;
    monthly_minimum: string | null;
    minimum_adjustment: string;
    subtotal: string;
    vat_amount: string;
    total_amount: string;
    vat_rate_percent: number;
    seller_vat_number: string | null;
    buyer_vat_number: string | null;
    issued_at: string | null;
    due_at: string | null;
    paid_at: string | null;
    days_overdue: number;
    blocked_at: string | null;
    items: Item[];
};

const STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
    draft: { label: 'مسودة', tone: 'neutral' },
    issued: { label: 'صادرة', tone: 'warning' },
    paid: { label: 'مسددة', tone: 'success' },
    overdue: { label: 'متأخرة', tone: 'danger' },
    blocked: { label: 'محجوبة', tone: 'danger' },
};

export default function AdminInvoiceShow({ invoice }: { invoice: Invoice }) {
    const [paying, setPaying] = useState(false);

    return (
        <AdminLayout>
            <Head title={`فاتورة ${invoice.serial ?? invoice.id}`} />

            <BackLink href="/admin/finance/invoices" label="العودة إلى الفواتير" />

            <PageHeader
                icon={Receipt}
                title={`فاتورة ${invoice.serial ?? `#${invoice.id}`}`}
                subtitle={`${invoice.company?.name ?? '—'} · الفترة ${invoice.period_key}`}
                actions={
                    <>
                        <Badge tone={STATUS[invoice.status]?.tone ?? 'neutral'}>
                            {STATUS[invoice.status]?.label ?? invoice.status}
                        </Badge>
                        {invoice.status !== 'paid' && invoice.status !== 'draft' && (
                            <Button icon={CircleCheckBig} onClick={() => setPaying(true)}>
                                تسجيل السداد
                            </Button>
                        )}
                    </>
                }
            />

            {invoice.days_overdue > 0 && (
                <Note tone="danger" title={`متأخرة ${invoice.days_overdue} يوماً`}>
                    {invoice.blocked_at
                        ? 'حُجب إنشاء الفعاليات على الشركة. يُرفع الحجب تلقائياً عند تسجيل السداد.'
                        : 'ستُحجب الشركة عن إنشاء فعاليات جديدة عند تجاوز المهلة التعاقدية.'}
                </Note>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="الموظفون المفعّلون" value={invoice.activated_employees_count} hint={`منهم ${invoice.departed_activated_count} غادروا`} />
                <StatCard label="رسم الموظف" value={invoice.fee_per_activated_employee} hint="ريال" />
                <StatCard label="قبل الضريبة" value={invoice.subtotal} hint="ريال" />
                <StatCard label="الإجمالي" value={invoice.total_amount} hint={`شامل ضريبة ${invoice.vat_rate_percent}٪`} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">بنود الفاتورة</h2>

                <TableShell>
                    <Thead>
                        <Th>البند</Th>
                        <Th>الكمية</Th>
                        <Th>سعر الوحدة</Th>
                        <Th>المبلغ</Th>
                        <Th>الضريبة</Th>
                        <Th>المعاملة الضريبية</Th>
                    </Thead>
                    <Tbody>
                        {invoice.items.map((item) => (
                            <Tr key={item.id}>
                                <Td>
                                    <span className="font-bold text-ink block">{item.description ?? item.type}</span>
                                    <span className="font-mono text-[10px] text-ink/45">{item.type}</span>
                                </Td>
                                <Td className="font-mono text-ink/70">{item.quantity}</Td>
                                <Td className="font-mono text-ink/70">{item.unit_amount}</Td>
                                <Td className="font-mono font-bold text-ink">{item.amount}</Td>
                                <Td className="font-mono text-ink/70">{item.vat_amount}</Td>
                                <Td>
                                    <Badge tone={item.tax_treatment === 'exempt' ? 'neutral' : 'lime'}>{item.tax_treatment ?? '—'}</Badge>
                                    <span className="block text-[11px] text-ink/45 mt-0.5">مُصدِر: {item.invoice_issuer ?? '—'}</span>
                                </Td>
                            </Tr>
                        ))}
                        <ListStates count={invoice.items.length} colSpan={6} empty="لا بنود مفصّلة." />
                    </Tbody>
                </TableShell>

                <div className="space-y-1.5 pt-3 border-t-[0.5px] border-ink/10 text-xs max-w-sm ms-auto">
                    <Row label="مجموع الرسوم" value={invoice.fees_subtotal} />
                    {invoice.monthly_minimum && <Row label="الحد الأدنى التعاقدي" value={invoice.monthly_minimum} />}
                    {invoice.minimum_adjustment !== '0.00' && <Row label="تسوية الحد الأدنى" value={invoice.minimum_adjustment} />}
                    <Row label="المجموع قبل الضريبة" value={invoice.subtotal} />
                    <Row label={`ضريبة القيمة المضافة (${invoice.vat_rate_percent}٪)`} value={invoice.vat_amount} />
                    <div className="flex items-center justify-between pt-1.5 border-t-[0.5px] border-ink/10">
                        <span className="font-extrabold text-ink">الإجمالي</span>
                        <span className="font-mono font-black text-ink">{invoice.total_amount} ر.س</span>
                    </div>
                </div>
            </Card>

            <Card padding="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <Meta label="الرقم التسلسلي" value={invoice.serial} mono />
                    <Meta label="المعرّف الفريد" value={invoice.invoice_uuid} mono />
                    <Meta label="الرقم الضريبي للبائع" value={invoice.seller_vat_number} mono />
                    <Meta label="الرقم الضريبي للمشتري" value={invoice.buyer_vat_number} mono />
                    <Meta label="صدرت في" value={invoice.issued_at} date />
                    <Meta label="تستحق في" value={invoice.due_at} date />
                    <Meta label="سُدِّدت في" value={invoice.paid_at} date />
                    <Meta label="وضع الإصدار" value={invoice.issuance_mode} />
                </div>
            </Card>

            <ConfirmModal
                open={paying}
                title="تسجيل سداد الفاتورة"
                message="سجّل السداد بعد وصوله فعلياً. تصبح الفاتورة مسددة ويُرفع الحجب عن الشركة إن كان مفروضاً."
                details={
                    <>
                        <ConfirmRow label="الشركة" value={invoice.company?.name ?? '—'} />
                        <ConfirmRow label="المبلغ قبل الضريبة" value={`${invoice.subtotal} ريال`} />
                        <ConfirmRow label="ضريبة القيمة المضافة" value={`${invoice.vat_amount} ريال`} />
                        <ConfirmRow label="الإجمالي المسدَّد" value={`${invoice.total_amount} ريال`} strong />
                        <ConfirmRow label="الأثر" value="تصبح الفاتورة مسددة ويُرفع الحجب" />
                    </>
                }
                confirmLabel="تأكيد السداد"
                onConfirm={() => {
                    router.post(`/admin/finance/invoices/${invoice.id}/pay`, {}, { preserveScroll: true });
                    setPaying(false);
                }}
                onCancel={() => setPaying(false)}
            />
        </AdminLayout>
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

function Meta({ label, value, mono = false, date = false }: { label: string; value: string | null; mono?: boolean; date?: boolean }) {
    return (
        <div>
            <span className="text-[11px] font-bold text-ink/50 block">{label}</span>
            <span className={`text-ink ${mono ? 'font-mono text-[11px]' : ''}`} dir={mono ? 'ltr' : undefined}>
                {value ? (date ? new Date(value).toLocaleDateString('ar-SA') : value) : '—'}
            </span>
        </div>
    );
}
