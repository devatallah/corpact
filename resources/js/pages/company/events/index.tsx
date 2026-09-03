import { Head, Link, router } from '@inertiajs/react';
import { Ban, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import {
    FilterSelect,
    Pagination,
    ResultCount,
    SearchInput,
    SortableHeader,
    Toolbar,
} from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Card, IconButton, Money, Note, PageHeader, StatCard, TableShell, Tbody, Td, Th, Thead, Tr } from '@/components/portal/ui';
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

/** الإلغاء مشروع بعد قبول المزوّد فقط — قبله تنتهي الفعالية بآلة الحالات وحدها (H §9). */
const CANCELLABLE = ['booked', 'awaiting_payment', 'confirmed'];

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
    const [cancelling, setCancelling] = useState<EventRow | null>(null);
    const [cancelSeries, setCancelSeries] = useState(false);
    const [reason, setReason] = useState('');

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
                title="سجل فعاليات مجتمعات المنشأة"
                badge={`${events.total} فعالية`}
                subtitle="متابعة الحجوزات، واكتمال النصاب، والتدخل الاستثنائي لإلغاء الفعاليات عند الضرورة."
            />

            <Note tone="info" title="الحوكمة المركزية">
                القوالب تولّد فعالياتها آلياً قبل كل موعد بـ14 يوماً. ما تراه هنا يشمل المولَّد آلياً وما أنشأه القادة يدوياً.
            </Note>

            <Note tone="danger" title="ضوابط إلغاء الفعالية من مسؤول الحساب">
                الإلغاء مخصص للظروف الطارئة فقط، ويترتب عليه ثلاثة آثار معاً: استرداد كامل لكل موظف مشارك، وتحمُّل الشركة رسوم
                إلغاء المزوّد إن وُجدت في عقده، وإسقاط عمولة تيمات بالكامل.
            </Note>

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
                        <Th>التكلفة والدعم</Th>
                        <Th>
                            <SortableHeader
                                label="الحالة"
                                sortKey="status"
                                sort={sort}
                            />
                        </Th>
                        <Th className="text-center">إجراءات الحوكمة</Th>
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
                                    <Td className="text-center">
                                        {CANCELLABLE.includes(event.status) ? (
                                            <IconButton
                                                icon={Ban}
                                                label="إلغاء الفعالية"
                                                tone="danger"
                                                onClick={() => {
                                                    setReason('');
                                                    setCancelling(event);
                                                }}
                                            />
                                        ) : (
                                            <span className="text-[10px] text-ink/35">
                                                —
                                            </span>
                                        )}
                                    </Td>
                                </Tr>
                            );
                        })}

                        <ListStates
                            count={events.data.length}
                            colSpan={7}
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
            <ConfirmModal
                open={cancelling !== null}
                tone="danger"
                title="إلغاء الفعالية"
                message="إجراء استثنائي. يُرد لكل مشارك ما دفعه إلى وسيلة دفعه الأصلية، وتُعاد مساهمة المجتمع كاملةً، وتسقط عمولة تيمات. إن نصّ عقد المزوّد على رسوم إلغاء فتتحملها الشركة."
                details={
                    cancelling && (
                        <>
                            <ConfirmRow
                                label="الفعالية"
                                value={cancelling.title || cancelling.category?.name || `#${cancelling.id}`}
                                strong
                            />
                            <ConfirmRow label="المجتمع" value={cancelling.community?.name ?? '—'} />
                            <ConfirmRow label="الموعد" value={`${cancelling.event_date ?? '—'} · ${cancelling.start_time?.slice(0, 5) ?? ''}`} />
                            <ConfirmRow label="المشاركون المتأثرون" value={`${cancelling.participants_count ?? 0} مشاركاً يُردّ لهم`} strong />
                            <ConfirmRow label="المبلغ المرتجع" value={`${cancelling.total_amount ?? '—'} ر.س — استرداد كامل`} strong />

                            <div className="pt-2">
                                <label htmlFor="cancel-reason" className="block text-[11px] font-bold text-ink mb-1">
                                    سبب الإلغاء — يُسجَّل في سجل الحالات
                                </label>
                                <textarea
                                    id="cancel-reason"
                                    rows={2}
                                    value={reason}
                                    onChange={(event) => setReason(event.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                                />

                                <label className="flex items-center gap-2 text-[11px] text-ink/80 mt-2">
                                    <input
                                        type="checkbox"
                                        checked={cancelSeries}
                                        onChange={(event) => setCancelSeries(event.target.checked)}
                                        className="w-3.5 h-3.5 rounded border-ink/25 accent-ink"
                                    />
                                    ألغِ بقية فعاليات السلسلة أيضاً
                                </label>
                            </div>
                        </>
                    )
                }
                confirmLabel="نعم، ألغِ الفعالية"
                onConfirm={() => {
                    router.post(
                        `/company/events/${cancelling?.id}/cancel`,
                        { reason, cancel_series: cancelSeries },
                        { preserveScroll: true },
                    );
                    setCancelling(null);
                    setCancelSeries(false);
                }}
                onCancel={() => setCancelling(null)}
            />
        </CompanyLayout>
    );
}
