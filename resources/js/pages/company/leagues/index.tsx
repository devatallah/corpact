import { Head, Link } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
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
    PageHeader,
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
 * H §10 — بطولات الإدارات (عرض فقط لمسؤول الحساب).
 *
 * Leagues are run by community leaders; the account manager watches them.
 * The format decides what a standings table even means, so it is a column
 * rather than a detail — a knockout has no points table.
 */
export const LEAGUE_FORMAT: Record<string, string> = {
    single_round_robin: 'دوري من دور واحد',
    double_round_robin: 'دوري من دورين',
    knockout: 'خروج المغلوب',
};

export const LEAGUE_STATUS: Record<
    string,
    { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }
> = {
    draft: { label: 'مسودة', tone: 'neutral' },
    active: { label: 'جارية', tone: 'success' },
    completed: { label: 'منتهية', tone: 'neutral' },
    cancelled: { label: 'ملغاة', tone: 'danger' },
};

type LeagueRow = {
    id: number;
    name: string;
    format: string;
    status: string;
    matches_count: number;
    created_at: string | null;
    community?: {
        id: number;
        name: string;
        category?: { id: number; name: string } | null;
    } | null;
    departments?: { id: number; name: string }[];
    creator?: { id: number; name: string } | null;
};

export default function CompanyLeagues({
    leagues,
    filters,
    sort,
}: {
    company: { id: number; name: string };
    leagues: Paginated<LeagueRow>;
    filters: { search?: string; status?: string };
    sort: SortState;
    unreadNotifications: number;
}) {
    return (
        <CompanyLayout>
            <Head title="البطولات" />

            <PageHeader
                icon={Trophy}
                title="بطولات الإدارات"
                subtitle="ينظّمها قادة المجتمعات — تتابع أنت نتائجها ومشاركة الإدارات فيها."
            />

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث باسم البطولة أو المجتمع…"
                    />
                    <FilterSelect
                        name="status"
                        label="الحالة"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['draft', 'مسودة'],
                            ['active', 'جارية'],
                            ['completed', 'منتهية'],
                            ['cancelled', 'ملغاة'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="البطولة"
                                sortKey="name"
                                sort={sort}
                            />
                        </Th>
                        <Th>المجتمع</Th>
                        <Th>
                            <SortableHeader
                                label="النظام"
                                sortKey="format"
                                sort={sort}
                            />
                        </Th>
                        <Th>الإدارات</Th>
                        <Th>
                            <SortableHeader
                                label="المباريات"
                                sortKey="matches_count"
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
                        {leagues.data.map((league) => (
                            <Tr key={league.id}>
                                <Td>
                                    <Link
                                        href={`/company/leagues/${league.id}`}
                                        className="font-extrabold text-ink hover:underline"
                                    >
                                        {league.name}
                                    </Link>
                                    <span className="block text-[11px] text-ink/50">
                                        {league.creator?.name ?? '—'}
                                    </span>
                                </Td>
                                <Td className="text-ink/85">
                                    {league.community?.name ?? '—'}
                                </Td>
                                <Td className="text-ink/85">
                                    {LEAGUE_FORMAT[league.format] ??
                                        league.format}
                                </Td>
                                <Td className="font-mono text-ink/80">
                                    {league.departments?.length ?? 0}
                                </Td>
                                <Td className="font-mono font-bold text-ink">
                                    {league.matches_count}
                                </Td>
                                <Td>
                                    <Badge
                                        tone={
                                            LEAGUE_STATUS[league.status]
                                                ?.tone ?? 'neutral'
                                        }
                                    >
                                        {LEAGUE_STATUS[league.status]?.label ??
                                            league.status}
                                    </Badge>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={leagues.data.length}
                            colSpan={6}
                            empty="لا بطولات بعد."
                            emptyHint="ينشئ البطولة قائد المجتمع من بوابة الموظف، ويختار الإدارات المشاركة."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={leagues} />
                    <Pagination page={leagues} />
                </div>
            </Card>
        </CompanyLayout>
    );
}
