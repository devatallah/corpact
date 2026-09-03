import { Head } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar, visitWith } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Card, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §19 — «سجل أحداث أمنية منفصل (دخول فاشل، تغيير صلاحية، تنزيل ملف مالي…)».
 *
 * Kept apart from the audit log on purpose: an audit row says what a
 * legitimate actor did, a security row says what someone tried.
 */
type SecurityEvent = {
    id: number;
    event: string;
    event_label: string;
    severity: string;
    actor_name: string | null;
    actor_identifier: string | null;
    guard: string | null;
    subject_type: string | null;
    subject_id: number | null;
    company: { id: number; name: string } | null;
    ip_address: string | null;
    created_at: string | null;
};

const SEVERITY: Record<string, { label: string; tone: 'neutral' | 'warning' | 'danger' }> = {
    info: { label: 'معلومة', tone: 'neutral' },
    warning: { label: 'تحذير', tone: 'warning' },
    critical: { label: 'حرج', tone: 'danger' },
};

export default function SecurityEvents({
    events,
    filters,
    sort,
    eventTypes,
    stats,
}: {
    events: Paginated<SecurityEvent>;
    filters: { search?: string; event?: string; severity?: string; from?: string; to?: string };
    sort: SortState;
    eventTypes: { value: string; label: string }[];
    stats: { total: number; critical_24h: number; failed_logins_24h: number; permission_changes_24h: number };
}) {
    return (
        <AdminLayout>
            <Head title="الأحداث الأمنية" />

            <PageHeader
                icon={Shield}
                title="سجل الأحداث الأمنية"
                subtitle="محاولات الدخول الفاشلة، وتغييرات الصلاحيات، وتنزيل الملفات المالية — منفصلة عن سجل التدقيق."
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي الأحداث" value={stats.total.toLocaleString()} />
                <StatCard
                    label="أحداث حرجة (٢٤ ساعة)"
                    value={stats.critical_24h}
                    tone={stats.critical_24h > 0 ? 'danger' : 'success'}
                />
                <StatCard
                    label="دخول فاشل (٢٤ ساعة)"
                    value={stats.failed_logins_24h}
                    tone={stats.failed_logins_24h > 0 ? 'warning' : 'success'}
                />
                <StatCard label="تغييرات صلاحيات (٢٤ ساعة)" value={stats.permission_changes_24h} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالفاعل أو المعرّف أو عنوان IP…" />
                    <FilterSelect
                        name="event"
                        label="نوع الحدث"
                        value={filters.event ?? ''}
                        options={[['', 'كل الأنواع'], ...eventTypes.map((type): [string, string] => [type.value, type.label])]}
                    />
                    <FilterSelect
                        name="severity"
                        label="الخطورة"
                        value={filters.severity ?? ''}
                        options={[
                            ['', 'كل مستويات الخطورة'],
                            ['critical', 'حرج'],
                            ['warning', 'تحذير'],
                            ['info', 'معلومة'],
                        ]}
                    />
                </Toolbar>

                <Toolbar>
                    <input
                        type="date"
                        aria-label="من تاريخ"
                        value={filters.from ?? ''}
                        onChange={(event) => visitWith({ from: event.target.value })}
                        className="p-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                    />
                    <input
                        type="date"
                        aria-label="إلى تاريخ"
                        value={filters.to ?? ''}
                        onChange={(event) => visitWith({ to: event.target.value })}
                        className="p-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="الوقت" sortKey="created_at" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="الحدث" sortKey="event" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="الخطورة" sortKey="severity" sort={sort} />
                        </Th>
                        <Th>الفاعل</Th>
                        <Th>الهدف</Th>
                        <Th>IP</Th>
                    </Thead>

                    <Tbody>
                        {events.data.map((event) => (
                            <Tr key={event.id}>
                                <Td className="font-mono text-[11px] text-ink/70 whitespace-nowrap">
                                    {event.created_at ? new Date(event.created_at).toLocaleString('ar-SA') : '—'}
                                </Td>
                                <Td>
                                    <span className="font-extrabold text-ink block">{event.event_label}</span>
                                    <span className="font-mono text-[10px] text-ink/45">{event.event}</span>
                                </Td>
                                <Td>
                                    <Badge tone={SEVERITY[event.severity]?.tone ?? 'neutral'}>
                                        {SEVERITY[event.severity]?.label ?? event.severity}
                                    </Badge>
                                </Td>
                                <Td>
                                    <span className="font-bold text-ink block">{event.actor_name ?? '—'}</span>
                                    <span className="font-mono text-[11px] text-ink/50" dir="ltr">
                                        {event.actor_identifier ?? ''}
                                    </span>
                                    {event.guard && <span className="block text-[11px] text-ink/45">بوابة {event.guard}</span>}
                                </Td>
                                <Td>
                                    <span className="text-ink/85">{event.subject_type ?? '—'}</span>
                                    {event.subject_id !== null && (
                                        <span className="font-mono text-[11px] text-ink/45"> #{event.subject_id}</span>
                                    )}
                                    {event.company && <span className="block text-[11px] text-ink/50">{event.company.name}</span>}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/50" dir="ltr">
                                    {event.ip_address ?? '—'}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={events.data.length}
                            colSpan={6}
                            empty="لا توجد أحداث أمنية مطابقة."
                            emptyHint="لا يعني هذا غياب المحاولات — راجع الفلاتر والمدة الزمنية."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={events} />
                    <Pagination page={events} />
                </div>
            </Card>
        </AdminLayout>
    );
}
