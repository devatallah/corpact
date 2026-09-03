import { Head, router } from '@inertiajs/react';
import { CircleCheckBig, Scale } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { BackLink, ListStates } from '@/components/list-states';
import { Badge, Button, Card, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import { settlementItemStatus } from '@/lib/status';

/**
 * H §12.7 — كشف تسوية واحد، بنداً بنداً.
 *
 * This is the screen where a disputed payout gets settled: each item is one
 * completed event with its gross, the commission taken at the rate in force
 * then, and the net. A correcting item points at the row it corrects rather
 * than overwriting it — the original stays readable.
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
    items: Item[];
    partner: { id: number; name: string; bank_status: string } | null;
    payouts_blocked: boolean;
    generated_by: { id: number; name: string } | null;
    approved_by: { id: number; name: string } | null;
    paid_by: { id: number; name: string } | null;
};

const STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' }> = {
    draft: { label: 'مسودة', tone: 'neutral' },
    approved: { label: 'معتمد', tone: 'warning' },
    paid: { label: 'مدفوع', tone: 'success' },
};

export default function AdminSettlementShow({ statement }: { statement: Statement }) {
    const [approving, setApproving] = useState(false);
    const [paying, setPaying] = useState(false);
    const [reference, setReference] = useState('');

    return (
        <AdminLayout>
            <Head title={`كشف ${statement.period_key}`} />

            <BackLink href="/admin/finance/settlements" label="العودة إلى التسويات" />

            <PageHeader
                icon={Scale}
                title={`كشف ${statement.partner?.name ?? '—'} — ${statement.period_key}`}
                subtitle={`من ${statement.period_start ?? '—'} إلى ${statement.period_end ?? '—'} · ${statement.items_count} بند`}
                actions={
                    <>
                        <Badge tone={STATUS[statement.status]?.tone ?? 'neutral'}>
                            {STATUS[statement.status]?.label ?? statement.status}
                        </Badge>
                        {statement.status === 'draft' && <Button onClick={() => setApproving(true)}>اعتماد الكشف</Button>}
                        {statement.status === 'approved' && (
                            <Button
                                icon={CircleCheckBig}
                                disabled={statement.payouts_blocked}
                                onClick={() => {
                                    setReference('');
                                    setPaying(true);
                                }}
                            >
                                تسجيل الدفع
                            </Button>
                        )}
                    </>
                }
            />

            {statement.payouts_blocked && (
                <Note tone="danger" title="الصرف موقوف — الحساب البنكي غير معتمد">
                    يمكن اعتماد الكشف، لكن لا يمكن تسجيل تحويل قبل اعتماد الحساب البنكي للمزوّد من صفحة إشراف المزوّدين.
                </Note>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي الفعاليات" value={statement.gross_amount} hint="ريال" />
                <StatCard label="عمولة المنصة" value={`− ${statement.commission_amount}`} hint="ريال" tone="warning" />
                <StatCard label="ضريبة القيمة المضافة" value={statement.vat_amount} hint="ريال" />
                <StatCard label="الصافي المستحق" value={statement.net_amount} hint="ريال" tone="success" />
            </div>

            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">بنود الكشف</h2>

                <TableShell>
                    <Thead>
                        <Th>الفعالية</Th>
                        <Th>التاريخ</Th>
                        <Th>الإجمالي</Th>
                        <Th>العمولة</Th>
                        <Th>الصافي</Th>
                        <Th>الحالة</Th>
                    </Thead>
                    <Tbody>
                        {statement.items.map((item) => (
                            <Tr key={item.id}>
                                <Td>
                                    <span className="font-extrabold text-ink block">
                                        {item.event_title ?? `فعالية #${item.event_id}`}
                                    </span>
                                    {item.corrects_item_id !== null && (
                                        <Badge tone="warning">تصحيح للبند #{item.corrects_item_id}</Badge>
                                    )}
                                    {item.reason && <span className="block text-[11px] text-ink/55 mt-0.5">{item.reason}</span>}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">{item.event_date ?? '—'}</Td>
                                <Td className="font-mono text-ink/85">{item.gross_amount}</Td>
                                <Td>
                                    <span className="font-mono text-ink/85">− {item.commission_amount}</span>
                                    {item.commission_rate_percent !== null && (
                                        <span className="block text-[11px] text-ink/45 font-mono">{item.commission_rate_percent}٪</span>
                                    )}
                                </Td>
                                <Td className="font-mono font-black text-ink">{item.net_amount}</Td>
                                <Td>
                                    <Badge tone={settlementItemStatus(item.status).tone}>{settlementItemStatus(item.status).label}</Badge>
                                </Td>
                            </Tr>
                        ))}
                        <ListStates count={statement.items.length} colSpan={6} empty="لا بنود في هذا الكشف." />
                    </Tbody>
                </TableShell>
            </Card>

            <Card padding="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <Meta label="أنشأه" value={statement.generated_by?.name ?? null} />
                    <Meta label="اعتمده" value={statement.approved_by?.name ?? null} />
                    <Meta label="سجّل دفعه" value={statement.paid_by?.name ?? null} />
                    <Meta label="مرجع التحويل" value={statement.payout_reference} mono />
                </div>
            </Card>

            {/* H §18 — the three numbers the provider will reconcile against. */}
            <ConfirmModal
                open={approving}
                title="اعتماد كشف التسوية"
                message="الاعتماد يثبّت مستحقات المزوّد عن الفترة ويجعل الكشف جاهزاً للدفع. لا تتغيّر البنود بعده."
                details={
                    <>
                        <ConfirmRow label="المزوّد" value={statement.partner?.name ?? '—'} />
                        <ConfirmRow label="الإجمالي (gross_amount)" value={`${statement.gross_amount} ريال`} />
                        <ConfirmRow label="العمولة (commission_amount)" value={`${statement.commission_amount} ريال`} />
                        <ConfirmRow label="الصافي المستحق (net_amount)" value={`${statement.net_amount} ريال`} strong />
                    </>
                }
                confirmLabel="اعتماد الكشف"
                onConfirm={() => {
                    router.post(`/admin/finance/settlements/${statement.id}/approve`, {}, { preserveScroll: true });
                    setApproving(false);
                }}
                onCancel={() => setApproving(false)}
            />

            <ConfirmModal
                open={paying}
                title="تسجيل دفع الكشف"
                message="سجّل التحويل بعد تنفيذه فعلياً من البنك. يُوثَّق المرجع في سجل التدقيق ويظهر للمزوّد."
                details={
                    <>
                        <ConfirmRow label="المزوّد" value={statement.partner?.name ?? '—'} />
                        <ConfirmRow label="الإجمالي (gross_amount)" value={`${statement.gross_amount} ريال`} />
                        <ConfirmRow label="العمولة (commission_amount)" value={`${statement.commission_amount} ريال`} />
                        <ConfirmRow label="المبلغ المحوَّل (net_amount)" value={`${statement.net_amount} ريال`} strong />
                        <div className="pt-2">
                            <label htmlFor="settle-reference" className="block text-[11px] font-bold text-ink mb-1">
                                مرجع التحويل البنكي (إلزامي)
                            </label>
                            <input
                                id="settle-reference"
                                dir="ltr"
                                value={reference}
                                onChange={(event) => setReference(event.target.value)}
                                className="w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs font-mono bg-surface focus:outline-none focus:border-ink"
                            />
                        </div>
                    </>
                }
                confirmLabel="تسجيل الدفع"
                busy={reference.trim() === ''}
                onConfirm={() => {
                    router.post(
                        `/admin/finance/settlements/${statement.id}/pay`,
                        { payout_reference: reference },
                        { preserveScroll: true },
                    );
                    setPaying(false);
                }}
                onCancel={() => setPaying(false)}
            />
        </AdminLayout>
    );
}

function Meta({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) {
    return (
        <div>
            <span className="text-[11px] font-bold text-ink/50 block">{label}</span>
            <span className={`text-ink ${mono ? 'font-mono text-[11px]' : ''}`} dir={mono ? 'ltr' : undefined}>
                {value ?? '—'}
            </span>
        </div>
    );
}
