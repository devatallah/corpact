import { Head, Link, router } from '@inertiajs/react';
import { Ban, CircleCheckBig, KeyRound, Pencil, Plus, Users, X } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FilterSelect, Pagination, ResultCount, SearchInput, SortableHeader, Toolbar } from '@/components/list-controls';
import { ListStates } from '@/components/list-states';
import { Badge, ButtonLink, Card, IconButton, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { Paginated, SortState } from '@/types';

/**
 * H §17 — شبكة مزوّدي الخدمة.
 *
 * Approving a provider lets it receive company groups; it does not let it be
 * paid. The bank column is here for exactly that reason — an approved
 * provider with unapproved bank details accumulates statements that cannot be
 * transferred, and nobody notices until the provider calls.
 */
type Partner = {
    id: number;
    name: string;
    trade_name: string | null;
    email: string;
    city: string | null;
    district: string | null;
    venues_count: number | null;
    staff_count: number | null;
    commission_rate: string | number | null;
    status: string;
    bank_status: string;
    has_price_contract: boolean;
};

const PARTNER_STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
    pending: { label: 'طلب جديد', tone: 'warning' },
    active: { label: 'مفعّل', tone: 'success' },
    rejected: { label: 'مرفوض', tone: 'danger' },
    suspended: { label: 'موقوف', tone: 'danger' },
};

