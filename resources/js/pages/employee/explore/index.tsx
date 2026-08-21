import EmployeeLayout from '@/layouts/employee-layout';
import CategoryIcon from '@/components/category-icon';
import Pagination from '@/components/pagination';
import { SortBar, type SortState } from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { Head, router } from '@inertiajs/react';
import type { Community, Category, PaginatedResult } from '@/types/models';

interface ExploreCommunity extends Community {
    members_count: number;
    events_count?: number;
    is_member: boolean;
    category?: Category;
}

interface Props {
    communities: PaginatedResult<ExploreCommunity>;
    filters?: { search?: string; sort?: string; dir?: string };
    sort?: SortState;
}

const sortOptions = [
    { key: 'name', label: 'الاسم', initialDirection: 'asc' as const },
    { key: 'members_count', label: 'الأعضاء', initialDirection: 'desc' as const },
    { key: 'created_at', label: 'الأحدث', initialDirection: 'desc' as const },
];

export default function ExploreIndex({ communities, filters, sort }: Props) {
    const items = communities?.data ?? [];
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        sort: filters?.sort,
        dir: filters?.dir,
    });

    function handleJoin(communityId: number) {
        router.post(`/employee/community/${communityId}/join`);
    }

    function handleLeave(communityId: number) {
        router.post(`/employee/community/${communityId}/leave`);
    }

    return (
        <EmployeeLayout>
            <Head title="استكشف" />

            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.5px' }}>المجتمعات المتاحة</h1>
                <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>اكتشف واختر المجتمعات التي تناسبك</p>
            </div>

            {/* H §18: بحث + ترتيب + ترقيم صفحات */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 ابحث باسم المجتمع..."
                    style={{ padding: '8px 14px', borderRadius: 99, border: '1px solid #EBEBEB', background: '#fff', fontSize: 13, color: '#0A0A0A', outline: 'none', direction: 'rtl', fontFamily: 'inherit', flex: '1 1 180px', minWidth: 0 }}
                />
                <SortBar sort={sort} options={sortOptions} />
            </div>

            {items.length > 0 ? (
                items.map((community) => {
                    const color = community.category?.color ?? community.color ?? '#18A86B';
                    return (
                        <div
                            key={community.id}
                            className="card"
                            style={community.is_member ? { borderRight: `3px solid ${color}` } : undefined}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CategoryIcon icon={community.category?.icon} size={26} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700 }}>{community.name}</div>
                                    <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{community.description}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 13, color: '#999' }}>
                                <span>👥 {community.members_count} عضو</span>
                                <span>📅 {community.events_count ?? 0} فعالية</span>
                            </div>

                            {community.is_member ? (
                                <button
                                    className="btn btn-outline btn-full"
                                    onClick={() => handleLeave(community.id)}
                                >
                                    ✓ منضم -- اضغط للمغادرة
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary btn-full"
                                    onClick={() => handleJoin(community.id)}
                                >
                                    انضم لمجتمع {community.name}
                                </button>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="empty">
                    <div className="ico">📭</div>
                    <div className="txt">{search ? 'لا مجتمع مطابق لبحثك' : 'لا توجد مجتمعات متاحة حاليا'}</div>
                </div>
            )}

            {communities?.links && <Pagination links={communities.links} />}
        </EmployeeLayout>
    );
}
