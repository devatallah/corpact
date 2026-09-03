import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Clock, Flame, Lightbulb, Target } from 'lucide-react';
import { useState } from 'react';
import CategoryIcon from '@/components/category-icon';
import { Card, CardEyebrow, CardTitle, HeroCard, InsetRow, MetaRow, Pill, Screen, Section } from '@/components/employee/ui';
import TimePicker from '@/components/time-picker';
import EmployeeLayout from '@/layouts/employee-layout';
import type { Community, Employee, Event, ChallengeWithProgress, QuickMatch, QuickMatchOption } from '@/types/models';

const arabicMonths = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const arabicDays = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

function formatArabicDate(dateStr: string): string {
    const [y, m, d] = String(dateStr).slice(0, 10).split('-').map(Number);
    const date = new Date(y, m - 1, d);

    return `${arabicDays[date.getDay()]} ${d} ${arabicMonths[m - 1]}`;
}

function formatArabicTime(timeStr: string): string {
    const [h, m] = String(timeStr).slice(0, 5).split(':').map(Number);
    const suffix = h >= 12 ? 'مساءً' : 'صباحاً';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;

    return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
return 'الآن';
}

    if (diffMins < 60) {
return `منذ ${diffMins} د`;
}

    const diffHours = Math.floor(diffMins / 60);

    if (diffHours < 24) {
return `منذ ${diffHours} س`;
}

    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 1) {
return 'منذ يوم';
}

    if (diffDays < 7) {
return `منذ ${diffDays} أيام`;
}

    const diffWeeks = Math.floor(diffDays / 7);

    if (diffWeeks === 1) {
return 'منذ أسبوع';
}

    return `منذ ${diffWeeks} أسابيع`;
}

interface ActivityStats {
    streak: number;
    total_events: number;
    events_this_month: number;
    top_category: string | null;
}

interface LeaderboardEntry { id: number; name: string; avatar?: string | null; department_name?: string | null; category_name?: string | null; category_icon?: string | null; events_count: number; }
interface Leaderboard { top_employees: LeaderboardEntry[]; top_departments: LeaderboardEntry[]; top_communities: LeaderboardEntry[]; }

interface PendingPayment {
    id: number;
    amount: number;
    expires_at: string;
    minutes_left: number;
    event: {
        id: number;
        title: string | null;
        event_date: string | null;
        start_time: string | null;
        community_name: string | null;
        partner_name: string | null;
    };
}

interface Props {
    employee: Employee;
    pendingPayment: PendingPayment | null;
    communities: (Community & { members_count: number; category?: { icon: string; name: string } })[];
    events: (Event & {
        community: Community & { category?: { icon: string } };
        partner: { name: string; district: string };
        category?: { icon: string };
    })[];
    joinedEventIds: number[];
    activityStats: ActivityStats;
    challenges: ChallengeWithProgress[];
    leaderboard: Leaderboard;
    quickMatches: QuickMatch[];
}

/** «114:17 متبقية» — the prototype shows the claim's remaining time as HH:MM. */
function formatCountdown(minutes: number): string {
    const h = Math.floor(Math.max(0, minutes) / 60);
    const m = Math.max(0, minutes) % 60;

    return `${h}:${String(m).padStart(2, '0')}`;
}

const STATUS_TONE: Record<string, 'lime' | 'success' | 'warning' | 'danger' | 'neutral'> = {
    'b-confirmed': 'success',
    'b-active': 'success',
    'b-open': 'lime',
    'b-pending': 'warning',
    'b-waiting_partner': 'warning',
    'b-cancelled': 'danger',
    'b-rejected': 'danger',
    'b-completed': 'neutral',
};

