import { Head } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';
import { ListStates } from '@/components/list-states';
import { Card, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * H §12.9 — الإيراد، وحجم التداول ليس إيراداً.
 *
 * GMV is money Teamat collects on providers' behalf and passes through; the
 * revenue is the commission plus the system fees, where Teamat is principal.
 * Putting them in one number would flatter the business and misstate the tax
 * position — so they are separate cards with the distinction written down.
 */
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function AdminRevenue({
    year,
    totals,
    monthlyCommission,
    perCompanyBreakdown,
    payouts,
}: {
    year: number;
    totals: {
        gmv: string;
        provider_net: string;
        commission_revenue: string;
        commission_revenue_halalas: number;
        system_fee_revenue: string;
        system_fee_revenue_halalas: number;
    };
    monthlyCommission: { month: number; commission_halalas: number; commission: string }[];
    perCompanyBreakdown: { company_id: number; company_name: string; commission_halalas: number; commission: string }[];
    payouts: { paid: string; approved: string; draft: string };
}) {
    const revenue = (totals.commission_revenue_halalas + totals.system_fee_revenue_halalas) / 100;
    const peak = Math.max(1, ...monthlyCommission.map((row) => row.commission_halalas));

    return (
        <AdminLayout>
            <Head title="الإيرادات" />

            <PageHeader
                icon={TrendingUp}
                title={`الإيرادات — ${year}`}
                subtitle="العمولة على الفعاليات المكتملة، ورسوم النظام على الموظفين المفعّلين."
            />

            <Note title="حجم التداول ليس إيراداً">
                حجم التداول (GMV) هو قيمة النشاط المحصَّلة نيابةً عن مزوّدي الخدمة وتُصرف لهم. إيراد تيمات هو العمولة ورسوم
                النظام فقط — وهي وحدها ما تكون فيه المنصة أصيلاً ضريبياً.
            </Note>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إيراد المنصة" value={revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} hint="عمولة + رسوم نظام" tone="success" />
                <StatCard label="العمولة" value={totals.commission_revenue} hint="ريال" />
                <StatCard label="رسوم النظام" value={totals.system_fee_revenue} hint="ريال" />
                <StatCard label="حجم التداول (GMV)" value={totals.gmv} hint="ليس إيراداً — يُصرف للمزوّدين" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <StatCard label="مصروف للمزوّدين" value={payouts.paid} hint="ريال" tone="success" />
                <StatCard label="معتمد بانتظار الصرف" value={payouts.approved} hint="ريال" tone="warning" />
                <StatCard label="قيد الإعداد" value={payouts.draft} hint="ريال" />
            </div>

            {/* ── العمولة شهرياً ── */}
            <Card padding="p-5" className="space-y-4">
                <div className="flex items-center justify-between border-b-[0.5px] border-ink/10 pb-3">
                    <h2 className="text-sm font-extrabold text-ink">العمولة شهرياً</h2>
                    <span className="text-[11px] text-ink/50">{year}</span>
                </div>

                {monthlyCommission.length > 0 ? (
                    <div className="flex items-end justify-between gap-2 h-44" dir="ltr">
                        {monthlyCommission.map((row) => (
                            <div key={row.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <span className="text-[10px] font-mono text-ink/60">{row.commission}</span>
                                <div
                                    className="w-full rounded-t-lg bg-lime border-[0.5px] border-lime"
                                    style={{ height: `${Math.max(Math.round((row.commission_halalas / peak) * 100), 2)}%` }}
                                />
                                <span className="text-[10px] font-bold text-ink/70">{MONTHS[row.month - 1] ?? row.month}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ListStates count={0} empty="لا عمولة مسجّلة هذا العام." emptyHint="تُحتسب العمولة عند اكتمال الفعالية." />
                )}
            </Card>

            {/* ── التوزيع على الشركات ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">توزيع العمولة على الشركات</h2>

                <TableShell>
                    <Thead>
                        <Th>الشركة</Th>
                        <Th>العمولة</Th>
                        <Th>الحصة</Th>
                    </Thead>
                    <Tbody>
                        {perCompanyBreakdown.map((row) => {
                            const share = totals.commission_revenue_halalas > 0
                                ? Math.round((row.commission_halalas / totals.commission_revenue_halalas) * 100)
                                : 0;

                            return (
                                <Tr key={row.company_id}>
                                    <Td className="font-extrabold text-ink">{row.company_name}</Td>
                                    <Td className="font-mono font-bold text-ink">{row.commission}</Td>
                                    <Td>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 rounded-full bg-ink/10 overflow-hidden max-w-[120px]" dir="ltr">
                                                <div className="h-full bg-lime rounded-full" style={{ width: `${share}%` }} />
                                            </div>
                                            <span className="font-mono text-[11px] text-ink/60">{share}٪</span>
                                        </div>
                                    </Td>
                                </Tr>
                            );
                        })}
                        <ListStates count={perCompanyBreakdown.length} colSpan={3} empty="لا توزيع بعد." />
                    </Tbody>
                </TableShell>
            </Card>
        </AdminLayout>
    );
}
