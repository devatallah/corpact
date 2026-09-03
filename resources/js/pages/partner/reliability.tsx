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
                            : `${acceptanceLabel(behaviors.acceptance_rate)} · ${behaviors.accepted} مقبول من ${behaviors.total_requests}`
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
                    hint={
                        behaviors.avg_response_minutes === null
                            ? 'من لحظة وصول الطلب'
                            : behaviors.avg_response_minutes < 720
                              ? 'ضمن النطاق القياسي — أقل من المهلة القصوى بكثير'
                              : 'يتجاوز النطاق القياسي — المهلة القصوى 12 ساعة'
                    }
                    tone={
                        behaviors.avg_response_minutes !== null &&
                        behaviors.avg_response_minutes < 720
                            ? 'success'
                            : undefined
                    }
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

            {/* ── دليل أثر السلوكيات ── */}
            <Card padding="p-4" className="space-y-3">
                <div>
                    <h2 className="text-sm font-extrabold text-ink">
                        دليل أثر السلوكيات على تدفق طلبات المنصة
                    </h2>
                    <p className="text-[11px] text-ink/55">
                        ما يصلك من طلبات ليس ثابتاً — هذه هي الأشياء الثلاثة التي تحرّكه.
                    </p>
                </div>

                <Impact
                    tone="good"
                    icon={CircleCheckBig}
                    title="القبول السريع ضمن المهلة — الأثر الإيجابي الأكبر"
                    body="الردّ السريع والقبول يرفعان ترتيب مرافقك فوراً في الاقتراح الآلي لفعاليات الشركات، فتتضاعف الحجوزات المتكررة الموجّهة إليك."
                />

                <Impact
                    tone="warn"
                    icon={Clock}
                    title="التأخر في الردّ وانتهاء المهلة — يضرّ بحصتك من الطلبات"
                    body="ترك الطلب معلّقاً حتى تسقط مهلته يخفض أولويتك آلياً لصالح مزوّدين أسرع. الرفض السريع دائماً أفضل من التجاهل."
                />

                <Impact
                    tone="bad"
                    icon={X}
                    title="الإلغاء بعد القبول — الأثر الأشد ضرراً إطلاقاً"
                    body="الإلغاء بعد القبول يربك فعاليات الشركات ومنسوبيها، ويؤدي إلى تطبيق غرامات الإلغاء المنصوص عليها في عقدك واستبعاد المرفق مؤقتاً من الاقتراح. وإلغاء سببه تقويم غير محدَّث يُعامل معاملته تماماً."
                />

                <Note title="لماذا لا نعرض لك رقماً؟">
                    المؤشر رقم داخلي تستعمله المنصة في ترتيب اقتراح المرافق. عرضه هنا يحوّل الهدف من «خدمة جيدة» إلى «رقم
                    أعلى»، ولذلك تُعرض السلوكيات نفسها: هي ما تملك تغييره فعلاً.
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

function acceptanceLabel(rate: number) {
    if (rate >= 90) {
        return 'ممتاز';
    }

    return rate >= 70 ? 'جيد' : 'يحتاج تحسيناً';
}

/** أثر سلوك واحد على تدفق الطلبات — مرتّبة بقوة الأثر لا بالترتيب الزمني. */
function Impact({
    tone,
    icon: Icon,
    title,
    body,
}: {
    tone: 'good' | 'warn' | 'bad';
    icon: typeof CircleCheckBig;
    title: string;
    body: string;
}) {
    const tones = {
        good: 'border-success/25 bg-success-tint',
        warn: 'border-warning/25 bg-warning-tint',
        bad: 'border-danger/25 bg-danger-tint',
    };
    const icons = { good: 'text-success', warn: 'text-warning', bad: 'text-danger' };

    return (
        <div className={`rounded-xl border-[0.5px] p-3.5 flex items-start gap-2.5 ${tones[tone]}`}>
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${icons[tone]}`} aria-hidden="true" />
            <div className="min-w-0">
                <span className="block text-xs font-extrabold text-ink">{title}</span>
                <p className="text-[11px] text-ink/70 leading-relaxed mt-0.5">{body}</p>
            </div>
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
