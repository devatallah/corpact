import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Pagination from '@/components/pagination';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AdminLayout from '@/layouts/admin-layout';
import { fmtDate } from '@/lib/utils';
import type { PaginatedResult } from '@/types/models';

interface SupportMessage {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    status: 'new' | 'in_progress' | 'resolved';
    created_at: string;
}

interface Props {
    messages: PaginatedResult<SupportMessage>;
    stats: { total: number; new: number; in_progress: number; resolved: number };
    filters: { search?: string; status?: string };
}

const STATUS_META: Record<SupportMessage['status'], { label: string; color: string; bg: string }> = {
    new: { label: 'جديدة', color: '#E0B040', bg: 'rgba(224,176,64,0.12)' },
    in_progress: { label: 'قيد المعالجة', color: '#4A9DE0', bg: 'rgba(74,157,224,0.12)' },
    resolved: { label: 'تم الحل', color: '#009E82', bg: 'rgba(0,158,130,0.12)' },
};

function StatusBadge({ status }: { status: SupportMessage['status'] }) {
    const meta = STATUS_META[status];

    return (
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: meta.color, background: meta.bg }}>
            {meta.label}
        </span>
    );
}

export default function SupportIndex({ messages, stats, filters }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', { status: filters?.status });
    const [detail, setDetail] = useState<SupportMessage | null>(null);

    function handleStatusFilter(value: string) {
        router.get('/admin/support', {
            search: filters?.search || undefined,
            status: value || undefined,
        }, { preserveState: true, replace: true });
    }

    function setStatus(message: SupportMessage, status: SupportMessage['status']) {
        router.patch(`/admin/support/${message.id}`, { status }, {
            preserveScroll: true,
            onSuccess: () => setDetail(null),
        });
    }

    function remove(message: SupportMessage) {
        if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
        router.delete(`/admin/support/${message.id}`, {
            preserveScroll: true,
            onSuccess: () => setDetail(null),
        });
    }

    return (
        <AdminLayout>
            <Head title="رسائل الدعم" />

            <div style={{ marginBottom: 4 }}>
                <div className="page-title">رسائل الدعم</div>
            </div>
            <div className="page-sub">
                {stats.total} رسالة — {stats.new} جديدة، {stats.in_progress} قيد المعالجة، {stats.resolved} تم حلها
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو البريد أو الموضوع..."
                    style={{ padding: '9px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 220 }}
                />
                <select
                    value={filters?.status ?? ''}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    style={{ padding: '9px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                >
                    <option value="">كل الحالات</option>
                    <option value="new">جديدة</option>
                    <option value="in_progress">قيد المعالجة</option>
                    <option value="resolved">تم الحل</option>
                </select>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>المرسل</th>
                            <th>الموضوع</th>
                            <th>الرسالة</th>
                            <th>الحالة</th>
                            <th>التاريخ</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.data.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: '#6B7A99', padding: '20px' }}>
                                    لا توجد رسائل
                                </td>
                            </tr>
                        ) : (
                            messages.data.map((message) => (
                                <tr key={message.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#fff' }}>{message.name}</div>
                                        <div style={{ fontSize: 12, color: '#6B7A99', direction: 'ltr', textAlign: 'right' }}>{message.email}</div>
                                    </td>
                                    <td style={{ color: '#C8D0E0', fontSize: 13 }}>{message.subject ?? '—'}</td>
                                    <td style={{ color: '#C8D0E0', fontSize: 13, maxWidth: 280 }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{message.message}</div>
                                    </td>
                                    <td><StatusBadge status={message.status} /></td>
                                    <td style={{ fontSize: 12, color: '#6B7A99' }}>{fmtDate(message.created_at)}</td>
                                    <td>
                                        <button onClick={() => setDetail(message)} className="act-btn btn-view">عرض</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={messages.links} />

            {/* Detail Modal */}
            {detail && (
                <div className="detail-overlay open" onClick={() => setDetail(null)}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            رسالة من {detail.name}
                            <StatusBadge status={detail.status} />
                        </h3>

                        <div style={{ display: 'grid', gap: 10, marginTop: 16, fontSize: 13 }}>
                            <div><span style={{ color: '#6B7A99' }}>البريد: </span><span style={{ direction: 'ltr', unicodeBidi: 'embed', color: '#C8D0E0' }}>{detail.email}</span></div>
                            {detail.phone && <div><span style={{ color: '#6B7A99' }}>الجوال: </span><span style={{ direction: 'ltr', unicodeBidi: 'embed', color: '#C8D0E0' }}>{detail.phone}</span></div>}
                            {detail.subject && <div><span style={{ color: '#6B7A99' }}>الموضوع: </span><span style={{ color: '#C8D0E0' }}>{detail.subject}</span></div>}
                            <div><span style={{ color: '#6B7A99' }}>التاريخ: </span><span style={{ color: '#C8D0E0' }}>{fmtDate(detail.created_at)}</span></div>
                        </div>

                        <div style={{ marginTop: 16, padding: 14, background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 14, color: '#E8EAF0', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
                            {detail.message}
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
                            {detail.status !== 'in_progress' && (
                                <button onClick={() => setStatus(detail, 'in_progress')} className="act-btn btn-view">قيد المعالجة</button>
                            )}
                            {detail.status !== 'resolved' && (
                                <button onClick={() => setStatus(detail, 'resolved')} className="act-btn btn-approve">تم الحل</button>
                            )}
                            {detail.status !== 'new' && (
                                <button onClick={() => setStatus(detail, 'new')} className="act-btn btn-view">إعادة فتح</button>
                            )}
                            <a href={`mailto:${detail.email}`} className="act-btn btn-view" style={{ textDecoration: 'none' }}>رد بالبريد</a>
                            <button onClick={() => remove(detail)} className="act-btn btn-reject">حذف</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
