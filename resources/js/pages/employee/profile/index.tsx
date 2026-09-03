import { Head, Link, useForm } from '@inertiajs/react';
import { BellRing, Flame, UserRound } from 'lucide-react';
import { ListStates } from '@/components/list-states';
import { FormActions, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    INPUT,
    Note,
    PageHeader,
    StatCard,
} from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';
import { eventStatus } from '@/lib/status';

/**
 * H §14 — ملفي وتفضيلات الإشعارات.
 *
 * Only *optional* templates appear in the preference list. Mandatory ones —
 * a payment due, a cancelled event, a seat offer about to expire — are not
 * shown with a disabled switch, because a switch that cannot move is a
 * promise the product does not keep. They simply are not listed, and the note
 * says why.
 */
type Preference = {
    key: string;
    title: string;
    group: string;
    audience: string | null;
    enabled: boolean;
};

export default function EmployeeProfile({
    employee,
    stats,
    events,
    communities,
    activityStats,
    notificationPreferences,
}: {
    employee: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        employee_number: string | null;
        avatar: string | null;
        company?: { id: number; name: string } | null;
        department?: { id: number; name: string } | null;
    };
    stats: {
        events_participated: number;
        communities_joined: number;
        events_created: number;
    };
    events: {
        id: number;
        title: string | null;
        status: string;
        event_date: string | null;
        community?: { id: number; name: string } | null;
    }[];
    communities: {
        id: number;
        name: string;
        members_count: number;
        category?: { id: number; name: string } | null;
    }[];
    activityStats: {
        streak: number;
        total_events: number;
        events_this_month: number;
        top_category: string | null;
    };
    notificationPreferences: Preference[];
}) {
    const profileForm = useForm<{
        name: string;
        phone: string;
        avatar: File | null;
    }>({
        name: employee.name,
        phone: employee.phone ?? '',
        avatar: null,
    });

    const prefsForm = useForm<{ preferences: Record<string, boolean> }>({
        preferences: Object.fromEntries(
            notificationPreferences.map((pref) => [pref.key, pref.enabled]),
        ),
    });

    const groups = [
        ...new Set(notificationPreferences.map((pref) => pref.group)),
    ];

    return (
        <EmployeeLayout>
            <Head title="ملفي" />

            <PageHeader
                icon={UserRound}
                title={employee.name}
                subtitle={`${employee.company?.name ?? '—'} · ${employee.department?.name ?? 'بلا إدارة'}`}
                actions={
                    activityStats.streak > 0 && (
                        <Badge tone="lime" icon={Flame}>
                            {activityStats.streak} أسبوعاً متتالياً
                        </Badge>
                    )
                }
            />

            <div className="grid grid-cols-3 gap-3">
                <StatCard label="مشاركاتي" value={stats.events_participated} />
                <StatCard label="مجتمعاتي" value={stats.communities_joined} />
                <StatCard
                    label="فعاليات أنشأتها"
                    value={stats.events_created}
                />
            </div>

            {activityStats.top_category && (
                <Card padding="p-3.5">
                    <span className="text-xs text-ink/70">
                        نشاطك الأكثر تكراراً:{' '}
                        <span className="font-extrabold text-ink">
                            {activityStats.top_category}
                        </span>{' '}
                        — بواقع{' '}
                        <span className="font-mono font-bold text-ink">
                            {activityStats.events_this_month}
                        </span>{' '}
                        هذا الشهر.
                    </span>
                </Card>
            )}

            {/* ── بياناتي ── */}
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    profileForm.post('/employee/profile', {
                        forceFormData: true,
                        preserveScroll: true,
                        headers: { 'X-HTTP-Method-Override': 'PUT' },
                    });
                }}
                className="space-y-6"
            >
                <FormSection title="بياناتي">
                    <Field label="الاسم" error={profileForm.errors.name}>
                        <input
                            className={INPUT}
                            value={profileForm.data.name}
                            onChange={(event) =>
                                profileForm.setData('name', event.target.value)
                            }
                        />
                    </Field>

                    <Field
                        label="الجوال"
                        error={profileForm.errors.phone}
                        hint="إليه تصلك رسائل الدعوة والتذكير."
                    >
                        <input
                            dir="ltr"
                            className={INPUT}
                            value={profileForm.data.phone}
                            onChange={(event) =>
                                profileForm.setData('phone', event.target.value)
                            }
                        />
                    </Field>

                    <Field
                        label="البريد الإلكتروني"
                        hint="مفتاح حسابك — لتغييره راجع مسؤول الحساب في شركتك."
                    >
                        <input
                            dir="ltr"
                            className={`${INPUT} bg-ink/5 text-ink/60`}
                            value={employee.email}
                            readOnly
                        />
                    </Field>

                    <Field
                        label="الصورة الشخصية"
                        error={profileForm.errors.avatar}
                        hint="صورة بحد أقصى 2 ميجابايت."
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full text-xs text-ink/80 file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-2 file:text-[11px] file:font-bold file:text-lime"
                            onChange={(event) =>
                                profileForm.setData(
                                    'avatar',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                        />
                    </Field>
                </FormSection>

                <FormActions>
                    <Button type="submit" disabled={profileForm.processing}>
                        حفظ بياناتي
                    </Button>
                </FormActions>
            </form>

            {/* ── تفضيلات الإشعارات ── */}
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    prefsForm.put(
                        '/employee/profile/notification-preferences',
                        { preserveScroll: true },
                    );
                }}
                className="space-y-6"
            >
                <FormSection
                    title="تفضيلات الإشعارات"
                    hint="أوقف ما لا يهمّك — تبقى الإشعارات الأساسية تصلك دائماً."
                >
                    {groups.map((group) => (
                        <div key={group} className="space-y-1.5">
                            <span className="block text-[11px] font-bold text-ink/60">
                                {group}
                            </span>
                            {notificationPreferences
                                .filter((pref) => pref.group === group)
                                .map((pref) => (
                                    <label
                                        key={pref.key}
                                        className="flex cursor-pointer items-center gap-2.5 rounded-xl border-[0.5px] border-ink/12 bg-page px-3 py-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                prefsForm.data.preferences[
                                                    pref.key
                                                ] ?? true
                                            }
                                            onChange={(event) =>
                                                prefsForm.setData(
                                                    'preferences',
                                                    {
                                                        ...prefsForm.data
                                                            .preferences,
                                                        [pref.key]:
                                                            event.target
                                                                .checked,
                                                    },
                                                )
                                            }
                                            className="h-4 w-4 shrink-0 rounded border-ink/25 accent-ink"
                                        />
                                        <span className="text-[11px] font-bold text-ink">
                                            {pref.title}
                                        </span>
                                    </label>
                                ))}
                        </div>
                    ))}

                    <ListStates
                        count={notificationPreferences.length}
                        empty="لا تفضيلات قابلة للتعديل."
                    />

                    <Note title="لماذا لا ترى كل الإشعارات هنا؟">
                        إشعارات مثل «فعاليتك أُلغيت» أو «سدادك مستحق» لا يمكن
                        إيقافها — إخفاؤها يضرّك أنت. لذلك لا تُعرض بمفتاح
                        معطَّل، بل لا تُعرض أصلاً.
                    </Note>
                </FormSection>

                <FormActions>
                    <Button
                        type="submit"
                        disabled={prefsForm.processing}
                        icon={BellRing}
                    >
                        حفظ التفضيلات
                    </Button>
                </FormActions>
            </form>

            {/* ── مجتمعاتي ── */}
            <Card padding="p-4" className="space-y-2">
                <h2 className="text-sm font-extrabold text-ink">مجتمعاتي</h2>
                {communities.map((community) => (
                    <Link
                        key={community.id}
                        href={`/employee/community/${community.id}`}
                        className="block"
                    >
                        <div className="flex items-center justify-between gap-2 rounded-xl border-[0.5px] border-ink/12 bg-page px-3 py-2 transition-colors hover:border-ink/30">
                            <span className="truncate text-[11px] font-bold text-ink">
                                {community.name}
                            </span>
                            <span className="shrink-0 font-mono text-[10px] text-ink/55">
                                {community.members_count} عضواً
                            </span>
                        </div>
                    </Link>
                ))}
                <ListStates
                    count={communities.length}
                    empty="لم تنضم إلى مجتمع بعد."
                />
            </Card>

            {/* ── فعالياتي ── */}
            <Card padding="p-4" className="space-y-2">
                <h2 className="text-sm font-extrabold text-ink">فعالياتي</h2>
                {events.slice(0, 10).map((event) => (
                    <Link
                        key={event.id}
                        href={`/employee/detail/${event.id}`}
                        className="block"
                    >
                        <div className="rounded-xl border-[0.5px] border-ink/12 bg-page px-3 py-2 transition-colors hover:border-ink/30">
                            <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-[11px] font-bold text-ink">
                                    {event.title ?? `فعالية #${event.id}`}
                                </span>
                                <Badge tone={eventStatus(event.status).tone}>
                                    {eventStatus(event.status).label}
                                </Badge>
                            </div>
                            <span className="block font-mono text-[10px] text-ink/50">
                                {event.event_date ?? '—'} ·{' '}
                                {event.community?.name ?? '—'}
                            </span>
                        </div>
                    </Link>
                ))}
                <ListStates count={events.length} empty="لا فعاليات مسجّلة." />
            </Card>
        </EmployeeLayout>
    );
}
