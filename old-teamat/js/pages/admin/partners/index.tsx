import AdminLayout from '@/layouts/admin-layout';
import FilterTabs from '@/components/filter-tabs';
import CategoryIcon from '@/components/category-icon';
import StatusBadge from '@/components/status-badge';
import Pagination from '@/components/pagination';
import { ListState } from '@/components/list-states';
import { SortBar, type SortState } from '@/components/sortable-header';
import { fmtDate } from '@/lib/utils';
import type { Partner, Category, PaginatedResult } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import ConfirmModal from '@/components/confirm-modal';
import { useState, useEffect } from 'react';
import toastr from 'toastr';

interface Props {
    partners: PaginatedResult<Partner>;
    stats: { active: number; pending: number };
    filters: { status?: string; search?: string; sort?: string; dir?: string };
    sort: SortState;
    categories?: Category[];
}

const filterOptions = [
    { label: 'الكل', value: '' },
    { label: 'معلق', value: 'pending' },
    { label: 'نشط', value: 'active' },
    { label: 'مرفوض', value: 'rejected' },
];

export default function PartnersIndex({ partners, stats, filters, sort, categories }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        status: filters?.status,
        sort: filters?.sort,
        dir: filters?.dir,
    });
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Partner | null>(null);

    const form = useForm<{
        name: string; email: string; password: string; city: string; district: string;
        contact_phone: string; commission_rate: string; status: string;
        category_ids: number[];
    }>({
        name: '',
        email: '',
        password: '',
        city: '',
        district: '',
        contact_phone: '',
        commission_rate: '15',
        status: 'pending',
        category_ids: [],
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
                category_ids: editingItem.categories?.map((s) => s.id) ?? [],
            });
        } else {
            form.reset();
        }
    }, [editingItem]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editingItem) {
            form.put(`/admin/partners/${editingItem.id}`, {
                onSuccess: () => { setEditingItem(null); toastr.success('تم التحديث بنجاح.'); },
            });
        } else {
            form.post('/admin/partners', {
                onSuccess: () => { setShowCreate(false); form.reset(); toastr.success('تم الإنشاء بنجاح.'); },
            });
        }
    }

    function reject(id: number) {
        router.post(`/admin/partners/${id}/reject`, {}, { preserveScroll: true, onSuccess: () => toastr.success('تم الرفض بنجاح.') });
    }

    const [approveTarget, setApproveTarget] = useState<{ id: number; name: string; commission_rate: string } | null>(null);
    const [approveCommission, setApproveCommission] = useState('10');

    function confirmApprove() {
        if (!approveTarget) return;
        router.post(`/admin/partners/${approveTarget.id}/approve`, { commission_rate: approveCommission }, { preserveScroll: true, onSuccess: () => toastr.success('تمت الموافقة بنجاح.') });
        setApproveTarget(null);
    }

    const [resetTarget, setResetTarget] = useState<{ id: number; email: string } | null>(null);

    function confirmResetPassword() {
        if (!resetTarget) return;
        const email = resetTarget.email;
        router.post(`/admin/partners/${resetTarget.id}/reset-password`, {}, { preserveScroll: true, onSuccess: () => toastr.success(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`) });
        setResetTarget(null);
    }

    return (
        <AdminLayout>
            <Head title="إدارة الشركاء" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-[0.5px] border-[#0A0A0A]/10 mb-5">
                <div>
                    <h1 className="text-xl font-extrabold text-[#0A0A0A] mb-1">إدارة الشركاء</h1>
                    <p className="text-xs text-[#0A0A0A]/60">
                        {stats.active} شركاء مفعّلين · {stats.pending} طلبات معلقة
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center justify-center h-9 px-4 rounded-full text-xs font-bold bg-[#0A0A0A] text-[#C8FF00] border-[0.5px] border-[#0A0A0A] hover:bg-[#0A0A0A]/90 transition-colors cursor-pointer"
                >
                    إضافة شريك
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالاسم، المدينة، الفئة..."
                    className="h-9 min-w-[220px] px-3.5 rounded-xl text-xs font-arabic bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 hover:border-[#0A0A0A]/30 focus-visible:ring-2 focus-visible:ring-[#C8FF00] outline-none"
                />
                <FilterTabs options={filterOptions} current={filters?.status ?? ''} />
                <SortBar
                    sort={sort}
                    options={[
                        { key: 'name', label: 'الاسم' },
                        { key: 'city', label: 'المدينة' },
                        { key: 'venues_count', label: 'المرافق', initialDirection: 'desc' },
                        { key: 'commission_rate', label: 'العمولة', initialDirection: 'desc' },
                        { key: 'status', label: 'الحالة' },
                    ]}
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {partners.data.length === 0 && (
                    <div className="bg-white rounded-2xl border-[0.5px] border-[#0A0A0A]/10">
                        <ListState tone="empty" title="لا يوجد شركاء" hint="لا مزوّد خدمة مطابق للبحث والفلاتر الحالية." />
                    </div>
                )}

                {partners.data.map((partner) => (
                    <div
                        key={partner.id}
                        className="bg-white p-5 rounded-2xl border-[0.5px] border-[#0A0A0A]/10 space-y-4 hover:border-[#0A0A0A]/30 transition-colors"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-[0.5px] border-[#0A0A0A]/10 pb-3">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-extrabold text-sm text-[#0A0A0A]">{partner.name}</h3>
                                    {partner.cr_number && (
                                        <span className="text-[10px] font-mono bg-[#0A0A0A]/5 px-2 py-0.5 rounded text-[#0A0A0A]/70">
                                            س.ت: {partner.cr_number}
                                        </span>
                                    )}
                                    <StatusBadge status={partner.status} />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap text-xs text-[#0A0A0A]/50 mt-1">
                                    <span>
                                        المسؤول: <strong className="text-[#0A0A0A]/70">{partner.contact_name ?? partner.email ?? '—'}</strong>
                                        {partner.contact_phone ? ` (${partner.contact_phone})` : ''}
                                    </span>
                                    <span>•</span>
                                    <span>{partner.city}{partner.district ? ` — ${partner.district}` : ''}</span>
                                    <span>•</span>
                                    <span>
                                        {partner.venues_count ?? 0} مرفق ·{' '}
                                        {(partner as Partner & { staff_count?: number }).staff_count ?? 0} موظف
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {partner.status === 'pending' && (
                                    <>
                                        <button
                                            className="act-btn btn-approve"
                                            onClick={() => {
                                                setApproveTarget({ id: partner.id, name: partner.name, commission_rate: String(partner.commission_rate ?? 10) });
                                                setApproveCommission(String(partner.commission_rate ?? 10));
                                            }}
                                        >
                                            قبول
                                        </button>
                                        <button className="act-btn btn-reject" onClick={() => reject(partner.id)}>رفض</button>
                                    </>
                                )}
                                <button onClick={() => setEditingItem(partner)} className="act-btn btn-view">تعديل</button>
                                {partner.status === 'active' && (
                                    <button
                                        className="act-btn"
                                        style={{ background: '#0A0A0A', color: '#C8FF00', borderColor: '#0A0A0A' }}
                                        onClick={() => setResetTarget({ id: partner.id, email: partner.email })}
                                    >
                                        إعادة كلمة المرور
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F6F8F5] p-3.5 rounded-xl border-[0.5px] border-[#0A0A0A]/10 text-xs">
                            <div>
                                <span className="text-[#0A0A0A]/50 block font-medium text-[11px]">نسبة العمولة:</span>
                                <span className="font-mono font-bold text-sm text-[#0A0A0A]">{partner.commission_rate ?? 10}%</span>
                            </div>
                            <div>
                                <span className="text-[#0A0A0A]/50 block font-medium text-[11px]">الحساب البنكي:</span>
                                <span className={`font-bold text-xs ${partner.bank_status === 'approved' ? 'text-[#2E7D32]' : 'text-[#0A0A0A]/60'}`}>
                                    {partner.bank_status == null
                                        ? '—'
                                        : partner.bank_status === 'approved' ? 'معتمد' : 'بانتظار الاعتماد'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#0A0A0A]/50 block font-medium text-[11px]">تاريخ الطلب:</span>
                                <span className="font-bold text-xs text-[#0A0A0A]">
                                    {partner.status === 'active' ? fmtDate(partner.approved_at) : fmtDate(partner.created_at)}
                                </span>
                            </div>
                        </div>

                        <div className="pt-1">
                            <span className="text-[11px] font-extrabold text-[#0A0A0A]/60 tracking-wider block mb-2">الفئات:</span>
                            <div className="flex flex-wrap gap-2">
                                {partner.categories && partner.categories.length > 0 ? (
                                    partner.categories.map((category, index) => (
                                        <span
                                            key={category.id ?? index}
                                            className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border-[0.5px] border-[#0A0A0A]/10 text-xs whitespace-nowrap"
                                        >
                                            <CategoryIcon icon={category.icon} size={14} />
                                            <span className="text-[#0A0A0A]">{category.name}</span>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-[#0A0A0A]/40">—</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination links={partners.links} />

            {/* Create/Edit Modal */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل شريك' : 'إضافة شريك'}
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
                                    <label>اسم الشريك *</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="مثال: شريك الرياض"
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
                                        placeholder="info@partner.com"
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
                                    <label>الفئات *</label>
                                    {categories?.map((cat) => (
                                        <div key={cat.id} style={{ marginTop: '4px' }}>
                                            {cat.children && cat.children.length > 0 ? (
                                                <>
                                                    <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', fontWeight: 700, marginBottom: 4, marginTop: 8 }}>{cat.name}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {cat.children.map((sub) => (
                                                            <label
                                                                key={sub.id}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                                    padding: '6px 12px', borderRadius: '8px',
                                                                    border: form.data.category_ids.includes(sub.id) ? '1px solid #2E7D32' : '0.5px solid rgba(10,10,10,.1)',
                                                                    background: form.data.category_ids.includes(sub.id) ? 'rgba(0,158,130,.15)' : 'transparent',
                                                                    cursor: 'pointer', fontSize: '13px',
                                                                }}
                                                            >
                                                                <input type="checkbox" checked={form.data.category_ids.includes(sub.id)} onChange={(e) => {
                                                                    if (e.target.checked) { form.setData('category_ids', [...form.data.category_ids, sub.id]); }
                                                                    else { form.setData('category_ids', form.data.category_ids.filter((id) => id !== sub.id)); }
                                                                }} style={{ display: 'none' }} />
                                                                <CategoryIcon icon={sub.icon} size={16} /> {sub.name}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    <label
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '6px',
                                                            padding: '6px 12px', borderRadius: '8px',
                                                            border: form.data.category_ids.includes(cat.id) ? '1px solid #2E7D32' : '0.5px solid rgba(10,10,10,.1)',
                                                            background: form.data.category_ids.includes(cat.id) ? 'rgba(0,158,130,.15)' : 'transparent',
                                                            cursor: 'pointer', fontSize: '13px',
                                                        }}
                                                    >
                                                        <input type="checkbox" checked={form.data.category_ids.includes(cat.id)} onChange={(e) => {
                                                            if (e.target.checked) { form.setData('category_ids', [...form.data.category_ids, cat.id]); }
                                                            else { form.setData('category_ids', form.data.category_ids.filter((id) => id !== cat.id)); }
                                                        }} style={{ display: 'none' }} />
                                                        <CategoryIcon icon={cat.icon} size={16} /> {cat.name}
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    ))}
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

            {/* Approve with Commission Rate Modal */}
            {approveTarget && (
                <div className="detail-overlay open" onClick={() => setApproveTarget(null)}>
                    <div className="detail-panel" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
                        <h3>
                            الموافقة على الشريك
                            <button className="close-btn" onClick={() => setApproveTarget(null)}>x</button>
                        </h3>
                        <div style={{ fontSize: 14, color: '#0A0A0A', marginBottom: 16 }}>
                            سيتم تفعيل شريك <strong style={{ color: '#0A0A0A' }}>{approveTarget.name}</strong> وإرسال رابط التفعيل.
                        </div>
                        <div className="fg" style={{ marginBottom: 20 }}>
                            <label>نسبة العمولة (%) *</label>
                            <input
                                type="number"
                                value={approveCommission}
                                onChange={(e) => setApproveCommission(e.target.value)}
                                min={0}
                                max={100}
                                step={0.1}
                                required
                            />
                            <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginTop: 4 }}>
                                النسبة التي تستقطعها المنصة من كل فعالية لهذا الشريك
                            </div>
                        </div>
                        <div className="panel-actions">
                            <button className="pa-approve" onClick={confirmApprove}>تأكيد الموافقة</button>
                            <button className="pa-reject" onClick={() => setApproveTarget(null)}>إلغاء</button>
                        </div>
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
