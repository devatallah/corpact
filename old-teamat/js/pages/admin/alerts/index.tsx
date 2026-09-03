import PageHeader from '@/components/page-header';
import { Head, router } from '@inertiajs/react';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import SortableHeader, { SortBar, type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AdminLayout from '@/layouts/admin-layout';
import { fmtDate } from '@/lib/utils';
import type { AdminAlert, PaginatedResult } from '@/types/models';

interface Props {
    alerts: PaginatedResult<AdminAlert>;
    stats: { open: number; critical: number };
    filters: { acknowledged: boolean; search?: string | null; sort?: string | null; dir?: string | null };
    sort: SortState;
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

export default function AdminAlertsIndex({ alerts, stats, filters, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        acknowledged: filters.acknowledged ? '1' : undefined,
        sort: filters?.sort ?? undefined,
        dir: filters?.dir ?? undefined,
    });

    function toggleView() {
        router.get('/admin/alerts', {
            acknowledged: filters.acknowledged ? undefined : 1,
            search: filters?.search || undefined,
            sort: filters?.sort || undefined,
            dir: filters?.dir || undefined,
        }, { preserveState: true, replace: true });
    }

    function acknowledge(alert: AdminAlert) {
        router.post(`/admin/alerts/${alert.id}/acknowledge`, {}, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="التنبيهات الحرجة" />

            <PageHeader
                title={<>التنبيهات الحرجة</>}
                subtitle={<>
                {stats.open} تنبيهاً مفتوحاً منها {stats.critical} حرج. الصمت ليس دليل نجاح — أقرّ التنبيه بعد معالجته لا
                قبلها.
                </>}
            />

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بعنوان التنبيه أو نصه أو مفتاحه..."
                    style={{ padding: '9px 14px', background: '#FFFFFF', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 10, fontSize: 13, color: '#0A0A0A', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 240 }}
                />
                <button onClick={toggleView} className="act-btn btn-view">
                    {filters.acknowledged ? 'إظهار المفتوحة فقط' : 'إظهار المُقَرّة أيضاً'}
                </button>
                {/* الخطورة تُقرأ من لون العنوان لا من عمود مستقل، فترتيبها هنا. */}
                <SortBar sort={sort} options={[{ key: 'level', label: 'الخطورة', initialDirection: 'asc' }]} />
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <SortableHeader label="التنبيه" sortKey="title" sort={sort} />
                                <th>التفاصيل</th>
                                <SortableHeader label="التكرار" sortKey="occurrences" sort={sort} initialDirection="desc" />
                                <SortableHeader label="آخر ظهور" sortKey="last_seen_at" sort={sort} initialDirection="desc" />
                                <SortableHeader label="الحالة" sortKey="acknowledged_at" sort={sort} initialDirection="desc" />
                                <th>إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ListStates
                                count={alerts.data.length}
                                columns={6}
                                emptyTitle="لا توجد تنبيهات"
                                emptyHint="لا تنبيه مطابق للبحث والفلتر الحالي — وهي الحالة الطبيعية حين لا يوجد ما يستدعي تدخّلاً."
                            />
                            {alerts.data.map((alert) => (
                                <tr key={alert.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: alert.level === 'critical' ? '#D9381E' : '#C87D00' }}>
                                            {alert.title}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'rgba(10,10,10,.55)' }}>{KEY_LABELS[alert.key] ?? alert.key}</div>
                                    </td>
                                    <td style={{ color: '#0A0A0A', fontSize: 13, maxWidth: 380 }}>{alert.body ?? '—'}</td>
                                    <td style={{ fontSize: 13, color: '#0A0A0A' }}>{alert.occurrences}×</td>
                                    <td style={{ fontSize: 12, color: 'rgba(10,10,10,.55)' }}>
                                        {alert.last_seen_at ? fmtDate(alert.last_seen_at) : fmtDate(alert.created_at)}
                                    </td>
                                    <td style={{ fontSize: 12, color: alert.acknowledged_at ? '#2E7D32' : '#D9381E' }}>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={alerts.links} />
        </AdminLayout>
    );
}
