import { Head, Link } from '@inertiajs/react';
import { Compass, UsersRound } from 'lucide-react';
import { ListStates } from '@/components/list-states';
import { Badge, ButtonLink, Card, PageHeader } from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';

/**
 * H §6 — مجتمعاتي.
 *
 * The employee's own communities, as cards rather than a table: this portal
 * is phone-first, and a five-column table on a 390px screen is a horizontal
 * scroll nobody performs.
 *
 * Who leads a community changes what can be done inside it, so the leader is
 * named on the card rather than discovered after tapping in.
 */
type Community = {
    id: number;
    name: string;
    description: string | null;
    members_count: number;
    events_count: number;
    category?: { id: number; name: string; icon?: string | null } | null;
    leader?: { id: number; name: string } | null;
};

export default function EmployeeCommunities({
    communities,
}: {
    communities: Community[];
}) {
    return (
        <EmployeeLayout>
            <Head title="مجتمعاتي" />

            <PageHeader
                icon={UsersRound}
                title="مجتمعاتي"
                subtitle="المجتمعات التي انضممتَ إليها."
                actions={
                    <ButtonLink
                        href="/employee/explore"
                        tone="soft"
                        icon={Compass}
                    >
                        اكتشف المزيد
                    </ButtonLink>
                }
            />

            <div className="space-y-3">
                {communities.map((community) => (
                    <Link
                        key={community.id}
                        href={`/employee/community/${community.id}`}
                        className="block"
                    >
                        <Card
                            padding="p-4"
                            className="space-y-2 transition-colors hover:border-ink/30"
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
                                {community.leader && (
                                    <Badge tone="lime">
                                        قائده: {community.leader.name}
                                    </Badge>
                                )}
                            </div>

                            {community.description && (
                                <p className="line-clamp-2 text-[11px] leading-relaxed text-ink/60">
                                    {community.description}
                                </p>
                            )}

                            <div className="flex items-center gap-3 pt-1 font-mono text-[11px] text-ink/60">
                                <span>{community.members_count} عضواً</span>
                                <span className="text-ink/20">·</span>
                                <span>
                                    {community.events_count} فعالية جارية
                                </span>
                            </div>
                        </Card>
                    </Link>
                ))}

                <ListStates
                    count={communities.length}
                    empty="لم تنضم إلى مجتمع بعد."
                    emptyHint="تصفّح مجتمعات شركتك وانضم إلى ما يناسبك — أو اقترح مجتمعاً جديداً."
                />
            </div>
        </EmployeeLayout>
    );
}
