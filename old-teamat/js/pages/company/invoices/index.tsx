import PageHeader from '@/components/page-header';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import StatCard from '@/components/stat-card';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import CompanyLayout from '@/layouts/company-layout';
import type { PaginatedResult } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';

/**
 * H §18 (مسؤول الحساب): «المالية: … الفواتير». عرض فقط — تسجيل السداد صلاحية
 * الأدمن المالي بعد التحويل الفعلي (H §12.8).
 */

interface InvoiceRow {
    id: number;
    serial: string | null;
    status: string;
    period_start: string | null;
    period_end: string | null;
    activated_employees_count: number;
    total_amount: string;
    issued_at: string | null;
    due_at: string | null;
    paid_at: string | null;
    is_overdue: boolean;
}

interface Props {
    company: { id: number; name: string };
    invoices: PaginatedResult<InvoiceRow>;
    filters: { search?: string; status?: string; sort?: string; dir?: string };
    summary: {
        outstanding: string;
        overdue_count: number;
        event_creation_blocked: boolean;
        block_reason: string | null;
    };
    sort: SortState;
}

const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    background: '#fff',
    border: '0.5px solid rgba(10,10,10,.1)',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#0A0A0A',
    outline: 'none',
    direction: 'rtl',
    fontFamily: 'inherit',
};

const STATUS_LABELS: Record<string, string> = {
    issued: 'صادرة',
    paid: 'مسدَّدة',
    void: 'ملغاة',
};

export default function CompanyInvoices({ company, invoices, filters, summary, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        status: filters?.status,
        sort: filters?.sort,
        dir: filters?.dir,
    });

    function apply(patch: Record<string, string | undefined>) {
        router.get(
            '/company/invoices',
            {
                search: filters?.search || undefined,
                status: filters?.status || undefined,
                sort: filters?.sort || undefined,
                dir: filters?.dir || undefined,
                ...patch,
            },
            { preserveState: true, replace: true },
        );
    }

    return (
        <CompanyLayout>
            <Head title="الفواتير" />

            <PageHeader
                title={<>الفواتير الشهرية</>}
                subtitle={<>
                تصدر اليوم الثالث من كل شهر عن الدورة السابقة وتُستحق خلال 15 يوماً · {company.name}
                </>}
            />

            {summary.event_creation_blocked && (
                <div
                    role="alert"
                    style={{
                        background: 'rgba(224,48,80,.08)',
                        border: '1px solid rgba(224,48,80,.25)',
                        borderRadius: 12,
                        padding: '14px 18px',
                        margin: '16px 0',
                    }}
                >
                    <div style={{ fontWeight: 700, color: '#D9381E', marginBottom: 4 }}>إنشاء الفعاليات الجديدة موقوف للتأخر</div>
                    <div style={{ fontSize: 12, color: '#0A0A0A', lineHeight: 1.9 }}>
                        {summary.block_reason ?? 'يُرفع الحجب فور سداد المتأخرات.'} دخول الموظفين وفعالياتهم المؤكدة لا تتأثر.
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, margin: '16px 0' }}>
                <StatCard emoji="🧾" label="مستحق غير مسدَّد (ريال)" value={summary.outstanding} />
                <StatCard
                    emoji="⏰"
                    label="فواتير متأخرة"
                    value={summary.overdue_count}
                    color={summary.overdue_count > 0 ? '#D9381E' : undefined}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث برقم الفاتورة..."
                    style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                />
                <select value={filters?.status ?? ''} onChange={(e) => apply({ status: e.target.value || undefined })} style={inputStyle}>
                    <option value="">كل الحالات</option>
                    <option value="issued">صادرة</option>
                    <option value="paid">مسدَّدة</option>
                    <option value="void">ملغاة</option>
                </select>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <SortableHeader label="رقم الفاتورة" sortKey="serial" sort={sort} />
                                <SortableHeader label="الدورة" sortKey="period_start" sort={sort} initialDirection="desc" />
                                <SortableHeader label="الموظفون المفعّلون" sortKey="activated_employees_count" sort={sort} initialDirection="desc" />
                                <SortableHeader label="الإجمالي (ريال)" sortKey="total_amount" sort={sort} initialDirection="desc" />
                                <SortableHeader label="الاستحقاق" sortKey="due_at" sort={sort} initialDirection="desc" />
                                <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <ListStates
                                count={invoices.data.length}
                                columns={7}
                                emptyTitle="لا توجد فواتير بعد"
                                emptyHint="أول فاتورة تصدر اليوم الثالث من الشهر التالي لأول دورة فيها موظف مفعّل."
                            />
                            {invoices.data.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td dir="ltr" style={{ fontWeight: 700, color: '#0A0A0A' }}>{invoice.serial ?? `#${invoice.id}`}</td>
                                    <td style={{ fontSize: 12, color: '#0A0A0A' }} dir="ltr">
                                        {invoice.period_start} → {invoice.period_end}
                                    </td>
                                    <td>{invoice.activated_employees_count}</td>
                                    <td style={{ fontWeight: 700 }} dir="ltr">{invoice.total_amount}</td>
                                    <td style={{ fontSize: 12, color: invoice.is_overdue ? '#D9381E' : 'rgba(10,10,10,.55)' }}>
                                        {invoice.due_at?.slice(0, 10) ?? '—'}
                                        {invoice.is_overdue ? ' (متأخرة)' : ''}
                                    </td>
                                    <td style={{ fontSize: 12 }}>{STATUS_LABELS[invoice.status] ?? invoice.status}</td>
                                    <td>
                                        <Link href={`/company/invoices/${invoice.id}`} className="act-btn btn-view">
                                            التفاصيل
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={invoices.links} />
        </CompanyLayout>
    );
}
