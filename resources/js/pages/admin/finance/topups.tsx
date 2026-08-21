import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
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
}

const STATUS_META: Record<TopupRequestStatus, { color: string; bg: string }> = {
    submitted: { color: '#E0B040', bg: 'rgba(224,176,64,0.12)' },
    under_review: { color: '#4A9DE0', bg: 'rgba(74,157,224,0.12)' },
    approved: { color: '#009E82', bg: 'rgba(0,158,130,0.12)' },
    rejected: { color: '#E03050', bg: 'rgba(224,48,80,0.12)' },
};

export default function FinanceTopups({ requests }: Props) {
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

            <div className="page-title">اعتماد التحويلات البنكية</div>
            <div className="page-sub" style={{ marginBottom: 8 }}>
                طابق المبلغ والمرجع مع كشف البنك قبل أي اعتماد — الاعتماد ينشئ حركة شحن في دفتر المحفظة.
            </div>
            <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 20 }}>
                لا يعتمد أحد طلباً أنشأه بنفسه · قيد فريد على (المرجع + المبلغ) يمنع اعتماد التحويل مرتين · إلغاء اعتماد سابق حركة عكسية بسبب مسجَّل.
            </div>

            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 22 }}>
                {requests.data.length === 0 ? (
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <ListStates
                                count={0}
                                columns={1}
                                emptyTitle="لا توجد طلبات شحن"
                                emptyHint="يرفع مسؤول الحساب الطلب من بوابة الشركة: المبلغ وتاريخ التحويل وآخر أربعة أرقام والمرجع وصورة الإشعار."
                            />
                        </tbody>
                    </table>
                ) : requests.data.map((row, index) => {
                    const meta = STATUS_META[row.status];

                    return (
                        <div key={row.id} style={{ padding: '14px 0', ...(index < requests.data.length - 1 ? { borderBottom: '1px solid #E2E8F4' } : {}) }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800 }}>
                                        {row.company?.name ?? '—'}
                                        <span style={{ marginInlineStart: 10, color: '#009E82' }}>{row.amount.toLocaleString()} ريال</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#7A8BA8', marginTop: 4 }}>
                                        مرجع: <b>{row.bank_reference}</b> · حساب المُرسِل: ****{row.sender_account_last4} · تاريخ التحويل: {row.transfer_date ?? '—'}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>
                                        قُدِّم: {row.created_at ? fmtDateTime(row.created_at) : '—'}
                                        {row.reviewer ? ` · راجعه: ${row.reviewer.name}` : ''}
                                    </div>
                                    {row.rejection_reason && (
                                        <div style={{ fontSize: 12, color: '#E03050', marginTop: 4 }}>سبب الرفض: {row.rejection_reason}</div>
                                    )}
                                    {row.unapproval_reason && (
                                        <div style={{ fontSize: 12, color: '#D4820A', marginTop: 4 }}>أُلغي اعتماد سابق: {row.unapproval_reason}</div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: meta.color, background: meta.bg }}>
                                        {row.status_label}
                                    </span>
                                    {row.receipt_url && (
                                        <a href={row.receipt_url} target="_blank" rel="noreferrer"
                                            style={{ fontSize: 12, fontWeight: 700, color: '#4A9DE0', textDecoration: 'none' }}>
                                            عرض الإشعار ↗
                                        </a>
                                    )}
                                    {row.status === 'submitted' && (
                                        <button className="ac-btn" style={{ fontSize: 12 }} onClick={() => act(row, 'start-review')}>بدء المراجعة</button>
                                    )}
                                    {(row.status === 'submitted' || row.status === 'under_review') && (
                                        <>
                                            <button className="ac-btn" style={{ fontSize: 12, background: '#009E82' }} onClick={() => setApproveTarget(row)}>اعتماد</button>
                                            <button className="ac-btn" style={{ fontSize: 12, background: '#E03050' }} onClick={() => { setReasonFor({ id: row.id, action: 'reject' }); setReason(''); }}>رفض</button>
                                        </>
                                    )}
                                    {row.status === 'approved' && (
                                        <button className="ac-btn" style={{ fontSize: 12, background: '#D4820A' }} onClick={() => { setReasonFor({ id: row.id, action: 'unapprove' }); setReason(''); }}>
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
                                        style={{ flex: 1, padding: '9px 13px', borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 13, background: '#F0F2F8', outline: 'none', direction: 'rtl' }}
                                    />
                                    <button className="ac-btn" style={{ fontSize: 12 }} disabled={!reason.trim()} onClick={submitReason}>تأكيد</button>
                                    <button className="ac-btn" style={{ fontSize: 12, background: '#7A8BA8' }} onClick={() => setReasonFor(null)}>إلغاء</button>
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
