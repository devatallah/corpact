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

const rankColors = ['#D4A017', '#9CA3AF', '#CD7F32'];

export default function EmployeeHome({ employee, communities, events, joinedEventIds, activityStats, challenges, leaderboard, quickMatches }: Props) {
    const unreadCount = Number((usePage().props as Record<string, unknown>).unreadNotifications ?? 0);
    const [filter, setFilter] = useState<string>('all');
    const [showQmForm, setShowQmForm] = useState(false);
    const [qmCommunityId, setQmCommunityId] = useState<string>('');
    const [qmOptions, setQmOptions] = useState<{ date: string; time: string }[]>([{ date: '', time: '' }, { date: '', time: '' }]);
    const [qmMessage, setQmMessage] = useState('');
    const [qmLoading, setQmLoading] = useState(false);

    const filteredEvents = filter === 'all'
        ? events
        : events.filter((e) => e.community?.name === filter);

    return (
        <EmployeeLayout>
            <Head title="الرئيسية" />

            {/* Greeting */}
            <div style={{ padding: '16px 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 13, color: '#7A8BA8' }}>مرحبا،</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{employee.name} 👋</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Link
                        href="/employee/notifications"
                        style={{ width: 42, height: 42, borderRadius: '50%', background: '#fff', border: '1px solid #E4E9F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, position: 'relative', textDecoration: 'none' }}
                    >
                        🔔
                        {unreadCount > 0 && <div className="notif-dot" />}
                    </Link>
                    <Link
                        href="/employee/profile"
                        style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#009E82,#5B3FCC)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700, textDecoration: 'none' }}
                    >
                        {employee.name?.charAt(0)}
                    </Link>
                </div>
            </div>

            {/* Activity Stats */}
            <div style={{ background: '#fff', border: '1px solid #E4E9F2', borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: activityStats.streak > 0 ? 'linear-gradient(135deg,#F59E0B,#EF4444)' : '#E4E9F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {activityStats.streak > 0 ? '🔥' : '⭐'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0F1923' }}>
                            {activityStats.streak > 0
                                ? `🔥 ${activityStats.streak} أسابيع متتالية`
                                : 'ابدأ سلسلتك!'}
                        </div>
                        <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>
                            {activityStats.streak > 0 ? 'استمر في النشاط!' : 'شارك في فعالية هذا الأسبوع'}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, background: '#F7F9FC', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#009E82' }}>{activityStats.total_events}</div>
                        <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 2 }}>إجمالي الفعاليات</div>
                    </div>
                    <div style={{ flex: 1, background: '#F7F9FC', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#009E82' }}>{activityStats.events_this_month}</div>
                        <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 2 }}>هذا الشهر</div>
                    </div>
                    <div style={{ flex: 1, background: '#F7F9FC', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#009E82' }}>{activityStats.top_category ?? '—'}</div>
                        <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 2 }}>الفئة الأكثر</div>
                    </div>
                </div>
            </div>

            {/* Challenges */}
            {challenges.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>التحديات</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {challenges.map((challenge) => {
                            const isCompleted = challenge.completed_at !== null;
                            const remaining = challenge.target_count - challenge.current_count;

                            return (
                                <div
                                    key={challenge.id}
                                    style={{
                                        background: '#fff',
                                        border: isCompleted ? '1px solid #009E8233' : '1px solid #E4E9F2',
                                        borderRadius: 16,
                                        padding: 16,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1923', lineHeight: 1.5 }}>
                                                {challenge.title}
                                            </div>
                                            {challenge.description && (
                                                <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 3 }}>
                                                    {challenge.description}
                                                </div>
                                            )}
                                        </div>
                                        {isCompleted && (
                                            <span style={{
                                                background: '#009E8215',
                                                color: '#009E82',
                                                borderRadius: 20,
                                                padding: '4px 12px',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                flexShrink: 0,
                                                marginRight: 8,
                                            }}>
                                                مكتمل!
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress bar */}
                                    <div style={{ position: 'relative', height: 24, background: '#E4E9F214', borderRadius: 12, overflow: 'hidden', border: '1px solid #E4E9F2' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${challenge.percentage}%`,
                                            background: isCompleted
                                                ? 'linear-gradient(90deg, #009E82, #00C9A7)'
                                                : 'linear-gradient(90deg, #009E82, #00B894)',
                                            borderRadius: 12,
                                            transition: 'width 0.5s ease',
                                            minWidth: challenge.percentage > 0 ? 24 : 0,
                                        }} />
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 11,
                                            fontWeight: 800,
                                            color: challenge.percentage > 45 ? '#fff' : '#4A5C78',
                                        }}>
                                            {challenge.percentage}%
                                        </div>
                                    </div>

                                    {/* Count text */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7A8BA8', marginTop: 8 }}>
                                        <span>{challenge.current_count} من {challenge.target_count}</span>
                                        {!isCompleted && remaining > 0 && (
                                            <span>باقي {remaining} {remaining === 1 ? 'فعالية' : 'فعاليات'}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* My Communities */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>مجتمعاتي</div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                    {communities.length > 0 ? (
                        communities.map((community) => (
                            <Link
                                key={community.id}
                                href={`/employee/community/${community.id}`}
                                className="card"
                                style={{ minWidth: 120, flexShrink: 0, cursor: 'pointer', borderColor: `${community.category?.color ?? community.color ?? '#009E82'}33`, marginBottom: 0, textDecoration: 'none', color: 'inherit' }}
                            >
                                <div style={{ marginBottom: 6 }}><CategoryIcon icon={community.category?.icon} size={28} /></div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{community.name}</div>
                                <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>{community.members_count} عضو</div>
                            </Link>
                        ))
                    ) : (
                        <div style={{ fontSize: 13, color: '#7A8BA8', padding: 12 }}>لم تنضم لأي مجتمع بعد</div>
                    )}
                </div>
            </div>

            {/* Explore Banner */}
            <Link
                href="/employee/explore"
                style={{ background: 'linear-gradient(135deg,#009E82,#2563EB)', borderRadius: 18, padding: '18px 20px', marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 20px rgba(0,158,130,.3)', textDecoration: 'none' }}
            >
                <div style={{ fontSize: 36 }}>🔍</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 3 }}>اكتشف مجتمعات جديدة</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)' }}>انضم لمجتمعات شركتك الرياضية</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 700, color: '#fff' }}>استكشف ←</div>
            </Link>

            {/* Quick Match Polls */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>تصويتات المباريات</div>
                    {communities.length > 0 && (
                        <button
                            onClick={() => setShowQmForm(!showQmForm)}
                            style={{ background: '#009E82', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                        >
                            {showQmForm ? 'إلغاء' : '+ تصويت جديد'}
                        </button>
                    )}
                </div>

                {/* Create Poll Form */}
                {showQmForm && (
                    <div style={{ background: '#fff', border: '1px solid #E4E9F2', borderRadius: 16, padding: 16, marginBottom: 14 }}>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, color: '#4A5C78', fontWeight: 600, display: 'block', marginBottom: 6 }}>المجتمع</label>
                            <select
                                value={qmCommunityId}
                                onChange={(e) => setQmCommunityId(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E4E9F2', borderRadius: 10, fontSize: 13, background: '#fff', appearance: 'none', WebkitAppearance: 'none' }}
                                required
                            >
                                <option value="">اختر المجتمع</option>
                                {communities.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Poll Options */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, color: '#4A5C78', fontWeight: 600, display: 'block', marginBottom: 8 }}>خيارات المواعيد</label>
                            {qmOptions.map((opt, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#009E8215', color: '#009E82', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
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
                                        style={{ flex: 1, padding: '8px 10px', border: '1px solid #E4E9F2', borderRadius: 10, fontSize: 12, background: '#fff' }}
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
                                            style={{ width: 28, height: 28, borderRadius: '50%', background: '#EF444415', color: '#EF4444', border: 'none', fontSize: 14, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            {qmOptions.length < 5 && (
                                <button
                                    onClick={() => setQmOptions([...qmOptions, { date: '', time: '' }])}
                                    style={{ background: 'none', border: '1px dashed #E4E9F2', borderRadius: 10, padding: '8px 0', width: '100%', fontSize: 12, color: '#7A8BA8', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    + أضف خيار
                                </button>
                            )}
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, color: '#4A5C78', fontWeight: 600, display: 'block', marginBottom: 6 }}>رسالة (اختياري)</label>
                            <textarea
                                value={qmMessage}
                                onChange={(e) => setQmMessage(e.target.value)}
                                placeholder="مثال: نبي نلعب بادل بعد الدوام"
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E4E9F2', borderRadius: 10, fontSize: 13, resize: 'none', minHeight: 60, fontFamily: 'inherit' }}
                            />
                        </div>
                        <button
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
                            style={{ width: '100%', background: (!qmCommunityId || qmOptions.filter(o => o.date && o.time).length < 2) ? '#E4E9F2' : '#009E82', color: (!qmCommunityId || qmOptions.filter(o => o.date && o.time).length < 2) ? '#7A8BA8' : '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: (!qmCommunityId || qmOptions.filter(o => o.date && o.time).length < 2) ? 'not-allowed' : 'pointer' }}
                        >
                            {qmLoading ? 'جاري الإنشاء...' : 'نشر التصويت'}
                        </button>
                    </div>
                )}

                {/* Poll Cards */}
                {quickMatches.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {quickMatches.map((qm) => {
                            const isCreator = qm.created_by === employee.id;
                            const isLeader = qm.community?.leader_id === employee.id;
                            const totalVotes = qm.votes_count ?? 0;
                            const canConvert = (isCreator || isLeader) && totalVotes >= 2;

                            return (
                                <div
                                    key={qm.id}
                                    style={{ background: '#fff', border: '1px solid #E4E9F2', borderRadius: 16, padding: 16 }}
                                >
                                    {/* Header: community + badge */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <CategoryIcon icon={qm.community?.category?.icon} size={22} />
                                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F1923' }}>{qm.community?.name}</span>
                                        </div>
                                        {qm.source === 'auto' && (
                                            <span style={{ background: '#F59E0B15', color: '#F59E0B', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700 }}>
                                                اقتراح تلقائي
                                            </span>
                                        )}
                                    </div>

                                    {/* Message */}
                                    {qm.message && (
                                        <div style={{ fontSize: 13, color: '#4A5C78', marginBottom: 12, lineHeight: 1.6 }}>
                                            {qm.message}
                                        </div>
                                    )}

                                    {/* Poll Options */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                        {(qm.options ?? []).map((option: QuickMatchOption) => {
                                            const isMyVote = qm.my_vote_option_id === option.id;
                                            const pct = totalVotes > 0 ? Math.round((option.votes_count / totalVotes) * 100) : 0;
                                            const isWinning = totalVotes > 0 && option.votes_count === Math.max(...(qm.options ?? []).map((o: QuickMatchOption) => o.votes_count));

                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => router.post(`/employee/quick-match/${qm.id}/vote`, { option_id: option.id })}
                                                    style={{
                                                        position: 'relative',
                                                        background: isMyVote ? '#009E8210' : '#F7F9FC',
                                                        border: isMyVote ? '2px solid #009E82' : '1px solid #E4E9F2',
                                                        borderRadius: 12,
                                                        padding: '12px 14px',
                                                        cursor: 'pointer',
                                                        textAlign: 'right',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {/* Progress bar background */}
                                                    {totalVotes > 0 && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            width: `${pct}%`,
                                                            background: isWinning ? '#009E8218' : '#E4E9F240',
                                                            borderRadius: 12,
                                                            transition: 'width 0.3s ease',
                                                        }} />
                                                    )}
                                                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            {isMyVote && <span style={{ color: '#009E82', fontSize: 14 }}>✓</span>}
                                                            <span style={{ fontSize: 13, fontWeight: isMyVote ? 700 : 600, color: isMyVote ? '#009E82' : '#0F1923' }}>
                                                                📅 {formatArabicDate(option.date)} — 🕐 {formatArabicTime(option.time)}
                                                            </span>
                                                        </div>
                                                        {totalVotes > 0 && (
                                                            <span style={{ fontSize: 12, fontWeight: 700, color: isWinning ? '#009E82' : '#7A8BA8' }}>
                                                                {pct}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Footer: creator, votes count, time ago */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: canConvert ? 12 : 0, fontSize: 11, color: '#7A8BA8' }}>
                                        <span>{qm.created_by ? qm.creator?.name : 'النظام'}</span>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                            <span>{totalVotes} {totalVotes === 1 ? 'صوت' : 'أصوات'}</span>
                                            <span>{timeAgo(qm.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Convert button */}
                                    {canConvert && (
                                        <button
                                            onClick={() => router.post(`/employee/quick-match/${qm.id}/convert`)}
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                background: 'linear-gradient(135deg,#009E82,#2563EB)',
                                                color: '#fff',
                                                borderRadius: 12,
                                                padding: '10px 0',
                                                fontSize: 13,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            حوّل لفعالية
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 20, color: '#7A8BA8', fontSize: 13 }}>لا توجد تصويتات حالياً</div>
                )}
            </div>

            {/* Upcoming Events */}
            <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>فعالياتي القادمة</div>

                {/* Filter pills */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
                    <button
                        className="pill"
                        onClick={() => setFilter('all')}
                        style={{ background: filter === 'all' ? '#009E82' : '#E4E9F2', color: filter === 'all' ? '#fff' : '#7A8BA8', flexShrink: 0 }}
                    >
                        الكل
                    </button>
                    {communities.map((c) => (
                        <button
                            key={c.id}
                            className="pill"
                            onClick={() => setFilter(c.name)}
                            style={{ background: filter === c.name ? '#009E82' : '#E4E9F2', color: filter === c.name ? '#fff' : '#7A8BA8', flexShrink: 0 }}
                        >
                            <CategoryIcon icon={c.category?.icon} size={16} /> {c.name}
                        </button>
                    ))}
                </div>

                {/* Event Cards */}
                <div>
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event) => {
                            const color = event.category?.color ?? event.community?.color ?? '#009E82';
                            const pct = event.capacity > 0
                                ? Math.round((event.participants_count / event.capacity) * 100)
                                : 0;
                            const isJoined = joinedEventIds?.includes(event.id);
                            const statusMap: Record<string, { label: string; color: string }> = {
                                open: { label: 'مفتوح', color: '#009E82' },
                                confirmed: { label: 'مؤكد', color: '#2563EB' },
                                waiting_business: { label: 'معلق', color: '#F59E0B' },
                                full: { label: 'مكتمل', color: '#8B5CF6' },
                                completed: { label: 'منتهي', color: '#6B7280' },
                                cancelled: { label: 'ملغي', color: '#EF4444' },
                                rejected: { label: 'مرفوض', color: '#EF4444' },
                                alternative_proposed: { label: 'بديل مقترح', color: '#F59E0B' },
                            };
                            const statusInfo = statusMap[event.status] ?? { label: event.status, color: '#6B7280' };
                            const statusLabel = statusInfo.label;
                            const statusColor = statusInfo.color;

                            return (
                                <Link
                                    key={event.id}
                                    href={`/employee/detail/${event.id}`}
                                    style={{ display: 'block', background: '#fff', border: '1px solid #E4E9F2', borderRadius: 16, padding: 16, marginBottom: 12, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                                >
                                    {/* Row 1: Status badge (left) + Business name (right) */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ background: `${statusColor}15`, color: statusColor, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                                            {statusLabel}
                                        </span>
                                        <div style={{ textAlign: 'right', marginRight: 12 }}>
                                            <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.3 }}>{event.business?.name}</div>
                                            <div style={{ fontSize: 12, color: '#7A8BA8' }}>{event.business?.district}</div>
                                        </div>
                                    </div>

                                    {/* Row 2: Date & Time (right-aligned) */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, margin: '14px 0' }}>
                                        <span style={{ fontSize: 13, color: '#4A5C78' }}>📅 {formatArabicDate(event.event_date)}</span>
                                        <span style={{ fontSize: 13, color: '#4A5C78' }}>🕐 {formatArabicTime(event.start_time)}</span>
                                    </div>

                                    {/* Row 3: Progress bar */}
                                    <div style={{ height: 6, background: '#E4E9F2', borderRadius: 6, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 6 }} />
                                    </div>

                                    {/* Row 4: Count */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7A8BA8', marginTop: 6, marginBottom: 14 }}>
                                        <span>{event.participants_count} منضم</span>
                                        <span>من {event.capacity}</span>
                                    </div>

                                    {/* Row 5: Action button (left) + Price (right) */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {event.status === 'completed' || event.status === 'cancelled' || event.status === 'rejected' ? (
                                            <span style={{ background: '#E4E9F2', color: '#7A8BA8', borderRadius: 24, padding: '6px 18px', fontSize: 13, fontWeight: 700 }}>{statusLabel}</span>
                                        ) : isJoined ? (
                                            <span style={{ border: `2px solid ${color}`, color, background: `${color}10`, borderRadius: 24, padding: '6px 18px', fontSize: 13, fontWeight: 700 }}>✓ منضم</span>
                                        ) : event.status === 'open' && event.participants_count < event.capacity ? (
                                            <span style={{ background: color, color: '#fff', borderRadius: 24, padding: '8px 20px', fontSize: 13, fontWeight: 700 }}>انضم</span>
                                        ) : (
                                            <span style={{ background: `${statusColor}15`, color: statusColor, borderRadius: 24, padding: '6px 18px', fontSize: 13, fontWeight: 700 }}>{statusLabel}</span>
                                        )}
                                        {event.player_payment <= 0 ? (
                                            <span style={{ fontSize: 14, color, fontWeight: 700 }}>✓ مغطى من الشركة</span>
                                        ) : (
                                            <span style={{ fontSize: 17, color, fontWeight: 800 }}>{event.cost_per_person?.toLocaleString()} ر/شخص</span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>لا توجد فعاليات قادمة حاليا</div>
                    )}
                </div>
            </div>
            {/* Leaderboard */}
            {(leaderboard.top_employees.length > 0 || leaderboard.top_departments.length > 0 || leaderboard.top_communities.length > 0) && (
                <div style={{ marginTop: 28 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                        الاكثر نشاطا - {arabicMonths[new Date().getMonth()]} {new Date().getFullYear()}
                    </div>

                    {/* Top Employees */}
                    {leaderboard.top_employees.length > 0 && (
                        <div style={{ marginBottom: 18 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#4A5C78', marginBottom: 10 }}>الموظفين</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {leaderboard.top_employees.slice(0, 3).map((emp, idx) => (
                                    <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid ${rankColors[idx] ?? '#E4E9F2'}33`, borderRadius: 14, padding: '12px 14px' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: rankColors[idx] ?? '#E4E9F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#009E82,#5B3FCC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                                            {emp.avatar ? <img src={emp.avatar} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} /> : emp.name?.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                                            {emp.department_name && <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 1 }}>{emp.department_name}</div>}
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: rankColors[idx] ?? '#7A8BA8', flexShrink: 0 }}>{emp.events_count} {emp.events_count === 1 ? 'مشاركة' : 'مشاركات'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Top Departments */}
                    {leaderboard.top_departments.length > 0 && (
                        <div style={{ marginBottom: 18 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#4A5C78', marginBottom: 10 }}>الاقسام</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {leaderboard.top_departments.slice(0, 3).map((dept, idx) => (
                                    <div key={dept.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid ${rankColors[idx] ?? '#E4E9F2'}33`, borderRadius: 14, padding: '12px 14px' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: rankColors[idx] ?? '#E4E9F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                                        <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{dept.name}</div>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: rankColors[idx] ?? '#7A8BA8', flexShrink: 0 }}>{dept.events_count} {dept.events_count === 1 ? 'مشاركة' : 'مشاركات'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Top Communities */}
                    {leaderboard.top_communities.length > 0 && (
                        <div style={{ marginBottom: 18 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#4A5C78', marginBottom: 10 }}>المجتمعات</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {leaderboard.top_communities.slice(0, 3).map((comm, idx) => (
                                    <div key={comm.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid ${rankColors[idx] ?? '#E4E9F2'}33`, borderRadius: 14, padding: '12px 14px' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: rankColors[idx] ?? '#E4E9F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{idx + 1}</div>
                                        <div style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CategoryIcon icon={comm.category_icon} size={28} /></div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comm.name}</div>
                                            {comm.category_name && <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 1 }}>{comm.category_name}</div>}
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: rankColors[idx] ?? '#7A8BA8', flexShrink: 0 }}>{comm.events_count} {comm.events_count === 1 ? 'فعالية' : 'فعاليات'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </EmployeeLayout>
    );
}
