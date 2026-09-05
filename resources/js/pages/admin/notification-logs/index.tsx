import { Head } from '@inertiajs/react';
import { ScrollText } from 'lucide-react';
import {
    FilterSelect,
    Pagination,
    ResultCount,
    SearchInput,
    SortableHeader,
    Toolbar,
} from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import {
    Badge,
    Card,
    Note,
    PageHeader,
    StatCard,
    Tbody,
    Td,
    Th,
    Thead,
    TableShell,
    Tr,
} from '@/components/portal/ui';
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
    /** عنوان القالب العربي — المفتاح يبقى تحته للدعم. */
    template_title: string | null;
    recipient_type: string | null;
    recipient_id: number | null;
    /** اسم المستلم، لا اسم صنفه. */
    recipient_name: string | null;
    recipient_kind: string | null;
    recipient_phone: string | null;
    channel: string;
    channel_label: string;
    status: string;
    status_label: string;
    reason_label: string | null;
    attempt: number;
    reason: string | null;
    rendered_body: string | null;
    provider_message_id?: string | null;
    created_at: string | null;
};

/**
 * وقت بأرقام لاتينية وترتيب ثابت.
 *
 * `toLocaleString('ar-SA')` كان يطبع أرقاماً هندية على تقويم هجري
 * (`٥/٩/٢٠٢٦، ١٠:٤٠:١٨ ص`) — وسجل التسليم يُقرأ بالمقارنة مع ختم وقت أرسله
 * المستخدم أو المزوّد، وكلاهما ميلادي بأرقام لاتينية.
 */
function stamp(value: string | null): string {
    if (value === null) {
        return '—';
    }

    const date = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    );
}

/** تُطابق `NotificationLogController::CHANNEL_LABELS`. */
const CHANNEL_LABELS: Record<string, string> = {
    whatsapp: 'واتساب',
    sms: 'رسالة نصية',
    mail: 'بريد إلكتروني',
    in_app: 'داخل التطبيق',
    log: 'سجل فقط',
};

const STATUS_TONES: Record<
    string,
    'neutral' | 'success' | 'warning' | 'danger'
> = {
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
    stats: {
        total: number;
        failed: number;
        deferred: number;
        delivered: number;
    };
    filters: {
        search?: string;
        status?: string;
        channel?: string;
        template_key?: string;
    };
    sort: SortState;
}) {
    return (
        <AdminLayout>
            <Head title="سجل الإشعارات والتسليم" />

            <PageHeader
                icon={ScrollText}
                title="سجل الإشعارات والتسليم"
                subtitle="كل محاولة إرسال بقناتها وحالتها وسببها. الروابط السرية محجوبة في السجل."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="إجمالي المحاولات"
                    value={stats.total.toLocaleString()}
                />
                <StatCard
                    label="وصلت"
                    value={stats.delivered.toLocaleString()}
                    tone="success"
                />
                <StatCard
                    label="مؤجلة"
                    value={stats.deferred.toLocaleString()}
                    tone={stats.deferred > 0 ? 'warning' : 'ink'}
                />
                <StatCard
                    label="فشلت"
                    value={stats.failed.toLocaleString()}
                    tone={stats.failed > 0 ? 'danger' : 'success'}
                />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث بالقالب أو رقم المستلم…"
                    />
                    <FilterSelect
                        name="status"
                        label="حالة التسليم"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ...statuses.map((status): [string, string] => [
                                status.value,
                                status.label,
                            ]),
                        ]}
                    />
                    <FilterSelect
                        name="channel"
                        label="القناة"
                        value={filters.channel ?? ''}
                        options={[
                            ['', 'كل القنوات'],
                            ...channels.map((channel): [string, string] => [
                                channel,
                                CHANNEL_LABELS[channel] ?? channel,
                            ]),
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="الوقت"
                                sortKey="created_at"
                                sort={sort}
                                initialDirection="desc"
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="القالب"
                                sortKey="template_key"
                                sort={sort}
                            />
                        </Th>
                        <Th>المستلم</Th>
                        <Th>
                            <SortableHeader
                                label="القناة"
                                sortKey="channel"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="المحاولة"
                                sortKey="attempt"
                                sort={sort}
                                initialDirection="desc"
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الحالة"
                                sortKey="status"
                                sort={sort}
                            />
                        </Th>
                        <Th>السبب</Th>
                    </Thead>

                    <Tbody>
                        {logs.data.map((log) => (
                            <Tr key={log.id}>
                                <Td className="font-mono text-[11px] whitespace-nowrap text-ink/70">
                                    {stamp(log.created_at)}
                                </Td>
                                <Td>
                                    {/* العنوان أولاً، والمفتاح تحته: الدعم
                                        يقرأ الأول ويبلّغ الثاني. */}
                                    <span className="block text-xs font-bold text-ink">
                                        {log.template_title ?? log.template_key}
                                    </span>
                                    {log.template_title && (
                                        <span
                                            className="block font-mono text-[10px] text-ink/45"
                                            dir="ltr"
                                        >
                                            {log.template_key}
                                        </span>
                                    )}
                                </Td>
                                <Td>
                                    <span className="block text-ink/85">
                                        {log.recipient_name ??
                                            log.recipient_kind ??
                                            '—'}
                                    </span>
                                    <span
                                        className="block font-mono text-[11px] text-ink/50"
                                        dir="ltr"
                                    >
                                        {log.recipient_phone ??
                                            (log.recipient_id !== null
                                                ? `#${log.recipient_id}`
                                                : '')}
                                    </span>
                                    {log.rendered_body && (
                                        <span className="mt-0.5 block max-w-sm truncate text-[11px] text-ink/60">
                                            {log.rendered_body}
                                        </span>
                                    )}
                                </Td>
                                <Td className="whitespace-nowrap text-ink/70">
                                    {log.channel_label}
                                </Td>
                                <Td className="font-mono text-ink/70">
                                    {log.attempt}
                                </Td>
                                <Td>
                                    <Badge
                                        tone={
                                            STATUS_TONES[log.status] ??
                                            'neutral'
                                        }
                                    >
                                        {log.status_label}
                                    </Badge>
                                </Td>
                                <Td className="max-w-xs text-[11px] text-ink/70">
                                    {log.reason_label ?? '—'}
                                </Td>
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

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={logs} />
                    <Pagination page={logs} />
                </div>
            </Card>

            <Note title="القناة الاحتياطية">
                فشل واتساب لا يعني فشل الإشعار: القناة الاحتياطية (SMS) تُحاول
                بعده، وتظهر كسطر مستقل بنفس مفتاح القالب. الدخول يجب ألا يتعطل
                بتعطل قناة واحدة.
            </Note>
        </AdminLayout>
    );
}
