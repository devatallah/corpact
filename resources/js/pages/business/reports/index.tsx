import { Head } from '@inertiajs/react';
import BusinessLayout from '@/layouts/business-layout';
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
    business: { name: string };
    overview: OverviewData;
    monthlyRevenue: MonthlyRevenueItem[];
    topCompanies: TopCompanyItem[];
    demandHeatmap: HeatmapSlot[];
}

const DAY_NAMES = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const HEATMAP_COLORS: Record<string, { bg: string; color: string }> = {
    low: { bg: '#EBF0FE', color: '#1A56DB' },
    medium: { bg: '#93C5FD', color: '#1e3a8a' },
    high: { bg: '#1A56DB', color: '#fff' },
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

export default function BusinessReportsIndex({ business, overview, monthlyRevenue, topCompanies, demandHeatmap }: Props) {
    const revenueRef = useRef<HTMLDivElement>(null);
    const companiesRef = useRef<HTMLDivElement>(null);
    const heatmapRef = useRef<HTMLDivElement>(null);

    const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.amount), 1);

    const bookingsChange =
        overview.bookings_change_pct >= 0
            ? `↑ ${overview.bookings_change_pct}% هذا الشهر`
            : `↓ ${Math.abs(overview.bookings_change_pct)}% هذا الشهر`;

    return (
        <BusinessLayout>
            <Head title="التقارير" />

            <div dir="rtl">
                {/* Page Header */}
                <div style={{ marginBottom: 24 }}>
                    <h1 className="page-title">لوحة التقارير — {business.name}</h1>
                    <p className="page-sub">مزود خدمة</p>
                </div>

                {/* Stat Cards */}
                <div className="stat-row">
                    <StatCard
                        emoji="📋"
                        label="حجوزات من تيمات"
                        value={overview.bookings}
                        change={bookingsChange}
                        color="#1A56DB"
                    />
                    <StatCard
                        emoji="💵"
                        label="إيرادات من تيمات"
                        value={overview.revenue.toLocaleString()}
                        change="ريال هذا الشهر"
                        color="#0F7B6C"
                    />
                    <StatCard
                        emoji="🏢"
                        label="الشركات الحاجزة"
                        value={overview.companies}
                        color="#111827"
                    />
                    <StatCard
                        emoji="📊"
                        label="متوسط الحجز"
                        value={overview.avg_booking}
                        change="ريال / حجز"
                        color="#B45309"
                    />
                </div>

                {/* Two-column grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    {/* Monthly Revenue Bar Chart */}
                    <div className="card" ref={revenueRef}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 className="sec-title" style={{ margin: 0 }}>الإيرادات الشهرية</h2>
                            <button className="no-print" onClick={() => printCard(revenueRef.current, 'الإيرادات الشهرية')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>⬇️ تحميل</button>
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
                                                backgroundColor: item.is_current ? '#1A56DB' : '#EBF0FE',
                                                minHeight: 4,
                                            }}
                                        />
                                        <span
                                            style={{
                                                fontSize: 10,
                                                color: item.is_current ? '#1A56DB' : '#6B7280',
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
                        <p style={{ fontSize: 11, color: '#6B7280', marginTop: 12 }}>الأرقام بالريال السعودي</p>
                    </div>

                    {/* Top Companies Table */}
                    <div className="card" ref={companiesRef}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 className="sec-title" style={{ margin: 0 }}>الشركات الأكثر حجزاً</h2>
                            <button className="no-print" onClick={() => printCard(companiesRef.current, 'الشركات الأكثر حجزاً')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>⬇️ تحميل</button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr>
                                    {['الشركة', 'الحجوزات', 'الإيرادات', 'آخر حجز'].map((col) => (
                                        <th
                                            key={col}
                                            style={{
                                                background: '#F9FAFB',
                                                padding: '10px 14px',
                                                textAlign: 'right',
                                                fontWeight: 600,
                                                fontSize: 12,
                                                color: '#6B7280',
                                                borderBottom: '1px solid #E5E7EB',
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
                                                (td) => ((td as HTMLTableCellElement).style.background = '#F9FAFB'),
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
                                                borderBottom: idx === topCompanies.length - 1 ? 'none' : '1px solid #E5E7EB',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {company.company_name}
                                        </td>
                                        <td
                                            style={{
                                                padding: '12px 14px',
                                                borderBottom: idx === topCompanies.length - 1 ? 'none' : '1px solid #E5E7EB',
                                            }}
                                        >
                                            {company.bookings}
                                        </td>
                                        <td
                                            style={{
                                                padding: '12px 14px',
                                                borderBottom: idx === topCompanies.length - 1 ? 'none' : '1px solid #E5E7EB',
                                            }}
                                        >
                                            {company.revenue.toLocaleString()} ر
                                        </td>
                                        <td
                                            style={{
                                                padding: '12px 14px',
                                                borderBottom: idx === topCompanies.length - 1 ? 'none' : '1px solid #E5E7EB',
                                                color: '#6B7280',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#6B7280' }}>
                            <button className="no-print" onClick={() => printCard(heatmapRef.current, 'الأوقات الأكثر طلباً')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>⬇️ تحميل</button>
                            {[
                                { label: 'منخفض', bg: '#EBF0FE' },
                                { label: 'متوسط', bg: '#93C5FD' },
                                { label: 'مرتفع', bg: '#1A56DB' },
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
                                    color: '#6B7280',
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
                                        color: '#6B7280',
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
                            backgroundColor: '#FEF3C7',
                            borderRadius: 8,
                            padding: '12px 14px',
                            fontSize: 13,
                            color: '#B45309',
                        }}
                    >
                        💡 الأوقات الأقل طلباً مناسبة لعروض تيمات الخاصة دون تعارض مع الحجز المباشر.
                    </div>
                </div>
            </div>
        </BusinessLayout>
    );
}
