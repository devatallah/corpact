import ConfirmModal from '@/components/confirm-modal';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import StatCard from '@/components/stat-card';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AdminLayout from '@/layouts/admin-layout';
import { fmtDateTime } from '@/lib/utils';
import type { PaginatedResult } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';

/**
 * H §19 / G (أدمن تيمات §7): «مراجعة صلاحيات ربع سنوية **موثَّقة**».
 * الشاشة نفسها هي التوثيق: كل إسناد مرتفع في مكان واحد، وتسجيل المراجعة
 * يكتب صفاً في سجل التدقيق.
 */

interface AssignmentRow {
    id: number;
    user: { id: number; name: string; email: string; status: string } | null;
    role: string;
    role_label: string;
    scope_type: string;
    scope_id: number | null;
    scope_label: string;
    permissions: string[];
    granted_at: string | null;
}

interface ReviewRow {
    period: string;
    reviewed_at: string | null;
    reviewed_by: string | null;
    assignments_reviewed: number;
    notes: string | null;
}

interface Props {
    assignments: PaginatedResult<AssignmentRow>;
    filters: { search?: string; role?: string; scope_type?: string; sort?: string };
    roles: { value: string; label: string }[];
    currentPeriod: string;
    lastReview: ReviewRow | null;
    history: ReviewRow[];
    stats: { total: number; platform: number; reviewed_this_period: boolean };
}

const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    background: '#161B27',
    border: '1px solid #232A3E',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#E8EAF0',
    outline: 'none',
    direction: 'rtl',
    fontFamily: 'inherit',
};

