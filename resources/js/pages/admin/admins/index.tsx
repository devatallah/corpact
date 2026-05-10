import AdminLayout from '@/layouts/admin-layout';
import StatusBadge from '@/components/status-badge';
import Pagination from '@/components/pagination';
import { fmtDateTime } from '@/lib/utils';
import type { PaginatedResult } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import ConfirmModal from '@/components/confirm-modal';
import { useState, useEffect } from 'react';
import toastr from 'toastr';

interface Admin {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    created_at: string;
}

interface Props {
    admins: PaginatedResult<Admin>;
    totalAdmins: number;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function AdminsIndex({ admins, totalAdmins, filters }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', { status: filters?.status });
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Admin | null>(null);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        status: 'active',
    });

    useEffect(() => {
        if (editingItem) {
            form.setData({
                name: editingItem.name ?? '',
                email: editingItem.email ?? '',
                password: '',
                phone: editingItem.phone ?? '',
                status: editingItem.status ?? 'active',
            });
        } else {
            form.reset();
        }
    }, [editingItem]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editingItem) {
            form.put(`/admin/admins/${editingItem.id}`, {
                onSuccess: () => { setEditingItem(null); toastr.success('تم التحديث بنجاح.'); },
            });
        } else {
            form.post('/admin/admins', {
                onSuccess: () => { setShowCreate(false); form.reset(); toastr.success('تم الإنشاء بنجاح.'); },
            });
        }
    }

    const [resetTarget, setResetTarget] = useState<{ id: number; email: string } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

    function confirmResetPassword() {
        if (!resetTarget) return;
        const email = resetTarget.email;
        router.post(`/admin/admins/${resetTarget.id}/reset-password`, {}, { preserveScroll: true, onSuccess: () => toastr.success(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`) });
        setResetTarget(null);
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/admin/admins/${deleteTarget.id}`, { preserveScroll: true, onSuccess: () => toastr.success('تم حذف المشرف بنجاح.'), onError: () => toastr.error('لا يمكنك حذف حسابك الحالي.') });
        setDeleteTarget(null);
    }

    return (
        <AdminLayout>
            <Head title="إدارة المشرفين" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div className="page-title">إدارة المشرفين</div>
                <button onClick={() => setShowCreate(true)} className="act-btn btn-approve">
                    إضافة مشرف
                </button>
            </div>
            <div className="page-sub">
                {totalAdmins.toLocaleString()} مشرف مسجّل على المنصة
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث باسم المشرف أو البريد..."
                    style={{ flex: 1, minWidth: '200px', padding: '10px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: '10px', fontSize: '13px', color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>المشرف</th>
                            <th>رقم الجوال</th>
                            <th>تاريخ التسجيل</th>
                            <th>الحالة</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.data.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', color: '#6B7A99', padding: '20px' }}>
                                    لا يوجد مشرفون
                                </td>
                            </tr>
                        ) : (
                            admins.data.map((admin) => (
                                <tr key={admin.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#fff' }}>{admin.name ?? '-'}</div>
                                        <div style={{ fontSize: '10px', color: '#6B7A99' }}>{admin.email ?? '-'}</div>
                                    </td>
                                    <td style={{ color: '#C8D0E0', direction: 'ltr', textAlign: 'right' }}>{admin.phone ?? '-'}</td>
                                    <td style={{ fontSize: '12px', color: '#6B7A99' }}>{fmtDateTime(admin.created_at)}</td>
                                    <td>
                                        <StatusBadge status={admin.status} />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => setEditingItem(admin)}
                                                className="act-btn btn-view"
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                className="act-btn"
                                                style={{ background: '#2A1F3D', color: '#A78BFA', borderColor: '#3B2D5A' }}
                                                onClick={() => setResetTarget({ id: admin.id, email: admin.email })}
                                            >
                                                إعادة كلمة المرور
                                            </button>
                                            <button
                                                className="act-btn btn-reject"
                                                onClick={() => setDeleteTarget({ id: admin.id, name: admin.name })}
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={admins.links} />

            {/* Create/Edit Modal */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل مشرف' : 'إضافة مشرف'}
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
                                    <label>اسم المشرف *</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="الاسم الكامل"
                                        required
                                    />
                                </div>
                                <div className="fg">
                                    <label>البريد الإلكتروني *</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="admin@teamat.com"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <label>{editingItem ? 'كلمة المرور (اتركها فارغة للإبقاء)' : 'كلمة المرور *'}</label>
                                    <input
                                        type="password"
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        placeholder="••••••"
                                        dir="ltr"
                                        {...(!editingItem && { required: true })}
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="fg">
                                    <label>رقم الجوال</label>
                                    <input
                                        type="text"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
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
                                            <option value="active">نشط</option>
                                            <option value="inactive">غير نشط</option>
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

            <ConfirmModal
                open={!!resetTarget}
                title="إعادة تعيين كلمة المرور"
                message={`سيتم إرسال رابط إعادة تعيين كلمة المرور إلى ${resetTarget?.email ?? ''}. هل تريد المتابعة؟`}
                confirmLabel="إرسال"
                onConfirm={confirmResetPassword}
                onCancel={() => setResetTarget(null)}
            />

            <ConfirmModal
                open={!!deleteTarget}
                title="حذف مشرف"
                message={`هل أنت متأكد من حذف المشرف "${deleteTarget?.name ?? ''}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                confirmLabel="حذف"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </AdminLayout>
    );
}
