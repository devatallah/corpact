import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Clock, Flame, MapPin, Plus, ShieldCheck, Timer, Trophy, Users } from 'lucide-react';
import { ListState } from '@/components/list-states';
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
    top_employees: { employee_id: number; name: string | null; events_count: number; points: number }[];
    top_communities: { id: number; name: string | null; events_count: number }[];
};

export default function EmployeeHome({
    pendingPayment,
    communities,
    events,
    joinedEventIds,
    activityStats,
    challenges,
    leaderboard,
}: {
    pendingPayment: PendingPayment | null;
    employee: { id: number; name: string; company_id: number };
    communities: CommunityRow[];
    events: EventRow[];
    joinedEventIds: number[];
    activityStats: { streak: number; total_events: number; events_this_month: number; top_category: string | null };
    challenges: Challenge[];
    leaderboard: Leaderboard;
    quickMatches: unknown[];
}) {
    const joined = new Set(joinedEventIds);
    const nextConfirmed = events.find((event) => joined.has(event.id));
    const suggested = events.filter((event) => !joined.has(event.id)).slice(0, 4);

    return (
        <EmployeeLayout>
            <Head title="الرئيسية" />

            {/* ── المطالبة المفتوحة — الأولوية القصوى ── */}
            {pendingPayment && <PaymentClaim claim={pendingPayment} />}

            {/* ── فعاليتك القادمة المؤكدة ── */}
            <section className="space-y-2">
                <SectionHead dot="bg-success" title="فعاليتك القادمة المؤكدة" aside="حضور تلقائي" />

                {nextConfirmed ? (
                    <Link
                        href={`/employee/detail/${nextConfirmed.id}`}
                        className="block p-4 bg-surface rounded-2xl border-[0.5px] border-ink/15 hover:border-ink/30 transition-colors space-y-2.5"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 text-xs text-ink/60 mb-0.5">
                                    <Users className="w-3 h-3" aria-hidden="true" />
                                    <span className="font-bold truncate">{nextConfirmed.community?.name ?? '—'}</span>
                                </div>
                                <h3 className="text-sm font-black text-ink leading-snug">{nextConfirmed.title}</h3>
                            </div>
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-success-tint text-success text-[10px] font-bold">
                                مؤكدة
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-ink/70 pt-1 border-t-[0.5px] border-ink/10">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                                <span className="font-medium text-[11px] font-mono">{nextConfirmed.event_date ?? '—'}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                                <span className="font-medium text-[11px] font-mono">
                                    {nextConfirmed.start_time ?? '—'}
                                    {nextConfirmed.end_time ? ` - ${nextConfirmed.end_time}` : ''}
                                </span>
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-ink/60 pt-1">
                            <span className="flex items-center gap-1 min-w-0">
                                <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                                <span className="truncate">{nextConfirmed.partner?.name ?? 'لم يُحدَّد المرفق بعد'}</span>
                            </span>
                            <span className="font-bold text-ink shrink-0">عرض التفاصيل ←</span>
                        </div>
                    </Link>
                ) : (
                    <div className="bg-surface rounded-2xl border-[0.5px] border-ink/15">
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
                    aside={communities.length > 0 ? `${communities.length} مجتمع` : undefined}
                />

                <div className="flex gap-2.5 overflow-x-auto pb-1 snap-x">
                    {communities.map((community) => (
                        <Link
                            key={community.id}
                            href={`/employee/community/${community.id}`}
                            className="min-w-[170px] max-w-[200px] p-3.5 bg-surface rounded-2xl border-[0.5px] border-ink/15 hover:border-ink/30 transition-colors snap-start shrink-0 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-9 h-9 rounded-xl bg-lime text-ink flex items-center justify-center font-black text-sm mb-1.5">
                                    {community.name.charAt(0)}
                                </div>
                                <h3 className="text-xs font-black text-ink line-clamp-1">{community.name}</h3>
                                <p className="text-[10px] text-ink/60 line-clamp-1 mt-0.5">{community.category?.name ?? 'مجتمع'}</p>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t-[0.5px] border-ink/10 text-[10px] text-ink/60">
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" aria-hidden="true" />
                                    <span>{community.members_count ?? community.member_count ?? 0} عضو</span>
                                </span>
                                <span className="font-bold text-ink">دخول ←</span>
                            </div>
                        </Link>
                    ))}

                    <Link
                        href="/employee/community"
                        className="min-w-[130px] p-3.5 bg-ink/5 rounded-2xl border-[0.5px] border-dashed border-ink/20 hover:bg-ink/10 transition-colors snap-start shrink-0 flex flex-col items-center justify-center text-center gap-1"
                    >
                        <Plus className="w-4 h-4 text-ink" aria-hidden="true" />
                        <span className="font-bold text-[11px] text-ink">انضمام لمجتمع</span>
                    </Link>
                </div>
            </section>

            {/* ── فعاليات مقترحة ── */}
            <section className="space-y-2.5">
                <SectionHead title="فعاليات مقترحة لاهتماماتك" />

                <div className="space-y-2.5">
                    {suggested.map((event) => (
                        <Link
                            key={event.id}
                            href={`/employee/detail/${event.id}`}
                            className="block p-3.5 bg-surface rounded-2xl border-[0.5px] border-ink/15 hover:border-ink/30 transition-colors space-y-2"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1 text-[11px] text-ink/60 mb-0.5">
                                        <span className="truncate">{event.community?.name ?? '—'}</span>
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-black text-ink leading-snug">{event.title}</h3>
                                </div>
                                <SeatBadge event={event} />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-ink/60 pt-1 border-t-[0.5px] border-ink/10">
                                <span className="font-mono">
                                    {event.event_date ?? '—'} · {event.start_time ?? '—'}
                                </span>
                                <span className="font-bold text-ink">التفاصيل ←</span>
                            </div>
                        </Link>
                    ))}

                    {suggested.length === 0 && (
                        <div className="bg-surface rounded-2xl border-[0.5px] border-ink/15">
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
                    <Stat icon={Flame} label="أسابيع متتالية" value={activityStats.streak} />
                    <Stat icon={CalendarDays} label="فعاليات هذا الشهر" value={activityStats.events_this_month} />
                    <Stat icon={Trophy} label="إجمالي الفعاليات" value={activityStats.total_events} />
                </div>
            </section>

            {/* ── التحديات ── */}
            {challenges.length > 0 && (
                <section className="space-y-2.5">
                    <SectionHead title="تحديات جارية" />
                    <div className="space-y-2.5">
                        {challenges.map((challenge) => (
                            <div key={challenge.id} className="p-3.5 bg-surface rounded-2xl border-[0.5px] border-ink/15 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="text-xs font-black text-ink">{challenge.title}</h3>
                                        {challenge.description && (
                                            <p className="text-[10px] text-ink/60 mt-0.5 leading-relaxed">{challenge.description}</p>
                                        )}
                                    </div>
                                    <span className="shrink-0 font-mono text-[11px] font-bold text-ink">
                                        {challenge.current_count}/{challenge.target_count}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-ink/10 overflow-hidden" dir="ltr">
                                    <div className="h-full bg-lime rounded-full" style={{ width: `${challenge.percentage}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── لوحة الشركة ── */}
            {leaderboard.top_employees.length > 0 && (
                <section className="space-y-2.5">
                    <SectionHead title="الأكثر نشاطاً في شركتك" aside="هذا الشهر" />
                    <div className="bg-surface rounded-2xl border-[0.5px] border-ink/15 divide-y-[0.5px] divide-ink/10">
                        {leaderboard.top_employees.slice(0, 5).map((row, index) => (
                            <div key={row.employee_id} className="p-3 flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-ink text-lime text-[10px] font-black flex items-center justify-center shrink-0">
                                    {index + 1}
                                </span>
                                <span className="text-xs font-bold text-ink flex-1 truncate">{row.name ?? '—'}</span>
                                <span className="font-mono text-[11px] text-ink/60">{row.events_count} فعالية</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── اقتراح فعالية ── */}
            <section className="p-4 bg-surface rounded-2xl border-[0.5px] border-ink/15 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-xs font-black text-ink">لديك فكرة فعالية جديدة لزملائك؟</h3>
                    <p className="text-[10px] text-ink/60 mt-0.5 leading-relaxed">
                        اقترح موعداً ومكاناً وسيقوم قائد المجتمع باعتماد المزوّد.
                    </p>
                </div>
                <Link
                    href="/employee/create"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-transparent text-ink border-[0.5px] border-ink/30 hover:bg-ink/5 text-xs font-bold px-3.5 py-1.5 shrink-0 transition-colors"
                >
                    اقتراح فعالية
                </Link>
            </section>
        </EmployeeLayout>
    );
}

function SectionHead({ title, aside, dot }: { title: string; aside?: string; dot?: string }) {
    return (
        <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-ink flex items-center gap-1.5">
                {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
                <span>{title}</span>
            </h2>
            {aside && <span className="text-[11px] text-ink/50 font-mono">{aside}</span>}
        </div>
    );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: number }) {
    return (
        <div className="p-3 bg-surface rounded-2xl border-[0.5px] border-ink/15 text-center">
            <Icon className="w-4 h-4 text-ink/50 mx-auto" aria-hidden="true" />
            <div className="text-lg font-black font-mono text-ink mt-1">{value}</div>
            <div className="text-[10px] text-ink/55 leading-tight">{label}</div>
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
            className={`shrink-0 inline-flex items-center rounded-full border-[0.5px] whitespace-nowrap text-[10px] px-2 py-0.5 font-bold ${
                left > 0 ? 'bg-lime/20 text-ink border-lime/40' : 'bg-ink/5 text-ink/60 border-ink/10'
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
            <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-ink bg-ink text-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b-[0.5px] border-white/15">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime" />
                        </span>
                        <span className="text-[12px] font-extrabold uppercase tracking-wider text-lime">
                            مطالبة سداد مفتوحة — الأولوية القصوى
                        </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white shrink-0">
                        <Timer className="w-3 h-3" aria-hidden="true" />
                        {hours}:{String(minutes).padStart(2, '0')} متبقية
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-white/70 mb-1">
                                <span className="truncate">{claim.event.community_name ?? '—'}</span>
                            </div>
                            <h3 className="text-[16px] sm:text-[17px] font-black text-white leading-snug">{claim.event.title}</h3>
                        </div>
                        <div className="text-left shrink-0">
                            <div className="text-xs text-white/60">حصتك النهائية</div>
                            <div className="text-[20px] font-black text-lime font-mono">
                                {claim.amount.toFixed(2)} <span className="text-xs font-normal text-white/80">ر.س</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/80 pt-1 font-mono">
                        <span>{claim.event.event_date ?? '—'}</span>
                        <span>{claim.event.start_time ?? '—'}</span>
                        <span className="font-arabic">{claim.event.partner_name ?? '—'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-white/60 bg-white/5 px-2.5 py-1.5 rounded-lg border-[0.5px] border-white/10 mt-1">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>مقعدك محجوز طوال المهلة. تنتهي المهلة بعد انقضاء العداد ويُعرض المقعد على قائمة الانتظار.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <Link
                            href={`/employee/detail/${claim.event.id}`}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border-[0.5px] border-white/15 transition-colors"
                        >
                            تفاصيل الحصة
                        </Link>
                        <Link
                            href={`/employee/payments/${claim.id}`}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-lime text-ink border-[0.5px] border-lime hover:bg-lime-hover text-[13px] font-black px-5 py-2.5 transition-colors"
                        >
                            <span>ادفع الآن ({claim.amount.toFixed(2)} ر.س)</span>
                            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export type { EventRow };
