import { Head, router } from '@inertiajs/react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Card, IconButton, PageHeader, StatCard } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/** Your own inbox — the notifications addressed to this admin account. */
type NotificationRow = {
    id: number;
    type: string | null;
    title: string;
    body: string | null;
    link: string | null;
    read_at: string | null;
    created_at: string | null;
};

export default function AdminNotifs({
    notifications,
    unreadCount,
    filters,
    sort,
}: {
    notifications: Paginated<NotificationRow>;
    unreadCount: number;
    filters: { search?: string; state?: string };
    sort: SortState;
}) {
    return (
        <AdminLayout>
            <Head title="الإشعارات" />

            <PageHeader icon={Bell} title="صندوق إشعاراتك" subtitle="الإشعارات الموجّهة إلى حسابك أنت — لا سجل الإرسال العام." />

            <div className="grid grid-cols-2 gap-4">
                <StatCard label="غير مقروءة" value={unreadCount} tone={unreadCount > 0 ? 'warning' : 'success'} />
                <StatCard label="المعروض بعد التصفية" value={notifications.total} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث في العنوان أو النص…" />
                    <FilterSelect
                        name="state"
                        label="حالة القراءة"
                        value={filters.state ?? ''}
                        options={[
                            ['', 'الكل'],
                            ['unread', 'غير المقروءة'],
                            ['read', 'المقروءة'],
                        ]}
                    />
                    <div className="flex items-center justify-end">
                        <SortableHeader label="الأحدث" sortKey="created_at" sort={sort} initialDirection="desc" />
                    </div>
                </Toolbar>

                <div className="divide-y-[0.5px] divide-ink/10">
                    {notifications.data.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 flex items-start justify-between gap-3 ${notification.read_at === null ? 'bg-lime/[0.06]' : ''}`}
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-extrabold text-ink">{notification.title}</span>
                                    {notification.read_at === null && <Badge tone="lime">جديد</Badge>}
                                </div>
                                {notification.body && (
                                    <p className="text-[11px] text-ink/70 leading-relaxed mt-0.5">{notification.body}</p>
                                )}
                                <span className="text-[10px] text-ink/45 font-mono">
                                    {notification.created_at ? new Date(notification.created_at).toLocaleString('ar-SA') : '—'}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                {notification.read_at === null && (
                                    <IconButton
                                        icon={Check}
                                        label="تعليم كمقروء"
                                        onClick={() => router.post(`/admin/notifs/${notification.id}/read`, {}, { preserveScroll: true })}
                                    />
                                )}
                                <IconButton
                                    icon={Trash2}
                                    label="حذف الإشعار"
                                    tone="danger"
                                    onClick={() => router.delete(`/admin/notifs/${notification.id}`, { preserveScroll: true })}
                                />
                            </div>
                        </div>
                    ))}

                    <ListStates
                        count={notifications.data.length}
                        empty="لا إشعارات."
                        emptyHint="ستصلك هنا تنبيهات النظام الموجّهة لحسابك."
                    />
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={notifications} />
                    <Pagination page={notifications} />
                </div>
            </Card>
        </AdminLayout>
    );
}
