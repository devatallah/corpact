import { router, useForm } from '@inertiajs/react';
import {
    CircleCheckBig,
    CreditCard,
    ShieldCheck,
    Smartphone,
    Timer,
    Wallet,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMinutesLeft } from '@/components/list-controls';
import { Badge } from '@/components/portal/ui';

/**
 * H §12.3 / §12.6 — ورقة السداد.
 *
 * نافذة لا صفحة: الدفع مقاطعة لما كان الموظف يفعله، لا وجهة يقصدها. تُفتح فوق
 * قائمة مدفوعاته، وإغلاقها يعيده إليها بلا فقدان موضعه — و«إغلاق مؤقتاً» لا
 * يُسقط المقعد، فالمهلة قائمة والرابط نفسه يستأنف.
 *
 * الحالتان في نافذة واحدة: الاختيار قبل الدفع، والإيصال بعده. فصلهما شاشتين
 * كان يجعل العودة من البوابة تهبط في مكان غير الذي انطلق منه.
 */
export type PaymentIntentDetail = {
    id: number;
    amount: string;
    base_amount: string;
    vat_amount: string;
    status: string;
    expires_at: string | null;
    gateway_reference: string | null;
    payment_method: string | null;
    event?: {
        id: number;
        title: string;
        event_date: string | null;
        start_time: string | null;
        community?: { id: number; name: string } | null;
    } | null;
};

export type PaymentInvoice = {
    serial: string;
    provisional: boolean;
    seller_name: string | null;
    seller_vat_number: string | null;
};

const METHOD_LABELS: Record<
    string,
    { label: string; hint: string; icon: typeof CreditCard }
> = {
    mada: {
        label: 'بطاقة مدى (Mada)',
        hint: 'الخصم الفوري المباشر من الحساب البنكي',
        icon: CreditCard,
    },
    apple_pay: {
        label: 'Apple Pay',
        hint: 'الدفع السريع بلمسة واحدة أو Face ID',
        icon: Smartphone,
    },
    card: {
        label: 'بطاقة ائتمانية (Visa / MasterCard)',
        hint: 'تُدخَل بياناتها في صفحة البوابة الآمنة، لا هنا',
        icon: CreditCard,
    },
};

