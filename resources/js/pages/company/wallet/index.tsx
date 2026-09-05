import { Head, useForm } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Landmark,
    Lock,
    Paperclip,
    Share2,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { ListStates } from '@/components/list-states';
import Modal from '@/components/modal';
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
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';
import { topupStatus } from '@/lib/status';

/**
 * H §12.5 — المحفظة الرئيسية وتخصيص الميزانيات.
 *
 * Three numbers, and they are not interchangeable: what is still
 * undistributed, what already sits in community wallets, and the two added
 * together. Showing one of them alone under the word «الرصيد» is how an
 * account manager comes to believe they have money they have already spent.
 *
 * The ledger below is append-only and says so. A running balance is printed
 * per row because a balance that cannot be reconciled line by line is a
 * number the reader has to trust rather than check — and correction here is
 * a reversing entry, never an edit.
 */
type CommunityRow = {
    id: number;
    name: string;
    icon: string | null;
    category?: { id: number; name: string; icon?: string | null } | null;
    leader?: { id: number; name: string } | null;
    wallet?: { id: number; balance: number } | null;
};

type Transaction = {
    id: number;
    type: string;
    type_label: string;
    direction: string;
    amount: number;
    signed_amount: number;
    balance_after: number;
    reference: string | null;
    actor_name: string | null;
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
    receipt_name: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string | null;
};

