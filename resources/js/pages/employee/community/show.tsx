import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BarChart3,
    CalendarClock,
    Crown,
    LogOut,
    Megaphone,
    Plus,
    Repeat,
    Trash2,
    Trophy,
    UserPlus,
    UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { Pagination, SortableHeader } from '@/components/list-controls';
import { BackLink, ListStates } from '@/components/list-states';
import { FormActions, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    ButtonLink,
    Card,
    Field,
    INPUT,
    Money,
    Note,
    PageHeader,
    StatCard,
} from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';
import { eventStatus } from '@/lib/status';
import type { Paginated, SortState } from '@/types';

/**
 * H §6 — صفحة المجتمع.
 *
 * One screen serving two very different people. A member reads announcements,
 * sees who else is in, votes in polls and joins events. A leader additionally
 * posts, invites, removes members, runs leagues and recurrence templates.
 *
 * The capability flags come from the server (`canAnnounce`, `canInvite`,
 * `isLeader`, `isPrimaryLeader`) and gate whole sections rather than merely
 * disabling buttons — a control the employee cannot use is a control they
 * should not have to look at.
 *
 * Stepping down is separated from transferring leadership on purpose: the
 * first can leave the community leaderless, the second cannot, and the
 * confirmations say which is which.
 */
type EventRow = {
    id: number;
    title: string | null;
    status: string;
    event_date: string | null;
    start_time: string | null;
    capacity: number | null;
    participants_count: number | null;
    min_participants: number | null;
    total_amount: string | number | null;
    partner?: { id: number; name: string; trade_name?: string | null } | null;
    category?: { id: number; name: string } | null;
};

type Announcement = {
    id: number;
    body: string;
    created_at: string | null;
    can_modify: boolean;
    employee?: { id: number; name: string } | null;
};

type Member = {
    id: number;
    name: string;
    email: string;
    department?: { id: number; name: string } | null;
};

type Poll = {
    id: number;
    question: string;
    status: string;
    expires_at: string | null;
    my_vote: number | null;
    total_votes: number;
    creator?: { id: number; name: string } | null;
    options: { id: number; label: string; votes_count: number }[];
};

type League = {
    id: number;
    name: string;
    format: string;
    status: string;
    matches_count: number;
    departments?: { id: number; name: string }[];
};

