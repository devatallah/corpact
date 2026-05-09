import AdminLayout from '@/layouts/admin-layout';
import FilterTabs from '@/components/filter-tabs';
import SportIcon from '@/components/sport-icon';
import StatusBadge from '@/components/status-badge';
import Pagination from '@/components/pagination';
import { fmtDate } from '@/lib/utils';
import type { Club, Sport, PaginatedResult } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import ConfirmModal from '@/components/confirm-modal';
import { useState, useEffect } from 'react';
import toastr from 'toastr';

interface Props {
    clubs: PaginatedResult<Club>;
    stats: { active: number; pending: number };
    filters: { status?: string; search?: string };
    sports?: Sport[];
}

const filterOptions = [
    { label: 'الكل', value: '' },
    { label: 'معلق', value: 'pending' },
    { label: 'نشط', value: 'active' },
    { label: 'مرفوض', value: 'rejected' },
];

export default function ClubsIndex({ clubs, stats, filters, sports }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', { status: filters?.status });
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Club | null>(null);

    const form = useForm<{
        name: string; email: string; password: string; city: string; district: string;
        contact_phone: string; commission_rate: string; status: string;
        sport_ids: number[];
    }>({
        name: '',
        email: '',
        password: '',
        city: '',
        district: '',
        contact_phone: '',
        commission_rate: '15',
        status: 'pending',
        sport_ids: [],
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
                sport_ids: editingItem.sports?.map((s) => s.id) ?? [],
            });
        } else {
            form.reset();
        }
    }, [editingItem]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editingItem) {
            form.put(`/admin/clubs/${editingItem.id}`, {
                onSuccess: () => { setEditingItem(null); toastr.success('تم التحديث بنجاح.'); },
            });
        } else {
            form.post('/admin/clubs', {
                onSuccess: () => { setShowCreate(false); form.reset(); toastr.success('تم الإنشاء بنجاح.'); },
            });
        }
    }

    function approve(id: number) {
        router.post(`/admin/clubs/${id}/approve`, {}, { preserveScroll: true, onSuccess: () => toastr.success('تمت الموافقة بنجاح.') });
    }

    function reject(id: number) {
        router.post(`/admin/clubs/${id}/reject`, {}, { preserveScroll: true, onSuccess: () => toastr.success('تم الرفض بنجاح.') });
    }

    const [resetTarget, setResetTarget] = useState<{ id: number; email: string } | null>(null);

    function confirmResetPassword() {
        if (!resetTarget) return;
        const email = resetTarget.email;
        router.post(`/admin/clubs/${resetTarget.id}/reset-password`, {}, { preserveScroll: true, onSuccess: () => toastr.success(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`) });
        setResetTarget(null);
    }

    return (
        <AdminLayout>
            <Head title="إدارة الأندية" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div className="page-title">إدارة الأندية</div>
                <button onClick={() => setShowCreate(true)} className="act-btn btn-approve">
                    إضافة نادي
                </button>
            </div>
            <div className="page-sub">
                {stats.active} أندية مفعّلة · {stats.pending} طلبات معلقة
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث بالاسم، المدينة، الرياضة..."
                    style={{ padding: '9px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 200 }}
                />
                <FilterTabs options={filterOptions} current={filters?.status ?? ''} />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>النادي</th>
                            <th>المدينة</th>
                            <th>الرياضات</th>
                            <th>الملاعب</th>
                            <th>مسؤول النادي</th>
                            <th>الحالة</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clubs.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', color: '#6B7A99', padding: '20px' }}>
                                    لا توجد أندية
                                </td>
                            </tr>
                        ) : (
                            clubs.data.map((club) => (
                                <tr key={club.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#fff' }}>{club.name}</div>
                                        <div style={{ fontSize: '10px', color: '#6B7A99' }}>
                                            {club.status === 'active' ? club.district : fmtDate(club.created_at)}
                                        </div>
                                    </td>
                                    <td style={{ color: '#C8D0E0' }}>{club.city}</td>
                                    <td>
                                        <span style={{ fontSize: '12px' }}>
                                            {club.sports && club.sports.length > 0
                                                ? club.sports.map((s, i) => (
                                                    <span key={s.id ?? i} style={{ whiteSpace: 'nowrap' }}>
                                                        {i > 0 && ' · '}
                                                        <SportIcon icon={s.icon} size={14} /> {s.name}
                                                    </span>
                                                ))
                                                : '-'}
                                        </span>
                                    </td>
                                    <td>{club.courts_count ?? 0}</td>
                                    <td>
                                        <div style={{ fontSize: '12px' }}>{club.email ?? '-'}</div>
                                        <div style={{ fontSize: '10px', color: '#6B7A99' }}>{club.contact_phone ?? '-'}</div>
                                    </td>
                                    <td>
                                        <StatusBadge status={club.status} />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {club.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="act-btn btn-approve"
                                                        onClick={() => approve(club.id)}
                                                    >
                                                        قبول
                                                    </button>
                                                    <button
                                                        className="act-btn btn-reject"
                                                        onClick={() => reject(club.id)}
                                                    >
                                                        رفض
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setEditingItem(club)}
                                                className="act-btn btn-view"
                                            >
                                                تعديل
                                            </button>
                                            {club.status === 'active' && (
                                                <button
                                                    className="act-btn"
                                                    style={{ background: '#2A1F3D', color: '#A78BFA', borderColor: '#3B2D5A' }}
                                                    onClick={() => setResetTarget({ id: club.id, email: club.email })}
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

            <Pagination links={clubs.links} />

            {/* Create/Edit Modal */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل نادي' : 'إضافة نادي'}
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
                                    <label>اسم النادي *</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="مثال: نادي الرياض"
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
                                        placeholder="info@club.com"
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
                                    <label>الرياضات *</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                        {sports?.map((sport) => (
                                            <label
                                                key={sport.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    border: form.data.sport_ids.includes(sport.id)
                                                        ? '1px solid #009E82'
                                                        : '1px solid #232A3E',
                                                    background: form.data.sport_ids.includes(sport.id)
                                                        ? 'rgba(0,158,130,.15)'
                                                        : 'transparent',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.sport_ids.includes(sport.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            form.setData('sport_ids', [...form.data.sport_ids, sport.id]);
                                                        } else {
                                                            form.setData('sport_ids', form.data.sport_ids.filter((id) => id !== sport.id));
                                                        }
                                                    }}
                                                    style={{ display: 'none' }}
                                                />
                                                <SportIcon icon={sport.icon} size={16} /> {sport.name}
                                            </label>
                                        ))}
                                    </div>
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
