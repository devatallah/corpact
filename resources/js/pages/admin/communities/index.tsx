import AdminLayout from '@/layouts/admin-layout';
import SportIcon from '@/components/sport-icon';
import Pagination from '@/components/pagination';
import { fmtDate } from '@/lib/utils';
import type { Community, Company, Sport, PaginatedResult } from '@/types/models';
import { Head, router } from '@inertiajs/react';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { useState } from 'react';

interface CommunityRow extends Community {
    company?: Company;
    members_count?: number;
    events_count?: number;
}

interface Props {
    communities: PaginatedResult<CommunityRow>;
    totalCommunities: number;
    companies: { id: number; name: string }[];
    sports: Sport[];
    filters: { search?: string; company_id?: string; sport_id?: string };
}

export default function CommunitiesIndex({ communities, totalCommunities, companies, sports, filters }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', { company_id: filters?.company_id, sport_id: filters?.sport_id });
    const [detail, setDetail] = useState<CommunityRow | null>(null);

    function handleFilter(key: string, value: string) {
        router.get('/admin/communities', {
            search: filters?.search || undefined,
            company_id: key === 'company_id' ? (value || undefined) : (filters?.company_id || undefined),
            sport_id: key === 'sport_id' ? (value || undefined) : (filters?.sport_id || undefined),
        }, { preserveState: true, replace: true });
    }

    return (
        <AdminLayout>
            <Head title="المجتمعات" />

            <div style={{ marginBottom: 4 }}>
                <div className="page-title">المجتمعات</div>
            </div>
            <div className="page-sub">
                {totalCommunities} مجتمع على المنصة
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث بالاسم..."
                    style={{ padding: '9px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit', minWidth: 180 }}
                />
                <select
                    value={filters?.company_id ?? ''}
                    onChange={(e) => handleFilter('company_id', e.target.value)}
                    style={{ padding: '9px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                >
                    <option value="">كل الشركات</option>
                    {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <select
                    value={filters?.sport_id ?? ''}
                    onChange={(e) => handleFilter('sport_id', e.target.value)}
                    style={{ padding: '9px 14px', background: '#161B27', border: '1px solid #232A3E', borderRadius: 10, fontSize: 13, color: '#E8EAF0', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                >
                    <option value="">كل الرياضات</option>
                    {sports.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>المجتمع</th>
                            <th>الشركة</th>
                            <th>الرياضة</th>
                            <th>القائد</th>
                            <th>الأعضاء</th>
                            <th>الفعاليات</th>
                            <th>الرصيد</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {communities.data.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', color: '#6B7A99', padding: '20px' }}>
                                    لا توجد مجتمعات
                                </td>
                            </tr>
                        ) : (
                            communities.data.map((community) => (
                                <tr key={community.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#fff' }}>{community.name}</div>
                                    </td>
                                    <td style={{ color: '#C8D0E0' }}>{community.company?.name ?? '-'}</td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            <SportIcon icon={community.sport?.icon} size={16} />
                                            <span style={{ fontSize: 12 }}>{community.sport?.name ?? '-'}</span>
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12, color: '#C8D0E0' }}>{community.leader?.name ?? '-'}</td>
                                    <td>{community.members_count ?? 0}</td>
                                    <td>{community.events_count ?? 0}</td>
                                    <td>
                                        <span style={{ color: Number(community.balance) > 0 ? '#009E82' : '#6B7A99', fontWeight: 700 }}>
                                            {Number(community.balance).toLocaleString()} ريال
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => setDetail(community)}
                                            className="act-btn btn-view"
                                        >
                                            عرض
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={communities.links} />

            {/* Detail Modal */}
            {detail && (
                <div className="detail-overlay open" onClick={() => setDetail(null)}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            تفاصيل المجتمع
                            <button className="close-btn" onClick={() => setDetail(null)}>×</button>
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                            <SportIcon icon={detail.sport?.icon} size={44} />
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#E8EAF0' }}>{detail.name}</div>
                                <div style={{ fontSize: 12, color: '#6B7A99' }}>{detail.sport?.name ?? '-'}</div>
                            </div>
                        </div>

                        {detail.description && (
                            <div style={{ fontSize: 13, color: '#9CA3BC', marginBottom: 20, lineHeight: 1.7 }}>
                                {detail.description}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                            <div style={{ background: '#0F1117', borderRadius: 12, padding: '16px 18px' }}>
                                <div style={{ fontSize: 11, color: '#6B7A99', marginBottom: 4 }}>الشركة</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#E8EAF0' }}>{detail.company?.name ?? '-'}</div>
                            </div>
                            <div style={{ background: '#0F1117', borderRadius: 12, padding: '16px 18px' }}>
                                <div style={{ fontSize: 11, color: '#6B7A99', marginBottom: 4 }}>القائد</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#E8EAF0' }}>{detail.leader?.name ?? '-'}</div>
                            </div>
                            <div style={{ background: '#0F1117', borderRadius: 12, padding: '16px 18px' }}>
                                <div style={{ fontSize: 11, color: '#6B7A99', marginBottom: 4 }}>الأعضاء</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#E8EAF0' }}>{detail.members_count ?? 0}</div>
                            </div>
                            <div style={{ background: '#0F1117', borderRadius: 12, padding: '16px 18px' }}>
                                <div style={{ fontSize: 11, color: '#6B7A99', marginBottom: 4 }}>الفعاليات</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#E8EAF0' }}>{detail.events_count ?? 0}</div>
                            </div>
                            <div style={{ background: '#0F1117', borderRadius: 12, padding: '16px 18px', gridColumn: '1 / -1' }}>
                                <div style={{ fontSize: 11, color: '#6B7A99', marginBottom: 4 }}>رصيد المحفظة</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: Number(detail.balance) > 0 ? '#009E82' : '#6B7A99' }}>
                                    {Number(detail.balance).toLocaleString()} ريال
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ background: '#0F1117', borderRadius: 12, padding: '16px 18px' }}>
                                <div style={{ fontSize: 11, color: '#6B7A99', marginBottom: 4 }}>الحالة</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: detail.status === 'active' ? '#009E82' : '#E03050' }}>
                                    {detail.status === 'active' ? 'نشط' : 'غير نشط'}
                                </div>
                            </div>
                            <div style={{ background: '#0F1117', borderRadius: 12, padding: '16px 18px' }}>
                                <div style={{ fontSize: 11, color: '#6B7A99', marginBottom: 4 }}>تاريخ الإنشاء</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#E8EAF0' }}>{fmtDate(detail.created_at)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
