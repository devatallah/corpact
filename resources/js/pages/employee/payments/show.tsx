import EmployeeLayout from '@/layouts/employee-layout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
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

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'بانتظار الدفع', color: '#D97706', bg: '#FFFBEB' },
    paid: { label: 'مدفوعة', color: '#18A86B', bg: '#ECFDF5' },
    expired: { label: 'انتهت المهلة', color: '#EF4444', bg: '#FEF2F2' },
    cancelled: { label: 'أُلغيت', color: '#999', bg: '#F5F5F5' },
    refunded: { label: 'مُردّة لوسيلة الدفع الأصلية', color: '#2563EB', bg: '#EFF6FF' },
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
        if (!intent.expires_at) return null;
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

            <div className="section-head" style={{ marginBottom: 16 }}>
                <div className="section-title">دفع حصتك</div>
            </div>

            <div className="card" style={{ background: status.bg, borderColor: `${status.color}44`, textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: status.color, fontWeight: 700 }}>{status.label}</div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                {intent.event && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{intent.event.title || intent.event.community?.name || `فعالية #${intent.event_id}`}</div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                            {fmtDate(intent.event.event_date)} · {fmtTime(intent.event.start_time)}
                        </div>
                    </div>
                )}

                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ fontSize: 13, color: '#666' }}>حصتك النهائية — لن تزيد أبداً ولن تُحصَّل مرتين</div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#18A86B', margin: '6px 0' }}>
                        {Number(intent.amount).toLocaleString()} <span style={{ fontSize: 18 }}>ريال</span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', padding: '6px 0', borderTop: '1px dashed #EEE' }}>
                    <span>الأساس</span><span>{Number(intent.base_amount).toLocaleString()} ريال</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', padding: '6px 0', borderTop: '1px dashed #EEE' }}>
                    <span>ضريبة القيمة المضافة (15%)</span><span>{Number(intent.vat_amount).toLocaleString()} ريال</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', padding: '6px 0', borderTop: '1px dashed #EEE' }}>
                    <span>يظهر في كشف حسابك باسم</span><span style={{ fontWeight: 700 }}>{statementDescriptor}</span>
                </div>
            </div>

            {payable && remaining && (
                <div className="card" style={{ background: '#FFFBEB', borderColor: '#F59E0B66', textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#92400E' }}>الوقت المتبقي على مهلة الدفع</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#D97706', fontVariantNumeric: 'tabular-nums' }}>{remaining.text}</div>
                    <div style={{ fontSize: 12, color: '#B45309', marginTop: 4 }}>
                        مقعدك محجوز طوال المهلة — إغلاق الصفحة لا يلغي شيئاً وتستأنف من نفس الرابط
                    </div>
                </div>
            )}

            {payable && (
                <>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                        {methods.map((method) => (
                            <span key={method} className="card" style={{ padding: '6px 14px', marginBottom: 0, fontSize: 12, color: '#666' }}>
                                {METHOD_LABELS[method] ?? method}
                            </span>
                        ))}
                    </div>
                    <button onClick={handlePay} className="btn btn-primary btn-full" style={{ padding: '15px 20px', fontSize: 16 }}>
                        ادفع الآن
                    </button>
                    <div style={{ fontSize: 11, color: '#999', textAlign: 'center', marginTop: 8 }}>
                        لا تقسيط · لا رسوم إضافية عليك · الاسترداد (إن استُحق) يعود لوسيلة الدفع الأصلية
                    </div>
                </>
            )}

            {intent.status === 'expired' && (
                <div className="card" style={{ background: '#FEF2F2', borderColor: '#FECACA', fontSize: 13, color: '#B91C1C', textAlign: 'center' }}>
                    انقضت مهلة الدفع وعُرض مقعدك على قائمة الانتظار. راجع قائد المجتمع — إن بقي مقعد شاغر ولم يُمنح لغيرك يمكن معالجتها.
                </div>
            )}

            {intent.status === 'paid' && (
                <div className="card" style={{ background: '#ECFDF5', borderColor: '#18A86B44', fontSize: 13, color: '#0E7C4A', textAlign: 'center' }}>
                    دُفعت حصتك ومقعدك مؤكد — لن يُطلب منك مبلغ إضافي بعد الدفع مهما تغيّرت الظروف.
                </div>
            )}

            {intent.status === 'refunded' && (
                <div className="card" style={{ background: '#EFF6FF', borderColor: '#93C5FD', fontSize: 13, color: '#1D4ED8', textAlign: 'center' }}>
                    رُدّ المبلغ كاملاً إلى وسيلة الدفع الأصلية تلقائياً — لا حاجة لأي إجراء منك.
                </div>
            )}

            <a href="/employee/payments" style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#666', marginTop: 16 }}>
                سجل مدفوعاتي
            </a>
        </EmployeeLayout>
    );
}
