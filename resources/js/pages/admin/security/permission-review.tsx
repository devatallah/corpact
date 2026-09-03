import { Head, useForm } from '@inertiajs/react';
import { CircleCheckBig, SearchCheck } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Button, Card, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §19 — المراجعة الربع سنوية للصلاحيات.
 *
 * The list is every reviewable role assignment on the platform. Recording a
 * review is itself an audited act with a mandatory written summary: a review
 * nobody can read later is not a review.
 */
type Assignment = {
    id: number;
    user: { id: number; name: string; email: string; status: string } | null;
    role: string;
    role_label: string;
    scope_type: string;
    scope_label: string;
    permissions: string[];
    granted_at: string | null;
};

type Review = {
    period: string;
    reviewed_at: string | null;
    reviewed_by: string | null;
    assignments_reviewed: number;
    notes: string | null;
};

export default function PermissionReview({
    assignments,
    filters,
    sort,
    roles,
    currentPeriod,
    lastReview,
    history,
    stats,
}: {
    assignments: Paginated<Assignment>;
    filters: { search?: string; role?: string; scope_type?: string };
    sort: SortState;
    roles: { value: string; label: string }[];
    currentPeriod: string;
    lastReview: Review | null;
    history: Review[];
    stats: { total: number; platform: number; reviewed_this_period: boolean };
}) {
    const [confirming, setConfirming] = useState(false);
    const form = useForm({ notes: '' });

    return (
        <AdminLayout>
            <Head title="مراجعة الصلاحيات" />

            <PageHeader
                icon={SearchCheck}
                title="المراجعة الربع سنوية للصلاحيات"
                subtitle="من يملك ماذا، وعلى أي نطاق. المراجعة تُسجَّل باسمك وخلاصتها في سجل التدقيق."
                actions={
                    <Button icon={CircleCheckBig} onClick={() => setConfirming(true)}>
                        تسجيل مراجعة {currentPeriod}
                    </Button>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي التعيينات" value={stats.total} />
                <StatCard label="على نطاق المنصة" value={stats.platform} hint="أعلى خطورة" tone={stats.platform > 0 ? 'warning' : 'ink'} />
                <StatCard label="الفترة الحالية" value={currentPeriod} />
                <StatCard
                    label="حالة المراجعة"
                    value={stats.reviewed_this_period ? 'تمّت' : 'لم تتم'}
                    tone={stats.reviewed_this_period ? 'success' : 'danger'}
                />
            </div>

            {!stats.reviewed_this_period && (
                <Note tone="warning" title={`لم تُسجَّل مراجعة للفترة ${currentPeriod}`}>
                    راجع القائمة أدناه ثم سجّل الخلاصة. المراجعة المتأخرة تظهر في تقارير الحوكمة.
                </Note>
            )}

            {lastReview && (
                <Card padding="p-4" className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-ink">آخر مراجعة موثّقة — {lastReview.period}</span>
                        <span className="text-[11px] text-ink/50 font-mono">
                            {lastReview.reviewed_at ? new Date(lastReview.reviewed_at).toLocaleString('ar-SA') : '—'}
                        </span>
                    </div>
                    <p className="text-xs text-ink/70 leading-relaxed">{lastReview.notes}</p>
                    <span className="text-[11px] text-ink/45">
                        بواسطة {lastReview.reviewed_by ?? '—'} · {lastReview.assignments_reviewed} تعييناً
                    </span>
                </Card>
            )}

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالاسم أو البريد…" />
                    <FilterSelect
                        name="role"
                        label="الدور"
                        value={filters.role ?? ''}
                        options={[['', 'كل الأدوار'], ...roles.map((role): [string, string] => [role.value, role.label])]}
                    />
                    <FilterSelect
                        name="scope_type"
                        label="النطاق"
                        value={filters.scope_type ?? ''}
                        options={[
                            ['', 'كل النطاقات'],
                            ['platform', 'المنصة'],
                            ['company', 'شركة'],
                            ['community', 'مجتمع'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="المستخدم" sortKey="user" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="الدور" sortKey="role" sort={sort} />
                        </Th>
                        <Th>النطاق</Th>
                        <Th>الصلاحيات</Th>
                        <Th>
                            <SortableHeader label="مُنح في" sortKey="created_at" sort={sort} initialDirection="desc" />
                        </Th>
                    </Thead>

                    <Tbody>
                        {assignments.data.map((assignment) => (
                            <Tr key={assignment.id}>
                                <Td>
                                    <span className="font-extrabold text-ink block">{assignment.user?.name ?? '—'}</span>
                                    <span className="font-mono text-[11px] text-ink/50" dir="ltr">
                                        {assignment.user?.email ?? ''}
                                    </span>
                                </Td>
                                <Td>
                                    <Badge tone={assignment.scope_type === 'platform' ? 'warning' : 'neutral'}>
                                        {assignment.role_label}
                                    </Badge>
                                </Td>
                                <Td className="text-ink/85">{assignment.scope_label}</Td>
                                <Td>
                                    <div className="flex flex-wrap gap-1 max-w-sm">
                                        {assignment.permissions.slice(0, 4).map((permission) => (
                                            <span
                                                key={permission}
                                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-ink/5 text-ink/70"
                                            >
                                                {permission}
                                            </span>
                                        ))}
                                        {assignment.permissions.length > 4 && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-ink/50">
                                                +{assignment.permissions.length - 4}
                                            </span>
                                        )}
                                    </div>
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/60">
                                    {assignment.granted_at ? new Date(assignment.granted_at).toLocaleDateString('ar-SA') : '—'}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates count={assignments.data.length} colSpan={5} empty="لا توجد تعيينات مطابقة." />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={assignments} />
                    <Pagination page={assignments} />
                </div>
            </Card>

            {history.length > 0 && (
                <Card padding="p-0" className="overflow-hidden">
                    <div className="p-4 border-b-[0.5px] border-ink/10">
                        <h2 className="text-sm font-extrabold text-ink">سجل المراجعات السابقة</h2>
                    </div>
                    <div className="divide-y-[0.5px] divide-ink/10">
                        {history.map((review) => (
                            <div key={review.period} className="p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-extrabold text-ink">{review.period}</span>
                                    <span className="text-[11px] text-ink/50">{review.reviewed_by ?? '—'}</span>
                                </div>
                                <p className="text-[11px] text-ink/70 leading-relaxed mt-1">{review.notes}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <ConfirmModal
                open={confirming}
                title={`تسجيل مراجعة الصلاحيات — ${currentPeriod}`}
                message="تُحفظ الخلاصة باسمك ووقتها في سجل التدقيق ولا يمكن حذفها."
                details={
                    <>
                        <ConfirmRow label="الفترة" value={currentPeriod} />
                        <ConfirmRow label="عدد التعيينات المراجَعة" value={String(stats.total)} strong />
                        <div className="pt-2">
                            <label htmlFor="review-notes" className="block text-[11px] font-bold text-ink mb-1">
                                خلاصة المراجعة (إلزامية)
                            </label>
                            <textarea
                                id="review-notes"
                                rows={3}
                                value={form.data.notes}
                                onChange={(event) => form.setData('notes', event.target.value)}
                                placeholder="ما الذي راجعته؟ ما التعيينات التي أُلغيت أو أُقرّت؟"
                                className="w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                            />
                            {form.errors.notes && <p className="text-[11px] font-bold text-danger mt-1">{form.errors.notes}</p>}
                        </div>
                    </>
                }
                confirmLabel="تسجيل المراجعة"
                busy={form.data.notes.trim().length < 5 || form.processing}
                onConfirm={() => {
                    form.post('/admin/security/permission-review', {
                        preserveScroll: true,
                        onSuccess: () => {
                            form.reset();
                            setConfirming(false);
                        },
                    });
                }}
                onCancel={() => setConfirming(false)}
            />
        </AdminLayout>
    );
}
