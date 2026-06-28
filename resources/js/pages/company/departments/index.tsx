import CompanyLayout from '@/layouts/company-layout';
import ConfirmModal from '@/components/confirm-modal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toastr from 'toastr';

interface Department {
    id: number;
    name: string;
    employees_count: number;
    created_at: string;
}

interface Props {
    departments: Department[];
}

export default function DepartmentsIndex({ departments }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Department | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

    const form = useForm({ name: '' });

    useEffect(() => {
        if (editingItem) {
            form.setData('name', editingItem.name ?? '');
        } else {
            form.reset();
        }
    }, [editingItem]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editingItem) {
            form.put(`/company/departments/${editingItem.id}`, {
                onSuccess: () => { setEditingItem(null); toastr.success('تم تحديث القسم بنجاح.'); },
            });
        } else {
            form.post('/company/departments', {
                onSuccess: () => { setShowCreate(false); form.reset(); toastr.success('تم إنشاء القسم بنجاح.'); },
            });
        }
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/company/departments/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => toastr.success('تم حذف القسم بنجاح.'),
        });
        setDeleteTarget(null);
    }

    return (
        <CompanyLayout>
            <Head title="الأقسام" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div className="page-title">إدارة الأقسام</div>
                <button onClick={() => { setShowCreate(true); setEditingItem(null); form.reset(); }} className="ac-btn">
                    إضافة قسم
                </button>
            </div>
            <div className="page-sub" style={{ marginBottom: 24 }}>
                {departments.length} قسم مسجّل
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                    <thead>
                        <tr>
                            <th>اسم القسم</th>
                            <th>عدد الموظفين</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                                    لا توجد أقسام بعد
                                </td>
                            </tr>
                        ) : (
                            departments.map((dept) => (
                                <tr key={dept.id}>
                                    <td style={{ fontWeight: 700 }}>{dept.name}</td>
                                    <td>{dept.employees_count}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button
                                                onClick={() => { setEditingItem(dept); setShowCreate(false); }}
                                                className="ac-btn secondary"
                                                style={{ fontSize: 12, padding: '5px 14px' }}
                                            >
                                                تعديل
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل قسم' : 'إضافة قسم'}
                            <button className="close-btn" onClick={() => { setShowCreate(false); setEditingItem(null); }}>×</button>
                        </h3>

                        {Object.keys(form.errors).length > 0 && (
                            <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                                {Object.values(form.errors).map((error, i) => (
                                    <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="frow">
                                <div className="fg">
                                    <label>اسم القسم *</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="مثال: الموارد البشرية"
                                        required
                                    />
                                </div>
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
                open={!!deleteTarget}
                title="حذف قسم"
                message={`هل أنت متأكد من حذف القسم "${deleteTarget?.name ?? ''}"؟ سيتم إزالة القسم من جميع الموظفين المرتبطين.`}
                confirmLabel="حذف"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </CompanyLayout>
    );
}
