import { Head, Link, router } from '@inertiajs/react';
import { CircleCheckBig, Clock, Download, Pencil, Send, Upload, UserPlus, UserX, Users } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import {
    Badge,
    ButtonLink,
    Card,
    IconButton,
    Note,
    PageHeader,
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
 * H §5 — سجل موظفي المنشأة والدعوات.
 *
 * One roster, two kinds of row. Inviting someone creates an *invitation*, not
 * an employee, so a list of employees alone leaves the account manager
 * wondering whether the invitation they sent yesterday went anywhere. Pending
 * and expired invitations therefore sit at the top of the same table, marked
 * as invitations and carrying the one action they support: resend.
 *
 * Departure is deactivation, never deletion: the confirm says so, because the
 * cascade behind it (sessions revoked, leaderships dropped, unconfirmed
 * participations cancelled) surprises people who expect a soft "hide".
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
    communities?: { id: number; name: string; category?: { id: number; name: string } | null }[];
};

type Invitation = {
    id: number;
    email: string | null;
    name: string | null;
    phone: string | null;
    employee_number: string | null;
    status: string;
    expires_at: string | null;
    send_count: number;
    last_sent_at: string | null;
    department?: { id: number; name: string } | null;
};

export default function CompanyEmployees({
    employees,
    departments,
    pendingInvitations,
    leaderIds,
    filters,
    sort,
    activeCount,
    totalCount,
}: {
    company: { id: number; name: string };
    employees: Paginated<Employee>;
    departments: { id: number; name: string; employees_count: number }[];
    pendingInvitations: Invitation[];
    leaderIds: number[];
    filters: { search?: string; status?: string; department_id?: string | number };
    sort: SortState;
    activeCount: number;
    totalCount: number;
    unreadNotifications: number;
}) {
    const [deactivating, setDeactivating] = useState<Employee | null>(null);
    const leaders = new Set(leaderIds);

    // Invitations belong to the whole roster, not to page 7 of it.
    const onFirstPage = employees.current_page === 1;
    const showInvitations = onFirstPage && pendingInvitations.length > 0 && !filters.status && !filters.department_id;

    return (
        <CompanyLayout>
            <Head title="الموظفون" />

            <PageHeader
                icon={Users}
                title="سجل موظفي المنشأة والدعوات"
                badge={`${totalCount} موظفاً مسجلاً`}
                subtitle={`إدارة صلاحيات التفعيل، والتنسيب للإدارات، وإرسال روابط الدعوة الموثوقة. ${activeCount} موظفاً مفعَّلاً هم أساس احتساب الفاتورة.`}
                actions={
                    <>
                        <div className="flex flex-col items-center">
                            <a
                                href="/company/reports/export/employees_activation?format=xlsx"
                                className="inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-colors bg-ink/5 text-ink border-[0.5px] border-ink/10 hover:bg-ink/10 text-xs px-3.5 py-2"
                            >
                                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                                تصدير الموظفين
                            </a>
                            <span className="text-[9px] text-ink/45 mt-0.5">(يُسجَّل في سجل التدقيق)</span>
                        </div>
                        <ButtonLink href="/company/employees/import" icon={Upload}>
                            رفع ملف CSV / Excel
                        </ButtonLink>
                        <ButtonLink href="/company/employees/create" tone="soft" icon={UserPlus}>
                            دعوة موظف
                        </ButtonLink>
                    </>
                }
            />

            <Note tone="info" title="ملاحظة ربط الحسابات المتقاطعة">
                إن كان رقم جوال الموظف مسجلاً في شركة أخرى على منصة تيمات، يُربط بنفس حسابه كعضوية منشأة جديدة ولا يُنشأ حساب
                مكرر — فيتبدّل بين منشآته برقم واحد.
            </Note>

            <Note tone="warning" title="التقارير التاريخية تُنسب للإدارة وقت الحدث لا الإدارة الحالية">
                تغيير الإدارة يُحفظ بتاريخه الدقيق دون تشويه السجلات السابقة.
            </Note>


            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="البحث بالاسم، البريد، الجوال، أو الرقم الوظيفي…" />
                    <FilterSelect
                        name="status"
                        label="حالة التفعيل"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'جميع حالات التفعيل'],
                            ['active', 'مفعّل (نشط)'],
                            ['inactive', 'معطَّل (مغادرة)'],
                        ]}
                    />
                    <FilterSelect
                        name="department_id"
                        label="الإدارة"
                        value={String(filters.department_id ?? '')}
                        options={[
                            ['', 'كافة الإدارات'],
                            ...departments.map(
                                (department) => [String(department.id), `${department.name} (${department.employees_count})`] as [string, string],
                            ),
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="الموظف والرقم الوظيفي" sortKey="name" sort={sort} />
                        </Th>
                        <Th>بريد العمل</Th>
                        <Th>
                            رقم الجوال
                            <span className="ms-1.5 px-1.5 py-0.5 rounded text-[10px] bg-ink/10 text-ink font-bold">يظهر لك وحدك</span>
                        </Th>
                        <Th>الإدارة الحالية</Th>
                        <Th>
                            <SortableHeader label="حالة التفعيل" sortKey="status" sort={sort} />
                        </Th>
                        <Th>المشاركات</Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {showInvitations &&
                            pendingInvitations.map((invitation) => (
                                <Tr key={`inv-${invitation.id}`} className="bg-ink/[0.015]">
                                    <Td>
                                        <span className="block font-extrabold text-ink/80">{invitation.name ?? '—'}</span>
                                        <span className="block font-mono text-[11px] text-ink/45">
                                            {invitation.employee_number ?? 'دعوة — لم يُفعّل بعد'}
                                        </span>
                                    </Td>
                                    <Td className="font-mono text-[11px] text-ink/60" dir="ltr">
                                        {invitation.email ?? '—'}
                                    </Td>
                                    <Td className="font-mono text-[11px] font-bold text-ink/70" dir="ltr">
                                        {invitation.phone ?? '—'}
                                    </Td>
                                    <Td className="text-ink/70">{invitation.department?.name ?? '—'}</Td>
                                    <Td>
                                        {invitation.status === 'expired' ? (
                                            <Badge tone="danger">انتهت صلاحية الرابط</Badge>
                                        ) : (
                                            <Badge tone="info" icon={Clock}>
                                                رابط مرسل
                                            </Badge>
                                        )}
                                        {invitation.expires_at && (
                                            <span className="block font-mono text-[10px] text-ink/45 mt-0.5">
                                                {new Date(invitation.expires_at).toLocaleDateString('ar-SA')}
                                            </span>
                                        )}
                                    </Td>
                                    <Td className="font-mono text-ink/40">—</Td>
                                    <Td className="text-center">
                                        <IconButton
                                            icon={Send}
                                            label="إعادة إرسال الدعوة"
                                            onClick={() =>
                                                router.post(`/company/invitations/${invitation.id}/resend`, {}, { preserveScroll: true })
                                            }
                                        />
                                    </Td>
                                </Tr>
                            ))}

                        {employees.data.map((employee) => (
                            <Tr key={employee.id}>
                                <Td>
                                    <span className="flex items-center gap-1.5 flex-wrap">
                                        <Link href={`/company/employees/${employee.id}/edit`} className="font-extrabold text-ink hover:underline">
                                            {employee.name}
                                        </Link>
                                        {leaders.has(employee.id) && <Badge tone="lead">قائد مجتمع</Badge>}
                                    </span>
                                    <span className="block font-mono text-[11px] text-ink/50">{employee.employee_number ?? '—'}</span>
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70" dir="ltr">
                                    {employee.email}
                                </Td>
                                <Td className="font-mono text-[11px] font-bold text-ink" dir="ltr">
                                    {employee.phone ?? '—'}
                                </Td>
                                <Td className="text-ink/85">{employee.department?.name ?? 'بلا إدارة'}</Td>
                                <Td>
                                    {employee.status === 'active' ? (
                                        <Badge tone="success" icon={CircleCheckBig}>
                                            مفعّل
                                        </Badge>
                                    ) : (
                                        <Badge tone="neutral" icon={UserX}>
                                            معطَّل (مغادرة)
                                        </Badge>
                                    )}
                                </Td>
                                <Td>
                                    <span className="font-mono font-bold text-ink">{employee.events_count}</span>
                                    <span className="block text-[10px] text-ink/50">فعالية</span>
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Link
                                            href={`/company/employees/${employee.id}/edit`}
                                            title="تعديل الموظف"
                                            className="p-1.5 rounded-lg bg-ink/5 hover:bg-ink/10 text-ink transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                                        </Link>
                                        {employee.status !== 'inactive' && (
                                            <IconButton icon={UserX} label="تعطيل الحساب" tone="danger" onClick={() => setDeactivating(employee)} />
                                        )}
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={employees.data.length + (showInvitations ? pendingInvitations.length : 0)}
                            colSpan={7}
                            empty="لا موظفين مطابقين."
                            emptyHint="ادعُ موظفاً واحداً، أو ارفع ملف الموظفين دفعة واحدة."
                        />
                    </Tbody>
                </TableShell>

                {showInvitations && (
                    <p className="text-[11px] text-ink/50">
                        الصفوف الباهتة في الأعلى دعوات لم تُقبل بعد — ليست حسابات، ولا تُحتسب في الفوترة. الترقيم أدناه يخصّ الموظفين
                        المسجّلين وحدهم.
                    </p>
                )}

                <div className="flex items-center justify-between gap-3 flex-wrap">
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
                            <ConfirmRow label="الموظف" value={deactivating.name} strong />
                            <ConfirmRow label="القسم" value={deactivating.department?.name ?? 'بلا إدارة'} />
                            <ConfirmRow label="مجتمعاته" value={`${deactivating.communities?.length ?? 0} مجتمعاً يخرج منها`} />
                            <ConfirmRow label="أثر الفوترة" value="لا يُحتسب ضمن الموظفين المفعَّلين في الدورة القادمة" strong />
                        </>
                    )
                }
                confirmLabel="نعم، عطّل الحساب"
                onConfirm={() => {
                    router.delete(`/company/employees/${deactivating?.id}`, { preserveScroll: true });
                    setDeactivating(null);
                }}
                onCancel={() => setDeactivating(null)}
            />
        </CompanyLayout>
    );
}
