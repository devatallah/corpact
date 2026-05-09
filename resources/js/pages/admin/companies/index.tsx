import AdminLayout from '@/layouts/admin-layout';
import FilterTabs from '@/components/filter-tabs';
import StatusBadge from '@/components/status-badge';
import Pagination from '@/components/pagination';
import { fmtDate } from '@/lib/utils';
import type { Company, PaginatedResult } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import ConfirmModal from '@/components/confirm-modal';
import toastr from 'toastr';
import { useState, useEffect } from 'react';

interface Props {
    companies: PaginatedResult<Company>;
    stats: { active: number; pending: number; review: number };
    filters: { status?: string; search?: string };
}

const filterOptions = [
    { label: 'الكل', value: '' },
    { label: 'معلق', value: 'pending' },
    { label: 'نشط', value: 'active' },
    { label: 'مرفوض', value: 'rejected' },
];

export default function CompaniesIndex({ companies, stats, filters }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', { status: filters?.status });
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Company | null>(null);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        domain: '',
        sector: '',
        hr_name: '',
        hr_phone: '',
        city: '',
        status: 'pending',
    });

    useEffect(() => {
        if (editingItem) {
            form.setData({
                name: editingItem.name ?? '',
                email: editingItem.email ?? '',
                password: '',
                domain: editingItem.domain ?? '',
                sector: editingItem.sector ?? '',
                hr_name: editingItem.hr_name ?? '',
                hr_phone: editingItem.hr_phone ?? '',
                city: editingItem.city ?? '',
                status: editingItem.status ?? 'pending',
            });
        } else {
            form.reset();
        }
    }, [editingItem]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editingItem) {
            form.put(`/admin/companies/${editingItem.id}`, {
                onSuccess: () => { setEditingItem(null); toastr.success('تم تحديث الشركة بنجاح.'); },
            });
        } else {
            form.post('/admin/companies', {
                onSuccess: () => { setShowCreate(false); form.reset(); toastr.success('تم إنشاء الشركة بنجاح.'); },
            });
        }
    }

    function approve(id: number) {
        router.post(`/admin/companies/${id}/approve`, {}, { preserveScroll: true, onSuccess: () => toastr.success('تمت الموافقة على الشركة بنجاح.') });
    }

    function reject(id: number) {
        router.post(`/admin/companies/${id}/reject`, {}, { preserveScroll: true, onSuccess: () => toastr.success('تم رفض طلب الشركة.') });
    }

    const [resetTarget, setResetTarget] = useState<{ id: number; email: string } | null>(null);

    function confirmResetPassword() {
        if (!resetTarget) return;
        const email = resetTarget.email;
        router.post(`/admin/companies/${resetTarget.id}/reset-password`, {}, {
            preserveScroll: true,
            onSuccess: () => toastr.success(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`),
        });
        setResetTarget(null);
    }

    return (
        <AdminLayout>
            <Head title="إدارة الشركات" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div className="page-title">إدارة الشركات</div>
                <button onClick={() => setShowCreate(true)} className="act-btn btn-approve">
                    إضافة شركة
                </button>
            </div>
            <div className="page-sub">
                {stats.active} شركة مفعّلة · {stats.pending + stats.review} طلبات معلقة
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث بالاسم..."
                    style={{ padding: '9px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 200 }}
                />
                <FilterTabs options={filterOptions} current={filters?.status ?? ''} />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الشركة</th>
                            <th>القطاع</th>
                            <th>الموظفون</th>
                            <th>المسؤول</th>
                            <th>تاريخ الطلب</th>
                            <th>الحالة</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', color: '#6B7A99', padding: '20px' }}>
                                    لا توجد شركات
                                </td>
                            </tr>
                        ) : (
                            companies.data.map((company) => (
                                <tr key={company.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#fff' }}>{company.name}</div>
                                        <div style={{ fontSize: '10px', color: '#6B7A99' }}>{company.domain}</div>
                                    </td>
                                    <td style={{ color: '#C8D0E0' }}>{company.sector}</td>
                                    <td>{company.employee_count}</td>
                                    <td>
                                        <div style={{ fontSize: '12px' }}>{company.hr_name ?? '-'}</div>
                                        <div style={{ fontSize: '10px', color: '#6B7A99' }}>{company.email ?? '-'}</div>
                                    </td>
                                    <td style={{ fontSize: '12px', color: '#6B7A99' }}>
                                        {company.status === 'active'
                                            ? fmtDate(company.approved_at)
                                            : fmtDate(company.created_at)}
                                    </td>
                                    <td>
                                        <StatusBadge status={company.status} />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {['pending', 'review'].includes(company.status) && (
                                                <>
                                                    <button
                                                        className="act-btn btn-approve"
                                                        onClick={() => approve(company.id)}
                                                    >
                                                        قبول
                                                    </button>
                                                    <button
                                                        className="act-btn btn-reject"
                                                        onClick={() => reject(company.id)}
                                                    >
                                                        رفض
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setEditingItem(company)}
                                                className="act-btn btn-view"
                                            >
                                                تعديل
                                            </button>
                                            {company.status === 'active' && (
                                                <button
                                                    className="act-btn"
                                                    style={{ background: '#2A1F3D', color: '#A78BFA', borderColor: '#3B2D5A' }}
                                                    onClick={() => setResetTarget({ id: company.id, email: company.email })}
                                                >
                                                    إعادة كلمة المرور
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={companies.links} />

            {/* Create/Edit Modal */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل شركة' : 'إضافة شركة'}
                            <button className="close-btn" onClick={() => { setShowCreate(false); setEditingItem(null); }}>×</button>
                        </h3>

                        {Object.keys(form.errors).length > 0 && (
                            <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                                {Object.values(form.errors).map((error, i) => (
                                    <p key={i} style={{ fontSize: '12px', color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="frow">
                                <div className="fg">
                                    <label>اسم الشركة *</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="مثال: شركة التقنية المتقدمة"
                                        required
                                    />
                                </div>
                                <div className="fg">
                                    <label>البريد الإلكتروني *</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="info@company.sa"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <label>النطاق *</label>
                                    <input
                                        type="text"
                                        value={form.data.domain}
                                        onChange={(e) => form.setData('domain', e.target.value)}
                                        placeholder="company.sa"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                                {!editingItem ? (
                                    <div className="fg">
                                        <label>كلمة المرور *</label>
                                        <input
                                            type="password"
                                            value={form.data.password}
                                            onChange={(e) => form.setData('password', e.target.value)}
                                            placeholder="••••••"
                                            dir="ltr"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="fg" />
                                )}
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <label>القطاع *</label>
                                    <input
                                        type="text"
                                        value={form.data.sector}
                                        onChange={(e) => form.setData('sector', e.target.value)}
                                        placeholder="تقنية المعلومات"
                                        required
                                    />
                                </div>
                                <div className="fg">
                                    <label>المدينة *</label>
                                    <input
                                        type="text"
                                        value={form.data.city}
                                        onChange={(e) => form.setData('city', e.target.value)}
                                        placeholder="الرياض"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <label>المسؤول</label>
                                    <input
                                        type="text"
                                        value={form.data.hr_name}
                                        onChange={(e) => form.setData('hr_name', e.target.value)}
                                        placeholder="اسم مسؤول الموارد البشرية"
                                    />
                                </div>
                                <div className="fg">
                                    <label>هاتف المسؤول</label>
                                    <input
                                        type="text"
                                        value={form.data.hr_phone}
                                        onChange={(e) => form.setData('hr_phone', e.target.value)}
                                        placeholder="05xxxxxxxx"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="frow">
                                {editingItem ? (
                                    <div className="fg">
                                        <label>الحالة</label>
                                        <select
                                            value={form.data.status}
                                            onChange={(e) => form.setData('status', e.target.value)}
                                        >
                                            <option value="pending">معلق</option>
                                            <option value="review">قيد المراجعة</option>
                                            <option value="active">نشط</option>
                                            <option value="rejected">مرفوض</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="fg" />
                                )}
                            </div>

                            <div className="panel-actions">
                                <button type="submit" className="pa-approve" disabled={form.processing}>حفظ</button>
                                <button type="button" className="pa-reject" onClick={() => { setShowCreate(false); setEditingItem(null); }}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={!!resetTarget}
                title="إعادة تعيين كلمة المرور"
                message={`سيتم إرسال رابط إعادة تعيين كلمة المرور إلى ${resetTarget?.email ?? ''}. هل تريد المتابعة؟`}
                confirmLabel="إرسال"
                onConfirm={confirmResetPassword}
                onCancel={() => setResetTarget(null)}
            />
        </AdminLayout>
    );
}
