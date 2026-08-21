import { Head, router } from '@inertiajs/react';
import Pagination from '@/components/pagination';
import AdminLayout from '@/layouts/admin-layout';
import { fmtDateTime } from '@/lib/utils';
import type { PaginatedResult } from '@/types/models';

// PaginatedResult carries Laravel's links array for the shared Pagination component.

interface FailedRefundRow {
    id: number;
    event: { id: number; title: string | null; event_date: string } | null;
    community: { id: number; name: string } | null;
    employee: { id: number; name: string } | null;
    amount: string;
    refund_reason: string | null;
    refund_attempts: number;
    refund_last_error: string | null;
    max_auto_retries: number;
    updated_at: string | null;
}

interface ExpiredIntentRow {
    id: number;
    event: { id: number; title: string | null; event_date: string } | null;
    employee: { id: number; name: string } | null;
    amount: string;
    expires_at: string | null;
}

interface FailedWebhookRow {
    id: number;
    gateway: string;
    event_type: string | null;
    gateway_reference: string | null;
    error: string | null;
    created_at: string;
}

interface Props {
    failedRefunds: PaginatedResult<FailedRefundRow>;
    expiredIntents: ExpiredIntentRow[];
    failedWebhooks: FailedWebhookRow[];
}

/**
 * قائمة فشل المدفوعات والاستردادات — مسؤولية الأدمن المالي اليومية
 * (A10 — H §12.4): إعادة المحاولة آلية، ولا يُترك فشل بلا معالجة.
 */
export default function PaymentFailures({ failedRefunds, expiredIntents, failedWebhooks }: Props) {
    function retry(id: number) {
        router.post(`/admin/payments/refunds/${id}/retry`);
    }

    return (
        <AdminLayout>
            <Head title="فشل المدفوعات والاستردادات" />

            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>قائمة فشل المدفوعات والاستردادات</h1>
                <p style={{ fontSize: 13, color: '#7A8BA8', marginTop: 6 }}>
                    كل استرداد يعود إلى وسيلة الدفع الأصلية عبر البوابة. إعادة المحاولة آلية كل 15 دقيقة —
                    وما استنفد محاولاته يبقى هنا حتى تعالجه يدوياً. لا يُترك فشل صامتاً (H §12.4).
                </p>
            </div>

            {/* الاستردادات الفاشلة */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>استردادات فاشلة ({failedRefunds.total})</div>
                {failedRefunds.data.length === 0 ? (
                    <div style={{ fontSize: 13, color: '#7A8BA8', textAlign: 'center', padding: 20 }}>لا استردادات فاشلة — القائمة نظيفة.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ textAlign: 'right', color: '#7A8BA8' }}>
                                    <th style={{ padding: 8 }}>الفعالية</th>
                                    <th style={{ padding: 8 }}>الموظف</th>
                                    <th style={{ padding: 8 }}>المبلغ</th>
                                    <th style={{ padding: 8 }}>السبب</th>
                                    <th style={{ padding: 8 }}>المحاولات</th>
                                    <th style={{ padding: 8 }}>آخر خطأ</th>
                                    <th style={{ padding: 8 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {failedRefunds.data.map((row) => (
                                    <tr key={row.id} style={{ borderTop: '1px solid #E4E9F2' }}>
                                        <td style={{ padding: 8 }}>
                                            {row.event ? `#${row.event.id} ${row.event.title ?? ''}` : '—'}
                                            {row.community && <div style={{ fontSize: 11, color: '#7A8BA8' }}>{row.community.name}</div>}
                                        </td>
                                        <td style={{ padding: 8 }}>{row.employee?.name ?? '—'}</td>
                                        <td style={{ padding: 8, fontWeight: 700 }}>{Number(row.amount).toLocaleString()} ر.س</td>
                                        <td style={{ padding: 8, maxWidth: 220 }}>{row.refund_reason ?? '—'}</td>
                                        <td style={{ padding: 8 }}>
                                            {row.refund_attempts} / {row.max_auto_retries}
                                            {row.refund_attempts >= row.max_auto_retries && (
                                                <span style={{ display: 'inline-block', marginRight: 6, fontSize: 11, color: '#E03050', fontWeight: 700 }}>يدوي</span>
                                            )}
                                        </td>
                                        <td style={{ padding: 8, maxWidth: 220, color: '#E03050', fontSize: 12 }}>{row.refund_last_error ?? '—'}</td>
                                        <td style={{ padding: 8 }}>
                                            <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => retry(row.id)}>
                                                أعد المحاولة
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination links={failedRefunds.links} />
            </div>

            {/* مطالبات انقضت دون سداد */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>مطالبات انقضت مهلتها دون سداد (آخر 50)</div>
                {expiredIntents.length === 0 ? (
                    <div style={{ fontSize: 13, color: '#7A8BA8', textAlign: 'center', padding: 20 }}>لا شيء.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ textAlign: 'right', color: '#7A8BA8' }}>
                                    <th style={{ padding: 8 }}>الفعالية</th>
                                    <th style={{ padding: 8 }}>الموظف</th>
                                    <th style={{ padding: 8 }}>المبلغ</th>
                                    <th style={{ padding: 8 }}>انقضت في</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expiredIntents.map((row) => (
                                    <tr key={row.id} style={{ borderTop: '1px solid #E4E9F2' }}>
                                        <td style={{ padding: 8 }}>{row.event ? `#${row.event.id} ${row.event.title ?? ''}` : '—'}</td>
                                        <td style={{ padding: 8 }}>{row.employee?.name ?? '—'}</td>
                                        <td style={{ padding: 8 }}>{Number(row.amount).toLocaleString()} ر.س</td>
                                        <td style={{ padding: 8 }}>{fmtDateTime(row.expires_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ويبهوكات فشلت معالجتها */}
            <div className="card">
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>ويبهوكات فشلت معالجتها (آخر 50)</div>
                {failedWebhooks.length === 0 ? (
                    <div style={{ fontSize: 13, color: '#7A8BA8', textAlign: 'center', padding: 20 }}>لا شيء.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ textAlign: 'right', color: '#7A8BA8' }}>
                                    <th style={{ padding: 8 }}>#</th>
                                    <th style={{ padding: 8 }}>البوابة</th>
                                    <th style={{ padding: 8 }}>النوع</th>
                                    <th style={{ padding: 8 }}>المرجع</th>
                                    <th style={{ padding: 8 }}>الخطأ</th>
                                    <th style={{ padding: 8 }}>وصل في</th>
                                </tr>
                            </thead>
                            <tbody>
                                {failedWebhooks.map((row) => (
                                    <tr key={row.id} style={{ borderTop: '1px solid #E4E9F2' }}>
                                        <td style={{ padding: 8 }}>{row.id}</td>
                                        <td style={{ padding: 8 }}>{row.gateway}</td>
                                        <td style={{ padding: 8 }}>{row.event_type ?? '—'}</td>
                                        <td style={{ padding: 8, direction: 'ltr', textAlign: 'left', fontSize: 11 }}>{row.gateway_reference ?? '—'}</td>
                                        <td style={{ padding: 8, color: '#E03050', fontSize: 12, maxWidth: 260 }}>{row.error ?? '—'}</td>
                                        <td style={{ padding: 8 }}>{fmtDateTime(row.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
