import { Head, router } from '@inertiajs/react';
import { CalendarDays, Search, Users } from 'lucide-react';
import CategoryIcon from '@/components/category-icon';
import { Card, CardTitle, MetaRow, Pill, Screen } from '@/components/employee/ui';
import Pagination from '@/components/pagination';
import { SortBar  } from '@/components/sortable-header';
import type {SortState} from '@/components/sortable-header';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import EmployeeLayout from '@/layouts/employee-layout';
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

            <Screen>
                <div>
                    <h1 className="text-lg font-black text-[#0A0A0A]">المجتمعات المتاحة</h1>
                    <p className="text-[11px] text-[#0A0A0A]/55 mt-0.5">اكتشف واختر المجتمعات التي تناسبك</p>
                </div>

                {/* H §18: بحث + ترتيب + ترقيم صفحات */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-3.5 h-3.5 text-[#0A0A0A]/40 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" aria-hidden="true" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث باسم المجتمع..."
                            className="w-full h-9 ps-9 pe-3.5 rounded-full text-xs font-arabic bg-white text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/15 hover:border-[#0A0A0A]/30 focus-visible:ring-2 focus-visible:ring-[#C8FF00] outline-none"
                        />
                    </div>
                    <SortBar sort={sort} options={sortOptions} />
                </div>

                {items.length > 0 ? (
                    <div className="space-y-2.5">
                        {items.map((community) => (
                            <Card key={community.id}>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#F6F8F5] border-[0.5px] border-[#0A0A0A]/10 flex items-center justify-center shrink-0">
                                        <CategoryIcon icon={community.category?.icon} size={22} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle>{community.name}</CardTitle>
                                            {community.is_member && <Pill tone="success">منضم</Pill>}
                                        </div>
                                        {community.description && (
                                            <p className="text-[11px] text-[#0A0A0A]/55 mt-0.5 line-clamp-2">{community.description}</p>
                                        )}
                                    </div>
                                </div>

                                <MetaRow
                                    left={
                                        <span className="inline-flex items-center gap-3">
                                            <span className="inline-flex items-center gap-1">
                                                <Users className="w-3 h-3" aria-hidden="true" />
                                                {community.members_count} عضو
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <CalendarDays className="w-3 h-3" aria-hidden="true" />
                                                {community.events_count ?? 0} فعالية
                                            </span>
                                        </span>
                                    }
                                />

                                {community.is_member ? (
                                    <button
                                        type="button"
                                        onClick={() => handleLeave(community.id)}
                                        className="w-full h-9 rounded-full bg-white text-[#0A0A0A] text-xs font-bold border-[0.5px] border-[#0A0A0A]/15 hover:border-[#0A0A0A]/40 transition-colors cursor-pointer"
                                    >
                                        مغادرة المجتمع
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleJoin(community.id)}
                                        className="w-full h-9 rounded-full bg-[#0A0A0A] text-[#C8FF00] text-xs font-bold border-[0.5px] border-[#0A0A0A] hover:bg-[#0A0A0A]/90 transition-colors cursor-pointer"
                                    >
                                        انضم للمجتمع
                                    </button>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <p className="text-[11px] text-[#0A0A0A]/55 text-center py-4">
                            {search ? 'لا مجتمع مطابق لبحثك' : 'لا توجد مجتمعات متاحة حالياً'}
                        </p>
                    </Card>
                )}

                {communities?.links && <Pagination links={communities.links} />}
            </Screen>
        </EmployeeLayout>
    );
}
