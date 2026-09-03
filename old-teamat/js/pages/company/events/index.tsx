import PageHeader from '@/components/page-header';
import CompanyLayout from '@/layouts/company-layout';
import FilterTabs from '@/components/filter-tabs';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import StatusBadge from '@/components/status-badge';
import CategoryIcon from '@/components/category-icon';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event, PaginatedResult } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';

// آلة حالات H §9 (A7)
const STATUS_OPTIONS = [
    { label: 'الكل', value: '' },
    { label: 'بانتظار الاعتماد', value: 'pending_approval' },
    { label: 'مفتوحة', value: 'open' },
    { label: 'بانتظار المزوّد', value: 'pending_provider' },
    { label: 'وقت بديل', value: 'provider_alternative' },
    { label: 'محجوزة', value: 'booked' },
    { label: 'بانتظار الدفع', value: 'awaiting_payment' },
    { label: 'مؤكدة', value: 'confirmed' },
    { label: 'جارية', value: 'in_progress' },
    { label: 'منتهية', value: 'completed' },
    { label: 'مسوّاة', value: 'settled' },
    { label: 'منتهية دون اكتمال', value: 'expired' },
    { label: 'ملغاة — الحد الأدنى', value: 'cancelled_min_not_met' },
    { label: 'ملغاة من المزوّد', value: 'cancelled_provider' },
    { label: 'ملغاة من الشركة', value: 'cancelled_company' },
    { label: 'ملغاة — فشل التحصيل', value: 'cancelled_payment_failed' },
];

interface Props {
    events: PaginatedResult<Event>;
    filters: { status?: string; search?: string; sort?: string; dir?: string };
    totalEvents: number;
    activeEvents: number;
    sort: SortState;
}

export default function EventsIndex({ events, filters, totalEvents, activeEvents, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        status: filters?.status,
        sort: filters?.sort,
        dir: filters?.dir,
    });

    return (
        <CompanyLayout>
            <Head title="الفعاليات" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <PageHeader title={<>الفعاليات</>} subtitle={<>{totalEvents} فعاليات — {activeEvents} نشطة</>} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالشريك أو الفئة..."
                    style={{ padding: '9px 14px', borderRadius: 10, border: '0.5px solid rgba(10,10,10,.1)', fontSize: 13, background: '#fff', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 200 }}
                />
                <FilterTabs
                    options={STATUS_OPTIONS}
                    current={filters?.status ?? ''}
                />
            </div>

            <div style={{ background: '#fff', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 16, overflow: 'auto' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>المجتمع</th>
                            <th>الشريك</th>
                            <SortableHeader label="التاريخ" sortKey="event_date" sort={sort} initialDirection="desc" />
                            <SortableHeader label="اللاعبون" sortKey="participants_count" sort={sort} initialDirection="desc" />
                            <th>المنشئ</th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <ListStates
                            count={events.data.length}
                            columns={7}
                            emptyTitle="لا توجد فعاليات بعد"
                            emptyHint="لا فعالية مطابقة للبحث والفلاتر الحالية."
                        />
                        {events.data.map((event) => {
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
                                        <td style={{ color: 'rgba(10,10,10,.6)' }}>
                                            {event.partner?.name ?? '\u2014'}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 12 }}>
                                                {fmtDate(event.event_date)}
                                                {event.template_id && (
                                                    <span style={{ marginRight: 6, fontSize: 10, background: '#0A0A0A18', color: '#0A0A0A', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }} title="مولّدة من قالب تكرار">
                                                        قالب
                                                    </span>
                                                )}
                                                {event.parent_event_id && (
                                                    <span style={{ marginRight: 6, fontSize: 10, background: '#0A0A0A10', color: '#0A0A0A', padding: '1px 4px', borderRadius: 4 }} title="جزء من سلسلة متكررة">🔄</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)' }}>{fmtTime(event.start_time)}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 700, ...(fillPercent >= 100 ? { color: '#2E7D32' } : {}) }}>
                                                {event.participants_count}/{event.capacity}
                                            </div>
                                            <div className="bar-w" style={{ width: 50, marginTop: 4 }}>
                                                <div className="bar-f" style={{ width: `${fillPercent}%`, background: '#2E7D32' }} />
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 12, color: 'rgba(10,10,10,.55)' }}>
                                            {event.creator?.name ?? '\u2014'}
                                        </td>
                                        <td>
                                            <StatusBadge status={event.status} />
                                        </td>
                                        <td>
                                            <Link
                                                href={`/company/events/${event.id}`}
                                                style={{ background: '#2E7D3218', color: '#2E7D32', border: '1px solid #2E7D3233', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' }}
                                            >
                                                عرض
                                            </Link>
                                        </td>
                                    </tr>
                                    {event.status === 'provider_alternative' && proposedAlts.length > 0 && (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '0 16px 16px', background: '#0A0A0A06' }}>
                                                {proposedAlts.map((alt) => (
                                                    <div key={alt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: '#fff', border: '1px solid #0A0A0A33', borderRadius: 12, padding: '12px 16px' }}>
                                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#0A0A0A' }}>وقت بديل من الشريك:</span>
                                                            <span style={{ fontSize: 12 }}>📅 {fmtDate(alt.proposed_date)}</span>
                                                            <span style={{ fontSize: 12 }}>🕐 {fmtTime(alt.proposed_start_time)} - {fmtTime(alt.proposed_end_time)}</span>
                                                            {alt.proposed_venues_count && <span style={{ fontSize: 12 }}>🏟️ {alt.proposed_venues_count} مرفق</span>}
                                                            {alt.proposed_amount && <span style={{ fontSize: 12, fontWeight: 700, color: '#0A0A0A' }}>{Number(alt.proposed_amount).toLocaleString()} ريال</span>}
                                                            {alt.notes && <span style={{ fontSize: 11, color: 'rgba(10,10,10,.55)' }}>{alt.notes}</span>}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', whiteSpace: 'nowrap' }}>
                                                            بانتظار رد منشئ الفعالية
                                                        </div>
                                                    </div>
                                                ))}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination links={events.links} />
        </CompanyLayout>
    );
}
