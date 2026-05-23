import EmployeeLayout from '@/layouts/employee-layout';
import SportIcon from '@/components/sport-icon';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { fmtDate, fmtTime, fmtDateTime } from '@/lib/utils';
import StatusBadge from '@/components/status-badge';
import type { Community, Employee, Event, CommunityAnnouncement, CommunityPoll, PollOption, Club, Sport, League } from '@/types/models';
import { useState } from 'react';
import toastr from 'toastr';

interface Props {
    community: Community & {
        sport?: Sport;
        member_count: number;
        events_count?: number;
    };
    events: (Event & { club: Club; sport?: Sport })[];
    announcements: (CommunityAnnouncement & { employee: Employee })[];
    members: (Employee & { pivot?: { role: string } })[];
    leagues: League[];
    polls: CommunityPoll[];
    canAnnounce?: boolean;
    isLeader?: boolean;
}

type Tab = 'events' | 'announcements' | 'members' | 'leagues' | 'polls';

export default function CommunityShow({ community, events, announcements, members, leagues, polls, canAnnounce, isLeader }: Props) {
    const initialTab = (new URLSearchParams(window.location.search).get('tab') as Tab) || 'events';
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const color = community.sport?.color ?? community.color ?? '#009E82';

    const announcementForm = useForm({ body: '' });

    function submitAnnouncement(e: React.FormEvent) {
        e.preventDefault();
        announcementForm.post(`/employee/community/${community.id}/announcement`, {
            preserveScroll: true,
            onSuccess: () => {
                announcementForm.reset('body');
                toastr.success('تم نشر الإعلان بنجاح');
            },
        });
    }

    // Poll creation form
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [pollExpiresAt, setPollExpiresAt] = useState('');
    const [pollSubmitting, setPollSubmitting] = useState(false);

    function addPollOption() {
        if (pollOptions.length < 10) {
            setPollOptions([...pollOptions, '']);
        }
    }

    function removePollOption(index: number) {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    }

    function updatePollOption(index: number, value: string) {
        const updated = [...pollOptions];
        updated[index] = value;
        setPollOptions(updated);
    }

    function submitPoll(e: React.FormEvent) {
        e.preventDefault();
        const filledOptions = pollOptions.filter((o) => o.trim());
        if (!pollQuestion.trim() || filledOptions.length < 2) return;
        setPollSubmitting(true);
        router.post(
            `/employee/community/${community.id}/polls`,
            {
                question: pollQuestion,
                options: filledOptions,
                expires_at: pollExpiresAt || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPollQuestion('');
                    setPollOptions(['', '']);
                    setPollExpiresAt('');
                    toastr.success('تم إنشاء التصويت بنجاح');
                },
                onFinish: () => setPollSubmitting(false),
            },
        );
    }

    function vote(pollId: number, optionId: number) {
        router.post(
            `/employee/community/${community.id}/polls/${pollId}/vote`,
            { option_id: optionId },
            {
                preserveScroll: true,
                onSuccess: () => toastr.success('تم تسجيل تصويتك'),
            },
        );
    }

    function closePoll(pollId: number) {
        if (!confirm('هل تريد إغلاق هذا التصويت؟')) return;
        router.post(
            `/employee/community/${community.id}/polls/${pollId}/close`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toastr.success('تم إغلاق التصويت'),
            },
        );
    }

    function timeAgo(dateStr: string): string {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `منذ ${hours} ساعة`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `منذ ${days} يوم`;
        return fmtDateTime(dateStr);
    }

    function isPollExpired(poll: CommunityPoll): boolean {
        return poll.status === 'closed' || (!!poll.expires_at && new Date(poll.expires_at) < new Date());
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'events', label: 'الفعاليات' },
        { key: 'leagues', label: 'البطولات' },
        { key: 'polls', label: 'التصويتات' },
        { key: 'announcements', label: 'الإعلانات' },
        { key: 'members', label: 'الأعضاء' },
    ];

    return (
        <EmployeeLayout>
            <Head title={community.name} />

            {/* Community header */}
            <div className="card" style={{ borderColor: `${color}33`, marginBottom: 12, marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>
                        <SportIcon icon={community.sport?.icon} size={20} /> مجتمع {community.name}
                    </div>
                    <StatusBadge status={community.status} />
                </div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color }}>{community.member_count}</div>
                        <div style={{ fontSize: 10, color: '#7A8BA8' }}>عضو</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color }}>{community.events_count ?? 0}</div>
                        <div style={{ fontSize: 10, color: '#7A8BA8' }}>فعالية نشطة</div>
                    </div>
                    <div style={{ flex: 1 }} />
                    <Link
                        href={`/employee/create?community_id=${community.id}`}
                        style={{ background: color, color: '#000', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' }}
                    >
                        + إنشاء فعالية
                    </Link>
                </div>
            </div>

            {/* Balance */}
            <div className="card" style={{ borderColor: `${color}44`, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 6, fontWeight: 600 }}>رصيد المجتمع</div>
                <div style={{ fontSize: 26, fontWeight: 900, color }}>{community.balance?.toLocaleString()} ريال</div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className="pill"
                        onClick={() => setActiveTab(tab.key)}
                        style={activeTab === tab.key ? { background: color, color: '#fff' } : { background: '#E4E9F2', color: '#7A8BA8' }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div>
                    {events.length > 0 ? (
                        events.map((event) => {
                            const pct = event.capacity > 0
                                ? Math.round((event.participants_count / event.capacity) * 100)
                                : 0;
                            return (
                                <Link
                                    key={event.id}
                                    href={`/employee/detail/${event.id}`}
                                    className="card"
                                    style={{ cursor: 'pointer', borderLeft: `3px solid ${color}`, textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div style={{ fontSize: 13, fontWeight: 700 }}>{event.club?.name}</div>
                                    <div style={{ fontSize: 11, color: '#7A8BA8', margin: '4px 0 8px' }}>
                                        {fmtDate(event.event_date)} · {fmtTime(event.start_time)}
                                    </div>
                                    <div className="bar-wrap">
                                        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
                                    </div>
                                    <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 4 }}>
                                        {event.participants_count} من {event.capacity}
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>لا توجد فعاليات حاليا</div>
                    )}
                </div>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
                <div>
                    {/* Post form - only for leaders/captains */}
                    {canAnnounce && (
                        <form onSubmit={submitAnnouncement} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 12 }}>
                            <textarea
                                value={announcementForm.data.body}
                                onChange={(e) => announcementForm.setData('body', e.target.value)}
                                placeholder="اكتب إعلانا للمجتمع..."
                                style={{ flex: 1, borderRadius: 12, border: '1px solid #E4E9F2', background: '#fff', padding: '8px 12px', fontSize: 13, resize: 'none', minHeight: 40, outline: 'none', fontFamily: 'inherit' }}
                                rows={2}
                            />
                            <button
                                type="submit"
                                disabled={!announcementForm.data.body.trim() || announcementForm.processing}
                                style={{ width: 40, height: 40, borderRadius: 10, background: '#009E82', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16 }}
                            >
                                📤
                            </button>
                        </form>
                    )}

                    {announcements.length > 0 ? (
                        announcements.map((a) => (
                            <div key={a.id} className="card">
                                <div style={{ fontSize: 13, color: '#4A5C78', lineHeight: 1.6 }}>{a.body}</div>
                                <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 6 }}>
                                    {fmtDateTime(a.created_at)} · {a.employee?.name}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>لا توجد إعلانات</div>
                    )}
                </div>
            )}

            {/* Polls Tab */}
            {activeTab === 'polls' && (
                <div>
                    {/* Poll creation form - only for leaders/captains */}
                    {canAnnounce && (
                        <form onSubmit={submitPoll} className="card" style={{ marginBottom: 16, border: `2px dashed ${color}44` }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color }}>إنشاء تصويت جديد</div>
                            <input
                                type="text"
                                value={pollQuestion}
                                onChange={(e) => setPollQuestion(e.target.value)}
                                placeholder="اكتب السؤال..."
                                maxLength={500}
                                style={{
                                    width: '100%', borderRadius: 10, border: '1px solid #E4E9F2', background: '#fff',
                                    padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
                                    marginBottom: 10, boxSizing: 'border-box',
                                }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#7A8BA8', marginBottom: 6 }}>الخيارات</div>
                            {pollOptions.map((opt, i) => (
                                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => updatePollOption(i, e.target.value)}
                                        placeholder={`الخيار ${i + 1}`}
                                        maxLength={200}
                                        style={{
                                            flex: 1, borderRadius: 8, border: '1px solid #E4E9F2', background: '#fff',
                                            padding: '6px 10px', fontSize: 12, outline: 'none', fontFamily: 'inherit',
                                        }}
                                    />
                                    {pollOptions.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removePollOption(i)}
                                            style={{
                                                width: 28, height: 28, borderRadius: 8, border: '1px solid #E4E9F2',
                                                background: '#fff', color: '#E74C3C', cursor: 'pointer', fontSize: 14,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            {pollOptions.length < 10 && (
                                <button
                                    type="button"
                                    onClick={addPollOption}
                                    style={{
                                        background: 'none', border: `1px dashed ${color}66`, borderRadius: 8,
                                        color, padding: '4px 12px', fontSize: 11, fontWeight: 600,
                                        cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10, marginTop: 4,
                                    }}
                                >
                                    + إضافة خيار
                                </button>
                            )}
                            <div style={{ marginTop: 8, marginBottom: 10 }}>
                                <label style={{ fontSize: 11, color: '#7A8BA8', fontWeight: 600 }}>
                                    تاريخ الانتهاء (اختياري)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={pollExpiresAt}
                                    onChange={(e) => setPollExpiresAt(e.target.value)}
                                    style={{
                                        display: 'block', width: '100%', borderRadius: 8, border: '1px solid #E4E9F2',
                                        background: '#fff', padding: '6px 10px', fontSize: 12, outline: 'none',
                                        fontFamily: 'inherit', marginTop: 4, boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={pollSubmitting || !pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2}
                                style={{
                                    width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
                                    background: color, color: '#fff', fontSize: 13, fontWeight: 700,
                                    cursor: 'pointer', fontFamily: 'inherit', opacity: pollSubmitting ? 0.6 : 1,
                                }}
                            >
                                {pollSubmitting ? 'جاري الإنشاء...' : 'إنشاء التصويت'}
                            </button>
                        </form>
                    )}

                    {/* Polls list */}
                    {polls.length > 0 ? (
                        polls.map((poll) => {
                            const expired = isPollExpired(poll);
                            const hasVoted = poll.my_vote !== null;
                            const showResults = hasVoted || expired;
                            const totalVotes = poll.total_votes || 0;

                            return (
                                <div key={poll.id} className="card" style={{ marginBottom: 12, borderRight: `3px solid ${expired ? '#7A8BA8' : color}` }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.5 }}>{poll.question}</div>
                                            <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 4 }}>
                                                {poll.creator?.name} · {timeAgo(poll.created_at)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, marginRight: 8 }}>
                                            {expired && (
                                                <span style={{
                                                    display: 'inline-block', padding: '2px 8px', borderRadius: 12,
                                                    fontSize: 10, fontWeight: 700, background: '#6B7A9918', color: '#6B7A99',
                                                }}>
                                                    منتهي
                                                </span>
                                            )}
                                            {!expired && canAnnounce && (
                                                <button
                                                    onClick={() => closePoll(poll.id)}
                                                    style={{
                                                        padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700,
                                                        background: '#E74C3C18', color: '#E74C3C', border: 'none',
                                                        cursor: 'pointer', fontFamily: 'inherit',
                                                    }}
                                                >
                                                    إغلاق
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Options */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {poll.options?.map((option) => {
                                            const pct = totalVotes > 0 ? Math.round((option.votes_count / totalVotes) * 100) : 0;
                                            const isMyVote = poll.my_vote === option.id;

                                            if (showResults) {
                                                // Show results mode
                                                return (
                                                    <div
                                                        key={option.id}
                                                        style={{
                                                            position: 'relative', borderRadius: 10, overflow: 'hidden',
                                                            border: isMyVote ? `2px solid ${color}` : '1px solid #E4E9F2',
                                                            background: '#fff',
                                                        }}
                                                    >
                                                        {/* Progress bar background */}
                                                        <div
                                                            style={{
                                                                position: 'absolute', top: 0, right: 0, bottom: 0,
                                                                width: `${pct}%`, background: isMyVote ? `${color}22` : '#E4E9F244',
                                                                transition: 'width 0.4s ease',
                                                            }}
                                                        />
                                                        <div style={{
                                                            position: 'relative', padding: '8px 12px',
                                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                {isMyVote && (
                                                                    <span style={{ color, fontSize: 12, fontWeight: 900 }}>&#10003;</span>
                                                                )}
                                                                <span style={{
                                                                    fontSize: 12, fontWeight: isMyVote ? 700 : 500,
                                                                    color: isMyVote ? color : '#4A5C78',
                                                                }}>
                                                                    {option.label}
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <span style={{ fontSize: 11, fontWeight: 700, color: '#7A8BA8' }}>
                                                                    {option.votes_count}
                                                                </span>
                                                                <span style={{ fontSize: 11, fontWeight: 700, color: isMyVote ? color : '#7A8BA8' }}>
                                                                    {pct}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // Voting mode - clickable
                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => vote(poll.id, option.id)}
                                                    style={{
                                                        display: 'block', width: '100%', padding: '10px 12px',
                                                        borderRadius: 10, border: '1px solid #E4E9F2', background: '#fff',
                                                        fontSize: 12, fontWeight: 500, color: '#4A5C78',
                                                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right',
                                                        transition: 'all 0.15s ease',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = color;
                                                        e.currentTarget.style.background = `${color}08`;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = '#E4E9F2';
                                                        e.currentTarget.style.background = '#fff';
                                                    }}
                                                >
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Footer */}
                                    <div style={{ fontSize: 10, color: '#7A8BA8', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{totalVotes} صوت</span>
                                        {poll.expires_at && !expired && (
                                            <span>ينتهي {timeAgo(poll.expires_at).replace('منذ', 'بعد')}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>لا توجد تصويتات</div>
                    )}
                </div>
            )}

            {/* Leagues Tab */}
            {activeTab === 'leagues' && (
                <div>
                    {isLeader && (
                        <Link
                            href={`/employee/community/${community.id}/leagues/create`}
                            style={{
                                display: 'block', textAlign: 'center', textDecoration: 'none',
                                background: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
                                border: `2px dashed ${color}44`, color, fontWeight: 700, fontSize: 13,
                            }}
                        >
                            + إنشاء بطولة جديدة
                        </Link>
                    )}
                    {leagues.length > 0 ? (
                        leagues.map((league) => {
                            const formatLabel = league.format === 'knockout' ? 'خروج المغلوب'
                                : league.format === 'double_round_robin' ? 'دوري ذهاب وإياب' : 'دوري دور واحد';
                            return (
                                <Link
                                    key={league.id}
                                    href={`/employee/community/${community.id}/leagues/${league.id}`}
                                    style={{
                                        display: 'block', textDecoration: 'none', color: 'inherit',
                                        background: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
                                        border: '1px solid #E4E9F2', borderRight: `3px solid ${color}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700 }}>{league.name}</div>
                                            <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 4 }}>
                                                {formatLabel} · {league.departments?.length ?? 0} أقسام
                                            </div>
                                        </div>
                                        <span style={{
                                            display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
                                            ...(league.status === 'active' ? { background: '#009E8218', color: '#009E82' } : { background: '#6B7A9918', color: '#6B7A99' }),
                                        }}>
                                            {league.status === 'active' ? 'جارية' : 'منتهية'}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>لا توجد بطولات</div>
                    )}
                </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
                <div>
                    {members.length > 0 ? (
                        members.map((member) => (
                            <div key={member.id} className="card row" style={{ marginBottom: 8 }}>
                                <div className="avatar" style={{ background: `${color}22`, color }}>
                                    {member.name?.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{member.name}</div>
                                    <div style={{ fontSize: 11, color: '#7A8BA8' }}>{member.department?.name ?? '—'}</div>
                                </div>
                                {(member.pivot?.role === 'captain' || community.leader_id === member.id) && (
                                    <span className="badge" style={{ background: `${color}18`, color }}>
                                        {community.leader_id === member.id ? 'قائد' : 'كابتن'}
                                    </span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>لا يوجد أعضاء</div>
                    )}
                </div>
            )}
        </EmployeeLayout>
    );
}
