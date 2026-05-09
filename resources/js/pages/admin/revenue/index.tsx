import AdminLayout from '@/layouts/admin-layout';
import StatCard from '@/components/stat-card';
import StatusBadge from '@/components/status-badge';
import { Head } from '@inertiajs/react';

interface CompanyBreakdown {
    company_name: string;
    events_count: number;
    total_gross: number;
    total_commission: number;
    status: string;
}

interface Props {
    monthlyRevenue: number;
    collected: number;
    pending: number;
    revenueGrowth: number;
    perCompanyBreakdown: CompanyBreakdown[];
}

export default function RevenueIndex({
    monthlyRevenue,
    collected,
    pending,
    revenueGrowth,
    perCompanyBreakdown,
}: Props) {
    return (
        <AdminLayout>
            <Head title="الإيرادات" />

            <div className="page-title">الإيرادات</div>
            <div className="page-sub">إيرادات المنصة — عمولة على كل حجز</div>

            <div className="stat-row">
                <StatCard
                    emoji="💰"
                    label="إيرادات الشهر (ريال)"
                    value={monthlyRevenue.toLocaleString()}
                    color="#E03050"
                />
                <StatCard
                    emoji="✅"
                    label="مُحصَّل"
                    value={collected.toLocaleString()}
                    color="#009E82"
                />
                <StatCard
                    emoji="⏳"
                    label="في انتظار التحصيل"
                    value={pending.toLocaleString()}
                    color="#D4820A"
                />
                <StatCard
                    emoji="📈"
                    label="نمو عن الشهر السابق"
                    value={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`}
                    color="#5B7EFF"
                />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #232A3E', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                    تفصيل الإيرادات حسب الشركة
                </div>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الشركة</th>
                            <th>عدد الفعاليات</th>
                            <th>إجمالي الحجوزات</th>
                            <th>عمولة المنصة</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {perCompanyBreakdown.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', color: '#6B7A99', padding: '20px' }}>
                                    لا توجد بيانات إيرادات
                                </td>
                            </tr>
                        ) : (
                            perCompanyBreakdown.map((row, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 700, color: '#fff' }}>{row.company_name}</td>
                                    <td>{row.events_count}</td>
                                    <td style={{ color: '#D4820A', fontWeight: 700 }}>
                                        {row.total_gross.toLocaleString()} ريال
                                    </td>
                                    <td style={{ color: '#E03050', fontWeight: 700 }}>
                                        {row.total_commission.toLocaleString()} ريال
                                    </td>
                                    <td>
                                        <StatusBadge status={row.status === 'paid' ? 'paid' : 'pending'} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
