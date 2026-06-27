import EmployeeLayout from '@/layouts/employee-layout';
import CategoryIcon from '@/components/category-icon';
import TimePicker from '@/components/time-picker';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { Community, Employee, Event, ChallengeWithProgress, QuickMatch, QuickMatchOption } from '@/types/models';
import { useState } from 'react';

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
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} د`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} س`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'منذ يوم';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return 'منذ أسبوع';
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

interface Props {
    employee: Employee;
    communities: (Community & { members_count: number; category?: { icon: string; name: string } })[];
    events: (Event & {
        community: Community & { category?: { icon: string } };
        business: { name: string; district: string };
        category?: { icon: string };
    })[];
    joinedEventIds: number[];
    activityStats: ActivityStats;
    challenges: ChallengeWithProgress[];
    leaderboard: Leaderboard;
    quickMatches: QuickMatch[];
}

export default function EmployeeHome({ employee, communities, events, joinedEventIds, activityStats, challenges, leaderboard, quickMatches }: Props) {
    const unreadCount = Number((usePage().props as Record<string, unknown>).unreadNotifications ?? 0);
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

    const statusMap: Record<string, { label: string; cls: string }> = {
        open: { label: 'مفتوح', cls: 'b-open' },
        confirmed: { label: 'مؤكد', cls: 'b-confirmed' },
        waiting_business: { label: 'معلق', cls: 'b-pending' },
        full: { label: 'مكتمل', cls: 'b-completed' },
        completed: { label: 'منتهي', cls: 'b-completed' },
        cancelled: { label: 'ملغي', cls: 'b-cancelled' },
        rejected: { label: 'مرفوض', cls: 'b-cancelled' },
        alternative_proposed: { label: 'بديل مقترح', cls: 'b-open' },
    };

    return (
        <EmployeeLayout>
            <Head title="الرئيسية" />

            {/* ── 1. Greeting ── */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>مرحبا، {employee.name} 👋</h1>
                <p style={{ fontSize: 14, color: '#666', margin: '4px 0 0' }}>
                    {employee.company?.name ?? ''}
                </p>
            </div>

            {/* ── 2. Metrics ── */}
            <div className="metrics">
                <div className="metric">
                    <div className="value">{activityStats.total_events}</div>
                    <div className="label">نشاط هذا العام</div>
                    <div className="change">↑ {activityStats.events_this_month} هذا الشهر</div>
                </div>
                <div className="metric">
                    <div className="value">{activityStats.streak}</div>
                    <div className="label">أسابيع متواصلة</div>
                </div>
                <div className="metric">
                    <div className="value" style={{ fontSize: activityStats.top_category ? 16 : undefined }}>{activityStats.top_category ?? '—'}</div>
                    <div className="label">النشاط المفضل</div>
                </div>
                <div className="metric">
                    <div className="value">{activityStats.events_this_month}</div>
                    <div className="label">أنشطة الشهر</div>
                </div>
            </div>

            {/* ── 3. Streak Bar ── */}
            <div className="streak-bar">
                <div className="icon">🔥</div>
                <div className="info">
                    <div className="num">{activityStats.streak} أسابيع متواصلة</div>
                    <div className="sub">
                        {activityStats.streak > 0 ? 'استمر في النشاط!' : 'شارك في فعالية هذا الأسبوع'}
                    </div>
                </div>
            </div>

            {/* ── 4. Challenges ── */}
            {challenges.length > 0 && (
                <div className="section">
                    <div className="section-head">
                        <div className="section-title">التحديات</div>
                    </div>
                    {challenges.map((challenge) => {
                        const isCompleted = challenge.completed_at !== null;
                        const remaining = challenge.target_count - challenge.current_count;

                        return (
                            <div className="card" key={challenge.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{challenge.title}</div>
                                        {challenge.description && (
                                            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{challenge.description}</div>
                                        )}
                                    </div>
                                    {isCompleted && (
                                        <span className="badge b-confirmed" style={{ flexShrink: 0, marginRight: 8 }}>مكتمل!</span>
                                    )}
                                </div>
                                <div className="bar-wrap" style={{ height: 8, marginBottom: 8 }}>
                                    <div
                                        className="bar-fill"
                                        style={{ width: `${challenge.percentage}%`, transition: 'width 0.5s ease' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
                                    <span>{challenge.current_count} من {challenge.target_count} — {challenge.percentage}%</span>
                                    {!isCompleted && remaining > 0 && (
                                        <span>باقي {remaining} {remaining === 1 ? 'فعالية' : 'فعاليات'}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── 5. Communities (horizontal pill filter) ── */}
            <div className="section">
                <div className="section-head">
                    <div className="section-title">مجتمعاتي</div>
                    <Link href="/employee/explore" className="section-link">استكشف المزيد</Link>
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {communities.length > 0 ? (
                        communities.map((community) => (
                            <Link
                                key={community.id}
                                href={`/employee/community/${community.id}`}
                                className="pill"
                                style={{ flexShrink: 0, textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                                <CategoryIcon icon={community.category?.icon} size={16} />
                                {community.name}
                            </Link>
                        ))
                    ) : (
                        <div style={{ fontSize: 13, color: '#999', padding: 12 }}>لم تنضم لأي مجتمع بعد</div>
                    )}
                </div>
            </div>

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
                            <label style={{ fontSize: 12, color: '#666', fontWeight: 600, display: 'block', marginBottom: 6 }}>المجتمع</label>
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
                            <label style={{ fontSize: 12, color: '#666', fontWeight: 600, display: 'block', marginBottom: 8 }}>خيارات المواعيد</label>
                            {qmOptions.map((opt, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#18A86B15', color: '#18A86B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
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
                                    style={{ borderStyle: 'dashed', fontSize: 12, color: '#999' }}
                                >
                                    + أضف خيار
                                </button>
                            )}
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 12, color: '#666', fontWeight: 600, display: 'block', marginBottom: 6 }}>رسالة (اختياري)</label>
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
                                if (!qmCommunityId || validOptions.length < 2) return;
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
                            const isLeader = qm.community?.leader_id === employee.id;
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
                                        <p style={{ fontSize: 13, color: '#666', marginBottom: 14, lineHeight: 1.7, margin: '0 0 14px' }}>{qm.message}</p>
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
                                                            background: isMyVote ? 'rgba(255,255,255,.15)' : '#18A86B10',
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
                                                            <span style={{ fontSize: 12, fontWeight: 700, color: isMyVote ? '#fff' : (isWinning ? '#18A86B' : '#999') }}>
                                                                {pct}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#999', marginBottom: canConvert ? 12 : 0 }}>
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
            <div className="section">
                <div className="section-head">
                    <div className="section-title">فعالياتي القادمة</div>
                </div>

                {/* Filter pills */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
                    <button
                        className={`pill${filter === 'all' ? ' on' : ''}`}
                        onClick={() => setFilter('all')}
                        style={{ flexShrink: 0 }}
                    >
                        الكل
                    </button>
                    {communities.map((c) => (
                        <button
                            key={c.id}
                            className={`pill${filter === c.name ? ' on' : ''}`}
                            onClick={() => setFilter(c.name)}
                            style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                            <CategoryIcon icon={c.category?.icon} size={16} /> {c.name}
                        </button>
                    ))}
                </div>

                {/* Event List */}
                {filteredEvents.length > 0 ? (
                    <div className="list-card">
                        {filteredEvents.map((event) => {
                            const pct = event.capacity > 0
                                ? Math.round((event.participants_count / event.capacity) * 100)
                                : 0;
                            const isJoined = joinedEventIds?.includes(event.id);
                            const info = statusMap[event.status] ?? { label: event.status, cls: 'b-completed' };

                            return (
                                <Link
                                    key={event.id}
                                    href={`/employee/detail/${event.id}`}
                                    className="list-row"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    {/* Icon */}
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <CategoryIcon icon={event.category?.icon ?? event.community?.category?.icon} size={22} />
                                    </div>

                                    {/* Name + Meta */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {event.business?.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#999', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                            <span>{formatArabicDate(event.event_date)}</span>
                                            <span>{formatArabicTime(event.start_time)}</span>
                                            {event.recurrence_type && event.recurrence_type !== 'none' && (
                                                <span style={{ color: '#18A86B' }}>
                                                    🔄 {event.recurrence_type === 'daily' ? 'يومي' : event.recurrence_type === 'weekly' ? 'أسبوعي' : 'شهري'}
                                                </span>
                                            )}
                                            {event.parent_event_id && !event.recurrence_type && (
                                                <span style={{ color: '#18A86B' }}>🔄</span>
                                            )}
                                        </div>
                                        {/* Progress bar */}
                                        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="bar-wrap" style={{ flex: 1 }}>
                                                <div className="bar-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>{event.participants_count}/{event.capacity}</span>
                                        </div>
                                    </div>

                                    {/* Price + Status */}
                                    <div style={{ textAlign: 'left', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                        <span className={`badge ${info.cls}`}>{info.label}</span>
                                        {event.player_payment <= 0 ? (
                                            <span style={{ fontSize: 11, color: '#18A86B', fontWeight: 600 }}>مغطى</span>
                                        ) : (
                                            <span style={{ fontSize: 13, fontWeight: 700 }}>{event.cost_per_person?.toLocaleString()} ر.س</span>
                                        )}
                                        {event.status === 'completed' || event.status === 'cancelled' || event.status === 'rejected' ? null : isJoined ? (
                                            <span style={{ fontSize: 11, color: '#18A86B', fontWeight: 600 }}>✓ منضم</span>
                                        ) : event.status === 'open' && event.participants_count < event.capacity ? (
                                            <span style={{ fontSize: 11, color: '#18A86B', fontWeight: 600 }}>انضم</span>
                                        ) : null}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty">
                        <div className="txt">لا توجد فعاليات قادمة حاليا</div>
                    </div>
                )}
            </div>

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
                                        style={isMe ? { background: '#18A86B08', cursor: 'default' } : { cursor: 'default' }}
                                    >
                                        {/* Rank */}
                                        <div style={{ width: 24, fontSize: 14, fontWeight: 700, color: idx < 3 ? '#18A86B' : '#999', textAlign: 'center', flexShrink: 0 }}>
                                            {idx + 1}
                                        </div>
                                        {/* Avatar */}
                                        <div className="avatar" style={{ background: '#18A86B', color: '#fff' }}>
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
                                                <div style={{ fontSize: 11, color: '#999', marginTop: 1 }}>{emp.department_name}</div>
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
                                    <div style={{ width: 24, fontSize: 14, fontWeight: 700, color: idx < 3 ? '#18A86B' : '#999', textAlign: 'center', flexShrink: 0 }}>
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
                                    <div style={{ width: 24, fontSize: 14, fontWeight: 700, color: idx < 3 ? '#18A86B' : '#999', textAlign: 'center', flexShrink: 0 }}>
                                        {idx + 1}
                                    </div>
                                    <div style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CategoryIcon icon={comm.category_icon} size={24} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comm.name}</div>
                                        {comm.category_name && <div style={{ fontSize: 11, color: '#999', marginTop: 1 }}>{comm.category_name}</div>}
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
                style={{ background: '#18A86B', borderColor: '#18A86B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', padding: '20px 24px', marginBottom: 28 }}
            >
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>اكتشف مجتمعات جديدة</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>انضم لمجتمعات شركتك الرياضية</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>استكشف ←</div>
            </Link>
        </EmployeeLayout>
    );
}
