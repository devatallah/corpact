import EmployeeLayout from '@/layouts/employee-layout';
import CategoryIcon from '@/components/category-icon';
import { Head, Link } from '@inertiajs/react';
import type { Business, Venue, Category } from '@/types/models';

interface Props {
    business: Business & { venues: Venue[]; categories: Category[] };
}

export default function ExploreShow({ business }: Props) {
    return (
        <EmployeeLayout>
            <Head title={business.name} />

            {/* Back link */}
            <div style={{ padding: '16px 0 8px' }}>
                <Link href="/employee/explore" style={{ fontSize: 13, color: '#7A8BA8', textDecoration: 'none' }}>← العودة للاستكشاف</Link>
            </div>

            {/* Business name */}
            <div style={{ padding: '12px 0 20px' }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{business.name}</div>
                <div style={{ fontSize: 13, color: '#7A8BA8', marginTop: 4 }}>
                    {[business.district, business.city].filter(Boolean).join('، ')}
                </div>
            </div>

            {/* Sports */}
            {business.categories && business.categories.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>الفئات</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {business.categories.map(( cat) => (
                            <span key={cat.id} style={{ background: '#009E8218', color: '#009E82', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 20 }}>
                                <CategoryIcon icon={cat.icon} size={16} /> {cat.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* venues */}
            {business.venues && business.venues.length > 0 ? (
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>المرافق ({business.venues.length})</div>
                    {business.venues.map((venue) => {
                        const badge = venue.status === 'active'
                            ? { bg: '#0CA67818', color: '#0CA678', label: 'نشط' }
                            : { bg: '#E0305018', color: '#E03050', label: 'مغلق' };
                        return (
                            <div key={venue.id} className="card" style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{venue.name}</div>
                                        <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 2 }}>{venue.category?.name ?? '-'}</div>
                                    </div>
                                    <span style={{ background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{badge.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#7A8BA8', fontSize: 13 }}>لا توجد مرافق متاحة حاليا</div>
            )}

            {/* Contact info */}
            {(business.contact_phone || business.email) && (
                <div style={{ marginTop: 20, padding: 16, background: '#F0F2F8', borderRadius: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>معلومات التواصل</div>
                    {business.email && <div style={{ fontSize: 12, color: '#4A5C78', marginBottom: 4 }} dir="ltr">{business.email}</div>}
                    {business.contact_phone && <div style={{ fontSize: 12, color: '#4A5C78' }} dir="ltr">{business.contact_phone}</div>}
                </div>
            )}
        </EmployeeLayout>
    );
}
