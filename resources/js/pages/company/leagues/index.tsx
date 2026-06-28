import CompanyLayout from '@/layouts/company-layout';
import Pagination from '@/components/pagination';
import { Head, Link } from '@inertiajs/react';
import type { League, PaginatedResult } from '@/types/models';

interface Props {
    leagues: PaginatedResult<League>;
}

export default function LeaguesIndex({ leagues }: Props) {
    return (
        <CompanyLayout>
            <Head title="البطولات" />

            <div style={{ marginBottom: 24 }}>
                <div className="page-title">البطولات</div>
                <div className="page-sub">{leagues.total} بطولة في مجتمعات الشركة</div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>البطولة</th>
                            <th>المجتمع</th>
                            <th>النظام</th>
                            <th>الأقسام</th>
                            <th>المباريات</th>
                            <th>الحالة</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {leagues.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#999', fontSize: 13 }}>لا توجد بطولات</td>
                            </tr>
                        ) : (
                            leagues.data.map((league) => {
                                const formatLabel = league.format === 'knockout' ? 'خروج المغلوب'
                                    : league.format === 'double_round_robin' ? 'ذهاب وإياب' : 'دور واحد';
                                return (
                                    <tr key={league.id}>
                                        <td style={{ fontWeight: 600 }}>{league.name}</td>
                                        <td style={{ color: '#999', fontSize: 12 }}>{league.community?.name ?? '—'}</td>
                                        <td style={{ fontSize: 12 }}>{formatLabel}</td>
                                        <td>{league.departments?.length ?? 0}</td>
                                        <td>{league.matches_count ?? 0}</td>
                                        <td>
                                            <span className={`badge ${league.status === 'active' ? 'b-active' : 'b-completed'}`}>
                                                {league.status === 'active' ? 'جارية' : 'منتهية'}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                href={`/company/leagues/${league.id}`}
                                                className="ac-btn secondary"
                                                style={{ fontSize: 12, padding: '5px 14px', textDecoration: 'none' }}
                                            >
                                                عرض
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={leagues.links} />
        </CompanyLayout>
    );
}
