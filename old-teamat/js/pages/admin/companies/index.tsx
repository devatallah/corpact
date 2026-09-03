import { Head, router, useForm } from '@inertiajs/react';
import { Building2, Pencil, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import toastr from 'toastr';
import ConfirmModal from '@/components/confirm-modal';
import FilterTabs from '@/components/filter-tabs';
import { ListState } from '@/components/list-states';
import Pagination from '@/components/pagination';
import PasswordInput from '@/components/password-input';
import { SortBar, type SortState } from '@/components/sortable-header';
import StatusBadge from '@/components/status-badge';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AdminLayout from '@/layouts/admin-layout';
import { fmtDate, fmtHalalas } from '@/lib/utils';
import type { Company, PaginatedResult } from '@/types/models';

interface Props {
    companies: PaginatedResult<Company>;
    stats: { active: number; pending: number; review: number };
    filters: { status?: string; search?: string; sort?: string; dir?: string };
    sort: SortState;
}

const filterOptions = [
    { label: 'الكل', value: '' },
    { label: 'معلق', value: 'pending' },
    { label: 'نشط', value: 'active' },
    { label: 'مرفوض', value: 'rejected' },
];

export default function CompaniesIndex({ companies, stats, filters, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        status: filters?.status,
        sort: filters?.sort,
        dir: filters?.dir,
    });
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<Company | null>(null);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        domain: '',
        sector: '',
        contact_name: '',
        contact_phone: '',
        city: '',
        status: 'pending',
    });

    useEffect(() => {
        if (editingItem) {
            form.setData({
                name: editingItem.name ?? '',
                email: editingItem.email ?? '',
                password: '',
                domain: editingItem.domain ?? '',
                sector: editingItem.sector ?? '',
                contact_name: editingItem.contact_name ?? '',
                contact_phone: editingItem.contact_phone ?? '',
                city: editingItem.city ?? '',
                status: editingItem.status ?? 'pending',
            });
        } else {
            form.reset();
        }
    }, [editingItem]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (editingItem) {
            form.put(`/admin/companies/${editingItem.id}`, {
                onSuccess: () => {
 setEditingItem(null); toastr.success('تم تحديث الشركة بنجاح.'); 
},
            });
        } else {
            form.post('/admin/companies', {
                onSuccess: () => {
 setShowCreate(false); form.reset(); toastr.success('تم إنشاء الشركة بنجاح.'); 
},
            });
        }
    }

    function approve(id: number) {
        router.post(`/admin/companies/${id}/approve`, {}, { preserveScroll: true, onSuccess: () => toastr.success('تمت الموافقة على الشركة بنجاح.') });
    }

    function reject(id: number) {
        router.post(`/admin/companies/${id}/reject`, {}, { preserveScroll: true, onSuccess: () => toastr.success('تم رفض طلب الشركة.') });
    }

    const [resetTarget, setResetTarget] = useState<{ id: number; email: string } | null>(null);

    function confirmResetPassword() {
        if (!resetTarget) {
return;
}

        const email = resetTarget.email;
        router.post(`/admin/companies/${resetTarget.id}/reset-password`, {}, {
            preserveScroll: true,
            onSuccess: () => toastr.success(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`),
        });
        setResetTarget(null);
    }

    return (
        <AdminLayout>
            <Head title="إدارة الشركات" />

            {/* ترويسة الشاشة */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-[0.5px] border-[#0A0A0A]/10 mb-5">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-extrabold text-[#0A0A0A] mb-1">
                        <Building2 className="w-5 h-5 text-[#0A0A0A]/70" aria-hidden="true" />
                        إدارة الشركات والعقود التجارية
                    </h1>
                    <p className="text-xs text-[#0A0A0A]/60">
                        {stats.active} شركة مفعّلة · {stats.pending + stats.review} طلبات معلقة
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    {/* The prototype puts the active count in a pill beside the action. */}
                    <span className="inline-flex items-center h-9 px-3.5 rounded-full text-xs font-bold bg-[#0A0A0A]/5 text-[#0A0A0A]/70 border-[0.5px] border-[#0A0A0A]/10 whitespace-nowrap">
                        إجمالي الشركات النشطة: {stats.active}
                    </span>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center justify-center h-9 px-4 rounded-full text-xs font-bold bg-[#0A0A0A] text-[#C8FF00] border-[0.5px] border-[#0A0A0A] hover:bg-[#0A0A0A]/90 transition-colors cursor-pointer"
                    >
                        إضافة شركة
                    </button>
                </div>
            </div>

            {/* بحث · فلترة · ترتيب */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#0A0A0A]/40 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث بالاسم..."
                        className="h-9 min-w-[200px] ps-9 pe-3.5 rounded-xl text-xs font-arabic bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 hover:border-[#0A0A0A]/30 focus-visible:ring-2 focus-visible:ring-[#C8FF00] outline-none"
                    />
                </div>
                <FilterTabs options={filterOptions} current={filters?.status ?? ''} />
                <SortBar
                    sort={sort}
                    options={[
                        { key: 'name', label: 'الاسم' },
                        { key: 'sector', label: 'القطاع' },
                        { key: 'created_at', label: 'تاريخ الطلب', initialDirection: 'desc' },
                        { key: 'status', label: 'الحالة' },
                    ]}
                />
            </div>

            {/* بطاقة لكل شركة */}
            <div className="grid grid-cols-1 gap-4">
                {companies.data.length === 0 && (
                    <div className="bg-white rounded-2xl border-[0.5px] border-[#0A0A0A]/10">
                        <ListState
                            tone="empty"
                            title="لا توجد شركات"
                            hint="لا شركة مطابقة للبحث والفلاتر الحالية."
                        />
                    </div>
                )}

                {companies.data.map((company) => (
                    <div
                        key={company.id}
                        className="bg-white p-5 rounded-2xl border-[0.5px] border-[#0A0A0A]/10 space-y-4 hover:border-[#0A0A0A]/30 transition-colors"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-[0.5px] border-[#0A0A0A]/10 pb-3">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-extrabold text-sm text-[#0A0A0A]">{company.name}</h3>
                                    {company.commercial_registration && (
                                        <span className="text-[10px] font-mono bg-[#0A0A0A]/5 px-2 py-0.5 rounded text-[#0A0A0A]/70">
                                            س.ت: {company.commercial_registration}
                                        </span>
                                    )}
                                    <StatusBadge status={company.status} />
                                </div>
                                <span className="text-xs text-[#0A0A0A]/50 block mt-0.5">
                                    {company.status === 'active'
                                        ? `تاريخ التفعيل: ${fmtDate(company.approved_at)}`
                                        : `تاريخ الطلب: ${fmtDate(company.created_at)}`}
                                    {company.sector ? ` · ${company.sector}` : ''}
                                    {company.city ? ` · ${company.city}` : ''}
                                    {` · ${company.employee_count} موظف`}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {['pending', 'review'].includes(company.status) && (
                                    <>
                                        <button className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100" onClick={() => approve(company.id)}>قبول</button>
                                        <button className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] bg-[#FDEDEC] text-[#D9381E] border-[#D9381E]/25 hover:bg-[#D9381E] hover:text-white" onClick={() => reject(company.id)}>رفض</button>
                                    </>
                                )}
                                <button onClick={() => setEditingItem(company)} className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] bg-white text-[#0A0A0A] border-[#0A0A0A]/15 hover:border-[#0A0A0A]/40"><Pencil className="w-3.5 h-3.5" aria-hidden="true" />تعديل بنود العقد والتسعير</button>
                                {company.status === 'active' && (
                                    <button
                                        className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] bg-[#0A0A0A] text-[#C8FF00] border-[#0A0A0A] hover:bg-[#0A0A0A]/90"
                                        onClick={() => setResetTarget({ id: company.id, email: company.email })}
                                    >
                                        إعادة كلمة المرور
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* بنود العقد — تُعرض فقط حين تكون مسجّلة */}
                        {(company.contract_fee_per_activated_employee != null
                            || company.contract_monthly_minimum != null
                            || company.contract_coordinator_service != null) && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F6F8F5] p-3.5 rounded-xl border-[0.5px] border-[#0A0A0A]/10 text-xs">
                                <div>
                                    <span className="text-[#0A0A0A]/50 block font-medium text-[11px]">رسوم الموظف النشط:</span>
                                    <span className="font-mono font-bold text-sm text-[#0A0A0A]">
                                        {fmtHalalas(company.contract_fee_per_activated_employee)} ر.س / موظف
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#0A0A0A]/50 block font-medium text-[11px]">الحد الأدنى الشهري:</span>
                                    <span className="font-mono font-bold text-sm text-[#0A0A0A]">
                                        {fmtHalalas(company.contract_monthly_minimum, 0)} ر.س
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#0A0A0A]/50 block font-medium text-[11px]">خدمة المنسّق المُدار:</span>
                                    <span className={`font-bold text-xs ${company.contract_coordinator_service ? 'text-[#2E7D32]' : 'text-[#0A0A0A]/60'}`}>
                                        {company.contract_coordinator_service == null
                                            ? '—'
                                            : company.contract_coordinator_service ? 'مفعّلة' : 'غير مفعّلة'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* مسؤول الحساب */}
                        <div className="pt-1">
                            <span className="text-[11px] font-extrabold text-[#0A0A0A]/60 tracking-wider block mb-2">مسؤول الحساب:</span>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border-[0.5px] border-[#0A0A0A]/10 text-xs">
                                    <span className="font-bold text-[#0A0A0A]">{company.contact_name ?? '—'}</span>
                                    <span className="text-[#0A0A0A]/40" dir="ltr">
                                        {[company.contact_phone, company.email].filter(Boolean).join(' · ') || '—'}
                                    </span>
                                </div>
                                {company.domain && (
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border-[0.5px] border-[#0A0A0A]/10 text-xs">
                                        <span className="text-[#0A0A0A]/40" dir="ltr">{company.domain}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination links={companies.links} />

            {/* Create/Edit Modal */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => {
 setShowCreate(false); setEditingItem(null); 
}}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل شركة' : 'إضافة شركة'}
                            <button className="close-btn" onClick={() => {
 setShowCreate(false); setEditingItem(null); 
}}>×</button>
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
                                    <label>اسم الشركة *</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="مثال: شركة التقنية المتقدمة"
                                        required
                                    />
                                </div>
                                <div className="fg">
                                    <label>البريد الإلكتروني *</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="info@company.sa"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <label>النطاق *</label>
                                    <input
                                        type="text"
                                        value={form.data.domain}
                                        onChange={(e) => form.setData('domain', e.target.value)}
                                        placeholder="company.sa"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                                {!editingItem ? (
                                    <div className="fg">
                                        <label>كلمة المرور *</label>
                                        <PasswordInput
                                            value={form.data.password}
                                            onChange={(e) => form.setData('password', e.target.value)}
                                            placeholder="••••••"
                                            dir="ltr"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="fg" />
                                )}
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <label>القطاع *</label>
                                    <input
                                        type="text"
                                        value={form.data.sector}
                                        onChange={(e) => form.setData('sector', e.target.value)}
                                        placeholder="تقنية المعلومات"
                                        required
                                    />
                                </div>
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
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <label>المسؤول</label>
                                    <input
                                        type="text"
                                        value={form.data.contact_name}
                                        onChange={(e) => form.setData('contact_name', e.target.value)}
                                        placeholder="اسم مسؤول الحساب"
                                    />
                                </div>
                                <div className="fg">
                                    <label>هاتف المسؤول</label>
                                    <input
                                        type="text"
                                        value={form.data.contact_phone}
                                        onChange={(e) => form.setData('contact_phone', e.target.value)}
                                        placeholder="05xxxxxxxx"
                                        dir="ltr"
                                    />
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
                                            <option value="review">قيد المراجعة</option>
                                            <option value="active">نشط</option>
                                            <option value="rejected">مرفوض</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="fg" />
                                )}
                            </div>

                            <div className="panel-actions">
                                <button type="submit" className="pa-approve" disabled={form.processing}>حفظ</button>
                                <button type="button" className="pa-reject" onClick={() => {
 setShowCreate(false); setEditingItem(null); 
}}>إلغاء</button>
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
