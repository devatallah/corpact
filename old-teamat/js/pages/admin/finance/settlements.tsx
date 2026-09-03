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
    partner: { id: number; name: string } | null;
    payouts_blocked: boolean;
    generated_by: { id: number; name: string } | null;
    approved_by: { id: number; name: string } | null;
    paid_by: { id: number; name: string } | null;
}

interface PendingRow {
    partner_id: number;
    partner_name: string | null;
    items: number;
    net_amount: string;
}

interface Props {
    statements: PaginatedResult<StatementRow>;
    filters: { status?: string; search?: string; sort?: string; dir?: string };
    nextPeriod: { key: string; start: string; end: string };
    pendingByPartner: PendingRow[];
    sort: SortState;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
    draft: { label: 'مسودة', color: '#C87D00' },
    approved: { label: 'معتمد', color: '#C87D00' },
    paid: { label: 'مدفوع', color: '#2E7D32' },
};

const STATUS_FILTERS = [
    { label: 'الكل', value: '' },
    { label: STATUS_META.draft.label, value: 'draft' },
    { label: STATUS_META.approved.label, value: 'approved' },
    { label: STATUS_META.paid.label, value: 'paid' },
];

// H §18 — «كل قائمة: بحث + فلترة + ترتيب + ترقيم صفحات».
const SORT_OPTIONS = [
    { key: 'period_end', label: 'الفترة', initialDirection: 'desc' as const },
    { key: 'net_amount', label: 'الصافي', initialDirection: 'desc' as const },
    { key: 'gross_amount', label: 'الإجمالي', initialDirection: 'desc' as const },
    { key: 'commission_amount', label: 'العمولة', initialDirection: 'desc' as const },
    { key: 'items_count', label: 'البنود', initialDirection: 'desc' as const },
    { key: 'status', label: 'الحالة' },
];

