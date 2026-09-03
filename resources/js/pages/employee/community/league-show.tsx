import { Head, useForm } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
import { useState } from 'react';
import { BackLink, ListStates } from '@/components/list-states';
import {
    Badge,
    Button,
    Card,
    Field,
    INPUT,
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
import EmployeeLayout from '@/layouts/employee-layout';
import { LEAGUE_FORMAT, LEAGUE_STATUS } from '@/pages/company/leagues/index';

/**
 * H §10 — البطولة كما يراها الموظف.
 *
 * A leader can record results here. In knockout a draw is not a result — the
 * bracket needs someone to advance — so the penalty fields appear as soon as
 * the two scores match, and the form refuses equal penalties. That rule is
 * the server's, mirrored here so the leader isn't bounced back after typing.
 */
type MatchRow = {
    id: number;
    round: number | null;
    round_label: string | null;
    score_a: number | null;
    score_b: number | null;
    penalty_a: number | null;
    penalty_b: number | null;
    is_third_place: boolean;
    status: string;
    department_a?: { id: number; name: string } | null;
    department_b?: { id: number; name: string } | null;
};

type StandingRow = {
    department: { id: number; name: string };
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
    points: number;
};

export default function EmployeeLeagueShow({
    community,
    league,
    standings,
    isLeader,
}: {
    community: {
        id: number;
        name: string;
        category?: { id: number; name: string } | null;
    };
    league: {
        id: number;
        name: string;
        format: string;
        status: string;
        departments?: { id: number; name: string }[];
        matches?: MatchRow[];
        creator?: { id: number; name: string } | null;
    };
    standings: StandingRow[] | null;
    isLeader: boolean;
}) {
    const [recording, setRecording] = useState<MatchRow | null>(null);
    const form = useForm({
        score_a: '',
        score_b: '',
        penalty_a: '',
        penalty_b: '',
    });

    const matches = league.matches ?? [];
    const played = matches.filter((match) => match.status === 'played').length;
    const knockout = league.format === 'knockout';
    const drawn =
        form.data.score_a !== '' && form.data.score_a === form.data.score_b;
    const penaltiesTied =
        drawn &&
        form.data.penalty_a !== '' &&
        form.data.penalty_a === form.data.penalty_b;

    return (
        <EmployeeLayout>
            <Head title={league.name} />

            <BackLink
                href={`/employee/community/${community.id}`}
                label={`العودة إلى ${community.name}`}
            />

            <PageHeader
                icon={Trophy}
                title={league.name}
                subtitle={LEAGUE_FORMAT[league.format] ?? league.format}
                actions={
                    <Badge
                        tone={LEAGUE_STATUS[league.status]?.tone ?? 'neutral'}
                    >
                        {LEAGUE_STATUS[league.status]?.label ?? league.status}
                    </Badge>
                }
            />

            <div className="grid grid-cols-3 gap-3">
                <StatCard
                    label="الإدارات"
                    value={league.departments?.length ?? 0}
                />
                <StatCard label="لُعبت" value={played} tone="success" />
                <StatCard label="متبقية" value={matches.length - played} />
            </div>

            {/* ── الترتيب ── */}
            <Card padding="p-4" className="space-y-3">
                <h2 className="text-sm font-extrabold text-ink">الترتيب</h2>

                {standings === null ? (
                    <p className="text-xs leading-relaxed text-ink/60">
                        خروج المغلوب لا يُنتج جدول ترتيب — المسار يُقرأ من
                        المباريات أدناه.
                    </p>
                ) : (
                    <TableShell>
                        <Thead>
                            <Th>#</Th>
                            <Th>الإدارة</Th>
                            <Th>لعب</Th>
                            <Th>ف</Th>
                            <Th>ت</Th>
                            <Th>خ</Th>
                            <Th>الفارق</Th>
                            <Th>النقاط</Th>
                        </Thead>
                        <Tbody>
                            {standings.map((row, index) => (
                                <Tr key={row.department.id}>
                                    <Td className="font-mono text-ink/50">
                                        {index + 1}
                                    </Td>
                                    <Td className="font-extrabold text-ink">
                                        {row.department.name}
                                    </Td>
                                    <Td className="font-mono text-ink/70">
                                        {row.played}
                                    </Td>
                                    <Td className="font-mono text-ink/70">
                                        {row.won}
                                    </Td>
                                    <Td className="font-mono text-ink/70">
                                        {row.drawn}
                                    </Td>
                                    <Td className="font-mono text-ink/70">
                                        {row.lost}
                                    </Td>
                                    <Td className="font-mono text-ink/70">
                                        {row.gd}
                                    </Td>
                                    <Td className="font-mono font-black text-ink">
                                        {row.points}
                                    </Td>
                                </Tr>
                            ))}
                            <ListStates
                                count={standings.length}
                                colSpan={8}
                                empty="لا إدارات مسجّلة."
                            />
                        </Tbody>
                    </TableShell>
                )}
            </Card>

            {/* ── المباريات ── */}
            <Card padding="p-4" className="space-y-2">
                <h2 className="text-sm font-extrabold text-ink">المباريات</h2>

                {matches.map((match) => (
                    <div
                        key={match.id}
                        className="space-y-1.5 rounded-xl border-[0.5px] border-ink/12 bg-page p-3"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-ink/50">
                                {match.round_label ??
                                    (match.round
                                        ? `الجولة ${match.round}`
                                        : '—')}
                                {match.is_third_place && ' · المركز الثالث'}
                            </span>
                            <Badge
                                tone={
                                    match.status === 'played'
                                        ? 'success'
                                        : 'neutral'
                                }
                            >
                                {match.status === 'played'
                                    ? 'لُعبت'
                                    : 'لم تُلعب'}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-[11px] font-bold text-ink">
                                {match.department_a?.name ?? '—'} ×{' '}
                                {match.department_b?.name ?? '—'}
                            </span>

                            {match.status === 'played' ? (
                                <span
                                    className="shrink-0 font-mono font-black text-ink"
                                    dir="ltr"
                                >
                                    {match.score_a} — {match.score_b}
                                    {match.penalty_a !== null &&
                                        match.penalty_b !== null && (
                                            <span className="text-[10px] font-bold text-ink/55">
                                                {' '}
                                                ({match.penalty_a}-
                                                {match.penalty_b})
                                            </span>
                                        )}
                                </span>
                            ) : (
                                isLeader && (
                                    <Button
                                        type="button"
                                        tone="soft"
                                        onClick={() => {
                                            form.reset();
                                            setRecording(match);
                                        }}
                                    >
                                        سجّل النتيجة
                                    </Button>
                                )
                            )}
                        </div>
                    </div>
                ))}

                <ListStates
                    count={matches.length}
                    empty="لم تُولَّد المباريات بعد."
                    emptyHint="تُولَّد المباريات فور اكتمال قائمة الإدارات."
                />
            </Card>

            {/* ── تسجيل نتيجة ── */}
            {recording && (
                <Card padding="p-4" className="space-y-3 border-ink/30">
                    <h2 className="text-sm font-extrabold text-ink">
                        {recording.department_a?.name ?? '—'} ×{' '}
                        {recording.department_b?.name ?? '—'}
                    </h2>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post(
                                `/employee/community/${community.id}/leagues/${league.id}/matches/${recording.id}/result`,
                                {
                                    preserveScroll: true,
                                    onSuccess: () => setRecording(null),
                                },
                            );
                        }}
                        className="space-y-3"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <Field
                                label={recording.department_a?.name ?? 'الأول'}
                                error={form.errors.score_a}
                                required
                            >
                                <input
                                    type="number"
                                    min="0"
                                    dir="ltr"
                                    className={INPUT}
                                    value={form.data.score_a}
                                    onChange={(event) =>
                                        form.setData(
                                            'score_a',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label={recording.department_b?.name ?? 'الثاني'}
                                error={form.errors.score_b}
                                required
                            >
                                <input
                                    type="number"
                                    min="0"
                                    dir="ltr"
                                    className={INPUT}
                                    value={form.data.score_b}
                                    onChange={(event) =>
                                        form.setData(
                                            'score_b',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </div>

                        {knockout && drawn && (
                            <>
                                <Note
                                    tone="warning"
                                    title="التعادل لا يمرّ في خروج المغلوب"
                                >
                                    الشجرة تحتاج فائزاً — أدخل نتيجة ركلات
                                    الترجيح، ولا يمكن أن تتعادل هي الأخرى.
                                </Note>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field
                                        label="ركلات الأول"
                                        error={form.errors.penalty_a}
                                        required
                                    >
                                        <input
                                            type="number"
                                            min="0"
                                            dir="ltr"
                                            className={INPUT}
                                            value={form.data.penalty_a}
                                            onChange={(event) =>
                                                form.setData(
                                                    'penalty_a',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field
                                        label="ركلات الثاني"
                                        error={form.errors.penalty_b}
                                        required
                                    >
                                        <input
                                            type="number"
                                            min="0"
                                            dir="ltr"
                                            className={INPUT}
                                            value={form.data.penalty_b}
                                            onChange={(event) =>
                                                form.setData(
                                                    'penalty_b',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>

                                {penaltiesTied && (
                                    <p className="text-[11px] font-bold text-danger">
                                        ركلات الترجيح لا يمكن أن تتعادل.
                                    </p>
                                )}
                            </>
                        )}

                        <div className="flex items-center gap-2">
                            <Button
                                type="submit"
                                disabled={
                                    form.processing ||
                                    form.data.score_a === '' ||
                                    form.data.score_b === '' ||
                                    (knockout &&
                                        drawn &&
                                        (form.data.penalty_a === '' ||
                                            form.data.penalty_b === '' ||
                                            penaltiesTied))
                                }
                            >
                                حفظ النتيجة
                            </Button>
                            <Button
                                type="button"
                                tone="soft"
                                onClick={() => setRecording(null)}
                            >
                                إلغاء
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
        </EmployeeLayout>
    );
}
