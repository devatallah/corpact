import ClubLayout from '@/layouts/club-layout';
import SportIcon from '@/components/sport-icon';
import StatCard from '@/components/stat-card';
import type { Club, Event } from '@/types/models';
import { fmtDate, fmtDateTime } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

interface Stats {
    pending_requests: number;
    monthly_bookings: number;
    monthly_revenue: number;
    partner_companies: number;
}

interface Props {
    club: Club;
    stats: Stats;
    pendingEvents: Event[];
}

export default function ClubDashboard({ club, stats, pendingEvents }: Props) {
    return (
        <ClubLayout>
            <Head title="الرئيسية" />

            {/* Club Header */}
            <div style={{ background: 'linear-gradient(135deg,#1C1410,#2A1F18)', borderRadius: 20, padding: '24px 28px', marginBottom: 24, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: 2, marginBottom: 4 }}>TEAMAT &middot; CLUB PORTAL</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{club.name}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{club.district}، {club.city}</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#F5A623' }}>{club.rating ?? '0.0'} ⭐</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{(club.total_bookings ?? 0).toLocaleString()} حجز إجمالي</div>
                </div>
            </div>

            {/* Stats */}
            <div className="stat-row">
                <StatCard
                    emoji="⏳"
                    label="طلبات معلقة"
                    value={stats.pending_requests}
                    change="تحتاج ردك الآن"
                    color="#C8410A"
                />
                <StatCard
                    emoji="✅"
                    label="حجوزات هذا الشهر"
                    value={stats.monthly_bookings}
                    change="هذا الشهر"
                    color="#1A7A4A"
                />
                <StatCard
                    emoji="💰"
                    label="الإيرادات"
                    value={`${stats.monthly_revenue.toLocaleString()} ر`}
                    change="هذا الشهر"
                    color="#B8860A"
                />
                <StatCard
                    emoji="🏢"
                    label="شركات شريكة"
                    value={stats.partner_companies}
                    color="#1A5FAB"
                />
            </div>

            {/* Pending Events */}
            <div className="card">
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
                    طلبات تحتاج ردك
                    <Link href="/club/requests" style={{ background: '#C8410A18', color: '#C8410A', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>عرض الكل</Link>
                </div>
                {pendingEvents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: '#8A7868', fontSize: 13 }}>لا توجد طلبات معلقة حالياً</div>
                ) : (
                    pendingEvents.map((event, index) => (
                        <Link
                            key={event.id}
                            href="/club/requests"
                            style={{
                                display: 'block',
                                background: '#F7F4F0',
                                border: '1px solid #EAE4DC',
                                borderRight: '3px solid #C8410A',
                                borderRadius: 12,
                                padding: '12px 14px',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                color: 'inherit',
                                marginBottom: index < pendingEvents.length - 1 ? 10 : 0,
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{event.company?.name}</div>
                                <div style={{ fontSize: 11, color: '#8A7868' }}>{fmtDateTime(event.created_at)}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 14 }}>
                                <span style={{ fontSize: 11, color: '#8A7868' }}>
                                    <SportIcon icon={event.sport?.icon} size={14} /> {event.sport?.name} &middot; {event.courts_count} {event.courts_count > 1 ? 'ملاعب' : 'ملعب'} &middot; {fmtDate(event.event_date)}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#B8860A' }}>
                                    {event.total_amount.toLocaleString()} ريال
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </ClubLayout>
    );
}
