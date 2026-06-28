import BusinessLayout from '@/layouts/business-layout';
import type { Business } from '@/types/models';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';

interface Role {
    value: string;
    label: string;
}

interface StaffMember {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
}

interface Props {
    business: Business;
    staff: StaffMember[];
    roles: Role[];
}

export default function StaffIndex({ business, staff, roles }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'receptionist',
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'receptionist',
        status: 'active',
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/business/staff', {
            onSuccess: () => {
                createForm.reset();
                setShowForm(false);
                toastr.success('تم إضافة الموظف بنجاح.');
            },
        });
    }

    function startEdit(member: StaffMember) {
        setEditingId(member.id);
        editForm.setData({
            name: member.name,
            email: member.email,
            password: '',
            role: member.role,
            status: member.status,
        });
    }

    function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!editingId) return;
        editForm.put(`/business/staff/${editingId}`, {
            onSuccess: () => {
                setEditingId(null);
                toastr.success('تم تحديث بيانات الموظف.');
            },
        });
    }

    function handleDelete(id: number) {
        if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
        router.delete(`/business/staff/${id}`, {
            onSuccess: () => toastr.success('تم حذف الموظف.'),
        });
    }

    function roleLabelAr(role: string): string {
        const found = roles.find(r => r.value === role);
        return found?.label ?? role;
    }

    return (
        <BusinessLayout>
            <Head title="الموظفون" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 className="page-title" style={{ margin: 0 }}>الموظفون</h1>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); }}
                    className={showForm ? 'btn btn-outline' : 'ac-btn'}
                >
                    {showForm ? 'إلغاء' : '+ إضافة موظف'}
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0A0A0A', marginBottom: 14 }}>إضافة موظف جديد</div>
                    <form onSubmit={handleCreate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div className="fg">
                                <label>الاسم</label>
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={e => createForm.setData('name', e.target.value)}
                                    placeholder="اسم الموظف"
                                />
                                {createForm.errors.name && <div className="field-error">{createForm.errors.name}</div>}
                            </div>
                            <div className="fg">
                                <label>البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={e => createForm.setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                    dir="ltr"
                                />
                                {createForm.errors.email && <div className="field-error">{createForm.errors.email}</div>}
                            </div>
                            <div className="fg">
                                <label>كلمة المرور</label>
                                <input
                                    type="password"
                                    value={createForm.data.password}
                                    onChange={e => createForm.setData('password', e.target.value)}
                                    placeholder="كلمة المرور"
                                    dir="ltr"
                                />
                                {createForm.errors.password && <div className="field-error">{createForm.errors.password}</div>}
                            </div>
                            <div className="fg">
                                <label>الدور</label>
                                <select
                                    value={createForm.data.role}
                                    onChange={e => createForm.setData('role', e.target.value)}
                                >
                                    {roles.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                                {createForm.errors.role && <div className="field-error">{createForm.errors.role}</div>}
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={createForm.processing}
                            className="ac-btn"
                            style={{ opacity: createForm.processing ? 0.6 : 1 }}
                        >
                            {createForm.processing ? 'جاري الإضافة...' : 'إضافة'}
                        </button>
                    </form>
                </div>
            )}

            {/* Staff List */}
            {staff.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                    <div style={{ fontSize: 14 }}>لم تتم إضافة أي موظفين بعد</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>أضف موظفي الاستقبال ليتمكنوا من إدارة الحجوزات</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {staff.map(member => (
                        <div key={member.id} className="card" style={{ padding: 16 }}>
                            {editingId === member.id ? (
                                <form onSubmit={handleUpdate}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                        <div className="fg">
                                            <label>الاسم</label>
                                            <input
                                                type="text"
                                                value={editForm.data.name}
                                                onChange={e => editForm.setData('name', e.target.value)}
                                            />
                                            {editForm.errors.name && <div className="field-error">{editForm.errors.name}</div>}
                                        </div>
                                        <div className="fg">
                                            <label>البريد الإلكتروني</label>
                                            <input
                                                type="email"
                                                value={editForm.data.email}
                                                onChange={e => editForm.setData('email', e.target.value)}
                                                dir="ltr"
                                            />
                                            {editForm.errors.email && <div className="field-error">{editForm.errors.email}</div>}
                                        </div>
                                        <div className="fg">
                                            <label>كلمة المرور الجديدة (اختياري)</label>
                                            <input
                                                type="password"
                                                value={editForm.data.password}
                                                onChange={e => editForm.setData('password', e.target.value)}
                                                placeholder="اتركه فارغاً للإبقاء على كلمة المرور الحالية"
                                                dir="ltr"
                                            />
                                            {editForm.errors.password && <div className="field-error">{editForm.errors.password}</div>}
                                        </div>
                                        <div className="fg">
                                            <label>الدور</label>
                                            <select
                                                value={editForm.data.role}
                                                onChange={e => editForm.setData('role', e.target.value)}
                                            >
                                                {roles.map(role => (
                                                    <option key={role.value} value={role.value}>{role.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="fg">
                                            <label>الحالة</label>
                                            <select
                                                value={editForm.data.status}
                                                onChange={e => editForm.setData('status', e.target.value)}
                                            >
                                                <option value="active">نشط</option>
                                                <option value="inactive">غير نشط</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            type="submit"
                                            disabled={editForm.processing}
                                            className="ac-btn"
                                            style={{ padding: '6px 16px', fontSize: 12, opacity: editForm.processing ? 0.6 : 1 }}
                                        >
                                            حفظ
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingId(null)}
                                            className="btn btn-outline"
                                            style={{ padding: '6px 16px', fontSize: 12 }}
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0A0A0A' }}>{member.name}</div>
                                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }} dir="ltr">{member.email}</div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                            <span className="badge" style={{
                                                background: '#FAFAFA', color: '#666',
                                            }}>
                                                {roleLabelAr(member.role)}
                                            </span>
                                            <span className="badge" style={{
                                                background: member.status === 'active' ? '#18A86B18' : '#EF444418',
                                                color: member.status === 'active' ? '#18A86B' : '#EF4444',
                                            }}>
                                                {member.status === 'active' ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                            onClick={() => startEdit(member)}
                                            className="btn btn-outline"
                                            style={{ padding: '6px 14px', fontSize: 12 }}
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="btn btn-danger"
                                            style={{ padding: '6px 14px', fontSize: 12 }}
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </BusinessLayout>
    );
}
