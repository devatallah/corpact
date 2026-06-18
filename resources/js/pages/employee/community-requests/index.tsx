import EmployeeLayout from '@/layouts/employee-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import type { FormEvent } from 'react';
import type { CommunityRequest, Category } from '@/types/models';
import toastr from 'toastr';

interface CategoryItem {
    id: number;
    name: string;
    icon: string;
    parent_id: number | null;
    children?: CategoryItem[];
}

interface Props {
    requests: CommunityRequest[];
    categories: CategoryItem[];
}

function statusLabel(status: string): { text: string; bg: string; color: string } {
    switch (status) {
        case 'pending':
            return { text: 'قيد المراجعة', bg: '#F59E0B18', color: '#F59E0B' };
        case 'approved':
            return { text: 'تمت الموافقة', bg: '#009E8218', color: '#009E82' };
        case 'rejected':
            return { text: 'مرفوض', bg: '#E0305018', color: '#E03050' };
        default:
            return { text: status, bg: '#7A8BA818', color: '#7A8BA8' };
    }
}

export default function CommunityRequestsIndex({ requests, categories }: Props) {
    const [showForm, setShowForm] = useState(false);

    const form = useForm({
        name: '',
        description: '',
        category_id: '',
        parent_category_id: '',
        reason: '',
    });

    const subcategories = useMemo(() => {
        if (!form.data.parent_category_id) return [];
        const parent = categories.find((c) => String(c.id) === form.data.parent_category_id);
        return parent?.children ?? [];
    }, [form.data.parent_category_id, categories]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.post('/employee/community-requests', {
            preserveScroll: true,
            onSuccess: () => {
                setShowForm(false);
                form.reset();
                toastr.success('تم إرسال الطلب بنجاح');
            },
        });
    }

    const pendingCount = requests.filter((r) => r.status === 'pending').length;

    return (
        <EmployeeLayout>
            <Head title="طلبات إنشاء مجتمع" />

            <div style={{ padding: '16px 0 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>طلبات إنشاء مجتمع</div>
                        <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>
                            {pendingCount > 0 ? `${pendingCount} طلب قيد المراجعة` : 'لا توجد طلبات معلقة'}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            background: '#3B5BDB', color: '#fff', border: 'none', borderRadius: 10,
                            padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                    >
                        {showForm ? 'إلغاء' : '+ طلب جديد'}
                    </button>
                </div>

                {/* Request form */}
                {showForm && (
                    <div className="card" style={{ marginBottom: 16, border: '2px dashed #3B5BDB44' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#3B5BDB' }}>
                            اقتراح مجتمع جديد
                        </div>

                        {Object.keys(form.errors).length > 0 && (
                            <div style={{ background: '#E0305010', border: '1px solid #E0305033', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                                {Object.values(form.errors).map((error, i) => (
                                    <p key={i} style={{ fontSize: 11, color: '#E03050', margin: '0 0 2px' }}>{error}</p>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 10 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#4A5C78', display: 'block', marginBottom: 4 }}>
                                    اسم المجتمع *
                                </label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="مثال: فريق كرة القدم"
                                    required
                                    style={{
                                        width: '100%', borderRadius: 8, border: '1px solid #E4E9F2', background: '#fff',
                                        padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#4A5C78', display: 'block', marginBottom: 4 }}>
                                        الفئة *
                                    </label>
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
                                        style={{
                                            width: '100%', borderRadius: 8, border: '1px solid #E4E9F2', background: '#fff',
                                            padding: '8px 12px', fontSize: 12, outline: 'none', fontFamily: 'inherit',
                                        }}
                                    >
                                        <option value="">اختر الفئة</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#4A5C78', display: 'block', marginBottom: 4 }}>
                                        الفئة الفرعية
                                    </label>
                                    <select
                                        value={form.data.category_id}
                                        onChange={(e) => form.setData('category_id', e.target.value)}
                                        disabled={!form.data.parent_category_id || subcategories.length === 0}
                                        style={{
                                            width: '100%', borderRadius: 8, border: '1px solid #E4E9F2', background: '#fff',
                                            padding: '8px 12px', fontSize: 12, outline: 'none', fontFamily: 'inherit',
                                        }}
                                    >
                                        <option value="">
                                            {form.data.parent_category_id ? 'اختر الفئة الفرعية' : 'اختر الفئة أولاً'}
                                        </option>
                                        {subcategories.map((sub) => (
                                            <option key={sub.id} value={String(sub.id)}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: 10 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#4A5C78', display: 'block', marginBottom: 4 }}>
                                    وصف المجتمع
                                </label>
                                <textarea
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="وصف المجتمع والأنشطة المتوقعة..."
                                    rows={2}
                                    style={{
                                        width: '100%', borderRadius: 8, border: '1px solid #E4E9F2', background: '#fff',
                                        padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
                                        resize: 'none', boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: '#4A5C78', display: 'block', marginBottom: 4 }}>
                                    سبب الطلب
                                </label>
                                <textarea
                                    value={form.data.reason}
                                    onChange={(e) => form.setData('reason', e.target.value)}
                                    placeholder="لماذا تريد إنشاء هذا المجتمع؟"
                                    rows={2}
                                    style={{
                                        width: '100%', borderRadius: 8, border: '1px solid #E4E9F2', background: '#fff',
                                        padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
                                        resize: 'none', boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                style={{
                                    width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
                                    background: '#3B5BDB', color: '#fff', fontSize: 13, fontWeight: 700,
                                    cursor: 'pointer', fontFamily: 'inherit', opacity: form.processing ? 0.6 : 1,
                                }}
                            >
                                {form.processing ? 'جاري الإرسال...' : 'إرسال الطلب'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Requests list */}
                {requests.length > 0 ? (
                    requests.map((req) => {
                        const s = statusLabel(req.status);
                        return (
                            <div key={req.id} className="card" style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{req.name}</div>
                                        <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>
                                            {req.category?.name} · {new Date(req.created_at).toLocaleDateString('ar-SA')}
                                        </div>
                                    </div>
                                    <span style={{
                                        display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                                        fontSize: 10, fontWeight: 700, background: s.bg, color: s.color,
                                        flexShrink: 0,
                                    }}>
                                        {s.text}
                                    </span>
                                </div>

                                {req.description && (
                                    <div style={{ fontSize: 12, color: '#4A5C78', lineHeight: 1.5, marginBottom: 6 }}>
                                        {req.description}
                                    </div>
                                )}

                                {req.reason && (
                                    <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 6 }}>
                                        <span style={{ fontWeight: 600 }}>السبب:</span> {req.reason}
                                    </div>
                                )}

                                {req.status === 'rejected' && req.rejection_reason && (
                                    <div style={{
                                        fontSize: 11, color: '#E03050', background: '#E0305008',
                                        borderRadius: 8, padding: '6px 10px', marginTop: 6,
                                    }}>
                                        <span style={{ fontWeight: 600 }}>سبب الرفض:</span> {req.rejection_reason}
                                    </div>
                                )}

                                {req.status === 'approved' && req.community_id && (
                                    <a
                                        href={`/employee/community/${req.community_id}`}
                                        style={{
                                            display: 'inline-block', marginTop: 6, fontSize: 11,
                                            color: '#009E82', fontWeight: 700, textDecoration: 'none',
                                        }}
                                    >
                                        الذهاب للمجتمع &larr;
                                    </a>
                                )}
                            </div>
                        );
                    })
                ) : (
                    !showForm && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7A8BA8', fontSize: 13 }}>
                            لم ترسل أي طلبات بعد.
                        </div>
                    )
                )}
            </div>
        </EmployeeLayout>
    );
}
