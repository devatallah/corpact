import { Head, Link } from '@inertiajs/react';
import CategoryIcon from '@/components/category-icon';
import { Card, CardTitle, MetaRow, Pill, Screen, Section } from '@/components/employee/ui';
import EmployeeLayout from '@/layouts/employee-layout';
import type { Partner, Venue, Category } from '@/types/models';

interface Props {
    partner: Partner & { venues: Venue[]; categories: Category[] };
}

export default function ExploreShow({ partner }: Props) {
    return (
        <EmployeeLayout>
            <Head title={partner.name} />

            <Screen>
                <div>
                    <Link href="/employee/explore" className="text-[11px] text-[#0A0A0A]/55 hover:text-[#0A0A0A]">
                        ← العودة للاستكشاف
                    </Link>
                    <h1 className="text-lg font-black text-[#0A0A0A] mt-2">{partner.name}</h1>
                    <p className="text-[11px] text-[#0A0A0A]/55 mt-0.5">
                        {[partner.district, partner.city].filter(Boolean).join('، ')}
                    </p>
                </div>

                {partner.categories && partner.categories.length > 0 && (
                    <Section title="الفئات">
                        <div className="flex flex-wrap gap-2">
                            {partner.categories.map((cat) => (
                                <span
                                    key={cat.id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border-[0.5px] border-[#0A0A0A]/15 text-xs font-bold text-[#0A0A0A]"
                                >
                                    <CategoryIcon icon={cat.icon} size={14} /> {cat.name}
                                </span>
                            ))}
                        </div>
                    </Section>
                )}

                {partner.venues && partner.venues.length > 0 ? (
                    <Section title={`المرافق (${partner.venues.length})`}>
                        <div className="space-y-2.5">
                            {partner.venues.map((venue) => (
                                <Card key={venue.id}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <CardTitle>{venue.name}</CardTitle>
                                            <div className="text-[11px] text-[#0A0A0A]/55 mt-0.5">{venue.category?.name ?? '—'}</div>
                                        </div>
                                        <Pill tone={venue.status === 'active' ? 'success' : 'danger'}>
                                            {venue.status === 'active' ? 'نشط' : 'مغلق'}
                                        </Pill>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </Section>
                ) : (
                    <Card>
                        <p className="text-[11px] text-[#0A0A0A]/55 text-center py-4">لا توجد مرافق متاحة حالياً</p>
                    </Card>
                )}

                {(partner.contact_phone || partner.email) && (
                    <Section title="معلومات التواصل">
                        <Card>
                            {partner.email && (
                                <MetaRow left="البريد الإلكتروني" right={<span dir="ltr">{partner.email}</span>} />
                            )}
                            {partner.contact_phone && (
                                <MetaRow left="رقم التواصل" right={<span dir="ltr">{partner.contact_phone}</span>} />
                            )}
                        </Card>
                    </Section>
                )}
            </Screen>
        </EmployeeLayout>
    );
}
