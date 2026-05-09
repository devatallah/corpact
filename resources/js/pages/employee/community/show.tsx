import EmployeeLayout from '@/layouts/employee-layout';
import SportIcon from '@/components/sport-icon';
import { Head, Link, useForm } from '@inertiajs/react';
import { fmtDate, fmtTime, fmtDateTime } from '@/lib/utils';
import StatusBadge from '@/components/status-badge';
import type { Community, Employee, Event, CommunityAnnouncement, Club, Sport } from '@/types/models';
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
    canAnnounce?: boolean;
}

type Tab = 'events' | 'announcements' | 'members';

export default function CommunityShow({ community, events, announcements, members, canAnnounce }: Props) {
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

    const tabs: { key: Tab; label: string }[] = [
        { key: 'events', label: 'الفعاليات' },
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
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
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
                                    style={{ cursor: 'pointer', borderRight: `3px solid ${color}`, textDecoration: 'none', color: 'inherit' }}
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
                                    <div style={{ fontSize: 11, color: '#7A8BA8' }}>{member.department}</div>
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
