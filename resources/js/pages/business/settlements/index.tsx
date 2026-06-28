import BusinessLayout from '@/layouts/business-layout';
import StatCard from '@/components/stat-card';
import StatusBadge from '@/components/status-badge';
import Pagination from '@/components/pagination';
import type { Business, Settlement, PaginatedResult } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';

interface Totals {
    total_net: number;
    received: number;
    pending: number;
    processing: number;
}

interface Props {
    business: Business;
    settlements: PaginatedResult<Settlement>;
    totals: Totals;
    filters?: { search?: string; status?: string };
}

export default function SettlementsIndex({ business, settlements, totals, filters }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', { status: filters?.status });

    return (
        <BusinessLayout>
            <Head title="التسويات" />

            <div style={{ marginBottom: 24 }}>
                <div className="page-title">التسويات المالية</div>
                <div className="page-sub">الإيرادات القادمة من Teamat</div>
            </div>

            {/* Totals */}
            <div className="stat-row">
                <StatCard
                    emoji="💰"
                    label="إجمالي الإيرادات"
                    value={`${totals.total_net.toLocaleString()} ر`}
                    color="#18A86B"
                />
                <StatCard
                    emoji="✅"
                    label="مستلم"
                    value={`${totals.received.toLocaleString()} ر`}
                    color="#1A7A4A"
                />
                <StatCard
                    emoji="⏳"
                    label="في الطريق"
                    value={`${(totals.pending + totals.processing).toLocaleString()} ر`}
                    color="#1A5FAB"
                />
            </div>

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث بالشركة..."
                    style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 13, background: '#fff', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 200 }}
                />
            </div>

            {/* Table */}
            <div className="card">
                <div style={{ overflow: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>الشركة</th>
                                <th>الحجوزات</th>
                                <th>المبلغ</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settlements.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: 30, color: '#999' }}>
                                        لا توجد تسويات حالياً
                                    </td>
                                </tr>
                            ) : (
                                settlements.data.map((settlement) => (
                                    <tr
                                        key={settlement.id}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                            (window.location.href = `/business/settlements/${settlement.id}`)
                                        }
                                    >
                                        <td>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A' }}>
                                                {settlement.company?.name}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#999' }}>
                                                {settlement.period}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>
                                            {settlement.events_count} حجوزات
                                        </td>
                                        <td style={{ fontSize: 16, fontWeight: 900, color: '#18A86B' }}>
                                            {settlement.net_amount.toLocaleString()} ريال
                                        </td>
                                        <td>
                                            <StatusBadge status={settlement.status} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={settlements.links} />

            {/* Info Box */}
            <div style={{ background: '#1A5FAB18', border: '1px solid #1A5FAB33', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12 }}>
                <div style={{ fontSize: 22 }}>ℹ️</div>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A5FAB', marginBottom: 4 }}>
                        كيف تعمل التسويات؟
                    </div>
                    <div style={{ fontSize: 12, color: '#0A0A0A', lineHeight: 1.6 }}>
                        بعد خصم عمولة المنصة ({business.commission_rate ?? 10}%)، يُحول الصافي
                        لحسابك خلال 3 أيام عمل من تاريخ الفعالية.
                    </div>
                </div>
            </div>
        </BusinessLayout>
    );
}
