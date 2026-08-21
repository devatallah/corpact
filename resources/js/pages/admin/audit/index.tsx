import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import StatCard from '@/components/stat-card';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AdminLayout from '@/layouts/admin-layout';
import { fmtDateTime } from '@/lib/utils';
import type { PaginatedResult } from '@/types/models';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * H §16 «الدعم وسجل التدقيق» + H §19 — السجل كاملاً لأدمن تيمات.
 * H §18: بحث + فلترة + ترتيب + ترقيم 20، وثلاث حالات إلزامية.
 */

interface AuditRow {
    id: number;
    action: string;
    action_label: string;
    actor_name: string | null;
    actor_role: string | null;
    actor_guard: string | null;
    scope_type: string;
    scope_id: number | null;
    company: { id: number; name: string } | null;
    entity_type: string | null;
    entity_id: number | null;
    before_values: Record<string, unknown> | null;
    after_values: Record<string, unknown> | null;
    reason: string | null;
    ip_address: string | null;
    user_agent: string | null;
    is_financial: boolean;
    created_at: string | null;
}

interface Option {
    value: string;
    label: string;
}

interface Props {
    logs: PaginatedResult<AuditRow>;
    filters: {
        search?: string;
        action?: string;
        group?: string;
        company_id?: string;
        from?: string;
        to?: string;
        financial?: string;
        sort?: string;
    };
    actions: Option[];
    groups: Option[];
    companies: { id: number; name: string }[];
    total: number;
}

const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    background: '#161B27',
    border: '1px solid #232A3E',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#E8EAF0',
    outline: 'none',
    direction: 'rtl',
    fontFamily: 'inherit',
};

