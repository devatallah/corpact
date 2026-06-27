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
        if (notification.type === 'weekly_digest') return isUnread ? '#8B5CF615' : '#F3F0FF';
        if (isNudge(notification)) return isUnread ? '#F59E0B15' : '#FFFBEB';
        return isUnread ? '#18A86B15' : '#F5F5F5';
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

    function getUnreadBorderColor(notification: Notification): string {
        if (notification.type === 'weekly_digest') return '#8B5CF6';
        if (isNudge(notification)) return '#D97706';
        return '#18A86B';
    }

    return (
        <EmployeeLayout>
            <Head title="الإشعارات" />

            {/* Header */}
            <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.5px' }}>الإشعارات</h1>
                    <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{unreadCount} غير مقروءة</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="btn btn-outline"
                        style={{ fontSize: 13 }}
                    >
                        تحديد الكل
                    </button>
                )}
            </div>

            {/* Notification list */}
            {items.length > 0 ? (
                <div className="list-card">
                    {items.map((notification) => {
                        const isUnread = !notification.read_at;
                        return (
                            <button
                                key={notification.id}
                                type="button"
                                onClick={() => handleClick(notification)}
                                className="list-row"
                                style={{
                                    width: '100%',
                                    textAlign: 'right',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: '1px solid #EBEBEB',
                                    fontFamily: 'inherit',
                                    ...(isUnread ? { borderRight: `3px solid ${getUnreadBorderColor(notification)}` } : {}),
                                }}
                            >
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: getIconBg(notification, isUnread), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                                    {getIcon(notification)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, ...(isUnread ? { fontWeight: 600 } : { color: '#0A0A0A' }), lineHeight: 1.5 }}>
                                        {notification.title ?? notification.body}
                                    </div>
                                    {notification.type === 'weekly_digest' && notification.data ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
                                            <div style={{ background: '#F5F5F5', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
                                                <span style={{ fontWeight: 600 }}>{String(notification.data.upcoming_events_count ?? 0)}</span>{' '}
                                                <span style={{ color: '#999' }}>فعاليات قادمة</span>
                                            </div>
                                            <div style={{ background: '#F5F5F5', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
                                                <span style={{ fontWeight: 600 }}>{String(notification.data.new_members_count ?? 0)}</span>{' '}
                                                <span style={{ color: '#999' }}>أعضاء جدد</span>
                                            </div>
                                            <div style={{ background: '#F5F5F5', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
                                                <span style={{ fontWeight: 600 }}>{String(notification.data.matches_played ?? 0)}</span>{' '}
                                                <span style={{ color: '#999' }}>مباريات</span>
                                            </div>
                                            <div style={{ background: '#F5F5F5', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
                                                <span style={{ fontWeight: 600 }}>🔥 {String(notification.data.streak ?? 0)}</span>{' '}
                                                <span style={{ color: '#999' }}>أسابيع متتالية</span>
                                            </div>
                                        </div>
                                    ) : isNudge(notification) && notification.body ? (
                                        <div style={{ fontSize: 13, color: '#92400E', marginTop: 6, background: '#FFFBEB', borderRadius: 8, padding: '6px 10px', lineHeight: 1.6 }}>
                                            {notification.body}
                                        </div>
                                    ) : (
                                        notification.body && notification.title && (
                                            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{notification.body}</div>
                                        )
                                    )}
                                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{fmtDateTime(notification.created_at)}</div>
                                </div>
                                {isUnread && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: getUnreadBorderColor(notification), marginTop: 6, flexShrink: 0 }} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="empty">
                    <div className="ico">📭</div>
                    <div className="txt">لا توجد إشعارات</div>
                </div>
            )}

            {/* Pagination */}
            {!Array.isArray(notifications) && notifications.last_page > 1 && (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                        {notifications.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className={`pill${link.active ? ' on' : ''}`}
                                style={{
                                    cursor: link.url ? 'pointer' : 'default',
                                    opacity: link.url ? 1 : 0.5,
                                    padding: '6px 12px',
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
