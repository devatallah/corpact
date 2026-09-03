import { Head } from '@inertiajs/react';
import { UsersRound } from 'lucide-react';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, Card, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §16 — المجتمعات عبر كل الشركات.
 *
 * Read-only from here on purpose: a community belongs to its company, and its
 * leaders are appointed by that company's account manager. What Teamat needs
 * from this screen is the health signal — a community with no leader is one
 * that will stop producing events.
 */
type CommunityRow = {
    id: number;
    name: string;
    status: string;
    members_count: number;
    events_count: number;
    leaderless_since: string | null;
    primary_leader?: { id: number; name: string } | null;
    company?: { id: number; name: string } | null;
    category?: { id: number; name: string } | null;
};

export default function AdminCommunities({
    communities,
    totalCommunities,
    companies,
    categories,
    filters,
    sort,
}: {
    communities: Paginated<CommunityRow>;
    totalCommunities: number;
    companies: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    filters: { search?: string; company_id?: string; category_id?: string };
    sort: SortState;
}) {
    const leaderless = communities.data.filter((community) => community.leaderless_since !== null).length;

    return (
        <AdminLayout>
            <Head title="المجتمعات" />

            <PageHeader
                icon={UsersRound}
                title="المجتمعات عبر المنصة"
                subtitle="المجتمع هو وحدة البناء: كيان له قادة ومحفظة وجدول. مجتمع بلا قائد يتوقف عن توليد الفعاليات."
            />

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="إجمالي المجتمعات" value={totalCommunities} />
                <StatCard label="المعروض بعد التصفية" value={communities.total} />
                <StatCard
                    label="بلا قائد في هذه الصفحة"
                    value={leaderless}
                    tone={leaderless > 0 ? 'danger' : 'success'}
                />
            </div>

            {leaderless > 0 && (
                <Note tone="warning" title="مجتمعات بلا قائد">
                    مجتمع بلا قائد لا يجدول فعالياته. نبّه مسؤول الحساب في الشركة لتعيين قائد بديل.
                </Note>
            )}

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث باسم المجتمع…" />
                    <FilterSelect
                        name="company_id"
                        label="الشركة"
                        value={filters.company_id ?? ''}
                        options={[['', 'كل الشركات'], ...companies.map((company): [string, string] => [String(company.id), company.name])]}
                    />
                    <FilterSelect
                        name="category_id"
                        label="النشاط"
                        value={filters.category_id ?? ''}
                        options={[['', 'كل الأنشطة'], ...categories.map((category): [string, string] => [String(category.id), category.name])]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="المجتمع" sortKey="name" sort={sort} />
                        </Th>
                        <Th>الشركة</Th>
                        <Th>النشاط</Th>
                        <Th>القائد الأساسي</Th>
                        <Th>
                            <SortableHeader label="الأعضاء" sortKey="members_count" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="الفعاليات" sortKey="events_count" sort={sort} initialDirection="desc" />
                        </Th>
                    </Thead>

                    <Tbody>
                        {communities.data.map((community) => (
                            <Tr key={community.id}>
                                <Td>
                                    <span className="font-extrabold text-ink block">{community.name}</span>
                                    {community.leaderless_since && <Badge tone="danger">بلا قائد</Badge>}
                                </Td>
                                <Td className="text-ink/85">{community.company?.name ?? '—'}</Td>
                                <Td className="text-ink/85">{community.category?.name ?? '—'}</Td>
                                <Td className="text-ink/85">{community.primary_leader?.name ?? '—'}</Td>
                                <Td className="font-mono font-bold text-ink">{community.members_count}</Td>
                                <Td className="font-mono font-bold text-ink">{community.events_count}</Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={communities.data.length}
                            colSpan={6}
                            empty="لا توجد مجتمعات مطابقة."
                            emptyHint="جرّب تغيير الشركة أو النشاط أو مصطلح البحث."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={communities} />
                    <Pagination page={communities} />
                </div>
            </Card>
        </AdminLayout>
    );
}
