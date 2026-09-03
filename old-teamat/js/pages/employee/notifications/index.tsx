import { Head, router } from '@inertiajs/react';
import { Card, Screen } from '@/components/employee/ui';
import { SortBar  } from '@/components/sortable-header';
import type {SortState} from '@/components/sortable-header';
import EmployeeLayout from '@/layouts/employee-layout';
import { fmtDateTime } from '@/lib/utils';
import type { Notification, PaginatedResult } from '@/types/models';

interface Props {
    notifications: PaginatedResult<Notification> | Notification[];
    unreadCount: number;
    sort?: SortState;
}

const sortOptions = [
    { key: 'created_at', label: 'الأحدث', initialDirection: 'desc' as const },
    { key: 'read_at', label: 'غير المقروءة', initialDirection: 'asc' as const },
    { key: 'title', label: 'العنوان', initialDirection: 'asc' as const },
];

export default function NotificationsIndex({ notifications, unreadCount, sort }: Props) {
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
        if (notification.type === 'weekly_digest') {
return '📊';
}

        if (notification.type === 'nudge_inactive') {
return '👋';
}

        if (notification.type === 'nudge_community') {
return '🏃';
}

        if (notification.type === 'nudge_new_member') {
return '🏸';
}

        return '🔔';
    }

    function getTargetUrl(notification: Notification): string | null {
        const eventId = notification.data?.event_id;

        if (eventId) {
return `/employee/detail/${eventId}`;
}

        const communityId = notification.data?.community_id;

        if (communityId) {
return `/employee/community/${communityId}?tab=announcements`;
}

        return null;
    }

    function handleClick(notification: Notification) {
        const targetUrl = getTargetUrl(notification);

        if (!notification.read_at) {
            router.post(`/employee/notifications/${notification.id}/read`, {}, {
                preserveState: false,
                onSuccess: () => {
 if (targetUrl) {
router.visit(targetUrl);
} 
},
            });
        } else if (targetUrl) {
            router.visit(targetUrl);
        }
    }

    return (
        <EmployeeLayout>
            <Head title="الإشعارات" />

            <Screen>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-black text-[#0A0A0A]">الإشعارات</h1>
                        <p className="text-[11px] text-[#0A0A0A]/55 mt-0.5">{unreadCount} غير مقروءة</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllRead}
                            className="shrink-0 inline-flex items-center justify-center h-9 px-4 rounded-full bg-white text-[#0A0A0A] text-xs font-bold border-[0.5px] border-[#0A0A0A]/15 hover:border-[#0A0A0A]/40 transition-colors cursor-pointer"
                        >
                            تحديد الكل
                        </button>
                    )}
                </div>

                {/* H §18: كل قائمة لها ترتيب ظاهر */}
                <SortBar sort={sort} options={sortOptions} />

                {items.length > 0 ? (
                    <div className="space-y-2.5">
                        {items.map((notification) => {
                            const isUnread = !notification.read_at;

                            return (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => handleClick(notification)}
                                    className={`w-full text-right p-3.5 bg-white rounded-2xl border-[0.5px] transition-all cursor-pointer space-y-2 ${
                                        isUnread ? 'border-[#0A0A0A]/30' : 'border-[#0A0A0A]/15 hover:border-[#0A0A0A]/30'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-[#F6F8F5] border-[0.5px] border-[#0A0A0A]/10 flex items-center justify-center shrink-0">
                                            {getIcon(notification)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className={`text-xs leading-snug text-[#0A0A0A] ${isUnread ? 'font-black' : 'font-medium'}`}>
                                                {notification.title ?? notification.body}
                                            </div>

                                            {notification.type === 'weekly_digest' && notification.data ? (
                                                <div className="grid grid-cols-2 gap-1.5 mt-2">
                                                    {[
                                                        { v: notification.data.upcoming_events_count, l: 'فعاليات قادمة' },
                                                        { v: notification.data.new_members_count, l: 'أعضاء جدد' },
                                                        { v: notification.data.matches_played, l: 'مباريات' },
                                                        { v: notification.data.streak, l: 'أسابيع متتالية' },
                                                    ].map((tile) => (
                                                        <div key={tile.l} className="rounded-lg bg-[#F6F8F5] px-2.5 py-1.5 text-[11px]">
                                                            <span className="font-bold text-[#0A0A0A]">{String(tile.v ?? 0)}</span>{' '}
                                                            <span className="text-[#0A0A0A]/55">{tile.l}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : isNudge(notification) && notification.body ? (
                                                /* A nudge is a prompt, not a log line — it keeps its amber panel. */
                                                <div className="mt-2 rounded-lg bg-[#FEF9E0] border-[0.5px] border-[#C87D00]/25 px-2.5 py-1.5 text-[11px] text-[#C87D00] leading-relaxed">
                                                    {notification.body}
                                                </div>
                                            ) : (
                                                notification.title && (
                                                    <div className="text-[11px] text-[#0A0A0A]/55 mt-0.5">{notification.body}</div>
                                                )
                                            )}

                                            <div className="text-[11px] text-[#0A0A0A]/50 mt-1.5">{fmtDateTime(notification.created_at)}</div>
                                        </div>
                                        {isUnread && <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#C8FF00] shrink-0 mt-1" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <p className="text-[11px] text-[#0A0A0A]/55 text-center py-4">لا توجد إشعارات</p>
                    </Card>
                )}

                {!Array.isArray(notifications) && notifications.last_page > 1 && (
                    <div className="flex justify-center gap-2 flex-wrap pt-1">
                        {notifications.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className={`px-3 py-1 rounded-full text-xs font-bold border-[0.5px] transition-colors ${
                                    link.active
                                        ? 'bg-[#0A0A0A] text-[#C8FF00] border-[#0A0A0A]'
                                        : 'bg-white text-[#0A0A0A]/60 border-[#0A0A0A]/15 hover:border-[#0A0A0A]/30'
                                } ${link.url ? 'cursor-pointer' : 'opacity-50 cursor-default'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </Screen>
        </EmployeeLayout>
    );
}
