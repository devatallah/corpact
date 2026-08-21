import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import StatusBadge from '@/components/status-badge';
import PartnerLayout from '@/layouts/partner-layout';
import { fmtDateTime } from '@/lib/utils';
import type { PaginatedResult } from '@/types/models';
import { Head, Link } from '@inertiajs/react';

interface ItemRow {
    id: number;
    type: string;
    status: string;
    event_id: number;
    event_title: string | null;
    event_date: string | null;
    commission_rate_percent: number | null;
    gross_amount: string;
    commission_amount: string;
    vat_amount: string;
    net_amount: string;
    reason: string | null;
    corrects_item_id: number | null;
}

interface Statement {
    id: number;
    period_key: string;
    period_start: string | null;
    period_end: string | null;
    status: string;
    items_count: number;
    gross_amount: string;
    commission_amount: string;
    vat_amount: string;
    net_amount: string;
    approved_at: string | null;
    paid_at: string | null;
    transferred_at: string | null;
    payout_reference: string | null;
}

interface Props {
    statement: Statement;
    /** بنود الكشف — حمولة مرقّمة 20/صفحة (H §18)، لا مصفوفة بلا حدّ. */
    items: PaginatedResult<ItemRow>;
    sort: SortState;
}

export default function SettlementShow({ statement, items, sort }: Props) {
    return (
        <PartnerLayout>
            <Head title={`كشف ${statement.period_key}`} />

            <div style={{ marginBottom: 16 }}>
                <Link href="/partner/settlements" style={{ color: '#1A5FAB', fontWeight: 700 }}>
                    ← كل الكشوف
                </Link>
            </div>

            <div style={{ marginBottom: 20 }}>
                <div className="page-title">
                    كشف الفترة {statement.period_key} <StatusBadge status={statement.status} />
                </div>
                <div className="page-sub">
                    {statement.period_start} → {statement.period_end} · {statement.items_count} بند
                </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <table className="portal-table">
                    <tbody>
                        <tr>
                            <td>قيمة الفعاليات شاملة الضريبة</td>
                            <td style={{ fontWeight: 700 }}>{statement.gross_amount} ر</td>
                        </tr>
                        <tr>
                            <td>عمولة تيمات (تُقتطع من مستحقاتك)</td>
                            <td style={{ color: '#C8410A', fontWeight: 700 }}>−{statement.commission_amount} ر</td>
                        </tr>
                        <tr>
                            <td>منها ضريبة القيمة المضافة على العمولة</td>
                            <td>{statement.vat_amount} ر</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 800 }}>صافي التحويل إليك</td>
                            <td style={{ fontWeight: 800, color: '#1A7A4A' }}>{statement.net_amount} ر</td>
                        </tr>
                        {statement.paid_at && (
                            <>
                                <tr>
                                    <td>تاريخ التحويل</td>
                                    <td>{fmtDateTime(statement.transferred_at) || '—'}</td>
                                </tr>
                                <tr>
                                    <td>مرجع التحويل</td>
                                    <td>{statement.payout_reference ?? '—'}</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <div className="card-title">مطابقة البنود مقابل الفعاليات</div>
                <div style={{ fontSize: 12, color: '#6B7A99', marginBottom: 12 }}>
                    كل بند يحفظ نسخة ثابتة من السعر ونسبة العمولة وقت الاحتساب، فلا يتغير كشف قديم بتغيير ملفك لاحقاً.
                    لا توجد واجهة اعتراض في الإصدار الأول: راجع الأدمن المالي في تيمات، ويُضاف بند تصحيحي في الكشف
                    التالي — والكشف المدفوع لا يُعدَّل.
                </div>
                <div style={{ overflow: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>الفعالية</th>
                                <SortableHeader label="التاريخ" sortKey="computed_at" sort={sort} />
                                <SortableHeader label="الإجمالي" sortKey="gross_amount" sort={sort} initialDirection="desc" />
                                <th>النسبة</th>
                                <SortableHeader label="العمولة" sortKey="commission_amount" sort={sort} initialDirection="desc" />
                                <SortableHeader label="الصافي" sortKey="net_amount" sort={sort} initialDirection="desc" />
                                <SortableHeader label="النوع" sortKey="type" sort={sort} />
                            </tr>
                        </thead>
                        <tbody>
                            <ListStates
                                count={items.data.length}
                                columns={7}
                                emptyTitle="لا بنود في هذا الكشف"
                                emptyHint="يُضاف بند لكل فعالية مكتملة ضمن فترة الكشف."
                            />
                            {items.data.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 700 }}>
                                        {item.event_title ?? `#${item.event_id}`}
                                        {item.reason && (
                                            <div style={{ fontSize: 11, color: '#C8410A' }}>
                                                سبب التصحيح: {item.reason}
                                            </div>
                                        )}
                                    </td>
                                    <td>{item.event_date ?? '—'}</td>
                                    <td>{item.gross_amount} ر</td>
                                    <td>{item.commission_rate_percent ?? '—'}%</td>
                                    <td style={{ color: '#C8410A' }}>{item.commission_amount} ر</td>
                                    <td style={{ fontWeight: 700 }}>{item.net_amount} ر</td>
                                    <td>
                                        {item.type === 'correction' ? (
                                            <span style={{ color: '#C8410A', fontWeight: 700 }}>بند تصحيحي</span>
                                        ) : (
                                            'فعالية'
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination links={items.links} />
            </div>
        </PartnerLayout>
    );
}
