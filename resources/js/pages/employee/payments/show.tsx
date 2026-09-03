import { Head, Link, router } from '@inertiajs/react';
import { CreditCard, ShieldCheck, Smartphone, Timer, Wallet } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { useMinutesLeft } from '@/components/list-controls';
import { BackLink } from '@/components/list-states';
import { Badge } from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';

/**
 * H §12.3 / §12.6 — the collection screen.
 *
 * Teamat is the merchant of record, so the statement descriptor is stated up
 * front: the employee must recognise the line on their bank statement. The
 * VAT decomposition is shown because the total is what leaves their account
 * but the base is what the event actually costs.
 */
type Intent = {
    id: number;
    amount: string;
    base_amount: string;
    vat_amount: string;
    status: string;
    expires_at: string | null;
    paid_at: string | null;
    event?: {
        id: number;
        title: string;
        event_date: string | null;
        start_time: string | null;
        status: string;
        community?: { id: number; name: string } | null;
    } | null;
};

const METHOD_LABELS: Record<string, { label: string; icon: typeof CreditCard }> = {
    mada: { label: 'مدى', icon: CreditCard },
    card: { label: 'بطاقة ائتمانية', icon: CreditCard },
    apple_pay: { label: 'Apple Pay', icon: Smartphone },
};

export default function PaymentShow({
    intent,
    methods,
    statementDescriptor,
}: {
    intent: Intent;
    methods: string[];
    statementDescriptor: string;
}) {
    const [confirming, setConfirming] = useState(false);
    const pending = intent.status === 'pending';
    const minutesLeft = useMinutesLeft(intent.expires_at);

    return (
        <EmployeeLayout>
            <Head title="سداد الحصة" />

            <BackLink href="/employee/payments" label="العودة إلى مدفوعاتي" />

            <div className="p-4 bg-surface rounded-2xl border-[0.5px] border-ink/15 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="text-[11px] text-ink/60 mb-0.5 truncate">{intent.event?.community?.name ?? '—'}</div>
                        <h1 className="text-sm font-black text-ink leading-snug">{intent.event?.title ?? '—'}</h1>
                    </div>
                    <Badge tone={pending ? 'warning' : intent.status === 'paid' ? 'success' : 'neutral'}>
                        {pending ? 'بانتظار السداد' : intent.status === 'paid' ? 'مسدَّدة' : intent.status}
                    </Badge>
                </div>

                <div className="font-mono text-[11px] text-ink/60 pt-1 border-t-[0.5px] border-ink/10">
                    {intent.event?.event_date ?? '—'} · {intent.event?.start_time ?? '—'}
                </div>
            </div>

            {/* ── المبلغ وتفكيكه الضريبي ── */}
            <div className="p-4 bg-ink text-white rounded-2xl space-y-3">
                <div className="text-center">
                    <div className="text-xs text-white/60">المبلغ المستحق</div>
                    <div className="text-[32px] font-black text-lime font-mono leading-tight">
                        {intent.amount} <span className="text-sm font-normal text-white/80">ر.س</span>
                    </div>
                    <div className="text-[11px] text-white/50">شامل ضريبة القيمة المضافة</div>
                </div>

                <div className="space-y-1.5 pt-3 border-t-[0.5px] border-white/15 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-white/60">الأساس</span>
                        <span className="font-mono font-bold">{intent.base_amount} ر.س</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-white/60">ضريبة القيمة المضافة</span>
                        <span className="font-mono font-bold">{intent.vat_amount} ر.س</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t-[0.5px] border-white/10">
                        <span className="text-white/80 font-bold">الإجمالي</span>
                        <span className="font-mono font-black text-lime">{intent.amount} ر.س</span>
                    </div>
                </div>

                {pending && minutesLeft !== null && (
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-white/70 pt-1">
                        <Timer className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>يتبقى {minutesLeft} دقيقة على انتهاء المهلة</span>
                    </div>
                )}
            </div>

            {/* ── وسائل الدفع ── */}
            <div className="p-4 bg-surface rounded-2xl border-[0.5px] border-ink/15 space-y-2.5">
                <h2 className="text-xs font-black text-ink">وسائل الدفع المتاحة</h2>
                <div className="flex flex-wrap gap-2">
                    {methods.map((method) => {
                        const entry = METHOD_LABELS[method] ?? { label: method, icon: Wallet };

                        return (
                            <span
                                key={method}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-[0.5px] border-ink/15 text-[11px] font-bold text-ink"
                            >
                                <entry.icon className="w-3.5 h-3.5 text-ink/60" aria-hidden="true" />
                                {entry.label}
                            </span>
                        );
                    })}
                </div>

                <div className="flex items-start gap-2 text-[11px] text-ink/60 pt-2 border-t-[0.5px] border-ink/10 leading-relaxed">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-px text-ink/50" aria-hidden="true" />
                    <span>
                        سيظهر في كشف حسابك البنكي باسم{' '}
                        <span className="font-bold text-ink">{statementDescriptor}</span> — وليس باسم المرفق.
                    </span>
                </div>
            </div>

            {pending ? (
                <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-lime text-ink border-[0.5px] border-lime hover:bg-lime-hover text-sm font-black px-5 py-3.5 transition-colors cursor-pointer"
                >
                    المتابعة إلى الدفع ({intent.amount} ر.س)
                </button>
            ) : (
                <Link
                    href={`/employee/detail/${intent.event?.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-ink/5 text-ink border-[0.5px] border-ink/15 hover:bg-ink/10 text-xs font-bold px-5 py-3 transition-colors"
                >
                    عرض تفاصيل الفعالية
                </Link>
            )}

            <ConfirmModal
                open={confirming}
                title="تأكيد الانتقال لبوابة الدفع"
                message="ستنتقل إلى صفحة الدفع الآمنة لإتمام العملية. مقعدك محجوز حتى انتهاء المهلة."
                details={
                    <>
                        <ConfirmRow label="الفعالية" value={intent.event?.title ?? '—'} />
                        <ConfirmRow label="الأساس" value={`${intent.base_amount} ريال`} />
                        <ConfirmRow label="الضريبة" value={`${intent.vat_amount} ريال`} />
                        <ConfirmRow label="الإجمالي المخصوم" value={`${intent.amount} ريال`} strong />
                        <ConfirmRow label="يظهر في كشف حسابك باسم" value={statementDescriptor} />
                    </>
                }
                confirmLabel="المتابعة للدفع"
                onConfirm={() => {
                    router.post(`/employee/payments/${intent.id}/pay`);
                    setConfirming(false);
                }}
                onCancel={() => setConfirming(false)}
            />
        </EmployeeLayout>
    );
}
