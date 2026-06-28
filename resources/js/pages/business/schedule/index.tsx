import BusinessLayout from '@/layouts/business-layout';
import CategoryIcon from '@/components/category-icon';
import StatusBadge from '@/components/status-badge';
import type { Venue } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { Fragment, useState } from 'react';

interface ScheduleEvent {
    id: number;
    start_time: string;
    duration_minutes: number;
    company_name?: string;
    category_name?: string;
    category_icon?: string;
    status: string;
    capacity: number;
    participants_count: number;
    venue_ids: number[];
}

interface DayData {
    date: string;
    day_name: string;
    events: ScheduleEvent[];
}

interface Schedule {
    venues: Venue[];
    days: DayData[];
    week_start: string;
    week_end: string;
}

interface Props {
    schedule: Schedule;
    date: string;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 08:00 - 23:00

function formatHour(h: number): string {
    if (h === 0) return '12 ص';
    if (h < 12) return `${h} ص`;
    if (h === 12) return '12 م';
    return `${h - 12} م`;
}

function parseTime(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h + m / 60;
}

function localDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function toDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function weekOffset(currentWeekStart: string, offset: number): string {
    const d = localDate(currentWeekStart);
    d.setDate(d.getDate() + offset * 7);
    return toDateStr(d);
}

function todayStr(): string {
    return toDateStr(new Date());
}

function isToday(dateStr: string): boolean {
    return dateStr === todayStr();
}

function formatDateShort(dateStr: string): string {
    const d = localDate(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
}

const statusColors: Record<string, string> = {
    open: '#3B5BDB',
    waiting_business: '#B8860A',
    confirmed: '#1A7A4A',
    full: '#6B7A99',
    alternative_proposed: '#C8410A',
    completed: '#2E7D32',
    cancelled: '#9E9E9E',
    rejected: '#D32F2F',
};

export default function businessSchedule({ schedule, date }: Props) {
    const venues = schedule.venues ?? [];
    const days = schedule.days ?? [];
    const weekStart = schedule.week_start;
    const [selectedVenue, setSelectedvenue] = useState<number | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

    const filteredvenues = selectedVenue
        ? venues.filter((c) => c.id === selectedVenue)
        : venues;

    return (
        <BusinessLayout>
            <Head title="التقويم" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <div className="page-title">تقويم الحجوزات</div>
                    <div className="page-sub">
                        {schedule.week_start} — {schedule.week_end}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                        href={`/business/schedule?date=${weekOffset(weekStart, -1)}`}
                        style={{ padding: '8px 16px', borderRadius: 10, background: '#fff', border: '1px solid #EAE4DC', color: '#1C1410', fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: 'inherit' }}
                    >
                        ← الأسبوع السابق
                    </Link>
                    <Link
                        href={`/business/schedule?date=${todayStr()}`}
                        style={{ padding: '8px 16px', borderRadius: 10, background: '#C8410A', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: 'inherit' }}
                    >
                        اليوم
                    </Link>
                    <Link
                        href={`/business/schedule?date=${weekOffset(weekStart, 1)}`}
                        style={{ padding: '8px 16px', borderRadius: 10, background: '#fff', border: '1px solid #EAE4DC', color: '#1C1410', fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: 'inherit' }}
                    >
                        الأسبوع التالي →
                    </Link>
                </div>
            </div>

            {/* Venue Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setSelectedvenue(null)}
                    className="fbtn"
                    style={!selectedVenue ? { background: '#C8410A', color: '#fff', borderColor: '#C8410A' } : {}}
                >
                    كل المرافق
                </button>
                {venues.map((venue) => (
                    <button
                        key={venue.id}
                        onClick={() => setSelectedvenue(venue.id)}
                        className="fbtn"
                        style={selectedVenue === venue.id ? { background: '#C8410A', color: '#fff', borderColor: '#C8410A' } : {}}
                    >
                        {venue.name}
                    </button>
                ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                    { label: 'مفتوح', color: '#3B5BDB' },
                    { label: 'بانتظار المنشأة', color: '#B8860A' },
                    { label: 'مؤكد', color: '#1A7A4A' },
                    { label: 'مكتمل العدد', color: '#6B7A99' },
                    { label: 'بديل مقترح', color: '#C8410A' },
                    { label: 'منتهي', color: '#2E7D32' },
                    { label: 'ملغي', color: '#9E9E9E' },
                    { label: 'مرفوض', color: '#D32F2F' },
                ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 4, background: item.color }} />
                        <span style={{ fontSize: 12, color: '#8A7868' }}>{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Week Grid */}
            <div style={{ background: '#fff', border: '1px solid #EAE4DC', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', minWidth: 800 }}>
                        {/* Header Row */}
                        <div style={{ background: '#F7F4F0', padding: '10px 8px', borderBottom: '1px solid #EAE4DC', fontSize: 11, color: '#8A7868', fontWeight: 600, textAlign: 'center' }}>
                            الوقت
                        </div>
                        {days.map((day) => (
                            <div
                                key={day.date}
                                style={{
                                    background: isToday(day.date) ? '#C8410A10' : '#F7F4F0',
                                    padding: '8px 4px',
                                    borderBottom: '1px solid #EAE4DC',
                                    borderRight: '1px solid #EAE4DC',
                                    textAlign: 'center',
                                }}
                            >
                                <div style={{ fontSize: 12, fontWeight: 700, color: isToday(day.date) ? '#C8410A' : '#1C1410' }}>
                                    {day.day_name}
                                </div>
                                <div style={{ fontSize: 11, color: '#8A7868' }}>
                                    {formatDateShort(day.date)}
                                </div>
                            </div>
                        ))}

                        {/* Time Rows */}
                        {HOURS.map((hour) => (
                            <Fragment key={`row-${hour}`}>
                                <div
                                    style={{
                                        padding: '0 6px',
                                        fontSize: 10,
                                        color: '#8A7868',
                                        fontWeight: 600,
                                        borderBottom: '1px solid #F0EDE8',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'center',
                                        paddingTop: 4,
                                        height: 60,
                                    }}
                                >
                                    {formatHour(hour)}
                                </div>
                                {days.map((day) => {
                                    const dayEvents = day.events.filter((ev) => {
                                        const startH = parseTime(ev.start_time);
                                        return Math.floor(startH) === hour;
                                    }).filter((ev) => {
                                        if (!selectedVenue) return true;
                                        return ev.venue_ids.includes(selectedVenue);
                                    });

                                    return (
                                        <div
                                            key={`${day.date}-${hour}`}
                                            style={{
                                                borderBottom: '1px solid #F0EDE8',
                                                borderRight: '1px solid #F0EDE8',
                                                position: 'relative',
                                                height: 60,
                                                background: isToday(day.date) ? '#C8410A05' : 'transparent',
                                                padding: 2,
                                            }}
                                        >
                                            {dayEvents.map((ev) => {
                                                const color = statusColors[ev.status] ?? '#6B7A99';
                                                const venueNames = filteredvenues
                                                    .filter((c) => ev.venue_ids.includes(c.id))
                                                    .map((c) => c.name)
                                                    .join(', ');

                                                return (
                                                    <div
                                                        key={ev.id}
                                                        onClick={() => setSelectedEvent(ev)}
                                                        style={{
                                                            background: `${color}18`,
                                                            borderRight: `3px solid ${color}`,
                                                            borderRadius: 6,
                                                            padding: '3px 6px',
                                                            marginBottom: 2,
                                                            cursor: 'pointer',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <div style={{ fontSize: 10, fontWeight: 700, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            <CategoryIcon icon={ev.category_icon} size={14} /> {ev.company_name ?? ev.category_name}
                                                        </div>
                                                        <div style={{ fontSize: 9, color: '#8A7868', whiteSpace: 'nowrap' }}>
                                                            {ev.start_time?.slice(0, 5)} · {ev.duration_minutes}د {venueNames ? `· ${venueNames}` : ''}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="detail-overlay open" onClick={() => setSelectedEvent(null)}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <h3>
                            تفاصيل الحجز
                            <button className="close-btn" onClick={() => setSelectedEvent(null)}>×</button>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 18 }}>
                                    <CategoryIcon icon={selectedEvent.category_icon} size={14} /> {selectedEvent.category_name}
                                </span>
                                <StatusBadge status={selectedEvent.status} />
                            </div>

                            {selectedEvent.company_name && (
                                <div>
                                    <div style={{ fontSize: 11, color: '#8A7868', marginBottom: 2 }}>الشركة</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedEvent.company_name}</div>
                                </div>
                            )}

                            <div className="frow">
                                <div className="fg">
                                    <div style={{ fontSize: 11, color: '#8A7868', marginBottom: 2 }}>الوقت</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedEvent.start_time?.slice(0, 5)}</div>
                                </div>
                                <div className="fg">
                                    <div style={{ fontSize: 11, color: '#8A7868', marginBottom: 2 }}>المدة</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedEvent.duration_minutes} دقيقة</div>
                                </div>
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <div style={{ fontSize: 11, color: '#8A7868', marginBottom: 2 }}>اللاعبون</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedEvent.participants_count}/{selectedEvent.capacity}</div>
                                </div>
                                <div className="fg">
                                    <div style={{ fontSize: 11, color: '#8A7868', marginBottom: 2 }}>المرافق</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                                        {venues.filter((c) => selectedEvent.venue_ids.includes(c.id)).map((c) => c.name).join(', ') || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </BusinessLayout>
    );
}
