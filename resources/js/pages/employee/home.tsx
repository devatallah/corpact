import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Clock,
    Flame,
    MapPin,
    Plus,
    ShieldCheck,
    Timer,
    Trophy,
    Users,
} from 'lucide-react';
import { ListState } from '@/components/list-states';
import { Button } from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';

/**
 * H §12.3 — the employee home, and the order matters.
 *
 * An open payment claim comes first and nothing outranks it: the seat is held
 * only until the countdown runs out, after which it goes to the waitlist. A
 * claim buried below the fold costs the employee their place.
 */
type PendingPayment = {
    id: number;
    amount: number;
    expires_at: string;
    minutes_left: number;
    /** مطالبات مفتوحة أخرى غير هذه — تُذكر ولا تُعرض بطاقاتٍ كاملة. */
    other_claims: number;
    event: {
        id: number;
        title: string;
        event_date: string | null;
        start_time: string | null;
        community_name: string | null;
        partner_name: string | null;
    };
};

type EventRow = {
    id: number;
    title: string;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    status: string;
    capacity: number | null;
    participants_count: number | null;
    community?: { id: number; name: string; icon?: string | null } | null;
    partner?: { id: number; name: string } | null;
    category?: { id: number; name: string; icon?: string | null } | null;
};

type CommunityRow = {
    id: number;
    name: string;
    icon: string | null;
    members_count?: number;
    member_count?: number;
    category?: { id: number; name: string } | null;
};

type Challenge = {
    id: number;
    title: string;
    description: string | null;
    target_count: number;
    current_count: number;
    percentage: number;
    completed_at: string | null;
};

type Leaderboard = {
    top_employees: {
        employee_id: number;
        name: string | null;
        events_count: number;
        points: number;
    }[];
    top_communities: {
        id: number;
        name: string | null;
        events_count: number;
    }[];
};

type QuickMatch = {
    id: number;
    message: string | null;
    votes_count: number;
    my_vote_option_id: number | null;
    viewer_is_leader: boolean;
    community?: { id: number; name: string } | null;
    options?: {
        id: number;
        proposed_date: string;
        proposed_time: string | null;
        votes_count?: number;
    }[];
};

