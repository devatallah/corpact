import { Head } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
import { BackLink, ListStates } from '@/components/list-states';
import {
    Badge,
    Card,
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
import { leagueFormat, leagueStatus } from '@/lib/status';

/**
 * H §10 — تفاصيل البطولة.
 *
 * A knockout has no points table, so `standings` arrives null and the screen
 * says why rather than rendering an empty grid that looks broken.
 */
type MatchRow = {
    id: number;
    round: number | null;
    round_label: string | null;
    match_number: number | null;
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

export default function CompanyLeagueShow({
    league,
    standings,
}: {
    company: { id: number; name: string };
    league: {
        id: number;
        name: string;
        format: string;
        status: string;
        community?: {
            id: number;
            name: string;
            category?: { id: number; name: string } | null;
        } | null;
        departments?: { id: number; name: string }[];
        matches?: MatchRow[];
        creator?: { id: number; name: string } | null;
    };
    standings: StandingRow[] | null;
    unreadNotifications: number;
}) {
    const matches = league.matches ?? [];
    const played = matches.filter((match) => match.status === 'played').length;

    return (
        <CompanyLayout>
            <Head title={league.name} />

            <BackLink href="/company/leagues" label="العودة إلى البطولات" />

            <PageHeader
                icon={Trophy}
                title={league.name}
                subtitle={`${league.community?.name ?? '—'} · ${leagueFormat(league.format)}`}
                actions={
                    <Badge tone={leagueStatus(league.status).tone}>
                        {leagueStatus(league.status).label}
                    </Badge>
                }
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="الإدارات المشاركة"
                    value={league.departments?.length ?? 0}
                />
                <StatCard label="المباريات" value={matches.length} />
                <StatCard label="لُعبت" value={played} tone="success" />
                <StatCard label="متبقية" value={matches.length - played} />
            </div>

            {/* ── الترتيب ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">الترتيب</h2>

                {standings === null ? (
                    <p className="text-xs leading-relaxed text-ink/60">
                        نظام خروج المغلوب لا يُنتج جدول ترتيب — المسار يُقرأ من
                        شجرة المباريات أدناه.
                    </p>
                ) : (
                    <TableShell>
                        <Thead>
                            <Th>#</Th>
                            <Th>الإدارة</Th>
                            <Th>لعب</Th>
                            <Th>فاز</Th>
                            <Th>تعادل</Th>
                            <Th>خسر</Th>
                            <Th>له</Th>
                            <Th>عليه</Th>
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
                                        {row.gf}
                                    </Td>
                                    <Td className="font-mono text-ink/70">
                                        {row.ga}
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
                                colSpan={10}
                                empty="لا إدارات مسجّلة في البطولة."
                                emptyHint="يضيف قائد المجتمع الإدارات المشاركة قبل توليد المباريات."
                            />
                        </Tbody>
                    </TableShell>
                )}
            </Card>

            {/* ── المباريات ── */}
            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">المباريات</h2>

                <TableShell>
                    <Thead>
                        <Th>الجولة</Th>
                        <Th>المباراة</Th>
                        <Th>النتيجة</Th>
                        <Th>الحالة</Th>
                    </Thead>
                    <Tbody>
                        {matches.map((match) => (
                            <Tr key={match.id}>
                                <Td className="whitespace-nowrap text-ink/70">
                                    {match.round_label ??
                                        (match.round
                                            ? `الجولة ${match.round}`
                                            : '—')}
                                    {match.is_third_place && (
                                        <Badge tone="neutral">
                                            تحديد المركز الثالث
                                        </Badge>
                                    )}
                                </Td>
                                <Td className="text-ink/85">
                                    {match.department_a?.name ?? '—'} ×{' '}
                                    {match.department_b?.name ?? '—'}
                                </Td>
                                <Td>
                                    {match.status === 'played' ? (
                                        <span
                                            className="font-mono font-black text-ink"
                                            dir="ltr"
                                        >
                                            {match.score_a} — {match.score_b}
                                            {match.penalty_a !== null &&
                                                match.penalty_b !== null && (
                                                    <span className="text-[11px] font-bold text-ink/60">
                                                        {' '}
                                                        (ركلات {match.penalty_a}
                                                        —{match.penalty_b})
                                                    </span>
                                                )}
                                        </span>
                                    ) : (
                                        <span className="text-ink/40">—</span>
                                    )}
                                </Td>
                                <Td>
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
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={matches.length}
                            colSpan={4}
                            empty="لم تُولَّد المباريات بعد."
                            emptyHint="يولّدها قائد المجتمع بعد اكتمال قائمة الإدارات."
                        />
                    </Tbody>
                </TableShell>
            </Card>
        </CompanyLayout>
    );
}
