import { Head, Link } from '@inertiajs/react';
import {
    CalendarClock,
    ClipboardList,
    Building2,
    LayoutDashboard,
    TrendingUp,
} from 'lucide-react';
import { ListStates } from '@/components/list-states';
import {
    Badge,
    Card,
    Money,
    Note,
    PageHeader,
    StatCard,
} from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';

/**
 * H §11 — لوحة المزوّد.
 *
 * The one number that must never be buried is the count of requests waiting
 * on a decision: an unanswered request expires on its own deadline, and a
 * late or missed response costs the provider reliability points — so the
 * pending card carries the warning tone whenever it is above zero, and the
 * waiting requests are listed right underneath rather than a click away.
 *
 * Note what is *not* here: participant names. The provider sees a headcount,
 * never a roster.
 */
type PendingEvent = {
    id: number;
    title: string | null;
    event_date: string | null;
    start_time: string | null;
    participants_count: number | null;
    total_amount: string | number | null;
    company?: { id: number; name: string } | null;
    category?: { id: number; name: string } | null;
};

export default function PartnerDash({
    partner,
    stats,
    pendingEvents,
}: {
    partner: {
        id: number;
        name: string;
        trade_name?: string | null;
        status: string;
    };
    stats: {
        pending_requests: number;
        monthly_bookings: number;
        monthly_revenue: number;
        partner_companies: number;
    };
    pendingEvents: PendingEvent[];
}) {
    return (
        <PartnerLayout>
            <Head title="لوحة التحكم" />

            <PageHeader
                icon={LayoutDashboard}
                title={partner.trade_name || partner.name}
                subtitle="ملخّص شهرك الحالي، والطلبات التي تنتظر ردّك."
            />

            {/* الطلبات المعلّقة ومعدل القبول في شريط المزوّد أعلى كل شاشة — هنا ما لا يظهر فيه. */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard
                    label="حجوزات هذا الشهر"
                    value={stats.monthly_bookings}
                />
                <StatCard
                    label="قيمة حجوزات الشهر"
                    value={stats.monthly_revenue.toFixed(2)}
                    hint="ريال — قبل العمولة"
                />
                <StatCard
                    label="شركات تعاملت معك"
                    value={stats.partner_companies}
                />
            </div>

            {/* ── ما ينتظر قراراً ── */}
            <Card padding="p-0" className="overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b-[0.5px] border-ink/10 p-4">
                    <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink">
                        <ClipboardList className="h-4 w-4" aria-hidden="true" />
                        بانتظار قرارك
                    </h2>
                    <Link
                        href="/partner/requests-queue"
                        className="text-[11px] font-bold text-ink/70 hover:text-ink"
                    >
                        كل الطلبات ←
                    </Link>
                </div>

                <div className="divide-y-[0.5px] divide-ink/10">
                    {pendingEvents.map((event) => (
                        <div
                            key={event.id}
                            className="flex flex-wrap items-center justify-between gap-3 p-4"
                        >
                            <div className="min-w-0">
                                <span className="block truncate text-xs font-extrabold text-ink">
                                    {event.title ||
                                        event.category?.name ||
                                        `فعالية #${event.id}`}
                                </span>
                                <span className="mt-0.5 flex items-center gap-2 text-[11px] text-ink/55">
                                    <Building2
                                        className="h-3 w-3 shrink-0"
                                        aria-hidden="true"
                                    />
                                    {event.company?.name ?? '—'}
                                    <span className="text-ink/25">·</span>
                                    <CalendarClock
                                        className="h-3 w-3 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <span className="font-mono">
                                        {event.event_date ?? '—'}{' '}
                                        {event.start_time?.slice(0, 5) ?? ''}
                                    </span>
                                </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                                <Badge tone="neutral">
                                    {event.participants_count ?? 0} مشاركاً
                                </Badge>
                                <Money amount={event.total_amount} />
                            </div>
                        </div>
                    ))}

                    <ListStates
                        count={pendingEvents.length}
                        empty="لا طلبات تنتظر قرارك."
                        emptyHint="تصلك الطلبات من الشركات مباشرةً، وتظهر هنا فور وصولها."
                    />
                </div>
            </Card>

            <Card
                padding="p-4"
                className="flex flex-wrap items-center justify-between gap-3"
            >
                <div className="flex min-w-0 items-center gap-2">
                    <TrendingUp
                        className="h-4 w-4 shrink-0 text-ink"
                        aria-hidden="true"
                    />
                    <span className="text-xs text-ink/70">
                        تابع مؤشر موثوقيتك وأثر ردودك عليه.
                    </span>
                </div>
                <Link
                    href="/partner/reliability"
                    className="shrink-0 text-xs font-bold text-ink hover:underline"
                >
                    مؤشر الموثوقية ←
                </Link>
            </Card>

            <Note title="ما تراه عن الفعالية">
                يصلك عدد المشاركين لا أسماؤهم، ومنشئ الفعالية وحده جهة اتصالك.
                هذا ليس نقصاً في البيانات — هو حدّ الخصوصية الذي تلتزم به المنصة
                تجاه موظفي الشركات.
            </Note>

            {/* ── مشكلات شائعة ── */}
            <Card padding="p-4" className="space-y-3">
                <div>
                    <h2 className="text-sm font-extrabold text-ink">
                        مشكلات شائعة وحلولها
                    </h2>
                    <p className="text-[11px] text-ink/55">
                        أكثر ما يتكرر في بلاغات المزوّدين — والإجابة قبل أن
                        تسأل.
                    </p>
                </div>

                {[
                    [
                        'لم تصلني طلبات هذا الأسبوع',
                        'الاقتراح الآلي يرتّب المزوّدين بسرعة الرد ومعدل القبول. تأخّرك في الردّ يخفض أولويتك قبل أن يوقف الطلبات — راجع «الأداء».',
                    ],
                    [
                        'وصلني طلب في وقت محجوز عندي خارجياً',
                        'التقويم هنا هو المرجع لا دفترك. سجّل الحجز الخارجي في «التقويم» فور وقوعه؛ الإلغاء بسبب تقويم غير محدَّث يُعامل كإلغاء بعد القبول.',
                    ],
                    [
                        'أريد تغيير سعر وحدة',
                        'السعر يُقترح من «الفروع والوحدات» ويُعتمد من تيمات. الأسعار المعتمدة لا تتغيّر بأثر رجعي على طلب قائم.',
                    ],
                    [
                        'لم يصلني مبلغ فعالية منفَّذة',
                        'الصرف يتبع كشف التسوية الدوري، ولا يُصرف كشف قبل اعتماد حسابك البنكي. راجع «المستحقات» و«الحساب البنكي».',
                    ],
                ].map(([question, answer]) => (
                    <div
                        key={question}
                        className="rounded-xl border-[0.5px] border-ink/10 bg-page p-3"
                    >
                        <span className="block text-xs font-extrabold text-ink">
                            {question}
                        </span>
                        <p className="mt-1 text-[11px] leading-relaxed text-ink/70">
                            {answer}
                        </p>
                    </div>
                ))}
            </Card>
        </PartnerLayout>
    );
}
