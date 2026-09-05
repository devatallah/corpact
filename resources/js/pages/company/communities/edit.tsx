import { Head, router, useForm } from '@inertiajs/react';
import { Ban, CalendarClock, Crown, Trash2, UserMinus, UsersRound } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { BackLink } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import { Badge, Button, ButtonLink, Field, INPUT, IconButton, Note, PageHeader } from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';

/**
 * H §6 — تعديل المجتمع، والقيادة، والعضوية.
 *
 * Removing a member and banning one are different acts with different
 * consequences — a removed member can rejoin, a banned one cannot — so they
 * are separate buttons with separate confirmations, and both demand a written
 * reason that is stored against the membership.
 */
type Category = {
    id: number;
    parent_id: number | null;
    name: string;
    children?: Category[];
};

type Member = {
    id: number;
    name: string;
    email: string;
    department?: { id: number; name: string } | null;
    joined_at: string | null;
};

export default function CompanyCommunityEdit({
    community,
    members,
    employees,
    categories,
}: {
    community: {
        id: number;
        name: string;
        description: string | null;
        category_id: number | null;
        category?: { id: number; name: string } | null;
        leader?: { id: number; name: string } | null;
        deputy_leaders?: { id: number; name: string }[];
    };
    members: Member[];
    employees: { id: number; name: string }[];
    categories: Category[];
}) {
    const form = useForm({
        name: community.name,
        description: community.description ?? '',
        category_id: community.category_id ? String(community.category_id) : '',
    });

    const leaderForm = useForm({ employee_id: '', is_primary: true });
    const [removingLeader, setRemovingLeader] = useState(false);
    const [promoting, setPromoting] = useState<Member | null>(null);
    const [acting, setActing] = useState<{ member: Member; kind: 'remove' | 'ban' } | null>(null);
    const [reason, setReason] = useState('');
    const [deleting, setDeleting] = useState(false);

    return (
        <CompanyLayout>
            <Head title={`تعديل ${community.name}`} />

            <BackLink
                href="/company/communities"
                label="العودة إلى المجتمعات"
            />

            <PageHeader
                icon={UsersRound}
                title={community.name}
                subtitle={community.category?.name ?? 'بلا فئة'}
                actions={
                    <ButtonLink
                        href={`/company/communities/${community.id}/templates`}
                        tone="soft"
                        icon={CalendarClock}
                    >
                        قوالب التكرار
                    </ButtonLink>
                }
            />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.put(`/company/communities/${community.id}`, {
                        preserveScroll: true,
                    });
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات المجتمع">
                    <FormGrid>
                        <Field
                            label="اسم المجتمع"
                            error={form.errors.name}
                            required
                        >
                            <input
                                className={INPUT}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                        </Field>

                        <Field label="الفئة" error={form.errors.category_id}>
                            <select
                                className={INPUT}
                                value={form.data.category_id}
                                onChange={(event) =>
                                    form.setData(
                                        'category_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">— اختر الفئة —</option>
                                {categories.map((parent) => (
                                    <optgroup
                                        key={parent.id}
                                        label={parent.name}
                                    >
                                        <option value={parent.id}>
                                            {parent.name}
                                        </option>
                                        {(parent.children ?? []).map(
                                            (child) => (
                                                <option
                                                    key={child.id}
                                                    value={child.id}
                                                >
                                                    {child.name}
                                                </option>
                                            ),
                                        )}
                                    </optgroup>
                                ))}
                            </select>
                        </Field>
                    </FormGrid>

                    <Field label="الوصف" error={form.errors.description}>
                        <textarea
                            rows={3}
                            className={INPUT}
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                        />
                    </Field>
                </FormSection>

                <FormActions cancelHref="/company/communities">
                    <Button type="submit" disabled={form.processing}>
                        حفظ التعديلات
                    </Button>
                </FormActions>
            </form>

            {/* ── القيادة ── */}
            <FormSection
                title="قيادة المجتمع"
                hint="القيادة لا تُستبدل تلقائياً: إزالة قائد تترك المجتمع بلا قيادة حتى تعيّن غيره."
            >
                <div className="flex items-center justify-between gap-3 rounded-2xl border-[0.5px] border-ink/12 bg-page p-3.5">
                    <div className="min-w-0">
                        <span className="block text-[11px] text-ink/50">
                            القائد الأساسي الحالي
                        </span>
                        <span className="block truncate text-sm font-extrabold text-ink">
                            {community.leader?.name ?? 'بلا قائد'}
                        </span>
                    </div>
                    {community.leader ? (
                        <Button
                            type="button"
                            tone="danger"
                            icon={UserMinus}
                            onClick={() => setRemovingLeader(true)}
                        >
                            إزالة القيادة
                        </Button>
                    ) : (
                        <Badge tone="warning">لا تُنشأ فعاليات</Badge>
                    )}
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        leaderForm.post(
                            `/company/communities/${community.id}/leaders`,
                            {
                                preserveScroll: true,
                                onSuccess: () => leaderForm.reset(),
                            },
                        );
                    }}
                    className="space-y-3"
                >
                    <Field
                        label="تعيين قائد"
                        error={leaderForm.errors.employee_id}
                    >
                        <select
                            className={INPUT}
                            value={leaderForm.data.employee_id}
                            onChange={(event) =>
                                leaderForm.setData(
                                    'employee_id',
                                    event.target.value,
                                )
                            }
                        >
                            <option value="">— اختر موظفاً —</option>
                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <label className="flex items-center gap-2 text-xs text-ink/80">
                        <input
                            type="checkbox"
                            checked={leaderForm.data.is_primary}
                            onChange={(event) =>
                                leaderForm.setData(
                                    'is_primary',
                                    event.target.checked,
                                )
                            }
                            className="h-4 w-4 rounded border-ink/25 accent-ink"
                        />
                        اجعله القائد الأساسي
                    </label>

                    <Button
                        type="submit"
                        disabled={
                            leaderForm.processing ||
                            !leaderForm.data.employee_id
                        }
                    >
                        تعيين
                    </Button>
                </form>

                <Note title="قيادة متعددة">
                    يمكن أن يقود المجتمعَ أكثر من موظف، لكن واحداً فقط يكون
                    «الأساسي» — وهو من تصله تنبيهات المجتمع وتُنسب إليه القرارات
                    في السجل.
                </Note>
            </FormSection>

            <FormSection
                title={`أعضاء المجتمع (${members.length})`}
                hint="الإزالة تُخرج العضو ويمكنه العودة؛ الحظر يمنعه من الانضمام مجدداً. كلاهما يتطلب سبباً موثَّقاً."
            >
                <div className="divide-y-[0.5px] divide-ink/10 rounded-2xl border-[0.5px] border-ink/12 bg-page">
                    {members.map((member) => {
                        const isPrimary = member.id === community.leader?.id;
                        const isDeputy = (community.deputy_leaders ?? []).some(
                            (d) => d.id === member.id,
                        );

                        return (
                            <div
                                key={member.id}
                                className="flex items-center justify-between gap-2 p-3"
                            >
                                <div className="min-w-0">
                                    <span className="block text-xs font-extrabold text-ink">
                                        {member.name}
                                    </span>
                                    <span className="block text-[10px] text-ink/50">
                                        {member.department?.name ?? 'بلا إدارة'}
                                        {member.joined_at &&
                                            ` · انضم ${new Date(member.joined_at).toLocaleDateString('ar-SA')}`}
                                    </span>
                                </div>

                                <div className="flex shrink-0 items-center gap-1.5">
                                    {isPrimary && <Badge tone="lead">قائد أساسي</Badge>}
                                    {!isPrimary && isDeputy && (
                                        <Badge tone="neutral">نائب</Badge>
                                    )}

                                    {!isPrimary && (
                                        <>
                                            <IconButton
                                                icon={Crown}
                                                label="اجعله القائد الأساسي"
                                                onClick={() => setPromoting(member)}
                                            />
                                            <IconButton
                                                icon={UserMinus}
                                                label="إزالة العضو"
                                                onClick={() => {
                                                    setReason('');
                                                    setActing({ member, kind: 'remove' });
                                                }}
                                            />
                                            <IconButton
                                                icon={Ban}
                                                label="حظر العضو"
                                                tone="danger"
                                                onClick={() => {
                                                    setReason('');
                                                    setActing({ member, kind: 'ban' });
                                                }}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {members.length === 0 && (
                        <p className="p-4 text-center text-xs text-ink/55">
                            لا أعضاء في هذا المجتمع بعد.
                        </p>
                    )}
                </div>
            </FormSection>

            <FormSection
                title="حذف المجتمع"
                hint="إجراء لا رجعة فيه — الفعاليات المكتملة تبقى في السجل، لكن لا تُنشأ فعاليات جديدة تحته."
            >
                <Button
                    type="button"
                    tone="danger"
                    icon={Trash2}
                    onClick={() => setDeleting(true)}
                >
                    حذف المجتمع
                </Button>
            </FormSection>

            <ConfirmModal
                open={removingLeader}
                tone="danger"
                title="إزالة قيادة المجتمع"
                message="يفقد الموظف صلاحية إنشاء الفعاليات وإدارة الأعضاء في هذا المجتمع. لن يُعيَّن بديل تلقائياً — المجتمع يبقى بلا قيادة حتى تعيّن غيره."
                details={
                    <>
                        <ConfirmRow
                            label="المجتمع"
                            value={community.name}
                            strong
                        />
                        <ConfirmRow
                            label="القائد"
                            value={community.leader?.name ?? '—'}
                            strong
                        />
                    </>
                }
                confirmLabel="نعم، أزل القيادة"
                onConfirm={() => {
                    router.delete(
                        `/company/communities/${community.id}/leaders/${community.leader?.id}`,
                        { preserveScroll: true },
                    );
                    setRemovingLeader(false);
                }}
                onCancel={() => setRemovingLeader(false)}
            />

            <ConfirmModal
                open={promoting !== null}
                title="تعيين قائد أساسي"
                message="يصبح هذا العضو القائد الأساسي للمجتمع: إليه تصل تنبيهاته وإليه تُنسب قراراته في السجل. القائد الحالي يبقى قائداً لكن لا يعود أساسياً."
                details={
                    promoting && (
                        <>
                            <ConfirmRow label="المجتمع" value={community.name} strong />
                            <ConfirmRow label="القائد الأساسي الحالي" value={community.leader?.name ?? 'لا يوجد'} />
                            <ConfirmRow label="القائد الأساسي الجديد" value={promoting.name} strong />
                        </>
                    )
                }
                confirmLabel="نعم، عيّنه أساسياً"
                onConfirm={() => {
                    router.post(
                        `/company/communities/${community.id}/leaders/${promoting?.id}/primary`,
                        {},
                        { preserveScroll: true },
                    );
                    setPromoting(null);
                }}
                onCancel={() => setPromoting(null)}
            />

            <ConfirmModal
                open={acting !== null}
                tone="danger"
                title={acting?.kind === 'ban' ? 'حظر العضو' : 'إزالة العضو'}
                message={
                    acting?.kind === 'ban'
                        ? 'يخرج العضو من المجتمع ولا يستطيع الانضمام إليه مجدداً. الحظر صلاحية مسؤول الحساب وحده، ويبقى سببه في السجل.'
                        : 'يخرج العضو من المجتمع وتُلغى تسجيلاته غير المؤكدة في فعالياته. يمكنه الانضمام مجدداً لاحقاً.'
                }
                details={
                    acting && (
                        <>
                            <ConfirmRow label="العضو" value={acting.member.name} strong />
                            <ConfirmRow label="المجتمع" value={community.name} />
                            <div className="pt-2">
                                <label htmlFor="member-reason" className="mb-1 block text-[11px] font-bold text-ink">
                                    السبب — إلزامي ويُسجَّل على العضوية
                                </label>
                                <textarea
                                    id="member-reason"
                                    rows={2}
                                    value={reason}
                                    onChange={(event) => setReason(event.target.value)}
                                    className="w-full rounded-xl border-[0.5px] border-ink/20 bg-surface px-3 py-2 text-xs focus:border-ink focus:outline-none"
                                />
                            </div>
                        </>
                    )
                }
                confirmDisabled={!reason.trim()}
                confirmLabel={acting?.kind === 'ban' ? 'نعم، احظر العضو' : 'نعم، أزل العضو'}
                onConfirm={() => {
                    router.post(
                        `/company/communities/${community.id}/members/${acting?.member.id}/${acting?.kind}`,
                        { reason },
                        { preserveScroll: true },
                    );
                    setActing(null);
                }}
                onCancel={() => setActing(null)}
            />

            <ConfirmModal
                open={deleting}
                tone="danger"
                title="حذف المجتمع"
                message="يُحذف المجتمع وعضوياته وقوالب تكراره. الفعاليات المكتملة تبقى في السجل والتقارير."
                details={
                    <ConfirmRow label="المجتمع" value={community.name} strong />
                }
                confirmLabel="نعم، احذف المجتمع"
                onConfirm={() => {
                    router.delete(`/company/communities/${community.id}`);
                    setDeleting(false);
                }}
                onCancel={() => setDeleting(false)}
            />
        </CompanyLayout>
    );
}
