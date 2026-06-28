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
                <h1 style={{ fontSize: 20, fontWeight: 900 }}>الموظفون</h1>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); }}
                    style={{
                        background: '#1C1410', color: '#fff', border: 'none', borderRadius: 10,
                        padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                >
                    {showForm ? 'إلغاء' : '+ إضافة موظف'}
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>إضافة موظف جديد</div>
                    <form onSubmit={handleCreate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>الاسم</label>
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={e => createForm.setData('name', e.target.value)}
                                    style={inputStyle}
                                    placeholder="اسم الموظف"
                                />
                                {createForm.errors.name && <div style={errorStyle}>{createForm.errors.name}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={e => createForm.setData('email', e.target.value)}
                                    style={inputStyle}
                                    placeholder="email@example.com"
                                    dir="ltr"
                                />
                                {createForm.errors.email && <div style={errorStyle}>{createForm.errors.email}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>كلمة المرور</label>
                                <input
                                    type="password"
                                    value={createForm.data.password}
                                    onChange={e => createForm.setData('password', e.target.value)}
                                    style={inputStyle}
                                    placeholder="كلمة المرور"
                                    dir="ltr"
                                />
                                {createForm.errors.password && <div style={errorStyle}>{createForm.errors.password}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>الدور</label>
                                <select
                                    value={createForm.data.role}
                                    onChange={e => createForm.setData('role', e.target.value)}
                                    style={inputStyle}
                                >
                                    {roles.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                                {createForm.errors.role && <div style={errorStyle}>{createForm.errors.role}</div>}
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={createForm.processing}
                            style={{
                                background: '#1A7A4A', color: '#fff', border: 'none', borderRadius: 10,
                                padding: '8px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                opacity: createForm.processing ? 0.6 : 1,
                            }}
                        >
                            {createForm.processing ? 'جاري الإضافة...' : 'إضافة'}
                        </button>
                    </form>
                </div>
            )}

            {/* Staff List */}
            {staff.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40, color: '#8A7868' }}>
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
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>الاسم</label>
                                            <input
                                                type="text"
                                                value={editForm.data.name}
                                                onChange={e => editForm.setData('name', e.target.value)}
                                                style={inputStyle}
                                            />
                                            {editForm.errors.name && <div style={errorStyle}>{editForm.errors.name}</div>}
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>البريد الإلكتروني</label>
                                            <input
                                                type="email"
                                                value={editForm.data.email}
                                                onChange={e => editForm.setData('email', e.target.value)}
                                                style={inputStyle}
                                                dir="ltr"
                                            />
                                            {editForm.errors.email && <div style={errorStyle}>{editForm.errors.email}</div>}
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>كلمة المرور الجديدة (اختياري)</label>
                                            <input
                                                type="password"
                                                value={editForm.data.password}
                                                onChange={e => editForm.setData('password', e.target.value)}
                                                style={inputStyle}
                                                placeholder="اتركه فارغاً للإبقاء على كلمة المرور الحالية"
                                                dir="ltr"
                                            />
                                            {editForm.errors.password && <div style={errorStyle}>{editForm.errors.password}</div>}
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>الدور</label>
                                            <select
                                                value={editForm.data.role}
                                                onChange={e => editForm.setData('role', e.target.value)}
                                                style={inputStyle}
                                            >
                                                {roles.map(role => (
                                                    <option key={role.value} value={role.value}>{role.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>الحالة</label>
                                            <select
                                                value={editForm.data.status}
                                                onChange={e => editForm.setData('status', e.target.value)}
                                                style={inputStyle}
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
                                            style={{
                                                background: '#1A7A4A', color: '#fff', border: 'none', borderRadius: 8,
                                                padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                                opacity: editForm.processing ? 0.6 : 1,
                                            }}
                                        >
                                            حفظ
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingId(null)}
                                            style={{
                                                background: '#E5E0DA', color: '#1C1410', border: 'none', borderRadius: 8,
                                                padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                            }}
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 800 }}>{member.name}</div>
                                        <div style={{ fontSize: 12, color: '#8A7868', marginTop: 2 }} dir="ltr">{member.email}</div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                            <span style={{
                                                background: '#F0EBE4', borderRadius: 6, padding: '2px 8px',
                                                fontSize: 11, fontWeight: 700, color: '#6B5B4F',
                                            }}>
                                                {roleLabelAr(member.role)}
                                            </span>
                                            <span style={{
                                                background: member.status === 'active' ? '#E8F5EC' : '#FEE2E2',
                                                borderRadius: 6, padding: '2px 8px',
                                                fontSize: 11, fontWeight: 700,
                                                color: member.status === 'active' ? '#166534' : '#991B1B',
                                            }}>
                                                {member.status === 'active' ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                            onClick={() => startEdit(member)}
                                            style={actionBtnStyle}
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            style={{ ...actionBtnStyle, background: '#FEE2E2', color: '#991B1B' }}
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

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #E0D8CF',
    borderRadius: 8,
    fontSize: 13,
    background: '#fff',
    boxSizing: 'border-box',
};

const errorStyle: React.CSSProperties = {
    color: '#C8410A',
    fontSize: 11,
    marginTop: 4,
};

const actionBtnStyle: React.CSSProperties = {
    background: '#F0EBE4',
    color: '#1C1410',
    border: 'none',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
};
