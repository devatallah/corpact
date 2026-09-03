import { Head, Link, router } from '@inertiajs/react';
import { Ban, CircleCheckBig, Play, Scale, Wallet } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, PageHeader, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §12.7 — كشوف التسوية مع مزوّدي الخدمة.
 *
 * Approving a statement fixes what Teamat owes a provider; paying it moves
 * the money. Both dialogs state the gross, the commission and the net — the
 * three numbers a provider will check against their own books. A provider
 * whose bank details are not approved cannot be paid at all.
 */
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
    partner: { id: number; name: string } | null;
    payouts_blocked: boolean;
    approved_at: string | null;
    paid_at: string | null;
    payout_reference: string | null;
};

const STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
    draft: { label: 'مسودة', tone: 'neutral' },
    approved: { label: 'معتمد', tone: 'warning' },
    paid: { label: 'مدفوع', tone: 'success' },
};

export default function AdminSettlements({
    statements,
    filters,
    sort,
    nextPeriod,
    pendingByPartner,
}: {
    statements: Paginated<Statement>;
    filters: { status: string; search: string };
    sort: SortState;
    nextPeriod: { key: string; start: string; end: string };
    pendingByPartner: { partner_id: number; partner_name: string | null; items: number; net_amount: string }[];
}) {
    const [approving, setApproving] = useState<Statement | null>(null);
    const [paying, setPaying] = useState<Statement | null>(null);
    const [generating, setGenerating] = useState(false);
    const [reference, setReference] = useState('');

    return (
        <AdminLayout>
            <Head title="التسويات" />

            <PageHeader
                icon={Scale}
                title="كشوف التسوية مع مزوّدي الخدمة"
                subtitle="الكشف يُولَّد عن فترة مغلقة، ويُعتمد، ثم يُدفع. لا يُدفع كشف لمزوّد لم يُعتمد حسابه البنكي."
                actions={
                    <Button icon={Play} onClick={() => setGenerating(true)}>
                        توليد كشوف {nextPeriod.key}
                    </Button>
                }
            />

            {pendingByPartner.length > 0 && (
                <Card padding="p-4" className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-ink" aria-hidden="true" />
                        <h2 className="text-sm font-extrabold text-ink">بنود بانتظار التسوية</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pendingByPartner.map((row) => (
                            <div key={row.partner_id} className="p-3 rounded-xl bg-page border-[0.5px] border-ink/10">
                                <div className="text-xs font-extrabold text-ink truncate">{row.partner_name ?? '—'}</div>
                                <div className="flex items-center justify-between text-[11px] mt-1">
                                    <span className="text-ink/55">{row.items} بند</span>
                                    <span className="font-mono font-bold text-ink">{row.net_amount} ر.س</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search} placeholder="ابحث بالفترة أو اسم المزوّد…" />
                    <FilterSelect
                        name="status"
                        label="حالة الكشف"
                        value={filters.status}
                        options={[
                            ['', 'كل الحالات'],
                            ['draft', 'مسودة'],
                            ['approved', 'معتمد'],
                            ['paid', 'مدفوع'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>المزوّد</Th>
                        <Th>
                            <SortableHeader label="الفترة" sortKey="period_key" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>الإجمالي</Th>
                        <Th>العمولة</Th>
                        <Th>
                            <SortableHeader label="الصافي" sortKey="net_amount" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {statements.data.map((statement) => (
                            <Tr key={statement.id}>
                                <Td>
                                    <Link
                                        href={`/admin/finance/settlements/${statement.id}`}
                                        className="font-extrabold text-ink hover:underline"
                                    >
                                        {statement.partner?.name ?? '—'}
                                    </Link>
                                    {statement.payouts_blocked && (
                                        <Badge tone="danger" icon={Ban}>
                                            الحساب البنكي غير معتمد
                                        </Badge>
                                    )}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/80">
                                    {statement.period_key}
                                    <span className="block text-ink/45">{statement.items_count} بند</span>
                                </Td>
                                <Td className="font-mono text-ink/85">{statement.gross_amount}</Td>
                                <Td className="font-mono text-ink/85">{statement.commission_amount}</Td>
                                <Td className="font-mono font-black text-ink">{statement.net_amount}</Td>
                                <Td>
                                    <Badge tone={STATUS[statement.status]?.tone ?? 'neutral'}>
                                        {STATUS[statement.status]?.label ?? statement.status}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        {statement.status === 'draft' && (
                                            <Button tone="soft" onClick={() => setApproving(statement)}>
                                                اعتماد
                                            </Button>
                                        )}
                                        {statement.status === 'approved' && (
                                            <Button
                                                tone="soft"
                                                icon={CircleCheckBig}
                                                disabled={statement.payouts_blocked}
                                                onClick={() => {
                                                    setReference('');
                                                    setPaying(statement);
                                                }}
                                            >
                                                تسجيل الدفع
                                            </Button>
                                        )}
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={statements.data.length}
                            colSpan={7}
                            empty="لا توجد كشوف تسوية."
                            emptyHint="تُولَّد الكشوف عن فترة مكتملة من بنود الفعاليات المنتهية."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={statements} />
                    <Pagination page={statements} />
                </div>
            </Card>

            <ConfirmModal
                open={generating}
                title="توليد كشوف التسوية"
                message={`ستُجمَّع بنود الفترة المغلقة لكل مزوّد في كشف واحد قابل للاعتماد. لا يُنشأ كشف لمزوّد بلا بنود.`}
                details={
                    <>
                        <ConfirmRow label="الفترة" value={nextPeriod.key} strong />
                        <ConfirmRow label="من" value={nextPeriod.start} />
                        <ConfirmRow label="إلى" value={nextPeriod.end} />
                    </>
                }
                confirmLabel="توليد الكشوف"
                onConfirm={() => {
                    router.post('/admin/finance/settlements/generate', {}, { preserveScroll: true });
                    setGenerating(false);
                }}
                onCancel={() => setGenerating(false)}
            />

            {/* H §18 — the three numbers a provider will reconcile against. */}
            <ConfirmModal
                open={approving !== null}
                title="اعتماد كشف التسوية"
                message="الاعتماد يثبّت مستحقات المزوّد عن الفترة ويجعل الكشف جاهزاً للدفع. لا تتغيّر البنود بعده."
                details={
                    approving && (
                        <>
                            <ConfirmRow label="المزوّد" value={approving.partner?.name ?? '—'} />
                            <ConfirmRow label="الفترة" value={approving.period_key} />
                            <ConfirmRow label="الإجمالي (gross_amount)" value={`${approving.gross_amount} ريال`} />
                            <ConfirmRow label="العمولة (commission_amount)" value={`${approving.commission_amount} ريال`} />
                            <ConfirmRow label="الصافي المستحق (net_amount)" value={`${approving.net_amount} ريال`} strong />
                        </>
                    )
                }
                confirmLabel="اعتماد الكشف"
                onConfirm={() => {
                    router.post(`/admin/finance/settlements/${approving?.id}/approve`, {}, { preserveScroll: true });
                    setApproving(null);
                }}
                onCancel={() => setApproving(null)}
            />

            <ConfirmModal
                open={paying !== null}
                title="تسجيل دفع الكشف"
                message="سجّل التحويل بعد تنفيذه فعلياً من البنك. يُوثَّق المرجع في سجل التدقيق ويظهر للمزوّد."
                details={
                    paying && (
                        <>
                            <ConfirmRow label="المزوّد" value={paying.partner?.name ?? '—'} />
                            <ConfirmRow label="الإجمالي (gross_amount)" value={`${paying.gross_amount} ريال`} />
                            <ConfirmRow label="العمولة (commission_amount)" value={`${paying.commission_amount} ريال`} />
                            <ConfirmRow label="المبلغ المحوَّل (net_amount)" value={`${paying.net_amount} ريال`} strong />
                            <div className="pt-2">
                                <label htmlFor="payout-reference" className="block text-[11px] font-bold text-ink mb-1">
                                    مرجع التحويل البنكي (إلزامي)
                                </label>
                                <input
                                    id="payout-reference"
                                    dir="ltr"
                                    value={reference}
                                    onChange={(event) => setReference(event.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs font-mono bg-surface focus:outline-none focus:border-ink"
                                />
                            </div>
                        </>
                    )
                }
                confirmLabel="تسجيل الدفع"
                busy={reference.trim() === ''}
                onConfirm={() => {
                    router.post(
                        `/admin/finance/settlements/${paying?.id}/pay`,
                        { payout_reference: reference },
                        { preserveScroll: true },
                    );
                    setPaying(null);
                }}
                onCancel={() => setPaying(null)}
            />
        </AdminLayout>
    );
}
