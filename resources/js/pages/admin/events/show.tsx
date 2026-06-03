import AdminLayout from '@/layouts/admin-layout';
import CategoryIcon from '@/components/category-icon';
import StatusBadge from '@/components/status-badge';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event, Employee, Community, Business, Category, Company } from '@/types/models';
import { Head, Link } from '@inertiajs/react';

interface Props {
    event: Event & {
        community: Community;
        business: Business;
        category: Category;
        company: Company;
        creator: Employee;
        participants: (Employee & { pivot?: { status: string; joined_at: string } })[];
    };
}

export default function EventShow({ event }: Props) {
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
