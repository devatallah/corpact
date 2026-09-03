import { Head, useForm } from '@inertiajs/react';
import { Inbox, Send } from 'lucide-react';
import {
    Pagination,
    ResultCount,
    SortableHeader,
} from '@/components/list-controls';
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
import type { Paginated, SortState } from '@/types';

/**
 * H §6 — اقتراح مجتمع.
 *
 * The employee proposes; the account manager decides. Approval does two
 * things at once — it creates the community *and* makes this employee its
 * leader — so the form says that before it is submitted, not after. Leading a
 * community is a commitment, and nobody should discover they signed up for it.
 */
type Category = {
    id: number;
    parent_id: number | null;
    name: string;
    children?: Category[];
};

type RequestRow = {
    id: number;
    name: string;
    description: string | null;
    status: string;
    rejection_reason: string | null;
    created_at: string | null;
    reviewed_at: string | null;
    category?: { id: number; name: string } | null;
    community?: { id: number; name: string } | null;
};

const REQUEST_STATUS: Record<
    string,
    { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }
> = {
    pending: { label: 'بانتظار قرار مسؤول الحساب', tone: 'warning' },
    approved: { label: 'مقبول — أُنشئ المجتمع', tone: 'success' },
    rejected: { label: 'مرفوض', tone: 'danger' },
};

export default function EmployeeCommunityRequests({
    requests,
    pendingCount,
    sort,
    categories,
}: {
    requests: Paginated<RequestRow>;
    pendingCount: number;
    sort: SortState;
    categories: Category[];
}) {
    const form = useForm({ name: '', description: '', category_id: '' });

    return (
        <EmployeeLayout>
            <Head title="اقتراح مجتمع" />

            <PageHeader
                icon={Inbox}
                title="اقتراح مجتمع"
                subtitle="لم تجد ما يناسبك؟ اقترحه — يقرّه مسؤول الحساب."
            />

            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    label="بانتظار القرار"
                    value={pendingCount}
                    tone={pendingCount > 0 ? 'warning' : 'success'}
                />
                <StatCard label="كل طلباتي" value={requests.total} />
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/employee/community-requests', {
                        preserveScroll: true,
                        onSuccess: () => form.reset(),
                    });
                }}
                className="space-y-6"
            >
                <FormSection title="طلب جديد">
                    <Field
                        label="اسم المجتمع المقترح"
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
                        required
                    >
                        <select
                            className={INPUT}
                            value={form.data.category_id}
                            onChange={(event) =>
                                form.setData('category_id', event.target.value)
                            }
                        >
                            <option value="">— اختر الفئة —</option>
                            {categories.map((parent) => (
                                <optgroup key={parent.id} label={parent.name}>
                                    <option value={parent.id}>
                                        {parent.name}
                                    </option>
                                    {(parent.children ?? []).map((child) => (
                                        <option key={child.id} value={child.id}>
                                            {child.name}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="لماذا هذا المجتمع؟"
                        error={form.errors.description}
                        hint="سطران يشرحان الفكرة يزيدان فرصة القبول."
                    >
                        <textarea
                            rows={3}
                            className={INPUT}
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                        />
                    </Field>

                    <Note tone="warning" title="القبول يجعلك قائد المجتمع">
                        إن وافق مسؤول الحساب، يُنشأ المجتمع وتصبح أنت قائده
                        الأساسي: تنشئ فعالياته وتدير أعضاءه. إن لم ترغب في ذلك،
                        اقترحه على زميل ليتقدّم به.
                    </Note>
                </FormSection>

                <FormActions>
                    <Button
                        type="submit"
                        icon={Send}
                        disabled={
                            form.processing ||
                            !form.data.name.trim() ||
                            !form.data.category_id
                        }
                    >
                        إرسال الطلب
                    </Button>
                </FormActions>
            </form>

            <Card padding="p-3">
                <div className="flex items-center gap-3 text-[11px] text-ink/55">
                    <SortableHeader
                        label="التاريخ"
                        sortKey="created_at"
                        sort={sort}
                    />
                    <SortableHeader label="الاسم" sortKey="name" sort={sort} />
                    <SortableHeader
                        label="الحالة"
                        sortKey="status"
                        sort={sort}
                    />
                </div>
            </Card>

            <div className="space-y-2">
                {requests.data.map((request) => (
                    <Card
                        key={request.id}
                        padding="p-3.5"
                        className="space-y-1.5"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-extrabold text-ink">
                                {request.name}
                            </span>
                            <Badge
                                tone={
                                    REQUEST_STATUS[request.status]?.tone ??
                                    'neutral'
                                }
                            >
                                {REQUEST_STATUS[request.status]?.label ??
                                    request.status}
                            </Badge>
                        </div>

                        {request.description && (
                            <p className="text-[11px] leading-relaxed text-ink/60">
                                {request.description}
                            </p>
                        )}

                        {request.rejection_reason && (
                            <p className="text-[11px] text-danger">
                                سبب الرفض: {request.rejection_reason}
                            </p>
                        )}

                        <span className="block font-mono text-[10px] text-ink/45">
                            {request.category?.name ?? '—'} ·{' '}
                            {request.created_at
                                ? new Date(
                                      request.created_at,
                                  ).toLocaleDateString('ar-SA')
                                : '—'}
                        </span>
                    </Card>
                ))}

                <ListStates
                    count={requests.data.length}
                    empty="لم تقترح مجتمعاً بعد."
                    emptyHint="اقتراحك يصل مسؤول الحساب مباشرةً."
                />
            </div>

            <Card
                padding="p-3"
                className="flex flex-wrap items-center justify-between gap-3"
            >
                <ResultCount page={requests} />
                <Pagination page={requests} />
            </Card>
        </EmployeeLayout>
    );
}