export default function PermissionReview({ assignments, filters, roles, currentPeriod, lastReview, history, stats }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        role: filters?.role,
        scope_type: filters?.scope_type,
        sort: filters?.sort,
    });
    const [confirming, setConfirming] = useState(false);
    const [expanded, setExpanded] = useState<number | null>(null);

    const form = useForm({ notes: '' });

    function apply(patch: Record<string, string | undefined>) {
        router.get(
            '/admin/security/permission-review',
            {
                search: filters?.search || undefined,
                role: filters?.role || undefined,
                scope_type: filters?.scope_type || undefined,
                sort: filters?.sort || undefined,
                ...patch,
            },
            { preserveState: true, replace: true },
        );
    }

    function submitReview() {
        setConfirming(false);
        form.post('/admin/security/permission-review', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                toastr.success('سُجِّلت مراجعة الصلاحيات.');
            },
        });
    }

    return (
        <AdminLayout>
            <Head title="مراجعة الصلاحيات الربع سنوية" />

            <div className="page-title">مراجعة الصلاحيات الربع سنوية</div>
            <div className="page-sub">
                ضابط أمني إلزامي — الفترة الحالية {currentPeriod}
                {stats.reviewed_this_period ? ' · مُراجَعة ✅' : ' · لم تُراجَع بعد ⚠️'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, margin: '16px 0' }}>
                <StatCard emoji="🧑‍⚖️" label="إسنادات قابلة للمراجعة" value={stats.total.toLocaleString()} />
                <StatCard emoji="🛡️" label="إسنادات على نطاق المنصة" value={stats.platform.toLocaleString()} />
                <StatCard
                    emoji="🗓️"
                    label="آخر مراجعة"
                    value={lastReview ? lastReview.period : '—'}
                    change={lastReview?.reviewed_by ? `بواسطة ${lastReview.reviewed_by}` : undefined}
                    color={stats.reviewed_this_period ? '#009E82' : '#F5A623'}
                />
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ marginTop: 0 }}>تسجيل مراجعة الفترة {currentPeriod}</h3>
                <p style={{ fontSize: 12, color: '#9CA3BC', lineHeight: 1.9 }}>
                    راجع القائمة أدناه إسناداً إسناداً: من غادر، ومن تغيّر دوره، ومن لم يعد يحتاج نطاقه. اكتب خلاصة ما راجعته —
                    تُحفظ في سجل التدقيق ولا تُحذف.
                </p>
                <div className="fg">
                    <label>خلاصة المراجعة *</label>
                    <textarea
                        value={form.data.notes}
                        onChange={(e) => form.setData('notes', e.target.value)}
                        rows={3}
                        placeholder="مثال: رُوجعت 24 إسناداً، سُحب دور مسؤول حساب من موظفَين غادرا، لا ملاحظات على أدوار المنصة."
                        style={{ ...inputStyle, width: '100%', resize: 'vertical' }}
                    />
                </div>
                {form.errors.notes && <p style={{ fontSize: 12, color: '#E03050' }}>{form.errors.notes}</p>}
                <button className="act-btn btn-approve" disabled={form.processing} onClick={() => setConfirming(true)}>
                    تسجيل المراجعة
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث باسم المستخدم أو بريده..."
                    style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
                />
                <select value={filters?.role ?? ''} onChange={(e) => apply({ role: e.target.value || undefined })} style={inputStyle}>
                    <option value="">كل الأدوار</option>
                    {roles.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                </select>
                <select value={filters?.scope_type ?? ''} onChange={(e) => apply({ scope_type: e.target.value || undefined })} style={inputStyle}>
                    <option value="">كل النطاقات</option>
                    <option value="platform">المنصة</option>
                    <option value="company">شركة</option>
                    <option value="community">مجتمع</option>
                    <option value="provider">مزوّد</option>
                </select>
                <button className="fbtn" onClick={() => apply({ sort: filters?.sort === 'asc' ? 'desc' : 'asc' })}>
                    الترتيب: {filters?.sort === 'asc' ? 'الأقدم منحاً' : 'الأحدث منحاً'}
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>المستخدم</th>
                                <th>الدور</th>
                                <th>النطاق</th>
                                <th>الحالة</th>
                                <th>مُنح في</th>
                                <th>الصلاحيات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ListStates
                                count={assignments.data.length}
                                columns={6}
                                emptyTitle="لا توجد إسنادات مطابقة"
                                emptyHint="لم يُسند أي دور مرتفع ضمن هذه الفلاتر."
                            />
                            {assignments.data.map((row) => (
                                <tr key={row.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#fff' }}>{row.user?.name ?? '—'}</div>
                                        <div style={{ fontSize: 10, color: '#6B7A99' }} dir="ltr">{row.user?.email ?? '—'}</div>
                                    </td>
                                    <td style={{ color: '#C8D0E0', fontWeight: 700 }}>{row.role_label}</td>
                                    <td style={{ fontSize: 12, color: '#9CA3BC' }}>{row.scope_label}</td>
                                    <td style={{ fontSize: 12, color: row.user?.status === 'active' ? '#009E82' : '#E03050' }}>
                                        {row.user?.status === 'active' ? 'نشط' : 'غير نشط'}
                                    </td>
                                    <td style={{ fontSize: 12, color: '#6B7A99' }}>{row.granted_at ? fmtDateTime(row.granted_at) : '—'}</td>
                                    <td>
                                        <button className="act-btn btn-view" onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                                            {expanded === row.id ? 'إخفاء' : `${row.permissions.length} صلاحية`}
                                        </button>
                                        {expanded === row.id && (
                                            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {row.permissions.map((permission) => (
                                                    <span
                                                        key={permission}
                                                        dir="ltr"
                                                        style={{ fontSize: 10, color: '#9CA3BC', background: '#12161F', border: '1px solid #232A3E', borderRadius: 6, padding: '2px 6px' }}
                                                    >
                                                        {permission}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={assignments.links} />

            {history.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 style={{ marginTop: 0 }}>سجل المراجعات السابقة</h3>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>الفترة</th>
                                <th>التاريخ</th>
                                <th>المراجِع</th>
                                <th>عدد الإسنادات</th>
                                <th>الخلاصة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((review) => (
                                <tr key={review.period}>
                                    <td style={{ fontWeight: 700, color: '#fff' }}>{review.period}</td>
                                    <td style={{ fontSize: 12, color: '#6B7A99' }}>{review.reviewed_at ? fmtDateTime(review.reviewed_at) : '—'}</td>
                                    <td style={{ fontSize: 12, color: '#C8D0E0' }}>{review.reviewed_by ?? '—'}</td>
                                    <td>{review.assignments_reviewed}</td>
                                    <td style={{ fontSize: 12, color: '#9CA3BC' }}>{review.notes ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmModal
                open={confirming}
                title={`تسجيل مراجعة الفترة ${currentPeriod}`}
                message={`ستُسجَّل مراجعة ${stats.total} إسناداً باسمك في سجل التدقيق، ولا يمكن تعديلها أو حذفها بعد الحفظ.`}
                confirmLabel="تسجيل"
                onConfirm={submitReview}
                onCancel={() => setConfirming(false)}
            />
        </AdminLayout>
    );
}
