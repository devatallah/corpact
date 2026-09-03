import PageHeader from '@/components/page-header';
import AdminLayout from '@/layouts/admin-layout';
import FilterTabs from '@/components/filter-tabs';
import CategoryIcon from '@/components/category-icon';
import StatusBadge from '@/components/status-badge';
import Pagination from '@/components/pagination';
import ListStates from '@/components/list-states';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event, PaginatedResult } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';

interface Props {
    events: PaginatedResult<Event>;
    totalEvents: number;
    filters: { status?: string; search?: string; sort?: string; dir?: string };
    sort: SortState;
}

const filterOptions = [
    { label: 'الكل', value: '' },
    { label: 'مفتوحة', value: 'open' },
    { label: 'مؤكدة', value: 'confirmed' },
    { label: 'مكتملة', value: 'completed' },
    { label: 'ملغية', value: 'cancelled' },
];

export default function EventsIndex({ events, totalEvents, filters, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        status: filters?.status,
        sort: filters?.sort,
        dir: filters?.dir,
    });

    return (
        <AdminLayout>
            <Head title="الفعاليات" />

            <PageHeader
                title={<>الفعاليات</>}
                subtitle={<>
                {totalEvents.toLocaleString()} فعالية على المنصة
                </>}
                actions={<>
                <Link href="/admin/blackouts" className="act-btn" style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, textDecoration: 'none' }}>
                    أيام الحظر (الإجازات ورمضان)
                </Link>
                </>}
            />

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالشريك أو الفئة..."
                    style={{ padding: '9px 14px', background: '#FFFFFF', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 10, fontSize: 13, color: '#0A0A0A', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 200 }}
                />
                <FilterTabs options={filterOptions} current={filters?.status ?? ''} />
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الفعالية</th>
                            <th>الشركة</th>
                            <th>الشريك</th>
                            <SortableHeader label="التاريخ" sortKey="event_date" sort={sort} initialDirection="desc" />
                            <SortableHeader label="اللاعبون" sortKey="participants_count" sort={sort} initialDirection="desc" />
                            <SortableHeader label="المبلغ" sortKey="total_amount" sort={sort} initialDirection="desc" />
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        <ListStates
                            count={events.data.length}
                            columns={8}
                            emptyTitle="لا توجد فعاليات"
                            emptyHint="لا فعالية مطابقة للبحث والفلاتر الحالية."
                        />
                        {events.data.map((event) => (
                            <tr key={event.id}>
                                <td>
                                    <span style={{ fontWeight: 600, color: '#0A0A0A' }}>
                                        <CategoryIcon icon={event.category?.icon} size={14} /> {event.category?.name ?? '-'}
                                    </span>
                                </td>
                                <td style={{ color: '#0A0A0A' }}>
                                    {event.company?.name ?? '-'}
                                </td>
                                <td style={{ color: '#0A0A0A' }}>{event.partner?.name ?? '-'}</td>
                                <td style={{ fontSize: '12px', color: 'rgba(10,10,10,.55)' }}>
                                    {fmtDate(event.event_date)} · {fmtTime(event.start_time)}
                                    {event.template_id && (
                                        <span style={{ marginRight: 6, fontSize: 10, background: 'rgba(10,10,10,.19)', color: '#0A0A0A', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }} title="مولّدة من قالب تكرار">
                                            قالب
                                        </span>
                                    )}
                                    {event.parent_event_id && (
                                        <span style={{ marginRight: 4, fontSize: 10, color: '#0A0A0A' }} title="جزء من سلسلة متكررة">🔄</span>
                                    )}
                                </td>
                                <td>{event.participants_count}/{event.capacity}</td>
                                <td style={{
                                    color: event.status === 'completed' ? '#2E7D32' : '#C87D00',
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
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination links={events.links} />
        </AdminLayout>
    );
}
