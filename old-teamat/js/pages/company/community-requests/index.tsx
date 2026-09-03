import PageHeader from '@/components/page-header';
import CompanyLayout from '@/layouts/company-layout';
import ConfirmModal from '@/components/confirm-modal';
import FilterTabs from '@/components/filter-tabs';
import Pagination from '@/components/pagination';
import { SortBar, type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { CommunityRequest, PaginatedResult } from '@/types/models';
import toastr from 'toastr';

interface Props {
    requests: PaginatedResult<CommunityRequest>;
    filters?: { status?: string; search?: string; sort?: string; dir?: string };
    sort?: SortState;
    /** عدد الطلبات المعلقة في القائمة كلها — لا في الصفحة الحالية. */
    pendingCommunityRequests?: number;
}

const statusFilters = [
    { label: 'الكل', value: '' },
    { label: 'قيد المراجعة', value: 'pending' },
    { label: 'تمت الموافقة', value: 'approved' },
    { label: 'مرفوض', value: 'rejected' },
];

const sortOptions = [
    { key: 'created_at', label: 'الأحدث', initialDirection: 'desc' as const },
    { key: 'name', label: 'الاسم', initialDirection: 'asc' as const },
    { key: 'status', label: 'الحالة', initialDirection: 'asc' as const },
];

function statusLabel(status: string): { text: string; bg: string; color: string } {
    switch (status) {
        case 'pending':
            return { text: 'قيد المراجعة', bg: '#C87D0018', color: '#C87D00' };
        case 'approved':
            return { text: 'تمت الموافقة', bg: '#2E7D3218', color: '#2E7D32' };
        case 'rejected':
            return { text: 'مرفوض', bg: '#D9381E18', color: '#D9381E' };
        default:
            return { text: status, bg: 'rgba(10,10,10,.55)18', color: 'rgba(10,10,10,.55)' };
    }
}

export default function CommunityRequestsIndex({ requests, filters, sort, pendingCommunityRequests = 0 }: Props) {
    const items = requests?.data ?? [];
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        status: filters?.status,
        sort: filters?.sort,
        dir: filters?.dir,
    });
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState<number | null>(null);
    // H §18: نافذة تأكيد موحّدة بدل نافذة المتصفح، والنص يصف أثر الموافقة.
    const [approveTarget, setApproveTarget] = useState<CommunityRequest | null>(null);

    const pendingCount = pendingCommunityRequests;

    function handleApprove(request: CommunityRequest) {
        setApproveTarget(request);
    }

    function confirmApprove() {
        if (!approveTarget) return;
        const id = approveTarget.id;
        setApproveTarget(null);
        setProcessing(id);
        router.post(`/company/community-requests/${id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => toastr.success('تمت الموافقة وتم إنشاء المجتمع'),
            onFinish: () => setProcessing(null),
        });
    }

    function handleReject(id: number) {
        setProcessing(id);
        router.post(`/company/community-requests/${id}/reject`, {
            rejection_reason: rejectionReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toastr.success('تم رفض الطلب');
                setRejectingId(null);
                setRejectionReason('');
            },
            onFinish: () => setProcessing(null),
        });
    }

    return (
        <CompanyLayout>
            <Head title="طلبات إنشاء مجتمعات" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <PageHeader
                        title={<>طلبات إنشاء مجتمعات</>}
                        subtitle={<>
                        {pendingCount > 0
                            ? `${pendingCount} طلب بانتظار المراجعة`
                            : 'لا توجد طلبات معلقة'}
                        </>}
                    />
                </div>
            </div>

            {/* H §18: بحث + فلترة + ترتيب — كلها على الخادم فتصمد عبر الصفحات */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث باسم المجتمع..."
                    style={{ padding: '9px 14px', borderRadius: 10, border: '0.5px solid rgba(10,10,10,.1)', fontSize: 13, background: '#fff', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 200 }}
                />
                <FilterTabs options={statusFilters} current={filters?.status ?? ''} />
            </div>

            <div style={{ marginBottom: 20 }}>
                <SortBar sort={sort} options={sortOptions} />
            </div>

            {/* Requests list */}
            {items.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                    <div style={{ fontSize: 13, color: 'rgba(10,10,10,.55)' }}>لا توجد طلبات</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {items.map((req) => {
                        const s = statusLabel(req.status);
                        const isRejecting = rejectingId === req.id;

                        return (
                            <div
                                key={req.id}
                                style={{
                                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                                    boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.03)',
                                    border: req.status === 'pending' ? '1px solid #C87D0033' : '0.5px solid rgba(10,10,10,.1)',
                                }}
                            >
                                <div style={{ padding: '24px 28px' }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 18, fontWeight: 800 }}>{req.name}</div>
                                            <div style={{ fontSize: 13, color: 'rgba(10,10,10,.5)', marginTop: 4 }}>
                                                مقدم من: {req.employee?.name ?? '--'}
                                            </div>
                                        </div>
                                        <span style={{
                                            display: 'inline-block', padding: '4px 12px', borderRadius: 12,
                                            fontSize: 11, fontWeight: 700, background: s.bg, color: s.color,
                                        }}>
                                            {s.text}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                        <div>
                                            <div style={{ fontSize: 11, color: 'rgba(10,10,10,.5)', fontWeight: 600 }}>الفئة</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                                                {req.category?.name ?? '--'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: 'rgba(10,10,10,.5)', fontWeight: 600 }}>تاريخ الطلب</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                                                {new Date(req.created_at).toLocaleDateString('ar-SA')}
                                            </div>
                                        </div>
                                    </div>

                                    {req.description && (
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ fontSize: 11, color: 'rgba(10,10,10,.5)', fontWeight: 600, marginBottom: 4 }}>الوصف</div>
                                            <div style={{ fontSize: 13, color: 'rgba(10,10,10,.6)', lineHeight: 1.6 }}>
                                                {req.description}
                                            </div>
                                        </div>
                                    )}

                                    {req.reason && (
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ fontSize: 11, color: 'rgba(10,10,10,.5)', fontWeight: 600, marginBottom: 4 }}>سبب الطلب</div>
                                            <div style={{ fontSize: 13, color: 'rgba(10,10,10,.6)', lineHeight: 1.6 }}>
                                                {req.reason}
                                            </div>
                                        </div>
                                    )}

                                    {req.status === 'rejected' && req.rejection_reason && (
                                        <div style={{
                                            background: '#D9381E08', border: '1px solid #D9381E22',
                                            borderRadius: 10, padding: '10px 14px', marginBottom: 12,
                                        }}>
                                            <div style={{ fontSize: 11, color: '#D9381E', fontWeight: 600, marginBottom: 2 }}>سبب الرفض</div>
                                            <div style={{ fontSize: 13, color: '#D9381E' }}>{req.rejection_reason}</div>
                                        </div>
                                    )}

                                    {/* Actions for pending requests */}
                                    {req.status === 'pending' && (
                                        <div>
                                            {isRejecting ? (
                                                <div style={{ marginTop: 12 }}>
                                                    <textarea
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        placeholder="سبب الرفض (اختياري)..."
                                                        rows={2}
                                                        style={{
                                                            width: '100%', borderRadius: 10, border: '0.5px solid rgba(10,10,10,.1)',
                                                            padding: '8px 12px', fontSize: 13, outline: 'none',
                                                            fontFamily: 'inherit', resize: 'none', marginBottom: 8,
                                                            boxSizing: 'border-box',
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button
                                                            onClick={() => handleReject(req.id)}
                                                            disabled={processing === req.id}
                                                            style={{
                                                                flex: 1, padding: '8px 0', borderRadius: 10, border: 'none',
                                                                background: '#D9381E', color: '#0A0A0A', fontSize: 13,
                                                                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                                                opacity: processing === req.id ? 0.6 : 1,
                                                            }}
                                                        >
                                                            تأكيد الرفض
                                                        </button>
                                                        <button
                                                            onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                                                            style={{
                                                                padding: '8px 16px', borderRadius: 10, border: '0.5px solid rgba(10,10,10,.1)',
                                                                background: '#fff', color: 'rgba(10,10,10,.55)', fontSize: 13,
                                                                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                                            }}
                                                        >
                                                            إلغاء
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                                                    <button
                                                        onClick={() => handleApprove(req)}
                                                        disabled={processing === req.id}
                                                        style={{
                                                            flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                                                            background: '#2E7D32', color: '#0A0A0A', fontSize: 13,
                                                            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                                            opacity: processing === req.id ? 0.6 : 1,
                                                        }}
                                                    >
                                                        الموافقة وإنشاء المجتمع
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectingId(req.id)}
                                                        style={{
                                                            padding: '10px 20px', borderRadius: 10, border: '1px solid #D9381E33',
                                                            background: '#D9381E08', color: '#D9381E', fontSize: 13,
                                                            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                                        }}
                                                    >
                                                        رفض
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Link to community if approved */}
                                    {req.status === 'approved' && req.community_id && (
                                        <div style={{ marginTop: 8 }}>
                                            <a
                                                href={`/company/communities/${req.community_id}/edit`}
                                                style={{
                                                    fontSize: 12, color: '#0A0A0A', fontWeight: 700,
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                عرض المجتمع &larr;
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {requests?.links && <Pagination links={requests.links} />}

            <ConfirmModal
                open={approveTarget !== null}
                title="الموافقة على طلب إنشاء مجتمع"
                message={
                    approveTarget
                        ? `يُنشأ مجتمع «${approveTarget.name}» في الشركة فوراً بمحفظة رصيدها صفر، ويصبح مُقدِّم الطلب قائده الأساسي. تخصيص رصيد المحفظة خطوة منفصلة من شاشة المالية — لا تُنشأ فعالية ولا يُستقطع أي مبلغ الآن.`
                        : ''
                }
                confirmLabel="موافقة وإنشاء المجتمع"
                onConfirm={confirmApprove}
                onCancel={() => setApproveTarget(null)}
            />
        </CompanyLayout>
    );
}
