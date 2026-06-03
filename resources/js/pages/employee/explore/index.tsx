import EmployeeLayout from '@/layouts/employee-layout';
import CategoryIcon from '@/components/category-icon';
import { Head, router } from '@inertiajs/react';
import type { Community, Category } from '@/types/models';

interface ExploreCommunity extends Community {
    members_count: number;
    events_count?: number;
    is_member: boolean;
    category?: Category;
}

interface Props {
    communities: ExploreCommunity[];
}

export default function ExploreIndex({ communities }: Props) {
    function handleJoin(communityId: number) {
        router.post(`/employee/community/${communityId}/join`);
    }

    function handleLeave(communityId: number) {
        router.post(`/employee/community/${communityId}/leave`);
    }

    return (
        <EmployeeLayout>
            <Head title="استكشف" />

            <div style={{ padding: '16px 0 20px' }}>
                <div style={{ fontSize: 11, color: '#7A8BA8' }}>اكتشف واختر</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>المجتمعات المتاحة</div>
            </div>

            {communities.length > 0 ? (
                communities.map((community) => {
                    const color = community.category?.color ?? community.color ?? '#009E82';
                    return (
                        <div
                            key={community.id}
                            className="card"
                            style={{ marginBottom: 12, ...(community.is_member ? { borderRight: `4px solid ${color}` } : {}) }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                <div style={{ width: 50, height: 50, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CategoryIcon icon={community.category?.icon} size={28} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 700 }}>{community.name}</div>
                                    <div style={{ fontSize: 11, color: '#7A8BA8' }}>{community.description}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                <span style={{ fontSize: 11, color: '#7A8BA8' }}>👥 {community.members_count} عضو</span>
                                <span style={{ fontSize: 11, color: '#7A8BA8' }}>📅 {community.events_count ?? 0} فعالية</span>
                            </div>

                            {community.is_member ? (
                                <button
                                    onClick={() => handleLeave(community.id)}
                                    style={{ width: '100%', padding: 10, background: '#E4E9F2', color: '#7A8BA8', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                    ✓ منضم -- اضغط للمغادرة
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleJoin(community.id)}
                                    style={{ width: '100%', padding: 10, background: color, color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                    انضم لمجتمع {community.name}
                                </button>
                            )}
                        </div>
                    );
                })
            ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7A8BA8', fontSize: 13 }}>لا توجد مجتمعات متاحة حاليا</div>
            )}
        </EmployeeLayout>
    );
}
