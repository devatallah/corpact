import PageHeader from '@/components/page-header';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import CompanyLayout from '@/layouts/company-layout';
import { fmtDateTime } from '@/lib/utils';
import type { PaginatedResult } from '@/types/models';
import { Head, router } from '@inertiajs/react';

/**
 * H §19 — «يرى مسؤول الحساب ملخصاً محدوداً لشركته فقط».
 *
 * ملخص: بلا IP ولا متصفح ولا قيم قبل/بعد خام — تلك للسجل الكامل لدى أدمن
 * تيمات وحده.
 */

interface AuditRow {
    id: number;
    action: string;
    action_label: string;
    actor_name: string | null;
    actor_role: string | null;
    entity_type: string | null;
    entity_id: number | null;
    reason: string | null;
    is_financial: boolean;
    created_at: string | null;
}

interface Props {
    company: { id: number; name: string };
    logs: PaginatedResult<AuditRow>;
    filters: { search?: string; action?: string; from?: string; to?: string; sort?: string; dir?: string };
    actions: { value: string; label: string }[];
    sort: SortState;
}

const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    background: '#fff',
    border: '0.5px solid rgba(10,10,10,.1)',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#0A0A0A',
    outline: 'none',
    direction: 'rtl',
    fontFamily: 'inherit',
};

export default function CompanyAudit({ company, logs, filters, actions, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        action: filters?.action,
        from: filters?.from,
        to: filters?.to,
        sort: filters?.sort,
        dir: filters?.dir,
    });

    function apply(patch: Record<string, string | undefined>) {
        router.get(
            '/company/audit',
            {
                search: filters?.search || undefined,
                action: filters?.action || undefined,
                from: filters?.from || undefined,
                to: filters?.to || undefined,
                sort: filters?.sort || undefined,
                dir: filters?.dir || undefined,
                ...patch,
            },
            { preserveState: true, replace: true },
        );
    }

    return (
        <CompanyLayout>
            <Head title="سجل التدقيق" />

            <PageHeader
                title={<>سجل التدقيق</>}
                subtitle={<>
                ملخص الأحداث المسجَّلة على حساب «{company.name}» — سجل تيمات الكامل لدى أدمن المنصة.
                </>}
            />

            <div style={{ display: 'flex', gap: '10px', margin: '16px 0', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالفاعل أو السبب..."
                    style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
                />
                <select value={filters?.action ?? ''} onChange={(e) => apply({ action: e.target.value || undefined })} style={inputStyle}>
                    <option value="">كل الإجراءات</option>
                    {actions.map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                </select>
                <input type="date" value={filters?.from ?? ''} onChange={(e) => apply({ from: e.target.value || undefined })} style={inputStyle} />
                <input type="date" value={filters?.to ?? ''} onChange={(e) => apply({ to: e.target.value || undefined })} style={inputStyle} />
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <SortableHeader label="الوقت" sortKey="created_at" sort={sort} initialDirection="desc" />
                                <SortableHeader label="الإجراء" sortKey="action" sort={sort} />
                                <SortableHeader label="الفاعل" sortKey="actor_name" sort={sort} />
                                <SortableHeader label="الكيان" sortKey="entity_type" sort={sort} />
                                <th>السبب</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ListStates
                                count={logs.data.length}
                                columns={5}
                                emptyTitle="لا توجد أحداث مسجَّلة"
                                emptyHint="لم يُسجَّل بعد أي إجراء من الأنواع التي تظهر لمسؤول الحساب على حساب شركتك."
                            />
                            {logs.data.map((log) => (
                                <tr key={log.id}>
                                    <td style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', whiteSpace: 'nowrap' }}>{fmtDateTime(log.created_at ?? '')}</td>
                                    <td style={{ fontWeight: 700, color: log.is_financial ? '#2E7D32' : '#0A0A0A' }}>{log.action_label}</td>
                                    <td style={{ fontSize: 12, color: '#0A0A0A' }}>
                                        {log.actor_name ?? 'النظام'}
                                        {log.actor_role ? ` · ${log.actor_role}` : ''}
                                    </td>
                                    <td dir="ltr" style={{ fontSize: 12, color: 'rgba(10,10,10,.55)' }}>
                                        {log.entity_type ? `${log.entity_type}#${log.entity_id}` : '—'}
                                    </td>
                                    <td style={{ fontSize: 12, color: '#0A0A0A' }}>{log.reason ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={logs.links} />
        </CompanyLayout>
    );
}
