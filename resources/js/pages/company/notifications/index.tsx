import CompanyLayout from '@/layouts/company-layout';
import Pagination from '@/components/pagination';
import { fmtDateTime } from '@/lib/utils';
import type { Notification as NotificationModel, PaginatedResult } from '@/types/models';
import { Head, router } from '@inertiajs/react';
import toastr from 'toastr';

function notificationEmoji(type: string | null) {
    switch (type) {
        case 'warning': return '\u26A0\uFE0F';
        case 'success': return '\u2705';
        case 'error': return '\uD83D\uDD34';
        default: return '\uD83D\uDCE2';
    }
}

interface Props {
    notifications: PaginatedResult<NotificationModel>;
    unreadCount: number;
}

export default function NotificationsIndex({ notifications, unreadCount }: Props) {
    function markAllRead() {
        router.post('/company/notifications/mark-all-read', {}, {
            onSuccess: () => toastr.success('تم تحديد جميع الإشعارات كمقروءة'),
        });
    }

    return (
        <CompanyLayout>
            <Head title="الإشعارات" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <div className="page-title">الإشعارات</div>
                    <div className="page-sub">{unreadCount} غير مقروءة</div>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="ac-btn secondary"
                    >
                        تحديد الكل
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notifications.data.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 32, color: '#999', fontSize: 13 }}>
                        لا توجد إشعارات
                    </div>
                ) : (
                    notifications.data.map((notification) => {
                        const isUnread = notification.read_at === null;

                        return (
                            <div
                                key={notification.id}
                                onClick={() => isUnread && router.post(`/company/notifications/${notification.id}/read`, {}, {
                                    onSuccess: () => toastr.success('تم تحديد الإشعار كمقروء'),
                                })}
                                className="card"
                                style={{
                                    ...(isUnread ? { borderColor: '#E0305044', borderRight: '4px solid #E03050' } : {}),
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    cursor: isUnread ? 'pointer' : 'default',
                                    marginBottom: 0,
                                }}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    background: isUnread ? '#E0305018' : '#FAFAFA',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20, flexShrink: 0,
                                }}>
                                    {notificationEmoji(notification.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, ...(isUnread ? { fontWeight: 700 } : { color: '#0A0A0A' }), lineHeight: 1.5 }}>
                                        {notification.title}
                                    </div>
                                    {notification.body && (
                                        <div style={{ fontSize: 12, color: isUnread ? '#666' : '#999', lineHeight: 1.4, marginTop: 2 }}>
                                            {notification.body}
                                        </div>
                                    )}
                                    <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                                        {fmtDateTime(notification.created_at)}
                                    </div>
                                </div>
                                {isUnread && (
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E03050', flexShrink: 0 }} />
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <Pagination links={notifications.links} />
        </CompanyLayout>
    );
}
