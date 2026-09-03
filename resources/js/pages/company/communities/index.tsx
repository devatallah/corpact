import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { CalendarClock, Pencil, Plus, Trash2, UsersRound } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
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
    ButtonLink,
    Card,
    IconButton,
    PageHeader,
    Tbody,
    Td,
    Th,
    Thead,
    TableShell,
    Tr,
} from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §6 — المجتمعات.
 *
 * A community without a leader is a community nobody can run: no one may
 * create its events. The list says so outright rather than leaving an empty
 * cell, because that is the single most common reason a community goes quiet.
 */
type Category = {
    id: number;
    parent_id: number | null;
    name: string;
    icon?: string | null;
    children?: Category[];
};

type Community = {
    id: number;
    name: string;
    description: string | null;
    members_count: number;
    category?: { id: number; name: string } | null;
    leader?: { id: number; name: string } | null;
};

export default function CompanyCommunities({
    communities,
    filters,
    sort,
    categories,
}: {
    company: { id: number; name: string };
    communities: Paginated<Community>;
    filters: { search?: string; category_id?: string | number };
    sort: SortState;
    categories: Category[];
    unreadNotifications: number;
}) {
    const [deleting, setDeleting] = useState<Community | null>(null);

    const leaderless = communities.data.filter(
        (community) => !community.leader,
    ).length;

    return (
        <CompanyLayout>
            <Head title="المجتمعات" />

            <PageHeader
                icon={UsersRound}
                title="المجتمعات"
                subtitle="كل مجتمع يحتاج قائداً وفئة ومحفظة — بدون قائد لا تُنشأ فعاليات."
                actions={
                    <ButtonLink href="/company/communities/create" icon={Plus}>
                        مجتمع جديد
                    </ButtonLink>
                }
            />

            {leaderless > 0 && (
                <Card
                    padding="p-3.5"
                    className="border-warning/30 bg-warning-tint"
                >
                    <p className="text-xs font-bold text-warning">
                        {leaderless} من المجتمعات المعروضة بلا قائد — لن تُنشأ
                        فيها فعاليات حتى تُعيّن قائداً.
                    </p>
                </Card>
            )}

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث باسم المجتمع…"
                    />
                    <FilterSelect
                        name="category_id"
                        label="الفئة"
                        value={String(filters.category_id ?? '')}
                        options={[
                            ['', 'كل الفئات'],
                            ...categories.flatMap((parent) => [
                                [String(parent.id), parent.name] as [
                                    string,
                                    string,
                                ],
                                ...(parent.children ?? []).map(
                                    (child) =>
                                        [
                                            String(child.id),
                                            `— ${child.name}`,
                                        ] as [string, string],
                                ),
                            ]),
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="المجتمع"
                                sortKey="name"
                                sort={sort}
                            />
                        </Th>
                        <Th>الفئة</Th>
                        <Th>القائد الأساسي</Th>
                        <Th>
                            <SortableHeader
                                label="الأعضاء"
                                sortKey="members_count"
                                sort={sort}
                            />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {communities.data.map((community) => (
                            <Tr key={community.id}>
                                <Td>
                                    <Link
                                        href={`/company/communities/${community.id}/edit`}
                                        className="font-extrabold text-ink hover:underline"
                                    >
                                        {community.name}
                                    </Link>
                                    {community.description && (
                                        <span className="block max-w-xs truncate text-[11px] text-ink/50">
                                            {community.description}
                                        </span>
                                    )}
                                </Td>
                                <Td className="text-ink/85">
                                    {community.category?.name ?? '—'}
                                </Td>
                                <Td>
                                    {community.leader ? (
                                        <span className="text-ink/85">
                                            {community.leader.name}
                                        </span>
                                    ) : (
                                        <Badge tone="warning">بلا قائد</Badge>
                                    )}
                                </Td>
                                <Td className="font-mono font-bold text-ink">
                                    {community.members_count}
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Link
                                            href={`/company/communities/${community.id}/templates`}
                                            title="قوالب التكرار"
                                            className="rounded-lg bg-ink/5 p-1.5 text-ink transition-colors hover:bg-ink/10"
                                        >
                                            <CalendarClock
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                        <Link
                                            href={`/company/communities/${community.id}/edit`}
                                            title="تعديل المجتمع"
                                            className="rounded-lg bg-ink/5 p-1.5 text-ink transition-colors hover:bg-ink/10"
                                        >
                                            <Pencil
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                        <IconButton
                                            icon={Trash2}
                                            label="حذف المجتمع"
                                            tone="danger"
                                            onClick={() =>
                                                setDeleting(community)
                                            }
                                        />
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={communities.data.length}
                            colSpan={5}
                            empty="لا مجتمعات بعد."
                            emptyHint="أنشئ أول مجتمع، ثم عيّن له قائداً ووزّع له رصيداً من المحفظة."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={communities} />
                    <Pagination page={communities} />
                </div>
            </Card>

            <ConfirmModal
                open={deleting !== null}
                tone="danger"
                title="حذف المجتمع"
                message="يُحذف المجتمع وعضوياته وقوالب تكراره. الفعاليات المكتملة تبقى في السجل والتقارير، لكن لا يمكن إنشاء فعاليات جديدة تحته."
                details={
                    deleting && (
                        <>
                            <ConfirmRow
                                label="المجتمع"
                                value={deleting.name}
                                strong
                            />
                            <ConfirmRow
                                label="الأعضاء"
                                value={`${deleting.members_count} عضواً يفقدون عضويتهم`}
                            />
                            <ConfirmRow
                                label="القائد"
                                value={deleting.leader?.name ?? 'بلا قائد'}
                            />
                        </>
                    )
                }
                confirmLabel="نعم، احذف المجتمع"
                onConfirm={() => {
                    router.delete(`/company/communities/${deleting?.id}`, {
                        preserveScroll: true,
                    });
                    setDeleting(null);
                }}
                onCancel={() => setDeleting(null)}
            />
        </CompanyLayout>
    );
}
