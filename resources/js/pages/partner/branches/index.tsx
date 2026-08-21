import PartnerLayout from '@/layouts/partner-layout';
import ConfirmModal from '@/components/confirm-modal';
import Pagination from '@/components/pagination';
import { SortBar, type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import type { Category, ProviderBranch, ActivityUnit, PaginatedResult } from '@/types/models';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';

interface Props {
    partner: { id: number; name: string; trade_name: string | null; has_price_contract: boolean };
    branches: PaginatedResult<ProviderBranch>;
    categories: Category[];
    filters?: { search?: string; sort?: string; dir?: string };
    sort?: SortState;
}

const sortOptions = [
    { key: 'name', label: 'الاسم', initialDirection: 'asc' as const },
    { key: 'city', label: 'المدينة', initialDirection: 'asc' as const },
    { key: 'status', label: 'الحالة', initialDirection: 'asc' as const },
    { key: 'created_at', label: 'تاريخ الإضافة', initialDirection: 'asc' as const },
];

const pricingLabels: Record<string, string> = {
    unit_hour: 'بالوحدة / بالساعة',
    package: 'باقة',
    per_person: 'للشخص',
};

const emptyBranch = { name: '', address: '', city: '', district: '', contact_name: '', contact_phone: '' };
const emptyUnit = { category_id: '', name: '', min_capacity: 2, max_capacity: 12, pricing_type: 'unit_hour', price: 0, default_duration_minutes: 90 };

function BranchForm({ initial, onSubmit, processing, errors }: {
    initial: typeof emptyBranch;
    onSubmit: (data: typeof emptyBranch) => void;
    processing: boolean;
    errors: Record<string, string>;
}) {
    const [data, setData] = useState(initial);
    const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));

    return (
        <div style={{ background: 'rgba(26,95,171,.05)', borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div className="frow">
                <div className="fg"><label>اسم الفرع</label><input value={data.name} onChange={(e) => set('name', e.target.value)} />{errors.name && <div style={{ fontSize: 11, color: '#C8410A' }}>{errors.name}</div>}</div>
                <div className="fg"><label>المدينة</label><input value={data.city} onChange={(e) => set('city', e.target.value)} /></div>
                <div className="fg"><label>الحي</label><input value={data.district} onChange={(e) => set('district', e.target.value)} /></div>
            </div>
            <div className="frow">
                <div className="fg"><label>العنوان</label><input value={data.address} onChange={(e) => set('address', e.target.value)} /></div>
                <div className="fg"><label>جهة اتصال الفرع</label><input value={data.contact_name} onChange={(e) => set('contact_name', e.target.value)} /></div>
                <div className="fg"><label>جوال الفرع</label><input value={data.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} /></div>
            </div>
            <button className="act-btn" style={{ background: '#1A5FAB', color: '#fff', borderColor: '#1A5FAB', padding: '9px 20px', borderRadius: 8, marginTop: 6 }} disabled={processing || !data.name} onClick={() => onSubmit(data)}>
                حفظ الفرع
            </button>
        </div>
    );
}

function UnitRow({ unit, categories, hasPriceContract }: { unit: ActivityUnit; categories: Category[]; hasPriceContract: boolean }) {
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const form = useForm({
        category_id: String(unit.category_id),
        name: unit.name,
        min_capacity: unit.min_capacity,
        max_capacity: unit.max_capacity,
        pricing_type: unit.pricing_type,
        price: Number(unit.price),
        default_duration_minutes: unit.default_duration_minutes,
        status: unit.status,
    });

    const pendingPriceChange = (unit.price_changes ?? []).find((c) => c.status === 'pending');

    return (
        <div style={{ border: '1px solid rgba(0,0,0,.08)', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                    <b>{unit.name}</b>
                    <span style={{ fontSize: 12, color: '#8A7868', marginRight: 8 }}>
                        {unit.category?.name} · {pricingLabels[unit.pricing_type]} · {Number(unit.price).toLocaleString()} ريال · {unit.default_duration_minutes} د · السعة {unit.min_capacity}–{unit.max_capacity}
                    </span>
                    {unit.status !== 'active' && <span className="badge" style={{ background: '#8A786818', color: '#8A7868', marginRight: 6 }}>{unit.status === 'maintenance' ? 'صيانة' : 'معطّلة'}</span>}
                    {pendingPriceChange && (
                        <span className="badge" style={{ background: '#B8860A18', color: '#B8860A', marginRight: 6 }}>
                            تعديل سعر إلى {Number(pendingPriceChange.new_price).toLocaleString()} بانتظار اعتماد تيمات
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button className="act-btn" style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6 }} onClick={() => setEditing(!editing)}>{editing ? 'إغلاق' : 'تعديل'}</button>
                    <button className="act-btn" style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, color: '#C8410A', borderColor: '#C8410A' }} onClick={() => setConfirmDelete(true)}>حذف</button>
                </div>
            </div>

            {editing && (
                <div style={{ marginTop: 10 }}>
                    <div className="frow">
                        <div className="fg"><label>الاسم</label><input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></div>
                        <div className="fg">
                            <label>النشاط (من الكتالوج المركزي)</label>
                            <select value={form.data.category_id} onChange={(e) => form.setData('category_id', e.target.value)}>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="fg">
                            <label>نوع التسعير</label>
                            <select value={form.data.pricing_type} onChange={(e) => form.setData('pricing_type', e.target.value as ActivityUnit['pricing_type'])}>
                                <option value="unit_hour">بالوحدة / بالساعة</option>
                                <option value="package">باقة</option>
                                <option value="per_person">للشخص</option>
                            </select>
                        </div>
                    </div>
                    <div className="frow">
                        <div className="fg"><label>السعر (ريال، شامل الضريبة)</label><input type="number" value={form.data.price} onChange={(e) => form.setData('price', Number(e.target.value))} />{hasPriceContract && <div style={{ fontSize: 11, color: '#B8860A', marginTop: 3 }}>لديك عقد سعر — تعديل السعر يسري بعد اعتماد أدمن تيمات.</div>}</div>
                        <div className="fg"><label>المدة الافتراضية (د)</label><input type="number" value={form.data.default_duration_minutes} onChange={(e) => form.setData('default_duration_minutes', Number(e.target.value))} /></div>
                        <div className="fg"><label>الطاقة الدنيا</label><input type="number" value={form.data.min_capacity} onChange={(e) => form.setData('min_capacity', Number(e.target.value))} /></div>
                        <div className="fg"><label>الطاقة القصوى</label><input type="number" value={form.data.max_capacity} onChange={(e) => form.setData('max_capacity', Number(e.target.value))} /></div>
                        <div className="fg">
                            <label>الحالة</label>
                            <select value={form.data.status} onChange={(e) => form.setData('status', e.target.value as ActivityUnit['status'])}>
                                <option value="active">نشطة</option>
                                <option value="maintenance">صيانة</option>
                                <option value="disabled">معطّلة</option>
                            </select>
                        </div>
                    </div>
                    <button className="act-btn" style={{ background: '#1A7A4A', color: '#fff', borderColor: '#1A7A4A', padding: '8px 18px', borderRadius: 8 }} disabled={form.processing}
                        onClick={() => form.put(`/partner/units/${unit.id}`, { onSuccess: () => { setEditing(false); toastr.success('حُدّثت الوحدة'); } })}>
                        حفظ
                    </button>
                </div>
            )}

            <ConfirmModal
                open={confirmDelete}
                title="حذف وحدة النشاط"
                message={`سيُحذف «${unit.name}» نهائياً.`}
                onConfirm={() => form.delete(`/partner/units/${unit.id}`, { onSuccess: () => toastr.success('حُذفت الوحدة') })}
                onCancel={() => setConfirmDelete(false)}
            />
        </div>
    );
}

function AddUnitForm({ branchId, categories }: { branchId: number; categories: Category[] }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ ...emptyUnit, category_id: categories[0]?.id ? String(categories[0].id) : '' });

    if (!open) {
        return <button className="act-btn" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6 }} onClick={() => setOpen(true)}>+ إضافة وحدة نشاط</button>;
    }

    return (
        <div style={{ background: 'rgba(26,122,74,.05)', borderRadius: 10, padding: 12, marginTop: 8 }}>
            <div className="frow">
                <div className="fg"><label>الاسم (ملعب/مسار/قاعة)</label><input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />{form.errors.name && <div style={{ fontSize: 11, color: '#C8410A' }}>{form.errors.name}</div>}</div>
                <div className="fg">
                    <label>النشاط</label>
                    <select value={form.data.category_id} onChange={(e) => form.setData('category_id', e.target.value)}>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="fg">
                    <label>نوع التسعير</label>
                    <select value={form.data.pricing_type} onChange={(e) => form.setData('pricing_type', e.target.value)}>
                        <option value="unit_hour">بالوحدة / بالساعة</option>
                        <option value="package">باقة</option>
                        <option value="per_person">للشخص</option>
                    </select>
                </div>
            </div>
            <div className="frow">
                <div className="fg"><label>السعر</label><input type="number" value={form.data.price} onChange={(e) => form.setData('price', Number(e.target.value))} />{form.errors.price && <div style={{ fontSize: 11, color: '#C8410A' }}>{form.errors.price}</div>}</div>
                <div className="fg"><label>المدة الافتراضية (د)</label><input type="number" value={form.data.default_duration_minutes} onChange={(e) => form.setData('default_duration_minutes', Number(e.target.value))} /></div>
                <div className="fg"><label>الطاقة الدنيا</label><input type="number" value={form.data.min_capacity} onChange={(e) => form.setData('min_capacity', Number(e.target.value))} /></div>
                <div className="fg"><label>الطاقة القصوى</label><input type="number" value={form.data.max_capacity} onChange={(e) => form.setData('max_capacity', Number(e.target.value))} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <button className="act-btn" style={{ background: '#1A7A4A', color: '#fff', borderColor: '#1A7A4A', padding: '8px 18px', borderRadius: 8 }} disabled={form.processing || !form.data.name}
                    onClick={() => form.post(`/partner/branches/${branchId}/units`, { onSuccess: () => { setOpen(false); form.reset(); toastr.success('أُضيفت الوحدة'); } })}>
                    إضافة
                </button>
                <button className="act-btn" style={{ padding: '8px 18px', borderRadius: 8 }} onClick={() => setOpen(false)}>إلغاء</button>
            </div>
        </div>
    );
}

