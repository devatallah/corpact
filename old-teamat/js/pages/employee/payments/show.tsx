import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Card, HeroCard, InsetRow, Pill, Screen } from '@/components/employee/ui';
import EmployeeLayout from '@/layouts/employee-layout';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { PaymentIntent, Event, Community } from '@/types/models';

interface Props {
    intent: PaymentIntent & { event?: Event & { community?: Community } };
    methods: string[];
    statementDescriptor: string;
}

const METHOD_LABELS: Record<string, string> = {
    mada: 'مدى',
    card: 'بطاقة ائتمانية',
    apple_pay: 'Apple Pay',
};

type Tone = 'lime' | 'success' | 'warning' | 'danger' | 'neutral';

const STATUS_LABELS: Record<string, { label: string; tone: Tone }> = {
    pending: { label: 'بانتظار الدفع', tone: 'warning' },
    paid: { label: 'مدفوعة', tone: 'success' },
    expired: { label: 'انتهت المهلة', tone: 'danger' },
    cancelled: { label: 'أُلغيت', tone: 'neutral' },
    refunded: { label: 'مُردّة لوسيلة الدفع الأصلية', tone: 'neutral' },
};

/**
 * صفحة دفع الحصة (A10 — H §12.3 / دليل الموظف §6): المبلغ النهائي المقفل
 * (شامل الضريبة ومفكَّكاً)، وسائل الدفع، وعدّاد المهلة. المقعد محجوز طوال
 * النافذة — إغلاق الصفحة لا يلغي شيئاً والدفع يُستأنف من نفس الرابط.
 */
