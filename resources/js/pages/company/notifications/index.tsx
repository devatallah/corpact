import { Head, router, useForm } from '@inertiajs/react';
import { Bell, BellRing, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { FormActions, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    IconButton,
    INPUT,
    PageHeader,
    StatCard,
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §14 — إشعارات الشركة.
 *
 * A note written here lands in this company's own inbox — it is a reminder to
 * the account-management side, not a broadcast to employees. The form says so
 * plainly, since "send notification" reads like it will reach the workforce.
 */
type NotificationRow = {
    id: string;
    type: string | null;
    template_key: string | null;
    title: string;
    body: string | null;
    read_at: string | null;
    created_at: string | null;
};

export default function CompanyNotifications({
    notifications,
    sort,
    unreadCount,
    totalCount,
    filters,
}: {
    company: { id: number; name: string };
    notifications: Paginated<NotificationRow>;
    filters: { unread_only?: boolean | string };
    sort: SortState;
    unreadCount: number;
    totalCount: number;
    unreadNotifications: number;
}) {
    const form = useForm({ title: '', body: '', type: 'note' });
    const [deleting, setDeleting] = useState<NotificationRow | null>(null);

    return (
        <CompanyLayout>
            <Head title="الإشعارات" />

            <PageHeader
                icon={Bell}
                title="الإشعارات"
                subtitle="ما يصل شركتك من النظام، وما تسجّله أنت كملاحظة لفريقك."
                actions={
                    unreadCount > 0 && (
                        <Button
                            type="button"
                            tone="soft"
                            icon={CheckCheck}
                            onClick={() =>
                                router.post(
                                    '/company/notifications/mark-all-read',
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            تعليم الكل كمقروء
                        </Button>
                    )
                }
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="غير مقروءة"
                    value={unreadCount}
                    tone={unreadCount > 0 ? 'warning' : 'success'}
                />
                <StatCard label="الإجمالي" value={totalCount} />
            </div>

            {/* ── ملاحظة داخلية ── */}
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/company/notifications', {
                        preserveScroll: true,
                        onSuccess: () => form.reset(),
                    });
                }}
            >
                <FormSection
                    title="تسجيل ملاحظة"
                    hint="تُحفظ في صندوق شركتك أنت — لا تصل الموظفين ولا المرافق."
                >
                    <Field label="العنوان" error={form.errors.title} required>
                        <input
                            className={INPUT}
                            value={form.data.title}
                            onChange={(event) =>
                                form.setData('title', event.target.value)
                            }
                        />
                    </Field>

                    <Field label="النص" error={form.errors.body} required>
                        <textarea
                            rows={2}
                            className={INPUT}
                            value={form.data.body}
                            onChange={(event) =>
                                form.setData('body', event.target.value)
                            }
                        />
                    </Field>

                    <FormActions>
                        <Button
                            type="submit"
                            disabled={
                                form.processing ||
                                !form.data.title.trim() ||
                                !form.data.body.trim()
                            }
                        >
                            حفظ الملاحظة
                        </Button>
                    </FormActions>
                </FormSection>
            </form>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <FilterSelect
                        name="unread_only"
                        label="العرض"
                        value={filters.unread_only ? '1' : ''}
                        options={[
                            ['', 'كل الإشعارات'],
                            ['1', 'غير المقروءة فقط'],
                        ]}
                    />
                    <span className="text-[11px] text-ink/50">
                        أحدث الإشعارات أولاً.
                    </span>
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="الإشعار"
                                sortKey="title"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الوقت"
                                sortKey="created_at"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الحالة"
                                sortKey="read_at"
                                sort={sort}
                            />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {notifications.data.map((notification) => (
                            <Tr key={notification.id}>
                                <Td>
                                    <span
                                        className={`block ${notification.read_at ? 'font-bold text-ink/80' : 'font-extrabold text-ink'}`}
                                    >
                                        {notification.title}
                                    </span>
                                    {notification.body && (
                                        <span className="block max-w-xl text-[11px] leading-relaxed text-ink/55">
                                            {notification.body}
                                        </span>
                                    )}
                                </Td>
                                <Td className="font-mono text-[11px] whitespace-nowrap text-ink/70">
                                    {notification.created_at
                                        ? new Date(
                                              notification.created_at,
                                          ).toLocaleString('ar-SA')
                                        : '—'}
                                </Td>
                                <Td>
                                    {notification.read_at ? (
                                        <Badge tone="neutral">مقروء</Badge>
                                    ) : (
                                        <Badge tone="warning" icon={BellRing}>
                                            جديد
                                        </Badge>
                                    )}
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        {!notification.read_at && (
                                            <IconButton
                                                icon={Check}
                                                label="تعليم كمقروء"
                                                onClick={() =>
                                                    router.post(
                                                        `/company/notifications/${notification.id}/read`,
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            />
                                        )}
                                        <IconButton
                                            icon={Trash2}
                                            label="حذف الإشعار"
                                            tone="danger"
                                            onClick={() =>
                                                setDeleting(notification)
                                            }
                                        />
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={notifications.data.length}
                            colSpan={4}
                            empty="لا إشعارات."
                            emptyHint="ستصلك هنا تنبيهات النظام: طلبات المجتمعات، اعتماد طلبات الشحن، وفواتير الدورة."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={notifications} />
                    <Pagination page={notifications} />
                </div>
            </Card>

            <ConfirmModal
                open={deleting !== null}
                tone="danger"
                title="حذف الإشعار"
                message="يُحذف الإشعار من صندوقك نهائياً. إن كان تنبيهاً من النظام فلن يُعاد إرساله."
                details={
                    deleting && (
                        <ConfirmRow
                            label="الإشعار"
                            value={deleting.title}
                            strong
                        />
                    )
                }
                confirmLabel="نعم، احذفه"
                onConfirm={() => {
                    router.delete(`/company/notifications/${deleting?.id}`, {
                        preserveScroll: true,
                    });
                    setDeleting(null);
                }}
                onCancel={() => setDeleting(null)}
            />
        </CompanyLayout>
    );
}
