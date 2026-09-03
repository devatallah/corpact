import { Head, Link, router } from '@inertiajs/react';
import { Compass, Plus } from 'lucide-react';
import {
    Pagination,
    ResultCount,
    SearchInput,
    SortableHeader,
    Toolbar,
} from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import {
    Badge,
    Button,
    ButtonLink,
    Card,
    PageHeader,
} from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §6 — استكشاف المجتمعات.
 *
 * Every community in the employee's company, whether they belong to it or
 * not. `is_member` is what decides the button, so a member sees "افتح" and a
 * non-member sees "انضم" — no ambiguous card that does one of two things.
 */
type Community = {
    id: number;
    name: string;
    description: string | null;
    members_count: number;
    is_member: boolean;
    category?: { id: number; name: string } | null;
    leader?: { id: number; name: string } | null;
};

export default function EmployeeExplore({
    communities,
    filters,
    sort,
}: {
    communities: Paginated<Community>;
    filters: { search?: string };
    sort: SortState;
}) {
    return (
        <EmployeeLayout>
            <Head title="اكتشف" />

            <PageHeader
                icon={Compass}
                title="اكتشف المجتمعات"
                subtitle="كل مجتمعات شركتك — انضم لما يناسبك."
                actions={
                    <ButtonLink
                        href="/employee/community-requests"
                        tone="soft"
                        icon={Plus}
                    >
                        اقترح مجتمعاً
                    </ButtonLink>
                }
            />

            <Card padding="p-3">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث باسم المجتمع…"
                    />
                    <div className="flex items-center gap-3 text-[11px] text-ink/55">
                        <SortableHeader
                            label="الاسم"
                            sortKey="name"
                            sort={sort}
                        />
                        <SortableHeader
                            label="الأعضاء"
                            sortKey="members_count"
                            sort={sort}
                        />
                    </div>
                </Toolbar>
            </Card>

            <div className="space-y-3">
                {communities.data.map((community) => (
                    <Card
                        key={community.id}
                        padding="p-4"
                        className="space-y-2"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-extrabold text-ink">
                                    {community.name}
                                </h2>
                                <span className="block text-[11px] text-ink/55">
                                    {community.category?.name ?? 'بلا فئة'}
                                </span>
                            </div>
                            {community.is_member && (
                                <Badge tone="success">عضو</Badge>
                            )}
                        </div>

                        {community.description && (
                            <p className="line-clamp-2 text-[11px] leading-relaxed text-ink/60">
                                {community.description}
                            </p>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1">
                            <span className="font-mono text-[11px] text-ink/60">
                                {community.members_count} عضواً
                                {community.leader && (
                                    <span className="text-ink/45">
                                        {' '}
                                        · {community.leader.name}
                                    </span>
                                )}
                            </span>

                            {community.is_member ? (
                                <Link
                                    href={`/employee/community/${community.id}`}
                                    className="text-xs font-bold text-ink hover:underline"
                                >
                                    افتح المجتمع ←
                                </Link>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            `/employee/community/${community.id}/join`,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    انضم
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}

                <ListStates
                    count={communities.data.length}
                    empty="لا مجتمعات مطابقة."
                    emptyHint="إن لم تجد ما يناسبك، اقترح مجتمعاً جديداً على مسؤول الحساب."
                />
            </div>

            <Card
                padding="p-3"
                className="flex flex-wrap items-center justify-between gap-3"
            >
                <ResultCount page={communities} />
                <Pagination page={communities} />
            </Card>
        </EmployeeLayout>
    );
}
