import PageHeader from '@/components/page-header';
import { AlertTriangle, Wallet } from 'lucide-react';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import FilterTabs from '@/components/filter-tabs';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import { SortBar, type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AdminLayout from '@/layouts/admin-layout';
import { fmtDateTime } from '@/lib/utils';
import type { PaginatedResult, TopupRequestStatus } from '@/types/models';

interface TopupRow {
    id: number;
    company: { id: number; name: string } | null;
    amount: number;
    transfer_date: string | null;
    sender_account_last4: string;
    bank_reference: string;
    status: TopupRequestStatus;
    status_label: string;
    creator: { id: number; name: string } | null;
    reviewer: { id: number; name: string } | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    unapproval_reason: string | null;
    receipt_url: string | null;
    created_at: string | null;
}

interface Props {
    requests: PaginatedResult<TopupRow>;
    filters: { status?: string; search?: string; sort?: string; dir?: string };
    sort: SortState;
}

const STATUS_META: Record<TopupRequestStatus, { color: string; bg: string }> = {
    submitted: { color: '#C87D00', bg: 'rgba(224,176,64,0.12)' },
    under_review: { color: '#C87D00', bg: 'rgba(74,157,224,0.12)' },
    approved: { color: '#2E7D32', bg: 'rgba(0,158,130,0.12)' },
    rejected: { color: '#D9381E', bg: 'rgba(224,48,80,0.12)' },
};

const STATUS_FILTERS = [
    { label: 'الكل', value: '' },
    { label: 'مُقدَّم', value: 'submitted' },
    { label: 'قيد المراجعة', value: 'under_review' },
    { label: 'معتمد', value: 'approved' },
    { label: 'مرفوض', value: 'rejected' },
];

// H §18 — «كل قائمة: بحث + فلترة + ترتيب + ترقيم صفحات».
const SORT_OPTIONS = [
    { key: 'created_at', label: 'وقت التقديم', initialDirection: 'desc' as const },
    { key: 'amount', label: 'المبلغ', initialDirection: 'desc' as const },
    { key: 'transfer_date', label: 'تاريخ التحويل', initialDirection: 'desc' as const },
    { key: 'bank_reference', label: 'المرجع' },
    { key: 'status', label: 'الحالة' },
];

export default function FinanceTopups({ requests, filters, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        status: filters?.status,
        sort: filters?.sort,
        dir: filters?.dir,
    });
    const [reasonFor, setReasonFor] = useState<{ id: number; action: 'reject' | 'unapprove' } | null>(null);
    const [reason, setReason] = useState('');
    // H §18: «كل إجراء مالي أو إلغائي يمر بنافذة تأكيد تعرض المبلغ والأثر صراحة».
    const [approveTarget, setApproveTarget] = useState<TopupRow | null>(null);

    function act(row: TopupRow, action: 'start-review' | 'approve') {
        router.post(`/admin/finance/topups/${row.id}/${action}`, {}, { preserveScroll: true });
    }

    function confirmApprove() {
        if (!approveTarget) return;
        const row = approveTarget;
        setApproveTarget(null);
        act(row, 'approve');
    }

    function submitReason() {
        if (!reasonFor || !reason.trim()) return;
        router.post(`/admin/finance/topups/${reasonFor.id}/${reasonFor.action}`, { reason }, {
            preserveScroll: true,
            onSuccess: () => {
                setReasonFor(null);
                setReason('');
            },
        });
    }

    return (
        <AdminLayout>
            <Head title="اعتماد التحويلات البنكية" />

            <PageHeader icon={Wallet} title={<>اعتماد التحويلات البنكية للمحافظ</>} subtitle={<>طابق المبلغ والمرجع مع كشف البنك قبل أي اعتماد — الاعتماد ينشئ حركة شحن في دفتر المحفظة.</>} />
            {/*
                The prototype gives the governance rules their own amber panel
                rather than a grey sentence — this is the screen that moves money,
                and the three constraints below are enforced server-side.
            */}
            <div className="flex gap-2.5 p-4 rounded-2xl bg-[#FEF08A]/40 border-[0.5px] border-[#C87D00]/30 mb-5">
                <AlertTriangle className="w-4 h-4 text-[#C87D00] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#C87D00] mb-1.5">قواعد الحوكمة المالية الصارمة:</p>
                    <ul className="text-[11px] text-[#0A0A0A]/70 leading-relaxed space-y-1 list-disc ps-4">
                        <li>يُحظر على أي شخص اعتماد حوالة أو طلب مالي قام بإنشائه بنفسه (فصل الصلاحيات).</li>
                        <li>قيد فريد على (المرجع + المبلغ) يمنع اعتماد التحويل مرتين.</li>
                        <li>الاعتماد يولد قيداً محاسبياً في دفتر المحفظة، ولا يمكن حذفه — إلغاؤه يكون بحركة عكسية بسبب مسجَّل.</li>
                    </ul>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بمرجع التحويل أو اسم الشركة..."
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
                {requests.data.length === 0 ? (
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <ListStates
                                count={0}
                                columns={1}
                                emptyTitle="لا توجد طلبات شحن"
                                emptyHint="لا طلب مطابق للبحث والفلاتر الحالية. يرفع مسؤول الحساب الطلب من بوابة الشركة: المبلغ وتاريخ التحويل وآخر أربعة أرقام والمرجع وصورة الإشعار."
                            />
                        </tbody>
                    </table>
                ) : requests.data.map((row, index) => {
                    const meta = STATUS_META[row.status];

                    return (
                        <div key={row.id} style={{ padding: '14px 0', ...(index < requests.data.length - 1 ? { borderBottom: '0.5px solid rgba(10,10,10,.1)' } : {}) }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800 }}>
                                        {row.company?.name ?? '—'}
                                        <span style={{ marginInlineStart: 10, color: '#2E7D32' }}>{row.amount.toLocaleString()} ريال</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', marginTop: 4 }}>
                                        مرجع: <b>{row.bank_reference}</b> · حساب المُرسِل: ****{row.sender_account_last4} · تاريخ التحويل: {row.transfer_date ?? '—'}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginTop: 2 }}>
                                        قُدِّم: {row.created_at ? fmtDateTime(row.created_at) : '—'}
                                        {row.reviewer ? ` · راجعه: ${row.reviewer.name}` : ''}
                                    </div>
                                    {row.rejection_reason && (
                                        <div style={{ fontSize: 12, color: '#D9381E', marginTop: 4 }}>سبب الرفض: {row.rejection_reason}</div>
                                    )}
                                    {row.unapproval_reason && (
                                        <div style={{ fontSize: 12, color: '#C87D00', marginTop: 4 }}>أُلغي اعتماد سابق: {row.unapproval_reason}</div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: meta.color, background: meta.bg }}>
                                        {row.status_label}
                                    </span>
                                    {row.receipt_url && (
                                        <a href={row.receipt_url} target="_blank" rel="noreferrer"
                                            style={{ fontSize: 12, fontWeight: 700, color: '#C87D00', textDecoration: 'none' }}>
                                            عرض الإشعار ↗
                                        </a>
                                    )}
                                    {row.status === 'submitted' && (
                                        <button className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] bg-[#0A0A0A] text-[#C8FF00] border-[#0A0A0A] hover:bg-[#0A0A0A]/90" onClick={() => act(row, 'start-review')}>بدء المراجعة</button>
                                    )}
                                    {(row.status === 'submitted' || row.status === 'under_review') && (
                                        <>
                                            <button className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100" onClick={() => setApproveTarget(row)}>اعتماد</button>
                                            <button className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] bg-[#FDEDEC] text-[#D9381E] border-[#D9381E]/25 hover:bg-[#D9381E] hover:text-white" onClick={() => { setReasonFor({ id: row.id, action: 'reject' }); setReason(''); }}>رفض</button>
                                        </>
                                    )}
                                    {row.status === 'approved' && (
                                        <button className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] bg-[#FEF08A] text-[#C87D00] border-[#C87D00]/25 hover:bg-[#C87D00] hover:text-white" onClick={() => { setReasonFor({ id: row.id, action: 'unapprove' }); setReason(''); }}>
                                            إلغاء الاعتماد (حركة عكسية)
                                        </button>
                                    )}
                                </div>
                            </div>

                            {reasonFor?.id === row.id && (
                                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                                    <input
                                        autoFocus
                                        dir="rtl"
                                        placeholder={reasonFor.action === 'reject' ? 'سبب الرفض (إلزامي — يُشعر به مسؤول الحساب)...' : 'سبب إلغاء الاعتماد (إلزامي — يُسجَّل مع الحركة العكسية)...'}
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        style={{ flex: 1, padding: '9px 13px', borderRadius: 10, border: '0.5px solid rgba(10,10,10,.1)', fontSize: 13, background: '#fff', outline: 'none', direction: 'rtl' }}
                                    />
                                    <button className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] bg-[#0A0A0A] text-[#C8FF00] border-[#0A0A0A] hover:bg-[#0A0A0A]/90" disabled={!reason.trim()} onClick={submitReason}>تأكيد</button>
                                    <button className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] bg-white text-[#0A0A0A] border-[#0A0A0A]/15 hover:border-[#0A0A0A]/40" onClick={() => setReasonFor(null)}>إلغاء</button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <Pagination links={requests.links} />

            <ConfirmModal
                open={approveTarget !== null}
                title="اعتماد التحويل البنكي"
                message={
                    approveTarget
                        ? `سيُشحن ${approveTarget.amount.toLocaleString()} ريال في المحفظة الرئيسية لـ«${approveTarget.company?.name ?? '—'}» بحركة شحن في الدفتر، ويصبح الرصيد متاحاً للتخصيص فوراً. المرجع ${approveTarget.bank_reference} · حساب المُرسِل ****${approveTarget.sender_account_last4}. طابق المبلغ والمرجع مع كشف البنك قبل التأكيد — إلغاء الاعتماد لاحقاً يتم بحركة عكسية لا بحذف.`
                        : ''
                }
                confirmLabel="اعتماد الشحن"
                onConfirm={confirmApprove}
                onCancel={() => setApproveTarget(null)}
            />
        </AdminLayout>
    );
}
