import EmployeeLayout from '@/layouts/employee-layout';
import CategoryIcon from '@/components/category-icon';
import { Head, Link } from '@inertiajs/react';
import type { Community, Employee, Category } from '@/types/models';

interface CommunityItem extends Community {
    category?: Category;
    leader?: Employee;
    members_count: number;
    events_count: number;
}

interface Props {
    communities: CommunityItem[];
}

export default function CommunityIndex({ communities }: Props) {
    return (
        <EmployeeLayout>
            <Head title="مجتمعاتي" />

            <div style={{ padding: '16px 0 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, color: '#7A8BA8' }}>المجتمعات</div>
                    <Link
                        href="/employee/community-requests"
                        style={{
                            fontSize: 11, color: '#3B5BDB', fontWeight: 700, textDecoration: 'none',
                            background: '#3B5BDB10', padding: '4px 12px', borderRadius: 8,
                        }}
                    >
                        اقتراح مجتمع
                    </Link>
                </div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 12 }}>
                    {communities.length > 0 ? (
                        communities.map((community) => {
                            const color = community.category?.color ?? community.color ?? '#009E82';
                            return (
                                <Link
                                    key={community.id}
                                    href={`/employee/community/${community.id}`}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0, textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div style={{ width: 52, height: 52, borderRadius: 16, background: `${color}33`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CategoryIcon icon={community.category?.icon} size={28} />
                                    </div>
                                    <div style={{ fontSize: 10, color, fontWeight: 700 }}>{community.name}</div>
                                </Link>
                            );
                        })
                    ) : (
                        <div style={{ fontSize: 13, color: '#7A8BA8', padding: 12 }}>لم تنضم لأي مجتمع بعد</div>
                    )}
                </div>
            </div>

            {communities.length > 0 ? (
                communities.map((community) => {
                    const color = community.category?.color ?? community.color ?? '#009E82';
                    return (
                        <Link
                            key={community.id}
                            href={`/employee/community/${community.id}`}
                            className="card"
                            style={{ borderColor: `${color}33`, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{ width: 46, height: 46, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CategoryIcon icon={community.category?.icon} size={28} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>{community.name}</div>
                                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>
                                    <span>👥 {community.members_count} عضو</span>
                                    <span>📅 {community.events_count} فعالية نشطة</span>
                                </div>
                            </div>
                        </Link>
                    );
                })
            ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7A8BA8', fontSize: 13 }}>
                    لم تنضم لأي مجتمع بعد.{' '}
                    <Link href="/employee/explore" style={{ color: '#009E82', fontWeight: 700 }}>اكتشف المجتمعات</Link>
                </div>
            )}
        </EmployeeLayout>
    );
}
