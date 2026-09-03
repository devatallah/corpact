import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';
import ConfirmModal from '@/components/confirm-modal';
import Pagination from '@/components/pagination';
import PasswordInput from '@/components/password-input';
import { SortBar, type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import PartnerLayout from '@/layouts/partner-layout';
import type { Partner, PaginatedResult } from '@/types/models';

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
    partner: Partner;
    staff: PaginatedResult<StaffMember>;
    roles: Role[];
    filters?: { search?: string; sort?: string; dir?: string };
    sort?: SortState;
}

const sortOptions = [
    { key: 'name', label: 'الاسم', initialDirection: 'asc' as const },
    { key: 'email', label: 'البريد', initialDirection: 'asc' as const },
    { key: 'role', label: 'الدور', initialDirection: 'asc' as const },
    { key: 'status', label: 'الحالة', initialDirection: 'asc' as const },
    { key: 'created_at', label: 'الأحدث', initialDirection: 'desc' as const },
];

export default function StaffIndex({ partner, staff, roles, filters, sort }: Props) {
    const members = staff?.data ?? [];
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        sort: filters?.sort,
        dir: filters?.dir,
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    // H §18: نافذة تأكيد موحّدة بدل نافذة المتصفح، والنص يصف أثر الحذف.
    const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);

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
        createForm.post('/partner/staff', {
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

        if (!editingId) {
return;
}

        editForm.put(`/partner/staff/${editingId}`, {
            onSuccess: () => {
                setEditingId(null);
                toastr.success('تم تحديث بيانات الموظف.');
            },
        });
    }

    function handleDelete(member: StaffMember) {
        setDeleteTarget(member);
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        const id = deleteTarget.id;
        setDeleteTarget(null);
        router.delete(`/partner/staff/${id}`, {
            onSuccess: () => toastr.success('تم حذف الموظف.'),
        });
    }

    function roleLabelAr(role: string): string {
        const found = roles.find(r => r.value === role);

        return found?.label ?? role;
    }

    return (
        <PartnerLayout>
            <Head title="الموظفون" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: 20, fontWeight: 900 }}>الموظفون</h1>
                <button
                    onClick={() => {
 setShowForm(!showForm); setEditingId(null); 
}}
                    style={{
                        background: '#0A0A0A', color: '#fff', border: 'none', borderRadius: 999,
                        padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                >
                    {showForm ? 'إلغاء' : '+ إضافة موظف'}
                </button>
            </div>

            {/* H §18: بحث + ترتيب + ترقيم صفحات */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو البريد..."
                    style={{ padding: '9px 14px', borderRadius: 10, border: '0.5px solid rgba(10,10,10,.1)', fontSize: 13, background: '#fff', color: '#0A0A0A', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 220 }}
                />
                <SortBar sort={sort} options={sortOptions} />
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
                                <PasswordInput
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
                                background: '#2E7D32', color: '#0A0A0A', border: 'none', borderRadius: 10,
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
            {members.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40, color: 'rgba(10,10,10,.55)' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                    <div style={{ fontSize: 14 }}>{search ? 'لا موظف مطابق لبحثك' : 'لم تتم إضافة أي موظفين بعد'}</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>أضف موظفي الاستقبال ليتمكنوا من إدارة الطلبات</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {members.map(member => (
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
                                            <PasswordInput
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
                                                background: '#2E7D32', color: '#0A0A0A', border: 'none', borderRadius: 8,
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
                                                background: '#F6F8F5', color: '#0A0A0A', border: 'none', borderRadius: 8,
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
                                        <div style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', marginTop: 2 }} dir="ltr">{member.email}</div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                            <span style={{
                                                background: '#F6F8F5', borderRadius: 6, padding: '2px 8px',
                                                fontSize: 11, fontWeight: 700, color: 'rgba(10,10,10,.55)',
                                            }}>
                                                {roleLabelAr(member.role)}
                                            </span>
                                            <span style={{
                                                background: member.status === 'active' ? '#E8F5E9' : '#FDEDEC',
                                                borderRadius: 6, padding: '2px 8px',
                                                fontSize: 11, fontWeight: 700,
                                                color: member.status === 'active' ? '#2E7D32' : '#D9381E',
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
                                            onClick={() => handleDelete(member)}
                                            style={{ ...actionBtnStyle, background: '#FDEDEC', color: '#D9381E' }}
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

            {staff?.links && <Pagination links={staff.links} />}

            <ConfirmModal
                open={deleteTarget !== null}
                title="حذف موظف المزوّد"
                message={
                    deleteTarget
                        ? `يفقد «${deleteTarget.name}» (${roleLabelAr(deleteTarget.role)}) وصوله إلى لوحة المزوّد فوراً، ولا يعود يستقبل طلبات الحجز ولا يردّ عليها. القرارات التي سجّلها سابقاً تبقى في سجلها كما هي.`
                        : ''
                }
                tone="danger"
                confirmLabel="حذف الموظف"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </PartnerLayout>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #F6F8F5',
    borderRadius: 8,
    fontSize: 13,
    background: '#fff',
    boxSizing: 'border-box',
};

const errorStyle: React.CSSProperties = {
    color: '#C87D00',
    fontSize: 11,
    marginTop: 4,
};

const actionBtnStyle: React.CSSProperties = {
    background: '#F6F8F5',
    color: '#0A0A0A',
    border: 'none',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
};
