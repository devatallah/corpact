import { Head, router } from '@inertiajs/react';
import { Medal, Repeat, Target } from 'lucide-react';
import { useState } from 'react';
import { ListStates } from '@/components/list-states';
import { Badge, Card, Note, PageHeader } from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';

/**
 * H §13 — لوحتا الصدارة.
 *
 * Consistency comes first, deliberately: showing up every week is the
 * behaviour the platform wants, and putting the skill board on top would
 * reward the already-athletic and quietly exclude everyone else. Skill is the
 * second tab, per unit of measurement.
 *
 * Every board is scoped to one community of the employee's own company. There
 * is no cross-company comparison anywhere in the product.
 */
type ConsistencyRow = {
    rank: number;
    employee_id?: number;
    department_id?: number;
    name: string | null;
    department_name?: string | null;
    events_count: number;
    points: number;
    members_count?: number;
};

type SkillRow = {
    rank: number;
    employee_id?: number;
    department_id?: number;
    name: string | null;
    department_name?: string | null;
    unit: string;
    unit_label: string;
    best_value: number;
    best_value_formatted: string;
    results_count: number;
};

export default function EmployeeLeaderboards({
    communities,
    community,
    seasons,
    season,
    boards,
    myEmployeeId,
}: {
    communities: { id: number; name: string }[];
    community: { id: number; name: string } | null;
    seasons: {
        id: number;
        name: string;
        starts_on: string;
        ends_on: string;
        status: string;
        is_auto: boolean;
    }[];
    season: {
        id: number;
        name: string;
        starts_on: string;
        ends_on: string;
        status: string;
    } | null;
    boards: {
        archived: boolean;
        units: string[];
        unit: string | null;
        consistency: {
            individual: ConsistencyRow[];
            department: ConsistencyRow[];
        };
        skill: { individual: SkillRow[]; department: SkillRow[] };
    } | null;
    units: {
        key: string;
        label: string;
        kind: string;
        direction: string;
        precision: number;
    }[];
    canManageSeasons: boolean;
    myEmployeeId: number;
}) {
    const [board, setBoard] = useState<'consistency' | 'skill'>('consistency');
    const [level, setLevel] = useState<'individual' | 'department'>(
        'individual',
    );

    if (community === null) {
        return (
            <EmployeeLayout>
                <Head title="لوحات الصدارة" />
                <PageHeader
                    icon={Medal}
                    title="لوحات الصدارة"
                    subtitle="المواظبة والمهارة داخل مجتمعاتك."
                />
                <Card padding="p-8" className="text-center">
                    <p className="mb-1 text-sm font-extrabold text-ink">
                        لا لوحات بعد.
                    </p>
                    <p className="text-xs text-ink/55">
                        انضم إلى مجتمع — تظهر لوحاته هنا فور أول فعالية مكتملة.
                    </p>
                </Card>
            </EmployeeLayout>
        );
    }

    const rows = boards === null ? [] : boards[board][level];

    return (
        <EmployeeLayout>
            <Head title="لوحات الصدارة" />

            <PageHeader
                icon={Medal}
                title="لوحات الصدارة"
                subtitle="المواظبة أولاً — الحضور المنتظم هو ما يُبنى عليه."
                actions={
                    boards?.archived && <Badge tone="neutral">موسم مؤرشف</Badge>
                }
            />

            {/* ── المنتقيات ── */}
            <Card padding="p-3" className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <select
                        aria-label="المجتمع"
                        className="rounded-xl border-[0.5px] border-ink/20 bg-surface px-3 py-2 text-[11px] font-bold text-ink"
                        value={community.id}
                        onChange={(event) =>
                            router.get(
                                '/employee/leaderboards',
                                { community: event.target.value },
                                { preserveState: false },
                            )
                        }
                    >
                        {communities.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="الموسم"
                        className="rounded-xl border-[0.5px] border-ink/20 bg-surface px-3 py-2 text-[11px] font-bold text-ink"
                        value={season?.id ?? ''}
                        onChange={(event) =>
                            router.get(
                                '/employee/leaderboards',
                                {
                                    community: community.id,
                                    season: event.target.value,
                                },
                                { preserveState: false },
                            )
                        }
                    >
                        {seasons.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                                {item.status === 'closed' ? ' (مغلق)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {season && (
                    <span className="block text-center font-mono text-[10px] text-ink/45">
                        {season.starts_on} — {season.ends_on}
                    </span>
                )}
            </Card>

            {/* ── تبديل اللوحة ── */}
            <div className="grid grid-cols-2 gap-2">
                <TabButton
                    active={board === 'consistency'}
                    icon={Repeat}
                    label="المواظبة"
                    onClick={() => setBoard('consistency')}
                />
                <TabButton
                    active={board === 'skill'}
                    icon={Target}
                    label="المهارة"
                    onClick={() => setBoard('skill')}
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <TabButton
                    active={level === 'individual'}
                    label="أفراد"
                    onClick={() => setLevel('individual')}
                    small
                />
                <TabButton
                    active={level === 'department'}
                    label="إدارات"
                    onClick={() => setLevel('department')}
                    small
                />
            </div>

            {board === 'consistency' ? (
                <Note title="كيف تُحتسب المواظبة؟">
                    نقاط عن كل حضور موثَّق في فعالية مكتملة خلال الموسم. لا
                    تُحتسب فعالية سجّلتَ فيها غياباً، ولا فعالية لم تكتمل.
                </Note>
            ) : (
                boards?.unit && (
                    <Note title={`وحدة القياس: ${boards.unit}`}>
                        لوحة المهارة تُقاس بوحدة واحدة في كل مرة — أفضل نتيجة
                        مسجّلة لك في هذا الموسم.
                    </Note>
                )
            )}

            {/* ── الترتيب ── */}
            <div className="space-y-2">
                {rows.map((row) => {
                    const mine =
                        level === 'individual' &&
                        'employee_id' in row &&
                        row.employee_id === myEmployeeId;

                    return (
                        <Card
                            key={`${row.rank}-${row.employee_id ?? row.department_id}`}
                            padding="p-3"
                            className={mine ? 'border-ink/40 bg-lime/12' : ''}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                                        row.rank <= 3
                                            ? 'bg-lime text-ink'
                                            : 'bg-ink/8 text-ink/60'
                                    }`}
                                >
                                    {row.rank}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <span className="block truncate text-xs font-extrabold text-ink">
                                        {row.name ?? row.department_name ?? '—'}
                                        {mine && (
                                            <span className="font-bold text-ink/50">
                                                {' '}
                                                — أنت
                                            </span>
                                        )}
                                    </span>
                                    <span className="block text-[10px] text-ink/50">
                                        {board === 'consistency'
                                            ? `${(row as ConsistencyRow).events_count} حضوراً`
                                            : `${(row as SkillRow).results_count} نتيجة مسجّلة`}
                                    </span>
                                </div>

                                <span className="shrink-0 font-mono text-sm font-black text-ink">
                                    {board === 'consistency'
                                        ? (row as ConsistencyRow).points
                                        : (row as SkillRow)
                                              .best_value_formatted}
                                </span>
                            </div>
                        </Card>
                    );
                })}

                <ListStates
                    count={rows.length}
                    empty={
                        board === 'consistency'
                            ? 'لا حضور موثَّق في هذا الموسم.'
                            : 'لا نتائج مسجّلة في هذا الموسم.'
                    }
                    emptyHint={
                        board === 'consistency'
                            ? 'تظهر اللوحة بعد أول فعالية مكتملة يُسجَّل فيها الحضور.'
                            : 'يسجّل قائد المجتمع نتائج المشاركين بعد الفعالية.'
                    }
                />
            </div>
        </EmployeeLayout>
    );
}

function TabButton({
    active,
    icon: Icon,
    label,
    onClick,
    small = false,
}: {
    active: boolean;
    icon?: typeof Medal;
    label: string;
    onClick: () => void;
    small?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full border-[0.5px] font-bold transition-colors ${
                small ? 'py-1.5 text-[11px]' : 'py-2.5 text-xs'
            } ${active ? 'border-ink bg-ink text-lime' : 'border-ink/15 bg-surface text-ink/65 hover:border-ink/35'}`}
        >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {label}
        </button>
    );
}