export default function EmployeeCommunityShow({
    community,
    events,
    eventsSort,
    announcements,
    members,
    leagues,
    polls,
    canAnnounce,
    canInvite,
    isLeader,
    isPrimaryLeader,
    leaderIds,
    primaryLeaderId,
    invitableEmployees,
}: {
    community: {
        id: number;
        name: string;
        description: string | null;
        category?: { id: number; name: string } | null;
        company?: { id: number; name: string } | null;
        leader?: { id: number; name: string } | null;
    };
    events: Paginated<EventRow>;
    eventsSort: SortState;
    announcements: Announcement[];
    members: Member[];
    leagues: League[];
    polls: Poll[];
    canAnnounce: boolean;
    canInvite: boolean;
    isLeader: boolean;
    isPrimaryLeader: boolean;
    leaderIds: number[];
    primaryLeaderId: number | null;
    invitableEmployees: { id: number; name: string }[];
}) {
    const announceForm = useForm({ body: '' });
    const inviteForm = useForm({ employee_id: '' });
    const transferForm = useForm({ employee_id: '' });

    const [leaving, setLeaving] = useState(false);
    const [steppingDown, setSteppingDown] = useState(false);
    const [transferring, setTransferring] = useState(false);
    const [removingMember, setRemovingMember] = useState<Member | null>(null);
    const [removeReason, setRemoveReason] = useState('');

    return (
        <EmployeeLayout>
            <Head title={community.name} />

            <BackLink href="/employee/community" label="العودة إلى مجتمعاتي" />

            <PageHeader
                icon={UsersRound}
                title={community.name}
                subtitle={community.category?.name ?? 'بلا فئة'}
                actions={
                    isLeader && (
                        <Badge tone="lime">
                            {isPrimaryLeader ? 'قائد أساسي' : 'قائد'}
                        </Badge>
                    )
                }
            />

            {community.description && (
                <Card padding="p-4">
                    <p className="text-xs leading-relaxed text-ink/70">
                        {community.description}
                    </p>
                </Card>
            )}

            <div className="grid grid-cols-3 gap-3">
                <StatCard label="الأعضاء" value={members.length} />
                <StatCard label="الفعاليات" value={events.total} />
                <StatCard label="البطولات" value={leagues.length} />
            </div>

            {/* ── أدوات القائد ── */}
            {isLeader && (
                <Card
                    padding="p-3"
                    className="flex flex-wrap items-center gap-2"
                >
                    <ButtonLink
                        href={`/employee/create?community_id=${community.id}`}
                        icon={Plus}
                    >
                        فعالية جديدة
                    </ButtonLink>
                    <ButtonLink
                        href={`/employee/community/${community.id}/templates`}
                        tone="soft"
                        icon={Repeat}
                    >
                        قوالب التكرار
                    </ButtonLink>
                    <ButtonLink
                        href={`/employee/community/${community.id}/leagues/create`}
                        tone="soft"
                        icon={Trophy}
                    >
                        بطولة جديدة
                    </ButtonLink>
                    <ButtonLink
                        href={`/employee/communities/${community.id}/preferred-providers`}
                        tone="soft"
                    >
                        المرافق المفضّلة
                    </ButtonLink>
                </Card>
            )}

            {/* ── الإعلانات ── */}
            <Card padding="p-4" className="space-y-3">
                <div className="flex items-center gap-2">
                    <Megaphone
                        className="h-4 w-4 text-ink"
                        aria-hidden="true"
                    />
                    <h2 className="text-sm font-extrabold text-ink">
                        الإعلانات
                    </h2>
                </div>

                {canAnnounce && (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            announceForm.post(
                                `/employee/community/${community.id}/announcement`,
                                {
                                    preserveScroll: true,
                                    onSuccess: () => announceForm.reset(),
                                },
                            );
                        }}
                        className="space-y-2"
                    >
                        <textarea
                            rows={2}
                            placeholder="اكتب إعلاناً لأعضاء المجتمع…"
                            className={INPUT}
                            value={announceForm.data.body}
                            onChange={(event) =>
                                announceForm.setData('body', event.target.value)
                            }
                        />
                        {announceForm.errors.body && (
                            <p className="text-[11px] text-danger">
                                {announceForm.errors.body}
                            </p>
                        )}
                        <Button
                            type="submit"
                            disabled={
                                announceForm.processing ||
                                !announceForm.data.body.trim()
                            }
                        >
                            نشر الإعلان
                        </Button>
                    </form>
                )}

                <div className="space-y-2">
                    {announcements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className="rounded-xl border-[0.5px] border-ink/12 bg-page p-3"
                        >
                            <p className="text-[11px] leading-relaxed text-ink/85">
                                {announcement.body}
                            </p>
                            <div className="mt-1.5 flex items-center justify-between gap-2">
                                <span className="text-[10px] text-ink/45">
                                    {announcement.employee?.name ?? '—'} ·{' '}
                                    {announcement.created_at
                                        ? new Date(
                                              announcement.created_at,
                                          ).toLocaleString('ar-SA')
                                        : '—'}
                                </span>
                                {announcement.can_modify && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.delete(
                                                `/employee/community/${community.id}/announcement/${announcement.id}`,
                                                {
                                                    preserveScroll: true,
                                                },
                                            )
                                        }
                                        aria-label="حذف الإعلان"
                                        className="text-danger transition-opacity hover:opacity-70"
                                    >
                                        <Trash2
                                            className="h-3 w-3"
                                            aria-hidden="true"
                                        />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <ListStates
                        count={announcements.length}
                        empty="لا إعلانات بعد."
                    />
                </div>
            </Card>

            {/* ── الفعاليات ── */}
            <Card padding="p-4" className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <CalendarClock
                            className="h-4 w-4 text-ink"
                            aria-hidden="true"
                        />
                        <h2 className="text-sm font-extrabold text-ink">
                            الفعاليات
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-ink/55">
                        <SortableHeader
                            label="الموعد"
                            sortKey="event_date"
                            sort={eventsSort}
                        />
                        <SortableHeader
                            label="المشاركون"
                            sortKey="participants_count"
                            sort={eventsSort}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    {events.data.map((event) => (
                        <Link
                            key={event.id}
                            href={`/employee/detail/${event.id}`}
                            className="block"
                        >
                            <div className="rounded-xl border-[0.5px] border-ink/12 bg-page p-3 transition-colors hover:border-ink/30">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <span className="block truncate text-xs font-extrabold text-ink">
                                            {event.title ||
                                                event.category?.name ||
                                                `فعالية #${event.id}`}
                                        </span>
                                        <span className="block text-[11px] text-ink/55">
                                            {event.partner?.trade_name ||
                                                event.partner?.name ||
                                                '—'}
                                        </span>
                                    </div>
                                    <Badge
                                        tone={eventStatus(event.status).tone}
                                    >
                                        {eventStatus(event.status).label}
                                    </Badge>
                                </div>

                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="font-mono text-[11px] text-ink/60">
                                        {event.event_date ?? '—'} ·{' '}
                                        {event.start_time?.slice(0, 5) ?? ''}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] text-ink/60">
                                            {event.participants_count ?? 0}/
                                            {event.capacity ?? '—'}
                                        </span>
                                        <Money amount={event.total_amount} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    <ListStates
                        count={events.data.length}
                        empty="لا فعاليات في هذا المجتمع بعد."
                        emptyHint={
                            isLeader
                                ? 'أنشئ أول فعالية من الزر أعلاه.'
                                : 'ينشئ الفعاليات قائد المجتمع.'
                        }
                    />
                </div>

                <Pagination page={events} />
            </Card>

            {/* ── التصويتات ── */}
            {polls.length > 0 && (
                <Card padding="p-4" className="space-y-3">
                    <div className="flex items-center gap-2">
                        <BarChart3
                            className="h-4 w-4 text-ink"
                            aria-hidden="true"
                        />
                        <h2 className="text-sm font-extrabold text-ink">
                            التصويتات
                        </h2>
                    </div>

                    {polls.map((poll) => (
                        <div
                            key={poll.id}
                            className="space-y-2 rounded-xl border-[0.5px] border-ink/12 bg-page p-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-extrabold text-ink">
                                    {poll.question}
                                </span>
                                <Badge
                                    tone={
                                        poll.status === 'open'
                                            ? 'lime'
                                            : 'neutral'
                                    }
                                >
                                    {poll.status === 'open' ? 'مفتوح' : 'مغلق'}
                                </Badge>
                            </div>

                            <div className="space-y-1.5">
                                {poll.options.map((option) => {
                                    const share =
                                        poll.total_votes > 0
                                            ? Math.round(
                                                  (option.votes_count /
                                                      poll.total_votes) *
                                                      100,
                                              )
                                            : 0;
                                    const mine = poll.my_vote === option.id;

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            disabled={
                                                poll.status !== 'open' ||
                                                poll.my_vote !== null
                                            }
                                            onClick={() =>
                                                router.post(
                                                    `/employee/community/${community.id}/polls/${poll.id}/vote`,
                                                    { option_id: option.id },
                                                    { preserveScroll: true },
                                                )
                                            }
                                            className={`w-full rounded-lg border-[0.5px] p-2 text-start transition-colors ${
                                                mine
                                                    ? 'border-ink bg-lime/25'
                                                    : 'border-ink/12 bg-surface hover:border-ink/30'
                                            } disabled:cursor-default`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[11px] font-bold text-ink">
                                                    {option.label}
                                                </span>
                                                <span className="font-mono text-[10px] text-ink/60">
                                                    {option.votes_count} ·{' '}
                                                    {share}٪
                                                </span>
                                            </div>
                                            <div
                                                className="mt-1 h-1 overflow-hidden rounded-full bg-ink/10"
                                                dir="ltr"
                                            >
                                                <div
                                                    className="h-full rounded-full bg-lime"
                                                    style={{
                                                        width: `${share}%`,
                                                    }}
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <span className="block text-[10px] text-ink/45">
                                {poll.total_votes} صوتاً ·{' '}
                                {poll.creator?.name ?? '—'}
                                {poll.my_vote !== null && ' · صوّتَّ بالفعل'}
                            </span>
                        </div>
                    ))}
                </Card>
            )}

            {/* ── البطولات ── */}
            {leagues.length > 0 && (
                <Card padding="p-4" className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Trophy
                            className="h-4 w-4 text-ink"
                            aria-hidden="true"
                        />
                        <h2 className="text-sm font-extrabold text-ink">
                            البطولات
                        </h2>
                    </div>

                    {leagues.map((league) => (
                        <Link
                            key={league.id}
                            href={`/employee/community/${community.id}/leagues/${league.id}`}
                            className="block"
                        >
                            <div className="flex items-center justify-between gap-2 rounded-xl border-[0.5px] border-ink/12 bg-page p-3 transition-colors hover:border-ink/30">
                                <div className="min-w-0">
                                    <span className="block truncate text-xs font-extrabold text-ink">
                                        {league.name}
                                    </span>
                                    <span className="block text-[11px] text-ink/55">
                                        {league.departments?.length ?? 0} إدارة
                                        · {league.matches_count} مباراة
                                    </span>
                                </div>
                                <Badge
                                    tone={
                                        league.status === 'active'
                                            ? 'success'
                                            : 'neutral'
                                    }
                                >
                                    {league.status === 'active'
                                        ? 'جارية'
                                        : league.status === 'completed'
                                          ? 'منتهية'
                                          : 'مسودة'}
                                </Badge>
                            </div>
                        </Link>
                    ))}
                </Card>
            )}

            {/* ── الأعضاء ── */}
            <Card padding="p-4" className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-extrabold text-ink">
                        الأعضاء ({members.length})
                    </h2>
                </div>

                {canInvite && invitableEmployees.length > 0 && (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            inviteForm.post(
                                `/employee/community/${community.id}/invite`,
                                {
                                    preserveScroll: true,
                                    onSuccess: () => inviteForm.reset(),
                                },
                            );
                        }}
                        className="flex items-end gap-2"
                    >
                        <div className="flex-1">
                            <label
                                htmlFor="invite-employee"
                                className="mb-1 block text-[11px] font-bold text-ink"
                            >
                                دعوة زميل
                            </label>
                            <select
                                id="invite-employee"
                                className={INPUT}
                                value={inviteForm.data.employee_id}
                                onChange={(event) =>
                                    inviteForm.setData(
                                        'employee_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">— اختر زميلاً —</option>
                                {invitableEmployees.map((employee) => (
                                    <option
                                        key={employee.id}
                                        value={employee.id}
                                    >
                                        {employee.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button
                            type="submit"
                            icon={UserPlus}
                            disabled={
                                inviteForm.processing ||
                                !inviteForm.data.employee_id
                            }
                        >
                            دعوة
                        </Button>
                    </form>
                )}

                <div className="space-y-1.5">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between gap-2 rounded-xl border-[0.5px] border-ink/10 bg-page px-3 py-2"
                        >
                            <div className="min-w-0">
                                <span className="block truncate text-[11px] font-bold text-ink">
                                    {member.name}
                                </span>
                                <span className="block text-[10px] text-ink/50">
                                    {member.department?.name ?? 'بلا إدارة'}
                                </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5">
                                {member.id === primaryLeaderId && (
                                    <Badge tone="lime" icon={Crown}>
                                        قائد أساسي
                                    </Badge>
                                )}
                                {member.id !== primaryLeaderId &&
                                    leaderIds.includes(member.id) && (
                                        <Badge tone="neutral">قائد</Badge>
                                    )}
                                {isLeader && member.id !== primaryLeaderId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRemoveReason('');
                                            setRemovingMember(member);
                                        }}
                                        aria-label="إزالة العضو"
                                        className="rounded-lg bg-danger/8 p-1 text-danger transition-colors hover:bg-danger/15"
                                    >
                                        <Trash2
                                            className="h-3 w-3"
                                            aria-hidden="true"
                                        />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <ListStates count={members.length} empty="لا أعضاء بعد." />
                </div>
            </Card>

            {/* ── القيادة والخروج ── */}
            {isPrimaryLeader ? (
                <FormSection
                    title="تسليم القيادة"
                    hint="المجتمع بلا قائد لا تُنشأ فيه فعاليات — لذلك التسليم أسلم من التنحّي."
                >
                    <Field
                        label="القائد الجديد"
                        error={transferForm.errors.employee_id}
                    >
                        <select
                            className={INPUT}
                            value={transferForm.data.employee_id}
                            onChange={(event) =>
                                transferForm.setData(
                                    'employee_id',
                                    event.target.value,
                                )
                            }
                        >
                            <option value="">— اختر عضواً —</option>
                            {members
                                .filter(
                                    (member) => member.id !== primaryLeaderId,
                                )
                                .map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                        </select>
                    </Field>

                    <FormActions>
                        <Button
                            type="button"
                            disabled={!transferForm.data.employee_id}
                            onClick={() => setTransferring(true)}
                        >
                            سلّم القيادة
                        </Button>
                        <Button
                            type="button"
                            tone="danger"
                            onClick={() => setSteppingDown(true)}
                        >
                            تنحَّ عن القيادة
                        </Button>
                    </FormActions>
                </FormSection>
            ) : (
                <Card
                    padding="p-4"
                    className="flex items-center justify-between gap-3"
                >
                    <span className="text-xs text-ink/70">
                        لم تعد مهتماً بهذا المجتمع؟
                    </span>
                    <Button
                        type="button"
                        tone="danger"
                        icon={LogOut}
                        onClick={() => setLeaving(true)}
                    >
                        مغادرة المجتمع
                    </Button>
                </Card>
            )}

            {/* ── التأكيدات ── */}
            <ConfirmModal
                open={leaving}
                tone="danger"
                title="مغادرة المجتمع"
                message="تخرج من قائمة الأعضاء ولا تصلك إعلاناته. مشاركاتك السابقة تبقى في سجلك، ويمكنك الانضمام مجدداً لاحقاً."
                details={
                    <ConfirmRow label="المجتمع" value={community.name} strong />
                }
                confirmLabel="نعم، غادر"
                onConfirm={() => {
                    router.post(`/employee/community/${community.id}/leave`);
                    setLeaving(false);
                }}
                onCancel={() => setLeaving(false)}
            />

            <ConfirmModal
                open={steppingDown}
                tone="danger"
                title="التنحّي عن القيادة"
                message="يبقى المجتمع بلا قائد أساسي حتى يعيّن مسؤول الحساب غيرك — ولا تُنشأ فيه فعاليات جديدة حتى ذلك الحين."
                details={
                    <>
                        <ConfirmRow
                            label="المجتمع"
                            value={community.name}
                            strong
                        />
                        <ConfirmRow
                            label="الأعضاء المتأثرون"
                            value={`${members.length} عضواً`}
                        />
                        <ConfirmRow
                            label="الأفضل"
                            value="تسليم القيادة لعضو بدل التنحّي"
                            strong
                        />
                    </>
                }
                confirmLabel="نعم، أتنحّى"
                onConfirm={() => {
                    router.post(
                        `/employee/community/${community.id}/step-down`,
                    );
                    setSteppingDown(false);
                }}
                onCancel={() => setSteppingDown(false)}
            />

            <ConfirmModal
                open={transferring}
                title="تسليم القيادة"
                message="يصبح العضو المختار القائد الأساسي فوراً، وتفقد أنت صلاحيات القيادة في هذا المجتمع. تبقى عضواً عادياً فيه."
                details={
                    <>
                        <ConfirmRow
                            label="المجتمع"
                            value={community.name}
                            strong
                        />
                        <ConfirmRow
                            label="القائد الجديد"
                            value={
                                members.find(
                                    (member) =>
                                        String(member.id) ===
                                        transferForm.data.employee_id,
                                )?.name ?? '—'
                            }
                            strong
                        />
                    </>
                }
                confirmLabel="نعم، سلّم القيادة"
                onConfirm={() => {
                    transferForm.post(
                        `/employee/community/${community.id}/transfer-leadership`,
                        {
                            preserveScroll: true,
                            onSuccess: () => setTransferring(false),
                        },
                    );
                }}
                onCancel={() => setTransferring(false)}
            />

            <ConfirmModal
                open={removingMember !== null}
                tone="danger"
                title="إزالة عضو"
                message="يخرج العضو من المجتمع فوراً وتُلغى تسجيلاته غير المؤكدة في فعالياته. يمكنه الانضمام مجدداً ما لم يُحظر."
                details={
                    removingMember && (
                        <>
                            <ConfirmRow
                                label="العضو"
                                value={removingMember.name}
                                strong
                            />
                            <div className="pt-2">
                                <label
                                    htmlFor="remove-reason"
                                    className="mb-1 block text-[11px] font-bold text-ink"
                                >
                                    سبب الإزالة — يُسجَّل
                                </label>
                                <textarea
                                    id="remove-reason"
                                    rows={2}
                                    value={removeReason}
                                    onChange={(event) =>
                                        setRemoveReason(event.target.value)
                                    }
                                    className="w-full rounded-xl border-[0.5px] border-ink/20 bg-surface px-3 py-2 text-xs focus:border-ink focus:outline-none"
                                />
                            </div>
                        </>
                    )
                }
                confirmLabel="نعم، أزل العضو"
                onConfirm={() => {
                    router.post(
                        `/employee/community/${community.id}/members/${removingMember?.id}/remove`,
                        { reason: removeReason },
                        { preserveScroll: true },
                    );
                    setRemovingMember(null);
                }}
                onCancel={() => setRemovingMember(null)}
            />

            {!isLeader && (
                <Note title="لماذا لا ترى أزرار الإنشاء؟">
                    إنشاء الفعاليات والقوالب والبطولات من صلاحيات قائد المجتمع.
                    إن أردت تنظيم فعالية، اقترحها على القائد أو اطلب منه ترشيحك.
                </Note>
            )}
        </EmployeeLayout>
    );
}
