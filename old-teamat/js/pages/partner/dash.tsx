import PartnerLayout from '@/layouts/partner-layout';
import CategoryIcon from '@/components/category-icon';
import StatCard from '@/components/stat-card';
import type { Partner, Event } from '@/types/models';
import { fmtDate, fmtDateTime } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

interface Stats {
    pending_requests: number;
    monthly_bookings: number;
    monthly_revenue: number;
    partner_companies: number;
}

interface Props {
    partner: Partner;
    stats: Stats;
    pendingEvents: Event[];
}

export default function PartnerDashboard({ partner, stats, pendingEvents }: Props) {
    return (
        <PartnerLayout>
            <Head title="الرئيسية" />

            {/* Partner Header */}
            <div style={{ background: 'linear-gradient(135deg,#0A0A0A,#0A0A0A)', borderRadius: 20, padding: '24px 28px', marginBottom: 24, color: '#0A0A0A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: 2, marginBottom: 4 }}>TEAMAT &middot; partner PORTAL</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{partner.name}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{partner.district}، {partner.city}</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#C87D00' }}>{partner.rating ?? '0.0'} ⭐</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{(partner.total_bookings ?? 0).toLocaleString()} فعالية إجمالاً</div>
                </div>
            </div>

            {/* Stats */}
            <div className="stat-row">
                <StatCard
                    emoji="⏳"
                    label="طلبات معلقة"
                    value={stats.pending_requests}
                    change="تحتاج ردك الآن"
                    color="#C87D00"
                />
                <StatCard
                    emoji="✅"
                    label="فعاليات هذا الشهر"
                    value={stats.monthly_bookings}
                    change="هذا الشهر"
                    color="#2E7D32"
                />
                <StatCard
                    emoji="💰"
                    label="الإيرادات"
                    value={`${stats.monthly_revenue.toLocaleString()} ر`}
                    change="هذا الشهر"
                    color="#C87D00"
                />
                <StatCard
                    emoji="🏢"
                    label="شركات شريكة"
                    value={stats.partner_companies}
                    color="#0A0A0A"
                />
            </div>

            {/* Pending Events */}
            <div className="card">
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
                    طلبات تحتاج ردك
                    <Link href="/partner/requests-queue" style={{ background: '#C87D0018', color: '#C87D00', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>عرض الكل</Link>
                </div>
                {pendingEvents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: 'rgba(10,10,10,.55)', fontSize: 13 }}>لا توجد طلبات معلقة حالياً</div>
                ) : (
                    pendingEvents.map((event, index) => (
                        <Link
                            key={event.id}
                            href="/partner/requests-queue"
                            style={{
                                display: 'block',
                                background: '#F6F8F5',
                                border: '0.5px solid rgba(10,10,10,.1)',
                                borderRight: '3px solid #C87D00',
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
                                <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)' }}>{fmtDateTime(event.created_at)}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 14 }}>
                                <span style={{ fontSize: 11, color: 'rgba(10,10,10,.55)' }}>
                                    <CategoryIcon icon={event.category?.icon} size={14} /> {event.category?.name} &middot; {event.venues_count} {event.venues_count > 1 ? 'مرافق' : 'مرفق'} &middot; {fmtDate(event.event_date)}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#C87D00' }}>
                                    {event.total_amount.toLocaleString()} ريال
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </PartnerLayout>
    );
}
