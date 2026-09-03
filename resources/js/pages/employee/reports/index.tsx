import { Head, router } from '@inertiajs/react';
import { Award, ChartColumn, TriangleAlert } from 'lucide-react';
import { ListStates } from '@/components/list-states';
import {
    Badge,
    Card,
    Note,
    PageHeader,
    StatCard,
} from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';

/**
 * H §18 — بطاقة إنجازي.
 *
 * "Activated" is the platform's own word for the employee's participation and
 * it has a precise meaning — attended at least one completed event in the
 * cycle without being marked absent — so the card spells it out rather than
 * showing a green tick the reader has to interpret.
 *
 * The absence record is shown to the employee themselves, with reasons. They
 * are the person most entitled to see it and most able to dispute it.
 */
type Achievement = {
    period: { key: string; label: string };
    attended_events: number;
    activated: boolean;
    absences_this_period: number;
    absence_record: {
        event_id: number;
        event_title: string;
        completed_at: string | null;
        reason: string | null;
    }[];
};

export default function EmployeeReports({
    activityLog,
    myStats,
    achievements,
    budget,
    categories,
    currentFilter,
}: {
    employee: { id: number; name: string };
    activityLog: {
        activity_name: string;
        event_date: string;
        start_time: string;
        duration_minutes: number;
        participants_count: number;
        company_subsidy: number | string;
        category_icon: string | null;
        category_name: string;
        partner_name: string;
    }[];
    myStats: {
        total_activities: number;
        total_hours: number;
        events_this_month: number;
        favorite_activity: string | null;
        unique_people: number;
        longest_streak: number;
        community_rank: number | null;
    };
    achievements: Achievement;
    budget: {
        total_used: number;
        this_month_used: number;
        breakdown: { category_name: string; amount: number }[];
        renewal_date: string | null;
    };
    categories: { id: number; name: string }[];
    currentFilter: string | null;
}) {
    return (
        <EmployeeLayout>
            <Head title="نشاطي" />

            <PageHeader
                icon={ChartColumn}
                title="نشاطي"
                subtitle="ما شاركت فيه، وما دعمته شركتك."
            />

            {/* ── بطاقة الإنجاز ── */}
            <Card padding="p-4" className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Award
                            className="h-4 w-4 text-ink"
                            aria-hidden="true"
                        />
                        <h2 className="text-sm font-extrabold text-ink">
                            إنجازي — {achievements.period.label}
                        </h2>
                    </div>
                    <Badge
                        tone={achievements.activated ? 'success' : 'warning'}
                    >
                        {achievements.activated
                            ? 'مفعَّل هذه الدورة'
                            : 'غير مفعَّل بعد'}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        label="فعاليات حضرتها"
                        value={achievements.attended_events}
                        tone="success"
                    />
                    <StatCard
                        label="غيابات هذه الدورة"
                        value={achievements.absences_this_period}
                        tone={
                            achievements.absences_this_period > 0
                                ? 'warning'
                                : 'success'
                        }
                    />
                </div>

                <Note title="ماذا يعني «مفعَّل»؟">
                    أن تحضر فعالية مكتملة واحدة على الأقل في هذه الدورة دون أن
                    تُسجَّل غائباً. هذا ما تُحتسب به مشاركتك في تقارير شركتك.
                </Note>
            </Card>

            {/* ── سجل الغياب ── */}
            {achievements.absence_record.length > 0 && (
                <Card padding="p-4" className="space-y-2">
                    <div className="flex items-center gap-2">
                        <TriangleAlert
                            className="h-4 w-4 text-warning"
                            aria-hidden="true"
                        />
                        <h2 className="text-sm font-extrabold text-ink">
                            غياباتك المسجّلة
                        </h2>
                    </div>

                    {achievements.absence_record.map((absence) => (
                        <div
                            key={absence.event_id}
                            className="rounded-xl border-[0.5px] border-warning/25 bg-warning-tint p-3"
                        >
                            <span className="block text-[11px] font-bold text-ink">
                                {absence.event_title}
                            </span>
                            <span className="block font-mono text-[10px] text-ink/55">
                                {absence.completed_at
                                    ? new Date(
                                          absence.completed_at,
                                      ).toLocaleDateString('ar-SA')
                                    : '—'}
                            </span>
                            {absence.reason && (
                                <span className="mt-1 block text-[11px] text-warning">
                                    {absence.reason}
                                </span>
                            )}
                        </div>
                    ))}

                    <p className="text-[10px] text-ink/50">
                        إن كان تسجيل غياب غير صحيح، راجع قائد المجتمع — التصحيح
                        ممكن خلال نافذة محدودة بعد الفعالية.
                    </p>
                </Card>
            )}

            {/* ── أرقامي ── */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    label="إجمالي المشاركات"
                    value={myStats.total_activities}
                />
                <StatCard label="ساعات النشاط" value={myStats.total_hours} />
                <StatCard label="هذا الشهر" value={myStats.events_this_month} />
                <StatCard
                    label="أطول تتابع"
                    value={myStats.longest_streak}
                    hint="أسابيع متتالية"
                />
                <StatCard
                    label="زملاء التقيتهم"
                    value={myStats.unique_people}
                />
                <StatCard
                    label="نشاطك المفضل"
                    value={myStats.favorite_activity ?? '—'}
                />
            </div>

            {/* ── ما دعمته الشركة ── */}
            <Card padding="p-4" className="space-y-3">
                <h2 className="text-sm font-extrabold text-ink">
                    ما دعمته شركتك
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        label="هذا الشهر"
                        value={budget.this_month_used.toFixed(2)}
                        hint="ريال"
                    />
                    <StatCard
                        label="الإجمالي"
                        value={budget.total_used.toFixed(2)}
                        hint="ريال"
                    />
                </div>

                <div className="space-y-1.5">
                    {budget.breakdown.map((row) => (
                        <div
                            key={row.category_name}
                            className="flex items-center justify-between gap-2 text-[11px]"
                        >
                            <span className="text-ink/70">
                                {row.category_name}
                            </span>
                            <span className="font-mono font-bold text-ink">
                                {Number(row.amount).toFixed(2)}
                            </span>
                        </div>
                    ))}
                    <ListStates
                        count={budget.breakdown.length}
                        empty="لا دعم مسجَّل بعد."
                    />
                </div>
            </Card>

            {/* ── سجل النشاط ── */}
            <Card padding="p-4" className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-extrabold text-ink">
                        سجل نشاطي
                    </h2>
                    <select
                        aria-label="تصفية حسب الفئة"
                        className="rounded-full border-[0.5px] border-ink/20 bg-surface px-3 py-1.5 text-[11px] font-bold text-ink"
                        value={currentFilter ?? ''}
                        onChange={(event) =>
                            router.get(
                                '/employee/reports',
                                event.target.value
                                    ? { category: event.target.value }
                                    : {},
                                {
                                    preserveState: true,
                                    replace: true,
                                },
                            )
                        }
                    >
                        <option value="">كل الفئات</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    {activityLog.map((row, index) => (
                        <div
                            key={`${row.event_date}-${index}`}
                            className="rounded-xl border-[0.5px] border-ink/12 bg-page p-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-extrabold text-ink">
                                    {row.activity_name}
                                </span>
                                <span className="shrink-0 font-mono text-[11px] font-bold text-ink">
                                    {Number(row.company_subsidy).toFixed(2)} ر.س
                                </span>
                            </div>
                            <span className="mt-0.5 block font-mono text-[11px] text-ink/55">
                                {row.event_date} · {row.start_time?.slice(0, 5)}{' '}
                                · {row.duration_minutes} د ·{' '}
                                {row.participants_count} مشاركاً
                            </span>
                        </div>
                    ))}

                    <ListStates
                        count={activityLog.length}
                        empty="لا مشاركات مسجّلة."
                        emptyHint="انضم إلى فعالية من مجتمعاتك — يظهر سجلك هنا بعد اكتمالها."
                    />
                </div>
            </Card>
        </EmployeeLayout>
    );
}
