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
                                ...(isUnread ? { borderColor: '#009E8244', borderRight: '3px solid #009E82' } : {}),
                            }}
                        >
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: isUnread ? '#009E8218' : '#F4F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                                🔔
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, ...(isUnread ? { fontWeight: 600 } : { color: '#0F1923' }), lineHeight: 1.5 }}>
                                    {notification.title ?? notification.body}
                                </div>
                                {notification.body && notification.title && (
                                    <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>{notification.body}</div>
                                )}
                                <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 4 }}>{fmtDateTime(notification.created_at)}</div>
                            </div>
                            {isUnread && (
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#009E82', marginTop: 6, flexShrink: 0 }} />
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
