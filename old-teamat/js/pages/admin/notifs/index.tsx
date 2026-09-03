import PageHeader from '@/components/page-header';
import AdminLayout from '@/layouts/admin-layout';
import FilterTabs from '@/components/filter-tabs';
import Pagination from '@/components/pagination';
import { SortBar, type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { fmtDateTime } from '@/lib/utils';
import type { Notification, PaginatedResult } from '@/types/models';
import { Head, router } from '@inertiajs/react';

interface Props {
    notifications: PaginatedResult<Notification>;
    unreadCount: number;
    filters: { search?: string; state?: string; sort?: string; dir?: string };
    sort: SortState;
}

const typeEmojiMap: Record<string, string> = {
    company_registration: '🏢',
    partner_registration: '🏟️',
    event_created: '📅',
    settlement: '💰',
};

const STATE_FILTERS = [
    { label: 'الكل', value: '' },
    { label: 'غير مقروءة', value: 'unread' },
    { label: 'مقروءة', value: 'read' },
];

// H §18 — «كل قائمة: بحث + فلترة + ترتيب + ترقيم صفحات».
const SORT_OPTIONS = [
    { key: 'created_at', label: 'الوقت', initialDirection: 'desc' as const },
    { key: 'read_at', label: 'القراءة', initialDirection: 'desc' as const },
    { key: 'title', label: 'العنوان' },
    { key: 'type', label: 'النوع' },
];

export default function NotifsIndex({ notifications, unreadCount, filters, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        state: filters?.state,
        sort: filters?.sort,
        dir: filters?.dir,
    });

    return (
        <AdminLayout>
            <Head title="الإشعارات" />

            <PageHeader title={<>الإشعارات</>} subtitle={<>{unreadCount} إشعارات تحتاج تدخلاً</>} />

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث في العنوان أو النص..."
                    style={{ padding: '9px 14px', background: '#FFFFFF', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 10, fontSize: 13, color: '#0A0A0A', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 220 }}
                />
                <FilterTabs options={STATE_FILTERS} current={filters?.state ?? ''} paramName="state" />
                <SortBar sort={sort} options={SORT_OPTIONS} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.data.length === 0 ? (
                    <div className="card" style={{ display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '14px', color: 'rgba(10,10,10,.55)' }}>لا إشعار مطابق للبحث والفلاتر الحالية.</div>
                    </div>
                ) : (
                    notifications.data.map((notif) => {
                        const isUnread = !notif.read_at;
                        const emoji = typeEmojiMap[notif.type ?? ''] ?? (isUnread ? '🔔' : '✅');

                        return (
                            <div
                                key={notif.id}
                                className="card"
                                onClick={() => isUnread && router.post(`/admin/notifs/${notif.id}/read`, {}, { preserveScroll: true })}
                                style={{
                                    ...(isUnread ? { borderRight: '4px solid #C87D00' } : {}),
                                    display: 'flex',
                                    gap: '14px',
                                    alignItems: 'flex-start',
                                    ...(!isUnread ? { opacity: 0.6 } : {}),
                                    cursor: isUnread ? 'pointer' : 'default',
                                }}
                            >
                                <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    background: isUnread ? '#C87D0020' : 'rgba(10,10,10,.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '22px',
                                    flexShrink: 0,
                                }}>
                                    {emoji}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>
                                        {notif.title}
                                    </div>
                                    {notif.body && (
                                        <div style={{ fontSize: '12px', color: '#0A0A0A', lineHeight: 1.5 }}>
                                            {notif.body}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '11px', color: 'rgba(10,10,10,.55)', marginTop: '4px' }}>
                                        {fmtDateTime(notif.created_at)}
                                    </div>
                                </div>

                                {isUnread && (
                                    <>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: '#C87D00',
                                            flexShrink: 0,
                                            marginTop: '6px',
                                        }} />
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <Pagination links={notifications.links} />
        </AdminLayout>
    );
}
