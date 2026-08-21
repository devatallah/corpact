import EmployeeLayout from '@/layouts/employee-layout';
import CategoryIcon from '@/components/category-icon';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { fmtDate, fmtTime, fmtDateTime } from '@/lib/utils';
import StatusBadge from '@/components/status-badge';
import type { Community, Employee, Event, CommunityAnnouncement, CommunityPoll, PollOption, Partner, Category, League } from '@/types/models';
import { useState } from 'react';
import toastr from 'toastr';

interface Props {
    community: Community & {
        category?: Category;
        member_count: number;
        events_count?: number;
    };
    events: (Event & { partner: Partner; category?: Category })[];
    announcements: (CommunityAnnouncement & { employee: Employee; link_url?: string | null; edited_at?: string | null; can_modify?: boolean })[];
    members: Employee[];
    leagues: League[];
    polls: CommunityPoll[];
    canAnnounce?: boolean;
    canInvite?: boolean;
    isLeader?: boolean;
    isPrimaryLeader?: boolean;
    leaderIds?: number[];
    primaryLeaderId?: number | null;
    invitableEmployees?: { id: number; name: string }[];
}

type Tab = 'events' | 'announcements' | 'members' | 'leagues' | 'polls';

export default function CommunityShow({ community, events, announcements, members, leagues, polls, canAnnounce, canInvite, isLeader, isPrimaryLeader, leaderIds = [], primaryLeaderId, invitableEmployees = [] }: Props) {
    const initialTab = (new URLSearchParams(window.location.search).get('tab') as Tab) || 'events';
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const color = community.category?.color ?? community.color ?? '#18A86B';

    const announcementForm = useForm({ body: '', link_url: '' });
    const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
    const editForm = useForm({ body: '', link_url: '' });

    function submitAnnouncement(e: React.FormEvent) {
        e.preventDefault();
        announcementForm.transform((data) => ({ ...data, link_url: data.link_url.trim() || null }));
        announcementForm.post(`/employee/community/${community.id}/announcement`, {
            preserveScroll: true,
            onSuccess: () => {
                announcementForm.reset('body', 'link_url');
                toastr.success('تم نشر الإعلان بنجاح');
            },
        });
    }

    function startEditAnnouncement(a: { id: number; body: string; link_url?: string | null }) {
        setEditingAnnouncementId(a.id);
        editForm.setData({ body: a.body, link_url: a.link_url ?? '' });
    }

    function submitEditAnnouncement(e: React.FormEvent, announcementId: number) {
        e.preventDefault();
        editForm.transform((data) => ({ ...data, link_url: data.link_url.trim() || null }));
        editForm.patch(`/employee/community/${community.id}/announcement/${announcementId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingAnnouncementId(null);
                toastr.success('تم تعديل الإعلان');
            },
        });
    }

    function deleteAnnouncement(announcementId: number) {
        if (!confirm('حذف هذا الإعلان؟ (متاح خلال 15 دقيقة من نشره)')) return;
        router.delete(`/employee/community/${community.id}/announcement/${announcementId}`, {
            preserveScroll: true,
            onSuccess: () => toastr.success('تم حذف الإعلان'),
        });
    }

    // Member management (leader) — H §6: removal needs a documented reason.
    const [inviteEmployeeId, setInviteEmployeeId] = useState('');
    const [transferEmployeeId, setTransferEmployeeId] = useState('');

    function removeMember(member: { id: number; name: string }) {
        const reason = prompt(`سبب إزالة ${member.name} من المجتمع (إلزامي وموثَّق):`);
        if (!reason?.trim()) return;
        router.post(`/employee/community/${community.id}/members/${member.id}/remove`, { reason }, {
            preserveScroll: true,
            onSuccess: () => toastr.success('تمت إزالة العضو'),
        });
    }

    function inviteEmployee(e: React.FormEvent) {
        e.preventDefault();
        if (!inviteEmployeeId) return;
        router.post(`/employee/community/${community.id}/invite`, { employee_id: inviteEmployeeId }, {
            preserveScroll: true,
            onSuccess: () => {
                setInviteEmployeeId('');
                toastr.success('تم إرسال الدعوة');
            },
        });
    }

    function transferLeadership(e: React.FormEvent) {
        e.preventDefault();
        if (!transferEmployeeId) return;
        if (!confirm('نقل القيادة الأساسية؟ ستفقد دور القائد الأساسي.')) return;
        router.post(`/employee/community/${community.id}/transfer-leadership`, { employee_id: transferEmployeeId }, {
            preserveScroll: true,
            onSuccess: () => toastr.success('تم نقل القيادة'),
        });
    }

    function stepDown() {
        if (!confirm('التنحّي عن القيادة؟ مجتمع بلا قائد 14 يوماً يولّد تنبيهاً لمسؤول الحساب، وبعد 30 يوماً يصبح خاملاً. يُفضَّل نقل القيادة بدل التنحّي.')) return;
        router.post(`/employee/community/${community.id}/step-down`, {}, {
            preserveScroll: true,
            onSuccess: () => toastr.success('تم التنحّي عن القيادة'),
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
            <div className="card" style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CategoryIcon icon={community.category?.icon} size={22} /> مجتمع {community.name}
                    </div>
                    <StatusBadge status={community.status} />
                </div>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color }}>{community.member_count}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>عضو</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color }}>{community.events_count ?? 0}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>فعالية نشطة</div>
                    </div>
                    <div style={{ flex: 1 }} />
                    <Link href={`/employee/create?community_id=${community.id}`} className="btn btn-primary" style={{ fontSize: 13 }}>
                        + إنشاء فعالية
                    </Link>
                </div>
            </div>

            {/* Balance */}
            <div className="card">
                <div style={{ fontSize: 12, color: '#999', marginBottom: 4, fontWeight: 500 }}>رصيد المجتمع</div>
                <div style={{ fontSize: 28, fontWeight: 700, color, letterSpacing: '-1px' }}>{community.balance?.toLocaleString()} ريال</div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`pill${activeTab === tab.key ? ' on' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div>
                    {isLeader && (
                        <Link
                            href={`/employee/community/${community.id}/templates`}
                            className="card"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none',
                                border: '2px dashed #EBEBEB', color, fontWeight: 600, fontSize: 14,
                            }}
                        >
                            <span>🔄 قوالب التكرار — محرك التشغيل التلقائي</span>
                            <span style={{ fontSize: 12, color: '#999' }}>إدارة ←</span>
                        </Link>
                    )}
                    {/* A13 — H §15: تصدير القائد في نطاق مجتمعه، بلا أي بيانات مالية. */}
                    {isLeader && (
                        <div
                            className="card"
                            style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 13 }}
                        >
                            <span style={{ fontWeight: 600 }}>📤 تصدير بيانات المجتمع</span>
                            <span style={{ fontSize: 11, color: '#888' }}>بلا بيانات مالية ولا أرقام جوال</span>
                            <span style={{ flex: 1 }} />
                            {[
                                { key: 'events_results', label: 'الفعاليات والنتائج' },
                                { key: 'employees_activation', label: 'الأعضاء والتفعيل' },
                            ].map((item) => (
                                <span key={item.key} style={{ display: 'inline-flex', border: '1px solid #DDD', borderRadius: 8, overflow: 'hidden' }}>
                                    <span style={{ padding: '6px 9px', fontSize: 12, background: '#FAFAFA' }}>{item.label}</span>
                                    <a
                                        href={`/employee/community/${community.id}/exports/${item.key}?format=xlsx`}
                                        style={{ padding: '6px 9px', fontSize: 12, borderRight: '1px solid #DDD', color: '#1A56DB' }}
                                    >
                                        Excel
                                    </a>
                                    <a
                                        href={`/employee/community/${community.id}/exports/${item.key}?format=pdf`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ padding: '6px 9px', fontSize: 12, borderRight: '1px solid #DDD', color: '#1A56DB' }}
                                    >
                                        PDF
                                    </a>
                                </span>
                            ))}
                        </div>
                    )}
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
                                    style={{ textDecoration: 'none', color: 'inherit', borderRight: `3px solid ${color}` }}
                                >
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{event.partner?.name}</div>
                                    <div style={{ fontSize: 13, color: '#999', margin: '4px 0 10px' }}>
                                        {fmtDate(event.event_date)} · {fmtTime(event.start_time)}
                                    </div>
                                    <div className="bar-wrap">
                                        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
                                    </div>
                                    <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
                                        {event.participants_count} من {event.capacity}
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="empty">
                            <div className="ico">📅</div>
                            <div className="txt">لا توجد فعاليات حاليا</div>
                        </div>
                    )}
                </div>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
                <div>
                    {canAnnounce && (
                        <form onSubmit={submitAnnouncement} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8 }}>
                                <textarea
                                    value={announcementForm.data.body}
                                    onChange={(e) => announcementForm.setData('body', e.target.value)}
                                    placeholder="اكتب إعلانا للمجتمع... (نص ورابط فقط — بلا صور أو مرفقات)"
                                    rows={2}
                                    style={{ flex: 1, resize: 'none', minHeight: 40 }}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!announcementForm.data.body.trim() || announcementForm.processing}
                                    style={{ padding: '10px 14px' }}
                                >
                                    📤
                                </button>
                            </div>
                            <input
                                type="url"
                                value={announcementForm.data.link_url}
                                onChange={(e) => announcementForm.setData('link_url', e.target.value)}
                                placeholder="رابط (اختياري) — https://"
                                style={{ width: '100%', fontSize: 13 }}
                            />
                            {(announcementForm.errors.body || announcementForm.errors.link_url) && (
                                <div className="field-error" style={{ marginTop: 6 }}>
                                    {announcementForm.errors.body ?? announcementForm.errors.link_url}
                                </div>
                            )}
                        </form>
                    )}

                    {announcements.length > 0 ? (
                        announcements.map((a) => (
                            <div key={a.id} className="card">
                                {editingAnnouncementId === a.id ? (
                                    <form onSubmit={(e) => submitEditAnnouncement(e, a.id)}>
                                        <textarea
                                            value={editForm.data.body}
                                            onChange={(e) => editForm.setData('body', e.target.value)}
                                            rows={2}
                                            style={{ width: '100%', resize: 'none', marginBottom: 8 }}
                                        />
                                        <input
                                            type="url"
                                            value={editForm.data.link_url}
                                            onChange={(e) => editForm.setData('link_url', e.target.value)}
                                            placeholder="رابط (اختياري)"
                                            style={{ width: '100%', fontSize: 13, marginBottom: 8 }}
                                        />
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button type="submit" className="btn btn-primary" style={{ fontSize: 12 }} disabled={editForm.processing}>حفظ</button>
                                            <button type="button" className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => setEditingAnnouncementId(null)}>إلغاء</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div style={{ fontSize: 14, color: '#0A0A0A', lineHeight: 1.7 }}>{a.body}</div>
                                        {a.link_url && (
                                            <a href={a.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color, display: 'inline-block', marginTop: 6, direction: 'ltr' }}>
                                                {a.link_url}
                                            </a>
                                        )}
                                        <div style={{ fontSize: 12, color: '#999', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>
                                                {fmtDateTime(a.created_at)} · {a.employee?.name}
                                                {a.edited_at && <span> · (مُعدَّل)</span>}
                                            </span>
                                            {a.can_modify && (
                                                <span style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => startEditAnnouncement(a)} className="btn btn-outline" style={{ padding: '2px 10px', fontSize: 11 }}>تعديل</button>
                                                    <button onClick={() => deleteAnnouncement(a.id)} className="btn btn-danger" style={{ padding: '2px 10px', fontSize: 11 }}>حذف</button>
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty">
                            <div className="ico">📢</div>
                            <div className="txt">لا توجد إعلانات</div>
                        </div>
                    )}
                </div>
            )}

            {/* Polls Tab */}
            {activeTab === 'polls' && (
                <div>
                    {canAnnounce && (
                        <form onSubmit={submitPoll} className="card" style={{ border: '2px dashed #EBEBEB', marginBottom: 20 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color }}>إنشاء تصويت جديد</div>
                            <input
                                type="text"
                                value={pollQuestion}
                                onChange={(e) => setPollQuestion(e.target.value)}
                                placeholder="اكتب السؤال..."
                                maxLength={500}
                                style={{ marginBottom: 12 }}
                            />
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', marginBottom: 8 }}>الخيارات</div>
                            {pollOptions.map((opt, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => updatePollOption(i, e.target.value)}
                                        placeholder={`الخيار ${i + 1}`}
                                        maxLength={200}
                                        style={{ flex: 1 }}
                                    />
                                    {pollOptions.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removePollOption(i)}
                                            className="btn btn-danger"
                                            style={{ padding: '6px 10px', fontSize: 14 }}
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
                                    className="btn btn-outline"
                                    style={{ fontSize: 12, marginBottom: 12, marginTop: 4 }}
                                >
                                    + إضافة خيار
                                </button>
                            )}
                            <div style={{ marginTop: 8, marginBottom: 12 }}>
                                <label style={{ fontSize: 12, color: '#999', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                                    تاريخ الانتهاء (اختياري)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={pollExpiresAt}
                                    onChange={(e) => setPollExpiresAt(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                disabled={pollSubmitting || !pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2}
                                style={{ opacity: pollSubmitting ? 0.6 : 1 }}
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
                                <div key={poll.id} className="card" style={{ borderRight: `3px solid ${expired ? '#999' : color}` }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>{poll.question}</div>
                                            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                                                {poll.creator?.name} · {timeAgo(poll.created_at)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, marginRight: 8 }}>
                                            {expired && (
                                                <span className="badge b-completed">منتهي</span>
                                            )}
                                            {!expired && canAnnounce && (
                                                <button
                                                    onClick={() => closePoll(poll.id)}
                                                    className="btn btn-danger"
                                                    style={{ padding: '3px 10px', fontSize: 11 }}
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
                                                return (
                                                    <div
                                                        key={option.id}
                                                        style={{
                                                            position: 'relative', borderRadius: 10, overflow: 'hidden',
                                                            border: isMyVote ? `2px solid ${color}` : '1px solid #EBEBEB',
                                                            background: '#fff',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                position: 'absolute', top: 0, right: 0, bottom: 0,
                                                                width: `${pct}%`, background: isMyVote ? `${color}18` : '#F0F0F0',
                                                                transition: 'width 0.4s ease',
                                                            }}
                                                        />
                                                        <div style={{
                                                            position: 'relative', padding: '10px 14px',
                                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                {isMyVote && (
                                                                    <span style={{ color, fontSize: 12, fontWeight: 700 }}>&#10003;</span>
                                                                )}
                                                                <span style={{
                                                                    fontSize: 13, fontWeight: isMyVote ? 600 : 400,
                                                                    color: isMyVote ? color : '#0A0A0A',
                                                                }}>
                                                                    {option.label}
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <span style={{ fontSize: 12, fontWeight: 600, color: '#999' }}>
                                                                    {option.votes_count}
                                                                </span>
                                                                <span style={{ fontSize: 12, fontWeight: 600, color: isMyVote ? color : '#999' }}>
                                                                    {pct}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => vote(poll.id, option.id)}
                                                    className="btn btn-outline btn-full"
                                                    style={{ justifyContent: 'flex-start', fontWeight: 400, fontSize: 13, borderRadius: 10 }}
                                                >
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Footer */}
                                    <div style={{ fontSize: 12, color: '#999', marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{totalVotes} صوت</span>
                                        {poll.expires_at && !expired && (
                                            <span>ينتهي {timeAgo(poll.expires_at).replace('منذ', 'بعد')}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty">
                            <div className="ico">📊</div>
                            <div className="txt">لا توجد تصويتات</div>
                        </div>
                    )}
                </div>
            )}

            {/* Leagues Tab */}
            {activeTab === 'leagues' && (
                <div>
                    {isLeader && (
                        <Link
                            href={`/employee/community/${community.id}/leagues/create`}
                            className="card"
                            style={{
                                display: 'block', textAlign: 'center', textDecoration: 'none',
                                border: '2px dashed #EBEBEB', color, fontWeight: 600, fontSize: 14,
                            }}
                        >
                            + إنشاء بطولة جديدة
                        </Link>
                    )}
                    {leagues.length > 0 ? (
                        <div className="list-card">
                            {leagues.map((league) => {
                                const formatLabel = league.format === 'knockout' ? 'خروج المغلوب'
                                    : league.format === 'double_round_robin' ? 'دوري ذهاب وإياب' : 'دوري دور واحد';
                                return (
                                    <Link
                                        key={league.id}
                                        href={`/employee/community/${community.id}/leagues/${league.id}`}
                                        className="list-row"
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{league.name}</div>
                                            <div style={{ fontSize: 12, color: '#999', marginTop: 3 }}>
                                                {formatLabel} · {league.departments?.length ?? 0} أقسام
                                            </div>
                                        </div>
                                        <span className={`badge ${league.status === 'active' ? 'b-confirmed' : 'b-completed'}`}>
                                            {league.status === 'active' ? 'جارية' : 'منتهية'}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty">
                            <div className="ico">🏆</div>
                            <div className="txt">لا توجد بطولات</div>
                        </div>
                    )}
                </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
                <div>
                    {canInvite && invitableEmployees.length > 0 && (
                        <form onSubmit={inviteEmployee} className="card" style={{ display: 'flex', gap: 8, alignItems: 'center', border: '2px dashed #EBEBEB' }}>
                            <select value={inviteEmployeeId} onChange={(e) => setInviteEmployeeId(e.target.value)} style={{ flex: 1, fontSize: 13 }}>
                                <option value="">دعوة زميل للمجتمع...</option>
                                {invitableEmployees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                            <button type="submit" className="btn btn-primary" style={{ fontSize: 13 }} disabled={!inviteEmployeeId}>
                                دعوة
                            </button>
                        </form>
                    )}

                    {isPrimaryLeader && (
                        <form onSubmit={transferLeadership} className="card" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <select value={transferEmployeeId} onChange={(e) => setTransferEmployeeId(e.target.value)} style={{ flex: 1, fontSize: 13 }}>
                                <option value="">نقل القيادة الأساسية إلى...</option>
                                {members.filter((m) => m.id !== primaryLeaderId).map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            <button type="submit" className="btn btn-outline" style={{ fontSize: 13 }} disabled={!transferEmployeeId}>
                                نقل القيادة
                            </button>
                        </form>
                    )}

                    {isLeader && (
                        <div style={{ textAlign: 'left', marginBottom: 12 }}>
                            <button onClick={stepDown} className="btn btn-danger" style={{ fontSize: 12 }}>
                                التنحّي عن القيادة
                            </button>
                        </div>
                    )}

                    {members.length > 0 ? (
                        <div className="list-card">
                            {members.map((member) => (
                                <div key={member.id} className="list-row" style={{ cursor: 'default' }}>
                                    <div className="avatar" style={{ background: `${color}18`, color }}>
                                        {member.name?.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{member.name}</div>
                                        <div style={{ fontSize: 12, color: '#999' }}>{member.department?.name ?? '—'}</div>
                                    </div>
                                    {leaderIds.includes(member.id) && (
                                        <span className="badge" style={{ background: `${color}15`, color }}>
                                            {member.id === primaryLeaderId ? 'قائد أساسي' : 'قائد'}
                                        </span>
                                    )}
                                    {isLeader && !leaderIds.includes(member.id) && (
                                        <button
                                            onClick={() => removeMember(member)}
                                            className="btn btn-danger"
                                            style={{ padding: '3px 10px', fontSize: 11, marginRight: 8 }}
                                        >
                                            إزالة
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty">
                            <div className="ico">👥</div>
                            <div className="txt">لا يوجد أعضاء</div>
                        </div>
                    )}
                </div>
            )}
        </EmployeeLayout>
    );
}
