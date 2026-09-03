import PageHeader from '@/components/page-header';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';

interface ItemRow {
    id: number;
    type: string;
    description: string;
    quantity: number;
    unit_amount: string;
    amount: string;
    vat_amount: string;
    total_amount: string;
    tax_treatment: string;
    invoice_issuer: string;
}

interface Invoice {
    id: number;
    serial: string;
    invoice_uuid: string;
    company: { id: number; name: string } | null;
    period_key: string;
    period_start: string | null;
    period_end: string | null;
    status: string;
    issuance_mode: string;
    activated_employees_count: number;
    departed_activated_count: number;
    fee_per_activated_employee: string;
    fees_subtotal: string;
    monthly_minimum: string | null;
    minimum_adjustment: string;
    subtotal: string;
    vat_amount: string;
    total_amount: string;
    vat_rate_percent: number;
    tax_treatment: string;
    invoice_issuer: string;
    seller_vat_number: string | null;
    buyer_vat_number: string | null;
    qr_payload: string | null;
    issued_at: string | null;
    due_at: string | null;
    paid_at: string | null;
    items: ItemRow[];
}

interface Props {
    invoice: Invoice;
}

export default function FinanceInvoiceShow({ invoice }: Props) {
    return (
        <AdminLayout>
            <Head title={invoice.serial} />

            <div style={{ marginBottom: 16 }}>
                <Link href="/admin/finance/invoices" style={{ color: '#C87D00', fontWeight: 700 }}>
                    ← كل الفواتير
                </Link>
            </div>

            <PageHeader
                title={<>{invoice.serial} · {invoice.company?.name ?? '—'}</>}
                subtitle={<>
                دورة {invoice.period_key} ({invoice.period_start} → {invoice.period_end}) · الإصدار{' '}
                {invoice.issued_at?.slice(0, 10) ?? '—'} · الاستحقاق {invoice.due_at?.slice(0, 10) ?? '—'}
                {invoice.issuance_mode === 'provisional' && ' · فاتورة مبدئية (بانتظار اعتماد المحاسب القانوني)'}
                </>}
            />

            <div
                style={{
                    background: '#fff',
                    border: '0.5px solid rgba(10,10,10,.1)',
                    borderRadius: 16,
                    padding: 22,
                    marginBottom: 16,
                }}
            >
                <table className="portal-table">
                    <tbody>
                        <tr>
                            <td>الموظفون المفعّلون</td>
                            <td style={{ fontWeight: 700 }}>
                                {invoice.activated_employees_count} (منهم {invoice.departed_activated_count} غادروا
                                خلال الدورة)
                            </td>
                        </tr>
                        <tr>
                            <td>رسم الموظف المفعّل</td>
                            <td>{invoice.fee_per_activated_employee} ريال</td>
                        </tr>
                        <tr>
                            <td>مجموع الرسوم</td>
                            <td>{invoice.fees_subtotal} ريال</td>
                        </tr>
                        {invoice.monthly_minimum && (
                            <tr>
                                <td>الحد الأدنى الشهري في العقد</td>
                                <td>
                                    {invoice.monthly_minimum} ريال (فرق مضاف: {invoice.minimum_adjustment})
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td>الوعاء قبل الضريبة</td>
                            <td>{invoice.subtotal} ريال</td>
                        </tr>
                        <tr>
                            <td>ضريبة القيمة المضافة {invoice.vat_rate_percent}% (تُضاف على الرسوم)</td>
                            <td>{invoice.vat_amount} ريال</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 800 }}>الإجمالي</td>
                            <td style={{ fontWeight: 800, color: '#2E7D32' }}>{invoice.total_amount} ريال</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div
                style={{
                    background: '#fff',
                    border: '0.5px solid rgba(10,10,10,.1)',
                    borderRadius: 16,
                    padding: 22,
                    marginBottom: 16,
                }}
            >
                <div className="card-title">بيانات الفوترة الإلكترونية (فاتورة)</div>
                <div style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', lineHeight: 2 }}>
                    UUID: {invoice.invoice_uuid}
                    <br />
                    الرقم الضريبي للبائع: {invoice.seller_vat_number ?? 'غير مضبوط'}
                    <br />
                    الرقم الضريبي للمشتري: {invoice.buyer_vat_number ?? 'غير مضبوط'}
                    <br />
                    الصفة الضريبية: {invoice.tax_treatment} · جهة الإصدار: {invoice.invoice_issuer}
                    <br />
                    حمولة QR: {invoice.qr_payload ? `${invoice.qr_payload.slice(0, 40)}…` : 'بانتظار ضبط الرقم الضريبي'}
                </div>
            </div>

            <div style={{ background: '#fff', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 16, padding: 22 }}>
                <div className="card-title">البنود</div>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>البند</th>
                            <th>الكمية</th>
                            <th>سعر الوحدة</th>
                            <th>المبلغ</th>
                            <th>الضريبة</th>
                            <th>الإجمالي</th>
                            <th>الصفة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item) => (
                            <tr key={item.id}>
                                <td style={{ fontWeight: 700 }}>{item.description}</td>
                                <td>{item.quantity}</td>
                                <td>{item.unit_amount}</td>
                                <td>{item.amount}</td>
                                <td>{item.vat_amount}</td>
                                <td style={{ fontWeight: 700 }}>{item.total_amount}</td>
                                <td style={{ fontSize: 11, color: 'rgba(10,10,10,.55)' }}>
                                    {item.tax_treatment} / {item.invoice_issuer}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
