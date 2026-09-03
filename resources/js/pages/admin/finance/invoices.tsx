import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, CircleCheckBig, FileWarning, Play, Receipt } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, Note, PageHeader, TableShell, Tbody, Td, Th, Thead, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §12.8 — فواتير رسوم النظام على الشركات.
 *
 * Marking an invoice paid is what lifts a company's block, so the dialog
 * names the total, the VAT inside it, and that consequence. Companies with
 * no contract terms are listed up top: they cannot be invoiced at all.
 */
type Invoice = {
    id: number;
    serial: string | null;
    company: { id: number; name: string } | null;
    period_key: string;
    status: string;
    issuance_mode: string;
    activated_employees_count: number;
    subtotal: string;
    vat_amount: string;
    total_amount: string;
    vat_rate_percent: number;
    issued_at: string | null;
    due_at: string | null;
    paid_at: string | null;
    days_overdue: number;
    blocked_at: string | null;
};

const STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
    draft: { label: 'مسودة', tone: 'neutral' },
    issued: { label: 'صادرة', tone: 'warning' },
    paid: { label: 'مسددة', tone: 'success' },
    overdue: { label: 'متأخرة', tone: 'danger' },
    blocked: { label: 'محجوبة', tone: 'danger' },
};

export default function AdminInvoices({
    invoices,
    filters,
    sort,
    cycle,
    realInvoicesEnabled,
    missingContracts,
}: {
    invoices: Paginated<Invoice>;
    filters: { status: string; search: string };
    sort: SortState;
    cycle: { key: string; start: string; end: string };
    realInvoicesEnabled: boolean;
    missingContracts: { id: number; name: string }[];
}) {
    const [paying, setPaying] = useState<Invoice | null>(null);
    const [generating, setGenerating] = useState(false);
    const [arrears, setArrears] = useState(false);

    return (
        <AdminLayout>
            <Head title="الفواتير" />

            <PageHeader
                icon={Receipt}
                title="فواتير رسوم النظام"
                subtitle="فاتورة شهرية لكل شركة على الموظفين المفعّلين، بحد أدنى تعاقدي إن وُجد. التأخر يقود إلى الحجب."
                actions={
                    <>
                        <Button tone="soft" icon={AlertTriangle} onClick={() => setArrears(true)}>
                            تشغيل دورة التأخر
                        </Button>
                        <Button icon={Play} onClick={() => setGenerating(true)}>
                            إصدار فواتير {cycle.key}
                        </Button>
                    </>
                }
            />

            <Note tone="warning" title="تسلسل إجراءات التأخر عن السداد">
                <ul className="mt-1 space-y-1">
                    <li>· تأخر 7 أيام: إشعار تذكيري لمسؤول الحساب والإدارة المالية في الشركة.</li>
                    <li>· تأخر 15 يوماً: إنذار رسمي، وإيقاف شحن محافظ المجتمعات.</li>
                    <li>
                        · تأخر 30 يوماً: تجميد إنشاء الفعاليات الجديدة — دون تعطيل دخول الموظفين ولا إلغاء فعالياتهم المؤكدة.
                    </li>
                </ul>
            </Note>

            {!realInvoicesEnabled && (
                <Note tone="warning" title="الفوترة الضريبية الحقيقية معطّلة">
                    الفواتير تُنشأ بوضع تجريبي (بلا رقم تسلسلي ضريبي معتمد). فعّل <span className="font-mono">real_invoices_enabled</span>{' '}
                    بعد اعتماد المحاسب القانوني.
                </Note>
            )}

            {missingContracts.length > 0 && (
                <Note tone="danger" title={`${missingContracts.length} شركة بلا شروط عقد — لن تُفوتر`}>
                    {missingContracts.map((company) => company.name).join(' · ')}
                </Note>
            )}

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search} placeholder="ابحث بالرقم التسلسلي أو اسم الشركة…" />
                    <FilterSelect
                        name="status"
                        label="حالة الفاتورة"
                        value={filters.status}
                        options={[
                            ['', 'كل الحالات'],
                            ['draft', 'مسودة'],
                            ['issued', 'صادرة'],
                            ['paid', 'مسددة'],
                            ['overdue', 'متأخرة'],
                            ['blocked', 'محجوبة'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>الشركة</Th>
                        <Th>
                            <SortableHeader label="الرقم التسلسلي" sortKey="serial" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="الفترة" sortKey="period_key" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>الموظفون المفعّلون</Th>
                        <Th>
                            <SortableHeader label="الإجمالي" sortKey="total_amount" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {invoices.data.map((invoice) => (
                            <Tr key={invoice.id}>
                                <Td>
                                    <Link href={`/admin/finance/invoices/${invoice.id}`} className="font-extrabold text-ink hover:underline">
                                        {invoice.company?.name ?? '—'}
                                    </Link>
                                    {invoice.blocked_at && (
                                        <Badge tone="danger" icon={FileWarning}>
                                            محجوبة
                                        </Badge>
                                    )}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/80">{invoice.serial ?? '—'}</Td>
                                <Td className="font-mono text-[11px] text-ink/80">{invoice.period_key}</Td>
                                <Td className="font-mono font-bold text-ink">{invoice.activated_employees_count}</Td>
                                <Td>
                                    <span className="font-mono font-black text-ink">{invoice.total_amount}</span>
                                    <span className="block text-[11px] text-ink/45 font-mono">
                                        ضريبة {invoice.vat_amount} ({invoice.vat_rate_percent}٪)
                                    </span>
                                </Td>
                                <Td>
                                    <Badge tone={STATUS[invoice.status]?.tone ?? 'neutral'}>
                                        {STATUS[invoice.status]?.label ?? invoice.status}
                                    </Badge>
                                    {invoice.days_overdue > 0 && (
                                        <span className="block text-[11px] font-bold text-danger mt-1">
                                            متأخرة {invoice.days_overdue} يوماً
                                        </span>
                                    )}
                                </Td>
                                <Td className="text-center">
                                    {invoice.status !== 'paid' && invoice.status !== 'draft' && (
                                        <Button tone="soft" icon={CircleCheckBig} onClick={() => setPaying(invoice)}>
                                            تسجيل السداد
                                        </Button>
                                    )}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={invoices.data.length}
                            colSpan={7}
                            empty="لا توجد فواتير."
                            emptyHint="تُصدر الفواتير عن دورة شهرية مغلقة لكل شركة لها شروط عقد."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={invoices} />
                    <Pagination page={invoices} />
                </div>
            </Card>

            <ConfirmModal
                open={generating}
                title="إصدار فواتير الدورة"
                message="ستُصدر فاتورة لكل شركة لها شروط عقد، محسوبة على عدد الموظفين المفعّلين خلال الدورة."
                details={
                    <>
                        <ConfirmRow label="الدورة" value={cycle.key} strong />
                        <ConfirmRow label="من" value={cycle.start} />
                        <ConfirmRow label="إلى" value={cycle.end} />
                        <ConfirmRow label="شركات بلا عقد (تُستثنى)" value={String(missingContracts.length)} />
                    </>
                }
                confirmLabel="إصدار الفواتير"
                onConfirm={() => {
                    router.post('/admin/finance/invoices/generate', {}, { preserveScroll: true });
                    setGenerating(false);
                }}
                onCancel={() => setGenerating(false)}
            />

            <ConfirmModal
                open={arrears}
                tone="danger"
                title="تشغيل دورة التأخر والحجب"
                message="سترسل تذكيرات التأخر المستحقة، وتحجب الشركات التي تجاوزت المهلة التعاقدية. الحجب يوقف إنشاء فعاليات جديدة."
                confirmLabel="تشغيل الدورة"
                onConfirm={() => {
                    router.post('/admin/finance/invoices/arrears', {}, { preserveScroll: true });
                    setArrears(false);
                }}
                onCancel={() => setArrears(false)}
            />

            {/* H §18 — the total, the VAT inside it, and what paying unblocks. */}
            <ConfirmModal
                open={paying !== null}
                title="تسجيل سداد الفاتورة"
                message="سجّل السداد بعد وصوله فعلياً. تصبح الفاتورة مسددة ويُرفع الحجب عن الشركة إن كان مفروضاً."
                details={
                    paying && (
                        <>
                            <ConfirmRow label="الشركة" value={paying.company?.name ?? '—'} />
                            <ConfirmRow label="الرقم التسلسلي" value={paying.serial ?? '—'} />
                            <ConfirmRow label="المبلغ قبل الضريبة" value={`${paying.subtotal} ريال`} />
                            <ConfirmRow label="ضريبة القيمة المضافة (vat_amount)" value={`${paying.vat_amount} ريال`} />
                            <ConfirmRow label="الإجمالي المسدَّد (total_amount)" value={`${paying.total_amount} ريال`} strong />
                            <ConfirmRow label="الأثر" value="تصبح الفاتورة مسددة ويُرفع الحجب" />
                        </>
                    )
                }
                confirmLabel="تأكيد السداد"
                onConfirm={() => {
                    router.post(`/admin/finance/invoices/${paying?.id}/pay`, {}, { preserveScroll: true });
                    setPaying(null);
                }}
                onCancel={() => setPaying(null)}
            />
        </AdminLayout>
    );
}
