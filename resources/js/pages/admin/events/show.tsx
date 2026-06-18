import AdminLayout from '@/layouts/admin-layout';
import CategoryIcon from '@/components/category-icon';
import StatusBadge from '@/components/status-badge';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event, Employee, Community, Business, Category, Company } from '@/types/models';
import { Head, Link } from '@inertiajs/react';

interface SeriesEvent {
    id: number;
    event_date: string;
    start_time: string;
    status: string;
    participants_count: number;
    capacity: number;
}

interface Props {
    event: Event & {
        community: Community;
        business: Business;
        category: Category;
        company: Company;
        creator: Employee;
        participants: (Employee & { pivot?: { status: string; joined_at: string } })[];
    };
    seriesEvents: SeriesEvent[];
}

export default function EventShow({ event, seriesEvents }: Props) {
    const joinedParticipants = event.participants?.filter(
        (p) => p.pivot?.status === 'joined',
    ) ?? [];

    const fillPercent = event.capacity > 0
        ? Math.round((event.participants_count / event.capacity) * 100)
        : 0;

    return (
        <AdminLayout>
            <Head title={`فعالية #${event.id}`} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Link href="/admin/events" style={{ color: '#6B7A99', textDecoration: 'none', fontSize: '14px' }}>
                    ← الفعاليات
                </Link>
                <span style={{ color: '#3D4A60' }}>/</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>فعالية #{event.id}</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                        <CategoryIcon icon={event.category?.icon} size={16} /> {event.community?.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#6B7A99' }}>
                        {event.company?.name} — {event.business?.name} — {fmtDate(event.event_date)} — {fmtTime(event.start_time)}
                    </div>
                </div>
                <StatusBadge status={event.status} />
            </div>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
                <div className="card">
                    <div style={{ fontSize: 11, color: '#6B7A99' }}>اللاعبون</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: fillPercent >= 100 ? '#009E82' : '#fff' }}>
                        {event.participants_count}/{event.capacity}
                    </div>
                    <div style={{ height: 4, background: '#232A3E', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${fillPercent}%`, background: '#009E82', borderRadius: 4 }} />
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 11, color: '#6B7A99' }}>عدد المرافق</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{event.venues_count}</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 11, color: '#6B7A99' }}>إجمالي التكلفة</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#D4820A' }}>{Number(event.total_amount).toLocaleString()} ريال</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 11, color: '#6B7A99' }}>حصة كل لاعب</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{Number(event.cost_per_person).toLocaleString()} ريال</div>
                </div>
                {Number(event.community_contribution) > 0 && (
                    <div className="card">
                        <div style={{ fontSize: 11, color: '#6B7A99' }}>خصم من المحفظة</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#009E82' }}>{Number(event.community_contribution).toLocaleString()} ريال</div>
                    </div>
                )}
            </div>

            {/* Recurrence info */}
            {event.recurrence_type && event.recurrence_type !== 'none' && (
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1A5FAB15', borderColor: '#1A5FAB44' }}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#8AB4F8' }}>
                        فعالية متكررة — {event.recurrence_type === 'daily' ? 'يومي' : event.recurrence_type === 'weekly' ? 'أسبوعي' : 'شهري'}
                    </span>
                    {event.recurrence_end_date && (
                        <span style={{ fontSize: 11, color: '#6B7A99', marginRight: 'auto' }}>حتى {fmtDate(event.recurrence_end_date)}</span>
                    )}
                </div>
            )}
            {event.parent_event_id && (
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1A5FAB15', borderColor: '#1A5FAB44' }}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#8AB4F8' }}>جزء من سلسلة فعاليات متكررة</span>
                    <Link
                        href={`/admin/events/${event.parent_event_id}`}
                        style={{ fontSize: 11, color: '#8AB4F8', marginRight: 'auto', textDecoration: 'underline' }}
                    >
                        عرض السلسلة
                    </Link>
                </div>
            )}

            {/* Series timeline */}
            {seriesEvents && seriesEvents.length > 0 && (
                <div className="card">
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 14 }}>
                        سلسلة الفعاليات ({seriesEvents.length + 1} فعاليات)
                    </div>
                    <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {seriesEvents.map((se) => {
                            const isCurrent = se.id === event.id;
                            const statusColor = se.status === 'cancelled' ? '#E03050' : se.status === 'completed' ? '#6B7A99' : '#009E82';
                            const statusLabel = se.status === 'cancelled' ? 'ملغية' : se.status === 'completed' ? 'منتهية' : `${se.participants_count}/${se.capacity}`;
                            return (
                                <Link
                                    key={se.id}
                                    href={`/admin/events/${se.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 12px',
                                        borderRadius: 10,
                                        textDecoration: 'none',
                                        background: isCurrent ? '#009E8215' : '#161B27',
                                        border: isCurrent ? '1px solid #009E8244' : '1px solid #232A3E',
                                        color: 'inherit',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? '#009E82' : '#C8D0E0' }}>
                                            {fmtDate(se.event_date)}
                                        </span>
                                        <span style={{ fontSize: 11, color: '#6B7A99' }}>
                                            {fmtTime(se.start_time)}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: statusColor }}>
                                        {statusLabel}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Joined participants */}
            <div className="card">
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 14 }}>
                    المنضمون ({joinedParticipants.length}/{event.capacity})
                </div>
                {joinedParticipants.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6B7A99', fontSize: 13, padding: '16px 0' }}>
                        لا يوجد منضمون بعد
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {joinedParticipants.map((p) => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#161B27', borderRadius: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#009E8220', color: '#009E82', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                                    {p.name?.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#E8EAF0' }}>{p.name}</div>
                                    <div style={{ fontSize: 11, color: '#6B7A99' }}>{p.email}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes */}
            {event.notes && (
                <div className="card">
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>ملاحظات</div>
                    <div style={{ fontSize: 13, color: '#C8D0E0' }}>{event.notes}</div>
                </div>
            )}
        </AdminLayout>
    );
}
