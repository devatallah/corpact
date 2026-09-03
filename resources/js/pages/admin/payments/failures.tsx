import { Head, router } from '@inertiajs/react';
import { AlertTriangle, RefreshCw, Timer, Webhook } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, Money, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §12.6 — ما لم تستطع بوابة الدفع إنهاءه.
 *
 * Three different failures, and conflating them wastes the finance admin's
 * day: a refund the gateway rejected (money owed and not returned), a claim
 * whose window expired (a seat lost, no money moved), and a webhook the
 * platform could not process (the ledger may be behind the gateway).
 *
 * Retrying a refund reuses the same idempotency key — never a double refund.
 */
type FailedRefund = {
    id: number;
    event: { id: number; title: string; event_date: string | null } | null;
    community: { id: number; name: string } | null;
    employee: { id: number; name: string } | null;
    amount: string;
    refund_reason: string | null;
    refund_attempts: number;
    refund_last_error: string | null;
    max_auto_retries: number;
    updated_at: string | null;
};

type ExpiredIntent = {
    id: number;
    event: { id: number; title: string; event_date: string | null } | null;
    employee: { id: number; name: string } | null;
    amount: string;
    expires_at: string | null;
};

type FailedWebhook = {
    id: number;
    gateway: string;
    event_type: string | null;
    gateway_reference: string | null;
    error: string | null;
    created_at: string | null;
};

