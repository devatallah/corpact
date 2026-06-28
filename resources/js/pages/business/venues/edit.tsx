import BusinessLayout from '@/layouts/business-layout';
import type { Venue, Category } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import toastr from 'toastr';

interface Props {
    venue: Venue;
    categories: Category[];
}

export default function VenueEdit({ venue, categories }: Props) {
    const initialParentId = venue.category?.parent_id
        ? String(venue.category.parent_id)
        : String(venue.category_id);

    const form = useForm({
        name: venue.name,
        category_id: String(venue.category_id),
        parent_category_id: initialParentId,
        status: venue.status,
    });

    const subcategories = useMemo(() => {
        if (!form.data.parent_category_id) return [];
        const parent = categories.find((c) => String(c.id) === form.data.parent_category_id);
        return parent?.children ?? [];
    }, [form.data.parent_category_id, categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/business/venues/${venue.id}`, {
            onSuccess: () => toastr.success('تم تعديل المرفق بنجاح'),
        });
    };

    return (
        <BusinessLayout>
            <Head title={`تعديل: ${venue.name}`} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/business/venues" style={{ color: '#999', textDecoration: 'none', fontSize: 14 }}>← المرافق</Link>
                <span style={{ color: '#EBEBEB' }}>/</span>
                <span style={{ fontWeight: 700, color: '#0A0A0A' }}>تعديل: {venue.name}</span>
            </div>

            {/* Errors */}
            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: '#EF444410', border: '1px solid #EF444433', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#EF4444', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div className="card" style={{ maxWidth: 500, padding: 32 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0A0A0A', marginBottom: 6 }}>تعديل المرفق</div>
                <div style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
                    {venue.category?.parent?.name ? `${venue.category.parent.name} / ` : ''}{venue.category?.name ?? '-'}
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>اسم المرفق</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>الفئة</label>
                        <select
                            value={form.data.parent_category_id}
                            onChange={(e) => {
                                const parentId = e.target.value;
                                const parent = categories.find((c) => String(c.id) === parentId);
                                const hasChildren = (parent?.children?.length ?? 0) > 0;
                                form.setData({
                                    ...form.data,
                                    parent_category_id: parentId,
                                    category_id: hasChildren ? '' : parentId,
                                });
                            }}
                        >
                            <option value="">اختر الفئة</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={String(cat.id)}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>الفئة الفرعية</label>
                        <select
                            value={form.data.category_id}
                            onChange={(e) => form.setData('category_id', e.target.value)}
                            disabled={!form.data.parent_category_id || subcategories.length === 0}
                        >
                            <option value="">{form.data.parent_category_id ? 'اختر الفئة الفرعية' : 'اختر الفئة أولاً'}</option>
                            {subcategories.map((sub) => (
                                <option key={sub.id} value={String(sub.id)}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="fg" style={{ marginBottom: 24 }}>
                        <label>الحالة</label>
                        <select
                            value={form.data.status}
                            onChange={(e) => form.setData('status', e.target.value)}
                        >
                            <option value="active">نشط</option>
                            <option value="closed">مغلق</option>
                            <option value="maintenance">صيانة</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="ac-btn"
                            style={{ flex: 1 }}
                        >
                            حفظ التعديلات
                        </button>
                        <Link
                            href="/business/venues"
                            className="btn btn-outline"
                            style={{ padding: '12px 24px', textAlign: 'center', textDecoration: 'none' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </BusinessLayout>
    );
}
