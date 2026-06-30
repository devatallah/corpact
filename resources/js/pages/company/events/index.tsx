import CompanyLayout from '@/layouts/company-layout';
import FilterTabs from '@/components/filter-tabs';
import Pagination from '@/components/pagination';
import StatusBadge from '@/components/status-badge';
import CategoryIcon from '@/components/category-icon';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event, PaginatedResult } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';

const STATUS_OPTIONS = [
    { label: 'الكل', value: '' },
    { label: 'مفتوحة', value: 'open' },
    { label: 'انتظار مزود الخدمة', value: 'waiting_business' },
    { label: 'مؤكدة', value: 'confirmed' },
    { label: 'وقت بديل', value: 'alternative_proposed' },
    { label: 'منتهية', value: 'completed' },
];

interface Props {
    events: PaginatedResult<Event>;
    filters: { status?: string; search?: string };
    totalEvents: number;
    activeEvents: number;
}

export default function EventsIndex({ events, filters, totalEvents, activeEvents }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', { status: filters?.status });

    return (
        <CompanyLayout>
            <Head title="الفعاليات" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <div className="page-title">الفعاليات</div>
                    <div className="page-sub">{totalEvents} فعاليات — {activeEvents} نشطة</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث بمزود الخدمة أو الفئة..."
                    style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 13, background: '#fff', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 200 }}
                />
                <FilterTabs
                    options={STATUS_OPTIONS}
                    current={filters?.status ?? ''}
                />
            </div>

            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, overflow: 'auto' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>المجتمع</th>
                            <th>مزود الخدمة</th>
                            <th>التاريخ</th>
                            <th>اللاعبون</th>
                            <th>المنشئ</th>
                            <th>الحالة</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>
                                    لا توجد فعاليات بعد
                                </td>
                            </tr>
                        ) : (
                            events.data.map((event) => {
                                const fillPercent = event.capacity > 0
                                    ? Math.round((event.participants_count / event.capacity) * 100)
                                    : 0;
                                const proposedAlts = event.alternatives?.filter((a) => a.status === 'proposed') ?? [];

                                return (
                                    <React.Fragment key={event.id}>
                                        <tr>
                                            <td>
                                                <span style={{ fontWeight: 600 }}>
                                                    <CategoryIcon icon={event.category?.icon} size={14} /> {event.community?.name}
                                                </span>
                                            </td>
                                            <td style={{ color: '#4A5C78' }}>
                                                {event.business?.name ?? '\u2014'}
                                            </td>
                                            <td>
                                                <div style={{ fontSize: 12 }}>
                                                    {fmtDate(event.event_date)}
                                                    {event.recurrence_type && event.recurrence_type !== 'none' && (
                                                        <span style={{ marginRight: 6, fontSize: 10, background: '#1A5FAB18', color: '#1A5FAB', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                                                            {event.recurrence_type === 'daily' ? 'يومي' : event.recurrence_type === 'weekly' ? 'أسبوعي' : 'شهري'}
                                                        </span>
                                                    )}
                                                    {event.parent_event_id && (
                                                        <span style={{ marginRight: 6, fontSize: 10, background: '#1A5FAB10', color: '#1A5FAB', padding: '1px 4px', borderRadius: 4 }} title="جزء من سلسلة متكررة">🔄</span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: 11, color: '#7A8BA8' }}>{fmtTime(event.start_time)}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 700, ...(fillPercent >= 100 ? { color: '#0CA678' } : {}) }}>
                                                    {event.participants_count}/{event.capacity}
                                                </div>
                                                <div className="bar-w" style={{ width: 50, marginTop: 4 }}>
                                                    <div className="bar-f" style={{ width: `${fillPercent}%`, background: '#0CA678' }} />
                                                </div>
                                            </td>
                                            <td style={{ fontSize: 12, color: '#7A8BA8' }}>
                                                {event.creator?.name ?? '\u2014'}
                                            </td>
                                            <td>
                                                <StatusBadge status={event.status} />
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/company/events/${event.id}`}
                                                    style={{ background: '#009E8218', color: '#009E82', border: '1px solid #009E8233', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' }}
                                                >
                                                    عرض
                                                </Link>
                                            </td>
                                        </tr>
                                        {event.status === 'alternative_proposed' && proposedAlts.length > 0 && (
                                            <tr>
                                                <td colSpan={7} style={{ padding: '0 16px 16px', background: '#1A5FAB06' }}>
                                                    {proposedAlts.map((alt) => (
                                                        <div key={alt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: '#fff', border: '1px solid #1A5FAB33', borderRadius: 12, padding: '12px 16px' }}>
                                                            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                                                                <span style={{ fontSize: 12, fontWeight: 700, color: '#1A5FAB' }}>وقت بديل من مزود الخدمة:</span>
                                                                <span style={{ fontSize: 12 }}>📅 {fmtDate(alt.proposed_date)}</span>
                                                                <span style={{ fontSize: 12 }}>🕐 {fmtTime(alt.proposed_start_time)} - {fmtTime(alt.proposed_end_time)}</span>
                                                                {alt.proposed_venues_count && <span style={{ fontSize: 12 }}>🏟️ {alt.proposed_venues_count} مرفق</span>}
                                                                {alt.proposed_amount && <span style={{ fontSize: 12, fontWeight: 700, color: '#1A5FAB' }}>{Number(alt.proposed_amount).toLocaleString()} ريال</span>}
                                                                {alt.notes && <span style={{ fontSize: 11, color: '#7A8BA8' }}>{alt.notes}</span>}
                                                            </div>
                                                            <div style={{ fontSize: 11, color: '#7A8BA8', whiteSpace: 'nowrap' }}>
                                                                بانتظار رد منشئ الفعالية
                                                            </div>
                                                        </div>
                                                    ))}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={events.links} />
        </CompanyLayout>
    );
}
