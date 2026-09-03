import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';
import ConfirmModal from '@/components/confirm-modal';
import { Card, Screen, Section } from '@/components/employee/ui';
import { BackLink, ListState } from '@/components/list-states';
import EmployeeLayout from '@/layouts/employee-layout';

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

        if (!partnerId) {
return;
}

        router.delete(`/employee/communities/${community.id}/preferred-providers/${partnerId}`, {
            preserveScroll: true,
            onSuccess: () => toastr.success('أُزيل المزوّد من المفضّلين.'),
        });
    }

    return (
        <EmployeeLayout>
            <Head title="المزوّدون المفضّلون" />

            <Screen>
                <div>
                    <BackLink href={`/employee/community/${community.id}`} label={`العودة إلى ${community.name}`} />
                    <h1 className="text-lg font-black text-[#0A0A0A] mt-2">المزوّدون المفضّلون</h1>
                    <p className="text-[11px] text-[#0A0A0A]/60 leading-relaxed mt-1">
                        من تختاره هنا يُرتَّب <b className="text-[#0A0A0A]">قبل غيره دائماً</b> عند اقتراح المزوّد لفعاليات «{community.name}» —
                        ثم يأتي الباقي بالسعر ضمن الميزانية فمؤشر الموثوقية.
                    </p>
                </div>

                <Section title="القائمة الحالية">
                    {preferred.length === 0 ? (
                        <Card>
                            <ListState
                                tone="empty"
                                title="لا مزوّدين مفضّلين بعد"
                                hint="أضف مزوّداً تعرفه ليُقترح أولاً — الاقتراح الآلي يعمل بدونهم أيضاً."
                            />
                        </Card>
                    ) : (
                        <div className="space-y-2.5">
                            {preferred.map((row) => (
                                <Card key={row.id}>
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <div className="min-w-0">
                                            <div className="text-xs font-black text-[#0A0A0A]">
                                                <span className="text-[#0A0A0A]/50 me-1.5 font-mono">{row.position}.</span>
                                                {row.partner?.name ?? '—'}
                                            </div>
                                            <div className="text-[11px] text-[#0A0A0A]/55 mt-0.5">
                                                {[row.partner?.district, row.partner?.city].filter(Boolean).join('، ') || '—'}
                                                {row.partner?.reliability !== null && row.partner !== null
                                                    ? ` · الموثوقية ${row.partner.reliability}%`
                                                    : ` · الموثوقية غير معروضة (${row.partner?.reliability_samples ?? 0} من 10 عينات)`}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setRemoveTarget(row)}
                                            className="shrink-0 h-8 px-3.5 rounded-full bg-[#FDEDEC] text-[#D9381E] text-xs font-bold border-[0.5px] border-[#D9381E]/25 hover:bg-[#D9381E] hover:text-white transition-colors cursor-pointer"
                                        >
                                            إزالة
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </Section>

                <Section title="إضافة مزوّد">
                    <Card>
                        {available.length === 0 ? (
                            <ListState tone="empty" title="لا مزوّدين متاحين للإضافة" hint="كل المزوّدين النشطين مضافون بالفعل." />
                        ) : (
                            <form onSubmit={add} className="flex gap-2 flex-wrap">
                                <select
                                    value={form.data.partner_id}
                                    onChange={(e) => form.setData('partner_id', e.target.value)}
                                    required
                                    className="flex-1 min-w-[220px] h-9 px-3 rounded-xl text-xs font-arabic bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/15 hover:border-[#0A0A0A]/30 focus-visible:ring-2 focus-visible:ring-[#C8FF00] outline-none cursor-pointer"
                                >
                                    <option value="">اختر مزوّداً…</option>
                                    {available.map((partner) => (
                                        <option key={partner.id} value={partner.id}>
                                            {partner.name}
                                            {partner.district ? ` — ${partner.district}` : ''}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    disabled={form.processing || ! form.data.partner_id}
                                    className="shrink-0 h-9 px-5 rounded-full bg-[#0A0A0A] text-[#C8FF00] text-xs font-bold border-[0.5px] border-[#0A0A0A] hover:bg-[#0A0A0A]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    إضافة
                                </button>
                            </form>
                        )}
                    </Card>
                </Section>
            </Screen>

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