export default function FinanceSettlements({ statements, filters, nextPeriod, pendingByPartner, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        status: filters?.status,
        sort: filters?.sort,
        dir: filters?.dir,
    });
    const [payFor, setPayFor] = useState<number | null>(null);
    const [reference, setReference] = useState('');
    // H §18: «كل إجراء مالي … يمر بنافذة تأكيد تعرض المبلغ والأثر صراحة».
    const [approveTarget, setApproveTarget] = useState<StatementRow | null>(null);

    function generate() {
        router.post('/admin/finance/settlements/generate', {}, { preserveScroll: true });
    }

    function approve(id: number) {
        router.post(`/admin/finance/settlements/${id}/approve`, {}, { preserveScroll: true });
    }

    function confirmApprove() {
        if (!approveTarget) return;
        const id = approveTarget.id;
        setApproveTarget(null);
        approve(id);
    }

    function submitPayout() {
        if (!payFor || !reference.trim()) return;
        router.post(
            `/admin/finance/settlements/${payFor}/pay`,
            { payout_reference: reference },
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
            <Head title="كشوف التسوية" />

            <PageHeader title={<>كشوف التسوية</>} subtitle={<>كشف كل 15 يوماً لكل مزوّد من بنود الفعاليات المكتملة في الفترة — مسودة ← معتمد ← مدفوع.</>} />
            <div style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', marginBottom: 20 }}>
                لا يعتمد أحد كشفاً ولّده بنفسه · لا صرف قبل اعتماد الحساب البنكي للمزوّد · الصرف يُسجَّل بعد التحويل
                الفعلي فتنتقل الفعاليات إلى «مسوّاة» · الكشف المدفوع لا يُعدَّل — التصحيح بحركة عكسية وبند تصحيحي في
                الكشف التالي.
            </div>

            <div
                style={{
                    background: '#fff',
                    border: '0.5px solid rgba(10,10,10,.1)',
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 20,
                }}
            >
                <div style={{ fontWeight: 800, marginBottom: 6 }}>
                    الفترة المنتهية: {nextPeriod.key} ({nextPeriod.start} → {nextPeriod.end})
                </div>
                <div style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', marginBottom: 10 }}>
                    التوليد آلي يومي 1 و16 الساعة 03:00 — الزر هنا للتشغيل اليدوي وهو idempotent.
                </div>
                {pendingByPartner.length > 0 && (
                    <ul style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', marginBottom: 10 }}>
                        {pendingByPartner.map((row) => (
                            <li key={row.partner_id}>
                                {row.partner_name ?? `#${row.partner_id}`}: {row.items} بند معلّق بصافي{' '}
                                {row.net_amount} ريال
                            </li>
                        ))}
                    </ul>
                )}
                <button type="button" onClick={generate} className="fbtn">
                    توليد كشوف الفترة
                </button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث باسم المزوّد أو الفترة..."
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
                {statements.data.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'rgba(10,10,10,.55)' }}>لا كشف مطابق للبحث والفلاتر الحالية.</div>
                ) : (
                    statements.data.map((row, index) => {
                        const meta = STATUS_META[row.status];

                        return (
                            <div
                                key={row.id}
                                style={{
                                    padding: '14px 0',
                                    ...(index < statements.data.length - 1
                                        ? { borderBottom: '0.5px solid rgba(10,10,10,.1)' }
                                        : {}),
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: 12,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 800 }}>
                                            {row.partner?.name ?? '—'}
                                            <span style={{ marginInlineStart: 10, color: 'rgba(10,10,10,.55)' }}>
                                                {row.period_key}
                                            </span>
                                            <span style={{ marginInlineStart: 10, color: meta.color }}>
                                                {meta.label}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', marginTop: 4 }}>
                                            {row.items_count} بند · إجمالي {row.gross_amount} · عمولة{' '}
                                            {row.commission_amount} · صافي{' '}
                                            <strong style={{ color: '#2E7D32' }}>{row.net_amount}</strong> ريال
                                        </div>
                                        <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginTop: 4 }}>
                                            ولّده: {row.generated_by?.name ?? 'النظام'} · اعتمده:{' '}
                                            {row.approved_by?.name ?? '—'} · صرفه: {row.paid_by?.name ?? '—'}
                                        </div>
                                        {row.payouts_blocked && (
                                            <div style={{ fontSize: 12, color: '#D9381E', marginTop: 4 }}>
                                                الحساب البنكي للمزوّد غير معتمد — الصرف محجوب.
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                        <Link href={`/admin/finance/settlements/${row.id}`} className="fbtn">
                                            البنود
                                        </Link>
                                        {row.status === 'draft' && (
                                            <button type="button" className="fbtn" onClick={() => setApproveTarget(row)}>
                                                اعتماد
                                            </button>
                                        )}
                                        {row.status === 'approved' && !row.payouts_blocked && (
                                            <button type="button" className="fbtn" onClick={() => setPayFor(row.id)}>
                                                تسجيل الصرف
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {payFor === row.id && (
                                    <div style={{ marginTop: 12 }}>
                                        <input
                                            value={reference}
                                            onChange={(e) => setReference(e.target.value)}
                                            placeholder="مرجع التحويل البنكي (إلزامي — بعد التحويل الفعلي)"
                                            style={{
                                                padding: '9px 14px',
                                                borderRadius: 10,
                                                border: '0.5px solid rgba(10,10,10,.1)',
                                                fontSize: 13,
                                                minWidth: 320,
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="fbtn"
                                            style={{ marginInlineStart: 8 }}
                                            onClick={submitPayout}
                                        >
                                            تأكيد
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <Pagination links={statements.links} />
            </div>
        <ConfirmModal
                open={approveTarget !== null}
                title="اعتماد كشف التسوية"
                message={
                    approveTarget
                        ? `اعتماد كشف «${approveTarget.partner?.name ?? '—'}» للفترة ${approveTarget.period_key}: إجمالي ${approveTarget.gross_amount} ريال، عمولة تيمات ${approveTarget.commission_amount} ريال، والصافي المستحق للمزوّد ${approveTarget.net_amount} ريال عن ${approveTarget.items_count} بنداً. الاعتماد يقفل الكشف تمهيداً للصرف${approveTarget.payouts_blocked ? ' — تنبيه: الحساب البنكي لهذا المزوّد غير معتمد فالصرف محجوب' : ''}. لا يعتمد أحد كشفاً ولّده بنفسه.`
                        : ''
                }
                confirmLabel="اعتماد الكشف"
                onConfirm={confirmApprove}
                onCancel={() => setApproveTarget(null)}
            />

        </AdminLayout>
    );
}