export default function EmployeeHome({ employee, pendingPayment, communities, events, joinedEventIds, activityStats, challenges, leaderboard, quickMatches }: Props) {
    const [filter, setFilter] = useState<string>('all');
    const [showQmForm, setShowQmForm] = useState(false);
    const [qmCommunityId, setQmCommunityId] = useState<string>('');
    const [qmOptions, setQmOptions] = useState<{ date: string; time: string }[]>([{ date: '', time: '' }, { date: '', time: '' }]);
    const [qmMessage, setQmMessage] = useState('');
    const [qmLoading, setQmLoading] = useState(false);
    const [leaderboardTab, setLeaderboardTab] = useState<'employees' | 'departments' | 'communities'>('employees');

    const filteredEvents = filter === 'all'
        ? events
        : events.filter((e) => e.community?.name === filter);

    // آلة حالات H §9 (A7) — الامتلاء عَلَم is_full لا حالة
    const statusMap: Record<string, { label: string; cls: string }> = {
        pending_approval: { label: 'بانتظار الاعتماد', cls: 'b-pending' },
        open: { label: 'مفتوح', cls: 'b-open' },
        pending_provider: { label: 'بانتظار المزوّد', cls: 'b-pending' },
        provider_alternative: { label: 'بديل مقترح', cls: 'b-open' },
        booked: { label: 'محجوزة — التسجيل مفتوح', cls: 'b-open' },
        awaiting_payment: { label: 'بانتظار الدفع', cls: 'b-pending' },
        confirmed: { label: 'مؤكد', cls: 'b-confirmed' },
        in_progress: { label: 'جارية الآن', cls: 'b-confirmed' },
        completed: { label: 'مكتمل', cls: 'b-completed' },
        settled: { label: 'مسوّاة', cls: 'b-completed' },
        expired: { label: 'منتهية دون اكتمال العدد', cls: 'b-cancelled' },
        rejected: { label: 'اقتراح مرفوض', cls: 'b-cancelled' },
        cancelled_min_not_met: { label: 'ملغاة — لم يبلغ الحد الأدنى', cls: 'b-cancelled' },
        cancelled_provider: { label: 'ملغاة من المزوّد', cls: 'b-cancelled' },
        cancelled_company: { label: 'ملغاة من الشركة', cls: 'b-cancelled' },
        cancelled_payment_failed: { label: 'ملغاة — فشل التحصيل', cls: 'b-cancelled' },
    };
    const joinableStatuses = ['open', 'pending_provider', 'provider_alternative', 'booked'];
    const deadStatuses = ['completed', 'settled', 'expired', 'rejected', 'cancelled_min_not_met', 'cancelled_provider', 'cancelled_company', 'cancelled_payment_failed'];

    return (
        <EmployeeLayout>
            <Head title="الرئيسية" />

            <Screen>
            {/* ── 0. Open payment claim — H §12.3, the seat is lost when it expires ── */}
            {pendingPayment && (
                <HeroCard>
                    <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#C8FF00]">
                            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#C8FF00] animate-pulse" />
                            مطالبة سداد مفتوحة — الأولوية القصوى
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-white/10 px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {formatCountdown(pendingPayment.minutes_left)} متبقية
                        </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-[11px] text-white/60 mb-0.5">{pendingPayment.event.community_name}</div>
                            <h2 className="text-[16px] sm:text-[17px] font-black text-white leading-snug">
                                {pendingPayment.event.title ?? pendingPayment.event.partner_name}
                            </h2>
                            <div className="text-[11px] text-white/60 mt-1">
                                {pendingPayment.event.event_date && formatArabicDate(pendingPayment.event.event_date)}
                                {pendingPayment.event.start_time && ` · ${formatArabicTime(pendingPayment.event.start_time)}`}
                            </div>
                        </div>
                        <div className="text-left shrink-0">
                            <div className="text-[10px] text-white/50">حصتك النهائية</div>
                            <div className="text-xl font-black text-[#C8FF00] font-mono">{pendingPayment.amount.toLocaleString()}</div>
                            <div className="text-[10px] text-white/50">ر.س</div>
                        </div>
                    </div>

                    <p className="text-[11px] text-white/60 bg-white/5 rounded-xl p-2.5 leading-relaxed">
                        مقعدك محجوز طوال المهلة. تنتهي المهلة بعد انقضاء العداد ويُعرض المقعد على قائمة الانتظار.
                    </p>

                    <div className="flex gap-2">
                        <Link
                            href={`/employee/payments/${pendingPayment.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-[#C8FF00] text-[#0A0A0A] text-sm font-black hover:bg-[#bcf200] transition-colors"
                        >
                            ادفع الآن ({pendingPayment.amount.toLocaleString()} ر.س)
                        </Link>
                        <Link
                            href={`/employee/detail/${pendingPayment.event.id}`}
                            className="inline-flex items-center justify-center h-11 px-5 rounded-full border-[0.5px] border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-colors"
                        >
                            تفاصيل الحصة
                        </Link>
                    </div>
                </HeroCard>
            )}

            {/* ── 1. Greeting ── */}
            <div>
                <h1 className="text-lg font-black text-[#0A0A0A]">مرحباً، {employee.name}</h1>
                <p className="text-[11px] text-[#0A0A0A]/55 mt-0.5">{employee.company?.name ?? ''}</p>
            </div>

            {/* ── 2. Metrics ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                    { value: activityStats.total_events, label: 'نشاط هذا العام', note: `↑ ${activityStats.events_this_month} هذا الشهر` },
                    { value: activityStats.streak, label: 'أسابيع متواصلة' },
                    { value: activityStats.top_category ?? '—', label: 'النشاط المفضل', small: true },
                    { value: activityStats.events_this_month, label: 'أنشطة الشهر' },
                ].map((m) => (
                    <div key={m.label} className="p-3.5 bg-white rounded-2xl border-[0.5px] border-[#0A0A0A]/15">
                        <div className={`font-black text-[#0A0A0A] leading-none ${m.small ? 'text-sm' : 'text-2xl'}`}>{m.value}</div>
                        <div className="text-[11px] text-[#0A0A0A]/50 font-bold mt-1.5">{m.label}</div>
                        {m.note && <div className="text-[11px] text-[#0A0A0A]/60 mt-0.5">{m.note}</div>}
                    </div>
                ))}
            </div>

            {/* ── 3. Streak ── */}
            <HeroCard>
                <div className="flex items-center gap-3">
                    <Flame className="w-6 h-6 text-[#C8FF00] shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                        <div className="text-base font-black">{activityStats.streak} أسابيع متواصلة</div>
                        <div className="text-[11px] text-white/60">
                            {activityStats.streak > 0 ? 'استمر في النشاط!' : 'شارك في فعالية هذا الأسبوع'}
                        </div>
                    </div>
                </div>
            </HeroCard>

            {/* ── 4. Challenges ── */}
            {challenges.length > 0 && (
                <Section title="التحديات" icon={Target}>
                    <div className="space-y-2.5">
                        {challenges.map((challenge) => {
                            const isCompleted = challenge.completed_at !== null;
                            const remaining = challenge.target_count - challenge.current_count;

                            return (
                                <Card key={challenge.id}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <CardTitle>{challenge.title}</CardTitle>
                                            {challenge.description && (
                                                <div className="text-[11px] text-[#0A0A0A]/55 mt-0.5">{challenge.description}</div>
                                            )}
                                        </div>
                                        {isCompleted && <Pill tone="success">مكتمل</Pill>}
                                    </div>

                                    <div className="h-1.5 rounded-full bg-[#0A0A0A]/10 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-[#0A0A0A] transition-all duration-500"
                                            style={{ width: `${challenge.percentage}%` }}
                                        />
                                    </div>

                                    <MetaRow
                                        left={`${challenge.current_count} من ${challenge.target_count} — ${challenge.percentage}%`}
                                        right={!isCompleted && remaining > 0 ? `باقي ${remaining} ${remaining === 1 ? 'فعالية' : 'فعاليات'}` : undefined}
                                    />
                                </Card>
                            );
                        })}
                    </div>
                </Section>
            )}

            {/* ── 5. Communities ── */}
            <Section
                title="مجتمعاتي المعتمدة"
                action={<Link href="/employee/explore" className="text-[11px] font-bold text-[#0A0A0A] hover:underline">استكشف المزيد ←</Link>}
            >
                {communities.length > 0 ? (
                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                        {communities.map((community) => (
                            <Link
                                key={community.id}
                                href={`/employee/community/${community.id}`}
                                className="shrink-0 w-40 p-3.5 bg-white rounded-2xl border-[0.5px] border-[#0A0A0A]/15 hover:border-[#0A0A0A]/30 transition-all space-y-2"
                            >
                                <CategoryIcon icon={community.category?.icon} size={20} />
                                <h3 className="text-xs font-black text-[#0A0A0A] line-clamp-1">{community.name}</h3>
                                <div className="flex items-center justify-between text-[11px] text-[#0A0A0A]/55">
                                    <span>{community.members_count} عضو</span>
                                    <span className="font-bold text-[#0A0A0A]">دخول ←</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <p className="text-[11px] text-[#0A0A0A]/55">لم تنضم لأي مجتمع بعد.</p>
                    </Card>
                )}
            </Section>

            {/* ── 6. Quick Match Polls ── */}
            <div className="section">
                <div className="section-head">
                    <div className="section-title">تصويتات المباريات</div>
                    {communities.length > 0 && (
                        <button
                            className={`btn ${showQmForm ? 'btn-danger' : 'btn-primary'}`}
                            onClick={() => setShowQmForm(!showQmForm)}
                            style={{ fontSize: 12, padding: '6px 14px' }}
                        >
                            {showQmForm ? 'إلغاء' : '+ تصويت جديد'}
                        </button>
                    )}
                </div>

                {/* ── 7. Quick Match Form ── */}
                {showQmForm && (
                    <div className="card" style={{ marginBottom: 14 }}>
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 12, color: 'rgba(10,10,10,.6)', fontWeight: 600, display: 'block', marginBottom: 6 }}>المجتمع</label>
                            <select
                                value={qmCommunityId}
                                onChange={(e) => setQmCommunityId(e.target.value)}
                                required
                            >
                                <option value="">اختر المجتمع</option>
                                {communities.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 12, color: 'rgba(10,10,10,.6)', fontWeight: 600, display: 'block', marginBottom: 8 }}>خيارات الأوقات</label>
                            {qmOptions.map((opt, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0A0A0A15', color: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                        {idx + 1}
                                    </div>
                                    <input
                                        type="date"
                                        value={opt.date}
                                        onChange={(e) => {
                                            const updated = [...qmOptions];
                                            updated[idx] = { ...updated[idx], date: e.target.value };
                                            setQmOptions(updated);
                                        }}
                                        style={{ flex: 1 }}
                                    />
                                    <TimePicker
                                        value={opt.time}
                                        onChange={(v) => {
                                            const updated = [...qmOptions];
                                            updated[idx] = { ...updated[idx], time: v };
                                            setQmOptions(updated);
                                        }}
                                    />
                                    {qmOptions.length > 2 && (
                                        <button
                                            onClick={() => setQmOptions(qmOptions.filter((_, i) => i !== idx))}
                                            className="btn btn-danger"
                                            style={{ width: 28, height: 28, borderRadius: '50%', padding: 0, fontSize: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            {qmOptions.length < 5 && (
                                <button
                                    onClick={() => setQmOptions([...qmOptions, { date: '', time: '' }])}
                                    className="btn btn-outline btn-full"
                                    style={{ borderStyle: 'dashed', fontSize: 12, color: 'rgba(10,10,10,.5)' }}
                                >
                                    + أضف خيار
                                </button>
                            )}
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 12, color: 'rgba(10,10,10,.6)', fontWeight: 600, display: 'block', marginBottom: 6 }}>رسالة (اختياري)</label>
                            <textarea
                                value={qmMessage}
                                onChange={(e) => setQmMessage(e.target.value)}
                                placeholder="مثال: نبي نلعب بادل بعد الدوام"
                                style={{ resize: 'none', minHeight: 60 }}
                            />
                        </div>
                        <button
                            className="btn btn-primary btn-full"
                            onClick={() => {
                                const validOptions = qmOptions.filter(o => o.date && o.time);

                                if (!qmCommunityId || validOptions.length < 2) {
return;
}

                                setQmLoading(true);
                                router.post('/employee/quick-match', {
                                    community_id: Number(qmCommunityId),
                                    options: validOptions,
                                    message: qmMessage || null,
                                }, {
                                    onFinish: () => {
                                        setQmLoading(false);
                                        setShowQmForm(false);
                                        setQmCommunityId('');
                                        setQmOptions([{ date: '', time: '' }, { date: '', time: '' }]);
                                        setQmMessage('');
                                    },
                                });
                            }}
                            disabled={!qmCommunityId || qmOptions.filter(o => o.date && o.time).length < 2 || qmLoading}
                            style={{
                                opacity: (!qmCommunityId || qmOptions.filter(o => o.date && o.time).length < 2) ? 0.5 : 1,
                                cursor: (!qmCommunityId || qmOptions.filter(o => o.date && o.time).length < 2) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {qmLoading ? 'جاري الإنشاء...' : 'نشر التصويت'}
                        </button>
                    </div>
                )}

                {/* Poll Cards */}
                {quickMatches.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {quickMatches.map((qm) => {
                            const isCreator = qm.created_by === employee.id;
                            const isLeader = Boolean((qm as { viewer_is_leader?: boolean }).viewer_is_leader);
                            const totalVotes = qm.votes_count ?? 0;
                            const canConvert = (isCreator || isLeader) && totalVotes >= 2;

                            return (
                                <div className="card" key={qm.id} style={{ marginBottom: 0 }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <CategoryIcon icon={qm.community?.category?.icon} size={22} />
                                            <span style={{ fontSize: 14, fontWeight: 600 }}>{qm.community?.name}</span>
                                        </div>
                                        {qm.source === 'auto' && (
                                            <span className="badge b-open">اقتراح تلقائي</span>
                                        )}
                                    </div>

                                    {/* Message */}
                                    {qm.message && (
                                        <p style={{ fontSize: 13, color: 'rgba(10,10,10,.6)', marginBottom: 14, lineHeight: 1.7, margin: '0 0 14px' }}>{qm.message}</p>
                                    )}

                                    {/* Options */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                                        {(qm.options ?? []).map((option: QuickMatchOption) => {
                                            const isMyVote = qm.my_vote_option_id === option.id;
                                            const pct = totalVotes > 0 ? Math.round((option.votes_count / totalVotes) * 100) : 0;
                                            const isWinning = totalVotes > 0 && option.votes_count === Math.max(...(qm.options ?? []).map((o: QuickMatchOption) => o.votes_count));

                                            return (
                                                <button
                                                    key={option.id}
                                                    className={`btn ${isMyVote ? 'btn-primary' : 'btn-outline'}`}
                                                    onClick={() => router.post(`/employee/quick-match/${qm.id}/vote`, { option_id: option.id })}
                                                    style={{
                                                        width: '100%',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        textAlign: 'right',
                                                        padding: '12px 14px',
                                                    }}
                                                >
                                                    {/* Progress fill */}
                                                    {totalVotes > 0 && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            width: `${pct}%`,
                                                            background: isMyVote ? 'rgba(255,255,255,.15)' : '#0A0A0A10',
                                                            borderRadius: 10,
                                                            transition: 'width 0.3s ease',
                                                        }} />
                                                    )}
                                                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            {isMyVote && <span>✓</span>}
                                                            <span style={{ fontSize: 13, fontWeight: isMyVote ? 700 : 500 }}>
                                                                {formatArabicDate(option.date)} — {formatArabicTime(option.time)}
                                                            </span>
                                                        </div>
                                                        {totalVotes > 0 && (
                                                            <span style={{ fontSize: 12, fontWeight: 700, color: isMyVote ? '#fff' : (isWinning ? '#0A0A0A' : 'rgba(10,10,10,.5)') }}>
                                                                {pct}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(10,10,10,.5)', marginBottom: canConvert ? 12 : 0 }}>
                                        <span>{qm.created_by ? qm.creator?.name : 'النظام'}</span>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                            <span>{totalVotes} {totalVotes === 1 ? 'صوت' : 'أصوات'}</span>
                                            <span>{timeAgo(qm.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Convert button */}
                                    {canConvert && (
                                        <button
                                            className="btn btn-primary btn-full"
                                            onClick={() => router.post(`/employee/quick-match/${qm.id}/convert`)}
                                        >
                                            حوّل لفعالية
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty">
                        <div className="txt">لا توجد تصويتات حاليا</div>
                    </div>
                )}
            </div>

            {/* ── 8. Events ── */}
            <Section title="فعالياتي القادمة" icon={CalendarDays}>
                {/* Filter pills */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer ${
                            filter === 'all'
                                ? 'bg-[#0A0A0A] text-[#C8FF00] border-[#0A0A0A]'
                                : 'bg-white text-[#0A0A0A]/60 border-[#0A0A0A]/15 hover:border-[#0A0A0A]/30'
                        }`}
                    >
                        الكل
                    </button>
                    {communities.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setFilter(c.name)}
                            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer ${
                                filter === c.name
                                    ? 'bg-[#0A0A0A] text-[#C8FF00] border-[#0A0A0A]'
                                    : 'bg-white text-[#0A0A0A]/60 border-[#0A0A0A]/15 hover:border-[#0A0A0A]/30'
                            }`}
                        >
                            <CategoryIcon icon={c.category?.icon} size={14} /> {c.name}
                        </button>
                    ))}
                </div>

                {filteredEvents.length > 0 ? (
                    <div className="space-y-2.5">
                        {filteredEvents.map((event) => {
                            const pct = event.capacity > 0
                                ? Math.round((event.participants_count / event.capacity) * 100)
                                : 0;
                            const isJoined = joinedEventIds?.includes(event.id);
                            const info = statusMap[event.status] ?? { label: event.status, cls: 'b-completed' };
                            const tone = STATUS_TONE[info.cls] ?? 'neutral';

                            return (
                                <Link key={event.id} href={`/employee/detail/${event.id}`} className="block">
                                    <Card interactive>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <CardEyebrow icon={<CategoryIcon icon={event.category?.icon ?? event.community?.category?.icon} size={14} />}>
                                                    {event.community?.name ?? ''}
                                                </CardEyebrow>
                                                <CardTitle>{event.partner?.name}</CardTitle>
                                            </div>
                                            <Pill tone={tone}>{info.label}</Pill>
                                        </div>

                                        <InsetRow>
                                            <div className="text-[11px] text-[#0A0A0A]/70">
                                                {event.player_payment <= 0 ? (
                                                    'حصتك: '
                                                ) : (
                                                    'حصتك بحد أقصى: '
                                                )}
                                                <span className="font-bold text-[#0A0A0A]">
                                                    {event.player_payment <= 0 ? 'مغطاة بالكامل' : `${event.cost_per_person?.toLocaleString()} ر.س`}
                                                </span>
                                            </div>
                                            {event.player_payment <= 0 && (
                                                <span className="text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded shrink-0">
                                                    دعم مالي مفعّل
                                                </span>
                                            )}
                                        </InsetRow>

                                        {/* Capacity — this platform's data, kept in the prototype's idiom. */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 rounded-full bg-[#0A0A0A]/10 overflow-hidden">
                                                <div className="h-full rounded-full bg-[#0A0A0A]" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-[10px] text-[#0A0A0A]/50 shrink-0 font-mono">
                                                {event.participants_count}/{event.capacity}
                                            </span>
                                        </div>

                                        <MetaRow
                                            left={
                                                <>
                                                    {formatArabicDate(event.event_date)} · {formatArabicTime(event.start_time)}
                                                    {(event.template_id || event.parent_event_id) && (
                                                        <span className="text-[#0A0A0A]/70"> · متكررة</span>
                                                    )}
                                                </>
                                            }
                                            right={
                                                deadStatuses.includes(event.status)
                                                    ? 'تفاصيل الفعالية ←'
                                                    : isJoined
                                                      ? '✓ منضم'
                                                      : joinableStatuses.includes(event.status) && event.participants_count < event.capacity
                                                        ? 'انضم ←'
                                                        : 'تفاصيل الفعالية ←'
                                            }
                                        />
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <p className="text-[11px] text-[#0A0A0A]/55 text-center py-4">لا توجد فعاليات قادمة حالياً.</p>
                    </Card>
                )}
            </Section>

            {/* ── 9. Leaderboard ── */}
            {(leaderboard.top_employees.length > 0 || leaderboard.top_departments.length > 0 || leaderboard.top_communities.length > 0) && (
                <div className="section">
                    <div className="section-head">
                        <div className="section-title">الاكثر نشاطا — {arabicMonths[new Date().getMonth()]} {new Date().getFullYear()}</div>
                    </div>

                    {/* Tab pills */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                        {leaderboard.top_employees.length > 0 && (
                            <button
                                className={`pill${leaderboardTab === 'employees' ? ' on' : ''}`}
                                onClick={() => setLeaderboardTab('employees')}
                            >
                                الموظفين
                            </button>
                        )}
                        {leaderboard.top_departments.length > 0 && (
                            <button
                                className={`pill${leaderboardTab === 'departments' ? ' on' : ''}`}
                                onClick={() => setLeaderboardTab('departments')}
                            >
                                الأقسام
                            </button>
                        )}
                        {leaderboard.top_communities.length > 0 && (
                            <button
                                className={`pill${leaderboardTab === 'communities' ? ' on' : ''}`}
                                onClick={() => setLeaderboardTab('communities')}
                            >
                                المجتمعات
                            </button>
                        )}
                    </div>

                    {/* Employees tab */}
                    {leaderboardTab === 'employees' && leaderboard.top_employees.length > 0 && (
                        <div className="list-card">
                            {leaderboard.top_employees.slice(0, 5).map((emp, idx) => {
                                const isMe = emp.id === employee.id;

                                return (
                                    <div
                                        key={emp.id}
                                        className="list-row"
                                        style={isMe ? { background: '#0A0A0A08', cursor: 'default' } : { cursor: 'default' }}
                                    >
                                        {/* Rank */}
                                        <div style={{ width: 24, fontSize: 14, fontWeight: 700, color: idx < 3 ? '#0A0A0A' : 'rgba(10,10,10,.5)', textAlign: 'center', flexShrink: 0 }}>
                                            {idx + 1}
                                        </div>
                                        {/* Avatar */}
                                        <div className="avatar" style={{ background: '#0A0A0A', color: '#fff' }}>
                                            {emp.avatar
                                                ? <img src={emp.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                                                : emp.name?.charAt(0)
                                            }
                                        </div>
                                        {/* Name + dept */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {emp.name} {isMe && '(أنت)'}
                                            </div>
                                            {emp.department_name && (
                                                <div style={{ fontSize: 11, color: 'rgba(10,10,10,.5)', marginTop: 1 }}>{emp.department_name}</div>
                                            )}
                                        </div>
                                        {/* Score */}
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', flexShrink: 0 }}>
                                            {emp.events_count} {emp.events_count === 1 ? 'مشاركة' : 'مشاركات'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Departments tab */}
                    {leaderboardTab === 'departments' && leaderboard.top_departments.length > 0 && (
                        <div className="list-card">
                            {leaderboard.top_departments.slice(0, 5).map((dept, idx) => (
                                <div key={dept.id} className="list-row" style={{ cursor: 'default' }}>
                                    <div style={{ width: 24, fontSize: 14, fontWeight: 700, color: idx < 3 ? '#0A0A0A' : 'rgba(10,10,10,.5)', textAlign: 'center', flexShrink: 0 }}>
                                        {idx + 1}
                                    </div>
                                    <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{dept.name}</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', flexShrink: 0 }}>
                                        {dept.events_count} {dept.events_count === 1 ? 'مشاركة' : 'مشاركات'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Communities tab */}
                    {leaderboardTab === 'communities' && leaderboard.top_communities.length > 0 && (
                        <div className="list-card">
                            {leaderboard.top_communities.slice(0, 5).map((comm, idx) => (
                                <div key={comm.id} className="list-row" style={{ cursor: 'default' }}>
                                    <div style={{ width: 24, fontSize: 14, fontWeight: 700, color: idx < 3 ? '#0A0A0A' : 'rgba(10,10,10,.5)', textAlign: 'center', flexShrink: 0 }}>
                                        {idx + 1}
                                    </div>
                                    <div style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CategoryIcon icon={comm.category_icon} size={24} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comm.name}</div>
                                        {comm.category_name && <div style={{ fontSize: 11, color: 'rgba(10,10,10,.5)', marginTop: 1 }}>{comm.category_name}</div>}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', flexShrink: 0 }}>
                                        {comm.events_count} {comm.events_count === 1 ? 'فعالية' : 'فعاليات'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── 10. Explore Banner ── */}
            <Link
                href="/employee/explore"
                className="card"
                style={{ background: '#0A0A0A', borderColor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', padding: '20px 24px', marginBottom: 28 }}
            >
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0A0A0A', marginBottom: 4 }}>اكتشف مجتمعات جديدة</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>انضم لمجتمعات شركتك الرياضية</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A' }}>استكشف ←</div>
            </Link>
            {/* ── Closing CTA — the prototype ends home with this ── */}
            <Card>
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-xs font-black text-[#0A0A0A] flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-[#0A0A0A]/60" aria-hidden="true" />
                            لديك فكرة فعالية جديدة لزملائك؟
                        </h3>
                        <p className="text-[11px] text-[#0A0A0A]/55 mt-0.5">
                            اقترح موعداً ومكاناً، وسيقوم قائد المجتمع باعتماد المزوّد.
                        </p>
                    </div>
                    <Link
                        href="/employee/create"
                        className="shrink-0 inline-flex items-center justify-center h-9 px-4 rounded-full bg-[#0A0A0A] text-[#C8FF00] text-xs font-bold hover:bg-[#0A0A0A]/90 transition-colors"
                    >
                        اقترح فعالية
                    </Link>
                </div>
            </Card>
            </Screen>
        </EmployeeLayout>
    );
}
