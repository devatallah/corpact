import AdminLayout from '@/layouts/admin-layout';
import StatusBadge from '@/components/status-badge';
import Pagination from '@/components/pagination';
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
    };
}

export default function EmployeesIndex({ employees, companies, departments, totalEmployees, filters }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', { company_id: filters?.company_id });
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
        }, { preserveState: true, replace: true });
    }

    return (
        <AdminLayout>
            <Head title="الموظفون" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div className="page-title">الموظفون</div>
                <button onClick={() => setShowCreate(true)} className="act-btn btn-approve">
                    إضافة موظف
                </button>
            </div>
            <div className="page-sub">
                {totalEmployees.toLocaleString()} موظف مسجّل على المنصة
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث باسم الموظف أو البريد..."
                    style={{ flex: 1, minWidth: '200px', padding: '10px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: '10px', fontSize: '13px', color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                />
                <select
                    value={filters?.company_id ?? ''}
                    onChange={(e) => handleCompanyFilter(e.target.value)}
                    style={{ padding: '10px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: '10px', fontSize: '13px', color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                >
                    <option value="">كل الشركات</option>
                    {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الموظف</th>
                            <th>الشركة</th>
                            <th>المجتمعات</th>
                            <th>الفعاليات</th>
                            <th>تاريخ التسجيل</th>
                            <th>الحالة</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', color: '#6B7A99', padding: '20px' }}>
                                    لا يوجد موظفون
                                </td>
                            </tr>
                        ) : (
                            employees.data.map((emp) => (
                                <tr key={emp.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#fff' }}>{emp.name ?? '-'}</div>
                                        <div style={{ fontSize: '10px', color: '#6B7A99' }}>{emp.email ?? '-'}</div>
                                    </td>
                                    <td style={{ color: '#C8D0E0' }}>{emp.company?.name ?? '-'}</td>
                                    <td>{emp.communities_count ?? 0}</td>
                                    <td style={{
                                        color: (emp.events_count ?? 0) > 0 ? '#009E82' : '#6B7A99',
                                        fontWeight: 700,
                                    }}>
                                        {emp.events_count ?? 0}
                                    </td>
                                    <td style={{ fontSize: '12px', color: '#6B7A99' }}>{fmtDateTime(emp.created_at)}</td>
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
                                                style={{ background: '#2A1F3D', color: '#A78BFA', borderColor: '#3B2D5A' }}
                                                onClick={() => setResetTarget({ id: emp.id, email: emp.email })}
                                            >
                                                إعادة كلمة المرور
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
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
                                    <p key={i} style={{ fontSize: '12px', color: '#E03050', margin: '0 0 4px' }}>{error}</p>
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
