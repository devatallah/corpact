import { Head, Link, useForm } from '@inertiajs/react';
import { BellRing, Building2, Flame, Lock, ShieldCheck, UserRound } from 'lucide-react';
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
                                {GROUP_LABELS[group] ?? group}
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

                    <div className="rounded-xl border-[0.5px] border-ink/12 bg-page p-3">
                        <span className="block text-[11px] font-extrabold text-ink mb-1">إشعارات إلزامية — غير قابلة للإيقاف</span>
                        <span className="block text-[10px] text-ink/65 leading-relaxed">
                            تأكيد الحجز · إلغاء الفعالية · مطالبات السداد · الفواتير
                        </span>
                        <span className="block text-[9px] text-ink/45 mt-1">
                            إشعارات تشغيلية ومالية ملزمة لسلامة حسابك وحجزك.
                        </span>
                    </div>

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

            {/* ── بطاقة الخصوصية ── */}
            <Card padding="p-4" className="space-y-2.5">
                <h2 className="text-sm font-extrabold text-ink flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    بطاقة الخصوصية وحماية بياناتك
                </h2>

                <div className="rounded-xl border-[0.5px] border-success/25 bg-success-tint p-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-success mb-1">
                        <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />
                        حجب بياناتك عن مزوّد الخدمة
                    </span>
                    <p className="text-[10px] text-ink/70 leading-relaxed">
                        المرفق الذي تلعب فيه لا يرى اسمك ولا رقم جوالك إطلاقاً — يصله عدد المشاركين فقط. الاستثناء الوحيد أن تكون
                        أنت منشئ الفعالية، فتظهر بياناتك بصفتك جهة الاتصال للتنسيق وحدها.
                    </p>
                </div>

                <div className="rounded-xl border-[0.5px] border-ink/12 bg-page p-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-ink mb-1">
                        <Building2 className="w-3 h-3 shrink-0" aria-hidden="true" />
                        المتحكّم والمعالِج
                    </span>
                    <p className="text-[10px] text-ink/70 leading-relaxed">
                        {employee.company?.name ?? 'شركتك'} هي المتحكّم الرسمي في بياناتك الوظيفية (Data Controller)، ومنصة تيمات
                        معالِج معتمد (Data Processor) وفق نظام حماية البيانات الشخصية السعودي (PDPL).
                    </p>
                </div>
            </Card>

            {/* ── مشكلات شائعة ── */}
            <Card padding="p-4" className="space-y-2">
                <h2 className="text-sm font-extrabold text-ink">مشكلات شائعة وإرشادات فورية</h2>

                {COMMON_ISSUES.map((issue) => (
                    <details key={issue.q} className="rounded-xl border-[0.5px] border-ink/12 bg-page p-2.5">
                        <summary className="text-[11px] font-bold text-ink cursor-pointer">{issue.q}</summary>
                        <p className="text-[10px] text-ink/65 leading-relaxed mt-1.5">{issue.a}</p>
                    </details>
                ))}
            </Card>

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

/**
 * المشكلات الخمس التي يفتح الموظف الدعم بسببها.
 *
 * Answering them here is cheaper for everyone than a support ticket, and each
 * answer states the rule rather than promising a fix — «انتهت مهلة الدفع» has
 * a definite outcome, and hiding it produces a second ticket.
 */
/**
 * أسماء مجموعات الإشعارات بالعربية.
 *
 * The registry groups templates by an English slug for its own bookkeeping.
 * Printing that slug as a section heading in an Arabic interface is the same
 * leak as an untranslated status — the reader sees the schema, not the
 * product.
 */
const GROUP_LABELS: Record<string, string> = {
    events: 'الفعاليات',
    community: 'المجتمعات',
    engagement: 'التفاعل والتذكيرات',
    provider: 'المرافق والمزوّدون',
    finance: 'المالية',
};

const COMMON_ISSUES = [
    {
        q: 'لم يصلني رمز الدخول؟',
        a: 'تأكد أن الرقم هو المسجَّل لدى شركتك، وانتظر دقيقة قبل طلب رمز جديد — الطلب المتكرر السريع يوقف الإرسال مؤقتاً حمايةً لك. إن تكرّر، راجع مسؤول الحساب في شركتك.',
    },
    {
        q: 'أُقفل حسابي مؤقتاً؟',
        a: 'الإقفال المؤقت يقع بعد محاولات دخول كثيرة متتالية، وينتهي من تلقاء نفسه. لا يعني حذف حسابك ولا فقدان تسجيلاتك.',
    },
    {
        q: 'انتهت مهلة الدفع؟',
        a: 'المقعد يُحرَّر ويُعرض على قائمة الانتظار. لا يُخصم منك شيء، ويمكنك التسجيل مجدداً إن بقي مقعد شاغر.',
    },
    {
        q: 'دفعت المبلغ ولم تتحدّث حالتي فوراً؟',
        a: 'تأكيد البوابة قد يتأخر دقائق. لا تدفع مرة أخرى — افتح صفحة السداد وستجد الحالة محدَّثة، وإن بقيت معلّقة بعد ساعة راجع الدعم بمرجع العملية.',
    },
    {
        q: 'أُلغيت الفعالية من الشركة أو المزوّد؟',
        a: 'يُردّ ما دفعته كاملاً إلى وسيلة الدفع نفسها تلقائياً. إلغاء المزوّد وإلغاء الشركة كلاهما استرداد كامل — الفرق بينهما في أثره على المرفق لا عليك.',
    },
];
