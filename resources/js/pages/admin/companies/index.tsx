import { Head, Link, router } from '@inertiajs/react';
import { Building2, CircleCheckBig, KeyRound, Pencil, Plus, X } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, ButtonLink, Card, IconButton, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
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
    commercial_registration: string | null;
    contract_fee_per_activated_employee: string | number | null;
    event_creation_blocked_at: string | null;
    created_at: string | null;
    employees?: unknown[];
};

export const COMPANY_STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
    pending: { label: 'طلب جديد', tone: 'warning' },
    review: { label: 'قيد المراجعة', tone: 'warning' },
    active: { label: 'مفعّلة', tone: 'success' },
    rejected: { label: 'مرفوضة', tone: 'danger' },
    suspended: { label: 'موقوفة', tone: 'danger' },
};

export default function AdminCompanies({
    companies,
    stats,
    filters,
    sort,
}: {
    companies: Paginated<Company>;
    stats: { total: number; pending: number; review: number; active: number; rejected: number };
    filters: { search?: string; status?: string };
    sort: SortState;
}) {
    const [deciding, setDeciding] = useState<{ company: Company; decision: 'approve' | 'reject' } | null>(null);
    const [reason, setReason] = useState('');

    return (
        <AdminLayout>
            <Head title="الشركات والعقود" />

            <PageHeader
                icon={Building2}
                title="الشركات والعقود"
                subtitle="اعتماد طلبات التسجيل، وضبط شروط العقد التي تُبنى عليها الفوترة الشهرية."
                actions={
                    <ButtonLink href="/admin/companies/create" icon={Plus}>
                        إضافة شركة
                    </ButtonLink>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي الشركات" value={stats.total} />
                <StatCard label="بانتظار الاعتماد" value={stats.pending + stats.review} tone={stats.pending + stats.review > 0 ? 'warning' : 'success'} />
                <StatCard label="مفعّلة" value={stats.active} tone="success" />
                <StatCard label="مرفوضة" value={stats.rejected} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث باسم الشركة…" />
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
                            <SortableHeader label="الشركة" sortKey="name" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="القطاع" sortKey="sector" sort={sort} />
                        </Th>
                        <Th>مسؤول الحساب</Th>
                        <Th>الموظفون</Th>
                        <Th>رسم الموظف</Th>
                        <Th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {companies.data.map((company) => (
                            <Tr key={company.id}>
                                <Td>
                                    <Link href={`/admin/companies/${company.id}/edit`} className="font-extrabold text-ink hover:underline">
                                        {company.name}
                                    </Link>
                                    <span className="block font-mono text-[11px] text-ink/50" dir="ltr">
                                        {company.email}
                                    </span>
                                    {company.event_creation_blocked_at && <Badge tone="danger">إنشاء الفعاليات موقوف</Badge>}
                                </Td>
                                <Td className="text-ink/85">{company.sector ?? '—'}</Td>
                                <Td>
                                    <span className="text-ink/85 block">{company.contact_name ?? '—'}</span>
                                    <span className="font-mono text-[11px] text-ink/50" dir="ltr">
                                        {company.contact_phone ?? ''}
                                    </span>
                                </Td>
                                <Td className="font-mono font-bold text-ink">{company.employees?.length ?? 0}</Td>
                                <Td className="font-mono text-ink/80">
                                    {company.contract_fee_per_activated_employee ?? (
                                        <span className="text-danger font-bold">بلا عقد</span>
                                    )}
                                </Td>
                                <Td>
                                    <Badge tone={COMPANY_STATUS[company.status]?.tone ?? 'neutral'}>
                                        {COMPANY_STATUS[company.status]?.label ?? company.status}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        {(company.status === 'pending' || company.status === 'review') && (
                                            <>
                                                <IconButton
                                                    icon={CircleCheckBig}
                                                    label="اعتماد الشركة"
                                                    onClick={() => setDeciding({ company, decision: 'approve' })}
                                                />
                                                <IconButton
                                                    icon={X}
                                                    label="رفض الطلب"
                                                    tone="danger"
                                                    onClick={() => {
                                                        setReason('');
                                                        setDeciding({ company, decision: 'reject' });
                                                    }}
                                                />
                                            </>
                                        )}
                                        <Link
                                            href={`/admin/companies/${company.id}/edit`}
                                            title="تعديل الشركة والعقد"
                                            className="p-1.5 rounded-lg bg-ink/5 hover:bg-ink/10 text-ink transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                                        </Link>
                                        <IconButton
                                            icon={KeyRound}
                                            label="إرسال رابط إعادة تعيين كلمة المرور"
                                            onClick={() => router.post(`/admin/companies/${company.id}/reset-password`, {}, { preserveScroll: true })}
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

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={companies} />
                    <Pagination page={companies} />
                </div>
            </Card>

            <ConfirmModal
                open={deciding !== null}
                tone={deciding?.decision === 'reject' ? 'danger' : 'default'}
                title={deciding?.decision === 'approve' ? 'اعتماد الشركة' : 'رفض طلب التسجيل'}
                message={
                    deciding?.decision === 'approve'
                        ? 'يُفتح حساب الشركة ويصل مسؤول الحساب رابط تفعيل. تأكد من ضبط شروط العقد قبل أول دورة فوترة.'
                        : 'يُبلَّغ مقدّم الطلب بالرفض وسببه، ولا يُفتح الحساب.'
                }
                details={
                    deciding && (
                        <>
                            <ConfirmRow label="الشركة" value={deciding.company.name} strong />
                            <ConfirmRow label="مسؤول الحساب" value={deciding.company.contact_name ?? '—'} />
                            <ConfirmRow label="السجل التجاري" value={deciding.company.commercial_registration ?? '—'} />
                            {deciding.decision === 'reject' && (
                                <div className="pt-2">
                                    <label htmlFor="reject-reason" className="block text-[11px] font-bold text-ink mb-1">
                                        سبب الرفض
                                    </label>
                                    <textarea
                                        id="reject-reason"
                                        rows={2}
                                        value={reason}
                                        onChange={(event) => setReason(event.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                                    />
                                </div>
                            )}
                        </>
                    )
                }
                confirmLabel={deciding?.decision === 'approve' ? 'اعتماد وفتح الحساب' : 'تأكيد الرفض'}
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