export default function AuditIndex({ logs, filters, actions, groups, companies, total }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        action: filters?.action,
        group: filters?.group,
        company_id: filters?.company_id,
        from: filters?.from,
        to: filters?.to,
        financial: filters?.financial,
        sort: filters?.sort,
    });
    const [expanded, setExpanded] = useState<number | null>(null);

    function apply(patch: Record<string, string | undefined>) {
        router.get(
            '/admin/audit',
            {
                search: filters?.search || undefined,
                action: filters?.action || undefined,
                group: filters?.group || undefined,
                company_id: filters?.company_id || undefined,
                from: filters?.from || undefined,
                to: filters?.to || undefined,
                financial: filters?.financial || undefined,
                sort: filters?.sort || undefined,
                ...patch,
            },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AdminLayout>
            <Head title="سجل التدقيق" />

            <div className="page-title">سجل التدقيق</div>
            <div className="page-sub">
                {total.toLocaleString()} حدثاً مسجَّلاً · السجل للكتابة فقط — لا يُعدَّل ولا يُحذف (H §19)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, margin: '16px 0' }}>
                <StatCard emoji="🧾" label="إجمالي الأحداث" value={total.toLocaleString()} />
                <StatCard emoji="💰" label="أحداث مالية (تُحفظ 10 سنوات)" value={logs.data.filter((l) => l.is_financial).length.toLocaleString()} />
                <StatCard emoji="📄" label="في هذه الصفحة" value={logs.data.length.toLocaleString()} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث بالفاعل أو الإجراء أو السبب..."
                    style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
                />
                <select value={filters?.group ?? ''} onChange={(e) => apply({ group: e.target.value || undefined, action: undefined })} style={inputStyle}>
                    <option value="">كل المجموعات</option>
                    {groups.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                </select>
                <select value={filters?.action ?? ''} onChange={(e) => apply({ action: e.target.value || undefined })} style={inputStyle}>
                    <option value="">كل الإجراءات</option>
                    {actions.map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                </select>
                <select value={filters?.company_id ?? ''} onChange={(e) => apply({ company_id: e.target.value || undefined })} style={inputStyle}>
                    <option value="">كل الشركات</option>
                    {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <input type="date" value={filters?.from ?? ''} onChange={(e) => apply({ from: e.target.value || undefined })} style={inputStyle} />
                <input type="date" value={filters?.to ?? ''} onChange={(e) => apply({ to: e.target.value || undefined })} style={inputStyle} />
                <button
                    className={`fbtn${filters?.financial === '1' ? ' on' : ''}`}
                    onClick={() => apply({ financial: filters?.financial === '1' ? undefined : '1' })}
                >
                    المالية فقط
                </button>
                <button className="fbtn" onClick={() => apply({ sort: filters?.sort === 'asc' ? 'desc' : 'asc' })}>
                    الترتيب: {filters?.sort === 'asc' ? 'الأقدم أولاً' : 'الأحدث أولاً'}
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>الوقت</th>
                                <th>الفاعل ودوره</th>
                                <th>الإجراء</th>
                                <th>الكيان</th>
                                <th>النطاق</th>
                                <th>IP</th>
                                <th>التفاصيل</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ListStates
                                count={logs.data.length}
                                columns={7}
                                emptyTitle="لا توجد أحداث مطابقة"
                                emptyHint="غيّر الفلاتر أو وسّع المدى الزمني — السجل لا يُحذف منه شيء، فغياب النتيجة يعني أن الفلتر لا يطابق."
                            />
                            {logs.data.map((log) => (
                                <tr key={log.id}>
                                    <td style={{ fontSize: 12, color: '#6B7A99', whiteSpace: 'nowrap' }}>{fmtDateTime(log.created_at ?? '')}</td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#fff' }}>{log.actor_name ?? 'النظام'}</div>
                                        <div style={{ fontSize: 10, color: '#6B7A99' }}>
                                            {log.actor_role ?? '—'}
                                            {log.actor_guard ? ` · ${log.actor_guard}` : ''}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ color: log.is_financial ? '#C8FF00' : '#C8D0E0', fontWeight: 700 }}>{log.action_label}</span>
                                        <div style={{ fontSize: 10, color: '#6B7A99' }} dir="ltr">{log.action}</div>
                                    </td>
                                    <td style={{ fontSize: 12, color: '#C8D0E0' }} dir="ltr">
                                        {log.entity_type ? `${log.entity_type}#${log.entity_id}` : '—'}
                                    </td>
                                    <td style={{ fontSize: 12, color: '#9CA3BC' }}>
                                        {log.company?.name ?? log.scope_type}
                                    </td>
                                    <td style={{ fontSize: 11, color: '#6B7A99' }} dir="ltr">{log.ip_address ?? '—'}</td>
                                    <td>
                                        <button className="act-btn btn-view" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                                            {expanded === log.id ? 'إخفاء' : 'قبل / بعد'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {logs.data.map((log) =>
                                expanded === log.id ? (
                                    <tr key={`${log.id}-detail`}>
                                        <td colSpan={7} style={{ background: '#12161F' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, padding: '6px 4px' }}>
                                                <div>
                                                    <div style={{ fontSize: 11, color: '#6B7A99', marginBottom: 4 }}>القيمة قبل</div>
                                                    <pre dir="ltr" style={preStyle}>{JSON.stringify(log.before_values ?? {}, null, 2)}</pre>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 11, color: '#6B7A99', marginBottom: 4 }}>القيمة بعد</div>
                                                    <pre dir="ltr" style={preStyle}>{JSON.stringify(log.after_values ?? {}, null, 2)}</pre>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 11, color: '#6B7A99', marginBottom: 4 }}>السبب</div>
                                                    <div style={{ fontSize: 12, color: '#C8D0E0', lineHeight: 1.8 }}>{log.reason ?? '—'}</div>
                                                    <div style={{ fontSize: 11, color: '#6B7A99', margin: '10px 0 4px' }}>المتصفح</div>
                                                    <div dir="ltr" style={{ fontSize: 11, color: '#9CA3BC', wordBreak: 'break-all' }}>{log.user_agent ?? '—'}</div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : null,
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={logs.links} />
        </AdminLayout>
    );
}

const preStyle: React.CSSProperties = {
    background: '#0E121B',
    border: '1px solid #232A3E',
    borderRadius: 8,
    padding: 10,
    fontSize: 11,
    color: '#9CA3BC',
    maxHeight: 220,
    overflow: 'auto',
    margin: 0,
};
