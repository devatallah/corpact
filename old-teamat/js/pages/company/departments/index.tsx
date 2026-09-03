import PageHeader from '@/components/page-header';
import CompanyLayout from '@/layouts/company-layout';
import ConfirmModal from '@/components/confirm-modal';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import type { PaginatedResult } from '@/types/models';
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
    departments: PaginatedResult<Department>;
    filters: { search?: string; sort?: string; dir?: string };
    sort: SortState;
}

export default function DepartmentsIndex({ departments, filters, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        sort: filters?.sort,
        dir: filters?.dir,
    });
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

            <PageHeader
                title={<>إدارة الأقسام</>}
                subtitle={<>
                {departments.total} قسم مسجّل
                </>}
                actions={<>
                <button onClick={() => { setShowCreate(true); setEditingItem(null); form.reset(); }} className="inline-flex items-center justify-center h-9 px-4 rounded-full text-xs font-bold bg-[#0A0A0A] text-[#C8FF00] border-[0.5px] border-[#0A0A0A] hover:bg-[#0A0A0A]/90 transition-colors cursor-pointer">
                    إضافة قسم
                </button>
                </>}
            />

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث باسم القسم..."
                    style={{ flex: 1, minWidth: 200, padding: '9px 14px', background: '#fff', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 10, fontSize: 13, color: '#0A0A0A', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                />
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <SortableHeader label="اسم القسم" sortKey="name" sort={sort} />
                            <SortableHeader label="عدد الموظفين" sortKey="employees_count" sort={sort} initialDirection="desc" />
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        <ListStates
                            count={departments.data.length}
                            columns={3}
                            emptyTitle="لا توجد أقسام بعد"
                            emptyHint="أضف أول قسم لتوزيع الموظفين عليه في التقارير والمؤشرات."
                        />
                        {departments.data.map((dept) => (
                            <tr key={dept.id}>
                                <td style={{ fontWeight: 700 }}>{dept.name}</td>
                                <td>{dept.employees_count}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            onClick={() => { setEditingItem(dept); setShowCreate(false); }}
                                            className="act-btn btn-view"
                                        >
                                            تعديل
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination links={departments.links} />

            {/* Create/Edit Modal */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل قسم' : 'إضافة قسم'}
                            <button className="close-btn" onClick={() => { setShowCreate(false); setEditingItem(null); }}>×</button>
                        </h3>

                        {Object.keys(form.errors).length > 0 && (
                            <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                                {Object.values(form.errors).map((error, i) => (
                                    <p key={i} style={{ fontSize: '12px', color: '#D9381E', margin: '0 0 4px' }}>{error}</p>
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
                                        placeholder="مثال: التسويق"
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
                tone="danger"
                confirmLabel="حذف"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </CompanyLayout>
    );
}
