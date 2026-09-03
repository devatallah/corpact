import { Head, Link } from '@inertiajs/react';
import { Ghost, TrendingDown, TrendingUp } from 'lucide-react';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Card, Note, PageHeader, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §13 — مراقبة الفعالية الشبح.
 *
 * A "ghost event" is one that completed on paper without happening: nobody
 * reviewed the roll, or the attendance was rewritten afterwards, or an admin
 * moved the state by hand. None of those is proof on its own — the signal is
 * the *jump* against the preceding weeks, which is why every rate here is
 * shown next to its own baseline rather than against a fixed threshold.
 */
type Week = {
    label: string;
    completed_events: number;
    post_completion_edited_events: number;
    post_completion_edit_rate: number;
    events_created: number;
    manual_state_change_events: number;
    manual_state_change_rate: number;
    locked_without_review: number;
    locked_without_review_rate: number;
};

type ManualChange = {
    id: number;
    event_id: number;
    event_title: string;
    company_name: string;
    from_status: string | null;
    to_status: string;
    reason: string | null;
    created_at: string;
};

export default function GhostEvents({
    weeks,
    latest,
    baseline,
    companyId,
    companies,
    recentManualChanges,
    filters,
    sort,
}: {
    weeks: Week[];
    latest: Week;
    baseline: { post_completion_edit_rate: number; manual_state_change_rate: number; locked_without_review_rate: number };
    companyId: number | null;
    companies: { id: number; name: string }[];
    recentManualChanges: Paginated<ManualChange>;
    filters: { search?: string };
    sort: SortState;
}) {
    return (
        <AdminLayout>
            <Head title="مراقبة الفعاليات الشبح" />

            <PageHeader
                icon={Ghost}
                title="مراقبة الفعالية الشبح"
                subtitle="فعالية اكتملت على الورق دون أن تقع فعلاً. المؤشر ليس الرقم المطلق بل قفزته عن أسابيعه السابقة."
            />

            <Toolbar>
                <FilterSelect
                    name="company_id"
                    label="الشركة"
                    value={companyId === null ? '' : String(companyId)}
                    options={[['', 'كل الشركات'], ...companies.map((company): [string, string] => [String(company.id), company.name])]}
                />
            </Toolbar>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Indicator
                    label="تعديل الحضور بعد الاكتمال"
                    rate={latest.post_completion_edit_rate}
                    base={baseline.post_completion_edit_rate}
                    detail={`${latest.post_completion_edited_events} من ${latest.completed_events} مكتملة`}
                />
                <Indicator
                    label="تدخّل يدوي في الحالة"
                    rate={latest.manual_state_change_rate}
                    base={baseline.manual_state_change_rate}
                    detail={`${latest.manual_state_change_events} من ${latest.events_created} فعالية`}
                />
                <Indicator
                    label="أُقفلت بلا مراجعة"
                    rate={latest.locked_without_review_rate}
                    base={baseline.locked_without_review_rate}
                    detail={`${latest.locked_without_review} فعالية`}
                />
            </div>

            {/* ── الاتجاه الأسبوعي ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">الاتجاه الأسبوعي</h2>

                <TableShell>
                    <Thead>
                        <Th>الأسبوع</Th>
                        <Th>مكتملة</Th>
                        <Th>تعديل بعد الاكتمال</Th>
                        <Th>تدخّل يدوي</Th>
                        <Th>بلا مراجعة</Th>
                    </Thead>
                    <Tbody>
                        {weeks.map((week) => (
                            <Tr key={week.label}>
                                <Td className="font-mono text-[11px] text-ink/80">{week.label}</Td>
                                <Td className="font-mono font-bold text-ink">{week.completed_events}</Td>
                                <Td>
                                    <Rate value={week.post_completion_edit_rate} count={week.post_completion_edited_events} />
                                </Td>
                                <Td>
                                    <Rate value={week.manual_state_change_rate} count={week.manual_state_change_events} />
                                </Td>
                                <Td>
                                    <Rate value={week.locked_without_review_rate} count={week.locked_without_review} />
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </TableShell>
            </Card>

            {/* ── التدخلات اليدوية بأسبابها ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">التدخلات اليدوية بأسبابها</h2>

                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالفعالية أو الشركة أو السبب…" />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="الوقت" sortKey="created_at" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="الفعالية" sortKey="event_title" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="الشركة" sortKey="company_name" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="الانتقال" sortKey="to_status" sort={sort} />
                        </Th>
                        <Th>السبب</Th>
                    </Thead>
                    <Tbody>
                        {recentManualChanges.data.map((change) => (
                            <Tr key={change.id}>
                                <Td className="font-mono text-[11px] text-ink/70 whitespace-nowrap">
                                    {new Date(change.created_at).toLocaleString('ar-SA')}
                                </Td>
                                <Td>
                                    <Link
                                        href={`/admin/support-console/events/${change.event_id}`}
                                        className="font-extrabold text-ink hover:underline"
                                    >
                                        {change.event_title}
                                    </Link>
                                </Td>
                                <Td className="text-ink/85">{change.company_name || '—'}</Td>
                                <Td className="font-mono text-[11px]">
                                    <span className="text-ink/55">{change.from_status ?? '—'}</span>
                                    <span className="text-ink/30"> → </span>
                                    <span className="font-bold text-ink">{change.to_status}</span>
                                </Td>
                                <Td className="text-ink/70 max-w-xs text-[11px]">{change.reason ?? '—'}</Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={recentManualChanges.data.length}
                            colSpan={5}
                            empty="لا تدخلات يدوية."
                            emptyHint="الدورة تعمل تلقائياً بالكامل — وهذه هي الحالة المرجوّة."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={recentManualChanges} />
                    <Pagination page={recentManualChanges} />
                </div>
            </Card>

            <Note title="كيف تُقرأ هذه الشاشة؟">
                لا يوجد رقم «صحيح» هنا. المؤشر المرتفع مع خط أساس مرتفع قد يكون طبيعة تشغيل شركة، والمؤشر المنخفض الذي قفز عن
                أسابيعه فجأة هو ما يستحق السؤال. ابدأ من السبب المكتوب في التدخل اليدوي.
            </Note>
        </AdminLayout>
    );
}

function Rate({ value, count }: { value: number; count: number }) {
    return (
        <span className="font-mono text-ink/85">
            {value}٪ <span className="text-[11px] text-ink/45">({count})</span>
        </span>
    );
}

/** A rate against its own baseline — the jump is the signal, not the level. */
function Indicator({ label, rate, base, detail }: { label: string; rate: number; base: number; detail: string }) {
    const delta = Math.round((rate - base) * 10) / 10;
    const worse = delta > 0;

    return (
        <Card className="space-y-2">
            <span className="text-xs font-bold text-ink block">{label}</span>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-ink">{rate}٪</span>
                <span className={`text-[11px] font-bold flex items-center gap-0.5 ${worse ? 'text-danger' : 'text-success'}`}>
                    {worse ? <TrendingUp className="w-3 h-3" aria-hidden="true" /> : <TrendingDown className="w-3 h-3" aria-hidden="true" />}
                    {delta > 0 ? '+' : ''}
                    {delta}
                </span>
            </div>
            <div className="text-[11px] text-ink/55">{detail}</div>
            <div className="text-[11px] text-ink/45 pt-1 border-t-[0.5px] border-ink/10 font-mono">خط الأساس {base}٪</div>
        </Card>
    );
}
