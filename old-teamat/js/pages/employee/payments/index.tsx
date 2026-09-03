import { Head, Link } from '@inertiajs/react';
import { Card, CardTitle, MetaRow, Pill, Screen } from '@/components/employee/ui';
import Pagination from '@/components/pagination';
import { SortBar  } from '@/components/sortable-header';
import type {SortState} from '@/components/sortable-header';
import EmployeeLayout from '@/layouts/employee-layout';
import { fmtDate } from '@/lib/utils';
import type { PaymentIntent, Event, Community, PaginatedResult } from '@/types/models';

interface Props {
    intents: PaginatedResult<PaymentIntent & { event?: Event & { community?: Community } }>;
    sort?: SortState;
}

type Tone = 'lime' | 'success' | 'warning' | 'danger' | 'neutral';

const STATUS_LABELS: Record<string, { label: string; tone: Tone }> = {
    pending: { label: 'بانتظار الدفع', tone: 'warning' },
    paid: { label: 'مدفوعة', tone: 'success' },
    expired: { label: 'انتهت المهلة', tone: 'danger' },
    cancelled: { label: 'أُلغيت', tone: 'neutral' },
    refunded: { label: 'مُردّة', tone: 'neutral' },
};

const sortOptions = [
    { key: 'created_at', label: 'الأحدث', initialDirection: 'desc' as const },
    { key: 'amount', label: 'المبلغ', initialDirection: 'desc' as const },
    { key: 'status', label: 'الحالة', initialDirection: 'asc' as const },
];

/**
 * سجل مدفوعات الموظف (A10 — H §12.3): كل مطالبة بحصتها وحالتها — لا محفظة
 * نقدية داخل المنصة، وكل استرداد يعود لوسيلة الدفع الأصلية.
 */
export default function PaymentsIndex({ intents, sort }: Props) {
    const items = intents?.data ?? [];

    return (
        <EmployeeLayout>
            <Head title="مدفوعاتي" />

            <Screen>
                <div>
                    <h1 className="text-lg font-black text-[#0A0A0A]">مدفوعاتي</h1>
                    <p className="text-[11px] text-[#0A0A0A]/55 mt-0.5">
                        كل مطالبة بحصتها وحالتها — كل استرداد يعود لوسيلة الدفع الأصلية.
                    </p>
                </div>

                {/* H §18: ترتيب ظاهر لكل قائمة */}
                <SortBar sort={sort} options={sortOptions} />

                {items.length === 0 ? (
                    <Card>
                        <p className="text-[11px] text-[#0A0A0A]/55 text-center py-4">
                            لا مدفوعات بعد — تصلك مطالبة الدفع عند إغلاق تسجيل فعالية انضممت إليها.
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-2.5">
                        {items.map((intent) => {
                            const status = STATUS_LABELS[intent.status] ?? STATUS_LABELS.pending;

                            return (
                                <Link key={intent.id} href={`/employee/payments/${intent.id}`} className="block">
                                    <Card interactive>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <CardTitle>
                                                    {intent.event?.title || intent.event?.community?.name || `فعالية #${intent.event_id}`}
                                                </CardTitle>
                                            </div>
                                            <Pill tone={status.tone}>{status.label}</Pill>
                                        </div>

                                        <MetaRow
                                            left={
                                                <>
                                                    {intent.event ? fmtDate(intent.event.event_date) : ''}
                                                    {intent.refund_status === 'refunded' && ' · رُدّ المبلغ لوسيلة الدفع الأصلية'}
                                                </>
                                            }
                                            right={`${Number(intent.amount).toLocaleString()} ر.س`}
                                        />
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {intents?.links && <Pagination links={intents.links} />}
            </Screen>
        </EmployeeLayout>
    );
}
