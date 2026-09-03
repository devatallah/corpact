import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, UsersRound } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import {
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
    IconButton,
    INPUT,
    Note,
    PageHeader,
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §17 — موظفو المرفق.
 *
 * The role is not cosmetic: it decides which buttons exist for that person.
 * A receptionist answers booking requests but never sees the bank account or
 * the settlements; an accountant is the reverse. The form says what each role
 * can reach, because "الدور" alone tells the owner nothing.
 *
 * The owner account itself never appears in this list and cannot be created
 * here — there is exactly one, and it is the account that registered.
 */
type Staff = {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string | null;
};

const ROLE_REACH: Record<string, string> = {
    receptionist:
        'يرد على طلبات الحجز ويدير التقويم — لا يرى الحساب البنكي ولا التسويات.',
    accountant:
        'يرى التسويات والحساب البنكي والتقارير — لا يقبل الطلبات ولا يعدّل التقويم.',
};

export default function PartnerStaff({
    staff,
    filters,
    sort,
    roles,
}: {
    partner: { id: number; name: string };
    staff: Paginated<Staff>;
    filters: { search?: string };
    sort: SortState;
    roles: { value: string; label: string }[];
}) {
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState<Staff | null>(null);
    const [deleting, setDeleting] = useState<Staff | null>(null);

    const addForm = useForm({
        name: '',
        email: '',
        password: '',
        role: roles[0]?.value ?? '',
    });
    const editForm = useForm({
        name: '',
        email: '',
        role: '',
        status: 'active',
        password: '',
    });

    const roleLabel = (value: string) =>
        roles.find((role) => role.value === value)?.label ?? value;

    return (
        <PartnerLayout>
            <Head title="الموظفون" />

            <PageHeader
                icon={UsersRound}
                title="موظفو المرفق"
                subtitle="الدور يحدد ما يستطيع كل موظف الوصول إليه — لا ما يراه فقط."
                actions={
                    <Button
                        type="button"
                        icon={Plus}
                        onClick={() => setAdding(true)}
                    >
                        إضافة موظف
                    </Button>
                }
            />

            {adding && (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        addForm.post('/partner/staff', {
                            preserveScroll: true,
                            onSuccess: () => {
                                addForm.reset();
                                setAdding(false);
                            },
                        });
                    }}
                    className="space-y-6"
                >
                    <FormSection title="موظف جديد">
                        <FormGrid>
                            <Field
                                label="الاسم"
                                error={addForm.errors.name}
                                required
                            >
                                <input
                                    className={INPUT}
                                    value={addForm.data.name}
                                    onChange={(event) =>
                                        addForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="البريد الإلكتروني"
                                error={addForm.errors.email}
                                required
                            >
                                <input
                                    type="email"
                                    dir="ltr"
                                    className={INPUT}
                                    value={addForm.data.email}
                                    onChange={(event) =>
                                        addForm.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="كلمة المرور المبدئية"
                                error={addForm.errors.password}
                                hint="6 أحرف على الأقل — سلّمها للموظف ليغيّرها."
                                required
                            >
                                <input
                                    type="password"
                                    dir="ltr"
                                    autoComplete="new-password"
                                    className={INPUT}
                                    value={addForm.data.password}
                                    onChange={(event) =>
                                        addForm.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="الدور"
                                error={addForm.errors.role}
                                required
                            >
                                <select
                                    className={INPUT}
                                    value={addForm.data.role}
                                    onChange={(event) =>
                                        addForm.setData(
                                            'role',
                                            event.target.value,
                                        )
                                    }
                                >
                                    {roles.map((role) => (
                                        <option
                                            key={role.value}
                                            value={role.value}
                                        >
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </FormGrid>

                        {ROLE_REACH[addForm.data.role] && (
                            <Note
                                title={`ماذا يستطيع «${roleLabel(addForm.data.role)}»؟`}
                            >
                                {ROLE_REACH[addForm.data.role]}
                            </Note>
                        )}
                    </FormSection>

                    <FormActions>
                        <Button type="submit" disabled={addForm.processing}>
                            إضافة الموظف
                        </Button>
                        <Button
                            type="button"
                            tone="soft"
                            onClick={() => setAdding(false)}
                        >
                            إلغاء
                        </Button>
                    </FormActions>
                </form>
            )}

            {editing && (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        editForm.put(`/partner/staff/${editing.id}`, {
                            preserveScroll: true,
                            onSuccess: () => setEditing(null),
                        });
                    }}
                    className="space-y-6"
                >
                    <FormSection title={`تعديل ${editing.name}`}>
                        <FormGrid>
                            <Field
                                label="الاسم"
                                error={editForm.errors.name}
                                required
                            >
                                <input
                                    className={INPUT}
                                    value={editForm.data.name}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="البريد الإلكتروني"
                                error={editForm.errors.email}
                                required
                            >
                                <input
                                    type="email"
                                    dir="ltr"
                                    className={INPUT}
                                    value={editForm.data.email}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="الدور"
                                error={editForm.errors.role}
                                required
                            >
                                <select
                                    className={INPUT}
                                    value={editForm.data.role}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'role',
                                            event.target.value,
                                        )
                                    }
                                >
                                    {roles.map((role) => (
                                        <option
                                            key={role.value}
                                            value={role.value}
                                        >
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="الحالة"
                                error={editForm.errors.status}
                            >
                                <select
                                    className={INPUT}
                                    value={editForm.data.status}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'status',
                                            event.target.value,
                                        )
                                    }
                                >
                                    <option value="active">مفعّل</option>
                                    <option value="suspended">موقوف</option>
                                </select>
                            </Field>

                            <Field
                                label="كلمة مرور جديدة"
                                error={editForm.errors.password}
                                hint="اتركها فارغة لإبقاء الحالية."
                            >
                                <input
                                    type="password"
                                    dir="ltr"
                                    autoComplete="new-password"
                                    className={INPUT}
                                    value={editForm.data.password}
                                    onChange={(event) =>
                                        editForm.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </FormGrid>
                    </FormSection>

                    <FormActions>
                        <Button type="submit" disabled={editForm.processing}>
                            حفظ التعديلات
                        </Button>
                        <Button
                            type="button"
                            tone="soft"
                            onClick={() => setEditing(null)}
                        >
                            إلغاء
                        </Button>
                    </FormActions>
                </form>
            )}

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث بالاسم أو البريد…"
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="الموظف"
                                sortKey="name"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الدور"
                                sortKey="role"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الحالة"
                                sortKey="status"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="أُضيف في"
                                sortKey="created_at"
                                sort={sort}
                            />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {staff.data.map((member) => (
                            <Tr key={member.id}>
                                <Td>
                                    <span className="block font-extrabold text-ink">
                                        {member.name}
                                    </span>
                                    <span
                                        className="block font-mono text-[11px] text-ink/50"
                                        dir="ltr"
                                    >
                                        {member.email}
                                    </span>
                                </Td>
                                <Td>
                                    <Badge tone="neutral">
                                        {roleLabel(member.role)}
                                    </Badge>
                                    {ROLE_REACH[member.role] && (
                                        <span className="mt-0.5 block max-w-xs text-[10px] text-ink/45">
                                            {ROLE_REACH[member.role]}
                                        </span>
                                    )}
                                </Td>
                                <Td>
                                    <Badge
                                        tone={
                                            member.status === 'active'
                                                ? 'success'
                                                : 'danger'
                                        }
                                    >
                                        {member.status === 'active'
                                            ? 'مفعّل'
                                            : 'موقوف'}
                                    </Badge>
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {member.created_at
                                        ? new Date(
                                              member.created_at,
                                          ).toLocaleDateString('ar-SA')
                                        : '—'}
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <IconButton
                                            icon={Pencil}
                                            label="تعديل الموظف"
                                            onClick={() => {
                                                editForm.setData({
                                                    name: member.name,
                                                    email: member.email,
                                                    role: member.role,
                                                    status: member.status,
                                                    password: '',
                                                });
                                                setEditing(member);
                                            }}
                                        />
                                        <IconButton
                                            icon={Trash2}
                                            label="حذف الموظف"
                                            tone="danger"
                                            onClick={() => setDeleting(member)}
                                        />
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={staff.data.length}
                            colSpan={5}
                            empty="لا موظفين بعد."
                            emptyHint="أضف موظفاً ليتولى الرد على الطلبات أو متابعة التسويات نيابةً عنك."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={staff} />
                    <Pagination page={staff} />
                </div>
            </Card>

            <ConfirmModal
                open={deleting !== null}
                tone="danger"
                title="حذف الموظف"
                message="ينتهي وصول الموظف فوراً ولا يستطيع الدخول بعدها. القرارات التي اتخذها سابقاً تبقى منسوبة إليه في السجل."
                details={
                    deleting && (
                        <>
                            <ConfirmRow
                                label="الموظف"
                                value={deleting.name}
                                strong
                            />
                            <ConfirmRow
                                label="الدور"
                                value={roleLabel(deleting.role)}
                            />
                        </>
                    )
                }
                confirmLabel="نعم، احذف الموظف"
                onConfirm={() => {
                    router.delete(`/partner/staff/${deleting?.id}`, {
                        preserveScroll: true,
                    });
                    setDeleting(null);
                }}
                onCancel={() => setDeleting(null)}
            />
        </PartnerLayout>
    );
}
