import CompanyLayout from '@/layouts/company-layout';
import Pagination from '@/components/pagination';
import StatusBadge from '@/components/status-badge';
import CategoryIcon from '@/components/category-icon';
import type { Department, Employee, PaginatedResult } from '@/types/models';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect, type FormEvent } from 'react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import toastr from 'toastr';

interface Props {
    employees: PaginatedResult<Employee>;
    departments: Department[];
    filters: { search?: string };
    activeCount: number;
    totalCount: number;
}

export default function EmployeesIndex({ employees, departments, filters, activeCount, totalCount }: Props) {
    const [showInvite, setShowInvite] = useState(false);
    const [editingItem, setEditingItem] = useState<Employee | null>(null);
    const inviteForm = useForm({ email: '' });
    const editForm = useForm({ name: '', email: '', password: '', phone: '', department_id: '', status: 'active' });
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '');

    useEffect(() => {
        if (editingItem) {
            editForm.setData({
                name: editingItem.name ?? '',
                email: editingItem.email ?? '',
                password: '',
                phone: editingItem.phone ?? '',
                department_id: String(editingItem.department_id ?? ''),
                status: editingItem.status ?? 'active',
            });
        }
    }, [editingItem]);

    function handleInvite(e: FormEvent) {
        e.preventDefault();
        inviteForm.post('/company/employees', {
            onSuccess: () => {
                inviteForm.reset();
                setShowInvite(false);
                toastr.success('تم إرسال الدعوة بنجاح');
            },
        });
    }

    function handleEdit(e: FormEvent) {
        e.preventDefault();
        if (!editingItem) return;
        editForm.put(`/company/employees/${editingItem.id}`, {
            onSuccess: () => {
                setEditingItem(null);
                toastr.success('تم تعديل بيانات الموظف بنجاح');
            },
        });
    }

    return (
        <CompanyLayout>
            <Head title="الموظفون" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <div className="page-title">الموظفون</div>
                    <div className="page-sub">{activeCount} نشط من {totalCount}</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="🔍 ابحث..."
                        style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #E2E8F4', fontSize: 13, background: '#fff', outline: 'none', direction: 'rtl', width: 180, fontFamily: 'inherit' }}
                    />
                    <button
                        onClick={() => setShowInvite(!showInvite)}
                        style={{ background: '#3B5BDB', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        + دعوة موظف
                    </button>
                </div>
            </div>

            {showInvite && (
                <div className="detail-overlay open" onClick={() => setShowInvite(false)}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            دعوة موظف جديد
                            <button className="close-btn" onClick={() => setShowInvite(false)}>×</button>
                        </h3>
                        <div style={{ fontSize: 13, color: '#7A8BA8', marginBottom: 16 }}>سيصله إيميل دعوة للانضمام للمنصة</div>
                        <form onSubmit={handleInvite}>
                            <div className="fg" style={{ marginBottom: 16 }}>
                                <label>البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    dir="ltr"
                                    placeholder="email@company.com"
                                    value={inviteForm.data.email}
                                    onChange={(e) => inviteForm.setData('email', e.target.value)}
                                />
                                {inviteForm.errors.email && <div className="field-error">{inviteForm.errors.email}</div>}
                            </div>
                            <div className="panel-actions">
                                <button type="submit" className="pa-approve" disabled={inviteForm.processing}>إرسال الدعوة</button>
                                <button type="button" className="pa-reject" onClick={() => setShowInvite(false)}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, overflow: 'auto' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الموظف</th>
                            <th>القسم</th>
                            <th>المجتمعات</th>
                            <th>الفعاليات</th>
                            <th>الحالة</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.data.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>
                                    لا يوجد موظفون بعد
                                </td>
                            </tr>
                        ) : (
                            employees.data.map((employee) => (
                                <tr key={employee.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3B5BDB18', color: '#3B5BDB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                                                {employee.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{employee.name}</div>
                                                <div style={{ fontSize: 11, color: '#7A8BA8' }} dir="ltr">{employee.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: '#7A8BA8', fontSize: 12 }}>
                                        {employee.department?.name ?? '\u2014'}
                                    </td>
                                    <td>
                                        {employee.communities && employee.communities.length > 0 ? (
                                            employee.communities.map((c) => (
                                                <span
                                                    key={c.id}
                                                    className="badge"
                                                    style={{ background: '#0CA67818', color: '#0CA678', marginLeft: 4 }}
                                                >
                                                    <CategoryIcon icon={c.category?.icon} size={14} /> {c.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span style={{ color: '#7A8BA8', fontSize: 12 }}>{'\u2014'}</span>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 700, ...(employee.events_count === 0 ? { color: '#7A8BA8' } : {}) }}>
                                        {employee.events_count ?? 0}
                                    </td>
                                    <td>
                                        <StatusBadge status={employee.status} />
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => setEditingItem(employee)}
                                            style={{ background: '#3B5BDB18', color: '#3B5BDB', border: '1px solid #3B5BDB33', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                        >
                                            تعديل
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={employees.links} />

            {editingItem && (
                <div className="detail-overlay open" onClick={() => setEditingItem(null)}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            تعديل الموظف
                            <button className="close-btn" onClick={() => setEditingItem(null)}>×</button>
                        </h3>
                        <form onSubmit={handleEdit}>
                            <div className="frow">
                                <div className="fg">
                                    <label>الاسم</label>
                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                    />
                                    {editForm.errors.name && <div className="field-error">{editForm.errors.name}</div>}
                                </div>
                                <div className="fg">
                                    <label>البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        dir="ltr"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                    />
                                    {editForm.errors.email && <div className="field-error">{editForm.errors.email}</div>}
                                </div>
                            </div>
                            <div className="frow">
                                <div className="fg">
                                    <label>كلمة المرور الجديدة</label>
                                    <input
                                        type="password"
                                        dir="ltr"
                                        placeholder="اتركه فارغاً للإبقاء على الحالية"
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                    />
                                    {editForm.errors.password && <div className="field-error">{editForm.errors.password}</div>}
                                </div>
                                <div className="fg">
                                    <label>رقم الجوال</label>
                                    <input
                                        type="text"
                                        dir="ltr"
                                        value={editForm.data.phone}
                                        onChange={(e) => editForm.setData('phone', e.target.value)}
                                    />
                                    {editForm.errors.phone && <div className="field-error">{editForm.errors.phone}</div>}
                                </div>
                            </div>
                            <div className="frow">
                                <div className="fg">
                                    <label>القسم</label>
                                    <select
                                        value={editForm.data.department_id}
                                        onChange={(e) => editForm.setData('department_id', e.target.value)}
                                    >
                                        <option value="">بدون قسم</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    {editForm.errors.department_id && <div className="field-error">{editForm.errors.department_id}</div>}
                                </div>
                                <div className="fg">
                                    <label>الحالة</label>
                                    <select
                                        value={editForm.data.status}
                                        onChange={(e) => editForm.setData('status', e.target.value)}
                                    >
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                    {editForm.errors.status && <div className="field-error">{editForm.errors.status}</div>}
                                </div>
                            </div>
                            <div className="panel-actions">
                                <button type="submit" className="pa-approve" disabled={editForm.processing}>حفظ</button>
                                <button type="button" className="pa-reject" onClick={() => setEditingItem(null)}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CompanyLayout>
    );
}
