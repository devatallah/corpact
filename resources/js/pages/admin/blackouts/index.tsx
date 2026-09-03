import { Head, router, useForm } from '@inertiajs/react';
import { CalendarOff, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, Field, IconButton, INPUT, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §16 — أيام التعطيل.
 *
 * A blackout range stops event scheduling platform-wide for those dates —
 * national holidays, Ramadan adjustments, anything the whole network should
 * not be booking through. Adding one is cheap; removing one silently reopens
 * dates people had planned around, so deletion confirms with the range.
 */
type Blackout = {
    id: number;
    name: string;
    starts_on: string;
    ends_on: string;
    created_at: string | null;
};

export default function AdminBlackouts({
    blackouts,
    totalBlackouts,
    filters,
    sort,
}: {
    blackouts: Paginated<Blackout>;
    totalBlackouts: number;
    filters: { search?: string | null };
    sort: SortState;
}) {
    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState<Blackout | null>(null);
    const form = useForm({ name: '', starts_on: '', ends_on: '' });

    return (
        <AdminLayout>
            <Head title="أيام التعطيل" />

            <PageHeader
                icon={CalendarOff}
                title="أيام التعطيل"
                subtitle="نطاقات تُمنع فيها جدولة الفعاليات على مستوى المنصة — الأعياد والمناسبات الرسمية."
                actions={
                    <Button icon={Plus} onClick={() => setAdding(true)}>
                        إضافة نطاق
                    </Button>
                }
            />

            <div className="grid grid-cols-2 gap-4">
                <StatCard label="إجمالي النطاقات" value={totalBlackouts} />
                <StatCard label="المعروض بعد التصفية" value={blackouts.total} />
            </div>

            {adding && (
                <Card padding="p-4" className="space-y-4">
                    <h2 className="text-sm font-extrabold text-ink">نطاق تعطيل جديد</h2>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/admin/blackouts', {
                                preserveScroll: true,
                                onSuccess: () => {
                                    form.reset();
                                    setAdding(false);
                                },
                            });
                        }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Field label="اسم المناسبة" htmlFor="blackout-name" required error={form.errors.name}>
                                <input
                                    id="blackout-name"
                                    type="text"
                                    required
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    placeholder="مثال: إجازة عيد الفطر"
                                    className={INPUT}
                                />
                            </Field>
                            <Field label="من تاريخ" htmlFor="blackout-start" required error={form.errors.starts_on}>
                                <input
                                    id="blackout-start"
                                    type="date"
                                    required
                                    value={form.data.starts_on}
                                    onChange={(event) => form.setData('starts_on', event.target.value)}
                                    className={INPUT}
                                />
                            </Field>
                            <Field label="إلى تاريخ" htmlFor="blackout-end" required error={form.errors.ends_on}>
                                <input
                                    id="blackout-end"
                                    type="date"
                                    required
                                    value={form.data.ends_on}
                                    onChange={(event) => form.setData('ends_on', event.target.value)}
                                    className={INPUT}
                                />
                            </Field>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={form.processing}>
                                حفظ النطاق
                            </Button>
                            <Button
                                type="button"
                                tone="soft"
                                onClick={() => {
                                    form.reset();
                                    setAdding(false);
                                }}
                            >
                                إلغاء
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث باسم المناسبة…" />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="المناسبة" sortKey="name" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="من" sortKey="starts_on" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="إلى" sortKey="ends_on" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>المدة</Th>
                        <Th className="text-center">الإجراء</Th>
                    </Thead>

                    <Tbody>
                        {blackouts.data.map((blackout) => {
                            const days =
                                Math.round(
                                    (new Date(blackout.ends_on).getTime() - new Date(blackout.starts_on).getTime()) / 86_400_000,
                                ) + 1;

                            return (
                                <Tr key={blackout.id}>
                                    <Td className="font-extrabold text-ink">{blackout.name}</Td>
                                    <Td className="font-mono text-[11px] text-ink/80">{blackout.starts_on}</Td>
                                    <Td className="font-mono text-[11px] text-ink/80">{blackout.ends_on}</Td>
                                    <Td>
                                        <Badge>{days} يوم</Badge>
                                    </Td>
                                    <Td className="text-center">
                                        <IconButton
                                            icon={Trash2}
                                            label="حذف النطاق"
                                            tone="danger"
                                            onClick={() => setRemoving(blackout)}
                                        />
                                    </Td>
                                </Tr>
                            );
                        })}

                        <ListStates
                            count={blackouts.data.length}
                            colSpan={5}
                            empty="لا توجد نطاقات تعطيل."
                            emptyHint="أضف نطاقاً لمنع جدولة الفعاليات في الأعياد والمناسبات."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={blackouts} />
                    <Pagination page={blackouts} />
                </div>
            </Card>

            <Note title="ماذا يحدث للفعاليات المجدولة داخل النطاق؟">
                النطاق يمنع الجدولة الجديدة ولا يلغي فعالية قائمة. الفعاليات التي حُجزت قبل إضافة النطاق تبقى كما هي، وإلغاؤها
                قرار يُتخذ واحدة واحدة بسياسة الاسترداد المعلنة.
            </Note>

            <ConfirmModal
                open={removing !== null}
                tone="danger"
                title="حذف نطاق التعطيل"
                message="ستُفتح هذه التواريخ للجدولة فوراً على مستوى المنصة."
                details={
                    removing && (
                        <>
                            <ConfirmRow label="المناسبة" value={removing.name} strong />
                            <ConfirmRow label="النطاق" value={`${removing.starts_on} → ${removing.ends_on}`} />
                        </>
                    )
                }
                confirmLabel="حذف النطاق"
                onConfirm={() => {
                    router.delete(`/admin/blackouts/${removing?.id}`, { preserveScroll: true });
                    setRemoving(null);
                }}
                onCancel={() => setRemoving(null)}
            />
        </AdminLayout>
    );
}
