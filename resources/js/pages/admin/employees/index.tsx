import { Head, Link, router } from '@inertiajs/react';
import { KeyRound, Pencil, Plus, UserRound } from 'lucide-react';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, ButtonLink, Card, IconButton, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §16 — الموظفون عبر كل الشركات.
 *
 * A cross-company list exists for support and diagnosis, not for browsing:
 * the phone column is deliberately absent here (it is the login identity),
 * and the account manager's own list is where day-to-day membership work
 * belongs.
 */
type EmployeeRow = {
    id: number;
    name: string;
    email: string;
    employee_number: string | null;
    status: string;
    communities_count: number;
    events_count: number;
    last_active_at: string | null;
    anonymized_at: string | null;
    company?: { id: number; name: string } | null;
    department?: { id: number; name: string } | null;
};

const EMPLOYEE_STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
    active: { label: 'مفعّل', tone: 'success' },
    pending_verification: { label: 'بانتظار التفعيل', tone: 'warning' },
    invited: { label: 'مدعو', tone: 'warning' },
    inactive: { label: 'معطّل', tone: 'neutral' },
    banned: { label: 'محظور', tone: 'danger' },
};

export default function AdminEmployees({
    employees,
    totalEmployees,
    companies,
    departments,
    filters,
    sort,
}: {
    employees: Paginated<EmployeeRow>;
    totalEmployees: number;
    companies: { id: number; name: string }[];
    departments: { id: number; name: string }[];
    filters: { search?: string; company_id?: string; status?: string; department_id?: string };
    sort: SortState;
}) {
    return (
        <AdminLayout>
            <Head title="الموظفون" />

            <PageHeader
                icon={UserRound}
                title="الموظفون عبر المنصة"
                subtitle="عرض تشخيصي عبر كل الشركات. إدارة العضويات اليومية تتم من بوابة مسؤول الحساب في الشركة."
                actions={
                    <ButtonLink href="/admin/employees/create" icon={Plus}>
                        إضافة موظف
                    </ButtonLink>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="إجمالي الموظفين" value={totalEmployees} />
                <StatCard label="المعروض بعد التصفية" value={employees.total} />
                <StatCard label="الشركات المسجّلة" value={companies.length} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالاسم أو البريد…" />
                    <FilterSelect
                        name="company_id"
                        label="الشركة"
                        value={filters.company_id ?? ''}
                        options={[['', 'كل الشركات'], ...companies.map((company): [string, string] => [String(company.id), company.name])]}
                    />
                    <FilterSelect
                        name="status"
                        label="حالة الحساب"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['active', 'مفعّل'],
                            ['pending_verification', 'بانتظار التفعيل'],
                            ['inactive', 'معطّل'],
                            ['banned', 'محظور'],
                        ]}
                    />
                </Toolbar>

                {departments.length > 0 && (
                    <Toolbar>
                        <FilterSelect
                            name="department_id"
                            label="الإدارة"
                            value={filters.department_id ?? ''}
                            options={[['', 'كل الإدارات'], ...departments.map((d): [string, string] => [String(d.id), d.name])]}
                        />
                    </Toolbar>
                )}

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="الموظف" sortKey="name" sort={sort} />
                        </Th>
                        <Th>الشركة</Th>
                        <Th>الإدارة</Th>
                        <Th>
                            <SortableHeader label="المجتمعات" sortKey="communities_count" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="الفعاليات" sortKey="events_count" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {employees.data.map((employee) => (
                            <Tr key={employee.id}>
                                <Td>
                                    <Link href={`/admin/employees/${employee.id}/edit`} className="font-extrabold text-ink hover:underline">
                                        {employee.name}
                                    </Link>
                                    <span className="block font-mono text-[11px] text-ink/50" dir="ltr">
                                        {employee.email}
                                    </span>
                                    {employee.anonymized_at && <Badge tone="neutral">مُخفى الهوية</Badge>}
                                </Td>
                                <Td className="text-ink/85">{employee.company?.name ?? '—'}</Td>
                                <Td className="text-ink/85">{employee.department?.name ?? '—'}</Td>
                                <Td className="font-mono font-bold text-ink">{employee.communities_count}</Td>
                                <Td className="font-mono font-bold text-ink">{employee.events_count}</Td>
                                <Td>
                                    <Badge tone={EMPLOYEE_STATUS[employee.status]?.tone ?? 'neutral'}>
                                        {EMPLOYEE_STATUS[employee.status]?.label ?? employee.status}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Link
                                            href={`/admin/employees/${employee.id}/edit`}
                                            title="تعديل الموظف"
                                            className="p-1.5 rounded-lg bg-ink/5 hover:bg-ink/10 text-ink transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                                        </Link>
                                        <IconButton
                                            icon={KeyRound}
                                            label="إرسال رابط إعادة تعيين كلمة المرور"
                                            onClick={() => router.post(`/admin/employees/${employee.id}/reset-password`, {}, { preserveScroll: true })}
                                        />
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={employees.data.length}
                            colSpan={7}
                            empty="لا يوجد موظفون مطابقون."
                            emptyHint="جرّب تغيير الشركة أو الحالة أو مصطلح البحث."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={employees} />
                    <Pagination page={employees} />
                </div>
            </Card>

            <Note title="لماذا لا يظهر رقم الجوال هنا؟">
                رقم الجوال هو هوية الدخول، وعرضه في قائمة عابرة للشركات يوسّع سطح التسريب بلا حاجة تشغيلية. من يحتاجه لتشخيص
                بلاغ يجده في مركز الدعم بآخر أربعة أرقام فقط.
            </Note>
        </AdminLayout>
    );
}
