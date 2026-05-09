import EmployeeLayout from '@/layouts/employee-layout';
import SportIcon from '@/components/sport-icon';
import { Head, Link } from '@inertiajs/react';
import type { Club, Court, Sport } from '@/types/models';

interface Props {
    club: Club & { courts: Court[]; sports: Sport[] };
}

export default function ExploreShow({ club }: Props) {
    return (
        <EmployeeLayout>
            <Head title={club.name} />

            {/* Back link */}
            <div style={{ padding: '16px 0 8px' }}>
                <Link href="/employee/explore" style={{ fontSize: 13, color: '#7A8BA8', textDecoration: 'none' }}>← العودة للاستكشاف</Link>
            </div>

            {/* Club name */}
            <div style={{ padding: '12px 0 20px' }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{club.name}</div>
                <div style={{ fontSize: 13, color: '#7A8BA8', marginTop: 4 }}>
                    {[club.district, club.city].filter(Boolean).join('، ')}
                </div>
            </div>

            {/* Sports */}
            {club.sports && club.sports.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>الرياضات</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {club.sports.map((sport) => (
                            <span key={sport.id} style={{ background: '#009E8218', color: '#009E82', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 20 }}>
                                <SportIcon icon={sport.icon} size={16} /> {sport.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Courts */}
            {club.courts && club.courts.length > 0 ? (
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>الملاعب ({club.courts.length})</div>
                    {club.courts.map((court) => {
                        const badge = court.status === 'active'
                            ? { bg: '#0CA67818', color: '#0CA678', label: 'نشط' }
                            : { bg: '#E0305018', color: '#E03050', label: 'مغلق' };
                        return (
                            <div key={court.id} className="card" style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{court.name}</div>
                                        <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>{court.sport?.name ?? '-'}</div>
                                    </div>
                                    <span style={{ background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{badge.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#7A8BA8', fontSize: 13 }}>لا توجد ملاعب متاحة حاليا</div>
            )}

            {/* Contact info */}
            {(club.contact_phone || club.email) && (
                <div style={{ marginTop: 20, padding: 16, background: '#F0F2F8', borderRadius: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>معلومات التواصل</div>
                    {club.email && <div style={{ fontSize: 12, color: '#4A5C78', marginBottom: 4 }} dir="ltr">{club.email}</div>}
                    {club.contact_phone && <div style={{ fontSize: 12, color: '#4A5C78' }} dir="ltr">{club.contact_phone}</div>}
                </div>
            )}
        </EmployeeLayout>
    );
}
