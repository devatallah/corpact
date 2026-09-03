import { Head, router } from '@inertiajs/react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Card, IconButton, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * رسائل الدعم الواردة من نموذج «اطلب عرضاً» وقنوات التواصل.
 *
 * The status is a queue position, not a judgement: `new` means nobody has
 * picked it up yet, and leaving one there is the failure mode this screen
 * exists to make visible.
 */
type SupportMessage = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    status: string;
    created_at: string | null;
};

const STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' }> = {
    new: { label: 'جديدة', tone: 'warning' },
    in_progress: { label: 'قيد المعالجة', tone: 'neutral' },
    resolved: { label: 'مغلقة', tone: 'success' },
};

export default function AdminSupportMessages({
    messages,
    stats,
    filters,
    sort,
}: {
    messages: Paginated<SupportMessage>;
    stats: { total: number; new: number; in_progress: number; resolved: number };
    filters: { search?: string; status?: string };
    sort: SortState;
}) {
    const [removing, setRemoving] = useState<SupportMessage | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);

    return (
        <AdminLayout>
            <Head title="رسائل الدعم" />

            <PageHeader
                icon={MessageSquare}
                title="رسائل الدعم الواردة"
                subtitle="الرسائل القادمة من نموذج التواصل. «جديدة» تعني أن أحداً لم يتولّها بعد."
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي الرسائل" value={stats.total} />
                <StatCard label="جديدة" value={stats.new} tone={stats.new > 0 ? 'warning' : 'success'} />
                <StatCard label="قيد المعالجة" value={stats.in_progress} />
                <StatCard label="مغلقة" value={stats.resolved} tone="success" />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالاسم أو الموضوع…" />
                    <FilterSelect
                        name="status"
                        label="حالة الرسالة"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['new', 'جديدة'],
                            ['in_progress', 'قيد المعالجة'],
                            ['resolved', 'مغلقة'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="المرسل" sortKey="name" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="الموضوع" sortKey="subject" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="وردت في" sortKey="created_at" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {messages.data.map((message) => (
                            <Tr key={message.id}>
                                <Td>
                                    <span className="font-extrabold text-ink block">{message.name}</span>
                                    <span className="font-mono text-[11px] text-ink/50" dir="ltr">
                                        {message.email}
                                    </span>
                                </Td>
                                <Td>
                                    <button
                                        type="button"
                                        onClick={() => setExpanded(expanded === message.id ? null : message.id)}
                                        className="text-start text-ink/85 hover:text-ink cursor-pointer"
                                    >
                                        {message.subject ?? '—'}
                                    </button>
                                    {expanded === message.id && (
                                        <p className="mt-2 p-2 rounded-lg bg-page border-[0.5px] border-ink/10 text-[11px] text-ink/75 leading-relaxed max-w-md">
                                            {message.message}
                                        </p>
                                    )}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70 whitespace-nowrap">
                                    {message.created_at ? new Date(message.created_at).toLocaleDateString('ar-SA') : '—'}
                                </Td>
                                <Td>
                                    <select
                                        aria-label="تغيير حالة الرسالة"
                                        value={message.status}
                                        onChange={(event) =>
                                            router.patch(
                                                `/admin/support/${message.id}`,
                                                { status: event.target.value },
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="p-1.5 rounded-lg border-[0.5px] border-ink/20 text-[11px] bg-surface cursor-pointer focus:outline-none focus:border-ink"
                                    >
                                        <option value="new">جديدة</option>
                                        <option value="in_progress">قيد المعالجة</option>
                                        <option value="resolved">مغلقة</option>
                                    </select>
                                    <Badge tone={STATUS[message.status]?.tone ?? 'neutral'}>
                                        {STATUS[message.status]?.label ?? message.status}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    <IconButton icon={Trash2} label="حذف الرسالة" tone="danger" onClick={() => setRemoving(message)} />
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={messages.data.length}
                            colSpan={5}
                            empty="لا رسائل واردة."
                            emptyHint="ستظهر هنا الرسائل القادمة من نموذج التواصل في الموقع."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={messages} />
                    <Pagination page={messages} />
                </div>
            </Card>

            <ConfirmModal
                open={removing !== null}
                tone="danger"
                title="حذف الرسالة"
                message="يُحذف نص الرسالة وبيانات المرسل نهائياً. إن كان البلاغ ما زال مفتوحاً فأغلقه بدل حذفه."
                details={
                    removing && (
                        <>
                            <ConfirmRow label="المرسل" value={removing.name} strong />
                            <ConfirmRow label="الموضوع" value={removing.subject ?? '—'} />
                        </>
                    )
                }
                confirmLabel="حذف نهائي"
                onConfirm={() => {
                    router.delete(`/admin/support/${removing?.id}`, { preserveScroll: true });
                    setRemoving(null);
                }}
                onCancel={() => setRemoving(null)}
            />
        </AdminLayout>
    );
}