export default function PaymentModal({
    intent,
    invoice,
    methods,
    statementDescriptor,
    onClose,
}: {
    intent: PaymentIntentDetail;
    invoice: PaymentInvoice | null;
    methods: string[];
    statementDescriptor: string;
    onClose: () => void;
}) {
    const pending = intent.status === 'pending';
    const paid = intent.status === 'paid';
    const minutesLeft = useMinutesLeft(intent.expires_at);
    const form = useForm({
        method: intent.payment_method ?? methods[0] ?? 'mada',
    });
    const [confirming, setConfirming] = useState(false);
    const restoreTo = useRef<HTMLElement | null>(null);

    useEffect(() => {
        restoreTo.current = document.activeElement as HTMLElement | null;

        function onKey(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        window.addEventListener('keydown', onKey);

        return () => {
            window.removeEventListener('keydown', onKey);
            restoreTo.current?.focus?.();
        };
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        >
            <div
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-modal-title"
                dir="rtl"
                className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-[0.5px] border-ink/10 bg-page font-arabic sm:rounded-3xl"
            >
                <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b-[0.5px] border-ink/10 bg-surface px-5 py-4">
                    <div>
                        <h2
                            id="payment-modal-title"
                            className="text-sm font-black text-ink"
                        >
                            سداد حصتك في الفعالية
                        </h2>
                        <p className="text-[11px] text-ink/55">
                            بوابة دفع آمنة ومعتمدة
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="إغلاق"
                        className="cursor-pointer rounded-full p-1.5 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </header>

                <div className="space-y-4 p-5">
                    <div className="space-y-2 rounded-2xl border-[0.5px] border-ink/12 bg-surface p-4">
                        <Row
                            label="الفعالية"
                            value={intent.event?.title ?? '—'}
                        />
                        <Row
                            label="الموعد"
                            value={`${intent.event?.event_date ?? '—'} · ${intent.event?.start_time ?? '—'}`}
                            mono
                        />
                        <div className="flex items-center justify-between gap-3 border-t-[0.5px] border-ink/10 pt-2">
                            <span className="text-[11px] text-ink/55">
                                المبلغ النهائي المستحق
                            </span>
                            <span className="text-start">
                                <span className="font-mono text-lg font-black text-ink">
                                    {intent.amount}
                                </span>{' '}
                                <span className="text-[11px] text-ink/55">
                                    ريال (شامل الضريبة)
                                </span>
                            </span>
                        </div>
                    </div>

                    {pending && (
                        <>
                            {minutesLeft !== null && (
                                <p className="flex items-center gap-2 rounded-xl border-[0.5px] border-warning/25 bg-warning-tint p-3 text-[11px] font-bold text-ink">
                                    <Timer
                                        className="h-3.5 w-3.5 shrink-0 text-warning"
                                        aria-hidden="true"
                                    />
                                    مهلة السداد: يتبقى {minutesLeft} دقيقة.
                                </p>
                            )}

                            <div className="space-y-2 rounded-xl border-[0.5px] border-ink/12 bg-ink/[0.03] p-3.5">
                                <p className="flex items-start gap-2 text-[11px] leading-relaxed text-ink/70">
                                    <ShieldCheck
                                        className="mt-px h-3.5 w-3.5 shrink-0 text-ink/50"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        مقعدك محجوز طوال المهلة — «إغلاق مؤقتاً»
                                        لا يُسقطه، والدفع يُستأنف من نفس الرابط.
                                    </span>
                                </p>
                                <p className="ps-5 text-[11px] leading-relaxed text-ink/70">
                                    سيظهر المبلغ في كشف حسابك البنكي باسم{' '}
                                    <span className="font-bold text-ink">
                                        {statementDescriptor}
                                    </span>{' '}
                                    — لا باسم المرفق.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xs font-black text-ink">
                                    اختر وسيلة الدفع
                                </h3>
                                {methods.map((option) => {
                                    const entry = METHOD_LABELS[option] ?? {
                                        label: option,
                                        hint: '',
                                        icon: Wallet,
                                    };
                                    const selected =
                                        form.data.method === option;

                                    return (
                                        <label
                                            key={option}
                                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-[0.5px] bg-surface p-3 transition-colors ${
                                                selected
                                                    ? 'border-ink bg-ink/[0.03]'
                                                    : 'border-ink/12 hover:border-ink/30'
                                            }`}
                                        >
                                            <span className="flex min-w-0 items-center gap-2.5">
                                                <entry.icon
                                                    className="h-4 w-4 shrink-0 text-ink/60"
                                                    aria-hidden="true"
                                                />
                                                <span className="min-w-0">
                                                    <span className="block text-xs font-extrabold text-ink">
                                                        {entry.label}
                                                    </span>
                                                    {entry.hint && (
                                                        <span className="block text-[10px] leading-relaxed text-ink/55">
                                                            {entry.hint}
                                                        </span>
                                                    )}
                                                </span>
                                            </span>
                                            <input
                                                type="radio"
                                                name="payment-method"
                                                value={option}
                                                checked={selected}
                                                onChange={() =>
                                                    form.setData(
                                                        'method',
                                                        option,
                                                    )
                                                }
                                                className="h-4 w-4 shrink-0 accent-ink"
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {paid && (
                        <div className="space-y-4 rounded-2xl border-[0.5px] border-success/25 bg-success-tint p-5 text-center">
                            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
                                <CircleCheckBig
                                    className="h-7 w-7 text-success"
                                    aria-hidden="true"
                                />
                            </span>

                            <div>
                                <h3 className="text-base font-black text-ink">
                                    تم تأكيد الدفع وحجز المقعد!
                                </h3>
                                <p className="text-xs text-ink/70">
                                    تم استلام مبلغ{' '}
                                    <span className="font-mono font-black">
                                        {intent.amount}
                                    </span>{' '}
                                    ريال بنجاح.
                                </p>
                            </div>

                            <div className="rounded-xl border-[0.5px] border-ink/10 bg-surface text-start">
                                {invoice && (
                                    <Row
                                        label={
                                            invoice.provisional
                                                ? 'رقم المستند (مبدئي)'
                                                : 'رقم الفاتورة الضريبية'
                                        }
                                        value={invoice.serial}
                                        mono
                                        padded
                                    />
                                )}
                                {invoice?.seller_name && (
                                    <Row
                                        label="المورّد"
                                        value={
                                            invoice.seller_vat_number
                                                ? `${invoice.seller_name} · ${invoice.seller_vat_number}`
                                                : invoice.seller_name
                                        }
                                        padded
                                    />
                                )}
                                <Row
                                    label="وسيلة الدفع المستخدمة"
                                    value={
                                        intent.payment_method
                                            ? (METHOD_LABELS[
                                                  intent.payment_method
                                              ]?.label ?? intent.payment_method)
                                            : '—'
                                    }
                                    padded
                                />
                                <Row
                                    label="تسجيل الحضور"
                                    value="تلقائي بانتهاء الفعالية"
                                    padded
                                    tone="success"
                                />
                            </div>

                            {invoice?.provisional && (
                                <p className="text-[10px] leading-relaxed text-ink/55">
                                    هذا مستند مبدئي بغرض الإثبات — تصدر الفاتورة
                                    الضريبية النهائية من{' '}
                                    {invoice.seller_name ?? 'المورّد'} بعد
                                    اعتماد الفوترة الضريبية.
                                </p>
                            )}
                        </div>
                    )}

                    {!pending && !paid && (
                        <Badge tone="neutral">{intent.status}</Badge>
                    )}
                </div>

                <footer className="sticky bottom-0 flex gap-2 border-t-[0.5px] border-ink/10 bg-surface px-5 py-4">
                    {pending ? (
                        <>
                            <button
                                type="button"
                                disabled={form.processing || confirming}
                                onClick={() => {
                                    setConfirming(true);
                                    form.post(
                                        `/employee/payments/${intent.id}/pay`,
                                    );
                                }}
                                className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-full border-[0.5px] border-lime bg-lime px-5 py-3 text-sm font-black text-ink transition-colors hover:bg-lime-hover disabled:opacity-60"
                            >
                                {confirming
                                    ? 'جارٍ التحويل…'
                                    : `تأكيد وسداد (${intent.amount} ريال)`}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-full border-[0.5px] border-ink/15 px-5 py-3 text-xs font-bold text-ink transition-colors hover:bg-ink/5"
                            >
                                إغلاق مؤقتاً
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => router.visit('/employee/explore')}
                            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border-[0.5px] border-lime bg-lime px-5 py-3 text-sm font-black text-ink transition-colors hover:bg-lime-hover"
                        >
                            تم — والعودة للفعاليات
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}

/** سطر وسم/قيمة — نفس الشكل في ملخّص الفعالية وفي الإيصال. */
function Row({
    label,
    value,
    mono = false,
    padded = false,
    tone,
}: {
    label: string;
    value: string;
    mono?: boolean;
    padded?: boolean;
    tone?: 'success';
}) {
    return (
        <div
            className={`flex items-center justify-between gap-3 ${padded ? 'border-b-[0.5px] border-ink/[0.07] px-3.5 py-2.5 last:border-b-0' : ''}`}
        >
            <span className="text-[11px] text-ink/55">{label}</span>
            <span
                className={`text-xs font-extrabold ${mono ? 'font-mono' : ''} ${tone === 'success' ? 'text-success' : 'text-ink'}`}
                dir={mono ? 'ltr' : undefined}
            >
                {value}
            </span>
        </div>
    );
}
