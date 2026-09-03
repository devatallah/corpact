import { Head } from '@inertiajs/react';
import { ScrollText } from 'lucide-react';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Card, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §19 — سجل الإشعارات والتسليم.
 *
 * The answer to «لم يصلني إشعار» lives here, and it has three shapes: it was
 * never sent, it was sent and the provider rejected it, or it was delivered
 * and the user missed it. Secret links are redacted in the payload before it
 * reaches this screen — a delivery log must never become a way to replay
 * someone else's login link.
 */
type Log = {
    id: number;
    template_key: string;
    recipient_type: string | null;
    recipient_id: number | null;
    recipient_phone: string | null;
    channel: string;
    status: string;
    attempt: number;
    reason: string | null;
    rendered_body: string | null;
    provider_message_id?: string | null;
    created_at: string | null;
};

const STATUS_TONES: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
    delivered: 'success',
    sent: 'success',
    queued: 'neutral',
    deferred: 'warning',
    failed: 'danger',
    skipped: 'neutral',
};

export default function NotificationLogs({
    logs,
    statuses,
    channels,
    stats,
    filters,
    sort,
}: {
    logs: Paginated<Log>;
    statuses: { value: string; label: string }[];
    channels: string[];
    stats: { total: number; failed: number; deferred: number; delivered: number };
    filters: { search?: string; status?: string; channel?: string; template_key?: string };
    sort: SortState;
}) {
    return (
        <AdminLayout>
            <Head title="سجل الإشعارات" />

            <PageHeader
                icon={ScrollText}
                title="سجل الإشعارات والتسليم"
                subtitle="كل محاولة إرسال بقناتها وحالتها وسببها. الروابط السرية محجوبة في السجل."
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي المحاولات" value={stats.total.toLocaleString()} />
                <StatCard label="وصلت" value={stats.delivered.toLocaleString()} tone="success" />
                <StatCard label="مؤجلة" value={stats.deferred.toLocaleString()} tone={stats.deferred > 0 ? 'warning' : 'ink'} />
                <StatCard label="فشلت" value={stats.failed.toLocaleString()} tone={stats.failed > 0 ? 'danger' : 'success'} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالقالب أو رقم المستلم…" />
                    <FilterSelect
                        name="status"
                        label="حالة التسليم"
                        value={filters.status ?? ''}
                        options={[['', 'كل الحالات'], ...statuses.map((status): [string, string] => [status.value, status.label])]}
                    />
                    <FilterSelect
                        name="channel"
                        label="القناة"
                        value={filters.channel ?? ''}
                        options={[['', 'كل القنوات'], ...channels.map((channel): [string, string] => [channel, channel])]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="الوقت" sortKey="created_at" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="القالب" sortKey="template_key" sort={sort} />
                        </Th>
                        <Th>المستلم</Th>
                        <Th>
                            <SortableHeader label="القناة" sortKey="channel" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="المحاولة" sortKey="attempt" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                        </Th>
                        <Th>السبب</Th>
                    </Thead>

                    <Tbody>
                        {logs.data.map((log) => (
                            <Tr key={log.id}>
                                <Td className="font-mono text-[11px] text-ink/70 whitespace-nowrap">
                                    {log.created_at ? new Date(log.created_at).toLocaleString('ar-SA') : '—'}
                                </Td>
                                <Td className="font-mono text-[11px] font-bold text-ink">{log.template_key}</Td>
                                <Td>
                                    <span className="text-ink/85 block">{log.recipient_type ?? '—'}</span>
                                    <span className="font-mono text-[11px] text-ink/50" dir="ltr">
                                        {log.recipient_phone ?? (log.recipient_id !== null ? `#${log.recipient_id}` : '')}
                                    </span>
                                </Td>
                                <Td className="text-ink/70">{log.channel}</Td>
                                <Td className="font-mono text-ink/70">{log.attempt}</Td>
                                <Td>
                                    <Badge tone={STATUS_TONES[log.status] ?? 'neutral'}>{log.status}</Badge>
                                </Td>
                                <Td className="text-ink/70 max-w-xs text-[11px]">{log.reason ?? '—'}</Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={logs.data.length}
                            colSpan={7}
                            empty="لا سجلات مطابقة."
                            emptyHint="إن كان المستخدم يشتكي من عدم وصول إشعار ولا سجل له هنا، فهو لم يُرسَل أصلاً."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={logs} />
                    <Pagination page={logs} />
                </div>
            </Card>

            <Note title="القناة الاحتياطية">
                فشل واتساب لا يعني فشل الإشعار: القناة الاحتياطية (SMS) تُحاول بعده، وتظهر كسطر مستقل بنفس مفتاح القالب.
                الدخول يجب ألا يتعطل بتعطل قناة واحدة.
            </Note>
        </AdminLayout>
    );
}
