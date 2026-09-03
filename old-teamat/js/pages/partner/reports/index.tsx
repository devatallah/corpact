import PageHeader from '@/components/page-header';
import { Head } from '@inertiajs/react';
import PartnerLayout from '@/layouts/partner-layout';
import StatCard from '@/components/stat-card';
import { useRef } from 'react';
import { printCard } from '@/lib/print-card';

interface OverviewData {
    bookings: number;
    revenue: number;
    companies: number;
    avg_booking: number;
    bookings_change_pct: number;
    revenue_change_pct: number;
}

interface MonthlyRevenueItem {
    month: string;
    amount: number;
    is_current: boolean;
}

interface TopCompanyItem {
    company_name: string;
    bookings: number;
    revenue: number;
    last_booking: string | null;
}

interface HeatmapSlot {
    slot: string;
    label: string;
    days: Record<string, { count: number; level: 'low' | 'medium' | 'high' }>;
}

interface Props {
    partner: { name: string };
    overview: OverviewData;
    monthlyRevenue: MonthlyRevenueItem[];
    topCompanies: TopCompanyItem[];
    demandHeatmap: HeatmapSlot[];
}

const DAY_NAMES = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const HEATMAP_COLORS: Record<string, { bg: string; color: string }> = {
    low: { bg: '#F6F8F5', color: '#0A0A0A' },
    medium: { bg: '#0A0A0A', color: '#0A0A0A' },
    high: { bg: '#0A0A0A', color: '#fff' },
};

function formatRelativeDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} أشهر`;
    return `منذ ${Math.floor(diffDays / 365)} سنوات`;
}

export default function PartnerReportsIndex({ partner, overview, monthlyRevenue, topCompanies, demandHeatmap }: Props) {
    const revenueRef = useRef<HTMLDivElement>(null);
    const companiesRef = useRef<HTMLDivElement>(null);
    const heatmapRef = useRef<HTMLDivElement>(null);

    const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.amount), 1);

    const bookingsChange =
        overview.bookings_change_pct >= 0
            ? `↑ ${overview.bookings_change_pct}% هذا الشهر`
            : `↓ ${Math.abs(overview.bookings_change_pct)}% هذا الشهر`;

    return (
        <PartnerLayout>
            <Head title="التقارير" />

            <div dir="rtl">
                {/* Page Header */}
                <div style={{ marginBottom: 24 }}>
                    <PageHeader title={<>لوحة التقارير — {partner.name}</>} subtitle={<>شريك</>} />
                </div>

                {/* Stat Cards */}
                <div className="stat-row">
                    <StatCard
                        emoji="📋"
                        label="فعاليات من تيمات"
                        value={overview.bookings}
                        change={bookingsChange}
                        color="#0A0A0A"
                    />
                    <StatCard
                        emoji="💵"
                        label="إيرادات من تيمات"
                        value={overview.revenue.toLocaleString()}
                        change="ريال هذا الشهر"
                        color="#2E7D32"
                    />
                    <StatCard
                        emoji="🏢"
                        label="الشركات الحاجزة"
                        value={overview.companies}
                        color="#0A0A0A"
                    />
                    <StatCard
                        emoji="📊"
                        label="متوسط قيمة الفعالية"
                        value={overview.avg_booking}
                        change="ريال / فعالية"
                        color="#C87D00"
                    />
                </div>

                {/* Two-column grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    {/* Monthly Revenue Bar Chart */}
                    <div className="card" ref={revenueRef}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 className="sec-title" style={{ margin: 0 }}>الإيرادات الشهرية</h2>
                            <button className="no-print" onClick={() => printCard(revenueRef.current, 'الإيرادات الشهرية')} style={{ background: 'none', border: '1px solid #F6F8F5', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: 'rgba(10,10,10,.55)', display: 'flex', alignItems: 'center', gap: 4 }}>⬇️ تحميل</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
                            {monthlyRevenue.map((item) => {
                                const heightPct = (item.amount / maxRevenue) * 100;
                                return (
                                    <div
                                        key={item.month}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 4,
                                            height: '100%',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <div
                                            style={{
                                                borderRadius: '4px 4px 0 0',
                                                width: '100%',
                                                height: `${heightPct}%`,
                                                backgroundColor: item.is_current ? '#0A0A0A' : '#F6F8F5',
                                                minHeight: 4,
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontSize: 10,
                                                color: item.is_current ? '#0A0A0A' : 'rgba(10,10,10,.55)',
                                                fontWeight: item.is_current ? 700 : 400,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {item.month}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <p style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginTop: 12 }}>الأرقام بالريال السعودي</p>
                    </div>

                    {/* Top Companies Table */}
                    <div className="card" ref={companiesRef}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 className="sec-title" style={{ margin: 0 }}>الشركات الأكثر طلباً</h2>
                            <button className="no-print" onClick={() => printCard(companiesRef.current, 'الشركات الأكثر طلباً')} style={{ background: 'none', border: '1px solid #F6F8F5', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: 'rgba(10,10,10,.55)', display: 'flex', alignItems: 'center', gap: 4 }}>⬇️ تحميل</button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr>
                                    {['الشركة', 'الفعاليات', 'الإيرادات', 'آخر فعالية'].map((col) => (
                                        <th
                                            key={col}
                                            style={{
                                                background: '#F6F8F5',
                                                padding: '10px 14px',
                                                textAlign: 'right',
                                                fontWeight: 600,
                                                fontSize: 12,
                                                color: 'rgba(10,10,10,.55)',
                                                borderBottom: '1px solid #F6F8F5',
                                            }}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {topCompanies.map((company, idx) => (
                                    <tr
                                        key={idx}
                                        style={{ cursor: 'default' }}
                                        onMouseEnter={(e) => {
                                            Array.from((e.currentTarget as HTMLTableRowElement).cells).forEach(
                                                (td) => ((td as HTMLTableCellElement).style.background = '#F6F8F5'),
                                            );
                                        }}
                                        onMouseLeave={(e) => {
                                            Array.from((e.currentTarget as HTMLTableRowElement).cells).forEach(
                                                (td) => ((td as HTMLTableCellElement).style.background = ''),
                                            );
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: '12px 14px',
                                                borderBottom: idx === topCompanies.length - 1 ? 'none' : '1px solid #F6F8F5',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {company.company_name}
                                        </td>
                                        <td
                                            style={{
                                                padding: '12px 14px',
                                                borderBottom: idx === topCompanies.length - 1 ? 'none' : '1px solid #F6F8F5',
                                            }}
                                        >
                                            {company.bookings}
                                        </td>
                                        <td
                                            style={{
                                                padding: '12px 14px',
                                                borderBottom: idx === topCompanies.length - 1 ? 'none' : '1px solid #F6F8F5',
                                            }}
                                        >
                                            {company.revenue.toLocaleString()} ر
                                        </td>
                                        <td
                                            style={{
                                                padding: '12px 14px',
                                                borderBottom: idx === topCompanies.length - 1 ? 'none' : '1px solid #F6F8F5',
                                                color: 'rgba(10,10,10,.55)',
                                            }}
                                        >
                                            {formatRelativeDate(company.last_booking)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Demand Heatmap */}
                <div className="card" ref={heatmapRef}>
                    {/* Header with legend */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h2 className="sec-title" style={{ margin: 0 }}>الأوقات الأكثر طلباً — هذا الشهر</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(10,10,10,.55)' }}>
                            <button className="no-print" onClick={() => printCard(heatmapRef.current, 'الأوقات الأكثر طلباً')} style={{ background: 'none', border: '1px solid #F6F8F5', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: 'rgba(10,10,10,.55)', display: 'flex', alignItems: 'center', gap: 4 }}>⬇️ تحميل</button>
                            {[
                                { label: 'منخفض', bg: '#F6F8F5' },
                                { label: 'متوسط', bg: '#0A0A0A' },
                                { label: 'مرتفع', bg: '#0A0A0A' },
                            ].map((item) => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div
                                        style={{
                                            width: 14,
                                            height: 14,
                                            borderRadius: 3,
                                            backgroundColor: item.bg,
                                        }}
                                    />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `60px repeat(7, 1fr)`,
                            gap: 4,
                        }}
                    >
                        {/* Top-left empty cell */}
                        <div />

                        {/* Day name headers */}
                        {DAY_NAMES.map((day) => (
                            <div
                                key={day}
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: 'rgba(10,10,10,.55)',
                                    textAlign: 'center',
                                    paddingBottom: 4,
                                }}
                            >
                                {day}
                            </div>
                        ))}

                        {/* Heatmap rows */}
                        {demandHeatmap.map((slotData) => (
                            <>
                                {/* Time label */}
                                <div
                                    key={`label-${slotData.slot}`}
                                    style={{
                                        fontSize: 11,
                                        color: 'rgba(10,10,10,.55)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        paddingLeft: 6,
                                        height: 32,
                                    }}
                                >
                                    {slotData.label}
                                </div>

                                {/* Day cells */}
                                {DAY_NAMES.map((day) => {
                                    const cell = slotData.days[day];
                                    const colors = cell ? HEATMAP_COLORS[cell.level] : HEATMAP_COLORS.low;
                                    const count = cell ? cell.count : 0;
                                    return (
                                        <div
                                            key={`${slotData.slot}-${day}`}
                                            style={{
                                                height: 32,
                                                borderRadius: 6,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                backgroundColor: colors.bg,
                                                color: colors.color,
                                            }}
                                        >
                                            {count > 0 ? count : ''}
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>

                    {/* Insight box */}
                    <div
                        style={{
                            marginTop: 16,
                            backgroundColor: '#FEF9E0',
                            borderRadius: 8,
                            padding: '12px 14px',
                            fontSize: 13,
                            color: '#C87D00',
                        }}
                    >
                        💡 الأوقات الأقل طلباً مناسبة لعروض تيمات الخاصة دون تعارض مع الحجز الخارجي.
                    </div>
                </div>
            </div>
        </PartnerLayout>
    );
}
