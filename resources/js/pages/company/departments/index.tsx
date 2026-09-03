import { Head, router, useForm } from '@inertiajs/react';
import { Building, Pencil, Plus, Trash2, X } from 'lucide-react';
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
import {
    Button,
    Card,
    IconButton,
    INPUT,
    Note,
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
import type { Paginated, SortState } from '@/types';

/**
 * H §5 — الأقسام.
 *
 * Departments exist to slice participation reports, so deleting one is
 * refused while it still holds employees or sits in an active league — the
 * server enforces both, and the confirm names which one would break.
 */
type Department = {
    id: number;
    name: string;
    employees_count: number;
    created_at: string | null;
};

type Participation = Record<
    string,
    { department_id: number | null; attendees: number; employees: number; rate: number }
>;

export default function CompanyDepartments({
    departments,
    filters,
    sort,
    participation,
    stats,
}: {
    departments: Paginated<Department>;
    filters: { search?: string };
    sort: SortState;
    participation: Participation;
    stats: {
        total: number;
        assigned_employees: number;
        total_employees: number;
        assigned_share: number;
        average_activation: number;
    };
}) {
    const createForm = useForm({ name: '' });
    const [editing, setEditing] = useState<Department | null>(null);
    const [editName, setEditName] = useState('');
    const [deleting, setDeleting] = useState<Department | null>(null);

    return (
        <CompanyLayout>
            <Head title="الأقسام" />

            <PageHeader
                icon={Building}
                title="شجرة الإدارات والهيكل التنظيمي"
                badge={`${stats.total} إدارات معتمدة`}
                subtitle="تحديد الهيكل الإداري لربط الموظفين والفعاليات والتقارير التاريخية."
            />

            <Note tone="warning" title="قاعدة أساسية قبل رفع ملف الموظفين">
                «التقارير كلها تُبنى على الإدارات، وإنشاؤها لاحقاً يعني بيانات ناقصة.» تأكد من مطابقة أسماء الإدارات هنا مع
                عمود الإدارة في ملف الموظفين لتفادي أخطاء التحقق عند الرفع.
            </Note>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="إجمالي الإدارات" value={stats.total} hint="تغطي قطاعات المنشأة" />
                <StatCard
                    label="الموظفون المنسوبون"
                    value={stats.assigned_employees}
                    hint={`${stats.assigned_share}٪ من ${stats.total_employees} موظفاً منسوبون لإدارات`}
                    tone={stats.assigned_share === 100 ? 'success' : undefined}
                />
                <StatCard
                    label="متوسط معدل التفعيل"
                    value={`${stats.average_activation}٪`}
                    hint="نسبة المشاركة في الفعاليات"
                />
            </div>

            {/* ── إضافة قسم ── */}
            <Card padding="p-4">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        createForm.post('/company/departments', {
                            preserveScroll: true,
                            onSuccess: () => createForm.reset(),
                        });
                    }}
                    className="flex flex-wrap items-end gap-3"
                >
                    <div className="min-w-[220px] flex-1">
                        <label
                            htmlFor="new-department"
                            className="mb-1.5 block text-[11px] font-bold text-ink"
                        >
                            اسم القسم
                        </label>
                        <input
                            id="new-department"
                            className={INPUT}
                            value={createForm.data.name}
                            onChange={(event) =>
                                createForm.setData('name', event.target.value)
                            }
                        />
                        {createForm.errors.name && (
                            <p className="mt-1 text-[11px] text-danger">
                                {createForm.errors.name}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        icon={Plus}
                        disabled={
                            createForm.processing ||
                            !createForm.data.name.trim()
                        }
                    >
                        إضافة قسم
                    </Button>
                </form>
            </Card>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث باسم القسم…"
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="القسم"
                                sortKey="name"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="الموظفون"
                                sortKey="employees_count"
                                sort={sort}
                            />
                        </Th>
                        <Th>معدل التفعيل</Th>
                        <Th>
                            <SortableHeader
                                label="تاريخ الإنشاء"
                                sortKey="created_at"
                                sort={sort}
                            />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {departments.data.map((department) => (
                            <Tr key={department.id}>
                                <Td>
                                    {editing?.id === department.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                className={INPUT}
                                                value={editName}
                                                onChange={(event) =>
                                                    setEditName(
                                                        event.target.value,
                                                    )
                                                }
                                                aria-label="اسم القسم"
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    router.put(
                                                        `/company/departments/${department.id}`,
                                                        { name: editName },
                                                        {
                                                            preserveScroll: true,
                                                            onSuccess: () =>
                                                                setEditing(
                                                                    null,
                                                                ),
                                                        },
                                                    );
                                                }}
                                            >
                                                حفظ
                                            </Button>
                                            <IconButton
                                                icon={X}
                                                label="إلغاء التعديل"
                                                onClick={() => setEditing(null)}
                                            />
                                        </div>
                                    ) : (
                                        <span className="font-extrabold text-ink">
                                            {department.name}
                                        </span>
                                    )}
                                </Td>
                                <Td>
                                    <span className="font-mono font-bold text-ink">
                                        {department.employees_count}
                                    </span>
                                    <span className="block text-[10px] text-ink/50">
                                        موظفاً
                                    </span>
                                </Td>
                                <Td>
                                    <ActivationRate
                                        rate={
                                            participation[
                                                String(department.id)
                                            ]?.rate
                                        }
                                    />
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {department.created_at
                                        ? new Date(
                                              department.created_at,
                                          ).toLocaleDateString('ar-SA')
                                        : '—'}
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <IconButton
                                            icon={Pencil}
                                            label="تعديل اسم القسم"
                                            onClick={() => {
                                                setEditName(department.name);
                                                setEditing(department);
                                            }}
                                        />
                                        <IconButton
                                            icon={Trash2}
                                            label="حذف القسم"
                                            tone="danger"
                                            onClick={() =>
                                                setDeleting(department)
                                            }
                                        />
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={departments.data.length}
                            colSpan={5}
                            empty="لا أقسام بعد."
                            emptyHint="أضف أقسامك لتظهر المشاركة موزّعة عليها في لوحة القيادة والتقارير."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={departments} />
                    <Pagination page={departments} />
                </div>
            </Card>

            <Note title="حذف القسم مشروط">
                لا يُحذف قسم فيه موظفون، ولا قسم مشترك في بطولة نشطة. انقل
                الموظفين أولاً أو انتظر انتهاء البطولة.
            </Note>

            <ConfirmModal
                open={deleting !== null}
                tone="danger"
                title="حذف القسم"
                message="يُحذف القسم من قائمة الأقسام. مشاركات الموظفين السابقة تبقى منسوبة إليه في التقارير التاريخية."
                details={
                    deleting && (
                        <>
                            <ConfirmRow
                                label="القسم"
                                value={deleting.name}
                                strong
                            />
                            <ConfirmRow
                                label="الموظفون فيه"
                                value={String(deleting.employees_count)}
                            />
                            {deleting.employees_count > 0 && (
                                <ConfirmRow
                                    label="تنبيه"
                                    value="سيُرفض الحذف — انقل الموظفين إلى قسم آخر أولاً"
                                    strong
                                />
                            )}
                        </>
                    )
                }
                confirmLabel="نعم، احذف القسم"
                onConfirm={() => {
                    router.delete(`/company/departments/${deleting?.id}`, {
                        preserveScroll: true,
                    });
                    setDeleting(null);
                }}
                onCancel={() => setDeleting(null)}
            />
        </CompanyLayout>
    );
}

/**
 * معدل تفعيل الإدارة.
 *
 * Departments created this cycle have no measurement yet, and «0٪» would read
 * as "nobody showed up" rather than "nothing to measure" — so an absent rate
 * says so in words.
 */
function ActivationRate({ rate }: { rate?: number }) {
    if (rate === undefined) {
        return <span className="text-[11px] text-ink/40">لا قياس بعد</span>;
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-ink/10 overflow-hidden max-w-[80px]" dir="ltr">
                <div className="h-full bg-lime rounded-full" style={{ width: `${Math.min(rate, 100)}%` }} />
            </div>
            <span className="font-mono text-[11px] font-bold text-ink">{rate}٪</span>
        </div>
    );
}
