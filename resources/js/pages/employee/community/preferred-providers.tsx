import ConfirmModal from '@/components/confirm-modal';
import { BackLink, ListState } from '@/components/list-states';
import EmployeeLayout from '@/layouts/employee-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';

/**
 * H §18 (قائد المجتمع): «إدارة المزوّدين المفضّلين».
 * H §11: المفضّلون **يُرتَّبون قبل غيرهم دائماً** في الاقتراح الآلي، ومؤشر
 * الموثوقية لا يُعرض قبل بلوغ 10 عينات.
 */

interface PreferredRow {
    id: number;
    position: number;
    partner: {
        id: number;
        name: string;
        city: string | null;
        district: string | null;
        reliability: number | null;
        reliability_samples: number;
    } | null;
}

interface AvailableRow {
    id: number;
    name: string;
    city: string | null;
    district: string | null;
}

interface Props {
    community: { id: number; name: string };
    preferred: PreferredRow[];
    available: AvailableRow[];
}

export default function PreferredProviders({ community, preferred, available }: Props) {
    const [removeTarget, setRemoveTarget] = useState<PreferredRow | null>(null);
    const form = useForm({ partner_id: '' });

    function add(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/employee/communities/${community.id}/preferred-providers`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                toastr.success('أُضيف المزوّد إلى المفضّلين.');
            },
        });
    }

    function confirmRemove() {
        const partnerId = removeTarget?.partner?.id;
        setRemoveTarget(null);
        if (!partnerId) return;
        router.delete(`/employee/communities/${community.id}/preferred-providers/${partnerId}`, {
            preserveScroll: true,
            onSuccess: () => toastr.success('أُزيل المزوّد من المفضّلين.'),
        });
    }

    return (
        <EmployeeLayout>
            <Head title="المزوّدون المفضّلون" />

            <BackLink href={`/employee/community/${community.id}`} label={`العودة إلى ${community.name}`} />

            <h1 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0' }}>المزوّدون المفضّلون</h1>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.9 }}>
                من تختاره هنا يُرتَّب <b>قبل غيره دائماً</b> عند اقتراح المزوّد لفعاليات «{community.name}» — ثم يأتي
                الباقي بالسعر ضمن الميزانية فمؤشر الموثوقية.
            </p>

            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 14, padding: 18, marginTop: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>القائمة الحالية</div>

                {preferred.length === 0 ? (
                    <ListState
                        tone="empty"
                        title="لا مزوّدين مفضّلين بعد"
                        hint="أضف مزوّداً تعرفه ليُقترح أولاً — الاقتراح الآلي يعمل بدونهم أيضاً."
                    />
                ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                        {preferred.map((row) => (
                            <div
                                key={row.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '12px 14px',
                                    border: '1px solid #EBEBEB',
                                    borderRadius: 12,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 700 }}>
                                        <span style={{ color: '#999', marginInlineEnd: 6 }}>{row.position}.</span>
                                        {row.partner?.name ?? '—'}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#666' }}>
                                        {[row.partner?.district, row.partner?.city].filter(Boolean).join('، ') || '—'}
                                        {row.partner?.reliability !== null && row.partner !== null
                                            ? ` · الموثوقية ${row.partner.reliability}%`
                                            : ` · الموثوقية غير معروضة (${row.partner?.reliability_samples ?? 0} من 10 عينات)`}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setRemoveTarget(row)}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: 10,
                                        border: '1px solid #FEE2E2',
                                        background: '#FEF2F2',
                                        color: '#EF4444',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    إزالة
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 14, padding: 18, marginTop: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>إضافة مزوّد</div>

                {available.length === 0 ? (
                    <ListState tone="empty" title="لا مزوّدين متاحين للإضافة" hint="كل المزوّدين النشطين مضافون بالفعل." />
                ) : (
                    <form onSubmit={add} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <select
                            value={form.data.partner_id}
                            onChange={(e) => form.setData('partner_id', e.target.value)}
                            required
                            style={{
                                flex: 1,
                                minWidth: 220,
                                padding: '10px 12px',
                                borderRadius: 10,
                                border: '1px solid #EBEBEB',
                                fontSize: 13,
                                fontFamily: 'inherit',
                                direction: 'rtl',
                            }}
                        >
                            <option value="">اختر مزوّداً…</option>
                            {available.map((partner) => (
                                <option key={partner.id} value={partner.id}>
                                    {partner.name}
                                    {partner.city ? ` — ${partner.city}` : ''}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            disabled={form.processing || !form.data.partner_id}
                            style={{
                                padding: '10px 20px',
                                borderRadius: 10,
                                border: 'none',
                                background: '#0A0A0A',
                                color: '#C8FF00',
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            إضافة
                        </button>
                    </form>
                )}

                {form.errors.partner_id && (
                    <p style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>{form.errors.partner_id}</p>
                )}
            </div>

            <ConfirmModal
                open={removeTarget !== null}
                title="إزالة من المفضّلين"
                message={
                    removeTarget
                        ? `سيخرج «${removeTarget.partner?.name ?? ''}» من قائمة المفضّلين ويعود ليُرتَّب مع بقية المزوّدين بالسعر والموثوقية. الفعاليات القائمة معه لا تتأثر.`
                        : ''
                }
                confirmLabel="إزالة"
                onConfirm={confirmRemove}
                onCancel={() => setRemoveTarget(null)}
            />
        </EmployeeLayout>
    );
}
