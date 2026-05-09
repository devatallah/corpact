import AdminLayout from '@/layouts/admin-layout';
import SportIcon from '@/components/sport-icon';
import Pagination from '@/components/pagination';
import type { Sport, PaginatedResult } from '@/types/models';
import { Head, useForm, router } from '@inertiajs/react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { useState, useEffect, useRef } from 'react';
import toastr from 'toastr';

interface SportWithCounts extends Sport {
    communities_count: number;
    courts_count: number;
    events_count: number;
    deleted_at: string | null;
}

interface Props {
    sports: PaginatedResult<SportWithCounts>;
    totalSports: number;
    filters: { search?: string };
}

export default function SportsIndex({ sports, totalSports, filters }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {});
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<SportWithCounts | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        name: '',
        name_en: '',
        icon: null as File | null,
    });

    useEffect(() => {
        if (editingItem) {
            form.setData({
                name: editingItem.name ?? '',
                name_en: editingItem.name_en ?? '',
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
            router.post(`/admin/sports/${editingItem.id}`, {
                _method: 'PUT',
                name: form.data.name,
                name_en: form.data.name_en,
                icon: form.data.icon ?? undefined,
            }, {
                forceFormData: true,
                onSuccess: () => { setEditingItem(null); toastr.success('تم التحديث بنجاح.'); },
            });
        } else {
            form.post('/admin/sports', {
                forceFormData: true,
                onSuccess: () => { setShowCreate(false); form.reset(); setIconPreview(null); toastr.success('تم الإنشاء بنجاح.'); },
            });
        }
    }

    function toggleStatus(sport: SportWithCounts) {
        const url = sport.deleted_at
            ? `/admin/sports/${sport.id}/restore`
            : `/admin/sports/${sport.id}`;
        const method = sport.deleted_at ? 'post' : 'delete';
        const msg = sport.deleted_at ? 'تم التفعيل بنجاح.' : 'تم التعطيل بنجاح.';
        router[method](url, { preserveScroll: true, onSuccess: () => { setEditingItem(null); toastr.success(msg); } });
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
            <Head title="إدارة الرياضات" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div className="page-title">إدارة الرياضات</div>
                <button onClick={openCreate} className="act-btn btn-approve">
                    إضافة رياضة
                </button>
            </div>
            <div className="page-sub">
                {totalSports} رياضة على المنصة
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث بالاسم..."
                    style={{ padding: '9px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 200 }}
                />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الرياضة</th>
                            <th>الاسم بالإنجليزية</th>
                            <th>المجتمعات</th>
                            <th>الملاعب</th>
                            <th>الفعاليات</th>
                            <th>الحالة</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sports.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', color: '#6B7A99', padding: '20px' }}>
                                    لا توجد رياضات
                                </td>
                            </tr>
                        ) : (
                            sports.data.map((sport) => (
                                <tr key={sport.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <SportIcon icon={sport.icon} size={32} />
                                            <span style={{ fontWeight: 700, color: '#fff' }}>{sport.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: '#6B7A99' }}>{sport.name_en || '—'}</td>
                                    <td>{sport.communities_count}</td>
                                    <td>{sport.courts_count}</td>
                                    <td>{sport.events_count}</td>
                                    <td>
                                        <span style={{
                                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                                            background: sport.deleted_at ? '#E0305018' : '#0CA67818',
                                            color: sport.deleted_at ? '#E03050' : '#0CA678',
                                        }}>
                                            {sport.deleted_at ? 'معطّلة' : 'مفعّلة'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => { setEditingItem(sport); setShowCreate(false); }}
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

            <Pagination links={sports.links} />

            {/* Create/Edit Modal */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={closePanel}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل رياضة' : 'إضافة رياضة'}
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

                            {editingItem && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: editingItem.deleted_at ? '#E0305010' : '#0CA67810', border: `1px solid ${editingItem.deleted_at ? '#E0305033' : '#0CA67833'}`, borderRadius: 12, marginBottom: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: editingItem.deleted_at ? '#E03050' : '#0CA678' }}>
                                            {editingItem.deleted_at ? 'هذه الرياضة معطّلة' : 'هذه الرياضة مفعّلة'}
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
                                    {editingItem ? 'حفظ التعديلات' : 'إضافة الرياضة'}
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
