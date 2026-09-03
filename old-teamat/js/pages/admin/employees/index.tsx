import PageHeader from '@/components/page-header';
import AdminLayout from '@/layouts/admin-layout';
import StatusBadge from '@/components/status-badge';
import Pagination from '@/components/pagination';
import ListStates from '@/components/list-states';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import { fmtDateTime } from '@/lib/utils';
import type { Employee, Company, PaginatedResult } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import ConfirmModal from '@/components/confirm-modal';
import { useState, useEffect } from 'react';
import toastr from 'toastr';

interface Department {
    id: number;
    name: string;
    company_id: number;
}

interface Props {
    employees: PaginatedResult<Employee>;
    companies: Company[];
    departments: Department[];
    totalEmployees: number;
    filters: {
        search?: string;
        company_id?: string;
        sort?: string;
        dir?: string;
    };
    sort: SortState;
}

export default function EmployeesIndex({ employees, companies, departments, totalEmployees, filters, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        company_id: filters?.company_id,
        sort: filters?.sort,
        dir: filters?.dir,
    });
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Employee | null>(null);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        company_id: '',
        department_id: '',
        status: 'active',
    });

    const filteredDepartments = departments.filter((d) => String(d.company_id) === form.data.company_id);

    useEffect(() => {
        if (editingItem) {
            form.setData({
                name: editingItem.name ?? '',
                email: editingItem.email ?? '',
                password: '',
                company_id: String(editingItem.company_id ?? ''),
                department_id: String(editingItem.department_id ?? ''),
                status: editingItem.status ?? 'active',
            });
        } else {
            form.reset();
        }
    }, [editingItem]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editingItem) {
            form.put(`/admin/employees/${editingItem.id}`, {
                onSuccess: () => { setEditingItem(null); toastr.success('تم التحديث بنجاح.'); },
            });
        } else {
            form.post('/admin/employees', {
                onSuccess: () => { setShowCreate(false); form.reset(); toastr.success('تم الإنشاء بنجاح.'); },
            });
        }
    }

    const [resetTarget, setResetTarget] = useState<{ id: number; email: string } | null>(null);

    function confirmResetPassword() {
        if (!resetTarget) return;
        const email = resetTarget.email;
        router.post(`/admin/employees/${resetTarget.id}/reset-password`, {}, { preserveScroll: true, onSuccess: () => toastr.success(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`) });
        setResetTarget(null);
    }

    function handleCompanyFilter(value: string) {
        router.get('/admin/employees', {
            search: filters?.search || undefined,
            company_id: value || undefined,
            sort: filters?.sort || undefined,
            dir: filters?.dir || undefined,
        }, { preserveState: true, replace: true });
    }

    return (
        <AdminLayout>
            <Head title="الموظفون" />

            <PageHeader
                title={<>الموظفون</>}
                subtitle={<>
                {totalEmployees.toLocaleString()} موظف مسجّل على المنصة
                </>}
                actions={<>
                <button onClick={() => setShowCreate(true)} className="inline-flex items-center justify-center h-9 px-4 rounded-full text-xs font-bold bg-[#0A0A0A] text-[#C8FF00] border-[0.5px] border-[#0A0A0A] hover:bg-[#0A0A0A]/90 transition-colors cursor-pointer">
                    إضافة موظف
                </button>
                </>}
            />

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث باسم الموظف أو البريد..."
                    style={{ flex: 1, minWidth: '200px', padding: '10px 14px', background: '#FFFFFF', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: '10px', fontSize: '13px', color: '#0A0A0A', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                />
                <select
                    value={filters?.company_id ?? ''}
                    onChange={(e) => handleCompanyFilter(e.target.value)}
                    style={{ padding: '10px 14px', background: '#FFFFFF', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: '10px', fontSize: '13px', color: '#0A0A0A', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                >
                    <option value="">كل الشركات</option>
                    {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <SortableHeader label="الموظف" sortKey="name" sort={sort} />
                            <th>الشركة</th>
                            <SortableHeader label="المجتمعات" sortKey="communities_count" sort={sort} initialDirection="desc" />
                            <SortableHeader label="الفعاليات" sortKey="events_count" sort={sort} initialDirection="desc" />
                            <SortableHeader label="تاريخ التسجيل" sortKey="created_at" sort={sort} initialDirection="desc" />
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        <ListStates
                            count={employees.data.length}
                            columns={7}
                            emptyTitle="لا يوجد موظفون"
                            emptyHint="لا موظف مطابق للبحث والفلاتر الحالية."
                        />
                        {employees.data.map((emp) => (
                            <tr key={emp.id}>
                                <td>
                                    <div style={{ fontWeight: 700, color: '#0A0A0A' }}>{emp.name ?? '-'}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(10,10,10,.55)' }}>{emp.email ?? '-'}</div>
                                </td>
                                <td style={{ color: '#0A0A0A' }}>{emp.company?.name ?? '-'}</td>
                                <td>{emp.communities_count ?? 0}</td>
                                <td style={{
                                    color: (emp.events_count ?? 0) > 0 ? '#2E7D32' : 'rgba(10,10,10,.55)',
                                    fontWeight: 700,
                                }}>
                                    {emp.events_count ?? 0}
                                </td>
                                <td style={{ fontSize: '12px', color: 'rgba(10,10,10,.55)' }}>{fmtDateTime(emp.created_at)}</td>
                                <td>
                                    <StatusBadge status={emp.status} />
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={() => setEditingItem(emp)}
                                            className="act-btn btn-view"
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            className="act-btn"
                                            style={{ background: '#0A0A0A', color: '#C8FF00', borderColor: '#0A0A0A' }}
                                            onClick={() => setResetTarget({ id: emp.id, email: emp.email })}
                                        >
                                            إعادة كلمة المرور
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination links={employees.links} />

            {/* Create/Edit Modal */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل موظف' : 'إضافة موظف'}
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
                                    <label>اسم الموظف *</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="الاسم الكامل"
                                        required
                                    />
                                </div>
                                <div className="fg">
                                    <label>الشركة *</label>
                                    <select
                                        value={form.data.company_id}
                                        onChange={(e) => form.setData('company_id', e.target.value)}
                                        required
                                    >
                                        <option value="">اختر الشركة</option>
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <label>البريد الإلكتروني *</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="employee@company.sa"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                                <div className="fg">
                                    <label>القسم</label>
                                    <select
                                        value={form.data.department_id}
                                        onChange={(e) => form.setData('department_id', e.target.value)}
                                    >
                                        <option value="">بدون قسم</option>
                                        {filteredDepartments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
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
        </AdminLayout>
    );
}
