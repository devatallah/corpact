import { Head } from '@inertiajs/react';
import { Bell, CalendarDays, History, TriangleAlert } from 'lucide-react';
import { BackLink, ListStates } from '@/components/list-states';
import { Badge, Card, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import { deliveryStatus, eventStatus } from '@/lib/status';

/**
 * H §9 rule 2 — reading the state history is the precondition of any manual
 * intervention, so the support agent gets the whole story on one screen:
 * every transition with its actor and reason, and every notification the
 * platform tried to deliver about this event.
 *
 * A manual transition is marked as such. That flag is what separates «النظام
 * فعل ذلك» from «شخص فعل ذلك» when a company disputes an outcome.
 */
type StatusRow = {
    id: number;
    from_status: string | null;
    to_status: string;
    is_manual: boolean;
    reason: string | null;
    actor_id: number | null;
    created_at: string | null;
};

type NotificationRow = {
    id: number;
    template_key: string;
    channel: string;
    status: string;
    reason: string | null;
    created_at: string | null;
};

export default function SupportEvent({
    event,
    statusHistory,
    notificationLogs,
    escalation,
}: {
    event: {
        id: number;
        title: string;
        status: string;
        event_date: string | null;
        start_time: string | null;
        capacity: number | null;
        min_participants: number | null;
        participants_count: number | null;
        company: { id: number; name: string } | null;
        community: { id: number; name: string } | null;
        partner: { id: number; name: string } | null;
    };
    statusHistory: StatusRow[];
    notificationLogs: NotificationRow[];
    escalation: { action: string; label: string; role: string }[];
}) {
    const manualCount = statusHistory.filter((row) => row.is_manual).length;

    return (
        <AdminLayout>
            <Head title={`سجل الفعالية ${event.id}`} />

            <BackLink href="/admin/support-console" label="العودة إلى مركز الدعم" />

            <PageHeader
                icon={CalendarDays}
                title={event.title}
                subtitle={`${event.company?.name ?? '—'} · ${event.community?.name ?? '—'}`}
                actions={<Badge tone={eventStatus(event.status).tone}>{eventStatus(event.status).label}</Badge>}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="الموعد" value={event.event_date ?? '—'} hint={event.start_time ?? undefined} />
                <StatCard label="المشاركون" value={`${event.participants_count ?? 0} / ${event.capacity ?? '—'}`} hint={`النصاب ${event.min_participants ?? '—'}`} />
                <StatCard label="المرفق" value={event.partner?.name ?? '—'} />
                <StatCard
                    label="تدخلات يدوية"
                    value={manualCount}
                    tone={manualCount > 0 ? 'warning' : 'success'}
                    hint={manualCount > 0 ? 'راجع الأسباب أدناه' : 'الدورة تلقائية بالكامل'}
                />
            </div>

            {/* ── سجل الحالات ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-ink" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">سجل حالات الفعالية</h2>
                </div>

                <TableShell>
                    <Thead>
                        <Th>الوقت</Th>
                        <Th>من</Th>
                        <Th>إلى</Th>
                        <Th>المصدر</Th>
                        <Th>السبب</Th>
                    </Thead>
                    <Tbody>
                        {statusHistory.map((row) => (
                            <Tr key={row.id}>
                                <Td className="font-mono text-[11px] text-ink/70 whitespace-nowrap">
                                    {row.created_at ? new Date(row.created_at).toLocaleString('ar-SA') : '—'}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/60">{row.from_status ?? '—'}</Td>
                                <Td className="font-mono text-[11px] font-bold text-ink">{row.to_status}</Td>
                                <Td>
                                    {row.is_manual ? (
                                        <Badge tone="warning" icon={TriangleAlert}>
                                            تدخل يدوي
                                        </Badge>
                                    ) : (
                                        <Badge tone="neutral">النظام</Badge>
                                    )}
                                </Td>
                                <Td className="text-ink/70 max-w-xs">{row.reason ?? '—'}</Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={statusHistory.length}
                            colSpan={5}
                            empty="لا انتقالات مسجّلة."
                            emptyHint="لم تتغيّر حالة هذه الفعالية منذ إنشائها."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            {/* ── سجل الإشعارات ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-ink" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">إشعارات هذه الفعالية</h2>
                </div>

                <TableShell>
                    <Thead>
                        <Th>الوقت</Th>
                        <Th>القالب</Th>
                        <Th>القناة</Th>
                        <Th>التسليم</Th>
                        <Th>السبب</Th>
                    </Thead>
                    <Tbody>
                        {notificationLogs.map((log) => (
                            <Tr key={log.id}>
                                <Td className="font-mono text-[11px] text-ink/70 whitespace-nowrap">
                                    {log.created_at ? new Date(log.created_at).toLocaleString('ar-SA') : '—'}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/85">{log.template_key}</Td>
                                <Td className="text-ink/70">{log.channel}</Td>
                                <Td>
                                    <Badge tone={deliveryStatus(log.status).tone}>{deliveryStatus(log.status).label}</Badge>
                                </Td>
                                <Td className="text-ink/70 max-w-xs">{log.reason ?? '—'}</Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={notificationLogs.length}
                            colSpan={5}
                            empty="لا إشعارات مسجّلة لهذه الفعالية."
                            emptyHint="إن كان المستخدم يشتكي من عدم وصول إشعار، فهذا يعني أنه لم يُرسل أصلاً."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center gap-2">
                    <TriangleAlert className="w-4 h-4 text-warning" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">ما لا تفعله من هنا — يُصعَّد</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    {escalation.slice(0, 8).map((row) => (
                        <span
                            key={row.action}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-warning-tint text-warning border-[0.5px] border-warning/25"
                        >
                            {row.label} → {row.role}
                        </span>
                    ))}
                </div>
            </Card>
        </AdminLayout>
    );
}
