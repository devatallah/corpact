import { Head, Link } from '@inertiajs/react';
import { ClipboardList, Clock } from 'lucide-react';
import {
    FilterSelect,
    Pagination,
    ResultCount,
    SortableHeader,
    Toolbar,
    useMinutesLeft,
} from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import {
    Badge,
    Card,
    Money,
    Note,
    PageHeader,
    StatCard,
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';
import { providerRequestStatus } from '@/lib/status';
import type { Paginated, SortState } from '@/types';

/**
 * H §11 — طابور الطلبات.
 *
 * The deadline column is a live countdown, not a timestamp, because the cost
 * of missing it is asymmetric: an unanswered request expires by itself and
 * takes reliability points with it, while answering early costs nothing.
 *
 * There is no participants column and no way to sort by one — the provider
 * learns the headcount for capacity, and nothing more about who is coming.
 */
export type ProviderRequestRow = {
    id: number;
    status: string;
    requested_date: string;
    start_time: string;
    duration_minutes: number;
    quantity: number;
    pricing_type: string;
    frozen_participants_count: number | null;
    total_amount: string | number | null;
    sent_at: string | null;
    deadline_at: string | null;
    responded_at: string | null;
    late_response: boolean;
    rejection_reason: string | null;
    cancellation_reason: string | null;
    unit: { id: number; name: string; pricing_type: string } | null;
    event: {
        id: number;
        community_name: string | null;
        company_name: string | null;
        participants_count: number;
        event_date: string | null;
        start_time: string;
        duration_minutes: number;
        status: string;
        creator_name: string | null;
        creator_phone: string | null;
    } | null;
};

export default function PartnerRequestQueue({
    requests,
    filters,
    sort,
    pendingCount,
}: {
    requests: Paginated<ProviderRequestRow>;
    filters: {
        status?: string | null;
        sort?: string | null;
        dir?: string | null;
    };
    sort: SortState;
    pendingCount: number;
}) {
    return (
        <PartnerLayout>
            <Head title="طلبات الحجز" />

            <PageHeader
                icon={ClipboardList}
                title="طلبات الحجز"
                subtitle="كل قبول ورفض يمرّ من هنا — وهذه هي القناة المعتمدة الوحيدة."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="بانتظار ردّك"
                    value={pendingCount}
                    tone={pendingCount > 0 ? 'warning' : 'success'}
                    hint={
                        pendingCount > 0 ? 'قبل انتهاء المهلة' : 'لا شيء معلّق'
                    }
                />
                <StatCard
                    label="المعروض"
                    value={requests.data.length}
                    hint={`من ${requests.total}`}
                />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <FilterSelect
                        name="status"
                        label="حالة الطلب"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['pending', 'بانتظار ردّك'],
                            ['accepted', 'مقبول'],
                            ['rejected', 'مرفوض'],
                            ['alternative_proposed', 'اقترحتَ وقتاً بديلاً'],
                            ['expired', 'انتهت المهلة'],
                            ['cancelled', 'ملغى بعد القبول'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>الطلب</Th>
                        <Th>
                            <SortableHeader
                                label="الموعد المطلوب"
                                sortKey="requested_date"
                                sort={sort}
                            />
                        </Th>
                        <Th>الوحدة</Th>
                        <Th>
                            <SortableHeader
                                label="المهلة"
                                sortKey="deadline_at"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الإجمالي"
                                sortKey="total_amount"
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
                    </Thead>

                    <Tbody>
                        {requests.data.map((row) => (
                            <Tr key={row.id}>
                                <Td>
                                    <Link
                                        href={`/partner/requests-queue/${row.id}`}
                                        className="font-extrabold text-ink hover:underline"
                                    >
                                        {row.event?.community_name ??
                                            `طلب #${row.id}`}
                                    </Link>
                                    <span className="block text-[11px] text-ink/50">
                                        {row.event?.company_name ?? '—'}
                                    </span>
                                </Td>
                                <Td className="font-mono text-[11px] whitespace-nowrap text-ink/70">
                                    {row.requested_date}
                                    <span className="block text-ink/45">
                                        {row.start_time} ·{' '}
                                        {row.duration_minutes} د
                                    </span>
                                </Td>
                                <Td className="text-ink/85">
                                    {row.unit?.name ?? '—'}
                                    {row.quantity > 1 && (
                                        <span className="block text-[11px] text-ink/50">
                                            ×{row.quantity}
                                        </span>
                                    )}
                                </Td>
                                <Td>
                                    <Deadline
                                        deadline={row.deadline_at}
                                        pending={row.status === 'pending'}
                                        late={row.late_response}
                                    />
                                </Td>
                                <Td>
                                    <Money amount={row.total_amount} />
                                </Td>
                                <Td>
                                    <Badge
                                        tone={
                                            providerRequestStatus(row.status)
                                                .tone
                                        }
                                    >
                                        {
                                            providerRequestStatus(row.status)
                                                .label
                                        }
                                    </Badge>
                                    {row.late_response &&
                                        row.status !== 'pending' && (
                                            <span className="mt-0.5 block text-[10px] font-bold text-warning">
                                                ردّ متأخر
                                            </span>
                                        )}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={requests.data.length}
                            colSpan={6}
                            empty="لا طلبات مطابقة."
                            emptyHint="تصلك الطلبات من الشركات مباشرةً حسب فئتك والوحدات المتاحة في تقويمك."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={requests} />
                    <Pagination page={requests} />
                </div>
            </Card>

            <Note title="لماذا لا ترى أسماء المشاركين؟">
                يصلك العدد فقط — وهو ما تحتاجه لتقدير السعة والتسعير. أسماء
                الموظفين بيانات الشركة، ولا تغادر بوابتها.
            </Note>
        </PartnerLayout>
    );
}

/** المهلة كعدّ تنازلي حيّ — لأن الوقت المتبقي هو القرار، لا التاريخ. */
export function Deadline({
    deadline,
    pending,
    late,
}: {
    deadline: string | null;
    pending: boolean;
    late?: boolean;
}) {
    const minutes = useMinutesLeft(deadline);

    if (deadline === null) {
        return <span className="text-ink/40">—</span>;
    }

    if (!pending) {
        return (
            <span
                className={`font-mono text-[11px] ${late ? 'text-warning' : 'text-ink/60'}`}
            >
                {new Date(deadline).toLocaleDateString('ar-SA')}
            </span>
        );
    }

    if (minutes === null) {
        return <span className="font-mono text-[11px] text-ink/60">—</span>;
    }

    if (minutes <= 0) {
        return <Badge tone="danger">انتهت المهلة</Badge>;
    }

    const hours = Math.floor(minutes / 60);
    const urgent = minutes < 120;

    return (
        <span
            className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${urgent ? 'text-danger' : 'text-ink'}`}
        >
            <Clock className="h-3 w-3" aria-hidden="true" />
            {hours > 0 ? `${hours} س ${minutes % 60} د` : `${minutes} د`}
        </span>
    );
}
