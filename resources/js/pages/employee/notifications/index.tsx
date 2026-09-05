import { Head, router } from '@inertiajs/react';
import { Bell, BellRing, Check, CheckCheck } from 'lucide-react';
import {
    Pagination,
    ResultCount,
    SortableHeader,
} from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, PageHeader } from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §14 — إشعاراتي.
 *
 * Phone-first, so notifications are cards rather than table rows and the
 * unread ones carry weight in the type itself — not a coloured dot that
 * disappears against a small screen in daylight.
 */
type NotificationRow = {
    id: string;
    title: string;
    body: string | null;
    read_at: string | null;
    created_at: string | null;
    template_key: string | null;
};

export default function EmployeeNotifications({
    notifications,
    unreadCount,
    sort,
}: {
    notifications: Paginated<NotificationRow>;
    unreadCount: number;
    sort: SortState;
}) {
    return (
        <EmployeeLayout>
            <Head title="الإشعارات" />

            <PageHeader
                icon={Bell}
                title="الإشعارات"
                subtitle={
                    unreadCount > 0
                        ? `${unreadCount} غير مقروء`
                        : 'كل شيء مقروء.'
                }
                actions={
                    unreadCount > 0 && (
                        <Button
                            type="button"
                            tone="soft"
                            icon={CheckCheck}
                            onClick={() =>
                                router.post(
                                    '/employee/notifications/read-all',
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            تعليم الكل
                        </Button>
                    )
                }
            />

            <Card padding="p-3">
                <div className="flex items-center gap-3 text-[11px] text-ink/55">
                    <SortableHeader
                        label="الوقت"
                        sortKey="created_at"
                        sort={sort}
                    />
                    <SortableHeader
                        label="الحالة"
                        sortKey="read_at"
                        sort={sort}
                    />
                </div>
            </Card>

            <div className="space-y-2">
                {notifications.data.map((notification) => (
                    <Card
                        key={notification.id}
                        padding="p-3.5"
                        className={
                            notification.read_at
                                ? ''
                                : 'border-ink/30 bg-lime/8'
                        }
                    >
                        <div className="flex items-start justify-between gap-2">
                            <span
                                className={`text-xs ${notification.read_at ? 'font-bold text-ink/75' : 'font-extrabold text-ink'}`}
                            >
                                {notification.title}
                            </span>
                            {!notification.read_at && (
                                <Badge tone="warning" icon={BellRing}>
                                    جديد
                                </Badge>
                            )}
                        </div>

                        {notification.body && (
                            <p className="mt-1 text-[11px] leading-relaxed text-ink/65">
                                {notification.body}
                            </p>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] text-ink/45">
                                {notification.created_at
                                    ? new Date(
                                          notification.created_at,
                                      ).toLocaleString('ar-SA')
                                    : '—'}
                            </span>

                            <div className="flex items-center gap-1.5">
                                {!notification.read_at && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.post(
                                                `/employee/notifications/${notification.id}/read`,
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                        aria-label="تعليم كمقروء"
                                        className="rounded-lg bg-ink/5 p-1.5 text-ink transition-colors hover:bg-ink/10"
                                    >
                                        <Check
                                            className="h-3 w-3"
                                            aria-hidden="true"
                                        />
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}

                <ListStates
                    count={notifications.data.length}
                    empty="لا إشعارات."
                    emptyHint="ستصلك هنا تذكيرات فعالياتك، وعروض المقاعد، وتأكيدات السداد."
                />
            </div>

            <Card
                padding="p-3"
                className="flex flex-wrap items-center justify-between gap-3"
            >
                <ResultCount page={notifications} />
                <Pagination page={notifications} />
            </Card>
        </EmployeeLayout>
    );
}