export default function BranchesIndex({ partner, branches, categories, filters, sort }: Props) {
    const items = branches?.data ?? [];
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        sort: filters?.sort,
        dir: filters?.dir,
    });
    const createForm = useForm(emptyBranch);

    return (
        <PartnerLayout>
            <Head title="الفروع ووحدات النشاط" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800 }}>الفروع ووحدات النشاط</h1>
                <button className="act-btn" style={{ background: '#1A5FAB', color: '#fff', borderColor: '#1A5FAB', padding: '9px 18px', borderRadius: 8 }} onClick={() => setShowCreate(!showCreate)}>
                    + فرع جديد
                </button>
            </div>

            <div className="card" style={{ marginBottom: 16, fontSize: 12, color: '#8A7868' }}>
                الأنشطة والفئات تُدار مركزياً لدى تيمات: تختار منها ولا تضيف إليها. كل وحدة (ملعب / مسار / قاعة) تتبع فرعاً
                واحداً، ولها نشاط وطاقة دنيا وقصوى ونوع تسعير وسعر ومدة افتراضية.
            </div>

            {/* H §18: بحث + ترتيب + ترقيم صفحات */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث باسم الفرع أو المدينة..."
                    style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #EAE4DC', fontSize: 13, background: '#fff', color: '#1C1410', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 220 }}
                />
                <SortBar sort={sort} options={sortOptions} />
            </div>

            {showCreate && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 800, marginBottom: 4 }}>فرع جديد</div>
                    <BranchForm
                        initial={emptyBranch}
                        processing={createForm.processing}
                        errors={createForm.errors as Record<string, string>}
                        onSubmit={(data) => {
                            createForm.transform(() => data);
                            createForm.post('/partner/branches', { onSuccess: () => { setShowCreate(false); toastr.success('أُضيف الفرع'); } });
                        }}
                    />
                </div>
            )}

            {items.length === 0 && (
                <div className="card" style={{ textAlign: 'center', color: '#8A7868', padding: 40 }}>
                    {search ? 'لا فرع مطابق لبحثك.' : 'لا فروع بعد — أضف فرعك الأول ثم وحدات النشاط تحته.'}
                </div>
            )}

            {items.map((branch) => (
                <div key={branch.id} className="card" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 800 }}>{branch.name} {branch.status !== 'active' && <span className="badge" style={{ background: '#8A786818', color: '#8A7868' }}>غير نشط</span>}</div>
                            <div style={{ fontSize: 12, color: '#8A7868', marginTop: 4 }}>
                                {[branch.city, branch.district, branch.address].filter(Boolean).join(' · ') || 'بلا عنوان'}
                                {branch.contact_phone ? ` · ${branch.contact_name ?? ''} ${branch.contact_phone}` : ''}
                            </div>
                        </div>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>وحدات النشاط ({(branch.units ?? []).length})</div>
                    {(branch.units ?? []).map((unit) => (
                        <UnitRow key={unit.id} unit={unit} categories={categories} hasPriceContract={partner.has_price_contract} />
                    ))}
                    <AddUnitForm branchId={branch.id} categories={categories} />
                </div>
            ))}

            {branches?.links && <Pagination links={branches.links} />}
        </PartnerLayout>
    );
}