export default function CompanyWallet({
    company,
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
    const [panel, setPanel] = useState<'none' | 'topup' | 'distribute'>('none');

    const main = Number(wallet.balance);
    const allocated = communities.reduce(
        (sum, community) => sum + Number(community.wallet?.balance ?? 0),
        0,
    );
    const funded = communities.filter(
        (community) => Number(community.wallet?.balance ?? 0) > 0,
    ).length;
    const pendingTopups = topupRequests.filter(
        (row) => row.status === 'pending' || row.status === 'under_review',
    );

    return (
        <CompanyLayout>
            <Head title="المحفظة" />

            <PageHeader
                icon={Wallet}
                title="المحفظة الرئيسية وتخصيص الميزانيات"
                badge={`حساب ${company.name}`}
                subtitle="إدارة طلبات الشحن البنكي، وتخصيص ميزانيات المجتمعات، وسجل الحركات المحاسبي."
                actions={
                    <>
                        <Button
                            type="button"
                            tone="soft"
                            icon={Share2}
                            onClick={() =>
                                setPanel(
                                    panel === 'distribute'
                                        ? 'none'
                                        : 'distribute',
                                )
                            }
                        >
                            تخصيص رصيد لمجتمع
                        </Button>
                        <Button
                            type="button"
                            icon={Landmark}
                            onClick={() =>
                                setPanel(panel === 'topup' ? 'none' : 'topup')
                            }
                        >
                            طلب شحن رصيد
                        </Button>
                    </>
                }
            />

            <Note tone="warning" title="تنبيه الميزانية وإغلاق التسجيل">
                «اشحن قبل إغلاق التسجيل، لا بعده.» اعتماد طلب الشحن يستغرق وقتاً
                لدى الأدمن المالي، والرصيد الذي يصل بعد إغلاق التسجيل لا ينقذ
                فعالية فات موعد تأكيدها.
            </Note>

            {/* ── الأرصدة الثلاثة ── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-panel p-5 text-white">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime text-ink">
                            <Wallet className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="text-[11px] text-white/70">
                            الرصيد المتاح بالمحفظة الرئيسية
                        </span>
                    </div>
                    <span className="block font-mono text-2xl font-black text-lime">
                        {main.toFixed(2)} ر.س
                    </span>
                    <span className="mt-1 block text-[11px] text-white/55">
                        جاهز للتخصيص المباشر لمحافظ المجتمعات
                    </span>
                </div>

                <Card padding="p-5">
                    <span className="mb-2 block text-[11px] text-ink/55">
                        إجمالي الأرصدة الموزعة على المجتمعات
                    </span>
                    <span className="block font-mono text-2xl font-black text-ink">
                        {allocated.toFixed(2)} ر.س
                    </span>
                    <span className="mt-1 block text-[11px] text-ink/50">
                        موزعة على {funded} من {communities.length} مجتمعاً
                    </span>
                </Card>

                <Card padding="p-5">
                    <span className="mb-2 block text-[11px] text-ink/55">
                        إجمالي السيولة المودعة (الشركة + المجتمعات)
                    </span>
                    <span className="block font-mono text-2xl font-black text-ink">
                        {(main + allocated).toFixed(2)} ر.س
                    </span>
                    <span className="mt-1 block text-[11px] text-ink/50">
                        مجموع ما أودعته ولم يُصرف بعد
                    </span>
                </Card>
            </div>

            {/*
             * لوحتان كانتا تتمدّدان داخل الصفحة فتدفعان ما تحتهما وتضيعان
             * تحت الطيّة على الهاتف. نافذةٌ تُبقي الرصيد الذي يقرّر المبلغ
             * مرئياً خلفها، وتُغلق بلا أن تفقد الصفحة موضعها.
             */}
            <Modal
                open={panel === 'topup'}
                title="طلب شحن رصيد"
                subtitle="تحويل بنكي يعتمده الأدمن المالي — الرصيد لا يصل فوراً."
                onClose={() => setPanel('none')}
            >
                <TopupForm onDone={() => setPanel('none')} />
            </Modal>

            <Modal
                open={panel === 'distribute'}
                title="تخصيص رصيد لمجتمع"
                subtitle="من المحفظة الرئيسية إلى محفظة المجتمع — تحويل داخلي لا شحن جديد."
                onClose={() => setPanel('none')}
            >
                <DistributeForm
                    communities={communities}
                    balance={main}
                    onDone={() => setPanel('none')}
                />
            </Modal>

            {/* ── محافظ المجتمعات ── */}
            <Card padding="p-4" className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h2 className="text-sm font-extrabold text-ink">
                            أرصدة محافظ المجتمعات الفردية
                        </h2>
                        <p className="text-[11px] text-ink/55">
                            القادة يرون رصيد مجتمعهم فقط دون صلاحية شحنه.
                        </p>
                    </div>
                    <Button
                        type="button"
                        tone="soft"
                        icon={Share2}
                        onClick={() => setPanel('distribute')}
                    >
                        تخصيص رصيد إضافي
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {communities.map((community) => {
                        const balance = Number(community.wallet?.balance ?? 0);

                        return (
                            <div
                                key={community.id}
                                className="flex items-center gap-2.5 rounded-xl border-[0.5px] border-ink/12 bg-page p-3"
                            >
                                <span
                                    className="shrink-0 text-lg leading-none"
                                    aria-hidden="true"
                                >
                                    {community.icon ||
                                        community.category?.icon ||
                                        '👥'}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <span className="block truncate text-[11px] font-extrabold text-ink">
                                        {community.name}
                                    </span>
                                    <span className="block truncate text-[10px] text-ink/50">
                                        القائد:{' '}
                                        {community.leader?.name ??
                                            'بلا قائد حالياً'}
                                    </span>
                                </div>
                                <div className="shrink-0 text-end">
                                    <span
                                        className={`block font-mono text-xs font-black ${balance > 0 ? 'text-ink' : 'text-ink/35'}`}
                                    >
                                        {balance.toFixed(2)}
                                    </span>
                                    <span
                                        className={`block text-[9px] font-bold ${balance > 0 ? 'text-success' : 'text-warning'}`}
                                    >
                                        {balance > 0 ? 'رصيد متاح' : 'بلا رصيد'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <ListStates
                        count={communities.length}
                        empty="لا مجتمعات بعد."
                    />
                </div>
            </Card>

            {/* ── مسار طلبات الشحن ── */}
            <Card padding="p-4" className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h2 className="text-sm font-extrabold text-ink">
                            مسار طلبات الشحن البنكي والاعتماد
                        </h2>
                        <p className="font-mono text-[11px] text-ink/55">
                            مُقدَّم ← قيد المراجعة ← معتمد / مرفوض
                        </p>
                    </div>
                    <Badge
                        tone={pendingTopups.length > 0 ? 'warning' : 'neutral'}
                    >
                        {topupRequests.length} طلباً
                    </Badge>
                </div>

                <div className="space-y-2">
                    {topupRequests.map((row) => (
                        <div
                            key={row.id}
                            className="space-y-1.5 rounded-xl border-[0.5px] border-ink/12 bg-page p-3"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <span className="block font-mono text-sm font-black text-ink">
                                        <Money amount={row.amount} />
                                    </span>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10px] text-ink/55">
                                        <span dir="ltr">
                                            مرجع: {row.bank_reference ?? '—'}
                                        </span>
                                        <span>
                                            تاريخ التحويل:{' '}
                                            {row.transfer_date ?? '—'}
                                        </span>
                                        <span dir="ltr">
                                            آخر ٤ أرقام:{' '}
                                            {row.sender_account_last4 ?? '—'}
                                        </span>
                                    </div>
                                    {row.receipt_name && (
                                        <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-ink/55">
                                            <Paperclip
                                                className="h-2.5 w-2.5 shrink-0"
                                                aria-hidden="true"
                                            />
                                            <span dir="ltr">
                                                {row.receipt_name}
                                            </span>
                                        </span>
                                    )}
                                </div>

                                <Badge tone={topupStatus(row.status).tone}>
                                    {row.status_label}
                                </Badge>
                            </div>

                            {row.reviewed_by && (
                                <p className="text-[10px] font-bold text-success">
                                    {row.status === 'approved'
                                        ? 'اعتمده'
                                        : 'راجعه'}
                                    : {row.reviewed_by}
                                    {row.reviewed_at &&
                                        ` (${new Date(row.reviewed_at).toLocaleString('ar-SA')})`}
                                </p>
                            )}

                            {row.rejection_reason && (
                                <p className="text-[11px] text-danger">
                                    {row.rejection_reason}
                                </p>
                            )}
                        </div>
                    ))}

                    <ListStates
                        count={topupRequests.length}
                        empty="لا طلبات شحن بعد."
                        emptyHint="حوِّل إلى حساب تيمات البنكي ثم ارفع إشعار التحويل من زر «طلب شحن رصيد»."
                    />
                </div>
            </Card>

            {/* ── دفتر الأستاذ ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink">
                            دفتر أستاذ المحفظة المركزية
                            <Badge tone="success" icon={Lock}>
                                غير قابل للتعديل
                            </Badge>
                        </h2>
                        <p className="text-[11px] text-ink/55">
                            سجل محاسبي تراكمي — الرصيد ناتج مجموع الحركات، لا
                            قيمة تُكتب.
                        </p>
                    </div>
                    <div className="rounded-xl bg-panel px-3.5 py-2 text-end">
                        <span className="block text-[10px] text-white/60">
                            الرصيد المحاسبي
                        </span>
                        <span className="block font-mono text-sm font-black text-lime">
                            {main.toFixed(2)} ر.س
                        </span>
                    </div>
                </div>

                <Note title="مبدأ الحوكمة والنزاهة المحاسبية">
                    لا يُعدّل الرصيد مباشرة، وكل حركة مالية مسجّلة للأبد. لا
                    تُحذف الأخطاء — بل تُصحَّح بحركة محاسبية عكسية مرتبطة
                    بالمرجع الأصلي.
                </Note>

                <TableShell>
                    <Thead>
                        <Th>التاريخ والوقت</Th>
                        <Th>المرجع</Th>
                        <Th>النوع</Th>
                        <Th>البيان والسبب</Th>
                        <Th>المنفّذ</Th>
                        <Th>قيمة الحركة</Th>
                        <Th>الرصيد بعد الحركة</Th>
                    </Thead>
                    <Tbody>
                        {transactions.map((tx) => {
                            const credit = tx.signed_amount >= 0;

                            return (
                                <Tr key={tx.id}>
                                    <Td className="font-mono text-[11px] whitespace-nowrap text-ink/70">
                                        {tx.occurred_at
                                            ? new Date(
                                                  tx.occurred_at,
                                              ).toLocaleString('ar-SA')
                                            : '—'}
                                    </Td>
                                    <Td
                                        className="font-mono text-[10px] text-ink/60"
                                        dir="ltr"
                                    >
                                        {tx.reference ?? '—'}
                                    </Td>
                                    <Td className="text-ink/85">
                                        {tx.type_label}
                                    </Td>
                                    <Td className="max-w-xs text-[11px] text-ink/70">
                                        {tx.note ?? '—'}
                                    </Td>
                                    <Td className="text-[11px] text-ink/70">
                                        {tx.actor_name ?? 'النظام'}
                                    </Td>
                                    <Td>
                                        <span
                                            className={`inline-flex items-center gap-1 font-mono font-bold ${credit ? 'text-success' : 'text-ink'}`}
                                            dir="ltr"
                                        >
                                            {credit ? (
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
                                            {credit ? '+' : ''}
                                            {tx.signed_amount.toFixed(2)}
                                        </span>
                                    </Td>
                                    <Td className="font-mono font-black text-ink">
                                        {tx.balance_after.toFixed(2)}
                                    </Td>
                                </Tr>
                            );
                        })}
                        <ListStates
                            count={transactions.length}
                            colSpan={7}
                            empty="لا حركات على المحفظة."
                            emptyHint="أول قيد يظهر هنا بعد اعتماد أول طلب شحن."
                        />
                    </Tbody>
                </TableShell>

                <p className="flex items-center gap-1.5 text-[10px] text-ink/45">
                    <ShieldCheck
                        className="h-3 w-3 shrink-0"
                        aria-hidden="true"
                    />
                    تُعرض آخر 20 حركة. «الرصيد بعد الحركة» محسوب من كامل الدفتر
                    لا من هذه الصفحة.
                </p>
            </Card>
        </CompanyLayout>
    );
}

/** طلب شحن بتحويل بنكي — بإشعار التحويل، لأن الرصيد لا يُنشأ من فراغ. */
function TopupForm({ onDone }: { onDone: () => void }) {
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
                    onSuccess: () => {
                        form.reset();
                        onDone();
                    },
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
                    <Button type="button" tone="soft" onClick={onDone}>
                        إلغاء
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
    onDone,
}: {
    communities: CommunityRow[];
    balance: number;
    onDone: () => void;
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
                <FormGrid columns={2}>
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
                                    {community.leader?.name
                                        ? ` — ${community.leader.name}`
                                        : ' — بلا قائد'}
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
                </FormGrid>

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
                    <Button type="button" tone="soft" onClick={onDone}>
                        إلغاء
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
                        onSuccess: () => {
                            form.reset();
                            onDone();
                        },
                    });
                    setConfirming(false);
                }}
                onCancel={() => setConfirming(false)}
            />
        </>
    );
}
