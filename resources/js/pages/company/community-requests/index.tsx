import CompanyLayout from '@/layouts/company-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { CommunityRequest } from '@/types/models';
import toastr from 'toastr';

interface Props {
    requests: CommunityRequest[];
}

function statusLabel(status: string): { text: string; bg: string; color: string } {
    switch (status) {
        case 'pending':
            return { text: 'قيد المراجعة', bg: '#F59E0B18', color: '#F59E0B' };
        case 'approved':
            return { text: 'تمت الموافقة', bg: '#009E8218', color: '#009E82' };
        case 'rejected':
            return { text: 'مرفوض', bg: '#E0305018', color: '#E03050' };
        default:
            return { text: status, bg: '#7A8BA818', color: '#7A8BA8' };
    }
}

export default function CommunityRequestsIndex({ requests }: Props) {
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState<number | null>(null);

    const filteredRequests = activeFilter === 'all'
        ? requests
        : requests.filter((r) => r.status === activeFilter);

    const pendingCount = requests.filter((r) => r.status === 'pending').length;

    function handleApprove(id: number) {
        if (!confirm('هل تريد الموافقة على هذا الطلب وإنشاء المجتمع؟')) return;
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

    const filters: { key: typeof activeFilter; label: string; count?: number }[] = [
        { key: 'all', label: 'الكل' },
        { key: 'pending', label: 'قيد المراجعة', count: pendingCount },
        { key: 'approved', label: 'تمت الموافقة' },
        { key: 'rejected', label: 'مرفوض' },
    ];

    return (
        <CompanyLayout>
            <Head title="طلبات إنشاء مجتمعات" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <div className="page-title">طلبات إنشاء مجتمعات</div>
                    <div className="page-sub">
                        {pendingCount > 0
                            ? `${pendingCount} طلب بانتظار المراجعة`
                            : 'لا توجد طلبات معلقة'}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setActiveFilter(f.key)}
                        style={{
                            padding: '6px 16px', borderRadius: 20, border: 'none',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                            background: activeFilter === f.key ? '#3B5BDB' : '#F1F5F9',
                            color: activeFilter === f.key ? '#fff' : '#64748B',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        {f.label}
                        {f.count !== undefined && f.count > 0 && (
                            <span style={{
                                background: activeFilter === f.key ? 'rgba(255,255,255,0.3)' : '#F59E0B',
                                color: activeFilter === f.key ? '#fff' : '#fff',
                                borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 800,
                            }}>
                                {f.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Requests list */}
            {filteredRequests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                    <div style={{ fontSize: 13, color: '#7A8BA8' }}>لا توجد طلبات</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {filteredRequests.map((req) => {
                        const s = statusLabel(req.status);
                        const isRejecting = rejectingId === req.id;

                        return (
                            <div
                                key={req.id}
                                style={{
                                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                                    boxShadow: '0 1px 3px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.03)',
                                    border: req.status === 'pending' ? '1px solid #F59E0B33' : '1px solid #E2E8F4',
                                }}
                            >
                                <div style={{ padding: '24px 28px' }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 18, fontWeight: 800 }}>{req.name}</div>
                                            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
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
                                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>الفئة</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                                                {req.category?.name ?? '--'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>تاريخ الطلب</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                                                {new Date(req.created_at).toLocaleDateString('ar-SA')}
                                            </div>
                                        </div>
                                    </div>

                                    {req.description && (
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>الوصف</div>
                                            <div style={{ fontSize: 13, color: '#4A5C78', lineHeight: 1.6 }}>
                                                {req.description}
                                            </div>
                                        </div>
                                    )}

                                    {req.reason && (
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>سبب الطلب</div>
                                            <div style={{ fontSize: 13, color: '#4A5C78', lineHeight: 1.6 }}>
                                                {req.reason}
                                            </div>
                                        </div>
                                    )}

                                    {req.status === 'rejected' && req.rejection_reason && (
                                        <div style={{
                                            background: '#E0305008', border: '1px solid #E0305022',
                                            borderRadius: 10, padding: '10px 14px', marginBottom: 12,
                                        }}>
                                            <div style={{ fontSize: 11, color: '#E03050', fontWeight: 600, marginBottom: 2 }}>سبب الرفض</div>
                                            <div style={{ fontSize: 13, color: '#E03050' }}>{req.rejection_reason}</div>
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
                                                            width: '100%', borderRadius: 10, border: '1px solid #E4E9F2',
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
                                                                background: '#E03050', color: '#fff', fontSize: 13,
                                                                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                                                opacity: processing === req.id ? 0.6 : 1,
                                                            }}
                                                        >
                                                            تأكيد الرفض
                                                        </button>
                                                        <button
                                                            onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                                                            style={{
                                                                padding: '8px 16px', borderRadius: 10, border: '1px solid #E4E9F2',
                                                                background: '#fff', color: '#64748B', fontSize: 13,
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
                                                        onClick={() => handleApprove(req.id)}
                                                        disabled={processing === req.id}
                                                        style={{
                                                            flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                                                            background: '#009E82', color: '#fff', fontSize: 13,
                                                            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                                            opacity: processing === req.id ? 0.6 : 1,
                                                        }}
                                                    >
                                                        الموافقة وإنشاء المجتمع
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectingId(req.id)}
                                                        style={{
                                                            padding: '10px 20px', borderRadius: 10, border: '1px solid #E0305033',
                                                            background: '#E0305008', color: '#E03050', fontSize: 13,
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
                                                    fontSize: 12, color: '#3B5BDB', fontWeight: 700,
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
        </CompanyLayout>
    );
}
