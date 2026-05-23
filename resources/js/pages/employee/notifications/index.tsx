import EmployeeLayout from '@/layouts/employee-layout';
import { Head, router } from '@inertiajs/react';
import { fmtDateTime } from '@/lib/utils';
import type { Notification, PaginatedResult } from '@/types/models';

interface Props {
    notifications: PaginatedResult<Notification> | Notification[];
    unreadCount: number;
}

export default function NotificationsIndex({ notifications, unreadCount }: Props) {
    const items = Array.isArray(notifications)
        ? notifications
        : notifications.data;

    function markAllRead() {
        router.post('/employee/notifications/read-all');
    }

    function isNudge(notification: Notification): boolean {
        return notification.type === 'nudge_inactive'
            || notification.type === 'nudge_community'
            || notification.type === 'nudge_new_member';
    }

    function getIcon(notification: Notification): string {
        if (notification.type === 'weekly_digest') return '📊';
        if (notification.type === 'nudge_inactive') return '👋';
        if (notification.type === 'nudge_community') return '🏃';
        if (notification.type === 'nudge_new_member') return '🏸';
        return '🔔';
    }

    function getIconBg(notification: Notification, isUnread: boolean): string {
        if (notification.type === 'weekly_digest') return isUnread ? '#8B5CF618' : '#F3F0FF';
        if (isNudge(notification)) return isUnread ? '#F59E0B18' : '#FFFBEB';
        return isUnread ? '#009E8218' : '#F4F6FA';
    }

    function getTargetUrl(notification: Notification): string | null {
        const eventId = notification.data?.event_id;
        if (eventId) return `/employee/detail/${eventId}`;
        const communityId = notification.data?.community_id;
        if (communityId) return `/employee/community/${communityId}?tab=announcements`;
        return null;
    }

    function handleClick(notification: Notification) {
        const targetUrl = getTargetUrl(notification);

        if (!notification.read_at) {
            router.post(`/employee/notifications/${notification.id}/read`, {}, {
                preserveState: false,
                onSuccess: () => { if (targetUrl) router.visit(targetUrl); },
            });
        } else if (targetUrl) {
            router.visit(targetUrl);
        }
    }

    return (
        <EmployeeLayout>
            <Head title="الإشعارات" />

            {/* Header */}
            <div style={{ padding: '16px 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>الإشعارات</div>
                    <div style={{ fontSize: 12, color: '#7A8BA8' }}>{unreadCount} غير مقروءة</div>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        style={{ background: 'transparent', border: 'none', fontSize: 12, color: '#009E82', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        تحديد الكل
                    </button>
                )}
            </div>

            {/* Notification list */}
            {items.length > 0 ? (
                items.map((notification) => {
                    const isUnread = !notification.read_at;
                    return (
                        <button
                            key={notification.id}
                            type="button"
                            onClick={() => handleClick(notification)}
                            className="card"
                            style={{
                                display: 'flex',
                                gap: 12,
                                width: '100%',
                                textAlign: 'right',
                                cursor: 'pointer',
                                ...(isUnread
                                    ? notification.type === 'weekly_digest'
                                        ? { borderColor: '#8B5CF644', borderRight: '3px solid #8B5CF6' }
                                        : isNudge(notification)
                                            ? { borderColor: '#F59E0B44', borderRight: '3px solid #F59E0B' }
                                            : { borderColor: '#009E8244', borderRight: '3px solid #009E82' }
                                    : {}),
                            }}
                        >
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: getIconBg(notification, isUnread), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                                {getIcon(notification)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, ...(isUnread ? { fontWeight: 600 } : { color: '#0F1923' }), lineHeight: 1.5 }}>
                                    {notification.title ?? notification.body}
                                </div>
                                {notification.type === 'weekly_digest' && notification.data ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
                                        <div style={{ background: '#F4F6FA', borderRadius: 8, padding: '6px 10px', fontSize: 11 }}>
                                            <span style={{ fontWeight: 700 }}>{String(notification.data.upcoming_events_count ?? 0)}</span>{' '}
                                            <span style={{ color: '#7A8BA8' }}>فعاليات قادمة</span>
                                        </div>
                                        <div style={{ background: '#F4F6FA', borderRadius: 8, padding: '6px 10px', fontSize: 11 }}>
                                            <span style={{ fontWeight: 700 }}>{String(notification.data.new_members_count ?? 0)}</span>{' '}
                                            <span style={{ color: '#7A8BA8' }}>أعضاء جدد</span>
                                        </div>
                                        <div style={{ background: '#F4F6FA', borderRadius: 8, padding: '6px 10px', fontSize: 11 }}>
                                            <span style={{ fontWeight: 700 }}>{String(notification.data.matches_played ?? 0)}</span>{' '}
                                            <span style={{ color: '#7A8BA8' }}>مباريات</span>
                                        </div>
                                        <div style={{ background: '#F4F6FA', borderRadius: 8, padding: '6px 10px', fontSize: 11 }}>
                                            <span style={{ fontWeight: 700 }}>🔥 {String(notification.data.streak ?? 0)}</span>{' '}
                                            <span style={{ color: '#7A8BA8' }}>أسابيع متتالية</span>
                                        </div>
                                    </div>
                                ) : isNudge(notification) && notification.body ? (
                                    <div style={{ fontSize: 12, color: '#92400E', marginTop: 4, background: '#FFFBEB', borderRadius: 8, padding: '6px 10px', lineHeight: 1.6 }}>
                                        {notification.body}
                                    </div>
                                ) : (
                                    notification.body && notification.title && (
                                        <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>{notification.body}</div>
                                    )
                                )}
                                <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 4 }}>{fmtDateTime(notification.created_at)}</div>
                            </div>
                            {isUnread && (
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: isNudge(notification) ? '#F59E0B' : '#009E82', marginTop: 6, flexShrink: 0 }} />
                                </div>
                            )}
                        </button>
                    );
                })
            ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7A8BA8', fontSize: 13 }}>لا توجد إشعارات</div>
            )}

            {/* Pagination */}
            {!Array.isArray(notifications) && notifications.last_page > 1 && (
                <div style={{ padding: '16px 0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                        {notifications.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    border: '1px solid #E4E9F2',
                                    background: link.active ? '#009E82' : '#fff',
                                    color: link.active ? '#fff' : '#7A8BA8',
                                    fontSize: 12,
                                    cursor: link.url ? 'pointer' : 'default',
                                    fontFamily: 'inherit',
                                    opacity: link.url ? 1 : 0.5,
                                }}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </EmployeeLayout>
    );
}
