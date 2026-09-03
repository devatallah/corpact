import { Head } from '@inertiajs/react';
import { ArrowLeft, Coins, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar, visitWith } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Card, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §19 — سجل التدقيق: من فعل ماذا، متى، ولماذا.
 *
 * Rows are append-only on the server. A row can carry a before/after pair,
 * so the table expands one row at a time rather than shipping every diff
 * into the page at once.
 */
type Log = {
    id: number;
    action: string;
    action_label: string;
    actor_name: string | null;
    actor_role: string | null;
    company: { id: number; name: string } | null;
    entity_type: string | null;
    entity_id: number | null;
    before_values: Record<string, unknown> | null;
    after_values: Record<string, unknown> | null;
    reason: string | null;
    ip_address: string | null;
    is_financial: boolean;
    created_at: string | null;
};

type Option = { value: string; label: string };

export default function AuditIndex({
    logs,
    filters,
    sort,
    actions,
    groups,
    companies,
    total,
}: {
    logs: Paginated<Log>;
    filters: { search?: string; action?: string; group?: string; company_id?: number; from?: string; to?: string; financial?: string };
    sort: SortState;
    actions: Option[];
    groups: Option[];
    companies: { id: number; name: string }[];
    total: number;
}) {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <AdminLayout>
            <Head title="سجل التدقيق" />

            <PageHeader
                icon={ShieldCheck}
                title="سجل التدقيق"
                subtitle="سجل لا يُعدَّل ولا يُحذف: كل إجراء حسّاس مقيّد باسم فاعله ووقته وسببه."
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي السجلات" value={total.toLocaleString()} />
                <StatCard label="المعروض الآن" value={logs.total.toLocaleString()} hint="بعد تطبيق الفلاتر" />
                <StatCard label="الصفحة" value={`${logs.current_page} / ${logs.last_page}`} />
                <StatCard label="لكل صفحة" value={logs.per_page} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالفاعل أو الإجراء أو السبب…" />
                    <FilterSelect
                        name="group"
                        label="مجموعة الإجراء"
                        value={filters.group ?? ''}
                        options={[['', 'كل المجموعات'], ...groups.map((group): [string, string] => [group.value, group.label])]}
                    />
                    <FilterSelect
                        name="action"
                        label="الإجراء"
                        value={filters.action ?? ''}
                        options={[['', 'كل الإجراءات'], ...actions.map((action): [string, string] => [action.value, action.label])]}
                    />
                </Toolbar>

                <Toolbar>
                    <FilterSelect
                        name="company_id"
                        label="الشركة"
                        value={filters.company_id === undefined ? '' : String(filters.company_id)}
                        options={[['', 'كل الشركات'], ...companies.map((company): [string, string] => [String(company.id), company.name])]}
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            aria-label="من تاريخ"
                            value={filters.from ?? ''}
                            onChange={(event) => visitWith({ from: event.target.value })}
                            className="w-full p-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                        />
                        <input
                            type="date"
                            aria-label="إلى تاريخ"
                            value={filters.to ?? ''}
                            onChange={(event) => visitWith({ to: event.target.value })}
                            className="w-full p-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.financial === '1'}
                            onChange={(event) => visitWith({ financial: event.target.checked ? '1' : null })}
                            className="w-4 h-4 accent-lime cursor-pointer"
                        />
                        <span className="flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" aria-hidden="true" />
                            الإجراءات المالية فقط
                        </span>
                    </label>
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="الوقت" sortKey="created_at" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="الإجراء" sortKey="action" sort={sort} />
                        </Th>
                        <Th>الفاعل</Th>
                        <Th>الكيان</Th>
                        <Th>السبب</Th>
                        <Th>IP</Th>
                    </Thead>

                    <Tbody>
                        {logs.data.map((log) => (
                            <Tr key={log.id}>
                                <Td className="font-mono text-[11px] text-ink/70 whitespace-nowrap">
                                    {log.created_at ? new Date(log.created_at).toLocaleString('ar-SA') : '—'}
                                </Td>
                                <Td>
                                    <button
                                        type="button"
                                        onClick={() => setOpen(open === log.id ? null : log.id)}
                                        className="text-start cursor-pointer"
                                    >
                                        <span className="font-extrabold text-ink block">{log.action_label}</span>
                                        <span className="font-mono text-[10px] text-ink/45">{log.action}</span>
                                    </button>
                                    {log.is_financial && (
                                        <Badge tone="lime" icon={Coins}>
                                            مالي
                                        </Badge>
                                    )}
                                    {open === log.id && (log.before_values || log.after_values) && (
                                        <ValueDiff before={log.before_values} after={log.after_values} />
                                    )}
                                </Td>
                                <Td>
                                    <span className="font-bold text-ink block">{log.actor_name ?? 'النظام'}</span>
                                    <span className="text-[11px] text-ink/50">{log.actor_role ?? '—'}</span>
                                </Td>
                                <Td>
                                    <span className="text-ink/85">{log.entity_type ?? '—'}</span>
                                    {log.entity_id !== null && <span className="font-mono text-[11px] text-ink/45"> #{log.entity_id}</span>}
                                    {log.company && <span className="block text-[11px] text-ink/50">{log.company.name}</span>}
                                </Td>
                                <Td className="text-ink/70 max-w-xs">{log.reason ?? '—'}</Td>
                                <Td className="font-mono text-[11px] text-ink/50" dir="ltr">
                                    {log.ip_address ?? '—'}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={logs.data.length}
                            colSpan={6}
                            empty="لا توجد سجلات مطابقة."
                            emptyHint="جرّب توسيع المدة الزمنية أو إزالة بعض الفلاتر."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={logs} />
                    <Pagination page={logs} />
                </div>
            </Card>
        </AdminLayout>
    );
}

/**
 * القيمة السابقة والجديدة، حقلاً بحقل.
 *
 * The row already carries `before`/`after`; this used to print them as raw
 * JSON. An audit trail is read by someone reconstructing what changed and
 * why — usually under dispute — and `{"attendance_status":"absent"}` makes
 * them parse a data structure to find out. Only fields that actually differ
 * are shown, because an unchanged field is noise in exactly the moment
 * precision matters.
 */
function ValueDiff({
    before,
    after,
}: {
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
}) {
    const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])].filter(
        (key) => JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key]),
    );

    if (keys.length === 0) {
        return <p className="mt-2 text-[10px] text-ink/45">لا تغيّر في القيم — الصف يوثّق الإجراء نفسه.</p>;
    }

    const show = (value: unknown) => {
        if (value === null || value === undefined || value === '') {
            return '—';
        }

        return typeof value === 'object' ? JSON.stringify(value) : String(value);
    };

    return (
        <div className="mt-2 space-y-1 max-w-md">
            {keys.map((key) => (
                <div key={key} className="rounded-lg border-[0.5px] border-ink/10 bg-page p-2">
                    <span className="block font-mono text-[10px] text-ink/50" dir="ltr">
                        {key}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex-1 min-w-0 text-[11px] text-ink/60 line-through truncate">{show(before?.[key])}</span>
                        <ArrowLeft className="w-3 h-3 text-ink/30 shrink-0" aria-hidden="true" />
                        <span className="flex-1 min-w-0 text-[11px] font-bold text-ink truncate">{show(after?.[key])}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
