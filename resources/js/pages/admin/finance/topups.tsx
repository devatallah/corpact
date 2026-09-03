import { Head, router } from '@inertiajs/react';
import { CircleCheckBig, Eye, Landmark, X } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Card, IconButton, Money, Note, PageHeader, TableShell, Tbody, Td, Th, Thead, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §12.5 + دليل الأدمن المالي §1 — اعتماد التحويلات البنكية.
 *
 * Approving a transfer credits a company wallet with real money, so the
 * confirm dialog names the amount and where it lands. Self-approval is
 * blocked in the service, not here.
 */
type TopupRequest = {
    id: number;
    company: { id: number; name: string } | null;
    amount: number;
    transfer_date: string | null;
    sender_account_last4: string | null;
    bank_reference: string | null;
    status: string;
    status_label: string;
    creator: { id: number; name: string } | null;
    reviewer: { id: number; name: string } | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    receipt_url: string;
    created_at: string | null;
};

const STATUS_TONES: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
    pending: 'warning',
    under_review: 'neutral',
    approved: 'success',
    rejected: 'danger',
};

export default function AdminTopups({
    requests,
    filters,
    sort,
}: {
    requests: Paginated<TopupRequest>;
    filters: { status: string; search: string };
    sort: SortState;
}) {
    const [approving, setApproving] = useState<TopupRequest | null>(null);
    const [reconciled, setReconciled] = useState(false);
    const [rejecting, setRejecting] = useState<TopupRequest | null>(null);
    const [reason, setReason] = useState('');

    return (
        <AdminLayout>
            <Head title="اعتماد التحويلات" />

            <PageHeader
                icon={Landmark}
                title="اعتماد التحويلات البنكية للمحافظ"
                subtitle="تدقيق إيصالات الحوالات الصادرة من الشركات، ومطابقتها بكشف الحساب الفعلي، وتغذية المحفظة بقيد دفتر."
            />

            <Note tone="warning" title="قواعد الحوكمة المالية الصارمة">
                <ul className="space-y-1 mt-1">
                    <li>· يُحظر على أي شخص اعتماد حوالة أنشأها بنفسه — فصل الصلاحيات مفروض على الخادم لا على الشاشة.</li>
                    <li>· لا يُفعَّل زر الاعتماد قبل الإقرار بمطابقة الحوالة مع كشف حساب تيمات البنكي.</li>
                    <li>· الاعتماد يولّد قيداً في دفتر الأستاذ لا يُحذف أبداً — التصحيح بقيد عكسي موثَّق السبب.</li>
                </ul>
            </Note>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search} placeholder="ابحث بالمرجع البنكي أو اسم الشركة…" />
                    <FilterSelect
                        name="status"
                        label="حالة الطلب"
                        value={filters.status}
                        options={[
                            ['', 'كل الحالات'],
                            ['pending', 'بانتظار المراجعة'],
                            ['under_review', 'قيد المراجعة'],
                            ['approved', 'معتمد'],
                            ['rejected', 'مرفوض'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>الشركة</Th>
                        <Th>
                            <SortableHeader label="المبلغ" sortKey="amount" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="تاريخ التحويل" sortKey="transfer_date" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="المرجع البنكي" sortKey="bank_reference" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {requests.data.map((request) => (
                            <Tr key={request.id}>
                                <Td>
                                    <div className="font-extrabold text-ink">{request.company?.name ?? '—'}</div>
                                    <span className="text-[11px] text-ink/50">
                                        قدّمه {request.creator?.name ?? '—'}
                                    </span>
                                </Td>
                                <Td>
                                    <Money amount={request.amount} className="text-ink" />
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/80">{request.transfer_date ?? '—'}</Td>
                                <Td>
                                    <div className="font-mono text-[11px] font-bold text-ink">{request.bank_reference ?? '—'}</div>
                                    {request.sender_account_last4 && (
                                        <span className="text-[11px] text-ink/50 font-mono">
                                            •••• {request.sender_account_last4}
                                        </span>
                                    )}
                                </Td>
                                <Td>
                                    <Badge tone={STATUS_TONES[request.status] ?? 'neutral'}>{request.status_label}</Badge>
                                    {request.reviewer && (
                                        <span className="block text-[11px] text-ink/50 mt-1">راجعه {request.reviewer.name}</span>
                                    )}
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <a
                                            href={request.receipt_url}
                                            title="عرض إشعار التحويل"
                                            className="p-1.5 rounded-lg bg-ink/5 hover:bg-ink/10 text-ink transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                        </a>
                                        {request.status !== 'approved' && request.status !== 'rejected' && (
                                            <>
                                                <IconButton
                                                    icon={CircleCheckBig}
                                                    label="اعتماد التحويل"
                                                    onClick={() => setApproving(request)}
                                                />
                                                <IconButton
                                                    icon={X}
                                                    label="رفض التحويل"
                                                    tone="danger"
                                                    onClick={() => {
                                                        setReason('');
                                                        setRejecting(request);
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={requests.data.length}
                            colSpan={6}
                            empty="لا توجد طلبات تحويل."
                            emptyHint="ستظهر هنا إشعارات التحويل التي يرفعها مسؤولو حسابات الشركات."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={requests} />
                    <Pagination page={requests} />
                </div>
            </Card>

            {/* H §18 — the amount and its effect, spelled out. */}
            <ConfirmModal
                open={approving !== null}
                title="اعتماد التحويل البنكي"
                message="سيُضاف المبلغ فوراً إلى محفظة الشركة ويصبح متاحاً للصرف على الفعاليات. لا يمكن التراجع إلا بإجراء «إلغاء الاعتماد» الموثّق."
                details={
                    approving && (
                        <>
                            <ConfirmRow label="الشركة" value={approving.company?.name ?? '—'} />
                            <ConfirmRow label="المبلغ" value={`${approving.amount.toLocaleString()} ريال`} strong />
                            <ConfirmRow label="الوجهة" value="المحفظة الرئيسية للشركة" />
                            <ConfirmRow label="المرجع البنكي" value={approving.bank_reference ?? '—'} />
                            <ConfirmRow label="مقدّم الطلب" value={approving.creator?.name ?? '—'} />

                            <label className="flex items-start gap-2 pt-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={reconciled}
                                    onChange={(event) => setReconciled(event.target.checked)}
                                    className="w-4 h-4 mt-0.5 rounded border-ink/25 accent-ink shrink-0"
                                />
                                <span className="text-[11px] font-bold text-ink leading-relaxed">
                                    أقرّ بمطابقة هذا المبلغ ورقمه المرجعي مع كشف الحساب البنكي الفعلي لتيمات.
                                </span>
                            </label>

                            {!reconciled && (
                                <p className="text-[10px] text-warning font-bold">
                                    يجب الإقرار بالمطابقة قبل تفعيل الاعتماد — هذا ما يفصل التدقيق عن الختم الآلي.
                                </p>
                            )}
                        </>
                    )
                }
                confirmDisabled={!reconciled}
                confirmLabel="اعتماد وتغذية المحفظة"
                onConfirm={() => {
                    router.post(`/admin/finance/topups/${approving?.id}/approve`, {}, { preserveScroll: true });
                    setApproving(null);
                    setReconciled(false);
                }}
                onCancel={() => {
                    setApproving(null);
                    setReconciled(false);
                }}
            />

            <ConfirmModal
                open={rejecting !== null}
                tone="danger"
                title="رفض التحويل البنكي"
                message="لن يُضاف أي رصيد إلى المحفظة، وسيصل السبب إلى مسؤول الحساب في الشركة."
                details={
                    rejecting && (
                        <>
                            <ConfirmRow label="الشركة" value={rejecting.company?.name ?? '—'} />
                            <ConfirmRow label="المبلغ المرفوض" value={`${rejecting.amount.toLocaleString()} ريال`} strong />
                            <ConfirmRow label="أثر الرفض" value="لا يُضاف رصيد للمحفظة الرئيسية" />
                            <div className="pt-2">
                                <label htmlFor="reject-reason" className="block text-[11px] font-bold text-ink mb-1">
                                    سبب الرفض (إلزامي)
                                </label>
                                <textarea
                                    id="reject-reason"
                                    rows={2}
                                    value={reason}
                                    onChange={(event) => setReason(event.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                                />
                            </div>
                        </>
                    )
                }
                confirmLabel="تأكيد الرفض"
                busy={reason.trim() === ''}
                onConfirm={() => {
                    router.post(
                        `/admin/finance/topups/${rejecting?.id}/reject`,
                        { rejection_reason: reason },
                        { preserveScroll: true },
                    );
                    setRejecting(null);
                }}
                onCancel={() => setRejecting(null)}
            />
        </AdminLayout>
    );
}
