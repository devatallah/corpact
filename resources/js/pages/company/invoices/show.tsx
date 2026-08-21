import { BackLink, ListState } from '@/components/list-states';
import CompanyLayout from '@/layouts/company-layout';
import { Head } from '@inertiajs/react';

/**
 * تفاصيل الفاتورة الشهرية — عرض فقط (H §12.8/§12.9).
 * H §18: «لا شاشة بلا مسار رجوع واضح».
 */

interface Props {
    company: { id: number; name: string };
    invoice: {
        id: number;
        serial: string | null;
        status: string;
        issuance_mode: string;
        period_start: string | null;
        period_end: string | null;
        activated_employees_count: number;
        departed_activated_count: number;
        fee_per_activated_employee: string;
        fees_subtotal: string;
        minimum_adjustment: string;
        subtotal: string;
        vat_rate_percent: number;
        vat_amount: string;
        total_amount: string;
        issued_at: string | null;
        due_at: string | null;
        paid_at: string | null;
        is_overdue: boolean;
    };
    items: {
        id: number;
        type: string;
        description: string | null;
        quantity: number | null;
        unit_amount: string;
        amount: string;
    }[];
}

export default function InvoiceShow({ company, invoice, items }: Props) {
    return (
        <CompanyLayout>
            <Head title={`الفاتورة ${invoice.serial ?? invoice.id}`} />

            <BackLink href="/company/invoices" label="العودة إلى الفواتير" />

            <div className="page-title" dir="ltr">{invoice.serial ?? `#${invoice.id}`}</div>
            <div className="page-sub">
                {company.name} · الدورة <span dir="ltr">{invoice.period_start} → {invoice.period_end}</span>
                {invoice.issuance_mode === 'provisional' ? ' · فاتورة أولية (بانتظار اعتماد الصفة الضريبية)' : ''}
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 style={{ marginTop: 0 }}>الأساس</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14 }}>
                    <Fact label="الموظفون المفعّلون" value={String(invoice.activated_employees_count)} />
                    <Fact label="منهم من غادر خلال الدورة" value={String(invoice.departed_activated_count)} />
                    <Fact label="رسوم الموظف المفعّل" value={`${invoice.fee_per_activated_employee} ريال`} />
                    <Fact label="تسوية الحد الأدنى" value={`${invoice.minimum_adjustment} ريال`} />
                </div>
                <p style={{ fontSize: 12, color: '#7A8BA8', lineHeight: 1.9, marginTop: 14 }}>
                    «الموظف المفعّل» = من شارك في فعالية مكتملة واحدة على الأقل ولم يُسجَّل غائباً، ويُحتسب مرة واحدة في الدورة.
                    من غادر خلال الدورة يُحتسب إن كان قد فُعّل قبل مغادرته.
                </p>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
                <div style={{ padding: '12px 16px', fontWeight: 700 }}>البنود</div>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>البند</th>
                            <th>الوصف</th>
                            <th>الكمية</th>
                            <th>سعر الوحدة</th>
                            <th>المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: 0 }}>
                                    <ListState tone="empty" title="لا بنود" hint="الفاتورة بلا بنود تفصيلية." />
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id}>
                                    <td dir="ltr" style={{ fontSize: 12 }}>{item.type}</td>
                                    <td style={{ fontSize: 12 }}>{item.description ?? '—'}</td>
                                    <td>{item.quantity ?? '—'}</td>
                                    <td dir="ltr">{item.unit_amount}</td>
                                    <td dir="ltr" style={{ fontWeight: 700 }}>{item.amount}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 style={{ marginTop: 0 }}>الإجمالي</h3>
                <Row label="المجموع قبل الضريبة" value={invoice.subtotal} />
                <Row label={`ضريبة القيمة المضافة (${invoice.vat_rate_percent}%)`} value={invoice.vat_amount} />
                <Row label="الإجمالي المستحق" value={invoice.total_amount} strong />
                <div style={{ marginTop: 14, fontSize: 12, color: invoice.is_overdue ? '#E03050' : '#7A8BA8', lineHeight: 1.9 }}>
                    الاستحقاق: {invoice.due_at?.slice(0, 10) ?? '—'}
                    {invoice.paid_at ? ` · سُدِّدت في ${invoice.paid_at.slice(0, 10)}` : ''}
                    {invoice.is_overdue ? ' · متأخرة — تنبيه بعد 7 أيام ثم 15، وبعد 30 يوماً يتوقف إنشاء الفعاليات الجديدة دون المساس بدخول الموظفين.' : ''}
                </div>
            </div>
        </CompanyLayout>
    );
}

function Fact({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div style={{ fontSize: 11, color: '#7A8BA8' }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1B2437' }} dir="auto">{value}</div>
        </div>
    );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #EEF2F8',
                fontWeight: strong ? 700 : 400,
                fontSize: strong ? 15 : 13,
                color: '#1B2437',
            }}
        >
            <span>{label}</span>
            <span dir="ltr">{value} ريال</span>
        </div>
    );
}
