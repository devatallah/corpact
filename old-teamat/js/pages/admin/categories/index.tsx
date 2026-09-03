import PageHeader from '@/components/page-header';
import AdminLayout from '@/layouts/admin-layout';
import CategoryIcon from '@/components/category-icon';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import type { Category, PaginatedResult } from '@/types/models';
import { Head, useForm, router } from '@inertiajs/react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { useState, useEffect, useRef } from 'react';
import toastr from 'toastr';

interface CategoryWithCounts extends Category {
    communities_count: number;
    venues_count: number;
    events_count: number;
    deleted_at: string | null;
    children?: CategoryWithCounts[];
}

interface Props {
    categories: PaginatedResult<CategoryWithCounts>;
    parentCategories: CategoryWithCounts[];
    totalSports: number;
    filters: { search?: string; parent_id?: string; sort?: string; dir?: string };
    /** `key: ''` تعني ترتيب الشجرة الافتراضي — لا عمود نشط. */
    sort: SortState;
}

export default function SportsIndex({ categories, parentCategories, totalSports, filters, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        parent_id: filters?.parent_id,
        sort: filters?.sort,
        dir: filters?.dir,
    });

    function applyParent(value: string) {
        router.get(
            '/admin/categories',
            {
                search: filters?.search || undefined,
                parent_id: value || undefined,
                sort: filters?.sort || undefined,
                dir: filters?.dir || undefined,
            },
            { preserveState: true, replace: true },
        );
    }
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<CategoryWithCounts | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        name: '',
        name_en: '',
        parent_id: '' as string,
        icon: null as File | null,
    });

    useEffect(() => {
        if (editingItem) {
            form.setData({
                name: editingItem.name ?? '',
                name_en: editingItem.name_en ?? '',
                parent_id: editingItem.parent_id ? String(editingItem.parent_id) : '',
                icon: null,
            });
            setIconPreview(editingItem.icon ?? null);
        } else if (!showCreate) {
            form.reset();
            setIconPreview(null);
        }
    }, [editingItem]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        form.setData('icon', file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setIconPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editingItem) {
            router.post(`/admin/categories/${editingItem.id}`, {
                _method: 'PUT',
                name: form.data.name,
                name_en: form.data.name_en,
                parent_id: form.data.parent_id || null,
                icon: form.data.icon ?? undefined,
            }, {
                forceFormData: true,
                onSuccess: () => { setEditingItem(null); toastr.success('تم التحديث بنجاح.'); },
            });
        } else {
            router.post('/admin/categories', {
                name: form.data.name,
                name_en: form.data.name_en,
                parent_id: form.data.parent_id || null,
                icon: form.data.icon ?? undefined,
            }, {
                forceFormData: true,
                onSuccess: () => { setShowCreate(false); form.reset(); setIconPreview(null); toastr.success('تم الإنشاء بنجاح.'); },
            });
        }
    }

    function toggleStatus(cat: CategoryWithCounts) {
        const url = cat.deleted_at
            ? `/admin/categories/${cat.id}/restore`
            : `/admin/categories/${cat.id}`;
        const method = cat.deleted_at ? 'post' : 'delete';
        const msg = cat.deleted_at ? 'تم التفعيل بنجاح.' : 'تم التعطيل بنجاح.';
        (router[method] as (url: string, options: Record<string, unknown>) => void)(url, { preserveScroll: true, onSuccess: () => { setEditingItem(null); toastr.success(msg); } });
    }

    function closePanel() {
        setShowCreate(false);
        setEditingItem(null);
        setIconPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    }

    function openCreate() {
        setShowCreate(true);
        setEditingItem(null);
        form.reset();
        setIconPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    }

    return (
        <AdminLayout>
            <Head title="إدارة الفئات" />

            <PageHeader
                title={<>إدارة الفئات</>}
                subtitle={<>
                {totalSports} فئة على المنصة
                </>}
                actions={<>
                <button onClick={openCreate} className="inline-flex items-center justify-center h-9 px-4 rounded-full text-xs font-bold bg-[#0A0A0A] text-[#C8FF00] border-[0.5px] border-[#0A0A0A] hover:bg-[#0A0A0A]/90 transition-colors cursor-pointer">
                    إضافة فئة
                </button>
                </>}
            />

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالاسم..."
                    style={{ padding: '9px 14px', background: '#FFFFFF', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 10, fontSize: 13, color: '#0A0A0A', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 200 }}
                />
                <select
                    value={filters?.parent_id ?? ''}
                    onChange={(e) => applyParent(e.target.value)}
                    style={{ padding: '9px 14px', background: '#FFFFFF', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 10, fontSize: 13, color: '#0A0A0A', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                >
                    <option value="">كل الفئات</option>
                    <option value="root">الرئيسية فقط</option>
                    {parentCategories.map((parent) => (
                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                    ))}
                </select>
                {sort.key !== '' && (
                    <button className="fbtn on" onClick={() => applyParent(filters?.parent_id ?? '')} title="العودة إلى ترتيب الشجرة">
                        عودة لترتيب الشجرة ✕
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <SortableHeader label="الفئة" sortKey="name" sort={sort} />
                            <SortableHeader label="الاسم بالإنجليزية" sortKey="name_en" sort={sort} />
                            <th>النوع</th>
                            <SortableHeader label="المجتمعات" sortKey="communities_count" sort={sort} initialDirection="desc" />
                            <SortableHeader label="المرافق" sortKey="venues_count" sort={sort} initialDirection="desc" />
                            <SortableHeader label="الفعاليات" sortKey="events_count" sort={sort} initialDirection="desc" />
                            <th>الحالة</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        <ListStates
                            count={categories.data.length}
                            columns={8}
                            emptyTitle="لا توجد فئات"
                            emptyHint="لا فئة مطابقة للبحث والفلترة الحاليين."
                        />
                        {categories.data.map((cat) => (
                            <tr key={cat.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <CategoryIcon icon={cat.icon} size={32} />
                                        <div>
                                            <span style={{ fontWeight: 700, color: '#0A0A0A' }}>{cat.name}</span>
                                            {cat.parent && (
                                                <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginTop: 2 }}>
                                                    {cat.parent.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ color: 'rgba(10,10,10,.55)' }}>{cat.name_en || '—'}</td>
                                <td>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                                        background: cat.parent_id ? '#0A0A0A18' : '#C87D0018',
                                        color: cat.parent_id ? '#0A0A0A' : '#C87D00',
                                    }}>
                                        {cat.parent_id ? 'فرعية' : 'رئيسية'}
                                    </span>
                                </td>
                                <td>{cat.communities_count}</td>
                                <td>{cat.venues_count}</td>
                                <td>{cat.events_count}</td>
                                <td>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                                        background: cat.deleted_at ? '#D9381E18' : '#2E7D3218',
                                        color: cat.deleted_at ? '#D9381E' : '#2E7D32',
                                    }}>
                                        {cat.deleted_at ? 'معطّلة' : 'مفعّلة'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => { setEditingItem(cat); setShowCreate(false); }}
                                        className="act-btn btn-view"
                                    >
                                        تعديل
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination links={categories.links} />

            {/* Create/Edit Modal */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={closePanel}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل فئة' : 'إضافة فئة'}
                            <button className="close-btn" onClick={closePanel}>×</button>
                        </h3>

                        {Object.keys(form.errors).length > 0 && (
                            <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                                {Object.values(form.errors).map((error, i) => (
                                    <p key={i} style={{ fontSize: '12px', color: '#D9381E', margin: '0 0 4px' }}>{error}</p>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Icon upload */}
                            <div className="frow">
                                <div className="fg" style={{ gridColumn: '1 / -1' }}>
                                    <label>الأيقونة</label>
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
                                            width: '100%', minHeight: 120, background: '#F6F8F5', border: '2px dashed rgba(10,10,10,.1)',
                                            borderRadius: 12, cursor: 'pointer', transition: 'border-color .15s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2E7D32')}
                                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(10,10,10,.1)')}
                                    >
                                        {iconPreview && (iconPreview.startsWith('/storage') || iconPreview.startsWith('data:')) ? (
                                            <img src={iconPreview} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
                                        ) : iconPreview ? (
                                            <div style={{ fontSize: 48 }}>{iconPreview}</div>
                                        ) : (
                                            <div style={{ fontSize: 36, color: '#0A0A0A' }}>📷</div>
                                        )}
                                        <span style={{ fontSize: 12, color: 'rgba(10,10,10,.55)' }}>
                                            {iconPreview ? 'انقر لتغيير الأيقونة' : 'انقر لرفع أيقونة'}
                                        </span>
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className="frow">
                                <div className="fg">
                                    <label>الاسم بالعربية *</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="كرة القدم"
                                        required
                                    />
                                </div>
                                <div className="fg">
                                    <label>الاسم بالإنجليزية</label>
                                    <input
                                        type="text"
                                        value={form.data.name_en}
                                        onChange={(e) => form.setData('name_en', e.target.value)}
                                        placeholder="Football"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="frow">
                                <div className="fg" style={{ gridColumn: '1 / -1' }}>
                                    <label>الفئة الرئيسية</label>
                                    <select
                                        value={form.data.parent_id}
                                        onChange={(e) => form.setData('parent_id', e.target.value)}
                                    >
                                        <option value="">بدون (فئة رئيسية)</option>
                                        {parentCategories
                                            .filter((p) => p.id !== editingItem?.id)
                                            .map((p) => (
                                                <option key={p.id} value={String(p.id)}>{p.name}</option>
                                            ))}
                                    </select>
                                    <span style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginTop: 4, display: 'block' }}>
                                        اتركه فارغاً لإنشاء فئة رئيسية، أو اختر فئة لجعلها فرعية
                                    </span>
                                </div>
                            </div>

                            {editingItem && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: editingItem.deleted_at ? '#D9381E10' : '#2E7D3210', border: `1px solid ${editingItem.deleted_at ? '#D9381E33' : '#2E7D3233'}`, borderRadius: 12, marginBottom: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: editingItem.deleted_at ? '#D9381E' : '#2E7D32' }}>
                                            {editingItem.deleted_at ? 'هذه الفئة معطّلة' : 'هذه الفئة مفعّلة'}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginTop: 2 }}>
                                            {editingItem.deleted_at ? 'لن تظهر في بقية الأقسام' : 'تظهر في جميع الأقسام'}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleStatus(editingItem)}
                                        className={editingItem.deleted_at ? 'act-btn btn-approve' : 'act-btn btn-reject'}
                                    >
                                        {editingItem.deleted_at ? 'تفعيل' : 'تعطيل'}
                                    </button>
                                </div>
                            )}

                            <div className="panel-actions">
                                <button type="submit" className="pa-approve" disabled={form.processing}>
                                    {editingItem ? 'حفظ التعديلات' : 'إضافة الفئة'}
                                </button>
                                <button type="button" className="pa-reject" onClick={closePanel}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
