import AdminLayout from '@/layouts/admin-layout';
import CategoryIcon from '@/components/category-icon';
import Pagination from '@/components/pagination';
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
    filters: { search?: string };
}

export default function SportsIndex({ categories, parentCategories, totalSports, filters }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {});
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div className="page-title">إدارة الفئات</div>
                <button onClick={openCreate} className="act-btn btn-approve">
                    إضافة فئة
                </button>
            </div>
            <div className="page-sub">
                {totalSports} فئة على المنصة
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالاسم..."
                    style={{ padding: '9px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 200 }}
                />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الفئة</th>
                            <th>الاسم بالإنجليزية</th>
                            <th>النوع</th>
                            <th>المجتمعات</th>
                            <th>المرافق</th>
                            <th>الفعاليات</th>
                            <th>الحالة</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.data.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', color: '#6B7A99', padding: '20px' }}>
                                    لا توجد فئات
                                </td>
                            </tr>
                        ) : (
                            categories.data.map((cat) => (
                                <tr key={cat.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <CategoryIcon icon={cat.icon} size={32} />
                                            <div>
                                                <span style={{ fontWeight: 700, color: '#fff' }}>{cat.name}</span>
                                                {cat.parent && (
                                                    <div style={{ fontSize: 11, color: '#6B7A99', marginTop: 2 }}>
                                                        {cat.parent.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: '#6B7A99' }}>{cat.name_en || '—'}</td>
                                    <td>
                                        <span style={{
                                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                                            background: cat.parent_id ? '#3B82F618' : '#F59E0B18',
                                            color: cat.parent_id ? '#3B82F6' : '#F59E0B',
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
                                            background: cat.deleted_at ? '#E0305018' : '#0CA67818',
                                            color: cat.deleted_at ? '#E03050' : '#0CA678',
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
                            ))
                        )}
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
                                    <p key={i} style={{ fontSize: '12px', color: '#E03050', margin: '0 0 4px' }}>{error}</p>
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
                                            width: '100%', minHeight: 120, background: '#0F1117', border: '2px dashed #232A3E',
                                            borderRadius: 12, cursor: 'pointer', transition: 'border-color .15s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#009E82')}
                                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#232A3E')}
                                    >
                                        {iconPreview && (iconPreview.startsWith('/storage') || iconPreview.startsWith('data:')) ? (
                                            <img src={iconPreview} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
                                        ) : iconPreview ? (
                                            <div style={{ fontSize: 48 }}>{iconPreview}</div>
                                        ) : (
                                            <div style={{ fontSize: 36, color: '#3D4A60' }}>📷</div>
                                        )}
                                        <span style={{ fontSize: 12, color: '#6B7A99' }}>
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
                                    <span style={{ fontSize: 11, color: '#6B7A99', marginTop: 4, display: 'block' }}>
                                        اتركه فارغاً لإنشاء فئة رئيسية، أو اختر فئة لجعلها فرعية
                                    </span>
                                </div>
                            </div>

                            {editingItem && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: editingItem.deleted_at ? '#E0305010' : '#0CA67810', border: `1px solid ${editingItem.deleted_at ? '#E0305033' : '#0CA67833'}`, borderRadius: 12, marginBottom: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: editingItem.deleted_at ? '#E03050' : '#0CA678' }}>
                                            {editingItem.deleted_at ? 'هذه الفئة معطّلة' : 'هذه الفئة مفعّلة'}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#6B7A99', marginTop: 2 }}>
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
