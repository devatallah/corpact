import PageHeader from '@/components/page-header';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import StatCard from '@/components/stat-card';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AdminLayout from '@/layouts/admin-layout';
import { fmtDateTime } from '@/lib/utils';
import type { PaginatedResult } from '@/types/models';
import { Head, router } from '@inertiajs/react';

/**
 * H §19 — «سجل أحداث أمنية منفصل (دخول فاشل، تغيير صلاحية، تغيير بيانات بنكية)».
 */

interface SecurityRow {
    id: number;
    event: string;
    event_label: string;
    severity: string;
    actor_name: string | null;
    actor_identifier: string | null;
    guard: string | null;
    subject_type: string | null;
    subject_id: number | null;
    company: { id: number; name: string } | null;
    ip_address: string | null;
    user_agent: string | null;
    context: Record<string, unknown> | null;
    created_at: string | null;
}

interface Props {
    events: PaginatedResult<SecurityRow>;
    filters: { search?: string; event?: string; severity?: string; from?: string; to?: string; sort?: string; dir?: string };
    eventTypes: { value: string; label: string }[];
    stats: { total: number; critical_24h: number; failed_logins_24h: number; permission_changes_24h: number };
    sort: SortState;
}

const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    background: '#FFFFFF',
    border: '0.5px solid rgba(10,10,10,.1)',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#0A0A0A',
    outline: 'none',
    direction: 'rtl',
    fontFamily: 'inherit',
};

const SEVERITY: Record<string, { label: string; color: string; bg: string }> = {
    info: { label: 'معلومة', color: '#0A0A0A', bg: 'rgba(127,178,255,.12)' },
    warning: { label: 'تنبيه', color: '#C87D00', bg: 'rgba(245,166,35,.12)' },
    critical: { label: 'حرِج', color: '#D9381E', bg: 'rgba(224,48,80,.14)' },
};

export default function SecurityEvents({ events, filters, eventTypes, stats, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        event: filters?.event,
        severity: filters?.severity,
        from: filters?.from,
        to: filters?.to,
        sort: filters?.sort,
        dir: filters?.dir,
    });

    function apply(patch: Record<string, string | undefined>) {
        router.get(
            '/admin/security/events',
            {
                search: filters?.search || undefined,
                event: filters?.event || undefined,
                severity: filters?.severity || undefined,
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
        <AdminLayout>
            <Head title="الأحداث الأمنية" />

            <PageHeader
                title={<>الأحداث الأمنية</>}
                subtitle={<>
                سجل منفصل عن سجل التدقيق — للكتابة فقط: دخول فاشل · تغيير صلاحية · تغيير بيانات بنكية.
                </>}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, margin: '16px 0' }}>
                <StatCard emoji="🛡️" label="إجمالي الأحداث" value={stats.total.toLocaleString()} />
                <StatCard emoji="🚨" label="حرِج خلال 24 ساعة" value={stats.critical_24h.toLocaleString()} color="#D9381E" />
                <StatCard emoji="🔐" label="دخول فاشل خلال 24 ساعة" value={stats.failed_logins_24h.toLocaleString()} />
                <StatCard emoji="🧑‍⚖️" label="تغييرات صلاحيات خلال 24 ساعة" value={stats.permission_changes_24h.toLocaleString()} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالفاعل أو المعرّف أو عنوان IP..."
                    style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
                />
                <select value={filters?.event ?? ''} onChange={(e) => apply({ event: e.target.value || undefined })} style={inputStyle}>
                    <option value="">كل الأنواع</option>
                    {eventTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
                <select value={filters?.severity ?? ''} onChange={(e) => apply({ severity: e.target.value || undefined })} style={inputStyle}>
                    <option value="">كل الدرجات</option>
                    <option value="critical">حرِج</option>
                    <option value="warning">تنبيه</option>
                    <option value="info">معلومة</option>
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
                                <SortableHeader label="الحدث" sortKey="event" sort={sort} />
                                <SortableHeader label="الدرجة" sortKey="severity" sort={sort} />
                                <SortableHeader label="الفاعل / المعرّف" sortKey="actor_name" sort={sort} />
                                <SortableHeader label="البوابة" sortKey="guard" sort={sort} />
                                <th>الكيان</th>
                                <SortableHeader label="IP" sortKey="ip_address" sort={sort} />
                            </tr>
                        </thead>
                        <tbody>
                            <ListStates
                                count={events.data.length}
                                columns={7}
                                emptyTitle="لا توجد أحداث أمنية مطابقة"
                                emptyHint="لا شيء مسجَّل ضمن هذه الفلاتر — وهو الوضع الطبيعي في الأوقات الهادئة."
                            />
                            {events.data.map((row) => {
                                const severity = SEVERITY[row.severity] ?? SEVERITY.info;

                                return (
                                    <tr key={row.id}>
                                        <td style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', whiteSpace: 'nowrap' }}>{fmtDateTime(row.created_at ?? '')}</td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: '#0A0A0A' }}>{row.event_label}</div>
                                            <div style={{ fontSize: 10, color: 'rgba(10,10,10,.55)' }} dir="ltr">{row.event}</div>
                                        </td>
                                        <td>
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '3px 10px',
                                                    borderRadius: 999,
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: severity.color,
                                                    background: severity.bg,
                                                }}
                                            >
                                                {severity.label}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 12, color: '#0A0A0A' }}>
                                            {row.actor_name ?? <span dir="ltr">{row.actor_identifier ?? '—'}</span>}
                                        </td>
                                        <td style={{ fontSize: 12, color: 'rgba(10,10,10,.55)' }} dir="ltr">{row.guard ?? '—'}</td>
                                        <td style={{ fontSize: 12, color: 'rgba(10,10,10,.55)' }} dir="ltr">
                                            {row.subject_type ? `${row.subject_type}#${row.subject_id}` : (row.company?.name ?? '—')}
                                        </td>
                                        <td style={{ fontSize: 11, color: 'rgba(10,10,10,.55)' }} dir="ltr">{row.ip_address ?? '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={events.links} />
        </AdminLayout>
    );
}
