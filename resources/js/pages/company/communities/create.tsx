import { Head, useForm } from '@inertiajs/react';
import { UsersRound } from 'lucide-react';
import { BackLink } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import { Button, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';

/**
 * H §6 — إنشاء مجتمع.
 *
 * The leader is chosen at creation on purpose: a community with no leader is
 * inert, since events can only be created by one. The field stays optional in
 * the API, but the form says plainly what happens if it is left empty.
 */
type Category = {
    id: number;
    parent_id: number | null;
    name: string;
    children?: Category[];
};

export default function CompanyCommunityCreate({
    employees,
    categories,
}: {
    employees: { id: number; name: string }[];
    categories: Category[];
}) {
    const form = useForm({
        name: '',
        description: '',
        category_id: '',
        leader_id: '',
    });

    return (
        <CompanyLayout>
            <Head title="مجتمع جديد" />

            <BackLink
                href="/company/communities"
                label="العودة إلى المجتمعات"
            />

            <PageHeader
                icon={UsersRound}
                title="مجتمع جديد"
                subtitle="اسم وفئة وقائد — ثم وزّع له رصيداً من المحفظة ليبدأ فعالياته."
            />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/company/communities');
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

                        <Field
                            label="الفئة"
                            error={form.errors.category_id}
                            hint="تحدد الفئة أي المرافق تظهر عند إنشاء الفعاليات."
                        >
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

                    <Field label="القائد الأساسي" error={form.errors.leader_id}>
                        <select
                            className={INPUT}
                            value={form.data.leader_id}
                            onChange={(event) =>
                                form.setData('leader_id', event.target.value)
                            }
                        >
                            <option value="">— بلا قائد الآن —</option>
                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Note title="بلا قائد = بلا فعاليات">
                        المجتمع بلا قائد يظهر في القوائم لكنه لا ينشئ فعاليات
                        ولا يصرف من محفظته. يمكنك تعيين القائد لاحقاً من صفحة
                        تعديل المجتمع.
                    </Note>
                </FormSection>

                <FormActions cancelHref="/company/communities">
                    <Button type="submit" disabled={form.processing}>
                        إنشاء المجتمع
                    </Button>
                </FormActions>
            </form>
        </CompanyLayout>
    );
}
