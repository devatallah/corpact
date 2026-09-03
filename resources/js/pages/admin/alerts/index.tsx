import { Head, router } from '@inertiajs/react';
import { CircleCheckBig, Siren, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §20 — التنبيهات الحرجة.
 *
 * «الصمت ليس دليل نجاح.» An alert here means an engine reported something it
 * could not resolve itself. Acknowledging one records who took responsibility
 * for it — it does not fix anything, and the copy says so.
 */
type Alert = {
    id: number;
    key: string;
    title: string;
    body: string | null;
    level: string;
    source: string | null;
    occurrences: number;
    last_seen_at: string | null;
    acknowledged_at: string | null;
};

const LEVEL: Record<string, { label: string; tone: 'neutral' | 'warning' | 'danger' }> = {
    critical: { label: 'حرج', tone: 'danger' },
    warning: { label: 'تحذير', tone: 'warning' },
    info: { label: 'معلومة', tone: 'neutral' },
};

export default function AdminAlerts({
    alerts,
    stats,
    filters,
    sort,
}: {
    alerts: Paginated<Alert>;
    stats: { open: number; critical: number };
    filters: { acknowledged?: boolean; search?: string | null };
    sort: SortState;
}) {
    const [acking, setAcking] = useState<Alert | null>(null);

    return (
        <AdminLayout>
            <Head title="التنبيهات الحرجة" />

            <PageHeader
                icon={Siren}
                title="التنبيهات الحرجة"
                subtitle="ما أبلغت عنه المحرّكات ولم تستطع معالجته بنفسها. الإقرار يوثّق من تولّى التنبيه — ولا يعالجه."
            />

            {stats.critical > 0 && (
                <Note tone="danger" title={`${stats.critical} تنبيه حرج مفتوح`}>
                    التنبيه الحرج يعني توقف مسار تشغيلي أو خطراً على سلامة البيانات المالية. عالجه قبل أي عمل آخر على هذه الشاشة.
                </Note>
            )}

            <div className="grid grid-cols-2 gap-4">
                <StatCard label="تنبيهات مفتوحة" value={stats.open} tone={stats.open > 0 ? 'warning' : 'success'} />
                <StatCard label="منها حرجة" value={stats.critical} tone={stats.critical > 0 ? 'danger' : 'success'} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بعنوان التنبيه…" />
                    <FilterSelect
                        name="acknowledged"
                        label="حالة الإقرار"
                        value={filters.acknowledged ? '1' : ''}
                        options={[
                            ['', 'المفتوحة فقط'],
                            ['1', 'تشمل المُقرّ بها'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="التنبيه" sortKey="title" sort={sort} />
                        </Th>
                        <Th>المصدر</Th>
                        <Th>
                            <SortableHeader label="الخطورة" sortKey="level" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="التكرار" sortKey="occurrences" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="آخر ظهور" sortKey="last_seen_at" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th className="text-center">الإجراء</Th>
                    </Thead>

                    <Tbody>
                        {alerts.data.map((alert) => (
                            <Tr key={alert.id}>
                                <Td>
                                    <span className="font-extrabold text-ink block">{alert.title}</span>
                                    {alert.body && <span className="block text-[11px] text-ink/65 leading-relaxed mt-0.5">{alert.body}</span>}
                                    <span className="font-mono text-[10px] text-ink/40">{alert.key}</span>
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">{alert.source ?? '—'}</Td>
                                <Td>
                                    <Badge
                                        tone={LEVEL[alert.level]?.tone ?? 'neutral'}
                                        icon={alert.level === 'critical' ? TriangleAlert : undefined}
                                    >
                                        {LEVEL[alert.level]?.label ?? alert.level}
                                    </Badge>
                                </Td>
                                <Td className="font-mono font-bold text-ink">{alert.occurrences}</Td>
                                <Td className="font-mono text-[11px] text-ink/70 whitespace-nowrap">
                                    {alert.last_seen_at ? new Date(alert.last_seen_at).toLocaleString('ar-SA') : '—'}
                                </Td>
                                <Td className="text-center">
                                    {alert.acknowledged_at ? (
                                        <Badge tone="success" icon={CircleCheckBig}>
                                            أُقرّ به
                                        </Badge>
                                    ) : (
                                        <Button tone="soft" onClick={() => setAcking(alert)}>
                                            إقرار
                                        </Button>
                                    )}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={alerts.data.length}
                            colSpan={6}
                            empty="لا تنبيهات مفتوحة."
                            emptyHint="المحرّكات تعمل ولم تبلّغ عن شيء يحتاج تدخلاً."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={alerts} />
                    <Pagination page={alerts} />
                </div>
            </Card>

            <ConfirmModal
                open={acking !== null}
                title="الإقرار بالتنبيه"
                message="يُسجَّل اسمك ووقت الإقرار. هذا توثيق لتولّي التنبيه ولا يعالج سببه — إن تكرّر السبب سيظهر التنبيه من جديد."
                details={
                    acking && (
                        <>
                            <ConfirmRow label="التنبيه" value={acking.title} strong />
                            <ConfirmRow label="المصدر" value={acking.source ?? '—'} />
                            <ConfirmRow label="عدد مرات التكرار" value={String(acking.occurrences)} />
                        </>
                    )
                }
                confirmLabel="إقرار وتولّي"
                onConfirm={() => {
                    router.post(`/admin/alerts/${acking?.id}/acknowledge`, {}, { preserveScroll: true });
                    setAcking(null);
                }}
                onCancel={() => setAcking(null)}
            />
        </AdminLayout>
    );
}
