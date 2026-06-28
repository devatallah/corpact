import BusinessLayout from '@/layouts/business-layout';
import CategoryIcon from '@/components/category-icon';
import StatCard from '@/components/stat-card';
import type { Business, Event } from '@/types/models';
import { fmtDate, fmtDateTime } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

interface Stats {
    pending_requests: number;
    monthly_bookings: number;
    monthly_revenue: number;
    partner_companies: number;
}

interface Props {
    business: Business;
    stats: Stats;
    pendingEvents: Event[];
}

export default function businessDashboard({ business, stats, pendingEvents }: Props) {
    return (
        <BusinessLayout>
            <Head title="الرئيسية" />

            {/* Business Header */}
            <div style={{ background: 'linear-gradient(135deg,#0A0A0A,#1a1a1a)', borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: 2, marginBottom: 4 }}>TEAMAT &middot; business PORTAL</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{business.name}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{business.district}، {business.city}</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#18A86B' }}>{business.rating ?? '0.0'} ⭐</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{(business.total_bookings ?? 0).toLocaleString()} حجز إجمالي</div>
                </div>
            </div>

            {/* Stats */}
            <div className="stat-row">
                <StatCard
                    emoji="⏳"
                    label="طلبات معلقة"
                    value={stats.pending_requests}
                    change="تحتاج ردك الآن"
                    color="#18A86B"
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
                    color="#18A86B"
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
                    <Link href="/business/requests" className="ac-btn secondary" style={{ fontSize: 12, padding: '6px 14px' }}>عرض الكل</Link>
                </div>
                {pendingEvents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: '#999', fontSize: 13 }}>لا توجد طلبات معلقة حالياً</div>
                ) : (
                    pendingEvents.map((event, index) => (
                        <Link
                            key={event.id}
                            href="/business/requests"
                            style={{
                                display: 'block',
                                background: '#FAFAFA',
                                border: '1px solid #EBEBEB',
                                borderRight: '3px solid #18A86B',
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
                                <div style={{ fontSize: 11, color: '#999' }}>{fmtDateTime(event.created_at)}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 14 }}>
                                <span style={{ fontSize: 11, color: '#999' }}>
                                    <CategoryIcon icon={event.category?.icon} size={14} /> {event.category?.name} &middot; {event.venues_count} {event.venues_count > 1 ? 'مرافق' : 'مرفق'} &middot; {fmtDate(event.event_date)}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#18A86B' }}>
                                    {event.total_amount.toLocaleString()} ريال
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </BusinessLayout>
    );
}
