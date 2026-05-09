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
                        style={{ background: '#EEF2FF', color: '#3B5BDB', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        تحديد الكل
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notifications.data.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 32, color: '#7A8BA8', fontSize: 13 }}>
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
                                style={{
                                    background: '#fff',
                                    border: isUnread ? '1px solid #E0305044' : '1px solid #E2E8F4',
                                    ...(isUnread ? { borderRight: '4px solid #E03050' } : {}),
                                    borderRadius: 14,
                                    padding: '14px 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    cursor: isUnread ? 'pointer' : 'default',
                                }}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    background: isUnread ? '#E0305018' : '#F0F2F8',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20, flexShrink: 0,
                                }}>
                                    {notificationEmoji(notification.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, ...(isUnread ? { fontWeight: 700 } : { color: '#0F1923' }), lineHeight: 1.5 }}>
                                        {notification.title}
                                    </div>
                                    {notification.body && (
                                        <div style={{ fontSize: 12, color: isUnread ? '#4A5C78' : '#7A8BA8', lineHeight: 1.4, marginTop: 2 }}>
                                            {notification.body}
                                        </div>
                                    )}
                                    <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 4 }}>
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
