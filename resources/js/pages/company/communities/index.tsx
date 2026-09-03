import { Head, Link, router } from '@inertiajs/react';
import { CalendarClock, Crown, Pencil, Plus, Trash2, UsersRound, Wallet } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, ButtonLink, Card, IconButton, Note, PageHeader } from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §6 — إدارة مجتمعات المنشأة والحوكمة.
 *
 * Cards, not rows. A community is judged on four things at once — who leads
 * it, how many belong, whether it is still running events, and what is left
 * in its wallet — and a table forces the reader to scan across columns to
 * assemble that. The card puts them together.
 *
 * Two states are called out rather than left to inference: a community with
 * no leader (nobody can create its events) and a dormant one (no event inside
 * the measurement window). Both are recoverable, and both are invisible if
 * you only look at member counts.
 */
type Category = { id: number; parent_id: number | null; name: string; icon?: string | null; children?: Category[] };

type Community = {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    members_count: number;
    events_count: number;
    category?: { id: number; name: string; icon?: string | null } | null;
    leader?: { id: number; name: string } | null;
    deputy_leaders?: { id: number; name: string }[];
    wallet?: { id: number; balance: number } | null;
};

export default function CompanyCommunities({
    communities,
    filters,
    sort,
    categories,
    dormantIds,
    dormantWindowDays,
}: {
    company: { id: number; name: string };
    communities: Paginated<Community>;
    filters: { search?: string; category_id?: string | number };
    sort: SortState;
    categories: Category[];
    dormantIds: number[];
    dormantWindowDays: number;
    unreadNotifications: number;
}) {
    const [deleting, setDeleting] = useState<Community | null>(null);
    const dormant = new Set(dormantIds);

    const leaderless = communities.data.filter((community) => !community.leader).length;

    return (
        <CompanyLayout>
            <Head title="المجتمعات" />

            <PageHeader
                icon={UsersRound}
                title="إدارة مجتمعات المنشأة والحوكمة"
                badge={`${communities.total} مجتمعاً`}
                subtitle="تأسيس المجتمعات حول نشاط واحد، وتعيين القادة، ومتابعة النشاط والخمول."
                actions={
                    <ButtonLink href="/company/communities/create" icon={Plus}>
                        إنشاء مجتمع جديد
                    </ButtonLink>
                }
            />

            <Note tone="info" title="قواعد تأسيس المجتمعات">
                المجتمع يؤسَّس حول نشاط واحد ولا يمتد عبر شركتين. العضوية مفتوحة افتراضياً لكافة موظفي المنشأة، ولا يعمل مجتمع بلا
                قائد أساسي.
            </Note>

            <Note tone="warning" title="حوكمة الخمول وانتقال القيادة">
                مجتمع بلا فعالية خلال {dormantWindowDays} يوماً يُعدّ «خاملاً» في التقارير. وانتقال القيادة يدوي دائماً — لا
                يُعيَّن أحد تلقائياً، فالمجتمع يبقى بلا قائد حتى تعيّن غيره.
            </Note>

            {leaderless > 0 && (
                <Card padding="p-3.5" className="border-warning/30 bg-warning-tint">
                    <p className="text-xs font-bold text-warning">
                        {leaderless} من المجتمعات المعروضة بلا قائد — لن تُنشأ فيها فعاليات حتى تعيّن قائداً.
                    </p>
                </Card>
            )}

            <Card padding="p-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث باسم المجتمع…" />
                    <FilterSelect
                        name="category_id"
                        label="الفئة"
                        value={String(filters.category_id ?? '')}
                        options={[
                            ['', 'كل الفئات'],
                            ...categories.flatMap((parent) => [
                                [String(parent.id), parent.name] as [string, string],
                                ...(parent.children ?? []).map((child) => [String(child.id), `— ${child.name}`] as [string, string]),
                            ]),
                        ]}
                    />
                    <div className="flex items-center gap-3 text-[11px] text-ink/55">
                        <SortableHeader label="الاسم" sortKey="name" sort={sort} />
                        <SortableHeader label="الأعضاء" sortKey="members_count" sort={sort} />
                    </div>
                </Toolbar>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {communities.data.map((community) => {
                    const isDormant = dormant.has(community.id);
                    const deputies = community.deputy_leaders ?? [];

                    return (
                        <Card key={community.id} padding="p-4" className="space-y-3">
                            {/* ── الترويسة ── */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 min-w-0">
                                    <span className="text-xl leading-none shrink-0" aria-hidden="true">
                                        {community.icon || community.category?.icon || '👥'}
                                    </span>
                                    <div className="min-w-0">
                                        <Link
                                            href={`/company/communities/${community.id}/edit`}
                                            className="block text-sm font-extrabold text-ink hover:underline truncate"
                                        >
                                            {community.name}
                                        </Link>
                                        <span className="block text-[11px] text-ink/55">{community.category?.name ?? 'بلا فئة'}</span>
                                    </div>
                                </div>

                                {!community.leader ? (
                                    <Badge tone="warning">بلا قائد</Badge>
                                ) : isDormant ? (
                                    <Badge tone="warning">خامل</Badge>
                                ) : (
                                    <Badge tone="success">نشط</Badge>
                                )}
                            </div>

                            {/* ── القيادة ── */}
                            <div className="rounded-xl border-[0.5px] border-ink/10 bg-page p-2.5 space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[10px] text-ink/50 shrink-0">القائد الأساسي:</span>
                                    {community.leader ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-ink">
                                            <Crown className="w-3 h-3 text-lead shrink-0" aria-hidden="true" />
                                            {community.leader.name}
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-bold text-warning">لم يُعيَّن</span>
                                    )}
                                </div>

                                {deputies.length > 0 && (
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        <span className="text-[10px] text-ink/50 shrink-0">النواب:</span>
                                        {deputies.map((deputy) => (
                                            <span key={deputy.id} className="text-[11px] text-ink/75">
                                                {deputy.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── الأرقام ── */}
                            <div className="grid grid-cols-3 gap-2">
                                <Metric label="الأعضاء" value={community.members_count} />
                                <Metric label="الفعاليات" value={community.events_count} />
                                <Metric
                                    label="رصيد المجتمع"
                                    value={Number(community.wallet?.balance ?? 0).toFixed(2)}
                                    suffix="ر.س"
                                    muted={Number(community.wallet?.balance ?? 0) === 0}
                                />
                            </div>

                            {Number(community.wallet?.balance ?? 0) === 0 && (
                                <p className="text-[10px] text-warning font-bold">
                                    بلا رصيد — لا يمكن صرف تكلفة أي فعالية حتى تخصّص له من المحفظة.
                                </p>
                            )}

                            {/* ── الإجراءات ── */}
                            <div className="flex items-center gap-1.5 pt-1 border-t-[0.5px] border-ink/10">
                                <Link
                                    href={`/company/communities/${community.id}/edit`}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-ink/5 hover:bg-ink/10 text-ink transition-colors"
                                >
                                    <Crown className="w-3 h-3" aria-hidden="true" />
                                    نقل القيادة
                                </Link>
                                <Link
                                    href="/company/wallet"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-ink/5 hover:bg-ink/10 text-ink transition-colors"
                                >
                                    <Wallet className="w-3 h-3" aria-hidden="true" />
                                    تخصيص رصيد
                                </Link>
                                <Link
                                    href={`/company/communities/${community.id}/templates`}
                                    title="قوالب التكرار"
                                    className="p-1.5 rounded-lg bg-ink/5 hover:bg-ink/10 text-ink transition-colors ms-auto"
                                >
                                    <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
                                </Link>
                                <Link
                                    href={`/company/communities/${community.id}/edit`}
                                    title="تعديل المجتمع"
                                    className="p-1.5 rounded-lg bg-ink/5 hover:bg-ink/10 text-ink transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                                </Link>
                                <IconButton icon={Trash2} label="حذف المجتمع" tone="danger" onClick={() => setDeleting(community)} />
                            </div>
                        </Card>
                    );
                })}
            </div>

            <ListStates
                count={communities.data.length}
                empty="لا مجتمعات مطابقة."
                emptyHint="أنشئ أول مجتمع، ثم عيّن له قائداً ووزّع له رصيداً من المحفظة."
            />

            <Card padding="p-3" className="flex items-center justify-between gap-3 flex-wrap">
                <ResultCount page={communities} />
                <Pagination page={communities} />
            </Card>

            <ConfirmModal
                open={deleting !== null}
                tone="danger"
                title="حذف المجتمع"
                message="يُحذف المجتمع وعضوياته وقوالب تكراره. الفعاليات المكتملة تبقى في السجل والتقارير، لكن لا يمكن إنشاء فعاليات جديدة تحته."
                details={
                    deleting && (
                        <>
                            <ConfirmRow label="المجتمع" value={deleting.name} strong />
                            <ConfirmRow label="الأعضاء" value={`${deleting.members_count} عضواً يفقدون عضويتهم`} />
                            <ConfirmRow label="القائد" value={deleting.leader?.name ?? 'بلا قائد'} />
                            <ConfirmRow label="رصيد المجتمع" value={`${Number(deleting.wallet?.balance ?? 0).toFixed(2)} ر.س`} strong />
                        </>
                    )
                }
                confirmLabel="نعم، احذف المجتمع"
                onConfirm={() => {
                    router.delete(`/company/communities/${deleting?.id}`, { preserveScroll: true });
                    setDeleting(null);
                }}
                onCancel={() => setDeleting(null)}
            />
        </CompanyLayout>
    );
}

function Metric({ label, value, suffix, muted = false }: { label: string; value: number | string; suffix?: string; muted?: boolean }) {
    return (
        <div className="rounded-xl border-[0.5px] border-ink/10 bg-page px-2.5 py-2 text-center">
            <span className={`block font-mono text-sm font-black ${muted ? 'text-ink/35' : 'text-ink'}`}>{value}</span>
            <span className="block text-[10px] text-ink/50">
                {label}
                {suffix ? ` (${suffix})` : ''}
            </span>
        </div>
    );
}
