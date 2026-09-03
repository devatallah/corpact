import PageHeader from '@/components/page-header';
import ConfirmModal from '@/components/confirm-modal';
import FilterTabs from '@/components/filter-tabs';
import Pagination from '@/components/pagination';
import { SortBar, type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
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
    filters: { status?: string; search?: string; sort?: string; dir?: string };
    cycle: { key: string; start: string; end: string };
    realInvoicesEnabled: boolean;
    missingContracts: { id: number; name: string }[];
    sort: SortState;
}

const STATUS_LABEL: Record<string, string> = {
    draft: 'مسودة',
    issued: 'مُصدَرة',
    paid: 'مسددة',
    void: 'ملغاة',
};

const STATUS_FILTERS = [
    { label: 'الكل', value: '' },
    { label: STATUS_LABEL.issued, value: 'issued' },
    { label: STATUS_LABEL.paid, value: 'paid' },
];

// H §18 — «كل قائمة: بحث + فلترة + ترتيب + ترقيم صفحات».
const SORT_OPTIONS = [
    { key: 'period_key', label: 'الدورة', initialDirection: 'desc' as const },
    { key: 'total_amount', label: 'الإجمالي', initialDirection: 'desc' as const },
    { key: 'due_at', label: 'الاستحقاق', initialDirection: 'desc' as const },
    { key: 'activated_employees_count', label: 'المفعّلون', initialDirection: 'desc' as const },
    { key: 'status', label: 'الحالة' },
];

export default function FinanceInvoices({ invoices, filters, cycle, realInvoicesEnabled, missingContracts, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        status: filters?.status,
        sort: filters?.sort,
        dir: filters?.dir,
    });
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

            <PageHeader
                title={<>فواتير رسوم النظام</>}
                subtitle={<>
                دورة ميلادية كاملة · تصدر اليوم الثالث من الشهر التالي · تُستحق خلال 15 يوماً · 15% ضريبة تُضاف على
                الرسوم · الأساس عدد الموظفين المفعّلين (شارك في فعالية مكتملة ولم يُسجَّل غائباً، مرة واحدة).
                </>}
            />

            {!realInvoicesEnabled && (
                <div
                    style={{
                        background: 'rgba(224,176,64,0.12)',
                        border: '1px solid #C87D00',
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 12,
                        color: '#C87D00',
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
                        border: '1px solid #D9381E',
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 12,
                        color: '#D9381E',
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
                    border: '0.5px solid rgba(10,10,10,.1)',
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

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث برقم الفاتورة أو اسم الشركة..."
                    style={{
                        padding: '9px 14px',
                        borderRadius: 10,
                        border: '0.5px solid rgba(10,10,10,.1)',
                        fontSize: 13,
                        outline: 'none',
                        direction: 'rtl',
                        fontFamily: 'inherit',
                        minWidth: 260,
                    }}
                />
                <FilterTabs options={STATUS_FILTERS} current={filters?.status ?? ''} />
                <SortBar sort={sort} options={SORT_OPTIONS} />
            </div>

            <div style={{ background: '#fff', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 16, padding: 22 }}>
                {invoices.data.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'rgba(10,10,10,.55)' }}>لا فاتورة مطابقة للبحث والفلاتر الحالية.</div>
                ) : (
                    invoices.data.map((row, index) => (
                        <div
                            key={row.id}
                            style={{
                                padding: '14px 0',
                                ...(index < invoices.data.length - 1 ? { borderBottom: '0.5px solid rgba(10,10,10,.1)' } : {}),
                            }}
                        >
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
                            >
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800 }}>
                                        {row.company?.name ?? '—'}
                                        <span style={{ marginInlineStart: 10, color: 'rgba(10,10,10,.55)' }}>{row.serial}</span>
                                        <span style={{ marginInlineStart: 10, color: '#C87D00' }}>
                                            {STATUS_LABEL[row.status]}
                                        </span>
                                        {row.issuance_mode === 'provisional' && (
                                            <span style={{ marginInlineStart: 10, color: '#C87D00' }}>مبدئية</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', marginTop: 4 }}>
                                        دورة {row.period_key} · {row.activated_employees_count} موظف مفعّل (منهم{' '}
                                        {row.departed_activated_count} غادروا خلال الدورة) · رسوم {row.subtotal} +
                                        ضريبة {row.vat_amount} ={' '}
                                        <strong style={{ color: '#2E7D32' }}>{row.total_amount}</strong> ريال
                                    </div>
                                    <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginTop: 4 }}>
                                        الاستحقاق: {row.due_at?.slice(0, 10) ?? '—'}
                                        {row.days_overdue > 0 && (
                                            <span style={{ color: '#D9381E' }}> · متأخرة {row.days_overdue} يوماً</span>
                                        )}
                                        {row.reminder_7_sent_at && ' · نُبّهت (7)'}
                                        {row.reminder_15_sent_at && ' · نُبّهت (15)'}
                                        {row.blocked_at && (
                                            <span style={{ color: '#D9381E' }}> · حُجب إنشاء الفعاليات</span>
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
                                            border: '0.5px solid rgba(10,10,10,.1)',
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
