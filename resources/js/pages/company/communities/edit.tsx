import { Head, router, useForm } from '@inertiajs/react';
import { CalendarClock, Trash2, UserMinus, UsersRound } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { BackLink } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    ButtonLink,
    Field,
    INPUT,
    Note,
    PageHeader,
} from '@/components/portal/ui';
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

export default function CompanyCommunityEdit({
    community,
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
    };
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
