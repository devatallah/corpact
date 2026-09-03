import { Head, useForm } from '@inertiajs/react';
import { ArrowDownLeft, ArrowUpRight, Landmark, Wallet } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { ListStates } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    INPUT,
    Money,
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
import { topupStatus } from '@/lib/status';

/**
 * H §12.5 — المحفظة.
 *
 * There is no instant self-service top-up on this screen and that is the
 * point: the balance moves only by a ledger entry, so the company files a
 * bank-transfer request with its receipt and the finance admin approves it.
 * Anything else would let a number on this page disagree with the ledger.
 *
 * Distribution to a community is real money leaving the main wallet, so it
 * confirms with the amount and the destination named.
 */
type CommunityRow = {
    id: number;
    name: string;
    category?: { id: number; name: string } | null;
    wallet?: { id: number; balance: number } | null;
};

type Transaction = {
    id: number;
    type: string;
    type_label: string;
    direction: string;
    amount: number;
    note: string | null;
    occurred_at: string | null;
};

type TopupRow = {
    id: number;
    amount: string | number;
    transfer_date: string | null;
    sender_account_last4: string | null;
    bank_reference: string | null;
    status: string;
    status_label: string;
    rejection_reason: string | null;
    created_at: string | null;
};

export default function CompanyWallet({
    wallet,
    communities,
    transactions,
    topupRequests,
}: {
    company: { id: number; name: string };
    wallet: { id: number; balance: number };
    walletData: { wallet_id: number; balance: number };
    communities: CommunityRow[];
    transactions: Transaction[];
    topupRequests: TopupRow[];
}) {
    const allocated = communities.reduce(
        (sum, community) => sum + Number(community.wallet?.balance ?? 0),
        0,
    );
    const pendingTopups = topupRequests.filter(
        (row) => row.status === 'pending' || row.status === 'under_review',
    );

    return (
        <CompanyLayout>
            <Head title="المحفظة" />

            <PageHeader
                icon={Wallet}
                title="المحفظة"
                subtitle="الرصيد لا يتحرك إلا بقيد دفتر — الشحن بتحويل بنكي يعتمده الأدمن المالي."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="الرصيد الرئيسي"
                    value={Number(wallet.balance).toFixed(2)}
                    hint="ريال"
                    tone="success"
                />
                <StatCard
                    label="موزَّع على المجتمعات"
                    value={allocated.toFixed(2)}
                    hint="ريال"
                />
                <StatCard label="المجتمعات" value={communities.length} />
                <StatCard
                    label="طلبات شحن معلّقة"
                    value={pendingTopups.length}
                    tone={pendingTopups.length > 0 ? 'warning' : 'success'}
                    hint={
                        pendingTopups.length > 0
                            ? 'بانتظار الأدمن المالي'
                            : 'لا شيء معلّق'
                    }
                />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <TopupForm />
                <DistributeForm
                    communities={communities}
                    balance={Number(wallet.balance)}
                />
            </div>

            {/* ── طلبات الشحن ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-ink" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">
                        طلبات الشحن
                    </h2>
                </div>

                <TableShell>
                    <Thead>
                        <Th>المبلغ</Th>
                        <Th>تاريخ التحويل</Th>
                        <Th>حساب المُرسِل</Th>
                        <Th>مرجع العملية</Th>
                        <Th>الحالة</Th>
                    </Thead>
                    <Tbody>
                        {topupRequests.map((row) => (
                            <Tr key={row.id}>
                                <Td>
                                    <Money amount={row.amount} />
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {row.transfer_date ?? '—'}
                                </Td>
                                <Td
                                    className="font-mono text-[11px] text-ink/70"
                                    dir="ltr"
                                >
                                    ****{row.sender_account_last4 ?? '—'}
                                </Td>
                                <Td
                                    className="font-mono text-[11px] text-ink/70"
                                    dir="ltr"
                                >
                                    {row.bank_reference ?? '—'}
                                </Td>
                                <Td>
                                    <Badge tone={topupStatus(row.status).tone}>
                                        {row.status_label}
                                    </Badge>
                                    {row.rejection_reason && (
                                        <span className="mt-1 block text-[11px] text-danger">
                                            {row.rejection_reason}
                                        </span>
                                    )}
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={topupRequests.length}
                            colSpan={5}
                            empty="لا طلبات شحن بعد."
                            emptyHint="ارفع طلبك الأول من النموذج أعلاه بعد إتمام التحويل البنكي."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            {/* ── دفتر الحركات ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-ink">
                        آخر الحركات
                    </h2>
                    <span className="text-[11px] text-ink/50">
                        آخر 20 قيداً
                    </span>
                </div>

                <TableShell>
                    <Thead>
                        <Th>التاريخ</Th>
                        <Th>النوع</Th>
                        <Th>البيان</Th>
                        <Th>المبلغ</Th>
                    </Thead>
                    <Tbody>
                        {transactions.map((tx) => {
                            const isCredit =
                                tx.direction === 'credit' ||
                                tx.direction === 'in';

                            return (
                                <Tr key={tx.id}>
                                    <Td className="font-mono text-[11px] whitespace-nowrap text-ink/70">
                                        {tx.occurred_at
                                            ? new Date(
                                                  tx.occurred_at,
                                              ).toLocaleDateString('ar-SA')
                                            : '—'}
                                    </Td>
                                    <Td className="text-ink/85">
                                        {tx.type_label}
                                    </Td>
                                    <Td className="max-w-xs text-ink/70">
                                        {tx.note ?? '—'}
                                    </Td>
                                    <Td>
                                        <span
                                            className={`inline-flex items-center gap-1 font-mono font-bold ${isCredit ? 'text-success' : 'text-ink'}`}
                                        >
                                            {isCredit ? (
                                                <ArrowDownLeft
                                                    className="h-3.5 w-3.5"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <ArrowUpRight
                                                    className="h-3.5 w-3.5"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            {Number(tx.amount).toFixed(2)}
                                        </span>
                                    </Td>
                                </Tr>
                            );
                        })}
                        <ListStates
                            count={transactions.length}
                            colSpan={4}
                            empty="لا حركات على المحفظة."
                            emptyHint="أول قيد يظهر هنا بعد اعتماد أول طلب شحن."
                        />
                    </Tbody>
                </TableShell>
            </Card>
        </CompanyLayout>
    );
}

/** طلب شحن بتحويل بنكي — بإشعار التحويل، لأن الرصيد لا يُنشأ من فراغ. */
function TopupForm() {
    const form = useForm<{
        amount: string;
        transfer_date: string;
        sender_account_last4: string;
        bank_reference: string;
        receipt: File | null;
    }>({
        amount: '',
        transfer_date: '',
        sender_account_last4: '',
        bank_reference: '',
        receipt: null,
    });

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                form.post('/company/wallet/topup', {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => form.reset(),
                });
            }}
        >
            <FormSection
                title="طلب شحن المحفظة"
                hint="حوِّل إلى حساب تيمات البنكي ثم ارفع إشعار التحويل هنا. يُضاف الرصيد بعد اعتماد الأدمن المالي — لا قبله."
            >
                <FormGrid>
                    <Field
                        label="المبلغ (ريال)"
                        error={form.errors.amount}
                        required
                    >
                        <input
                            type="number"
                            min="1"
                            step="0.01"
                            dir="ltr"
                            className={INPUT}
                            value={form.data.amount}
                            onChange={(event) =>
                                form.setData('amount', event.target.value)
                            }
                        />
                    </Field>

                    <Field
                        label="تاريخ التحويل"
                        error={form.errors.transfer_date}
                        required
                    >
                        <input
                            type="date"
                            dir="ltr"
                            className={INPUT}
                            value={form.data.transfer_date}
                            onChange={(event) =>
                                form.setData(
                                    'transfer_date',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>

                    <Field
                        label="آخر 4 أرقام من حساب المُرسِل"
                        error={form.errors.sender_account_last4}
                        hint="لمطابقة التحويل بكشف البنك."
                        required
                    >
                        <input
                            inputMode="numeric"
                            maxLength={4}
                            dir="ltr"
                            className={INPUT}
                            value={form.data.sender_account_last4}
                            onChange={(event) =>
                                form.setData(
                                    'sender_account_last4',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>

                    <Field
                        label="مرجع العملية"
                        error={form.errors.bank_reference}
                        required
                    >
                        <input
                            dir="ltr"
                            className={INPUT}
                            value={form.data.bank_reference}
                            onChange={(event) =>
                                form.setData(
                                    'bank_reference',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                </FormGrid>

                <Field
                    label="إشعار التحويل"
                    error={form.errors.receipt}
                    hint="صورة jpg/png أو PDF، بحد أقصى 5 ميجابايت."
                    required
                >
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="w-full text-xs text-ink/80 file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-2 file:text-[11px] file:font-bold file:text-lime"
                        onChange={(event) =>
                            form.setData(
                                'receipt',
                                event.target.files?.[0] ?? null,
                            )
                        }
                    />
                </Field>

                <FormActions>
                    <Button type="submit" disabled={form.processing}>
                        رفع طلب الشحن
                    </Button>
                </FormActions>
            </FormSection>
        </form>
    );
}

/** توزيع الرصيد على مجتمع — مال يغادر المحفظة الرئيسية، فيمرّ بتأكيد يسمّي المبلغ والوجهة. */
function DistributeForm({
    communities,
    balance,
}: {
    communities: CommunityRow[];
    balance: number;
}) {
    const form = useForm({ community_id: '', amount: '' });
    const [confirming, setConfirming] = useState(false);

    const target = communities.find(
        (community) => String(community.id) === form.data.community_id,
    );
    const amount = Number(form.data.amount || 0);
    const remaining = balance - amount;

    return (
        <>
            <FormSection
                title="توزيع الرصيد على مجتمع"
                hint="ينتقل المبلغ من المحفظة الرئيسية إلى محفظة المجتمع، فيصرف منه قائد المجتمع على فعالياته."
            >
                <Field
                    label="المجتمع"
                    error={form.errors.community_id}
                    required
                >
                    <select
                        className={INPUT}
                        value={form.data.community_id}
                        onChange={(event) =>
                            form.setData('community_id', event.target.value)
                        }
                    >
                        <option value="">— اختر المجتمع —</option>
                        {communities.map((community) => (
                            <option key={community.id} value={community.id}>
                                {community.name}
                                {community.category?.name
                                    ? ` — ${community.category.name}`
                                    : ''}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field
                    label="المبلغ (ريال)"
                    error={form.errors.amount}
                    required
                >
                    <input
                        type="number"
                        min="1"
                        step="0.01"
                        dir="ltr"
                        className={INPUT}
                        value={form.data.amount}
                        onChange={(event) =>
                            form.setData('amount', event.target.value)
                        }
                    />
                </Field>

                {target && (
                    <Note title="رصيد هذا المجتمع الآن">
                        <span className="font-mono font-bold">
                            {Number(target.wallet?.balance ?? 0).toFixed(2)}
                        </span>{' '}
                        ر.س — يصبح{' '}
                        <span className="font-mono font-bold">
                            {(
                                Number(target.wallet?.balance ?? 0) + amount
                            ).toFixed(2)}
                        </span>{' '}
                        ر.س بعد التوزيع.
                    </Note>
                )}

                {remaining < 0 && (
                    <p className="text-[11px] font-bold text-danger">
                        المبلغ يتجاوز رصيد المحفظة الرئيسية.
                    </p>
                )}
                <FormActions>
                    <Button
                        type="button"
                        disabled={
                            form.processing ||
                            !form.data.community_id ||
                            amount <= 0 ||
                            remaining < 0
                        }
                        onClick={() => setConfirming(true)}
                    >
                        توزيع الرصيد
                    </Button>
                </FormActions>
            </FormSection>

            <ConfirmModal
                open={confirming}
                title="تأكيد توزيع الرصيد"
                message="ينتقل المبلغ فوراً من المحفظة الرئيسية إلى محفظة المجتمع بقيد دفتر. لسحبه لاحقاً راجع فريق تيمات."
                details={
                    <>
                        <ConfirmRow
                            label="المجتمع"
                            value={target?.name ?? '—'}
                            strong
                        />
                        <ConfirmRow
                            label="المبلغ"
                            value={`${amount.toFixed(2)} ر.س`}
                            strong
                        />
                        <ConfirmRow
                            label="رصيد المحفظة قبل"
                            value={`${balance.toFixed(2)} ر.س`}
                        />
                        <ConfirmRow
                            label="رصيد المحفظة بعد"
                            value={`${remaining.toFixed(2)} ر.س`}
                        />
                    </>
                }
                confirmLabel="نعم، وزِّع المبلغ"
                onConfirm={() => {
                    form.post('/company/wallet/distribute', {
                        preserveScroll: true,
                        onSuccess: () => form.reset(),
                    });
                    setConfirming(false);
                }}
                onCancel={() => setConfirming(false)}
            />
        </>
    );
}