export default function PaymentFailures({
    failedRefunds,
    expiredIntents,
    failedWebhooks,
    filters,
    sort,
}: {
    failedRefunds: Paginated<FailedRefund>;
    expiredIntents: ExpiredIntent[];
    failedWebhooks: FailedWebhook[];
    filters: { search?: string; state?: string };
    sort: SortState;
}) {
    const [retrying, setRetrying] = useState<FailedRefund | null>(null);

    return (
        <AdminLayout>
            <Head title="فشل المدفوعات" />

            <PageHeader
                icon={AlertTriangle}
                title="فشل المدفوعات والاستردادات"
                subtitle="ثلاثة أنواع مختلفة من الفشل: استرداد لم ينفَّذ، مطالبة انقضت مهلتها، وويبهوك لم يُعالَج."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <StatCard
                    label="استردادات فاشلة"
                    value={failedRefunds.total}
                    hint="مال مستحق لم يُعَد"
                    tone={failedRefunds.total > 0 ? 'danger' : 'success'}
                />
                <StatCard
                    label="مطالبات انقضت مهلتها"
                    value={expiredIntents.length}
                    hint="مقاعد سقطت — لا حركة مالية"
                    tone={expiredIntents.length > 0 ? 'warning' : 'success'}
                />
                <StatCard
                    label="ويبهوكات فاشلة"
                    value={failedWebhooks.length}
                    hint="قد يكون الدفتر متأخراً عن البوابة"
                    tone={failedWebhooks.length > 0 ? 'danger' : 'success'}
                />
            </div>

            {/* ── الاستردادات الفاشلة ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-danger" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">استردادات فاشلة — مال مستحق للموظف</h2>
                </div>

                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالموظف أو الفعالية…" />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>الموظف والفعالية</Th>
                        <Th>
                            <SortableHeader label="المبلغ" sortKey="amount" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="المحاولات" sortKey="refund_attempts" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>آخر خطأ</Th>
                        <Th className="text-center">الإجراء</Th>
                    </Thead>

                    <Tbody>
                        {failedRefunds.data.map((refund) => {
                            const exhausted = refund.refund_attempts >= refund.max_auto_retries;

                            return (
                                <Tr key={refund.id}>
                                    <Td>
                                        <span className="font-extrabold text-ink block">{refund.employee?.name ?? '—'}</span>
                                        <span className="text-[11px] text-ink/60">{refund.event?.title ?? '—'}</span>
                                        <span className="block text-[11px] text-ink/45">{refund.community?.name ?? ''}</span>
                                    </Td>
                                    <Td>
                                        <Money amount={refund.amount} className="text-ink" />
                                    </Td>
                                    <Td>
                                        <span className="font-mono font-bold text-ink">
                                            {refund.refund_attempts} / {refund.max_auto_retries}
                                        </span>
                                        {exhausted && <Badge tone="danger">استُنفدت المحاولات الآلية</Badge>}
                                    </Td>
                                    <Td className="text-[11px] text-danger max-w-xs">{refund.refund_last_error ?? '—'}</Td>
                                    <Td className="text-center">
                                        <Button tone="soft" icon={RefreshCw} onClick={() => setRetrying(refund)}>
                                            إعادة المحاولة
                                        </Button>
                                    </Td>
                                </Tr>
                            );
                        })}

                        <ListStates
                            count={failedRefunds.data.length}
                            colSpan={5}
                            empty="لا استردادات فاشلة."
                            emptyHint="كل ما استُحق ردّه عاد إلى وسيلة الدفع الأصلية."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={failedRefunds} />
                    <Pagination page={failedRefunds} />
                </div>
            </Card>

            {/* ── المطالبات المنتهية ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-warning" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">مطالبات انقضت مهلتها</h2>
                </div>

                <TableShell>
                    <Thead>
                        <Th>الموظف</Th>
                        <Th>الفعالية</Th>
                        <Th>الحصة</Th>
                        <Th>انتهت في</Th>
                    </Thead>
                    <Tbody>
                        {expiredIntents.map((intent) => (
                            <Tr key={intent.id}>
                                <Td className="font-extrabold text-ink">{intent.employee?.name ?? '—'}</Td>
                                <Td className="text-ink/85">{intent.event?.title ?? '—'}</Td>
                                <Td>
                                    <Money amount={intent.amount} className="text-ink/85" />
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {intent.expires_at ? new Date(intent.expires_at).toLocaleString('ar-SA') : '—'}
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={expiredIntents.length}
                            colSpan={4}
                            empty="لا مطالبات منتهية."
                            emptyHint="لم يفقد أحد مقعده بسبب انقضاء المهلة."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            {/* ── الويبهوكات ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-danger" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">ويبهوكات لم تُعالَج</h2>
                </div>

                <TableShell>
                    <Thead>
                        <Th>البوابة</Th>
                        <Th>النوع</Th>
                        <Th>المرجع</Th>
                        <Th>الخطأ</Th>
                        <Th>الوقت</Th>
                    </Thead>
                    <Tbody>
                        {failedWebhooks.map((webhook) => (
                            <Tr key={webhook.id}>
                                <Td className="font-bold text-ink">{webhook.gateway}</Td>
                                <Td className="font-mono text-[11px] text-ink/80">{webhook.event_type ?? '—'}</Td>
                                <Td className="font-mono text-[11px] text-ink/60" dir="ltr">
                                    {webhook.gateway_reference ?? '—'}
                                </Td>
                                <Td className="text-[11px] text-danger max-w-xs">{webhook.error ?? '—'}</Td>
                                <Td className="font-mono text-[11px] text-ink/60">
                                    {webhook.created_at ? new Date(webhook.created_at).toLocaleString('ar-SA') : '—'}
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={failedWebhooks.length}
                            colSpan={5}
                            empty="لا ويبهوكات فاشلة."
                            emptyHint="الدفتر متزامن مع البوابة."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            <Note title="لماذا لا تُعاد المحاولة تلقائياً إلى الأبد؟">
                بعد استنفاد المحاولات الآلية يبقى الاسترداد هنا عمداً: تكرار الفشل يعني مشكلة في وسيلة الدفع نفسها لا في
                الاتصال، ومعالجتها قرار بشري لا حلقة تكرار صامتة.
            </Note>

            <ConfirmModal
                open={retrying !== null}
                title="إعادة محاولة الاسترداد"
                message="تُستخدَم نفس مفتاح التفرّد، فلا يمكن أن يُرَدّ المبلغ مرتين مهما تكرّرت المحاولة."
                details={
                    retrying && (
                        <>
                            <ConfirmRow label="الموظف" value={retrying.employee?.name ?? '—'} />
                            <ConfirmRow label="الفعالية" value={retrying.event?.title ?? '—'} />
                            <ConfirmRow label="المبلغ المسترد" value={`${retrying.amount} ريال`} strong />
                            <ConfirmRow label="الوجهة" value="وسيلة الدفع الأصلية" />
                            <ConfirmRow label="المحاولات السابقة" value={String(retrying.refund_attempts)} />
                        </>
                    )
                }
                confirmLabel="إعادة المحاولة"
                onConfirm={() => {
                    router.post(`/admin/payments/refunds/${retrying?.id}/retry`, {}, { preserveScroll: true });
                    setRetrying(null);
                }}
                onCancel={() => setRetrying(null)}
            />
        </AdminLayout>
    );
}
