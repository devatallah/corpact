import EmployeeLayout from '@/layouts/employee-layout';
import SportIcon from '@/components/sport-icon';
import { Head, Link, usePage } from '@inertiajs/react';
import type { Community, Employee, Event } from '@/types/models';
import { useState } from 'react';

const arabicMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const arabicDays = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

function formatArabicDate(dateStr: string): string {
    const [y, m, d] = String(dateStr).slice(0, 10).split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return `${arabicDays[date.getDay()]} ${d} ${arabicMonths[m - 1]}`;
}

function formatArabicTime(timeStr: string): string {
    const [h, m] = String(timeStr).slice(0, 5).split(':').map(Number);
    const suffix = h >= 12 ? 'مساءً' : 'صباحاً';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

interface Props {
    employee: Employee;
    communities: (Community & { members_count: number; sport?: { icon: string; name: string } })[];
    events: (Event & {
        community: Community & { sport?: { icon: string } };
        club: { name: string; district: string };
        sport?: { icon: string };
    })[];
    joinedEventIds: number[];
}

export default function EmployeeHome({ employee, communities, events, joinedEventIds }: Props) {
    const unreadCount = Number((usePage().props as Record<string, unknown>).unreadNotifications ?? 0);
    const [filter, setFilter] = useState<string>('all');

    const filteredEvents = filter === 'all'
        ? events
        : events.filter((e) => e.community?.name === filter);

    return (
        <EmployeeLayout>
            <Head title="الرئيسية" />

            {/* Greeting */}
            <div style={{ padding: '16px 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 13, color: '#7A8BA8' }}>مرحبا،</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{employee.name} 👋</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Link
                        href="/employee/notifications"
                        style={{ width: 42, height: 42, borderRadius: '50%', background: '#fff', border: '1px solid #E4E9F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, position: 'relative', textDecoration: 'none' }}
                    >
                        🔔
                        {unreadCount > 0 && <div className="notif-dot" />}
                    </Link>
                    <Link
                        href="/employee/profile"
                        style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#009E82,#5B3FCC)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700, textDecoration: 'none' }}
                    >
                        {employee.name?.charAt(0)}
                    </Link>
                </div>
            </div>

            {/* My Communities */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>مجتمعاتي</div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                    {communities.length > 0 ? (
                        communities.map((community) => (
                            <Link
                                key={community.id}
                                href={`/employee/community/${community.id}`}
                                className="card"
                                style={{ minWidth: 120, flexShrink: 0, cursor: 'pointer', borderColor: `${community.sport?.color ?? community.color ?? '#009E82'}33`, marginBottom: 0, textDecoration: 'none', color: 'inherit' }}
                            >
                                <div style={{ marginBottom: 6 }}><SportIcon icon={community.sport?.icon} size={28} /></div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{community.name}</div>
                                <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>{community.members_count} عضو</div>
                            </Link>
                        ))
                    ) : (
                        <div style={{ fontSize: 13, color: '#7A8BA8', padding: 12 }}>لم تنضم لأي مجتمع بعد</div>
                    )}
                </div>
            </div>

            {/* Explore Banner */}
            <Link
                href="/employee/explore"
                style={{ background: 'linear-gradient(135deg,#009E82,#2563EB)', borderRadius: 18, padding: '18px 20px', marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 20px rgba(0,158,130,.3)', textDecoration: 'none' }}
            >
                <div style={{ fontSize: 36 }}>🔍</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 3 }}>اكتشف مجتمعات جديدة</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)' }}>انضم لمجتمعات شركتك الرياضية</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 700, color: '#fff' }}>استكشف ←</div>
            </Link>

            {/* Upcoming Events */}
            <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>فعالياتي القادمة</div>

                {/* Filter pills */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
                    <button
                        className="pill"
                        onClick={() => setFilter('all')}
                        style={{ background: filter === 'all' ? '#009E82' : '#E4E9F2', color: filter === 'all' ? '#fff' : '#7A8BA8', flexShrink: 0 }}
                    >
                        الكل
                    </button>
                    {communities.map((c) => (
                        <button
                            key={c.id}
                            className="pill"
                            onClick={() => setFilter(c.name)}
                            style={{ background: filter === c.name ? '#009E82' : '#E4E9F2', color: filter === c.name ? '#fff' : '#7A8BA8', flexShrink: 0 }}
                        >
                            <SportIcon icon={c.sport?.icon} size={16} /> {c.name}
                        </button>
                    ))}
                </div>

                {/* Event Cards */}
                <div>
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event) => {
                            const color = event.sport?.color ?? event.community?.color ?? '#009E82';
                            const pct = event.capacity > 0
                                ? Math.round((event.participants_count / event.capacity) * 100)
                                : 0;
                            const isJoined = joinedEventIds?.includes(event.id);
                            const statusMap: Record<string, { label: string; color: string }> = {
                                open: { label: 'مفتوح', color: '#009E82' },
                                confirmed: { label: 'مؤكد', color: '#2563EB' },
                                waiting_club: { label: 'معلق', color: '#F59E0B' },
                                full: { label: 'مكتمل', color: '#8B5CF6' },
                                completed: { label: 'منتهي', color: '#6B7280' },
                                cancelled: { label: 'ملغي', color: '#EF4444' },
                                rejected: { label: 'مرفوض', color: '#EF4444' },
                                alternative_proposed: { label: 'بديل مقترح', color: '#F59E0B' },
                            };
                            const statusInfo = statusMap[event.status] ?? { label: event.status, color: '#6B7280' };
                            const statusLabel = statusInfo.label;
                            const statusColor = statusInfo.color;

                            return (
                                <Link
                                    key={event.id}
                                    href={`/employee/detail/${event.id}`}
                                    style={{ display: 'block', background: '#fff', border: '1px solid #E4E9F2', borderRadius: 16, padding: 16, marginBottom: 12, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                                >
                                    {/* Row 1: Status badge (left) + Club name (right) */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ background: `${statusColor}15`, color: statusColor, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                                            {statusLabel}
                                        </span>
                                        <div style={{ textAlign: 'right', marginRight: 12 }}>
                                            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.3 }}>{event.club?.name}</div>
                                            <div style={{ fontSize: 12, color: '#7A8BA8' }}>{event.club?.district}</div>
                                        </div>
                                    </div>

                                    {/* Row 2: Date & Time (right-aligned) */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, margin: '14px 0' }}>
                                        <span style={{ fontSize: 13, color: '#4A5C78' }}>📅 {formatArabicDate(event.event_date)}</span>
                                        <span style={{ fontSize: 13, color: '#4A5C78' }}>🕐 {formatArabicTime(event.start_time)}</span>
                                    </div>

                                    {/* Row 3: Progress bar */}
                                    <div style={{ height: 6, background: '#E4E9F2', borderRadius: 6, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 6 }} />
                                    </div>

                                    {/* Row 4: Count */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7A8BA8', marginTop: 6, marginBottom: 14 }}>
                                        <span>{event.participants_count} منضم</span>
                                        <span>من {event.capacity}</span>
                                    </div>

                                    {/* Row 5: Action button (left) + Price (right) */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {event.status === 'completed' || event.status === 'cancelled' || event.status === 'rejected' ? (
                                            <span style={{ background: '#E4E9F2', color: '#7A8BA8', borderRadius: 24, padding: '6px 18px', fontSize: 13, fontWeight: 700 }}>{statusLabel}</span>
                                        ) : isJoined ? (
                                            <span style={{ border: `2px solid ${color}`, color, background: `${color}10`, borderRadius: 24, padding: '6px 18px', fontSize: 13, fontWeight: 700 }}>✓ منضم</span>
                                        ) : event.status === 'open' && event.participants_count < event.capacity ? (
                                            <span style={{ background: color, color: '#fff', borderRadius: 24, padding: '8px 20px', fontSize: 13, fontWeight: 700 }}>انضم</span>
                                        ) : (
                                            <span style={{ background: `${statusColor}15`, color: statusColor, borderRadius: 24, padding: '6px 18px', fontSize: 13, fontWeight: 700 }}>{statusLabel}</span>
                                        )}
                                        {event.player_payment <= 0 ? (
                                            <span style={{ fontSize: 14, color, fontWeight: 700 }}>✓ مغطى من الشركة</span>
                                        ) : (
                                            <span style={{ fontSize: 17, color, fontWeight: 800 }}>{event.cost_per_person?.toLocaleString()} ر/شخص</span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>لا توجد فعاليات قادمة حاليا</div>
                    )}
                </div>
            </div>
        </EmployeeLayout>
    );
}
