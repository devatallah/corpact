import ConfirmModal from '@/components/confirm-modal';
import Pagination from '@/components/pagination';
import AdminLayout from '@/layouts/admin-layout';
import type { PaginatedResult } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface InvoiceRow {
    id: number;
    serial: string;
    company: { id: number; name: string } | null;
    period_key: string;
    status: string;
    issuance_mode: string;
    activated_employees_count: number;
    departed_activated_count: number;
    subtotal: string;
    vat_amount: string;
    total_amount: string;
    due_at: string | null;
    days_overdue: number;
    reminder_7_sent_at: string | null;
    reminder_15_sent_at: string | null;
    blocked_at: string | null;
}

interface Props {
    invoices: PaginatedResult<InvoiceRow>;
    filters: { status: string };
    cycle: { key: string; start: string; end: string };
    realInvoicesEnabled: boolean;
    missingContracts: { id: number; name: string }[];
}

const STATUS_LABEL: Record<string, string> = {
    draft: 'مسودة',
    issued: 'مُصدَرة',
    paid: 'مسددة',
    void: 'ملغاة',
};

export default function FinanceInvoices({ invoices, filters, cycle, realInvoicesEnabled, missingContracts }: Props) {
    const [payFor, setPayFor] = useState<number | null>(null);
    const [reference, setReference] = useState('');
    // H §18: «كل إجراء مالي … يمر بنافذة تأكيد تعرض المبلغ والأثر صراحة».
    const [payTarget, setPayTarget] = useState<InvoiceRow | null>(null);

    function confirmPay() {
        if (!payTarget) return;
        const id = payTarget.id;
        setPayTarget(null);
        router.post(
            `/admin/finance/invoices/${id}/pay`,
            { payment_reference: reference },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPayFor(null);
                    setReference('');
                },
            },
        );
    }

    return (
        <AdminLayout>
            <Head title="فواتير رسوم النظام" />

            <div className="page-title">فواتير رسوم النظام</div>
            <div className="page-sub" style={{ marginBottom: 8 }}>
                دورة ميلادية كاملة · تصدر اليوم الثالث من الشهر التالي · تُستحق خلال 15 يوماً · 15% ضريبة تُضاف على
                الرسوم · الأساس عدد الموظفين المفعّلين (شارك في فعالية مكتملة ولم يُسجَّل غائباً، مرة واحدة).
            </div>

            {!realInvoicesEnabled && (
                <div
                    style={{
                        background: 'rgba(224,176,64,0.12)',
                        border: '1px solid #E0B040',
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 12,
                        color: '#8A6B10',
                        marginBottom: 16,
                    }}
                >
                    الفواتير تصدر بوضع <strong>مبدئي</strong>: الأرقام تُحسب وتُخزَّن ولا تُقدَّم مستنداً ضريبياً
                    نهائياً. إصدار فاتورة حقيقية موقوف بعلم <code>billing.real_invoices_enabled</code> بانتظار مراجعة
                    محاسب قانوني للصفة الضريبية.
                </div>
            )}

            {missingContracts.length > 0 && (
                <div
                    style={{
                        background: 'rgba(224,48,80,0.10)',
                        border: '1px solid #E03050',
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 12,
                        color: '#B0203A',
                        marginBottom: 16,
                    }}
                >
                    شركات بلا رسم عقد محدد — لا تُفوتر حتى تُدخل قيم عقدها:{' '}
                    {missingContracts.map((c) => c.name).join('، ')}
                </div>
            )}

            <div
                style={{
                    background: '#fff',
                    border: '1px solid #E2E8F4',
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 20,
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}
            >
                <div style={{ fontWeight: 800 }}>
                    الدورة المنتهية: {cycle.key} ({cycle.start} → {cycle.end})
                </div>
                <button
                    type="button"
                    className="fbtn"
                    onClick={() => router.post('/admin/finance/invoices/generate', {}, { preserveScroll: true })}
                >
                    توليد فواتير الدورة
                </button>
                <button
                    type="button"
                    className="fbtn"
                    onClick={() => router.post('/admin/finance/invoices/arrears', {}, { preserveScroll: true })}
                >
                    تشغيل سلّم التأخر
                </button>
                <Link href="/admin/finance/terms" className="fbtn">
                    شروط العقود المستقبلية
                </Link>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['', 'issued', 'paid'].map((status) => (
                    <Link
                        key={status || 'all'}
                        href={`/admin/finance/invoices${status ? `?status=${status}` : ''}`}
                        className="fbtn"
                        style={{ opacity: filters.status === status ? 1 : 0.6 }}
                    >
                        {status === '' ? 'الكل' : STATUS_LABEL[status]}
                    </Link>
                ))}
            </div>

            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 22 }}>
                {invoices.data.length === 0 ? (
                    <div style={{ fontSize: 13, color: '#7A8BA8' }}>لا فواتير.</div>
                ) : (
                    invoices.data.map((row, index) => (
                        <div
                            key={row.id}
                            style={{
                                padding: '14px 0',
                                ...(index < invoices.data.length - 1 ? { borderBottom: '1px solid #E2E8F4' } : {}),
                            }}
                        >
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
                            >
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800 }}>
                                        {row.company?.name ?? '—'}
                                        <span style={{ marginInlineStart: 10, color: '#7A8BA8' }}>{row.serial}</span>
                                        <span style={{ marginInlineStart: 10, color: '#4A9DE0' }}>
                                            {STATUS_LABEL[row.status]}
                                        </span>
                                        {row.issuance_mode === 'provisional' && (
                                            <span style={{ marginInlineStart: 10, color: '#E0B040' }}>مبدئية</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#7A8BA8', marginTop: 4 }}>
                                        دورة {row.period_key} · {row.activated_employees_count} موظف مفعّل (منهم{' '}
                                        {row.departed_activated_count} غادروا خلال الدورة) · رسوم {row.subtotal} +
                                        ضريبة {row.vat_amount} ={' '}
                                        <strong style={{ color: '#009E82' }}>{row.total_amount}</strong> ريال
                                    </div>
                                    <div style={{ fontSize: 11, color: '#9AA8BE', marginTop: 4 }}>
                                        الاستحقاق: {row.due_at?.slice(0, 10) ?? '—'}
                                        {row.days_overdue > 0 && (
                                            <span style={{ color: '#E03050' }}> · متأخرة {row.days_overdue} يوماً</span>
                                        )}
                                        {row.reminder_7_sent_at && ' · نُبّهت (7)'}
                                        {row.reminder_15_sent_at && ' · نُبّهت (15)'}
                                        {row.blocked_at && (
                                            <span style={{ color: '#E03050' }}> · حُجب إنشاء الفعاليات</span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                    <Link href={`/admin/finance/invoices/${row.id}`} className="fbtn">
                                        البنود
                                    </Link>
                                    {row.status === 'issued' && (
                                        <button type="button" className="fbtn" onClick={() => setPayFor(row.id)}>
                                            تسجيل السداد
                                        </button>
                                    )}
                                </div>
                            </div>

                            {payFor === row.id && (
                                <div style={{ marginTop: 12 }}>
                                    <input
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                        placeholder="مرجع السداد (اختياري)"
                                        style={{
                                            padding: '9px 14px',
                                            borderRadius: 10,
                                            border: '1px solid #E2E8F4',
                                            minWidth: 280,
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="fbtn"
                                        style={{ marginInlineStart: 8 }}
                                        onClick={() => setPayTarget(row)}
                                    >
                                        تأكيد
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <Pagination links={invoices.links} />
            </div>
        <ConfirmModal
                open={payTarget !== null}
                title="تسجيل سداد الفاتورة"
                message={
                    payTarget
                        ? `تسجيل سداد الفاتورة ${payTarget.serial} لشركة «${payTarget.company?.name ?? '—'}» عن الدورة ${payTarget.period_key} بمبلغ ${payTarget.total_amount} ريال (منها ${payTarget.vat_amount} ريال ضريبة). الأثر: الفاتورة تنتقل إلى «مسددة»${payTarget.blocked_at ? ' ويُرفع حجب إنشاء الفعاليات عن الشركة' : ''}، ولا تُعدَّل بعدها — التصحيح بحركة عكسية لا بحذف. سجّل السداد بعد التحويل الفعلي فقط.`
                        : ''
                }
                confirmLabel="تسجيل السداد"
                onConfirm={confirmPay}
                onCancel={() => setPayTarget(null)}
            />

        </AdminLayout>
    );
}
