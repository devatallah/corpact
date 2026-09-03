import { Head } from '@inertiajs/react';
import { MapPin, Store } from 'lucide-react';
import { BackLink, ListStates } from '@/components/list-states';
import { Badge, Card, PageHeader } from '@/components/portal/ui';
import EmployeeLayout from '@/layouts/employee-layout';

/**
 * H §11 — بطاقة المرفق كما يراها الموظف.
 *
 * Read-only, and deliberately without any reliability figure: the index is
 * internal, and a member browsing venues is not the audience for a score they
 * cannot interpret and the provider cannot see either.
 */
export default function EmployeeExploreShow({
    partner,
}: {
    partner: {
        id: number;
        name: string;
        trade_name: string | null;
        city: string | null;
        district: string | null;
        venues?: { id: number; name: string; status: string }[];
        categories?: { id: number; name: string }[];
    };
}) {
    return (
        <EmployeeLayout>
            <Head title={partner.trade_name || partner.name} />

            <BackLink href="/employee/explore" label="العودة إلى الاستكشاف" />

            <PageHeader
                icon={Store}
                title={partner.trade_name || partner.name}
                subtitle={
                    [partner.district, partner.city]
                        .filter(Boolean)
                        .join('، ') || '—'
                }
            />

            {(partner.categories ?? []).length > 0 && (
                <Card padding="p-4" className="space-y-2">
                    <h2 className="text-sm font-extrabold text-ink">الأنشطة</h2>
                    <div className="flex flex-wrap gap-1.5">
                        {(partner.categories ?? []).map((category) => (
                            <Badge key={category.id} tone="neutral">
                                {category.name}
                            </Badge>
                        ))}
                    </div>
                </Card>
            )}

            <Card padding="p-4" className="space-y-2">
                <h2 className="text-sm font-extrabold text-ink">الملاعب</h2>

                {(partner.venues ?? []).map((venue) => (
                    <div
                        key={venue.id}
                        className="flex items-center justify-between gap-2 rounded-xl border-[0.5px] border-ink/12 bg-page px-3 py-2"
                    >
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink">
                            <MapPin
                                className="h-3 w-3 shrink-0 text-ink/45"
                                aria-hidden="true"
                            />
                            {venue.name}
                        </span>
                        <Badge
                            tone={
                                venue.status === 'active'
                                    ? 'success'
                                    : 'neutral'
                            }
                        >
                            {venue.status === 'active'
                                ? 'متاح'
                                : venue.status === 'maintenance'
                                  ? 'تحت الصيانة'
                                  : 'مغلق'}
                        </Badge>
                    </div>
                ))}

                <ListStates
                    count={(partner.venues ?? []).length}
                    empty="لا ملاعب معروضة."
                />
            </Card>

            <Card padding="p-3.5">
                <p className="text-[11px] leading-relaxed text-ink/60">
                    لحجز فعالية في هذا المرفق، أنشئها من مجتمعك واختره ضمن
                    المرافق — يذهب الطلب إليه ويردّ بالقبول أو باقتراح وقت بديل.
                </p>
            </Card>
        </EmployeeLayout>
    );
}
