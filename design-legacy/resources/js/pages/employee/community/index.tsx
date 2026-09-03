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

            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.5px' }}>مجتمعاتي</h1>
                    <Link href="/employee/community-requests" className="btn btn-outline" style={{ fontSize: 13 }}>
                        اقتراح مجتمع
                    </Link>
                </div>
            </div>

            {/* Community icons row */}
            {communities.length > 0 && (
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, marginBottom: 12 }}>
                    {communities.map((community) => {
                        const color = community.category?.color ?? community.color ?? '#18A86B';
                        return (
                            <Link
                                key={community.id}
                                href={`/employee/community/${community.id}`}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, textDecoration: 'none', color: 'inherit' }}
                            >
                                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${color}20`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CategoryIcon icon={community.category?.icon} size={28} />
                                </div>
                                <div style={{ fontSize: 11, color, fontWeight: 600 }}>{community.name}</div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Community cards */}
            {communities.length > 0 ? (
                <div className="list-card">
                    {communities.map((community) => {
                        const color = community.category?.color ?? community.color ?? '#18A86B';
                        return (
                            <Link
                                key={community.id}
                                href={`/employee/community/${community.id}`}
                                className="list-row"
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <CategoryIcon icon={community.category?.icon} size={26} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{community.name}</div>
                                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#999', marginTop: 3 }}>
                                        <span>👥 {community.members_count} عضو</span>
                                        <span>📅 {community.events_count} فعالية نشطة</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="empty">
                    <div className="ico">🏠</div>
                    <div className="txt">
                        لم تنضم لأي مجتمع بعد.{' '}
                        <Link href="/employee/explore" style={{ color: '#18A86B', fontWeight: 600 }}>اكتشف المجتمعات</Link>
                    </div>
                </div>
            )}
        </EmployeeLayout>
    );
}
