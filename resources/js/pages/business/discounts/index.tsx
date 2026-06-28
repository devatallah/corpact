import BusinessLayout from '@/layouts/business-layout';
import TimePicker from '@/components/time-picker';
import type { Company, Community, Discount, Category } from '@/types/models';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toastr from 'toastr';

interface CommunityWithCategory extends Community {
    category: Category;
}

interface DiscountWithRelations extends Discount {
    company: Company;
    community: CommunityWithCategory;
}

interface Props {
    discounts: DiscountWithRelations[];
    companies: Company[];
}

const TYPE_LABELS: Record<string, string> = { fixed: 'مبلغ ثابت', percentage: 'نسبة مئوية' };
const USAGE_LABELS: Record<string, string> = { one_time: 'مرة واحدة', date_range: 'فترة زمنية' };
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    active: { bg: '#18A86B20', color: '#18A86B' },
    expired: { bg: '#99999920', color: '#999' },
};

export default function DiscountsIndex({ discounts, companies }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState<DiscountWithRelations | null>(null);
    const [communities, setCommunities] = useState<CommunityWithCategory[]>([]);
    const [loadingCommunities, setLoadingCommunities] = useState(false);

    const form = useForm({
        company_id: '' as string | number,
        community_id: '' as string | number,
        name: '',
        type: 'percentage' as string,
        value: '',
        usage: 'one_time' as string,
        starts_at: '',
        expires_at: '',
        start_time: '',
        end_time: '',
        status: 'active',
    });

    // Load communities when company changes
    useEffect(() => {
        const companyId = Number(form.data.company_id);
        if (!companyId) {
            setCommunities([]);
            return;
        }
        setLoadingCommunities(true);
        fetch(`/business/discounts/communities/${companyId}`, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((r) => r.json())
            .then((data) => {
                setCommunities(data);
                setLoadingCommunities(false);
            })
            .catch(() => setLoadingCommunities(false));
    }, [form.data.company_id]);

    useEffect(() => {
        if (editingItem) {
            form.setData({
                company_id: editingItem.company_id,
                community_id: editingItem.community_id,
                name: editingItem.name ?? '',
                type: editingItem.type,
                value: String(editingItem.value),
                usage: editingItem.usage,
                starts_at: editingItem.starts_at?.slice(0, 10) ?? '',
                expires_at: editingItem.expires_at?.slice(0, 10) ?? '',
                start_time: editingItem.start_time?.slice(0, 5) ?? '',
                end_time: editingItem.end_time?.slice(0, 5) ?? '',
                status: editingItem.status,
            });
        } else if (!showCreate) {
            form.reset();
            setCommunities([]);
        }
    }, [editingItem]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            form.put('/business/discounts/' + editingItem.id, {
                onSuccess: () => {
                    setEditingItem(null);
                    toastr.success('تم تعديل الخصم بنجاح');
                },
            });
        } else {
            form.post('/business/discounts', {
                onSuccess: () => {
                    setShowCreate(false);
                    form.reset();
                    toastr.success('تم إضافة الخصم بنجاح');
                },
            });
        }
    };

    const handleDelete = (discount: DiscountWithRelations) => {
        if (!confirm('هل أنت متأكد من حذف هذا الخصم؟')) return;
        router.delete('/business/discounts/' + discount.id, {
            onSuccess: () => toastr.success('تم حذف الخصم بنجاح'),
        });
    };

    function formatValue(d: Discount) {
        return d.type === 'percentage' ? `${d.value}%` : `${Number(d.value).toLocaleString()} ر.س`;
    }

    return (
        <BusinessLayout>
            <Head title="إدارة الخصومات" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <div className="page-title">إدارة الخصومات</div>
                    <div className="page-sub">أنشئ خصومات للشركات ومجتمعاتها</div>
                </div>
                <button
                    onClick={() => { form.setData({ company_id: '', community_id: '', name: '', type: 'percentage', value: '', usage: 'one_time', starts_at: '', expires_at: '', start_time: '', end_time: '', status: 'active' }); setCommunities([]); setShowCreate(true); }}
                    className="ac-btn"
                >
                    + إضافة خصم
                </button>
            </div>

            <div>
                {discounts.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🏷️</div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>لا توجد خصومات</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>أنشئ خصمك الأول من الزر أعلاه</div>
                    </div>
                ) : (
                    discounts.map((discount) => {
                        const statusStyle = STATUS_COLORS[discount.status] ?? STATUS_COLORS.expired;
                        const usedCount = discount.used_count ?? 0;
                        return (
                            <div className="card" style={{ marginBottom: 14 }} key={discount.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <span style={{ fontSize: 15, fontWeight: 800, color: '#0A0A0A' }}>
                                                {discount.name || formatValue(discount)}
                                            </span>
                                            <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                                                {discount.status === 'active' ? 'نشط' : 'منتهي'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: '#999', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <span>{discount.company?.name} — {discount.community?.name}</span>
                                            <span>
                                                {TYPE_LABELS[discount.type]}: {formatValue(discount)}
                                                {' · '}
                                                {USAGE_LABELS[discount.usage]}
                                                {discount.usage === 'one_time' && usedCount > 0 && ' (مُستخدم)'}
                                            </span>
                                            {discount.starts_at && discount.expires_at && (
                                                <span>من {discount.starts_at.slice(0, 10)} إلى {discount.expires_at.slice(0, 10)}</span>
                                            )}
                                            {discount.start_time && discount.end_time && (
                                                <span>الساعات: {discount.start_time.slice(0, 5)} - {discount.end_time.slice(0, 5)}</span>
                                            )}
                                            {usedCount > 0 && (
                                                <span>استُخدم {usedCount} {usedCount === 1 ? 'مرة' : 'مرات'}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                            onClick={() => setEditingItem(discount)}
                                            className="btn btn-outline"
                                            style={{ padding: '5px 12px', fontSize: 12 }}
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(discount)}
                                            className="btn btn-danger"
                                            style={{ padding: '5px 12px', fontSize: 12 }}
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create / Edit Panel */}
            {(showCreate || editingItem) && (
                <div className="detail-overlay open" onClick={() => { setShowCreate(false); setEditingItem(null); }}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {editingItem ? 'تعديل خصم' : 'إضافة خصم'}
                            <button className="close-btn" onClick={() => { setShowCreate(false); setEditingItem(null); }}>×</button>
                        </h3>
                        <form onSubmit={handleSubmit}>
                            {/* Name */}
                            <div className="fg" style={{ marginBottom: 12 }}>
                                <label>اسم الخصم (اختياري)</label>
                                <input
                                    type="text"
                                    placeholder="مثال: خصم الصيف"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                />
                            </div>

                            {/* Type & Value */}
                            <div className="frow">
                                <div className="fg">
                                    <label>نوع الخصم</label>
                                    <select value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
                                        <option value="percentage">نسبة مئوية (%)</option>
                                        <option value="fixed">مبلغ ثابت (ر.س)</option>
                                    </select>
                                    {form.errors.type && <div className="field-error">{form.errors.type}</div>}
                                </div>
                                <div className="fg">
                                    <label>القيمة {form.data.type === 'percentage' ? '(%)' : '(ر.س)'}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.data.value}
                                        onChange={(e) => form.setData('value', e.target.value)}
                                        required
                                    />
                                    {form.errors.value && <div className="field-error">{form.errors.value}</div>}
                                </div>
                            </div>

                            {/* Company & Community */}
                            {!editingItem && (
                                <div className="frow">
                                    <div className="fg">
                                        <label>الشركة</label>
                                        <select
                                            value={form.data.company_id}
                                            onChange={(e) => {
                                                form.setData((prev) => ({ ...prev, company_id: e.target.value, community_id: '' }));
                                            }}
                                            required
                                        >
                                            <option value="">اختر الشركة...</option>
                                            {companies.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        {form.errors.company_id && <div className="field-error">{form.errors.company_id}</div>}
                                    </div>
                                    <div className="fg">
                                        <label>المجتمع</label>
                                        <select
                                            value={form.data.community_id}
                                            onChange={(e) => form.setData('community_id', e.target.value)}
                                            disabled={!form.data.company_id || loadingCommunities}
                                            required
                                        >
                                            <option value="">{loadingCommunities ? 'جاري التحميل...' : 'اختر المجتمع...'}</option>
                                            {communities.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.category?.name})</option>
                                            ))}
                                        </select>
                                        {form.errors.community_id && <div className="field-error">{form.errors.community_id}</div>}
                                    </div>
                                </div>
                            )}

                            {/* Usage */}
                            <div className="fg" style={{ marginBottom: 12 }}>
                                <label>نوع الاستخدام</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {(['one_time', 'date_range'] as const).map((u) => {
                                        const isActive = form.data.usage === u;
                                        return (
                                            <button
                                                key={u}
                                                type="button"
                                                onClick={() => form.setData('usage', u)}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 14px',
                                                    borderRadius: 10,
                                                    border: `2px solid ${isActive ? '#18A86B' : '#EBEBEB'}`,
                                                    background: isActive ? '#18A86B10' : '#fff',
                                                    color: isActive ? '#18A86B' : '#999',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    fontFamily: 'inherit',
                                                }}
                                            >
                                                {USAGE_LABELS[u]}
                                            </button>
                                        );
                                    })}
                                </div>
                                {form.errors.usage && <div className="field-error">{form.errors.usage}</div>}
                            </div>

                            {/* Date range (only for date_range) */}
                            {form.data.usage === 'date_range' && (
                                <div className="frow">
                                    <div className="fg">
                                        <label>تاريخ البداية</label>
                                        <input
                                            type="date"
                                            value={form.data.starts_at}
                                            onChange={(e) => form.setData('starts_at', e.target.value)}
                                            required
                                        />
                                        {form.errors.starts_at && <div className="field-error">{form.errors.starts_at}</div>}
                                    </div>
                                    <div className="fg">
                                        <label>تاريخ الانتهاء</label>
                                        <input
                                            type="date"
                                            value={form.data.expires_at}
                                            onChange={(e) => form.setData('expires_at', e.target.value)}
                                            required
                                        />
                                        {form.errors.expires_at && <div className="field-error">{form.errors.expires_at}</div>}
                                    </div>
                                </div>
                            )}

                            {/* Time restriction */}
                            <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#999', fontWeight: 600, marginBottom: 8 }}>
                                    تقييد بساعات محددة (اختياري)
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 11, color: '#999', minWidth: 30 }}>من</span>
                                    <TimePicker value={form.data.start_time} onChange={(v) => form.setData('start_time', v)} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 13 }} />
                                    <span style={{ fontSize: 11, color: '#999', minWidth: 30 }}>إلى</span>
                                    <TimePicker value={form.data.end_time} onChange={(v) => form.setData('end_time', v)} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #EBEBEB', fontSize: 13 }} />
                                </div>
                                {form.errors.start_time && <div className="field-error">{form.errors.start_time}</div>}
                                {form.errors.end_time && <div className="field-error">{form.errors.end_time}</div>}
                            </div>

                            {/* Status (only when editing) */}
                            {editingItem && (
                                <div className="fg" style={{ marginBottom: 12 }}>
                                    <label>الحالة</label>
                                    <select value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                                        <option value="active">نشط</option>
                                        <option value="expired">منتهي</option>
                                    </select>
                                </div>
                            )}

                            <div className="panel-actions">
                                <button type="submit" className="pa-approve" disabled={form.processing}>حفظ</button>
                                <button type="button" className="pa-reject" onClick={() => { setShowCreate(false); setEditingItem(null); }}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </BusinessLayout>
    );
}
