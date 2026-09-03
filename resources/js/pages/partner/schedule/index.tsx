import { Head, router } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Badge,
    Button,
    Card,
    Note,
    PageHeader,
    StatCard,
} from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';
import { eventStatus } from '@/lib/status';

/**
 * H §17 — جدول الأسبوع.
 *
 * This is the read-only view of what is actually booked, one column per day.
 * It is not the availability calendar: this shows the platform's confirmed
 * events, while /partner/availability is where the provider records what they
 * sold elsewhere. Two screens because they answer opposite questions —
 * "what do I have to deliver?" and "what must I stop selling?".
 */
type ScheduleEvent = {
    id: number;
    start_time: string | null;
    duration_minutes: number | null;
    company_name: string | null;
    category_name: string | null;
    category_icon: string | null;
    status: string;
    capacity: number | null;
    participants_count: number | null;
    venue_ids: number[];
};

export default function PartnerSchedule({
    schedule,
    date,
}: {
    partner: { id: number; name: string };
    schedule: {
        venues: { id: number; name: string; category_id: number }[];
        days: { date: string; day_name: string; events: ScheduleEvent[] }[];
        week_start: string;
        week_end: string;
    };
    date: string;
}) {
    const total = schedule.days.reduce(
        (sum, day) => sum + day.events.length,
        0,
    );
    const busiest = schedule.days.reduce(
        (best, day) => (day.events.length > best.events.length ? day : best),
        schedule.days[0] ?? { day_name: '—', events: [] as ScheduleEvent[] },
    );

    const shiftWeek = (deltaDays: number) => {
        const cursor = new Date(`${schedule.week_start}T00:00:00`);
        cursor.setDate(cursor.getDate() + deltaDays);
        router.get(
            '/partner/schedule',
            { date: cursor.toISOString().slice(0, 10) },
            { preserveState: false },
        );
    };

    return (
        <PartnerLayout>
            <Head title="جدول الأسبوع" />

            <PageHeader
                icon={CalendarDays}
                title="جدول الأسبوع"
                subtitle="ما التزمت بتقديمه فعلاً — الفعاليات المؤكدة على مرفقك."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="فعاليات الأسبوع" value={total} />
                <StatCard
                    label="أكثر الأيام ازدحاماً"
                    value={busiest.day_name}
                    hint={`${busiest.events.length} فعالية`}
                />
                <StatCard
                    label="ملاعبك النشطة"
                    value={schedule.venues.length}
                />
            </div>

            <Card
                padding="p-3"
                className="flex items-center justify-between gap-3"
            >
                <Button
                    type="button"
                    tone="soft"
                    icon={ChevronRight}
                    onClick={() => shiftWeek(-7)}
                >
                    الأسبوع السابق
                </Button>

                <span
                    className="font-mono text-xs font-bold text-ink"
                    dir="ltr"
                >
                    {schedule.week_start} — {schedule.week_end}
                </span>

                <Button
                    type="button"
                    tone="soft"
                    icon={ChevronLeft}
                    onClick={() => shiftWeek(7)}
                >
                    الأسبوع التالي
                </Button>
            </Card>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {schedule.days.map((day) => (
                    <Card
                        key={day.date}
                        padding="p-3"
                        className={`space-y-2 ${day.date === date ? 'border-ink/35' : ''}`}
                    >
                        <div className="flex items-baseline justify-between border-b-[0.5px] border-ink/10 pb-2">
                            <span className="text-xs font-extrabold text-ink">
                                {day.day_name}
                            </span>
                            <span className="font-mono text-[10px] text-ink/45">
                                {day.date.slice(5)}
                            </span>
                        </div>

                        {day.events.map((event) => (
                            <div
                                key={event.id}
                                className="space-y-1 rounded-xl border-[0.5px] border-ink/12 bg-page p-2"
                            >
                                <div className="flex items-center justify-between gap-1">
                                    <span
                                        className="font-mono text-[11px] font-black text-ink"
                                        dir="ltr"
                                    >
                                        {event.start_time?.slice(0, 5) ?? '—'}
                                    </span>
                                    <span className="font-mono text-[10px] text-ink/50">
                                        {event.duration_minutes ?? '—'} د
                                    </span>
                                </div>

                                <span className="block truncate text-[11px] font-bold text-ink">
                                    {event.company_name ?? '—'}
                                </span>
                                <span className="block truncate text-[10px] text-ink/55">
                                    {event.category_name ?? '—'}
                                </span>

                                <div className="flex items-center justify-between gap-1">
                                    <Badge
                                        tone={eventStatus(event.status).tone}
                                    >
                                        {eventStatus(event.status).label}
                                    </Badge>
                                    <span className="font-mono text-[10px] text-ink/50">
                                        {event.participants_count ?? 0}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {day.events.length === 0 && (
                            <span className="block py-3 text-center text-[11px] text-ink/35">
                                لا فعاليات
                            </span>
                        )}
                    </Card>
                ))}
            </div>

            <Note title="هذا الجدول ليس تقويم التوفر">
                هنا ما التزمت به عبر المنصة. أما الأوقات التي حجزتها خارجها
                فتُسجَّل في «تقويم التوفر» حتى تختفي من الحجز — وهما شاشتان
                لأنهما سؤالان مختلفان.
            </Note>
        </PartnerLayout>
    );
}