export default function PaymentShow({ intent, methods, statementDescriptor }: Props) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);

        return () => clearInterval(timer);
    }, []);

    const remaining = useMemo(() => {
        if (!intent.expires_at) {
return null;
}

        const diff = Math.max(0, Math.floor((new Date(intent.expires_at).getTime() - now) / 1000));
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;

        return { diff, text: h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}` };
    }, [intent.expires_at, now]);

    const status = STATUS_LABELS[intent.status] ?? STATUS_LABELS.pending;
    const payable = intent.status === 'pending' && remaining !== null && remaining.diff > 0;

    function handlePay() {
        router.post(`/employee/payments/${intent.id}/pay`);
    }

    return (
        <EmployeeLayout>
            <Head title="دفع حصتك" />

            <Screen>
                <div>
                    <h1 className="text-lg font-black text-[#0A0A0A]">دفع حصتك</h1>
                    <p className="text-[11px] text-[#0A0A0A]/55 mt-0.5">حصتك النهائية — لن تزيد أبداً ولن تُحصَّل مرتين.</p>
                </div>

                {/* The claim itself: ink panel while it is payable, plain card otherwise. */}
                {payable ? (
                    <HeroCard>
                        <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#C8FF00]">
                                <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#C8FF00] animate-pulse" />
                                {status.label}
                            </span>
                            {remaining && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-white/10 px-2.5 py-1 rounded-full tabular-nums">
                                    {remaining.text} متبقية
                                </span>
                            )}
                        </div>

                        {intent.event && (
                            <div>
                                <h2 className="text-[16px] font-black text-white leading-snug">
                                    {intent.event.title || intent.event.community?.name || `فعالية #${intent.event_id}`}
                                </h2>
                                <div className="text-[11px] text-white/60 mt-0.5">
                                    {fmtDate(intent.event.event_date)} · {fmtTime(intent.event.start_time)}
                                </div>
                            </div>
                        )}

                        <div className="text-center py-1">
                            <div className="text-3xl font-black text-[#C8FF00] font-mono">
                                {Number(intent.amount).toLocaleString()}
                            </div>
                            <div className="text-[11px] text-white/50">ريال</div>
                        </div>

                        <p className="text-[11px] text-white/60 bg-white/5 rounded-xl p-2.5 leading-relaxed">
                            مقعدك محجوز طوال المهلة — إغلاق الصفحة لا يلغي شيئاً وتستأنف من نفس الرابط.
                        </p>

                        <button
                            type="button"
                            onClick={handlePay}
                            className="w-full h-11 rounded-full bg-[#C8FF00] text-[#0A0A0A] text-sm font-black hover:bg-[#bcf200] transition-colors cursor-pointer"
                        >
                            ادفع الآن ({Number(intent.amount).toLocaleString()} ر.س)
                        </button>

                        <div className="flex flex-wrap gap-1.5 justify-center">
                            {methods.map((method) => (
                                <span key={method} className="text-[10px] text-white/60 bg-white/10 px-2.5 py-1 rounded-full">
                                    {METHOD_LABELS[method] ?? method}
                                </span>
                            ))}
                        </div>

                        <p className="text-[10px] text-white/45 text-center">
                            لا تقسيط · لا رسوم إضافية عليك · الاسترداد (إن استُحق) يعود لوسيلة الدفع الأصلية
                        </p>
                    </HeroCard>
                ) : (
                    <Card>
                        <div className="flex items-center justify-between gap-2">
                            <Pill tone={status.tone}>{status.label}</Pill>
                            <span className="font-mono font-black text-lg text-[#0A0A0A]">
                                {Number(intent.amount).toLocaleString()} ر.س
                            </span>
                        </div>
                        {intent.event && (
                            <div className="text-[11px] text-[#0A0A0A]/55">
                                {intent.event.title || intent.event.community?.name || `فعالية #${intent.event_id}`}
                                {' · '}
                                {fmtDate(intent.event.event_date)}
                            </div>
                        )}
                    </Card>
                )}

                {/* H §12.2 — the breakdown stays visible whatever the state. */}
                <Card>
                    <h2 className="text-xs font-black text-[#0A0A0A]">تفصيل المبلغ</h2>
                    <InsetRow>
                        <span className="text-[11px] text-[#0A0A0A]/70">الأساس</span>
                        <span className="font-mono font-bold text-[#0A0A0A]">{Number(intent.base_amount).toLocaleString()} ر.س</span>
                    </InsetRow>
                    <InsetRow>
                        <span className="text-[11px] text-[#0A0A0A]/70">ضريبة القيمة المضافة (15%)</span>
                        <span className="font-mono font-bold text-[#0A0A0A]">{Number(intent.vat_amount).toLocaleString()} ر.س</span>
                    </InsetRow>
                    <InsetRow>
                        <span className="text-[11px] text-[#0A0A0A]/70">يظهر في كشف حسابك باسم</span>
                        <span className="font-bold text-[#0A0A0A]">{statementDescriptor}</span>
                    </InsetRow>
                </Card>

                {intent.status === 'expired' && (
                    <div className="p-3.5 rounded-2xl bg-[#FDEDEC] border-[0.5px] border-[#D9381E]/25 text-[11px] text-[#D9381E] leading-relaxed">
                        انقضت مهلة الدفع وعُرض مقعدك على قائمة الانتظار. راجع قائد المجتمع — إن بقي مقعد شاغر ولم يُمنح لغيرك يمكن معالجتها.
                    </div>
                )}

                {intent.status === 'paid' && (
                    <div className="p-3.5 rounded-2xl bg-[#E8F5E9] border-[0.5px] border-[#2E7D32]/25 text-[11px] text-[#2E7D32] leading-relaxed">
                        دُفعت حصتك ومقعدك مؤكد — لن يُطلب منك مبلغ إضافي بعد الدفع مهما تغيّرت الظروف.
                    </div>
                )}

                {intent.status === 'refunded' && (
                    <div className="p-3.5 rounded-2xl bg-[#F6F8F5] border-[0.5px] border-[#0A0A0A]/10 text-[11px] text-[#0A0A0A]/70 leading-relaxed">
                        رُدّ المبلغ كاملاً إلى وسيلة الدفع الأصلية تلقائياً — لا حاجة لأي إجراء منك.
                    </div>
                )}

                <a href="/employee/payments" className="block text-center text-[11px] font-bold text-[#0A0A0A] hover:underline">
                    سجل مدفوعاتي
                </a>
            </Screen>
        </EmployeeLayout>
    );
}
