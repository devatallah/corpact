import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import type { FormEvent } from 'react';
import toastr from 'toastr';
import { Card, CardTitle, MetaRow, Pill, Screen } from '@/components/employee/ui';
import Pagination from '@/components/pagination';
import { SortBar  } from '@/components/sortable-header';
import type {SortState} from '@/components/sortable-header';
import EmployeeLayout from '@/layouts/employee-layout';
import type { CommunityRequest, PaginatedResult } from '@/types/models';

interface CategoryItem {
    id: number;
    name: string;
    icon: string;
    parent_id: number | null;
    children?: CategoryItem[];
}

interface Props {
    requests: PaginatedResult<CommunityRequest>;
    categories: CategoryItem[];
    pendingCount?: number;
    sort?: SortState;
}

const sortOptions = [
    { key: 'created_at', label: 'الأحدث', initialDirection: 'desc' as const },
    { key: 'name', label: 'الاسم', initialDirection: 'asc' as const },
    { key: 'status', label: 'الحالة', initialDirection: 'asc' as const },
];

type Tone = 'lime' | 'success' | 'warning' | 'danger' | 'neutral';

function statusLabel(status: string): { text: string; tone: Tone } {
    switch (status) {
        case 'pending':
            return { text: 'قيد المراجعة', tone: 'warning' };
        case 'approved':
            return { text: 'تمت الموافقة', tone: 'success' };
        case 'rejected':
            return { text: 'مرفوض', tone: 'danger' };
        default:
            return { text: status, tone: 'neutral' };
    }
}

export default function CommunityRequestsIndex({ requests, categories, pendingCount = 0, sort }: Props) {
    const items = requests?.data ?? [];
    const [showForm, setShowForm] = useState(false);

    const form = useForm({
        name: '',
        description: '',
        category_id: '',
        parent_category_id: '',
        reason: '',
    });

    const subcategories = useMemo(() => {
        if (!form.data.parent_category_id) {
return [];
}

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

    return (
        <EmployeeLayout>
            <Head title="طلبات إنشاء مجتمع" />

            <Screen>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-black text-[#0A0A0A]">طلبات إنشاء مجتمع</h1>
                        <p className="text-[11px] text-[#0A0A0A]/55 mt-0.5">
                            {pendingCount > 0 ? `${pendingCount} طلب قيد المراجعة` : 'لا توجد طلبات معلقة'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowForm(!showForm)}
                        className={`shrink-0 inline-flex items-center justify-center h-9 px-4 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer ${
                            showForm
                                ? 'bg-white text-[#0A0A0A] border-[#0A0A0A]/15 hover:border-[#0A0A0A]/40'
                                : 'bg-[#0A0A0A] text-[#C8FF00] border-[#0A0A0A] hover:bg-[#0A0A0A]/90'
                        }`}
                    >
                        {showForm ? 'إلغاء' : 'طلب جديد'}
                    </button>
                </div>

            {/* Request form */}
            {showForm && (
                <div className="card" style={{ border: '2px dashed rgba(10,10,10,.15)', marginBottom: 20 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#0A0A0A' }}>
                        اقتراح مجتمع جديد
                    </div>

                    {Object.keys(form.errors).length > 0 && (
                        <div style={{ background: '#FDEDEC', border: '1px solid rgba(217,56,30,.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
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

            {/* H §18: ترتيب ظاهر لقائمة الطلبات */}
            {items.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                    <SortBar sort={sort} options={sortOptions} />
                </div>
            )}

            {/* Requests list */}
                {items.length > 0 ? (
                    <div className="space-y-2.5">
                        {items.map((req) => {
                            const s = statusLabel(req.status);

                            return (
                                <Card key={req.id}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <CardTitle>{req.name}</CardTitle>
                                            <div className="text-[11px] text-[#0A0A0A]/55 mt-0.5">
                                                {req.category?.name} · {new Date(req.created_at).toLocaleDateString('ar-SA')}
                                            </div>
                                        </div>
                                        <Pill tone={s.tone}>{s.text}</Pill>
                                    </div>

                                    {req.description && (
                                        <p className="text-[11px] text-[#0A0A0A]/60 leading-relaxed">{req.description}</p>
                                    )}

                                    {req.reason && (
                                        <p className="text-[11px] text-[#0A0A0A]/55">
                                            <span className="font-bold text-[#0A0A0A]">السبب:</span> {req.reason}
                                        </p>
                                    )}

                                    {req.status === 'rejected' && req.rejection_reason && (
                                        <div className="rounded-xl bg-[#FDEDEC] border-[0.5px] border-[#D9381E]/25 px-3 py-2 text-[11px] text-[#D9381E] leading-relaxed">
                                            <span className="font-bold">سبب الرفض:</span> {req.rejection_reason}
                                        </div>
                                    )}

                                    {req.status === 'approved' && req.community_id && (
                                        <MetaRow
                                            right={
                                                <a href={`/employee/community/${req.community_id}`} className="hover:underline">
                                                    الذهاب للمجتمع ←
                                                </a>
                                            }
                                        />
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    !showForm && (
                        <Card>
                            <p className="text-[11px] text-[#0A0A0A]/55 text-center py-4">لم ترسل أي طلبات بعد.</p>
                        </Card>
                    )
                )}

                {requests?.links && <Pagination links={requests.links} />}
            </Screen>
        </EmployeeLayout>
    );
}
