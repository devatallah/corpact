import { Head, router } from '@inertiajs/react';
import { Ban, CircleCheckBig, Compass, Landmark, ShieldCheck, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, Money, PageHeader, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * H §17 — إشراف المزوّدين: ثلاث بوابات لا تُترك للأتمتة.
 *
 * Approving bank details is the gate on every payout; a price change under a
 * price contract rewrites what the platform will be charged; and a manual
 * reliability adjustment is the only score change a human makes — so it
 * cannot be saved without a documented reason.
 */
type BankRow = {
    id: number;
    name: string;
    trade_name: string | null;
    cr_number: string | null;
    bank_account_holder: string | null;
    bank_iban: string | null;
    bank_status: string;
    updated_at: string | null;
};

type PriceChange = {
    id: number;
    old_price: number;
    new_price: number;
    status: string;
    created_at: string;
    unit?: { id: number; name: string; branch?: { id: number; name: string; partner?: { id: number; name: string } } };
};

type Adjustment = {
    id: number;
    delta: number;
    /** The machine reason (`manual_adjustment`); `note` carries what a human wrote. */
    reason: string | null;
    note: string | null;
    score_before: number | null;
    score_after: number | null;
    created_at: string;
    partner?: { id: number; name: string };
};

/** Partner lifecycle states, as `Partner::$status` stores them. */
const PARTNER_STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
    active: { label: 'مفعّل', tone: 'success' },
    pending: { label: 'بانتظار الاعتماد', tone: 'warning' },
    suspended: { label: 'موقوف', tone: 'danger' },
    rejected: { label: 'مرفوض', tone: 'danger' },
};

type Provider = {
    id: number;
    name: string;
    trade_name: string | null;
    status: string;
    reliability_score: number | null;
    reliability_samples: number | null;
    bank_status: string;
    commission_rate: number | null;
};

