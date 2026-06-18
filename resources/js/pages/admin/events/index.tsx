import AdminLayout from '@/layouts/admin-layout';
import FilterTabs from '@/components/filter-tabs';
import CategoryIcon from '@/components/category-icon';
import StatusBadge from '@/components/status-badge';
import Pagination from '@/components/pagination';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event, PaginatedResult } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';

interface Props {
    events: PaginatedResult<Event>;
    totalEvents: number;
    filters: { status?: string; search?: string };
}

const filterOptions = [
    { label: 'الكل', value: '' },
    { label: 'مفتوحة', value: 'open' },
    { label: 'مؤكدة', value: 'confirmed' },
    { label: 'منتهية', value: 'completed' },
    { label: 'ملغية', value: 'cancelled' },
];

export default function EventsIndex({ events, totalEvents, filters }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', { status: filters?.status });

    return (
        <AdminLayout>
            <Head title="الفعاليات" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div className="page-title">الفعاليات</div>
            </div>
            <div className="page-sub">
                {totalEvents.toLocaleString()} فعالية على المنصة
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث بالمنشأة أو الفئة..."
                    style={{ padding: '9px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 200 }}
                />
                <FilterTabs options={filterOptions} current={filters?.status ?? ''} />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الفعالية</th>
                            <th>الشركة</th>
                            <th>المنشأة</th>
                            <th>التاريخ</th>
                            <th>اللاعبون</th>
                            <th>المبلغ</th>
                            <th>الحالة</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.data.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', color: '#6B7A99', padding: '20px' }}>
                                    لا توجد فعاليات
                                </td>
                            </tr>
                        ) : (
                            events.data.map((event) => (
                                <tr key={event.id}>
                                    <td>
                                        <span style={{ fontWeight: 600, color: '#fff' }}>
                                            <CategoryIcon icon={event.category?.icon} size={14} /> {event.category?.name ?? '-'}
                                        </span>
                                    </td>
                                    <td style={{ color: '#C8D0E0' }}>
                                        {event.company?.name ?? '-'}
                                    </td>
                                    <td style={{ color: '#C8D0E0' }}>{event.business?.name ?? '-'}</td>
                                    <td style={{ fontSize: '12px', color: '#6B7A99' }}>
                                        {fmtDate(event.event_date)} · {fmtTime(event.start_time)}
                                        {event.recurrence_type && event.recurrence_type !== 'none' && (
                                            <span style={{ marginRight: 6, fontSize: 10, background: '#1A5FAB30', color: '#8AB4F8', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                                                {event.recurrence_type === 'daily' ? 'يومي' : event.recurrence_type === 'weekly' ? 'أسبوعي' : 'شهري'}
                                            </span>
                                        )}
                                        {event.parent_event_id && (
                                            <span style={{ marginRight: 4, fontSize: 10, color: '#8AB4F8' }} title="جزء من سلسلة متكررة">🔄</span>
                                        )}
                                    </td>
                                    <td>{event.participants_count}/{event.capacity}</td>
                                    <td style={{
                                        color: event.status === 'completed' ? '#009E82' : '#D4820A',
                                        fontWeight: 700,
                                    }}>
                                        {event.total_amount.toLocaleString()} ر
                                    </td>
                                    <td>
                                        <StatusBadge status={event.status} />
                                    </td>
                                    <td>
                                        <Link
                                            href={`/admin/events/${event.id}`}
                                            className="act-btn btn-view"
                                        >
                                            عرض
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={events.links} />
        </AdminLayout>
    );
}
