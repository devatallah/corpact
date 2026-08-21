import EmployeeLayout from '@/layouts/employee-layout';
import { Head, Link } from '@inertiajs/react';
import { fmtDate } from '@/lib/utils';
import type { PaymentIntent, Event, Community } from '@/types/models';

interface Props {
    intents: (PaymentIntent & { event?: Event & { community?: Community } })[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'بانتظار الدفع', color: '#D97706' },
    paid: { label: 'مدفوعة', color: '#18A86B' },
    expired: { label: 'انتهت المهلة', color: '#EF4444' },
    cancelled: { label: 'أُلغيت', color: '#999' },
    refunded: { label: 'مُردّة', color: '#2563EB' },
};

/**
 * سجل مدفوعات الموظف (A10 — H §12.3): كل مطالبة بحصتها وحالتها — لا محفظة
 * نقدية داخل المنصة، وكل استرداد يعود لوسيلة الدفع الأصلية.
 */
export default function PaymentsIndex({ intents }: Props) {
    return (
        <EmployeeLayout>
            <Head title="مدفوعاتي" />

            <div className="section-head" style={{ marginBottom: 16 }}>
                <div className="section-title">مدفوعاتي</div>
            </div>

            {intents.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#999', fontSize: 14 }}>
                    لا مدفوعات بعد — تصلك مطالبة الدفع عند إغلاق تسجيل فعالية انضممت إليها.
                </div>
            ) : (
                intents.map((intent) => {
                    const status = STATUS_LABELS[intent.status] ?? STATUS_LABELS.pending;

                    return (
                        <Link key={intent.id} href={`/employee/payments/${intent.id}`} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                                        {intent.event?.title || intent.event?.community?.name || `فعالية #${intent.event_id}`}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                                        {intent.event ? fmtDate(intent.event.event_date) : ''}
                                        {intent.refund_status === 'refunded' && ' · رُدّ المبلغ لوسيلة الدفع الأصلية'}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: 16, fontWeight: 800 }}>{Number(intent.amount).toLocaleString()} ر.س</div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: status.color }}>{status.label}</div>
                                </div>
                            </div>
                        </Link>
                    );
                })
            )}
        </EmployeeLayout>
    );
}
