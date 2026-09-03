import PageHeader from '@/components/page-header';
import CompanyLayout from '@/layouts/company-layout';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import SortableHeader, { type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { fmtDate } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import type { League, PaginatedResult } from '@/types/models';

interface Props {
    leagues: PaginatedResult<League>;
    filters: { search?: string; sort?: string; dir?: string };
    sort: SortState;
}

export default function LeaguesIndex({ leagues, filters, sort }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        sort: filters?.sort,
        dir: filters?.dir,
    });

    return (
        <CompanyLayout>
            <Head title="البطولات" />

            <div style={{ marginBottom: 24 }}>
                <PageHeader title={<>البطولات</>} subtitle={<>{leagues.total} بطولة في مجتمعات الشركة</>} />
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث باسم البطولة أو المجتمع..."
                    style={{ padding: '9px 14px', borderRadius: 10, border: '0.5px solid rgba(10,10,10,.1)', fontSize: 13, background: '#fff', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 220 }}
                />
            </div>

            <div style={{ background: '#fff', border: '0.5px solid rgba(10,10,10,.1)', borderRadius: 16, overflow: 'auto' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <SortableHeader label="البطولة" sortKey="name" sort={sort} />
                            <th>المجتمع</th>
                            <SortableHeader label="النظام" sortKey="format" sort={sort} />
                            <th>الأقسام</th>
                            <SortableHeader label="المباريات" sortKey="matches_count" sort={sort} initialDirection="desc" />
                            <SortableHeader label="أُنشئت في" sortKey="created_at" sort={sort} initialDirection="desc" />
                            <SortableHeader label="الحالة" sortKey="status" sort={sort} />
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <ListStates
                            count={leagues.data.length}
                            columns={8}
                            emptyTitle="لا توجد بطولات"
                            emptyHint="لا بطولة مطابقة للبحث الحالي — أو لم تُنشأ أي بطولة في هذه الشركة بعد."
                        />
                        {leagues.data.map((league) => {
                            const formatLabel = league.format === 'knockout' ? 'خروج المغلوب'
                                : league.format === 'double_round_robin' ? 'ذهاب وإياب' : 'دور واحد';
                            return (
                                <tr key={league.id}>
                                    <td style={{ fontWeight: 600 }}>{league.name}</td>
                                    <td style={{ color: 'rgba(10,10,10,.55)', fontSize: 12 }}>{league.community?.name ?? '—'}</td>
                                    <td style={{ fontSize: 12 }}>{formatLabel}</td>
                                    <td>{league.departments?.length ?? 0}</td>
                                    <td>{league.matches_count ?? 0}</td>
                                    <td style={{ color: 'rgba(10,10,10,.55)', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(league.created_at)}</td>
                                    <td>
                                        <span className="badge" style={league.status === 'active' ? { background: '#2E7D3218', color: '#2E7D32' } : { background: 'rgba(10,10,10,.55)18', color: 'rgba(10,10,10,.55)' }}>
                                            {league.status === 'active' ? 'جارية' : 'منتهية'}
                                        </span>
                                    </td>
                                    <td>
                                        <Link
                                            href={`/company/leagues/${league.id}`}
                                            style={{ background: '#0A0A0A18', color: '#0A0A0A', border: '1px solid #0A0A0A33', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
                                        >
                                            عرض
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination links={leagues.links} />
        </CompanyLayout>
    );
}
