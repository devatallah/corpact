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

function statusLabel(status: string): { text: string; badgeClass: string } {
    switch (status) {
        case 'pending':
            return { text: 'قيد المراجعة', badgeClass: 'b-pending' };
        case 'approved':
            return { text: 'تمت الموافقة', badgeClass: 'b-confirmed' };
        case 'rejected':
            return { text: 'مرفوض', badgeClass: 'b-cancelled' };
        default:
            return { text: status, badgeClass: 'b-completed' };
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

            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.5px' }}>طلبات إنشاء مجتمع</h1>
                        <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                            {pendingCount > 0 ? `${pendingCount} طلب قيد المراجعة` : 'لا توجد طلبات معلقة'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`btn ${showForm ? 'btn-outline' : 'btn-primary'}`}
                        style={{ fontSize: 13 }}
                    >
                        {showForm ? 'إلغاء' : '+ طلب جديد'}
                    </button>
                </div>
            </div>

            {/* Request form */}
            {showForm && (
                <div className="card" style={{ border: '2px dashed #EBEBEB', marginBottom: 20 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#18A86B' }}>
                        اقتراح مجتمع جديد
                    </div>

                    {Object.keys(form.errors).length > 0 && (
                        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                            {Object.values(form.errors).map((error, i) => (
                                <p key={i} className="field-error" style={{ margin: '0 0 2px' }}>{error}</p>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', display: 'block', marginBottom: 6 }}>
                                اسم المجتمع *
                            </label>
                            <input
                                type="text"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="مثال: فريق كرة القدم"
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', display: 'block', marginBottom: 6 }}>
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
                                >
                                    <option value="">اختر الفئة</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', display: 'block', marginBottom: 6 }}>
                                    الفئة الفرعية
                                </label>
                                <select
                                    value={form.data.category_id}
                                    onChange={(e) => form.setData('category_id', e.target.value)}
                                    disabled={!form.data.parent_category_id || subcategories.length === 0}
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

                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', display: 'block', marginBottom: 6 }}>
                                وصف المجتمع
                            </label>
                            <textarea
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                placeholder="وصف المجتمع والأنشطة المتوقعة..."
                                rows={2}
                                style={{ resize: 'none' }}
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', display: 'block', marginBottom: 6 }}>
                                سبب الطلب
                            </label>
                            <textarea
                                value={form.data.reason}
                                onChange={(e) => form.setData('reason', e.target.value)}
                                placeholder="لماذا تريد إنشاء هذا المجتمع؟"
                                rows={2}
                                style={{ resize: 'none' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={form.processing}
                            style={{ opacity: form.processing ? 0.6 : 1 }}
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
                        <div key={req.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 600 }}>{req.name}</div>
                                    <div style={{ fontSize: 12, color: '#999', marginTop: 3 }}>
                                        {req.category?.name} · {new Date(req.created_at).toLocaleDateString('ar-SA')}
                                    </div>
                                </div>
                                <span className={`badge ${s.badgeClass}`}>
                                    {s.text}
                                </span>
                            </div>

                            {req.description && (
                                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 8 }}>
                                    {req.description}
                                </div>
                            )}

                            {req.reason && (
                                <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>
                                    <span style={{ fontWeight: 600 }}>السبب:</span> {req.reason}
                                </div>
                            )}

                            {req.status === 'rejected' && req.rejection_reason && (
                                <div style={{
                                    fontSize: 13, color: '#EF4444', background: '#FEF2F2',
                                    borderRadius: 10, padding: '8px 12px', marginTop: 8,
                                }}>
                                    <span style={{ fontWeight: 600 }}>سبب الرفض:</span> {req.rejection_reason}
                                </div>
                            )}

                            {req.status === 'approved' && req.community_id && (
                                <a
                                    href={`/employee/community/${req.community_id}`}
                                    style={{
                                        display: 'inline-block', marginTop: 8, fontSize: 13,
                                        color: '#18A86B', fontWeight: 600, textDecoration: 'none',
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
                    <div className="empty">
                        <div className="ico">📝</div>
                        <div className="txt">لم ترسل أي طلبات بعد.</div>
                    </div>
                )
            )}
        </EmployeeLayout>
    );
}
