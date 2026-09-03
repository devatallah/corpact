import { Head } from '@inertiajs/react';
import { Coins, ShieldCheck } from 'lucide-react';
import {
    FilterSelect,
    Pagination,
    ResultCount,
    SearchInput,
    SortableHeader,
    Toolbar,
    visitWith,
} from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import {
    Badge,
    Card,
    Note,
    PageHeader,
    Tbody,
    Td,
    Th,
    Thead,
    TableShell,
    Tr,
} from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §19 — the company's own slice of the audit log.
 *
 * Deliberately narrower than the platform view: no IP address, no user agent,
 * no before/after payloads. An account manager needs to know what happened
 * inside their company, not to inspect their employees' devices.
 */
type Log = {
    id: number;
    action: string;
    action_label: string;
    actor_name: string | null;
    actor_role: string | null;
    entity_type: string | null;
    entity_id: number | null;
    reason: string | null;
    is_financial: boolean;
    created_at: string | null;
};

export default function CompanyAudit({
    logs,
    filters,
    sort,
    actions,
}: {
    company: { id: number; name: string };
    logs: Paginated<Log>;
    filters: { search?: string; action?: string; from?: string; to?: string };
    sort: SortState;
    actions: { value: string; label: string }[];
    groups: { value: string; label: string }[];
}) {
    return (
        <CompanyLayout>
            <Head title="سجل التدقيق" />

            <PageHeader
                icon={ShieldCheck}
                title="سجل التدقيق"
                subtitle="كل إجراء حسّاس داخل شركتك، باسم فاعله ووقته وسببه — سجل لا يُعدَّل ولا يُحذف."
            />

            <Note title="ما الذي يظهر هنا؟">
                يعرض هذا السجل الإجراءات المتعلقة بشركتك وحدها: اعتماد
                المجتمعات، والحركات المالية، وتغييرات الصلاحيات، وتصدير
                البيانات. بيانات الأجهزة وعناوين الشبكة لا تُعرض لمسؤول الحساب.
            </Note>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث بالفاعل أو السبب…"
                    />
                    <FilterSelect
                        name="action"
                        label="الإجراء"
                        value={filters.action ?? ''}
                        options={[
                            ['', 'كل الإجراءات'],
                            ...actions.map((action): [string, string] => [
                                action.value,
                                action.label,
                            ]),
                        ]}
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            aria-label="من تاريخ"
                            value={filters.from ?? ''}
                            onChange={(event) =>
                                visitWith({ from: event.target.value })
                            }
                            className="w-full rounded-xl border-[0.5px] border-ink/20 bg-surface p-2 text-xs focus:border-ink focus:outline-none"
                        />
                        <input
                            type="date"
                            aria-label="إلى تاريخ"
                            value={filters.to ?? ''}
                            onChange={(event) =>
                                visitWith({ to: event.target.value })
                            }
                            className="w-full rounded-xl border-[0.5px] border-ink/20 bg-surface p-2 text-xs focus:border-ink focus:outline-none"
                        />
                    </div>
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
                                label="الإجراء"
                                sortKey="action"
                                sort={sort}
                            />
                        </Th>
                        <Th>الفاعل</Th>
                        <Th>الكيان</Th>
                        <Th>السبب</Th>
                    </Thead>

                    <Tbody>
                        {logs.data.map((log) => (
                            <Tr key={log.id}>
                                <Td className="font-mono text-[11px] whitespace-nowrap text-ink/70">
                                    {log.created_at
                                        ? new Date(
                                              log.created_at,
                                          ).toLocaleString('ar-SA')
                                        : '—'}
                                </Td>
                                <Td>
                                    <span className="block font-extrabold text-ink">
                                        {log.action_label}
                                    </span>
                                    {log.is_financial && (
                                        <Badge tone="lime" icon={Coins}>
                                            مالي
                                        </Badge>
                                    )}
                                </Td>
                                <Td>
                                    <span className="block font-bold text-ink">
                                        {log.actor_name ?? 'النظام'}
                                    </span>
                                    <span className="text-[11px] text-ink/50">
                                        {log.actor_role ?? '—'}
                                    </span>
                                </Td>
                                <Td>
                                    <span className="text-ink/85">
                                        {log.entity_type ?? '—'}
                                    </span>
                                    {log.entity_id !== null && (
                                        <span className="font-mono text-[11px] text-ink/45">
                                            {' '}
                                            #{log.entity_id}
                                        </span>
                                    )}
                                </Td>
                                <Td className="max-w-xs text-ink/70">
                                    {log.reason ?? '—'}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={logs.data.length}
                            colSpan={5}
                            empty="لا توجد سجلات مطابقة."
                            emptyHint="جرّب توسيع المدة الزمنية أو إزالة الفلاتر."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={logs} />
                    <Pagination page={logs} />
                </div>
            </Card>
        </CompanyLayout>
    );
}
