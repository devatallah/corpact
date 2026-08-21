import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import StatCard from '@/components/stat-card';
import StatusBadge from '@/components/status-badge';
import PartnerLayout from '@/layouts/partner-layout';
import type { PaginatedResult, Partner } from '@/types/models';
import { Head, Link } from '@inertiajs/react';

interface StatementRow {
    id: number;
    period_key: string;
    period_start: string | null;
    period_end: string | null;
    status: string;
    items_count: number;
    gross_amount: string;
    commission_amount: string;
    net_amount: string;
    paid_at: string | null;
}

interface Totals {
    paid_net: string;
    draft_net: string;
    approved_net: string;
    unstated_net: string;
    payouts_blocked: boolean;
}

interface Props {
    partner: Partner;
    statements: PaginatedResult<StatementRow>;
    totals: Totals;
    filters?: { status?: string };
}

export default function SettlementsIndex({ statements, totals }: Props) {
    return (
        <PartnerLayout>
            <Head title="التسويات" />

            <div style={{ marginBottom: 24 }}>
                <div className="page-title">المستحقات والتسويات</div>
                <div className="page-sub">
                    بند التسوية يُنشأ عند اكتمال الفعالية — لا قبله. الكشف يُولَّد كل 15 يوماً ويمر بمسودة ← معتمد ←
                    مدفوع. العمولة تُقتطع من مستحقاتك ولا تُضاف على السعر المعروض.
                </div>
            </div>

            {totals.payouts_blocked && (
                <div
                    className="card"
                    style={{ borderColor: '#C8410A', color: '#C8410A', fontWeight: 700, marginBottom: 16 }}
                >
                    حسابك البنكي غير معتمد — لا يمكن صرف أي كشف قبل اعتماده. حدّث بياناتك من صفحة الحساب البنكي.
                </div>
            )}

            <div className="stat-row">
                <StatCard emoji="✅" label="مصروف إليك (ريال)" value={totals.paid_net} color="#1A7A4A" />
                <StatCard emoji="🕐" label="معتمد بانتظار الصرف" value={totals.approved_net} color="#1A5FAB" />
                <StatCard emoji="📝" label="مسودة قيد المراجعة" value={totals.draft_net} color="#B8860A" />
                <StatCard emoji="⏭️" label="بنود للكشف القادم" value={totals.unstated_net} color="#6B7A99" />
            </div>

            <div className="card">
                <div style={{ overflow: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>الفترة</th>
                                <th>الفعاليات</th>
                                <th>الإجمالي</th>
                                <th>العمولة</th>
                                <th>الصافي</th>
                                <th>الحالة</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <ListStates
                                count={statements.data.length}
                                columns={7}
                                emptyTitle="لا كشوف بعد"
                                emptyHint="أول كشف تسوية يُولَّد بعد اكتمال فعالياتك في الفترة."
                            />
                            {statements.data.map((row) => (
                                <tr key={row.id}>
                                    <td style={{ fontWeight: 700 }}>
                                        {row.period_key}
                                        <div style={{ fontSize: 11, color: '#6B7A99' }}>
                                            {row.period_start} → {row.period_end}
                                        </div>
                                    </td>
                                    <td>{row.items_count}</td>
                                    <td>{row.gross_amount} ر</td>
                                    <td style={{ color: '#C8410A' }}>−{row.commission_amount} ر</td>
                                    <td style={{ fontWeight: 700 }}>{row.net_amount} ر</td>
                                    <td>
                                        <StatusBadge status={row.status} />
                                    </td>
                                    <td>
                                        <Link
                                            href={`/partner/settlements/${row.id}`}
                                            style={{ color: '#1A5FAB', fontWeight: 700 }}
                                        >
                                            التفاصيل
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination links={statements.links} />
            </div>
        </PartnerLayout>
    );
}
