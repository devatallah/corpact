import { Head, Link } from '@inertiajs/react';
import { Ban, Landmark, Scale } from 'lucide-react';
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
    Note,
    PageHeader,
    StatCard,
    Tbody,
    Td,
    Th,
    Thead,
    TableShell,
    Tr,
} from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §12.7 — the provider's own statements.
 *
 * The payout gate is spelled out rather than implied: a statement can be
 * approved and still unpayable because the bank details are not approved, and
 * a provider chasing a late transfer needs to see which of the two it is.
 */
type Statement = {
    id: number;
    period_key: string;
    period_start: string | null;
    period_end: string | null;
    status: string;
    items_count: number;
    gross_amount: string;
    commission_amount: string;
    net_amount: string;
    approved_at: string | null;
    paid_at: string | null;
    payout_reference: string | null;
};

const STATUS: Record<
    string,
    { label: string; tone: 'neutral' | 'success' | 'warning' }
> = {
    draft: { label: 'قيد الإعداد', tone: 'neutral' },
    approved: { label: 'معتمد — بانتظار التحويل', tone: 'warning' },
    paid: { label: 'حُوِّل', tone: 'success' },
};

export default function PartnerSettlements({
    commissionRate,
    statements,
    totals,
    filters,
    sort,
}: {
    commissionRate: number;
    partner: { id: number; name: string };
    statements: Paginated<Statement>;
    totals: {
        paid_net: string;
        approved_net: string;
        draft_net: string;
        unstated_net: string;
        payouts_blocked: boolean;
    };
    filters: { status?: string; search?: string };
    sort: SortState;
}) {
    return (
        <PartnerLayout>
            <Head title="المستحقات" />

            <PageHeader
                icon={Scale}
                title="المستحقات المالية وكشوف التسوية"
                badge="كل 15 يوماً"
                subtitle="تُصدر المنصة كشف تسوية دورياً بالفعاليات المكتملة المنفَّذة في مرافقك."
            />

            {/* ── القواعد الثلاث ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Rule
                    title="بند التسوية عند الاكتمال"
                    body="البند يُنشأ عند اكتمال الفعالية فقط — لا قبل ذلك في أي حال، ولا عند القبول ولا عند الحجز."
                />
                <Rule
                    title="اقتطاع العمولة"
                    body="العمولة تُقتطع من مستحقاتك ولا تُضاف على السعر المعروض للعميل — السعر الذي أعلنته هو الذي يدفعه."
                />
                <Rule
                    title="ثبات الأسعار التاريخية"
                    body="كل بند يحفظ نسخة ثابتة من السعر والعمولة وقت الاحتساب، ولا يتأثر بتعديل ملفك لاحقاً."
                />
            </div>

            <CommissionExample rate={commissionRate} />

            {totals.payouts_blocked && (
                <Note
                    tone="danger"
                    title="التحويل موقوف — الحساب البنكي غير معتمد"
                >
                    كشوفك تُحتسب وتُعتمد كالمعتاد، لكن لا يمكن تنفيذ التحويل قبل
                    اعتماد حسابك البنكي من فريق تيمات. راجع صفحة «الحساب
                    البنكي».
                </Note>
            )}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="حُوِّل إليك"
                    value={totals.paid_net}
                    hint="ريال"
                    tone="success"
                />
                <StatCard
                    label="معتمد بانتظار التحويل"
                    value={totals.approved_net}
                    hint="ريال"
                    tone="warning"
                />
                <StatCard
                    label="قيد الإعداد"
                    value={totals.draft_net}
                    hint="ريال"
                />
                <StatCard
                    label="بنود لم يحن كشفها"
                    value={totals.unstated_net}
                    hint="تدخل الكشف القادم"
                />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث بالفترة أو مرجع التحويل…"
                    />
                    <FilterSelect
                        name="status"
                        label="حالة الكشف"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['draft', 'قيد الإعداد'],
                            ['approved', 'معتمد'],
                            ['paid', 'حُوِّل'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="الفترة"
                                sortKey="period_key"
                                sort={sort}
                                initialDirection="desc"
                            />
                        </Th>
                        <Th>البنود</Th>
                        <Th>الإجمالي</Th>
                        <Th>العمولة</Th>
                        <Th>
                            <SortableHeader
                                label="الصافي"
                                sortKey="net_amount"
                                sort={sort}
                                initialDirection="desc"
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
                        {statements.data.map((statement) => (
                            <Tr key={statement.id}>
                                <Td>
                                    <Link
                                        href={`/partner/settlements/${statement.id}`}
                                        className="font-mono font-extrabold text-ink hover:underline"
                                    >
                                        {statement.period_key}
                                    </Link>
                                    <span className="block font-mono text-[11px] text-ink/45">
                                        {statement.period_start} →{' '}
                                        {statement.period_end}
                                    </span>
                                </Td>
                                <Td className="font-mono text-ink/70">
                                    {statement.items_count}
                                </Td>
                                <Td className="font-mono text-ink/85">
                                    {statement.gross_amount}
                                </Td>
                                <Td className="font-mono text-ink/85">
                                    − {statement.commission_amount}
                                </Td>
                                <Td className="font-mono font-black text-ink">
                                    {statement.net_amount}
                                </Td>
                                <Td>
                                    <Badge
                                        tone={
                                            STATUS[statement.status]?.tone ??
                                            'neutral'
                                        }
                                    >
                                        {STATUS[statement.status]?.label ??
                                            statement.status}
                                    </Badge>
                                    {statement.payout_reference && (
                                        <span
                                            className="mt-1 block font-mono text-[11px] text-ink/45"
                                            dir="ltr"
                                        >
                                            {statement.payout_reference}
                                        </span>
                                    )}
                                    {statement.status === 'approved' &&
                                        totals.payouts_blocked && (
                                            <Badge tone="danger" icon={Ban}>
                                                بانتظار اعتماد الحساب البنكي
                                            </Badge>
                                        )}
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={statements.data.length}
                            colSpan={6}
                            empty="لا توجد كشوف بعد."
                            emptyHint="يُنشأ أول كشف بعد اكتمال أول فترة تسوية فيها فعاليات منتهية."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={statements} />
                    <Pagination page={statements} />
                </div>
            </Card>

            <Note title="كيف يُحسب الصافي؟">
                الصافي = إجمالي الفعاليات المكتملة − عمولة المنصة. العمولة
                تُحتسب على كل بند بنسبة عقدك، ولا تتغيّر بأثر رجعي على بند صدر
                كشفه. <Landmark className="inline h-3 w-3" aria-hidden="true" />
            </Note>
        </PartnerLayout>
    );
}

/** قاعدة واحدة من قواعد التسوية — مكتوبة لأن سوء فهمها يظهر كخصم غير مفهوم. */
function Rule({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-xl border-[0.5px] border-ink/12 bg-page p-3">
            <span className="block text-[11px] font-extrabold text-ink mb-0.5">{title}</span>
            <p className="text-[10px] text-ink/60 leading-relaxed">{body}</p>
        </div>
    );
}

/**
 * نموذج احتساب البند الواحد.
 *
 * The provider's most common misreading is that the commission is added to
 * what the company pays. It is not — it comes out of their own side. One
 * worked example settles that faster than a paragraph.
 */
export function CommissionExample({ rate }: { rate: number }) {
    const gross = 300;
    const commission = Math.round(gross * rate) / 100;

    return (
        <Card padding="p-4" className="space-y-3">
            <h2 className="text-sm font-extrabold text-ink">نموذج احتساب البند الواحد — شفافية كاملة</h2>

            <div className="space-y-1.5">
                <ExampleRow label="قيمة الفعالية شاملة الضريبة (15٪)" value={`${gross.toFixed(2)} ر.س`} />
                <ExampleRow label={`عمولة تيمات (${rate}٪)`} value={`−${commission.toFixed(2)} ر.س`} negative />
                <ExampleRow label="صافي التحويل البنكي إليك" value={`${(gross - commission).toFixed(2)} ر.س`} strong />
            </div>

            <p className="text-[10px] text-ink/50">
                مثال توضيحي بنسبة عقدك على قيمة 300 ر.س — الأرقام الفعلية في بنود كشوفك أدناه.
            </p>
        </Card>
    );
}

function ExampleRow({
    label,
    value,
    negative = false,
    strong = false,
}: {
    label: string;
    value: string;
    negative?: boolean;
    strong?: boolean;
}) {
    return (
        <div
            className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${
                strong ? 'bg-panel' : 'bg-page border-[0.5px] border-ink/10'
            }`}
        >
            <span className={`text-[11px] ${strong ? 'text-white/70' : 'text-ink/65'}`}>{label}</span>
            <span
                className={`font-mono text-xs font-black ${
                    strong ? 'text-lime' : negative ? 'text-danger' : 'text-ink'
                }`}
                dir="ltr"
            >
                {value}
            </span>
        </div>
    );
}
