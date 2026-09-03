import { Head } from '@inertiajs/react';
import { CircleCheckBig, Clock, ShieldCheck, X } from 'lucide-react';
import { Card, Note, PageHeader, StatCard } from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';

/**
 * H §11 — بطاقة السلوكيات.
 *
 * There is deliberately no score on this page. The platform keeps a numeric
 * reliability index, but showing it to the provider in v1 would invite
 * gaming a number instead of improving behaviour — so what is shown is the
 * behaviour itself: how often they accept, and how fast they answer.
 *
 * The page also states plainly which actions move the index and in which
 * direction, because a provider who cannot see the number still deserves to
 * know the rules it follows.
 */
export default function PartnerReliability({
    behaviors,
}: {
    behaviors: {
        acceptance_rate: number | null;
        avg_response_minutes: number | null;
        total_requests: number;
        accepted: number;
        rejected: number;
        expired: number;
    };
}) {
    const responseLabel =
        behaviors.avg_response_minutes === null
            ? '—'
            : behaviors.avg_response_minutes >= 60
              ? `${Math.floor(behaviors.avg_response_minutes / 60)} س ${behaviors.avg_response_minutes % 60} د`
              : `${behaviors.avg_response_minutes} د`;

    return (
        <PartnerLayout>
            <Head title="الموثوقية" />

            <PageHeader
                icon={ShieldCheck}
                title="موثوقيتك"
                subtitle="سلوكك مع الطلبات كما تراه المنصة — لا درجة ولا ترتيب، بل ما فعلته فعلاً."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="معدل القبول"
                    value={
                        behaviors.acceptance_rate === null
                            ? '—'
                            : `${behaviors.acceptance_rate}٪`
                    }
                    hint={
                        behaviors.acceptance_rate === null
                            ? 'لا طلبات مكتملة بعد'
                            : `من ${behaviors.total_requests} طلباً`
                    }
                    tone={
                        behaviors.acceptance_rate !== null &&
                        behaviors.acceptance_rate >= 70
                            ? 'success'
                            : undefined
                    }
                />
                <StatCard
                    label="متوسط زمن ردّك"
                    value={responseLabel}
                    hint="من لحظة وصول الطلب"
                />
                <StatCard
                    label="طلبات قبلتها"
                    value={behaviors.accepted}
                    tone="success"
                />
                <StatCard
                    label="انتهت مهلتها دون ردّ"
                    value={behaviors.expired}
                    tone={behaviors.expired > 0 ? 'danger' : 'success'}
                    hint={
                        behaviors.expired > 0
                            ? 'الصمت يُحسب رفضاً'
                            : 'رددتَ على كل طلب'
                    }
                />
            </div>

            {/* ── ما يرفع وما يخفض ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">
                    ما يرفع موثوقيتك وما يخفضها
                </h2>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                        <Behavior
                            good
                            icon={CircleCheckBig}
                            label="قبول الطلب قبل انتهاء المهلة"
                        />
                        <Behavior
                            good
                            icon={CircleCheckBig}
                            label="فعالية تمّت دون مشاكل"
                        />
                    </div>

                    <div className="space-y-2">
                        <Behavior icon={Clock} label="ردّ بعد انتهاء المهلة" />
                        <Behavior
                            icon={X}
                            label="رفض الطلب"
                            note="أثره طفيف — الرفض الصريح أفضل من الصمت"
                        />
                        <Behavior icon={X} label="ترك الطلب حتى تنتهي مهلته" />
                        <Behavior
                            icon={X}
                            label="إلغاء حجز بعد قبوله"
                            note="الأشد أثراً بفارق كبير"
                        />
                        <Behavior
                            icon={X}
                            label="إلغاء بسبب تقويم غير محدَّث"
                            note="مثل الإلغاء بعد القبول تماماً"
                        />
                    </div>
                </div>

                <Note title="لماذا لا نعرض لك رقماً؟">
                    المؤشر رقم داخلي تستعمله المنصة في ترتيب اقتراح المرافق.
                    عرضه هنا يحوّل الهدف من «خدمة جيدة» إلى «رقم أعلى»، ولذلك
                    تُعرض السلوكيات نفسها: هي ما تملك تغييره فعلاً.
                </Note>
            </Card>

            <Card padding="p-4">
                <h2 className="mb-3 text-sm font-extrabold text-ink">
                    تفصيل طلباتك
                </h2>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <Tally label="قبلت" value={behaviors.accepted} />
                    <Tally label="رفضت" value={behaviors.rejected} />
                    <Tally label="انتهت مهلتها" value={behaviors.expired} />
                </div>
                {behaviors.total_requests === 0 && (
                    <p className="mt-4 text-center text-xs text-ink/55">
                        لا طلبات مكتملة بعد — تبدأ الأرقام بالظهور مع أول ردّ
                        منك.
                    </p>
                )}
            </Card>
        </PartnerLayout>
    );
}

function Behavior({
    icon: Icon,
    label,
    note,
    good = false,
}: {
    icon: typeof CircleCheckBig;
    label: string;
    note?: string;
    good?: boolean;
}) {
    return (
        <div
            className={`flex items-start gap-2 rounded-xl border-[0.5px] p-2.5 ${good ? 'border-success/25 bg-success-tint' : 'border-ink/12 bg-page'}`}
        >
            <Icon
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${good ? 'text-success' : 'text-ink/60'}`}
                aria-hidden="true"
            />
            <span className="min-w-0">
                <span className="block text-[11px] font-bold text-ink">
                    {label}
                </span>
                {note && (
                    <span className="block text-[10px] text-ink/55">
                        {note}
                    </span>
                )}
            </span>
        </div>
    );
}

function Tally({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border-[0.5px] border-ink/12 bg-page py-3">
            <span className="block font-mono text-xl font-black text-ink">
                {value}
            </span>
            <span className="block text-[11px] text-ink/55">{label}</span>
        </div>
    );
}
