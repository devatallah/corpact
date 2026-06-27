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
            <div style={{ marginBottom: 8, paddingTop: 4 }}>
                <Link href="/employee/explore" style={{ fontSize: 13, color: '#999', textDecoration: 'none' }}>← العودة للاستكشاف</Link>
            </div>

            {/* Business name */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.5px' }}>{business.name}</h1>
                <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                    {[business.district, business.city].filter(Boolean).join('، ')}
                </p>
            </div>

            {/* Categories */}
            {business.categories && business.categories.length > 0 && (
                <div className="section">
                    <div className="section-head">
                        <div className="section-title">الفئات</div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {business.categories.map((cat) => (
                            <span key={cat.id} className="badge b-confirmed" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px' }}>
                                <CategoryIcon icon={cat.icon} size={16} /> {cat.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Venues */}
            {business.venues && business.venues.length > 0 ? (
                <div className="section">
                    <div className="section-head">
                        <div className="section-title">المرافق ({business.venues.length})</div>
                    </div>
                    <div className="list-card">
                        {business.venues.map((venue) => {
                            const badgeClass = venue.status === 'active' ? 'b-confirmed' : 'b-cancelled';
                            const badgeLabel = venue.status === 'active' ? 'نشط' : 'مغلق';
                            return (
                                <div key={venue.id} className="list-row" style={{ cursor: 'default' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{venue.name}</div>
                                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{venue.category?.name ?? '-'}</div>
                                    </div>
                                    <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="empty">
                    <div className="ico">🏟️</div>
                    <div className="txt">لا توجد مرافق متاحة حاليا</div>
                </div>
            )}

            {/* Contact info */}
            {(business.contact_phone || business.email) && (
                <div className="card" style={{ background: '#FAFAFA' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>معلومات التواصل</div>
                    {business.email && <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }} dir="ltr">{business.email}</div>}
                    {business.contact_phone && <div style={{ fontSize: 13, color: '#666' }} dir="ltr">{business.contact_phone}</div>}
                </div>
            )}
        </EmployeeLayout>
    );
}
