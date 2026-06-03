import BusinessLayout from '@/layouts/business-layout';
import CategoryIcon from '@/components/category-icon';
import type { Category } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import toastr from 'toastr';

interface Props {
    categories: Category[];
}

export default function venueCreate({ categories }: Props) {
    const form = useForm({
        name: '',
        category_id: '',
        parent_category_id: '',
        status: 'active',
    });

    const subcategories = useMemo(() => {
        if (!form.data.parent_category_id) return [];
        const parent = categories.find((c) => String(c.id) === form.data.parent_category_id);
        return parent?.children ?? [];
    }, [form.data.parent_category_id, categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/business/venues', {
            onSuccess: () => toastr.success('تم إضافة المرفق بنجاح'),
        });
    };

    return (
        <BusinessLayout>
            <Head title="إضافة مرفق" />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/business/venues" style={{ color: '#8A7868', textDecoration: 'none', fontSize: 14 }}>← المرافق</Link>
                <span style={{ color: '#C8D0E0' }}>/</span>
                <span style={{ fontWeight: 700 }}>إضافة مرفق</span>
            </div>

            {/* Errors */}
            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: '#C8410A10', border: '1px solid #C8410A33', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#C8410A', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 32, maxWidth: 500 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>إضافة مرفق جديد</div>
                <form onSubmit={handleSubmit}>
                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>اسم المرفق *</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="مثال: مرفق 1"
                            required
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>الفئة *</label>
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
                        <label>الفئة الفرعية *</label>
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
                            className="act-btn btn-reject"
                            style={{ flex: 1, background: '#C8410A', color: '#fff', borderColor: '#C8410A' }}
                        >
                            حفظ
                        </button>
                        <Link
                            href="/business/venues"
                            style={{ padding: '12px 24px', background: '#E2E8F4', borderRadius: 10, color: '#4A5C78', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </BusinessLayout>
    );
}
