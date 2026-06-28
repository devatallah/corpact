import CompanyLayout from '@/layouts/company-layout';
import CategoryIcon from '@/components/category-icon';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import type { FormEvent } from 'react';
import toastr from 'toastr';

interface CategoryItem {
    id: number;
    name: string;
    icon: string;
    parent_id: number | null;
    children?: CategoryItem[];
}

interface Props {
    employees: { id: number; name: string }[];
    categories: CategoryItem[];
}

export default function CommunityCreate({ employees, categories }: Props) {
    const form = useForm({
        name: '',
        description: '',
        category_id: '',
        parent_category_id: '',
        leader_id: '',
    });

    const subcategories = useMemo(() => {
        if (!form.data.parent_category_id) return [];
        const parent = categories.find((c) => String(c.id) === form.data.parent_category_id);
        return parent?.children ?? [];
    }, [form.data.parent_category_id, categories]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.post('/company/communities', {
            onSuccess: () => toastr.success('تم إنشاء المجتمع بنجاح'),
        });
    }

    return (
        <CompanyLayout>
            <Head title="إنشاء مجتمع" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/company/communities" style={{ color: '#999', textDecoration: 'none', fontSize: 14 }}>
                    ← المجتمعات
                </Link>
                <span style={{ color: '#EBEBEB' }}>/</span>
                <span style={{ fontWeight: 700 }}>إنشاء مجتمع</span>
            </div>

            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: '#E0305010', border: '1px solid #E0305033', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div className="card" style={{ maxWidth: 600 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>إنشاء مجتمع جديد</div>
                <form onSubmit={handleSubmit}>
                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>اسم المجتمع *</label>
                        <input
                            type="text"
                            placeholder="مثال: فريق كرة القدم"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            required
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label>الوصف</label>
                        <textarea
                            rows={3}
                            placeholder="وصف المجتمع..."
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div className="fg">
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
                                required
                            >
                                <option value="">اختر الفئة</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="fg">
                            <label>الفئة الفرعية *</label>
                            <select
                                value={form.data.category_id}
                                onChange={(e) => form.setData('category_id', e.target.value)}
                                disabled={!form.data.parent_category_id || subcategories.length === 0}
                            >
                                <option value="">{form.data.parent_category_id ? 'اختر الفئة الفرعية' : 'اختر الفئة أولاً'}</option>
                                {subcategories.map((sub) => (
                                    <option key={sub.id} value={String(sub.id)}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="fg" style={{ marginBottom: 24 }}>
                        <label>القائد *</label>
                        <select
                            value={form.data.leader_id}
                            onChange={(e) => form.setData('leader_id', e.target.value)}
                            required
                        >
                            <option value="">اختر القائد</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" className="ac-btn" style={{ flex: 1 }} disabled={form.processing}>
                            إنشاء
                        </button>
                        <Link
                            href="/company/communities"
                            className="ac-btn secondary"
                            style={{ padding: '12px 24px', textDecoration: 'none', textAlign: 'center' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </CompanyLayout>
    );
}
