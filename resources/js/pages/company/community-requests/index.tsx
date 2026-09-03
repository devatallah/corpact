import { Head, router } from '@inertiajs/react';
import { CircleCheckBig, Inbox, X } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
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
    IconButton,
    PageHeader,
    StatCard,
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §6 — طلبات إنشاء المجتمعات.
 *
 * Approving is not a rubber stamp: it creates the community *and* makes the
 * requesting employee its leader in one step. The confirm says both, because
 * an account manager who expects only the first will be surprised by the
 * second.
 */
type RequestRow = {
    id: number;
    name: string;
    description: string | null;
    status: string;
    rejection_reason: string | null;
    created_at: string | null;
    reviewed_at: string | null;
    employee?: { id: number; name: string; email: string } | null;
    category?: { id: number; name: string } | null;
    community?: { id: number; name: string } | null;
};

const REQUEST_STATUS: Record<
    string,
    { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }
> = {
    pending: { label: 'بانتظار قرارك', tone: 'warning' },
    approved: { label: 'مقبول', tone: 'success' },
    rejected: { label: 'مرفوض', tone: 'danger' },
};

export default function CompanyCommunityRequests({
    requests,
    filters,
    sort,
    pendingCommunityRequests,
}: {
    requests: Paginated<RequestRow>;
    filters: { search?: string; status?: string };
    sort: SortState;
    pendingCommunityRequests: number;
}) {
    const [deciding, setDeciding] = useState<{
        request: RequestRow;
        decision: 'approve' | 'reject';
    } | null>(null);
    const [reason, setReason] = useState('');

    return (
        <CompanyLayout>
            <Head title="طلبات المجتمعات" />

            <PageHeader
                icon={Inbox}
                title="طلبات إنشاء المجتمعات"
                subtitle="يقترحها الموظفون — الموافقة تنشئ المجتمع وتجعل مقدّم الطلب قائده."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="بانتظار قرارك"
                    value={pendingCommunityRequests}
                    tone={pendingCommunityRequests > 0 ? 'warning' : 'success'}
                />
                <StatCard label="إجمالي الطلبات" value={requests.total} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث باسم المجتمع المقترح…"
                    />
                    <FilterSelect
                        name="status"
                        label="الحالة"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['pending', 'بانتظار قرارك'],
                            ['approved', 'مقبول'],
                            ['rejected', 'مرفوض'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="المجتمع المقترح"
                                sortKey="name"
                                sort={sort}
                            />
                        </Th>
                        <Th>مقدّم الطلب</Th>
                        <Th>الفئة</Th>
                        <Th>
                            <SortableHeader
                                label="تاريخ الطلب"
                                sortKey="created_at"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الحالة"
                                sortKey="status"
                                sort={sort}
                            />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {requests.data.map((request) => (
                            <Tr key={request.id}>
                                <Td>
                                    <span className="block font-extrabold text-ink">
                                        {request.name}
                                    </span>
                                    {request.description && (
                                        <span className="block max-w-xs truncate text-[11px] text-ink/50">
                                            {request.description}
                                        </span>
                                    )}
                                </Td>
                                <Td>
                                    <span className="block text-ink/85">
                                        {request.employee?.name ?? '—'}
                                    </span>
                                    <span
                                        className="block font-mono text-[11px] text-ink/50"
                                        dir="ltr"
                                    >
                                        {request.employee?.email ?? ''}
                                    </span>
                                </Td>
                                <Td className="text-ink/85">
                                    {request.category?.name ?? '—'}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {request.created_at
                                        ? new Date(
                                              request.created_at,
                                          ).toLocaleDateString('ar-SA')
                                        : '—'}
                                </Td>
                                <Td>
                                    <Badge
                                        tone={
                                            REQUEST_STATUS[request.status]
                                                ?.tone ?? 'neutral'
                                        }
                                    >
                                        {REQUEST_STATUS[request.status]
                                            ?.label ?? request.status}
                                    </Badge>
                                    {request.rejection_reason && (
                                        <span className="mt-1 block max-w-xs text-[11px] text-danger">
                                            {request.rejection_reason}
                                        </span>
                                    )}
                                </Td>
                                <Td className="text-center">
                                    {request.status === 'pending' ? (
                                        <div className="flex items-center justify-center gap-1.5">
                                            <IconButton
                                                icon={CircleCheckBig}
                                                label="الموافقة وإنشاء المجتمع"
                                                onClick={() =>
                                                    setDeciding({
                                                        request,
                                                        decision: 'approve',
                                                    })
                                                }
                                            />
                                            <IconButton
                                                icon={X}
                                                label="رفض الطلب"
                                                tone="danger"
                                                onClick={() => {
                                                    setReason('');
                                                    setDeciding({
                                                        request,
                                                        decision: 'reject',
                                                    });
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-[11px] text-ink/45">
                                            {request.reviewed_at
                                                ? new Date(
                                                      request.reviewed_at,
                                                  ).toLocaleDateString('ar-SA')
                                                : '—'}
                                        </span>
                                    )}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={requests.data.length}
                            colSpan={6}
                            empty="لا طلبات مطابقة."
                            emptyHint="يقترح الموظفون المجتمعات من بوابتهم، فتظهر هنا لقرارك."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={requests} />
                    <Pagination page={requests} />
                </div>
            </Card>

            <ConfirmModal
                open={deciding !== null}
                tone={deciding?.decision === 'reject' ? 'danger' : 'default'}
                title={
                    deciding?.decision === 'approve'
                        ? 'الموافقة على الطلب'
                        : 'رفض الطلب'
                }
                message={
                    deciding?.decision === 'approve'
                        ? 'يُنشأ المجتمع فوراً، ويصبح مقدّم الطلب قائده الأساسي — بصلاحية إنشاء الفعاليات وإدارة الأعضاء. لن يكون له رصيد حتى توزّع له من المحفظة.'
                        : 'يُبلَّغ مقدّم الطلب بالرفض. لا يُنشأ المجتمع، ويمكنه التقدّم بطلب جديد لاحقاً.'
                }
                details={
                    deciding && (
                        <>
                            <ConfirmRow
                                label="المجتمع المقترح"
                                value={deciding.request.name}
                                strong
                            />
                            <ConfirmRow
                                label="مقدّم الطلب"
                                value={deciding.request.employee?.name ?? '—'}
                            />
                            {deciding.decision === 'approve' && (
                                <ConfirmRow
                                    label="سيصبح"
                                    value="القائد الأساسي للمجتمع"
                                    strong
                                />
                            )}
                            {deciding.decision === 'reject' && (
                                <div className="pt-2">
                                    <label
                                        htmlFor="reject-reason"
                                        className="mb-1 block text-[11px] font-bold text-ink"
                                    >
                                        سبب الرفض
                                    </label>
                                    <textarea
                                        id="reject-reason"
                                        rows={2}
                                        value={reason}
                                        onChange={(event) =>
                                            setReason(event.target.value)
                                        }
                                        className="w-full rounded-xl border-[0.5px] border-ink/20 bg-surface px-3 py-2 text-xs focus:border-ink focus:outline-none"
                                    />
                                </div>
                            )}
                        </>
                    )
                }
                confirmLabel={
                    deciding?.decision === 'approve'
                        ? 'نعم، أنشئ المجتمع'
                        : 'تأكيد الرفض'
                }
                onConfirm={() => {
                    router.post(
                        `/company/community-requests/${deciding?.request.id}/${deciding?.decision}`,
                        deciding?.decision === 'reject'
                            ? { rejection_reason: reason }
                            : {},
                        { preserveScroll: true },
                    );
                    setDeciding(null);
                }}
                onCancel={() => setDeciding(null)}
            />
        </CompanyLayout>
    );
}
