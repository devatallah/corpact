import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Upload, UserPlus, UserX, Users } from 'lucide-react';
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
import {
    Badge,
    ButtonLink,
    Card,
    IconButton,
    PageHeader,
    StatCard,
    Tbody,
    Td,
    Th,
    Thead,
    TableShell,
    Tr,
} from '@/components/portal/ui';
import CompanyLayout from '@/layouts/company-layout';
import { employeeStatus } from '@/lib/status';
import type { Paginated, SortState } from '@/types';

/**
 * H §5 — ملف الموظفين.
 *
 * Departure is deactivation, never deletion: the confirm says so, because the
 * cascade behind it (sessions revoked, leaderships dropped, unconfirmed
 * participations cancelled) surprises people who expect a soft "hide".
 * History stays, and the membership keeps its `left_at` for the cycle invoice.
 */
type Employee = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    employee_number: string | null;
    status: string;
    events_count: number;
    department?: { id: number; name: string } | null;
    communities?: {
        id: number;
        name: string;
        category?: { id: number; name: string } | null;
    }[];
};

export default function CompanyEmployees({
    employees,
    departments,
    filters,
    sort,
    activeCount,
    totalCount,
}: {
    company: { id: number; name: string };
    employees: Paginated<Employee>;
    departments: { id: number; name: string }[];
    filters: {
        search?: string;
        status?: string;
        department_id?: string | number;
    };
    sort: SortState;
    activeCount: number;
    totalCount: number;
    unreadNotifications: number;
}) {
    const [deactivating, setDeactivating] = useState<Employee | null>(null);

    return (
        <CompanyLayout>
            <Head title="الموظفون" />

            <PageHeader
                icon={Users}
                title="الموظفون"
                subtitle="الفوترة على الموظف المفعَّل — الموظف المعطَّل لا يُحتسب في الدورة القادمة."
                actions={
                    <>
                        <ButtonLink
                            href="/company/employees/import"
                            tone="soft"
                            icon={Upload}
                        >
                            استيراد ملف
                        </ButtonLink>
                        <ButtonLink
                            href="/company/employees/create"
                            icon={UserPlus}
                        >
                            دعوة موظف
                        </ButtonLink>
                    </>
                }
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="إجمالي الموظفين" value={totalCount} />
                <StatCard
                    label="مفعّلون"
                    value={activeCount}
                    tone="success"
                    hint="أساس احتساب الفاتورة"
                />
                <StatCard
                    label="غير مفعّلين"
                    value={totalCount - activeCount}
                />
                <StatCard label="الأقسام" value={departments.length} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث بالاسم أو البريد…"
                    />
                    <FilterSelect
                        name="status"
                        label="الحالة"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['active', 'مفعّل'],
                            ['pending_verification', 'بانتظار التفعيل'],
                            ['inactive', 'معطّل'],
                        ]}
                    />
                    <FilterSelect
                        name="department_id"
                        label="القسم"
                        value={String(filters.department_id ?? '')}
                        options={[
                            ['', 'كل الأقسام'],
                            ...departments.map(
                                (department) =>
                                    [
                                        String(department.id),
                                        department.name,
                                    ] as [string, string],
                            ),
                        ]}
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
                        <Th>القسم</Th>
                        <Th>المجتمعات</Th>
                        <Th>المشاركات</Th>
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
                        {employees.data.map((employee) => (
                            <Tr key={employee.id}>
                                <Td>
                                    <Link
                                        href={`/company/employees/${employee.id}/edit`}
                                        className="font-extrabold text-ink hover:underline"
                                    >
                                        {employee.name}
                                    </Link>
                                    <span
                                        className="block font-mono text-[11px] text-ink/50"
                                        dir="ltr"
                                    >
                                        {employee.email}
                                    </span>
                                </Td>
                                <Td className="text-ink/85">
                                    {employee.department?.name ?? 'بلا إدارة'}
                                </Td>
                                <Td>
                                    <div className="flex flex-wrap gap-1">
                                        {(employee.communities ?? [])
                                            .slice(0, 2)
                                            .map((community) => (
                                                <Badge
                                                    key={community.id}
                                                    tone="neutral"
                                                >
                                                    {community.name}
                                                </Badge>
                                            ))}
                                        {(employee.communities?.length ?? 0) >
                                            2 && (
                                            <span className="text-[11px] text-ink/50">
                                                +
                                                {(employee.communities
                                                    ?.length ?? 0) - 2}
                                            </span>
                                        )}
                                        {(employee.communities?.length ?? 0) ===
                                            0 && (
                                            <span className="text-ink/40">
                                                —
                                            </span>
                                        )}
                                    </div>
                                </Td>
                                <Td className="font-mono font-bold text-ink">
                                    {employee.events_count}
                                </Td>
                                <Td>
                                    <Badge
                                        tone={
                                            employeeStatus(employee.status).tone
                                        }
                                    >
                                        {employeeStatus(employee.status).label}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Link
                                            href={`/company/employees/${employee.id}/edit`}
                                            title="تعديل الموظف"
                                            className="rounded-lg bg-ink/5 p-1.5 text-ink transition-colors hover:bg-ink/10"
                                        >
                                            <Pencil
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                        {employee.status !== 'inactive' && (
                                            <IconButton
                                                icon={UserX}
                                                label="تعطيل الحساب"
                                                tone="danger"
                                                onClick={() =>
                                                    setDeactivating(employee)
                                                }
                                            />
                                        )}
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={employees.data.length}
                            colSpan={6}
                            empty="لا موظفين مطابقين."
                            emptyHint="ادعُ موظفاً واحداً، أو ارفع ملف الموظفين دفعة واحدة."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={employees} />
                    <Pagination page={employees} />
                </div>
            </Card>

            <ConfirmModal
                open={deactivating !== null}
                tone="danger"
                title="تعطيل حساب الموظف"
                message="لا يُحذف الموظف — يُعطَّل. تُنهى جلساته فوراً، وتُزال قياداته للمجتمعات، وتُلغى مشاركاته غير المؤكدة. سجله وحضوره السابق يبقى في التقارير."
                details={
                    deactivating && (
                        <>
                            <ConfirmRow
                                label="الموظف"
                                value={deactivating.name}
                                strong
                            />
                            <ConfirmRow
                                label="القسم"
                                value={
                                    deactivating.department?.name ?? 'بلا إدارة'
                                }
                            />
                            <ConfirmRow
                                label="مجتمعاته"
                                value={`${deactivating.communities?.length ?? 0} مجتمعاً يخرج منها`}
                            />
                            <ConfirmRow
                                label="أثر الفوترة"
                                value="لا يُحتسب ضمن الموظفين المفعَّلين في الدورة القادمة"
                                strong
                            />
                        </>
                    )
                }
                confirmLabel="نعم، عطّل الحساب"
                onConfirm={() => {
                    router.delete(`/company/employees/${deactivating?.id}`, {
                        preserveScroll: true,
                    });
                    setDeactivating(null);
                }}
                onCancel={() => setDeactivating(null)}
            />
        </CompanyLayout>
    );
}
