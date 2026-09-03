import { Head, Link } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import {
    FilterSelect,
    Pagination,
    ResultCount,
    SearchInput,
    SortableHeader,
    Toolbar,
} from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import {
    Badge,
    Card,
    Money,
    PageHeader,
    StatCard,
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';
import { eventStatus } from '@/lib/status';
import type { Paginated, SortState } from '@/types';

/**
 * H §7 — فعاليات الشركة.
 *
 * The account manager watches events, they don't create them — that is the
 * community leader's job. What matters here is the quorum: an event below its
 * `min_participants` will not hold, and seeing that early is the difference
 * between a nudge and a cancellation.
 */
type EventRow = {
    id: number;
    title: string | null;
    status: string;
    event_date: string | null;
    start_time: string | null;
    capacity: number | null;
    min_participants: number | null;
    participants_count: number | null;
    total_amount: string | number | null;
    community?: { id: number; name: string } | null;
    partner?: { id: number; name: string; trade_name?: string | null } | null;
    category?: { id: number; name: string } | null;
};

export default function CompanyEvents({
    events,
    filters,
    sort,
    totalEvents,
    activeEvents,
}: {
    company: { id: number; name: string };
    events: Paginated<EventRow>;
    filters: {
        search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
    sort: SortState;
    totalEvents: number;
    activeEvents: number;
    unreadNotifications: number;
}) {
    const belowQuorum = events.data.filter(
        (event) =>
            ['open', 'booked', 'awaiting_payment'].includes(event.status) &&
            (event.participants_count ?? 0) < (event.min_participants ?? 0),
    ).length;

    return (
        <CompanyLayout>
            <Head title="الفعاليات" />

            <PageHeader
                icon={CalendarDays}
                title="الفعاليات"
                subtitle="فعاليات مجتمعاتك — ينشئها قادة المجتمعات، وتتابعها أنت."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="إجمالي الفعاليات" value={totalEvents} />
                <StatCard
                    label="فعاليات جارية"
                    value={activeEvents}
                    tone="success"
                />
                <StatCard
                    label="دون النصاب"
                    value={belowQuorum}
                    tone={belowQuorum > 0 ? 'warning' : 'success'}
                    hint={
                        belowQuorum > 0
                            ? 'في هذه الصفحة — لن تنعقد بهذا العدد'
                            : 'كلها بلغت نصابها'
                    }
                />
                <StatCard
                    label="المعروض"
                    value={events.data.length}
                    hint={`من ${events.total}`}
                />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث بالمرفق أو الفئة…"
                    />
                    <FilterSelect
                        name="status"
                        label="الحالة"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['pending_approval', 'بانتظار الاعتماد'],
                            ['open', 'التسجيل مفتوح'],
                            ['booked', 'محجوزة'],
                            ['awaiting_payment', 'بانتظار السداد'],
                            ['confirmed', 'مؤكدة'],
                            ['completed', 'مكتملة'],
                            ['cancelled_company', 'ألغتها الشركة'],
                            ['cancelled_provider', 'ألغاها المزوّد'],
                            ['expired', 'انتهت'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>الفعالية</Th>
                        <Th>المجتمع</Th>
                        <Th>
                            <SortableHeader
                                label="الموعد"
                                sortKey="event_date"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="المشاركون"
                                sortKey="participants_count"
                                sort={sort}
                            />
                        </Th>
                        <Th>التكلفة</Th>
                        <Th>
                            <SortableHeader
                                label="الحالة"
                                sortKey="status"
                                sort={sort}
                            />
                        </Th>
                    </Thead>

                    <Tbody>
                        {events.data.map((event) => {
                            const short =
                                (event.participants_count ?? 0) <
                                (event.min_participants ?? 0);
                            const live = [
                                'open',
                                'booked',
                                'awaiting_payment',
                            ].includes(event.status);

                            return (
                                <Tr key={event.id}>
                                    <Td>
                                        <Link
                                            href={`/company/events/${event.id}`}
                                            className="font-extrabold text-ink hover:underline"
                                        >
                                            {event.title ||
                                                event.category?.name ||
                                                `فعالية #${event.id}`}
                                        </Link>
                                        <span className="block text-[11px] text-ink/50">
                                            {event.partner?.trade_name ||
                                                event.partner?.name ||
                                                '—'}
                                        </span>
                                    </Td>
                                    <Td className="text-ink/85">
                                        {event.community?.name ?? '—'}
                                    </Td>
                                    <Td className="font-mono text-[11px] whitespace-nowrap text-ink/70">
                                        {event.event_date ?? '—'}
                                        <span className="block text-ink/45">
                                            {event.start_time?.slice(0, 5) ??
                                                ''}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span
                                            className={`font-mono font-bold ${short && live ? 'text-warning' : 'text-ink'}`}
                                        >
                                            {event.participants_count ?? 0}
                                        </span>
                                        <span className="font-mono text-[11px] text-ink/50">
                                            {' '}
                                            / {event.capacity ?? '—'}
                                        </span>
                                        {short && live && (
                                            <span className="block text-[10px] font-bold text-warning">
                                                النصاب {event.min_participants}{' '}
                                                — ناقص{' '}
                                                {(event.min_participants ?? 0) -
                                                    (event.participants_count ??
                                                        0)}
                                            </span>
                                        )}
                                    </Td>
                                    <Td>
                                        <Money amount={event.total_amount} />
                                    </Td>
                                    <Td>
                                        <Badge
                                            tone={
                                                eventStatus(event.status).tone
                                            }
                                        >
                                            {eventStatus(event.status).label}
                                        </Badge>
                                    </Td>
                                </Tr>
                            );
                        })}

                        <ListStates
                            count={events.data.length}
                            colSpan={6}
                            empty="لا فعاليات مطابقة."
                            emptyHint="الفعاليات ينشئها قادة المجتمعات — تأكد أن لكل مجتمع قائداً ورصيداً."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={events} />
                    <Pagination page={events} />
                </div>
            </Card>
        </CompanyLayout>
    );
}
