import { Head, Link } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar, visitWith } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Card, Money, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import { eventStatus } from '@/lib/status';
import type { Paginated, SortState } from '@/types';

/**
 * H §16 — الفعاليات عبر المنصة.
 *
 * Teamat watches events rather than runs them: the state machine drives the
 * lifecycle, and this list is where an operator finds the one event a company
 * is calling about. Intervention lives on the detail screen, behind a reason.
 */
type EventRow = {
    id: number;
    title: string;
    event_date: string | null;
    start_time: string | null;
    status: string;
    capacity: number | null;
    participants_count: number | null;
    min_participants: number | null;
    total_amount: string | number | null;
    company?: { id: number; name: string } | null;
    community?: { id: number; name: string } | null;
    partner?: { id: number; name: string } | null;
    category?: { id: number; name: string } | null;
};

/**
 * The statuses an admin may filter by, in lifecycle order. The *labels* come
 * from `eventStatus()` so this list can never drift from the rest of the app —
 * it decides which states are worth filtering, not what they are called.
 */
export const EVENT_FILTER_STATUSES = [
    'pending_approval',
    'open',
    'booked',
    'awaiting_payment',
    'confirmed',
    'in_progress',
    'completed',
    'settled',
    'cancelled_min_not_met',
    'cancelled_company',
    'cancelled_provider',
    'cancelled_payment_failed',
    'expired',
];
export default function AdminEvents({
    events,
    totalEvents,
    filters,
    sort,
}: {
    events: Paginated<EventRow>;
    totalEvents: number;
    filters: { search?: string; status?: string; date_from?: string; date_to?: string };
    sort: SortState;
}) {
    return (
        <AdminLayout>
            <Head title="الفعاليات" />

            <PageHeader
                icon={Calendar}
                title="مراقبة الفعاليات والتدخل اليدوي"
                badge={`${events.total} فعالية`}
                subtitle="الدورة تلقائية بالكامل. هذه الشاشة للبحث والتشخيص — التدخل اليدوي يتم من صفحة الفعالية وبسبب موثّق."
            />

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="إجمالي الفعاليات" value={totalEvents} />
                <StatCard label="المعروض بعد التصفية" value={events.total} />
                <StatCard
                    label="مكتملة في هذه الصفحة"
                    value={events.data.filter((event) => event.status === 'completed').length}
                    tone="success"
                />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالعنوان أو المزوّد أو النشاط…" />
                    <FilterSelect
                        name="status"
                        label="حالة الفعالية"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ...EVENT_FILTER_STATUSES.map((value): [string, string] => [value, eventStatus(value).label]),
                        ]}
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            aria-label="من تاريخ"
                            value={filters.date_from ?? ''}
                            onChange={(event) => visitWith({ date_from: event.target.value })}
                            className="w-full p-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                        />
                        <input
                            type="date"
                            aria-label="إلى تاريخ"
                            value={filters.date_to ?? ''}
                            onChange={(event) => visitWith({ date_to: event.target.value })}
                            className="w-full p-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                        />
                    </div>
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>الفعالية</Th>
                        <Th>الشركة والمجتمع</Th>
                        <Th>المزوّد</Th>
                        <Th>
                            <SortableHeader label="الموعد" sortKey="event_date" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="المشاركون" sortKey="participants_count" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="القيمة" sortKey="total_amount" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                        </Th>
                    </Thead>

                    <Tbody>
                        {events.data.map((event) => (
                            <Tr key={event.id}>
                                <Td>
                                    <Link
                                        href={`/admin/support-console/events/${event.id}`}
                                        className="font-extrabold text-ink hover:underline"
                                    >
                                        {event.title}
                                    </Link>
                                    <span className="block text-[11px] text-ink/50">{event.category?.name ?? '—'}</span>
                                </Td>
                                <Td>
                                    <span className="text-ink/85 block">{event.company?.name ?? '—'}</span>
                                    <span className="text-[11px] text-ink/50">{event.community?.name ?? '—'}</span>
                                </Td>
                                <Td className="text-ink/85">{event.partner?.name ?? '—'}</Td>
                                <Td>
                                    <span className="font-mono text-[11px] text-ink/80 block">{event.event_date ?? '—'}</span>
                                    <span className="font-mono text-[11px] text-ink/45">{event.start_time ?? ''}</span>
                                </Td>
                                <Td className="font-mono font-bold text-ink">
                                    {event.participants_count ?? 0}
                                    <span className="text-ink/45"> / {event.capacity ?? '—'}</span>
                                </Td>
                                <Td>
                                    <Money amount={event.total_amount} className="text-ink/85" />
                                </Td>
                                <Td>
                                    <Badge tone={eventStatus(event.status).tone}>
                                        {eventStatus(event.status).label}
                                    </Badge>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={events.data.length}
                            colSpan={7}
                            empty="لا توجد فعاليات مطابقة."
                            emptyHint="جرّب توسيع المدة الزمنية أو إزالة فلتر الحالة."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={events} />
                    <Pagination page={events} />
                </div>
            </Card>
        </AdminLayout>
    );
}
