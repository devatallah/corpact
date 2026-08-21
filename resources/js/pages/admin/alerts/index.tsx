import { Head, router } from '@inertiajs/react';
import Pagination from '@/components/pagination';
import AdminLayout from '@/layouts/admin-layout';
import { fmtDate } from '@/lib/utils';
import type { AdminAlert, PaginatedResult } from '@/types/models';

interface Props {
    alerts: PaginatedResult<AdminAlert>;
    stats: { open: number; critical: number };
    filters: { acknowledged: boolean };
}

const KEY_LABELS: Record<string, string> = {
    'payments.webhook_failed': 'فشل ويبهوك دفع',
    'payments.refund_failed': 'فشل استرداد',
    'wallet.negative_balance': 'رصيد محفظة سالب',
    'wallet.reconciliation_mismatch': 'عدم تطابق الرصيد مع الدفتر',
    'jobs.watchdog': 'مهمة مجدولة لم تُنفَّذ',
    'jobs.exhausted': 'مهمة استنفدت محاولاتها',
    'notification.delivery_failed': 'فشل تسليم رسالة على كل القنوات',
};

export default function AdminAlertsIndex({ alerts, stats, filters }: Props) {
    function toggleView() {
        router.get('/admin/alerts', { acknowledged: filters.acknowledged ? undefined : 1 }, { preserveState: true, replace: true });
    }

    function acknowledge(alert: AdminAlert) {
        router.post(`/admin/alerts/${alert.id}/acknowledge`, {}, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="التنبيهات الحرجة" />

            <div style={{ marginBottom: 4 }}>
                <div className="page-title">التنبيهات الحرجة</div>
            </div>
            <div className="page-sub">
                {stats.open} تنبيهاً مفتوحاً منها {stats.critical} حرج. الصمت ليس دليل نجاح — أقرّ التنبيه بعد معالجته لا
                قبلها.
            </div>

            <div style={{ marginBottom: 16 }}>
                <button onClick={toggleView} className="act-btn btn-view">
                    {filters.acknowledged ? 'إظهار المفتوحة فقط' : 'إظهار المُقَرّة أيضاً'}
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>التنبيه</th>
                                <th>التفاصيل</th>
                                <th>التكرار</th>
                                <th>آخر ظهور</th>
                                <th>الحالة</th>
                                <th>إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', color: '#6B7A99', padding: 20 }}>
                                        لا توجد تنبيهات
                                    </td>
                                </tr>
                            ) : (
                                alerts.data.map((alert) => (
                                    <tr key={alert.id}>
                                        <td>
                                            <div style={{ fontWeight: 700, color: alert.level === 'critical' ? '#E03050' : '#E0B040' }}>
                                                {alert.title}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#6B7A99' }}>{KEY_LABELS[alert.key] ?? alert.key}</div>
                                        </td>
                                        <td style={{ color: '#C8D0E0', fontSize: 13, maxWidth: 380 }}>{alert.body ?? '—'}</td>
                                        <td style={{ fontSize: 13, color: '#C8D0E0' }}>{alert.occurrences}×</td>
                                        <td style={{ fontSize: 12, color: '#6B7A99' }}>
                                            {alert.last_seen_at ? fmtDate(alert.last_seen_at) : fmtDate(alert.created_at)}
                                        </td>
                                        <td style={{ fontSize: 12, color: alert.acknowledged_at ? '#009E82' : '#E03050' }}>
                                            {alert.acknowledged_at
                                                ? `أُقر — ${alert.acknowledged_by?.name ?? 'أدمن'}`
                                                : 'مفتوح'}
                                        </td>
                                        <td>
                                            {!alert.acknowledged_at && (
                                                <button onClick={() => acknowledge(alert)} className="act-btn btn-approve">
                                                    إقرار
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={alerts.links} />
        </AdminLayout>
    );
}
