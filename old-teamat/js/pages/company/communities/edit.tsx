import CompanyLayout from '@/layouts/company-layout';
import CategoryIcon from '@/components/category-icon';
import type { Community } from '@/types/models';
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
    community: Community & { leader?: { id: number; name: string }; category?: { id: number; name: string; icon: string; parent_id: number | null } };
    employees: { id: number; name: string }[];
    categories: CategoryItem[];
}

export default function CommunityEdit({ community, employees, categories }: Props) {
    const initialParentId = community.category?.parent_id
        ? String(community.category.parent_id)
        : String(community.category_id ?? '');

    const form = useForm({
        name: community.name,
        description: community.description ?? '',
        category_id: String(community.category_id ?? ''),
        parent_category_id: initialParentId,
        leader_id: String(community.leader?.id ?? ''),
    });

    const subcategories = useMemo(() => {
        if (!form.data.parent_category_id) return [];
        const parent = categories.find((c) => String(c.id) === form.data.parent_category_id);
        return parent?.children ?? [];
    }, [form.data.parent_category_id, categories]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.put(`/company/communities/${community.id}`, {
            onSuccess: () => toastr.success('تم تعديل المجتمع بنجاح'),
        });
    }

    return (
        <CompanyLayout>
            <Head title={`تعديل: ${community.name}`} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/company/communities" style={{ color: 'rgba(10,10,10,.55)', textDecoration: 'none', fontSize: 14 }}>
                    ← المجتمعات
                </Link>
                <span style={{ color: '#0A0A0A' }}>/</span>
                <span style={{ fontWeight: 700 }}>تعديل: {community.name}</span>
            </div>

            {Object.keys(form.errors).length > 0 && (
                <div style={{ background: '#D9381E10', border: '1px solid #D9381E33', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                    {Object.values(form.errors).map((error, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#D9381E', margin: '0 0 4px' }}>{error}</p>
                    ))}
                </div>
            )}

            <div style={{ background: '#fff', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 16, padding: 32, maxWidth: 600 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>تعديل المجتمع</div>
                <form onSubmit={handleSubmit}>
                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label className="fl">اسم المجتمع</label>
                        <input
                            type="text"
                            className="fi"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                        />
                    </div>

                    <div className="fg" style={{ marginBottom: 16 }}>
                        <label className="fl">الوصف</label>
                        <textarea
                            className="fi"
                            rows={3}
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div className="fg">
                            <label className="fl">الفئة</label>
                            <select
                                className="fi"
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
                                    <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="fg">
                            <label className="fl">الفئة الفرعية</label>
                            <select
                                className="fi"
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
                        <label className="fl">القائد</label>
                        <select
                            className="fi"
                            value={form.data.leader_id}
                            onChange={(e) => form.setData('leader_id', e.target.value)}
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
                        <button type="submit" className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] bg-[#0A0A0A] text-[#C8FF00] border-[#0A0A0A] hover:bg-[#0A0A0A]/90" style={{ flex: 1 }} disabled={form.processing}>
                            حفظ التعديلات
                        </button>
                        <Link
                            href="/company/communities"
                            style={{ padding: '12px 24px', background: '#F6F8F5', borderRadius: 10, color: 'rgba(10,10,10,.6)', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
                        >
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </CompanyLayout>
    );
}
