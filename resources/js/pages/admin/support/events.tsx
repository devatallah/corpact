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
    Note,
    PageHeader,
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import { eventStatus } from '@/lib/status';
import type { Paginated, SortState } from '@/types';

/**
 * G/«دليل وكيل الدعم» — «قراءة سجل حالات أي فعالية».
 *
 * قائمة قراءة وتوجيه لا تدخّل: لا زر يغيّر حالة هنا، لأن تغيير الحالة يدوياً
 * أول بند في جدول «ما لا تفعله — يُصعَّد فوراً». المدخل إلى سجل الحالات
 * التفصيلي هو رابط الفعالية.
 */
type EventRow = {
    id: number;
    title: string | null;
    status: string;
    event_date: string | null;
    start_time: string | null;
    company: { id: number; name: string } | null;
    partner: { id: number; name: string } | null;
    community: { id: number; name: string } | null;
};

export default function SupportEvents({
    events,
    filters,
    sort,
}: {
    events: Paginated<EventRow>;
    filters: { search?: string; status?: string };
    sort: SortState;
}) {
    return (
        <AdminLayout>
            <Head title="سجل الفعاليات والحالات" />

            <PageHeader
                icon={CalendarDays}
                title="سجل الفعاليات والحالات"
                subtitle="استعلام وتوجيه. صلاحيتك هنا قراءة فقط — أي تدخل مباشر يُصعَّد للأدمن المختص."
            />

            <Note title="قراءة لا تدخّل">
                تغيير حالة فعالية، أو تعديل حضورها بعد نافذة الـ٢٤ ساعة، أو أي
                تصحيح مالي — كلها خارج صلاحيتك. وثّق البلاغ وصعّده من شاشة
                «توثيق البلاغات والتصعيد».
            </Note>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="رقم الفعالية، عنوانها، أو اسم الشركة…"
                    />
                    <FilterSelect
                        name="status"
                        label="الحالة"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['open', 'مفتوحة للتسجيل'],
                            ['pending_provider', 'بانتظار المزوّد'],
                            ['booked', 'محجوزة'],
                            ['awaiting_payment', 'بانتظار التحصيل'],
                            ['confirmed', 'مؤكدة'],
                            ['in_progress', 'جارية'],
                            ['completed', 'مكتملة'],
                            ['settled', 'مسوّاة'],
                            ['cancelled_provider', 'ملغاة من المزوّد'],
                            ['cancelled_company', 'ملغاة من الشركة'],
                            ['cancelled_min_not_met', 'ملغاة — لم يكتمل الحد'],
                            ['cancelled_payment_failed', 'ملغاة — فشل التحصيل'],
                            ['expired', 'منتهية المهلة'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>الفعالية</Th>
                        <Th>الشركة والمزوّد</Th>
                        <Th>
                            <SortableHeader
                                label="الموعد"
                                sortKey="event_date"
                                sort={sort}
                                initialDirection="desc"
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الحالة"
                                sortKey="status"
                                sort={sort}
                            />
                        </Th>
                        <Th className="text-center">السجل</Th>
                    </Thead>

                    <Tbody>
                        {events.data.map((event) => (
                            <Tr key={event.id}>
                                <Td>
                                    <span className="block font-extrabold text-ink">
                                        {event.title ?? `فعالية #${event.id}`}
                                    </span>
                                    <span className="block font-mono text-[11px] text-ink/45">
                                        #{event.id} ·{' '}
                                        {event.community?.name ?? '—'}
                                    </span>
                                </Td>
                                <Td>
                                    <span className="block text-ink/85">
                                        {event.company?.name ?? '—'}
                                    </span>
                                    <span className="block text-[11px] text-ink/50">
                                        {event.partner?.name ?? 'بلا مزوّد'}
                                    </span>
                                </Td>
                                <Td className="font-mono text-[11px] whitespace-nowrap text-ink/75">
                                    {event.event_date?.slice(0, 10) ?? '—'}
                                    <span className="block text-ink/45">
                                        {event.start_time?.slice(0, 5) ?? ''}
                                    </span>
                                </Td>
                                <Td>
                                    <Badge
                                        tone={eventStatus(event.status).tone}
                                    >
                                        {eventStatus(event.status).label}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    <Link
                                        href={`/admin/support-console/events/${event.id}`}
                                        className="text-xs font-bold text-ink underline-offset-4 hover:underline"
                                    >
                                        سجل الحالات ←
                                    </Link>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={events.data.length}
                            colSpan={5}
                            empty="لا فعاليات مطابقة."
                            emptyHint="جرّب رقم الفعالية أو اسم الشركة كما ورد في البلاغ."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={events} />
                    <Pagination page={events} />
                </div>
            </Card>
        </AdminLayout>
    );
}
