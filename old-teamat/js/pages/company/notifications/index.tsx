import PageHeader from '@/components/page-header';
import CompanyLayout from '@/layouts/company-layout';
import Pagination from '@/components/pagination';
import { SortBar, type SortState } from '@/components/sortable-header';
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
    sort: SortState;
}

export default function NotificationsIndex({ notifications, unreadCount, sort }: Props) {
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
                    <PageHeader title={<>الإشعارات</>} subtitle={<>{unreadCount} غير مقروءة</>} />
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        style={{ background: '#F6F8F5', color: '#0A0A0A', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        تحديد الكل
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <SortBar
                    sort={sort}
                    options={[
                        { key: 'created_at', label: 'التاريخ', initialDirection: 'desc' },
                        { key: 'read_at', label: 'غير المقروءة أولاً', initialDirection: 'asc' },
                        { key: 'title', label: 'العنوان' },
                    ]}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notifications.data.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 32, color: 'rgba(10,10,10,.55)', fontSize: 13 }}>
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
                                    border: isUnread ? '1px solid #D9381E44' : '0.5px solid rgba(10,10,10,.1)',
                                    ...(isUnread ? { borderRight: '4px solid #D9381E' } : {}),
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
                                    background: isUnread ? '#D9381E18' : '#F6F8F5',
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
                                        <div style={{ fontSize: 12, color: isUnread ? 'rgba(10,10,10,.6)' : 'rgba(10,10,10,.55)', lineHeight: 1.4, marginTop: 2 }}>
                                            {notification.body}
                                        </div>
                                    )}
                                    <div style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginTop: 4 }}>
                                        {fmtDateTime(notification.created_at)}
                                    </div>
                                </div>
                                {isUnread && (
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D9381E', flexShrink: 0 }} />
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