export default function EmployeeHome({
    pendingPayment,
    communities,
    events,
    joinedEventIds,
    activityStats,
    challenges,
    leaderboard,
    quickMatches,
}: {
    pendingPayment: PendingPayment | null;
    employee: { id: number; name: string; company_id: number };
    communities: CommunityRow[];
    events: EventRow[];
    joinedEventIds: number[];
    activityStats: {
        streak: number;
        total_events: number;
        events_this_month: number;
        top_category: string | null;
    };
    challenges: Challenge[];
    leaderboard: Leaderboard;
    quickMatches: QuickMatch[];
}) {
    const joined = new Set(joinedEventIds);
    const nextConfirmed = events.find((event) => joined.has(event.id));
    const suggested = events
        .filter((event) => !joined.has(event.id))
        .slice(0, 4);

    return (
        <EmployeeLayout>
            <Head title="الرئيسية" />

            {/* ── المطالبة المفتوحة — الأولوية القصوى ── */}
            {pendingPayment && <PaymentClaim claim={pendingPayment} />}

            {/* ── فعاليتك القادمة المؤكدة ── */}
            <section className="space-y-2">
                <SectionHead
                    dot="bg-success"
                    title="فعاليتك القادمة المؤكدة"
                    aside="حضور تلقائي"
                />

                {nextConfirmed ? (
                    <Link
                        href={`/employee/detail/${nextConfirmed.id}`}
                        className="block space-y-2.5 rounded-2xl border-[0.5px] border-ink/15 bg-surface p-4 transition-colors hover:border-ink/30"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <div className="mb-0.5 flex items-center gap-1.5 text-xs text-ink/60">
                                    <Users
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                    />
                                    <span className="truncate font-bold">
                                        {nextConfirmed.community?.name ?? '—'}
                                    </span>
                                </div>
                                <h3 className="text-sm leading-snug font-black text-ink">
                                    {nextConfirmed.title}
                                </h3>
                            </div>
                            <span className="shrink-0 rounded-full bg-success-tint px-2 py-0.5 text-[10px] font-bold text-success">
                                مؤكدة
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t-[0.5px] border-ink/10 pt-1 text-xs text-ink/70">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                <span className="font-mono text-[11px] font-medium">
                                    {nextConfirmed.event_date ?? '—'}
                                </span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                <span className="font-mono text-[11px] font-medium">
                                    {nextConfirmed.start_time ?? '—'}
                                    {nextConfirmed.end_time
                                        ? ` - ${nextConfirmed.end_time}`
                                        : ''}
                                </span>
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-ink/60">
                            <span className="flex min-w-0 items-center gap-1">
                                <MapPin
                                    className="h-3 w-3 shrink-0"
                                    aria-hidden="true"
                                />
                                <span className="truncate">
                                    {nextConfirmed.partner?.name ??
                                        'لم يُحدَّد المرفق بعد'}
                                </span>
                            </span>
                            <span className="shrink-0 font-bold text-ink">
                                عرض التفاصيل ←
                            </span>
                        </div>
                    </Link>
                ) : (
                    <div className="rounded-2xl border-[0.5px] border-ink/15 bg-surface">
                        <ListState
                            tone="empty"
                            title="لا فعالية مؤكدة قادمة"
                            hint="أكّد حضورك في إحدى الفعاليات المقترحة أدناه ليحجز لك النظام مقعدك."
                        />
                    </div>
                )}
            </section>

            {/* ── مجتمعاتي ── */}
            <section className="space-y-2.5">
                <SectionHead
                    title="مجتمعاتي المعتمدة"
                    aside={
                        communities.length > 0
                            ? `${communities.length} مجتمع`
                            : undefined
                    }
                />

                <div className="flex snap-x gap-2.5 overflow-x-auto pb-1">
                    {communities.map((community) => (
                        <Link
                            key={community.id}
                            href={`/employee/community/${community.id}`}
                            className="flex max-w-[200px] min-w-[170px] shrink-0 snap-start flex-col justify-between rounded-2xl border-[0.5px] border-ink/15 bg-surface p-3.5 transition-colors hover:border-ink/30"
                        >
                            <div>
                                <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-lime text-sm font-black text-ink">
                                    {community.name.charAt(0)}
                                </div>
                                <h3 className="line-clamp-1 text-xs font-black text-ink">
                                    {community.name}
                                </h3>
                                <p className="mt-0.5 line-clamp-1 text-[10px] text-ink/60">
                                    {community.category?.name ?? 'مجتمع'}
                                </p>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t-[0.5px] border-ink/10 pt-2 text-[10px] text-ink/60">
                                <span className="flex items-center gap-1">
                                    <Users
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        {community.members_count ??
                                            community.member_count ??
                                            0}{' '}
                                        عضو
                                    </span>
                                </span>
                                <span className="font-bold text-ink">
                                    دخول ←
                                </span>
                            </div>
                        </Link>
                    ))}

                    <Link
                        href="/employee/community"
                        className="flex min-w-[130px] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl border-[0.5px] border-dashed border-ink/20 bg-ink/5 p-3.5 text-center transition-colors hover:bg-ink/10"
                    >
                        <Plus className="h-4 w-4 text-ink" aria-hidden="true" />
                        <span className="text-[11px] font-bold text-ink">
                            انضمام لمجتمع
                        </span>
                    </Link>
                </div>
            </section>

            {/* ── تصويت سريع على موعد ── */}
            {quickMatches.length > 0 && (
                <section className="space-y-2.5">
                    <h2 className="px-1 text-xs font-black text-ink">
                        تصويت سريع على موعد
                    </h2>
                    <p className="px-1 text-[11px] leading-relaxed text-ink/60">
                        زميلك يبحث عن موعد يناسب الأغلبية قبل أن يحجز. صوّتك
                        يساعده — ولا يُلزمك بالحضور.
                    </p>

                    {quickMatches.map((match) => (
                        <div
                            key={match.id}
                            className="space-y-2 rounded-2xl border-[0.5px] border-ink/15 bg-surface p-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <span className="block text-xs font-extrabold text-ink">
                                        {match.community?.name ?? '—'}
                                    </span>
                                    {match.message && (
                                        <span className="block text-[11px] leading-relaxed text-ink/60">
                                            {match.message}
                                        </span>
                                    )}
                                </div>
                                <span className="shrink-0 font-mono text-[10px] text-ink/45">
                                    {match.votes_count} صوتاً
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {(match.options ?? []).map((option) => {
                                    const mine =
                                        match.my_vote_option_id === option.id;

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            disabled={
                                                match.my_vote_option_id !== null
                                            }
                                            onClick={() =>
                                                router.post(
                                                    `/employee/quick-match/${match.id}/vote`,
                                                    { option_id: option.id },
                                                    { preserveScroll: true },
                                                )
                                            }
                                            className={`w-full rounded-xl border-[0.5px] p-2 text-start transition-colors disabled:cursor-default ${
                                                mine
                                                    ? 'border-ink bg-lime/25'
                                                    : 'border-ink/12 bg-page hover:border-ink/30'
                                            }`}
                                        >
                                            <span className="flex items-center justify-between gap-2">
                                                <span
                                                    className="font-mono text-[11px] font-bold text-ink"
                                                    dir="ltr"
                                                >
                                                    {option.proposed_date} ·{' '}
                                                    {option.proposed_time?.slice(
                                                        0,
                                                        5,
                                                    )}
                                                </span>
                                                <span className="font-mono text-[10px] text-ink/55">
                                                    {option.votes_count ?? 0}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {match.viewer_is_leader && (
                                <Button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            `/employee/quick-match/${match.id}/convert`,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    حوّله إلى فعالية بالموعد الفائز
                                </Button>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* ── فعاليات مقترحة ── */}
            <section className="space-y-2.5">
                <SectionHead title="فعاليات مقترحة لاهتماماتك" />

                <div className="space-y-2.5">
                    {suggested.map((event) => (
                        <Link
                            key={event.id}
                            href={`/employee/detail/${event.id}`}
                            className="block space-y-2 rounded-2xl border-[0.5px] border-ink/15 bg-surface p-3.5 transition-colors hover:border-ink/30"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="mb-0.5 flex items-center gap-1 text-[11px] text-ink/60">
                                        <span className="truncate">
                                            {event.community?.name ?? '—'}
                                        </span>
                                    </div>
                                    <h3 className="text-xs leading-snug font-black text-ink sm:text-sm">
                                        {event.title}
                                    </h3>
                                </div>
                                <SeatBadge event={event} />
                            </div>

                            <div className="flex items-center justify-between border-t-[0.5px] border-ink/10 pt-1 text-[11px] text-ink/60">
                                <span className="font-mono">
                                    {event.event_date ?? '—'} ·{' '}
                                    {event.start_time ?? '—'}
                                </span>
                                <span className="font-bold text-ink">
                                    التفاصيل ←
                                </span>
                            </div>
                        </Link>
                    ))}

                    {suggested.length === 0 && (
                        <div className="rounded-2xl border-[0.5px] border-ink/15 bg-surface">
                            <ListState
                                tone="empty"
                                title="لا فعاليات مقترحة الآن"
                                hint="ستظهر هنا فعاليات مجتمعاتك فور جدولتها."
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* ── نشاطي ── */}
            <section className="space-y-2.5">
                <SectionHead title="نشاطي" />
                <div className="grid grid-cols-3 gap-2.5">
                    <Stat
                        icon={Flame}
                        label="أسابيع متتالية"
                        value={activityStats.streak}
                    />
                    <Stat
                        icon={CalendarDays}
                        label="فعاليات هذا الشهر"
                        value={activityStats.events_this_month}
                    />
                    <Stat
                        icon={Trophy}
                        label="إجمالي الفعاليات"
                        value={activityStats.total_events}
                    />
                </div>
            </section>

            {/* ── التحديات ── */}
            {challenges.length > 0 && (
                <section className="space-y-2.5">
                    <SectionHead title="تحديات جارية" />
                    <div className="space-y-2.5">
                        {challenges.map((challenge) => (
                            <div
                                key={challenge.id}
                                className="space-y-2 rounded-2xl border-[0.5px] border-ink/15 bg-surface p-3.5"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="text-xs font-black text-ink">
                                            {challenge.title}
                                        </h3>
                                        {challenge.description && (
                                            <p className="mt-0.5 text-[10px] leading-relaxed text-ink/60">
                                                {challenge.description}
                                            </p>
                                        )}
                                    </div>
                                    <span className="shrink-0 font-mono text-[11px] font-bold text-ink">
                                        {challenge.current_count}/
                                        {challenge.target_count}
                                    </span>
                                </div>
                                <div
                                    className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10"
                                    dir="ltr"
                                >
                                    <div
                                        className="h-full rounded-full bg-lime"
                                        style={{
                                            width: `${challenge.percentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── لوحة الشركة ── */}
            {leaderboard.top_employees.length > 0 && (
                <section className="space-y-2.5">
                    <SectionHead
                        title="الأكثر نشاطاً في شركتك"
                        aside="هذا الشهر"
                    />
                    <div className="divide-y-[0.5px] divide-ink/10 rounded-2xl border-[0.5px] border-ink/15 bg-surface">
                        {leaderboard.top_employees
                            .slice(0, 5)
                            .map((row, index) => (
                                <div
                                    key={row.employee_id}
                                    className="flex items-center gap-3 p-3"
                                >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-black text-lime">
                                        {index + 1}
                                    </span>
                                    <span className="flex-1 truncate text-xs font-bold text-ink">
                                        {row.name ?? '—'}
                                    </span>
                                    <span className="font-mono text-[11px] text-ink/60">
                                        {row.events_count} فعالية
                                    </span>
                                </div>
                            ))}
                    </div>
                </section>
            )}

            {/* ── اقتراح فعالية ── */}
            <section className="flex items-center justify-between gap-3 rounded-2xl border-[0.5px] border-ink/15 bg-surface p-4">
                <div className="min-w-0">
                    <h3 className="text-xs font-black text-ink">
                        لديك فكرة فعالية جديدة لزملائك؟
                    </h3>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-ink/60">
                        اقترح موعداً ومكاناً وسيقوم قائد المجتمع باعتماد
                        المزوّد.
                    </p>
                </div>
                <Link
                    href="/employee/create"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border-[0.5px] border-ink/30 bg-transparent px-3.5 py-1.5 text-xs font-bold text-ink transition-colors hover:bg-ink/5"
                >
                    اقتراح فعالية
                </Link>
            </section>
        </EmployeeLayout>
    );
}

function SectionHead({
    title,
    aside,
    dot,
}: {
    title: string;
    aside?: string;
    dot?: string;
}) {
    return (
        <div className="flex items-center justify-between px-1">
            <h2 className="flex items-center gap-1.5 text-xs font-black text-ink">
                {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
                <span>{title}</span>
            </h2>
            {aside && (
                <span className="font-mono text-[11px] text-ink/50">
                    {aside}
                </span>
            )}
        </div>
    );
}

function Stat({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Flame;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border-[0.5px] border-ink/15 bg-surface p-3 text-center">
            <Icon className="mx-auto h-4 w-4 text-ink/50" aria-hidden="true" />
            <div className="mt-1 font-mono text-lg font-black text-ink">
                {value}
            </div>
            <div className="text-[10px] leading-tight text-ink/55">{label}</div>
        </div>
    );
}

/** Seats left, or the reason there are none. */
function SeatBadge({ event }: { event: EventRow }) {
    const left = (event.capacity ?? 0) - (event.participants_count ?? 0);

    if (event.capacity === null) {
        return null;
    }

    return (
        <span
            className={`inline-flex shrink-0 items-center rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                left > 0
                    ? 'border-lime/40 bg-lime/20 text-ink'
                    : 'border-ink/10 bg-ink/5 text-ink/60'
            }`}
        >
            {left > 0 ? `${left} مقعد متاح` : 'مكتملة'}
        </span>
    );
}

/**
 * The open claim. The countdown is the whole point of the card, so it is the
 * one number rendered large and in lime.
 */
function PaymentClaim({ claim }: { claim: PendingPayment }) {
    const hours = Math.floor(claim.minutes_left / 60);
    const minutes = claim.minutes_left % 60;

    return (
        <section aria-label="مطالبة سداد مفتوحة">
            <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-ink bg-ink p-4 text-white sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2 border-b-[0.5px] border-white/15 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime" />
                        </span>
                        <span className="text-[12px] font-extrabold tracking-wider text-lime uppercase">
                            مطالبة سداد مفتوحة — الأولوية القصوى
                        </span>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-mono text-xs font-bold text-white">
                        <Timer className="h-3 w-3" aria-hidden="true" />
                        {hours}:{String(minutes).padStart(2, '0')} متبقية
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="mb-1 flex items-center gap-1.5 text-xs text-white/70">
                                <span className="truncate">
                                    {claim.event.community_name ?? '—'}
                                </span>
                            </div>
                            <h3 className="text-[16px] leading-snug font-black text-white sm:text-[17px]">
                                {claim.event.title}
                            </h3>
                        </div>
                        <div className="shrink-0 text-left">
                            <div className="text-xs text-white/60">
                                حصتك النهائية
                            </div>
                            <div className="font-mono text-[20px] font-black text-lime">
                                {claim.amount.toFixed(2)}{' '}
                                <span className="text-xs font-normal text-white/80">
                                    ر.س
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 font-mono text-xs text-white/80">
                        <span>{claim.event.event_date ?? '—'}</span>
                        <span>{claim.event.start_time ?? '—'}</span>
                        <span className="font-arabic">
                            {claim.event.partner_name ?? '—'}
                        </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 rounded-lg border-[0.5px] border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white/60">
                        <ShieldCheck
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span>
                            مقعدك محجوز طوال المهلة. تنتهي المهلة بعد انقضاء
                            العداد ويُعرض المقعد على قائمة الانتظار.
                        </span>
                    </div>

                    <div className="mt-1 grid grid-cols-2 gap-2 pt-3">
                        <Link
                            href={`/employee/detail/${claim.event.id}`}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-[0.5px] border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/15"
                        >
                            تفاصيل الحصة
                        </Link>
                        <Link
                            href={`/employee/payments/${claim.id}`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-[0.5px] border-lime bg-lime px-5 py-2.5 text-[13px] font-black text-ink transition-colors hover:bg-lime-hover"
                        >
                            <span>
                                ادفع الآن ({claim.amount.toFixed(2)} ر.س)
                            </span>
                            <ArrowLeft
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>

                    {/* الأعجل وحده يأخذ بطاقة؛ البقية سطر يقود إليها. */}
                    {claim.other_claims > 0 && (
                        <Link
                            href="/employee/payments"
                            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border-[0.5px] border-white/15 px-3 py-2 text-[11px] font-bold text-white/80 transition-colors hover:bg-white/10"
                        >
                            ولديك {claim.other_claims}{' '}
                            {claim.other_claims === 1
                                ? 'مطالبة أخرى مفتوحة'
                                : 'مطالبات أخرى مفتوحة'}{' '}
                            — عرض الكل
                            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

export type { EventRow };
