import AdminLayout from '@/layouts/admin-layout';
import FilterTabs from '@/components/filter-tabs';
import CategoryIcon from '@/components/category-icon';
import StatusBadge from '@/components/status-badge';
import Pagination from '@/components/pagination';
import { fmtDate } from '@/lib/utils';
import type { Business, Category, PaginatedResult } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import ConfirmModal from '@/components/confirm-modal';
import { useState, useEffect } from 'react';
import toastr from 'toastr';

interface Props {
    businesses: PaginatedResult<Business>;
    stats: { active: number; pending: number };
    filters: { status?: string; search?: string };
    categories?: Category[];
}

const filterOptions = [
    { label: 'الكل', value: '' },
    { label: 'معلق', value: 'pending' },
    { label: 'نشط', value: 'active' },
    { label: 'مرفوض', value: 'rejected' },
];

export default function businessesIndex({ businesses, stats, filters, categories }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', { status: filters?.status });
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Business | null>(null);

    const form = useForm<{
        name: string; email: string; password: string; city: string; district: string;
        contact_phone: string; commission_rate: string; status: string;
        category_ids: number[];
    }>({
        name: '',
        email: '',
        password: '',
        city: '',
        district: '',
        contact_phone: '',
        commission_rate: '15',
        status: 'pending',
        category_ids: [],
    });

    useEffect(() => {
        if (editingItem) {
            form.setData({
                name: editingItem.name ?? '',
                email: editingItem.email ?? '',
                password: '',
                city: editingItem.city ?? '',
                district: editingItem.district ?? '',
                contact_phone: editingItem.contact_phone ?? '',
                commission_rate: String(editingItem.commission_rate ?? 15),
                status: editingItem.status ?? 'pending',
                category_ids: editingItem.categories?.map((s) => s.id) ?? [],
            });
        } else {
            form.reset();
        }
    }, [editingItem]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editingItem) {
            form.put(`/admin/businesses/${editingItem.id}`, {
                onSuccess: () => { setEditingItem(null); toastr.success('تم التحديث بنجاح.'); },
            });
        } else {
            form.post('/admin/businesses', {
                onSuccess: () => { setShowCreate(false); form.reset(); toastr.success('تم الإنشاء بنجاح.'); },
            });
        }
    }

    function reject(id: number) {
        router.post(`/admin/businesses/${id}/reject`, {}, { preserveScroll: true, onSuccess: () => toastr.success('تم الرفض بنجاح.') });
    }

    const [approveTarget, setApproveTarget] = useState<{ id: number; name: string; commission_rate: string } | null>(null);
    const [approveCommission, setApproveCommission] = useState('10');

    function confirmApprove() {
        if (!approveTarget) return;
        router.post(`/admin/businesses/${approveTarget.id}/approve`, { commission_rate: approveCommission }, { preserveScroll: true, onSuccess: () => toastr.success('تمت الموافقة بنجاح.') });
        setApproveTarget(null);
    }

    const [resetTarget, setResetTarget] = useState<{ id: number; email: string } | null>(null);

    function confirmResetPassword() {
        if (!resetTarget) return;
        const email = resetTarget.email;
        router.post(`/admin/businesses/${resetTarget.id}/reset-password`, {}, { preserveScroll: true, onSuccess: () => toastr.success(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`) });
        setResetTarget(null);
    }

    return (
        <AdminLayout>
            <Head title="إدارة المنشآت" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div className="page-title">إدارة المنشآت</div>
                <button onClick={() => setShowCreate(true)} className="act-btn btn-approve">
                    إضافة منشأة
                </button>
            </div>
            <div className="page-sub">
                {stats.active} منشآت مفعّلة · {stats.pending} طلبات معلقة
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث بالاسم، المدينة، الفئة..."
                    style={{ padding: '9px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 200 }}
                />
                <FilterTabs options={filterOptions} current={filters?.status ?? ''} />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>المنشأة</th>
                            <th>المدينة</th>
                            <th>الفئات</th>
                            <th>المرافق</th>
                            <th>العمولة</th>
                            <th>مسؤول المنشأة</th>
                            <th>الحالة</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {businesses.data.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', color: '#6B7A99', padding: '20px' }}>
                                    لا توجد منشآت
                                </td>
                            </tr>
                        ) : (
                            businesses.data.map((business) => (
                                <tr key={business.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#fff' }}>{business.name}</div>
                                        <div style={{ fontSize: '10px', color: '#6B7A99' }}>
                                            {business.status === 'active' ? business.district : fmtDate(business.created_at)}
                                        </div>
                                    </td>
                                    <td style={{ color: '#C8D0E0' }}>{business.city}</td>
                                    <td>
                                        <span style={{ fontSize: '12px' }}>
                                            {business.categories && business.categories.length > 0
                                                ? business.categories.map((s, i) => (
                                                    <span key={s.id ?? i} style={{ whiteSpace: 'nowrap' }}>
                                                        {i > 0 && ' · '}
                                                        <CategoryIcon icon={s.icon} size={14} /> {s.name}
                                                    </span>
                                                ))
                                                : '-'}
                                        </span>
                                    </td>
                                    <td>{business.venues_count ?? 0}</td>
                                    <td style={{ fontWeight: 700, color: '#F5A623' }}>{business.commission_rate ?? 10}%</td>
                                    <td>
                                        <div style={{ fontSize: '12px' }}>{business.email ?? '-'}</div>
                                        <div style={{ fontSize: '10px', color: '#6B7A99' }}>{business.contact_phone ?? '-'}</div>
                                    </td>
                                    <td>
                                        <StatusBadge status={business.status} />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {business.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="act-btn btn-approve"
                                                        onClick={() => { setApproveTarget({ id: business.id, name: business.name, commission_rate: String(business.commission_rate ?? 10) }); setApproveCommission(String(business.commission_rate ?? 10)); }}
                                                    >
                                                        قبول
                                                    </button>
                                                    <button
                                                        className="act-btn btn-reject"
                                                        onClick={() => reject(business.id)}
                                                    >
                                                        رفض
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setEditingItem(business)}
                                                className="act-btn btn-view"
                                            >
                                                تعديل
                                            </button>
                                            {business.status === 'active' && (
                                                <button
                                                    className="act-btn"
                                                    style={{ background: '#2A1F3D', color: '#A78BFA', borderColor: '#3B2D5A' }}
                                                    onClick={() => setResetTarget({ id: business.id, email: business.email })}
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

            <Pagination links={businesses.links} />

            {/* Create/Edit Modal */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل منشأة' : 'إضافة منشأة'}
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
                                    <label>اسم المنشأة *</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="مثال: منشأة الرياض"
                                        required
                                    />
                                </div>
                                <div className="fg">
                                    <label>نسبة العمولة (%) *</label>
                                    <input
                                        type="number"
                                        value={form.data.commission_rate}
                                        onChange={(e) => form.setData('commission_rate', e.target.value)}
                                        min={0}
                                        max={100}
                                        step={0.1}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <label>البريد الإلكتروني *</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="info@business.com"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                                <div className="fg" />
                            </div>

                            <div className="frow">
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
                                <div className="fg">
                                    <label>الحي *</label>
                                    <input
                                        type="text"
                                        value={form.data.district}
                                        onChange={(e) => form.setData('district', e.target.value)}
                                        placeholder="العليا"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <label>رقم الهاتف *</label>
                                    <input
                                        type="text"
                                        value={form.data.contact_phone}
                                        onChange={(e) => form.setData('contact_phone', e.target.value)}
                                        placeholder="05xxxxxxxx"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <label>الفئات *</label>
                                    {categories?.map((cat) => (
                                        <div key={cat.id} style={{ marginTop: '4px' }}>
                                            {cat.children && cat.children.length > 0 ? (
                                                <>
                                                    <div style={{ fontSize: 11, color: '#6B7A99', fontWeight: 700, marginBottom: 4, marginTop: 8 }}>{cat.name}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {cat.children.map((sub) => (
                                                            <label
                                                                key={sub.id}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                                    padding: '6px 12px', borderRadius: '8px',
                                                                    border: form.data.category_ids.includes(sub.id) ? '1px solid #009E82' : '1px solid #232A3E',
                                                                    background: form.data.category_ids.includes(sub.id) ? 'rgba(0,158,130,.15)' : 'transparent',
                                                                    cursor: 'pointer', fontSize: '13px',
                                                                }}
                                                            >
                                                                <input type="checkbox" checked={form.data.category_ids.includes(sub.id)} onChange={(e) => {
                                                                    if (e.target.checked) { form.setData('category_ids', [...form.data.category_ids, sub.id]); }
                                                                    else { form.setData('category_ids', form.data.category_ids.filter((id) => id !== sub.id)); }
                                                                }} style={{ display: 'none' }} />
                                                                <CategoryIcon icon={sub.icon} size={16} /> {sub.name}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    <label
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '6px',
                                                            padding: '6px 12px', borderRadius: '8px',
                                                            border: form.data.category_ids.includes(cat.id) ? '1px solid #009E82' : '1px solid #232A3E',
                                                            background: form.data.category_ids.includes(cat.id) ? 'rgba(0,158,130,.15)' : 'transparent',
                                                            cursor: 'pointer', fontSize: '13px',
                                                        }}
                                                    >
                                                        <input type="checkbox" checked={form.data.category_ids.includes(cat.id)} onChange={(e) => {
                                                            if (e.target.checked) { form.setData('category_ids', [...form.data.category_ids, cat.id]); }
                                                            else { form.setData('category_ids', form.data.category_ids.filter((id) => id !== cat.id)); }
                                                        }} style={{ display: 'none' }} />
                                                        <CategoryIcon icon={cat.icon} size={16} /> {cat.name}
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    ))}
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
                                            <option value="active">نشط</option>
                                            <option value="rejected">مرفوض</option>
                                            <option value="suspended">معلّق</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="fg" />
                                )}
                                <div className="fg" />
                            </div>

                            <div className="panel-actions">
                                <button type="submit" className="pa-approve" disabled={form.processing}>حفظ</button>
                                <button type="button" className="pa-reject" onClick={() => { setShowCreate(false); setEditingItem(null); }}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Approve with Commission Rate Modal */}
            {approveTarget && (
                <div className="detail-overlay open" onClick={() => setApproveTarget(null)}>
                    <div className="detail-panel" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
                        <h3>
                            الموافقة على المنشأة
                            <button className="close-btn" onClick={() => setApproveTarget(null)}>x</button>
                        </h3>
                        <div style={{ fontSize: 14, color: '#C8D0E0', marginBottom: 16 }}>
                            سيتم تفعيل منشأة <strong style={{ color: '#fff' }}>{approveTarget.name}</strong> وإرسال رابط التفعيل.
                        </div>
                        <div className="fg" style={{ marginBottom: 20 }}>
                            <label>نسبة العمولة (%) *</label>
                            <input
                                type="number"
                                value={approveCommission}
                                onChange={(e) => setApproveCommission(e.target.value)}
                                min={0}
                                max={100}
                                step={0.1}
                                required
                            />
                            <div style={{ fontSize: 11, color: '#6B7A99', marginTop: 4 }}>
                                النسبة التي تخصمها المنصة من كل حجز لهذه المنشأة
                            </div>
                        </div>
                        <div className="panel-actions">
                            <button className="pa-approve" onClick={confirmApprove}>تأكيد الموافقة</button>
                            <button className="pa-reject" onClick={() => setApproveTarget(null)}>إلغاء</button>
                        </div>
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
