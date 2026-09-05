import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    CircleCheckBig,
    KeyRound,
    Pencil,
    Plus,
    X,
} from 'lucide-react';
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
import AdminLayout from '@/layouts/admin-layout';
import { companyStatus } from '@/lib/status';
import type { Paginated, SortState } from '@/types';

/**
 * H §16 — الشركات والعقود.
 *
 * Approving a company is what opens the platform to its whole workforce, and
 * rejecting one closes a door someone is waiting behind — both go through a
 * confirm that names the company and the consequence.
 */
type Company = {
    id: number;
    name: string;
    email: string;
    sector: string | null;
    city: string | null;
    status: string;
    contact_name: string | null;
    contact_phone: string | null;
    support_agent_user_id: number | null;
    commercial_registration: string | null;
    contract_fee_per_activated_employee: string | number | null;
    event_creation_blocked_at: string | null;
    created_at: string | null;
    employees_count?: number;
    contract_monthly_minimum: string | number | null;
    contract_fee_display: string | null;
    contract_minimum_display: string | null;
    contract_coordinator_service: boolean | number | null;
    vat_number: string | null;
    approved_at: string | null;
};

type AccountManager = {
    id: number;
    name: string;
    phone: string | null;
    email: string;
};

export default function AdminCompanies({
    companies,
    accountManagers,
    supportAgentNames,
    stats,
    filters,
    sort,
}: {
    companies: Paginated<Company>;
    accountManagers: Record<string, AccountManager[]>;
    supportAgentNames: Record<string, string>;
    stats: {
        total: number;
        pending: number;
        review: number;
        active: number;
        rejected: number;
    };
    filters: { search?: string; status?: string };
    sort: SortState;
}) {
    const [deciding, setDeciding] = useState<{
        company: Company;
        decision: 'approve' | 'reject';
    } | null>(null);
    const [reason, setReason] = useState('');

    return (
        <AdminLayout>
            <Head title="الشركات والعقود" />

            <PageHeader
                icon={Building2}
                title="إدارة الشركات والعقود التجارية"
                badge={`${stats.active} عقداً نشطاً`}
                subtitle="تهيئة رسوم الموظف المفعَّل، والحد الأدنى الشهري، وخدمة المنسّق المُدار — وعليها تُبنى الفوترة."
                actions={
                    <ButtonLink href="/admin/companies/create" icon={Plus}>
                        إضافة شركة
                    </ButtonLink>
                }
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="إجمالي الشركات" value={stats.total} />
                <StatCard
                    label="بانتظار الاعتماد"
                    value={stats.pending + stats.review}
                    tone={
                        stats.pending + stats.review > 0 ? 'warning' : 'success'
                    }
                />
                <StatCard label="مفعّلة" value={stats.active} tone="success" />
                <StatCard label="مرفوضة" value={stats.rejected} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput
                        value={filters.search ?? ''}
                        placeholder="ابحث باسم الشركة…"
                    />
                    <FilterSelect
                        name="status"
                        label="حالة الشركة"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['pending', 'طلب جديد'],
                            ['review', 'قيد المراجعة'],
                            ['active', 'مفعّلة'],
                            ['rejected', 'مرفوضة'],
                        ]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader
                                label="الشركة"
                                sortKey="name"
                                sort={sort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="القطاع"
                                sortKey="sector"
                                sort={sort}
                            />
                        </Th>
                        <Th>مسؤول الحساب</Th>
                        <Th>الموظفون</Th>
                        <Th>بنود العقد</Th>
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
                        {companies.data.map((company) => (
                            <Tr key={company.id}>
                                <Td>
                                    <Link
                                        href={`/admin/companies/${company.id}/edit`}
                                        className="font-extrabold text-ink hover:underline"
                                    >
                                        {company.name}
                                    </Link>
                                    <span
                                        className="block font-mono text-[11px] text-ink/50"
                                        dir="ltr"
                                    >
                                        {company.email}
                                    </span>
                                    {company.event_creation_blocked_at && (
                                        <Badge tone="danger">
                                            إنشاء الفعاليات موقوف
                                        </Badge>
                                    )}
                                </Td>
                                <Td className="text-ink/85">
                                    {company.sector ?? '—'}
                                </Td>
                                <Td>
                                    <span className="block text-ink/85">
                                        {company.contact_name ?? '—'}
                                    </span>
                                    <span
                                        className="font-mono text-[11px] text-ink/50"
                                        dir="ltr"
                                    >
                                        {company.contact_phone ?? ''}
                                    </span>
                                    <ManagerList
                                        managers={
                                            accountManagers[
                                                String(company.id)
                                            ] ?? []
                                        }
                                    />
                                    {company.support_agent_user_id && (
                                        <span className="mt-0.5 block text-[11px] text-ink/45">
                                            دعم:{' '}
                                            {supportAgentNames[
                                                String(
                                                    company.support_agent_user_id,
                                                )
                                            ] ?? '—'}
                                        </span>
                                    )}
                                </Td>
                                <Td className="font-mono font-bold text-ink">
                                    {company.employees_count ?? 0}
                                </Td>
                                <Td>
                                    <ContractTerms company={company} />
                                </Td>
                                <Td>
                                    <Badge
                                        tone={
                                            companyStatus(company.status).tone
                                        }
                                    >
                                        {companyStatus(company.status).label}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        {(company.status === 'pending' ||
                                            company.status === 'review') && (
                                            <>
                                                <IconButton
                                                    icon={CircleCheckBig}
                                                    label="اعتماد الشركة"
                                                    onClick={() =>
                                                        setDeciding({
                                                            company,
                                                            decision: 'approve',
                                                        })
                                                    }
                                                />
                                                <IconButton
                                                    icon={X}
                                                    label="رفض الطلب"
                                                    tone="danger"
                                                    onClick={() => {
                                                        setReason('');
                                                        setDeciding({
                                                            company,
                                                            decision: 'reject',
                                                        });
                                                    }}
                                                />
                                            </>
                                        )}
                                        <Link
                                            href={`/admin/companies/${company.id}/edit`}
                                            title="تعديل الشركة والعقد"
                                            className="rounded-lg bg-ink/5 p-1.5 text-ink transition-colors hover:bg-ink/10"
                                        >
                                            <Pencil
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                        <IconButton
                                            icon={KeyRound}
                                            label="إرسال رابط إعادة تعيين كلمة المرور"
                                            onClick={() =>
                                                router.post(
                                                    `/admin/companies/${company.id}/reset-password`,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        />
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={companies.data.length}
                            colSpan={7}
                            empty="لا توجد شركات مطابقة."
                            emptyHint="جرّب تغيير حالة التصفية أو مصطلح البحث."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <ResultCount page={companies} />
                    <Pagination page={companies} />
                </div>
            </Card>

            <ConfirmModal
                open={deciding !== null}
                tone={deciding?.decision === 'reject' ? 'danger' : 'default'}
                title={
                    deciding?.decision === 'approve'
                        ? 'اعتماد الشركة'
                        : 'رفض طلب التسجيل'
                }
                message={
                    deciding?.decision === 'approve'
                        ? 'يُفتح حساب الشركة ويصل مسؤول الحساب رابط تفعيل. تأكد من ضبط شروط العقد قبل أول دورة فوترة.'
                        : 'يُبلَّغ مقدّم الطلب بالرفض وسببه، ولا يُفتح الحساب.'
                }
                details={
                    deciding && (
                        <>
                            <ConfirmRow
                                label="الشركة"
                                value={deciding.company.name}
                                strong
                            />
                            <ConfirmRow
                                label="مسؤول الحساب"
                                value={deciding.company.contact_name ?? '—'}
                            />
                            <ConfirmRow
                                label="السجل التجاري"
                                value={
                                    deciding.company.commercial_registration ??
                                    '—'
                                }
                            />
                            {deciding.decision === 'reject' && (
                                <div className="pt-2">
                                    <label
                                        htmlFor="reject-reason"
                                        className="mb-1 block text-[11px] font-bold text-ink"
                                    >
                                        سبب الرفض
                                    </label>
                                    <textarea
                                        id="reject-reason"
                                        rows={2}
                                        value={reason}
                                        onChange={(event) =>
                                            setReason(event.target.value)
                                        }
                                        className="w-full rounded-xl border-[0.5px] border-ink/20 bg-surface px-3 py-2 text-xs focus:border-ink focus:outline-none"
                                    />
                                </div>
                            )}
                        </>
                    )
                }
                confirmLabel={
                    deciding?.decision === 'approve'
                        ? 'اعتماد وفتح الحساب'
                        : 'تأكيد الرفض'
                }
                onConfirm={() => {
                    router.post(
                        `/admin/companies/${deciding?.company.id}/${deciding?.decision}`,
                        deciding?.decision === 'reject' ? { reason } : {},
                        { preserveScroll: true },
                    );
                    setDeciding(null);
                }}
                onCancel={() => setDeciding(null)}
            />
        </AdminLayout>
    );
}

/**
 * بنود العقد الثلاثة معاً.
 *
 * The three terms decide the invoice together, and any one of them missing
 * means the company silently never enters the billing run — so the absence is
 * stated, not left as an empty cell.
 */
function ContractTerms({ company }: { company: Company }) {
    const fee = company.contract_fee_display;

    if (fee === null || fee === undefined) {
        return (
            <span className="text-[11px] font-bold text-danger">
                بلا عقد — لا تدخل الفوترة
            </span>
        );
    }

    return (
        <div className="space-y-0.5 text-[11px]">
            <div className="flex items-baseline gap-1.5">
                <span className="font-mono font-bold text-ink">{fee}</span>
                <span className="text-ink/50">ر.س / موظف مفعَّل</span>
            </div>
            <div className="text-[10px] text-ink/55">
                الحد الأدنى:{' '}
                {company.contract_minimum_display ? (
                    <span className="font-mono">
                        {company.contract_minimum_display} ر.س
                    </span>
                ) : (
                    'بلا حد أدنى'
                )}
            </div>
            <div className="text-[10px]">
                {company.contract_coordinator_service ? (
                    <span className="font-bold text-lead">
                        المنسّق المُدار مفعَّل
                    </span>
                ) : (
                    <span className="text-ink/45">إدارة ذاتية</span>
                )}
            </div>
        </div>
    );
}

/** مسؤولو الحساب — من يدير العقد فعلاً داخل الشركة. */
function ManagerList({ managers }: { managers: AccountManager[] }) {
    if (managers.length === 0) {
        return (
            <span className="mt-0.5 block text-[10px] font-bold text-warning">
                بلا مسؤول حساب
            </span>
        );
    }

    return (
        <span className="mt-0.5 block text-[10px] text-ink/55">
            {managers.map((manager) => manager.name).join('، ')}
        </span>
    );
}
