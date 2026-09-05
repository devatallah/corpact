import { Head, router, useForm } from '@inertiajs/react';
import { MessageSquare, SendHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import {
    FilterSelect,
    Pagination,
    ResultCount,
    SearchInput,
    SortableHeader,
    Toolbar,
} from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    INPUT,
    IconButton,
    PageHeader,
    StatCard,
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * رسائل الدعم الواردة من نموذج «اطلب عرضاً» وقنوات التواصل.
 *
 * The status is a queue position, not a judgement: `new` means nobody has
 * picked it up yet, and leaving one there is the failure mode this screen
 * exists to make visible.
 */
type SupportMessage = {
    id: number;
    name: string;
    email: string;
    company_name: string | null;
    phone: string | null;
    employees_range: string | null;
    financial_track: string | null;
    subject: string | null;
    message: string;
    status: string;
    created_at: string | null;
};

/** نفس نصوص المُنتقيَين في `marketing/contact.tsx` — القيمة مفتاح والنص عربي. */
const HEADCOUNT: Record<string, string> = {
    'less-than-50': 'أقل من ٥٠ موظفاً',
    '50-200': '٥٠ إلى ٢٠٠ موظف',
    '201-500': '٢٠١ إلى ٥٠٠ موظف',
    '500-plus': 'أكثر من ٥٠٠ موظف',
};

const TRACK: Record<string, string> = {
    'community-wallet': 'محفظة المجتمع',
    'employee-pay': 'دفع الموظف',
    undecided: 'غير محدد',
};

const STATUS: Record<
    string,
    { label: string; tone: 'neutral' | 'success' | 'warning' }
> = {
    new: { label: 'جديدة', tone: 'warning' },
    in_progress: { label: 'قيد المعالجة', tone: 'neutral' },
    resolved: { label: 'مغلقة', tone: 'success' },
};

export default function AdminSupportMessages({
    escalation: escalationRows,
    companies,
    messages,
    stats,
    filters,
    sort,
}: {
    escalation: { action: string; label: string; role: string }[];
    companies: { id: number; name: string }[];
    messages: Paginated<SupportMessage>;
    stats: {
        total: number;
        new: number;
        in_progress: number;
        resolved: number;
    };
    filters: { search?: string; status?: string };
    sort: SortState;
}) {
    const [removing, setRemoving] = useState<SupportMessage | null>(null);
    const escalation = useForm({
        company_id: '',
        event_id: '',
        action: '',
        summary: '',
    });
    const [expanded, setExpanded] = useState<number | null>(null);

    return (
        <AdminLayout>
            <Head title="توثيق البلاغات والتصعيد" />

            <PageHeader
                icon={MessageSquare}
                title="توثيق البلاغات والتصعيد"
                subtitle="الرسائل القادمة من نموذج التواصل. «جديدة» تعني أن أحداً لم يتولّها بعد."
            />

            {/* ── توثيق بلاغ وتصعيده ── */}
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    escalation.post('/admin/support/escalations', {
                        preserveScroll: true,
                        onSuccess: () => escalation.reset(),
                    });
                }}
            >
                <FormSection
                    title="تسجيل بلاغ تصعيد جديد"
                    hint="ما لا تملك تنفيذه يُوثَّق ويُحال. البلاغ يُقيَّد في سجل التدقيق غير القابل للحذف — لا تُدرج فيه أرقام بطاقات ولا كلمات مرور ولا بيانات شخصية خارج نطاق تشغيل الفعالية."
                >
                    <FormGrid>
                        <Field
                            label="الشركة المعنية"
                            htmlFor="esc-company"
                            error={escalation.errors.company_id}
                        >
                            <select
                                id="esc-company"
                                value={escalation.data.company_id}
                                onChange={(event) =>
                                    escalation.setData(
                                        'company_id',
                                        event.target.value,
                                    )
                                }
                                className={`${INPUT} cursor-pointer`}
                            >
                                <option value="">— غير محددة —</option>
                                {companies.map((company) => (
                                    <option
                                        key={company.id}
                                        value={String(company.id)}
                                    >
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field
                            label="رقم الفعالية (اختياري)"
                            htmlFor="esc-event"
                            error={escalation.errors.event_id}
                        >
                            <input
                                id="esc-event"
                                dir="ltr"
                                placeholder="#123"
                                className={`${INPUT} text-right font-mono`}
                                value={escalation.data.event_id}
                                onChange={(event) =>
                                    escalation.setData(
                                        'event_id',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    </FormGrid>

                    <Field
                        label="الإجراء المطلوب"
                        htmlFor="esc-action"
                        error={escalation.errors.action}
                        required
                    >
                        <select
                            id="esc-action"
                            value={escalation.data.action}
                            onChange={(event) =>
                                escalation.setData('action', event.target.value)
                            }
                            className={`${INPUT} cursor-pointer`}
                        >
                            <option value="">— اختر ما يُطلب تنفيذه —</option>
                            {escalationRows.map((row) => (
                                <option key={row.action} value={row.action}>
                                    {row.label} ← {row.role}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="ملخّص البلاغ"
                        htmlFor="esc-summary"
                        error={escalation.errors.summary}
                        required
                    >
                        <textarea
                            id="esc-summary"
                            rows={3}
                            placeholder="ما الذي أبلغ عنه العميل، وما الحالة الفعلية مقابل المتوقعة، ومتى وقع."
                            className={INPUT}
                            value={escalation.data.summary}
                            onChange={(event) =>
                                escalation.setData(
                                    'summary',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>

                    <FormActions>
                        <Button
                            type="submit"
                            icon={SendHorizontal}
                            disabled={
                                escalation.processing ||
                                !escalation.data.action ||
                                !escalation.data.summary.trim()
                            }
                        >
                            وثّق البلاغ وصعّده
                        </Button>
                    </FormActions>
                </FormSection>
            </form>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="إجمالي الرسائل" value={stats.total} />
                <StatCard
                    label="جديدة"
                    value={stats.new}
                    tone={stats.new > 0 ? 'warning' : 'success'}
                />
                <StatCard label="قيد المعالجة" value={stats.in_progress} />
                <StatCard label="مغلقة" value={stats.resolved} tone="success" />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث بالاسم أو الموضوع…"
                    />
                    <FilterSelect
                        name="status"
                        label="حالة الرسالة"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['new', 'جديدة'],
                            ['in_progress', 'قيد المعالجة'],
                            ['resolved', 'مغلقة'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="المرسل"
                                sortKey="name"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الموضوع"
                                sortKey="subject"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="وردت في"
                                sortKey="created_at"
                                sort={sort}
                                initialDirection="desc"
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الحالة"
                                sortKey="status"
                                sort={sort}
                            />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {messages.data.map((message) => (
                            <Tr key={message.id}>
                                <Td>
                                    <span className="block font-extrabold text-ink">
                                        {message.name}
                                    </span>
                                    {message.company_name && (
                                        <span className="block text-[11px] font-bold text-ink/70">
                                            {message.company_name}
                                        </span>
                                    )}
                                    <span
                                        className="font-mono text-[11px] text-ink/50"
                                        dir="ltr"
                                    >
                                        {message.email}
                                    </span>
                                </Td>
                                <Td>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpanded(
                                                expanded === message.id
                                                    ? null
                                                    : message.id,
                                            )
                                        }
                                        className="cursor-pointer text-start text-ink/85 hover:text-ink"
                                    >
                                        {message.subject ?? '—'}
                                    </button>
                                    {expanded === message.id && (
                                        <div className="mt-2 max-w-md space-y-2 rounded-lg border-[0.5px] border-ink/10 bg-page p-2">
                                            <p className="text-[11px] leading-relaxed text-ink/75">
                                                {message.message}
                                            </p>
                                            {(message.employees_range ||
                                                message.financial_track ||
                                                message.phone) && (
                                                <div className="flex flex-wrap gap-1.5 border-t-[0.5px] border-ink/10 pt-2">
                                                    {message.employees_range && (
                                                        <Badge tone="neutral">
                                                            {HEADCOUNT[
                                                                message
                                                                    .employees_range
                                                            ] ??
                                                                message.employees_range}
                                                        </Badge>
                                                    )}
                                                    {message.financial_track && (
                                                        <Badge tone="lead">
                                                            {TRACK[
                                                                message
                                                                    .financial_track
                                                            ] ??
                                                                message.financial_track}
                                                        </Badge>
                                                    )}
                                                    {message.phone && (
                                                        <span
                                                            className="font-mono text-[11px] text-ink/60"
                                                            dir="ltr"
                                                        >
                                                            {message.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Td>
                                <Td className="font-mono text-[11px] whitespace-nowrap text-ink/70">
                                    {message.created_at
                                        ? new Date(
                                              message.created_at,
                                          ).toLocaleDateString('ar-SA')
                                        : '—'}
                                </Td>
                                <Td>
                                    <select
                                        aria-label="تغيير حالة الرسالة"
                                        value={message.status}
                                        onChange={(event) =>
                                            router.patch(
                                                `/admin/support/${message.id}`,
                                                { status: event.target.value },
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="cursor-pointer rounded-lg border-[0.5px] border-ink/20 bg-surface p-1.5 text-[11px] focus:border-ink focus:outline-none"
                                    >
                                        <option value="new">جديدة</option>
                                        <option value="in_progress">
                                            قيد المعالجة
                                        </option>
                                        <option value="resolved">مغلقة</option>
                                    </select>
                                    <Badge
                                        tone={
                                            STATUS[message.status]?.tone ??
                                            'neutral'
                                        }
                                    >
                                        {STATUS[message.status]?.label ??
                                            message.status}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    <IconButton
                                        icon={Trash2}
                                        label="حذف الرسالة"
                                        tone="danger"
                                        onClick={() => setRemoving(message)}
                                    />
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={messages.data.length}
                            colSpan={5}
                            empty="لا رسائل واردة."
                            emptyHint="ستظهر هنا الرسائل القادمة من نموذج التواصل في الموقع."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={messages} />
                    <Pagination page={messages} />
                </div>
            </Card>

            <ConfirmModal
                open={removing !== null}
                tone="danger"
                title="حذف الرسالة"
                message="يُحذف نص الرسالة وبيانات المرسل نهائياً. إن كان البلاغ ما زال مفتوحاً فأغلقه بدل حذفه."
                details={
                    removing && (
                        <>
                            <ConfirmRow
                                label="المرسل"
                                value={removing.name}
                                strong
                            />
                            <ConfirmRow
                                label="الموضوع"
                                value={removing.subject ?? '—'}
                            />
                        </>
                    )
                }
                confirmLabel="حذف نهائي"
                onConfirm={() => {
                    router.delete(`/admin/support/${removing?.id}`, {
                        preserveScroll: true,
                    });
                    setRemoving(null);
                }}
                onCancel={() => setRemoving(null)}
            />
        </AdminLayout>
    );
}
