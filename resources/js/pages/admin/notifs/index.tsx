import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/pagination';
import { fmtDateTime } from '@/lib/utils';
import type { Notification, PaginatedResult } from '@/types/models';
import { Head, router } from '@inertiajs/react';

interface Props {
    notifications: PaginatedResult<Notification>;
    unreadCount: number;
}

const typeEmojiMap: Record<string, string> = {
    company_registration: '🏢',
    business_registration: '🏟️',
    event_created: '📅',
    settlement: '💰',
};

export default function NotifsIndex({ notifications, unreadCount }: Props) {
    function handleAction(id: string, action: 'accept' | 'reject') {
        router.post(`/admin/notifs/${id}/${action}`, {}, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="الإشعارات" />

            <div className="page-title">الإشعارات</div>
            <div className="page-sub">{unreadCount} إشعارات تحتاج تدخلاً</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.data.length === 0 ? (
                    <div className="card" style={{ display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
                        <div style={{ fontSize: '14px', color: '#6B7A99' }}>لا توجد إشعارات</div>
                    </div>
                ) : (
                    notifications.data.map((notif) => {
                        const isUnread = !notif.read_at;
                        const emoji = typeEmojiMap[notif.type ?? ''] ?? (isUnread ? '🔔' : '✅');

                        return (
                            <div
                                key={notif.id}
                                className="card"
                                onClick={() => isUnread && router.post(`/admin/notifs/${notif.id}/read`, {}, { preserveScroll: true })}
                                style={{
                                    ...(isUnread ? { borderRight: '4px solid #D4820A' } : {}),
                                    display: 'flex',
                                    gap: '14px',
                                    alignItems: 'flex-start',
                                    ...(!isUnread ? { opacity: 0.6 } : {}),
                                    cursor: isUnread ? 'pointer' : 'default',
                                }}
                            >
                                <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    background: isUnread ? '#D4820A20' : '#232A3E',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '22px',
                                    flexShrink: 0,
                                }}>
                                    {emoji}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                                        {notif.title}
                                    </div>
                                    {notif.body && (
                                        <div style={{ fontSize: '12px', color: '#C8D0E0', lineHeight: 1.5 }}>
                                            {notif.body}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '11px', color: '#6B7A99', marginTop: '4px' }}>
                                        {fmtDateTime(notif.created_at)}
                                    </div>
                                </div>

                                {isUnread && (
                                    <>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: '#D4820A',
                                            flexShrink: 0,
                                            marginTop: '6px',
                                        }} />
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <Pagination links={notifications.links} />
        </AdminLayout>
    );
}