export default function ProviderOversight({
    bankQueue,
    priceChanges,
    recentAdjustments,
    providers,
}: {
    bankQueue: BankRow[];
    priceChanges: PriceChange[];
    recentAdjustments: Adjustment[];
    providers: Provider[];
}) {
    const [approvingBank, setApprovingBank] = useState<BankRow | null>(null);
    const [deciding, setDeciding] = useState<{ change: PriceChange; decision: 'approved' | 'rejected' } | null>(null);
    const [adjusting, setAdjusting] = useState<Provider | null>(null);
    const [delta, setDelta] = useState(-5);
    const [reason, setReason] = useState('');

    return (
        <AdminLayout>
            <Head title="إشراف المزوّدين" />

            <PageHeader
                icon={Compass}
                title="إشراف المزوّدين"
                subtitle="اعتماد الحسابات البنكية، والبت في تعديلات الأسعار المتعاقد عليها، وتعديل مؤشر الموثوقية بتوثيق."
            />

            {/* ── اعتماد الحسابات البنكية ── */}
            <Card padding="p-0" className="overflow-hidden">
                <div className="p-4 border-b-[0.5px] border-ink/10 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-ink" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">حسابات بنكية بانتظار الاعتماد</h2>
                    {bankQueue.length > 0 && <Badge tone="warning">{bankQueue.length}</Badge>}
                </div>

                <TableShell>
                    <Thead>
                        <Th>المزوّد</Th>
                        <Th>السجل التجاري</Th>
                        <Th>اسم صاحب الحساب</Th>
                        <Th>الآيبان</Th>
                        <Th className="text-center">الإجراء</Th>
                    </Thead>
                    <Tbody>
                        {bankQueue.map((partner) => (
                            <Tr key={partner.id}>
                                <Td className="font-extrabold text-ink">{partner.trade_name ?? partner.name}</Td>
                                <Td className="font-mono text-[11px] text-ink/80">{partner.cr_number ?? '—'}</Td>
                                <Td className="text-ink/85">{partner.bank_account_holder ?? '—'}</Td>
                                <Td className="font-mono text-[11px] text-ink/80" dir="ltr">
                                    {partner.bank_iban ?? '—'}
                                </Td>
                                <Td className="text-center">
                                    <Button tone="soft" icon={CircleCheckBig} onClick={() => setApprovingBank(partner)}>
                                        اعتماد الحساب
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={bankQueue.length}
                            colSpan={5}
                            empty="لا توجد حسابات بنكية بانتظار الاعتماد."
                            emptyHint="كل المزوّدين المفعّلين لديهم حسابات معتمدة قابلة للصرف."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            {/* ── تعديلات الأسعار ── */}
            <Card padding="p-0" className="overflow-hidden">
                <div className="p-4 border-b-[0.5px] border-ink/10 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-ink" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">تعديلات أسعار تحت عقد سعر</h2>
                    {priceChanges.length > 0 && <Badge tone="warning">{priceChanges.length}</Badge>}
                </div>

                <TableShell>
                    <Thead>
                        <Th>الوحدة</Th>
                        <Th>السعر الحالي</Th>
                        <Th>السعر المقترح</Th>
                        <Th>الفرق</Th>
                        <Th className="text-center">القرار</Th>
                    </Thead>
                    <Tbody>
                        {priceChanges.map((change) => {
                            const diff = change.new_price - change.old_price;

                            return (
                                <Tr key={change.id}>
                                    <Td>
                                        <div className="font-extrabold text-ink">{change.unit?.name ?? '—'}</div>
                                        <span className="text-[11px] text-ink/50">
                                            {change.unit?.branch?.partner?.name ?? '—'} · {change.unit?.branch?.name ?? '—'}
                                        </span>
                                    </Td>
                                    <Td>
                                        <Money amount={change.old_price} className="text-ink/70" />
                                    </Td>
                                    <Td>
                                        <Money amount={change.new_price} className="text-ink" />
                                    </Td>
                                    <Td>
                                        <span className={`font-mono font-bold ${diff > 0 ? 'text-danger' : 'text-success'}`}>
                                            {diff > 0 ? '+' : ''}
                                            {diff.toLocaleString()}
                                        </span>
                                    </Td>
                                    <Td className="text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Button tone="soft" onClick={() => setDeciding({ change, decision: 'approved' })}>
                                                اعتماد
                                            </Button>
                                            <Button tone="danger" icon={X} onClick={() => setDeciding({ change, decision: 'rejected' })}>
                                                رفض
                                            </Button>
                                        </div>
                                    </Td>
                                </Tr>
                            );
                        })}
                        <ListStates count={priceChanges.length} colSpan={5} empty="لا توجد تعديلات أسعار معلّقة." />
                    </Tbody>
                </TableShell>
            </Card>

            {/* ── الموثوقية ── */}
            <Card padding="p-0" className="overflow-hidden">
                <div className="p-4 border-b-[0.5px] border-ink/10 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-ink" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">مؤشر الموثوقية</h2>
                </div>

                <TableShell>
                    <Thead>
                        <Th>المزوّد</Th>
                        <Th>الحالة</Th>
                        <Th>المؤشر</Th>
                        <Th>العينات</Th>
                        <Th>الحساب البنكي</Th>
                        <Th className="text-center">تعديل موثّق</Th>
                    </Thead>
                    <Tbody>
                        {providers.map((provider) => (
                            <Tr key={provider.id}>
                                <Td className="font-extrabold text-ink">{provider.trade_name ?? provider.name}</Td>
                                <Td>
                                    <Badge tone={PARTNER_STATUS[provider.status]?.tone ?? 'neutral'}>
                                        {PARTNER_STATUS[provider.status]?.label ?? provider.status}
                                    </Badge>
                                </Td>
                                <Td className="font-mono font-black text-ink">{provider.reliability_score ?? '—'}</Td>
                                <Td className="font-mono text-ink/70">{provider.reliability_samples ?? 0}</Td>
                                <Td>
                                    <Badge tone={provider.bank_status === 'approved' ? 'success' : 'danger'} icon={provider.bank_status === 'approved' ? undefined : Ban}>
                                        {provider.bank_status === 'approved' ? 'معتمد' : 'غير معتمد'}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    <Button
                                        tone="soft"
                                        icon={TrendingDown}
                                        onClick={() => {
                                            setDelta(-5);
                                            setReason('');
                                            setAdjusting(provider);
                                        }}
                                    >
                                        تعديل
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                        <ListStates count={providers.length} colSpan={6} empty="لا يوجد مزوّدون مسجّلون." />
                    </Tbody>
                </TableShell>
            </Card>

            {/* ── آخر التعديلات اليدوية ── */}
            <Card padding="p-0" className="overflow-hidden">
                <div className="p-4 border-b-[0.5px] border-ink/10">
                    <h2 className="text-sm font-extrabold text-ink">آخر التعديلات اليدوية على الموثوقية</h2>
                </div>
                <div className="divide-y-[0.5px] divide-ink/10">
                    {recentAdjustments.map((adjustment) => (
                        <div key={adjustment.id} className="p-4 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <span className="text-xs font-extrabold text-ink">{adjustment.partner?.name ?? '—'}</span>
                                <p className="text-[11px] text-ink/70 leading-relaxed mt-0.5">{adjustment.note ?? '—'}</p>
                            </div>
                            <div className="text-left shrink-0">
                                <span className={`font-mono font-black ${adjustment.delta > 0 ? 'text-success' : 'text-danger'}`}>
                                    {adjustment.delta > 0 ? '+' : ''}
                                    {adjustment.delta}
                                </span>
                                <span className="block text-[11px] text-ink/45 font-mono">
                                    {adjustment.score_before} ← {adjustment.score_after}
                                </span>
                            </div>
                        </div>
                    ))}
                    <ListStates count={recentAdjustments.length} empty="لا توجد تعديلات يدوية مسجّلة." />
                </div>
            </Card>

            {/* H §18 — approving a bank account is what unblocks every future payout. */}
            <ConfirmModal
                open={approvingBank !== null}
                title="اعتماد الحساب البنكي"
                message="الاعتماد يرفع الحجب عن صرف مستحقات هذا المزوّد. تأكد من مطابقة اسم صاحب الحساب للسجل التجاري."
                details={
                    approvingBank && (
                        <>
                            <ConfirmRow label="المزوّد" value={approvingBank.trade_name ?? approvingBank.name} />
                            <ConfirmRow label="صاحب الحساب" value={approvingBank.bank_account_holder ?? '—'} />
                            <ConfirmRow label="الآيبان" value={approvingBank.bank_iban ?? '—'} strong />
                            <ConfirmRow label="الأثر" value="تصبح كشوف التسوية قابلة للدفع" />
                        </>
                    )
                }
                confirmLabel="اعتماد الحساب"
                onConfirm={() => {
                    router.post(`/admin/providers/${approvingBank?.id}/bank/approve`, {}, { preserveScroll: true });
                    setApprovingBank(null);
                }}
                onCancel={() => setApprovingBank(null)}
            />

            <ConfirmModal
                open={deciding !== null}
                tone={deciding?.decision === 'rejected' ? 'danger' : 'default'}
                title={deciding?.decision === 'approved' ? 'اعتماد السعر الجديد' : 'رفض السعر الجديد'}
                message={
                    deciding?.decision === 'approved'
                        ? 'سيصبح السعر الجديد ساري المفعول على الفعاليات القادمة لهذه الوحدة.'
                        : 'يبقى السعر الحالي كما هو ويُبلَّغ المزوّد بالرفض.'
                }
                details={
                    deciding && (
                        <>
                            <ConfirmRow label="الوحدة" value={deciding.change.unit?.name ?? '—'} />
                            <ConfirmRow label="السعر الحالي" value={`${deciding.change.old_price.toLocaleString()} ريال`} />
                            <ConfirmRow label="السعر المقترح" value={`${deciding.change.new_price.toLocaleString()} ريال`} strong />
                        </>
                    )
                }
                confirmLabel={deciding?.decision === 'approved' ? 'اعتماد' : 'رفض'}
                onConfirm={() => {
                    router.post(
                        `/admin/providers/price-changes/${deciding?.change.id}`,
                        { decision: deciding?.decision },
                        { preserveScroll: true },
                    );
                    setDeciding(null);
                }}
                onCancel={() => setDeciding(null)}
            />

            <ConfirmModal
                open={adjusting !== null}
                title="تعديل مؤشر الموثوقية يدوياً"
                message="التعديل اليدوي استثناء موثّق: يُسجَّل باسمك وسببه في سجل التدقيق ويظهر للمزوّد."
                details={
                    adjusting && (
                        <>
                            <ConfirmRow label="المزوّد" value={adjusting.trade_name ?? adjusting.name} />
                            <ConfirmRow label="المؤشر الحالي" value={String(adjusting.reliability_score ?? '—')} />
                            <ConfirmRow
                                label="المؤشر بعد التعديل"
                                value={String((adjusting.reliability_score ?? 0) + delta)}
                                strong
                            />
                            <div className="pt-2 space-y-2">
                                <div>
                                    <label htmlFor="reliability-delta" className="block text-[11px] font-bold text-ink mb-1">
                                        مقدار التعديل (سالب أو موجب)
                                    </label>
                                    <input
                                        id="reliability-delta"
                                        type="number"
                                        min={-100}
                                        max={100}
                                        value={delta}
                                        onChange={(event) => setDelta(Number(event.target.value))}
                                        className="w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs font-mono bg-surface focus:outline-none focus:border-ink"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="reliability-reason" className="block text-[11px] font-bold text-ink mb-1">
                                        سبب التعديل (إلزامي — لا تعديل بلا توثيق)
                                    </label>
                                    <textarea
                                        id="reliability-reason"
                                        rows={2}
                                        value={reason}
                                        onChange={(event) => setReason(event.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                                    />
                                </div>
                            </div>
                        </>
                    )
                }
                confirmLabel="حفظ التعديل"
                busy={reason.trim().length < 5 || delta === 0}
                onConfirm={() => {
                    router.post(
                        `/admin/providers/${adjusting?.id}/reliability`,
                        { delta, reason },
                        { preserveScroll: true },
                    );
                    setAdjusting(null);
                }}
                onCancel={() => setAdjusting(null)}
            />
        </AdminLayout>
    );
}
