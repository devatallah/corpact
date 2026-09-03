import { Head, Link } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
import { Pagination, ResultCount, SortableHeader } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge } from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §12.3 — the employee's own collection history.
 *
 * Every row is money this employee was asked for: what it was for, what state
 * the claim reached, and — while it is still pending — the way back to paying
 * it before the deadline drops the seat.
 */
type Intent = {
    id: number;
    amount: string;
    base_amount: string;
    vat_amount: string;
    status: string;
    expires_at: string | null;
    paid_at: string | null;
    created_at: string | null;
    event?: { id: number; title: string; event_date: string | null; start_time: string | null; community?: { id: number; name: string } | null } | null;
};

const STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
    pending: { label: 'بانتظار السداد', tone: 'warning' },
    paid: { label: 'مسدَّدة', tone: 'success' },
    expired: { label: 'انتهت المهلة', tone: 'danger' },
    failed: { label: 'فشل الدفع', tone: 'danger' },
    refunded: { label: 'مستردة', tone: 'neutral' },
    cancelled: { label: 'ملغاة', tone: 'neutral' },
};

export default function EmployeePayments({ intents, sort }: { intents: Paginated<Intent>; sort: SortState }) {
    return (
        <EmployeeLayout>
            <Head title="مدفوعاتي" />

            <div className="flex items-center justify-between px-1">
                <h1 className="text-sm font-black text-ink flex items-center gap-1.5">
                    <Receipt className="w-4 h-4" aria-hidden="true" />
                    <span>مدفوعاتي</span>
                </h1>
                <SortableHeader label="الأحدث" sortKey="created_at" sort={sort} initialDirection="desc" />
            </div>

            <div className="space-y-2.5">
                {intents.data.map((intent) => {
                    const state = STATUS[intent.status] ?? { label: intent.status, tone: 'neutral' as const };
                    const payable = intent.status === 'pending';

                    const row = (
                        <>
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="text-[11px] text-ink/60 mb-0.5 truncate">
                                        {intent.event?.community?.name ?? '—'}
                                    </div>
                                    <h2 className="text-xs font-black text-ink leading-snug">{intent.event?.title ?? 'فعالية محذوفة'}</h2>
                                </div>
                                <Badge tone={state.tone}>{state.label}</Badge>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t-[0.5px] border-ink/10">
                                <span className="font-mono text-[11px] text-ink/60">
                                    {intent.event?.event_date ?? '—'} · {intent.event?.start_time ?? '—'}
                                </span>
                                <span className="font-mono font-black text-ink">
                                    {intent.amount} <span className="text-[10px] font-normal opacity-70">ر.س</span>
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-ink/50">
                                <span>
                                    الأساس {intent.base_amount} · الضريبة {intent.vat_amount}
                                </span>
                                {payable && <span className="font-bold text-ink">أكمل السداد ←</span>}
                            </div>
                        </>
                    );

                    return payable ? (
                        <Link
                            key={intent.id}
                            href={`/employee/payments/${intent.id}`}
                            className="block p-3.5 bg-surface rounded-2xl border-[0.5px] border-ink/15 hover:border-ink/30 transition-colors space-y-2"
                        >
                            {row}
                        </Link>
                    ) : (
                        <div key={intent.id} className="p-3.5 bg-surface rounded-2xl border-[0.5px] border-ink/15 space-y-2">
                            {row}
                        </div>
                    );
                })}

                {intents.data.length === 0 && (
                    <div className="bg-surface rounded-2xl border-[0.5px] border-ink/15">
                        <ListStates
                            count={0}
                            empty="لا توجد مدفوعات بعد."
                            emptyHint="تظهر هنا حصتك في أي فعالية تختار شركتك فيها مسار دفع الموظف."
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap px-1">
                <ResultCount page={intents} />
                <Pagination page={intents} />
            </div>
        </EmployeeLayout>
    );
}