export default function AdminPartners({
    partners,
    stats,
    filters,
    sort,
    categories,
}: {
    partners: Paginated<Partner>;
    stats: { total: number; pending: number; active: number; rejected: number; suspended: number };
    filters: { search?: string; status?: string; category_id?: string };
    sort: SortState;
    categories: { id: number; name: string }[];
}) {
    const [deciding, setDeciding] = useState<{ partner: Partner; decision: 'approve' | 'reject' } | null>(null);
    const [reason, setReason] = useState('');

    return (
        <AdminLayout>
            <Head title="المزوّدون" />

            <PageHeader
                icon={Users}
                title="مزوّدو الخدمة"
                subtitle="اعتماد المرافق، ونسب العمولة، وحالة الحساب البنكي التي تحكم إمكانية الصرف."
                actions={
                    <ButtonLink href="/admin/partners/create" icon={Plus}>
                        إضافة مزوّد
                    </ButtonLink>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="إجمالي المزوّدين" value={stats.total} />
                <StatCard label="بانتظار الاعتماد" value={stats.pending} tone={stats.pending > 0 ? 'warning' : 'success'} />
                <StatCard label="مفعّلون" value={stats.active} tone="success" />
                <StatCard label="موقوفون أو مرفوضون" value={stats.suspended + stats.rejected} />
            </div>

            <Card padding="p-4" className="space-y-4">
                <Toolbar>
                    <SearchInput value={filters.search ?? ''} placeholder="ابحث بالاسم أو المدينة أو النشاط…" />
                    <FilterSelect
                        name="status"
                        label="حالة المزوّد"
                        value={filters.status ?? ''}
                        options={[
                            ['', 'كل الحالات'],
                            ['pending', 'طلب جديد'],
                            ['active', 'مفعّل'],
                            ['suspended', 'موقوف'],
                            ['rejected', 'مرفوض'],
                        ]}
                    />
                    <FilterSelect
                        name="category_id"
                        label="النشاط"
                        value={filters.category_id ?? ''}
                        options={[['', 'كل الأنشطة'], ...categories.map((category): [string, string] => [String(category.id), category.name])]}
                    />
                </Toolbar>

                <TableShell>
                    <Thead>
                        <Th>
                            <SortableHeader label="المزوّد" sortKey="name" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="المدينة" sortKey="city" sort={sort} />
                        </Th>
                        <Th>
                            <SortableHeader label="المرافق" sortKey="venues_count" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>
                            <SortableHeader label="العمولة" sortKey="commission_rate" sort={sort} initialDirection="desc" />
                        </Th>
                        <Th>الحساب البنكي</Th>
                        <Th>
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                        </Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>

                    <Tbody>
                        {partners.data.map((partner) => (
                            <Tr key={partner.id}>
                                <Td>
                                    <Link href={`/admin/partners/${partner.id}/edit`} className="font-extrabold text-ink hover:underline">
                                        {partner.trade_name ?? partner.name}
                                    </Link>
                                    <span className="block font-mono text-[11px] text-ink/50" dir="ltr">
                                        {partner.email}
                                    </span>
                                    {partner.has_price_contract && <Badge tone="lime">عقد سعر</Badge>}
                                </Td>
                                <Td>
                                    <span className="text-ink/85 block">{partner.city ?? '—'}</span>
                                    <span className="text-[11px] text-ink/50">{partner.district ?? ''}</span>
                                </Td>
                                <Td className="font-mono font-bold text-ink">{partner.venues_count ?? 0}</Td>
                                <Td className="font-mono text-ink/85">{partner.commission_rate ?? '—'}٪</Td>
                                <Td>
                                    <Badge
                                        tone={partner.bank_status === 'approved' ? 'success' : 'danger'}
                                        icon={partner.bank_status === 'approved' ? undefined : Ban}
                                    >
                                        {partner.bank_status === 'approved' ? 'معتمد' : 'غير معتمد'}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Badge tone={PARTNER_STATUS[partner.status]?.tone ?? 'neutral'}>
                                        {PARTNER_STATUS[partner.status]?.label ?? partner.status}
                                    </Badge>
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        {partner.status === 'pending' && (
                                            <>
                                                <IconButton
                                                    icon={CircleCheckBig}
                                                    label="اعتماد المزوّد"
                                                    onClick={() => setDeciding({ partner, decision: 'approve' })}
                                                />
                                                <IconButton
                                                    icon={X}
                                                    label="رفض الطلب"
                                                    tone="danger"
                                                    onClick={() => {
                                                        setReason('');
                                                        setDeciding({ partner, decision: 'reject' });
                                                    }}
                                                />
                                            </>
                                        )}
                                        <Link
                                            href={`/admin/partners/${partner.id}/edit`}
                                            title="تعديل المزوّد"
                                            className="p-1.5 rounded-lg bg-ink/5 hover:bg-ink/10 text-ink transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                                        </Link>
                                        <IconButton
                                            icon={KeyRound}
                                            label="إرسال رابط إعادة تعيين كلمة المرور"
                                            onClick={() => router.post(`/admin/partners/${partner.id}/reset-password`, {}, { preserveScroll: true })}
                                        />
                                    </div>
                                </Td>
                            </Tr>
                        ))}

                        <ListStates
                            count={partners.data.length}
                            colSpan={7}
                            empty="لا يوجد مزوّدون مطابقون."
                            emptyHint="جرّب تغيير حالة التصفية أو مصطلح البحث."
                        />
                    </Tbody>
                </TableShell>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <ResultCount page={partners} />
                    <Pagination page={partners} />
                </div>
            </Card>

            <ConfirmModal
                open={deciding !== null}
                tone={deciding?.decision === 'reject' ? 'danger' : 'default'}
                title={deciding?.decision === 'approve' ? 'اعتماد المزوّد' : 'رفض طلب المزوّد'}
                message={
                    deciding?.decision === 'approve'
                        ? 'يصبح المرفق قابلاً لاستقبال مجموعات الشركات. الصرف يبقى موقوفاً حتى يُعتمد حسابه البنكي من صفحة إشراف المزوّدين.'
                        : 'يُبلَّغ المزوّد بالرفض وسببه ولا يُدرج في محرك الاقتراحات.'
                }
                details={
                    deciding && (
                        <>
                            <ConfirmRow label="المزوّد" value={deciding.partner.trade_name ?? deciding.partner.name} strong />
                            <ConfirmRow label="المدينة" value={deciding.partner.city ?? '—'} />
                            <ConfirmRow label="نسبة العمولة" value={`${deciding.partner.commission_rate ?? '—'}٪`} />
                            {deciding.decision === 'approve' && (
                                <ConfirmRow
                                    label="حالة الصرف بعد الاعتماد"
                                    value={deciding.partner.bank_status === 'approved' ? 'قابل للصرف' : 'موقوف — الحساب البنكي غير معتمد'}
                                />
                            )}
                            {deciding.decision === 'reject' && (
                                <div className="pt-2">
                                    <label htmlFor="partner-reject-reason" className="block text-[11px] font-bold text-ink mb-1">
                                        سبب الرفض
                                    </label>
                                    <textarea
                                        id="partner-reject-reason"
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
                confirmLabel={deciding?.decision === 'approve' ? 'اعتماد المزوّد' : 'تأكيد الرفض'}
                onConfirm={() => {
                    router.post(
                        `/admin/partners/${deciding?.partner.id}/${deciding?.decision}`,
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
