import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';

interface CompanyBreakdown {
    company_id: number;
    company_name: string;
    commission_halalas: number;
    commission: string;
}

interface MonthlyCommission {
    month: number;
    commission_halalas: number;
    commission: string;
}

interface Totals {
    gmv: string;
    provider_net: string;
    commission_revenue: string;
    system_fee_revenue: string;
}

interface Payouts {
    paid: string;
    approved: string;
    draft: string;
}

interface Props {
    year: number;
    totals: Totals;
    monthlyCommission: MonthlyCommission[];
    perCompanyBreakdown: CompanyBreakdown[];
    payouts: Payouts;
}

const MONTHS = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
];

export default function RevenueIndex({ year, totals, monthlyCommission, perCompanyBreakdown, payouts }: Props) {
    return (
        <AdminLayout>
            <Head title="الإيرادات" />

            <PageHeader
                title={<>الإيرادات</>}
                subtitle={<>
                إيراد تيمات = العمولة + رسوم النظام. حجم التداول قيمةُ نشاطٍ تُحصَّل نيابةً عن المزوّدين — ليس إيراداً ولا
                يُجمع معه.
                </>}
            />

            <div className="stat-row">
                <StatCard emoji="🧾" label={`عمولة ${year} (ريال)`} value={totals.commission_revenue} color="#D9381E" />
                <StatCard emoji="🏢" label={`رسوم النظام ${year} (ريال)`} value={totals.system_fee_revenue} color="#0A0A0A" />
            </div>

            <div className="stat-row">
                <StatCard emoji="📊" label={`حجم التداول ${year} — ليس إيراداً`} value={totals.gmv} color="rgba(10,10,10,.55)" />
                <StatCard emoji="🤝" label="صافي مستحقات المزوّدين" value={totals.provider_net} color="#2E7D32" />
            </div>

            <div className="stat-row">
                <StatCard emoji="✅" label="كشوف مصروفة (ريال)" value={payouts.paid} color="#2E7D32" />
                <StatCard emoji="🕐" label="معتمدة بانتظار الصرف" value={payouts.approved} color="#C87D00" />
                <StatCard emoji="📝" label="مسودات بانتظار الاعتماد" value={payouts.draft} color="rgba(10,10,10,.55)" />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                    style={{
                        padding: '16px 20px',
                        borderBottom: '0.5px solid rgba(10,10,10,.1)',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0A0A0A',
                    }}
                >
                    العمولة شهرياً — {year}
                </div>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الشهر</th>
                            <th>العمولة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyCommission.length === 0 ? (
                            <tr>
                                <td colSpan={2} style={{ textAlign: 'center', color: 'rgba(10,10,10,.55)', padding: '20px' }}>
                                    لا عمولة مسجلة بعد — القيد لا يُنشأ إلا عند اكتمال الفعالية.
                                </td>
                            </tr>
                        ) : (
                            monthlyCommission.map((row) => (
                                <tr key={row.month}>
                                    <td style={{ fontWeight: 700, color: '#0A0A0A' }}>{MONTHS[row.month - 1]}</td>
                                    <td style={{ color: '#D9381E', fontWeight: 700 }}>{row.commission} ريال</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
                <div
                    style={{
                        padding: '16px 20px',
                        borderBottom: '0.5px solid rgba(10,10,10,.1)',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0A0A0A',
                    }}
                >
                    العمولة حسب الشركة مصدر النشاط
                </div>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الشركة</th>
                            <th>العمولة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {perCompanyBreakdown.length === 0 ? (
                            <tr>
                                <td colSpan={2} style={{ textAlign: 'center', color: 'rgba(10,10,10,.55)', padding: '20px' }}>
                                    لا توجد بيانات إيرادات
                                </td>
                            </tr>
                        ) : (
                            perCompanyBreakdown.map((row) => (
                                <tr key={row.company_id}>
                                    <td style={{ fontWeight: 700, color: '#0A0A0A' }}>{row.company_name}</td>
                                    <td style={{ color: '#D9381E', fontWeight: 700 }}>{row.commission} ريال</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
