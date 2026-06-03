import EmployeeLayout from '@/layouts/employee-layout';
import CategoryIcon from '@/components/category-icon';
import { Head, useForm } from '@inertiajs/react';
import type { Business, Community, Venue, VenuePricing, Discount, Category } from '@/types/models';
import { useState, useMemo, useEffect } from 'react';
import TimePicker from '@/components/time-picker';
import toastr from 'toastr';

interface CommunityWithCategory extends Community {
    category: Category;
    members_count: number;
}

interface businessWithvenues extends Business {
    venues: Venue[];
}

interface Props {
    communities: CommunityWithCategory[];
    businesses: businessWithvenues[];
    discounts: Discount[];
}

export default function EventCreate({ communities, businesses, discounts }: Props) {
    const searchParams = new URLSearchParams(window.location.search);
    const queryCommunityId = searchParams.get('community_id');
    const queryQuickMatchId = searchParams.get('quick_match_id');
    const preselected = queryCommunityId ? communities.find((c) => c.id === Number(queryCommunityId)) : null;
    const initial = preselected ?? communities[0];

    const [step, setStep] = useState(preselected ? 2 : 1);

    const { data, setData, post, processing, errors } = useForm({
        community_id: initial?.id ?? '',
        category_id: initial?.category_id ?? '',
        business_id: '' as string | number,
        venue_ids: [] as number[],
        venue_pricing_id: '' as string | number,
        discount_id: null as number | null,
        quick_match_id: queryQuickMatchId ? Number(queryQuickMatchId) : null as number | null,
        date: '',
        time: '',
        venues_count: 1,
        capacity: 4,
        company_subsidy: 0,
        notes: '',
    });

    // Derived data
    const selectedCommunity = communities.find((c) => c.id === Number(data.community_id));
    const categoryId = Number(data.category_id);

    const filteredbusinesses = useMemo(() => {
        if (!categoryId) return businesses;
        return businesses.filter((business) => business.venues.some((venue) => venue.category_id === categoryId && venue.status === 'active'));
    }, [businesses, categoryId]);

    const selectedBusiness = filteredbusinesses.find((c) => c.id === Number(data.business_id));

    const availablevenues = useMemo(() => {
        if (!selectedBusiness) return [];
        return selectedBusiness.venues.filter((c) => c.category_id === categoryId && c.status === 'active');
    }, [selectedBusiness, categoryId]);

    const selectedVenues = availablevenues.filter((c) => data.venue_ids.includes(c.id));

    // Server-fetched pricings
    const [serverPricings, setServerPricings] = useState<VenuePricing[]>([]);
    const [loadingPricings, setLoadingPricings] = useState(false);

    // Fetch pricings from server when venues + date + time are set
    useEffect(() => {
        if (data.venue_ids.length === 0 || !data.date || !data.time) {
            setServerPricings([]);
            setData('venue_pricing_id', '');
            return;
        }

        setLoadingPricings(true);
        fetch('/employee/create/pricings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '') },
            body: JSON.stringify({ venue_ids: data.venue_ids, date: data.date, time: data.time }),
        })
            .then((r) => r.json())
            .then((pricings: VenuePricing[]) => {
                setServerPricings(pricings);
                setData('venue_pricing_id', '');
                setLoadingPricings(false);
            })
            .catch(() => { setServerPricings([]); setLoadingPricings(false); });
    }, [data.venue_ids.join(','), data.date, data.time]);

    // Group server pricings: only show durations common to ALL selected venues
    const availablePricings = useMemo(() => {
        if (selectedVenues.length === 0 || serverPricings.length === 0) return [];
        const firstVenuePricings = serverPricings.filter((p) => p.venue_id === data.venue_ids[0]);
        return firstVenuePricings.filter((p) =>
            data.venue_ids.every((venueId) =>
                serverPricings.some((sp) => sp.venue_id === venueId && sp.duration_minutes === p.duration_minutes),
            ),
        );
    }, [selectedVenues, serverPricings, data.venue_ids]);

    const selectedPricing = availablePricings.find(
        (p) => p.id === Number(data.venue_pricing_id),
    );

    // Find all matching discounts for current selection
    const matchingDiscounts = useMemo(() => {
        if (!selectedBusiness || !selectedCommunity) return [];

        const communityId = Number(data.community_id);
        const businessId = Number(data.business_id);

        return discounts.filter((d) => {
            if (d.business_id !== businessId || d.community_id !== communityId) return false;
            if (d.status !== 'active') return false;

            // For date_range, check if current date is within range
            if (d.usage === 'date_range' && d.starts_at && d.expires_at && data.date) {
                if (data.date < d.starts_at.slice(0, 10) || data.date > d.expires_at.slice(0, 10)) return false;
            }

            // Check time restriction
            if (d.start_time && d.end_time && data.time) {
                if (data.time < d.start_time.slice(0, 5) || data.time > d.end_time.slice(0, 5)) return false;
            }

            return true;
        });
    }, [discounts, data.business_id, data.community_id, data.date, data.time, selectedBusiness, selectedCommunity]);

    const selectedDiscount = matchingDiscounts.find((d) => d.id === data.discount_id) ?? null;

    // Reset discount selection when matching discounts change
    useEffect(() => {
        if (matchingDiscounts.length === 0) {
            setData('discount_id', null);
        } else if (data.discount_id && !matchingDiscounts.some((d) => d.id === data.discount_id)) {
            setData('discount_id', null);
        }
    }, [matchingDiscounts]);

    // Per-venue prices for the selected duration
    const venuePrices = useMemo(() => {
        if (!selectedPricing || selectedVenues.length === 0) return [];
        return selectedVenues.map((venue) => {
            const cp = serverPricings.find((p) => p.venue_id === venue.id && p.duration_minutes === selectedPricing.duration_minutes);
            return { name: venue.name, price: Number(cp?.price ?? 0) };
        });
    }, [selectedPricing, selectedVenues, serverPricings]);

    const totalPrice = venuePrices.reduce((sum, c) => sum + c.price, 0);

    // Calculate discount
    const discountAmount = useMemo(() => {
        if (!selectedDiscount || totalPrice <= 0) return 0;
        if (selectedDiscount.type === 'percentage') {
            return Math.round(totalPrice * Number(selectedDiscount.value) / 100 * 100) / 100;
        }
        return Math.min(Number(selectedDiscount.value), totalPrice);
    }, [selectedDiscount, totalPrice]);

    const afterDiscount = Math.max(0, totalPrice - discountAmount);
    const communityBalance = Math.max(0, selectedCommunity?.balance ?? 0);
    const communityContribution = Math.min(afterDiscount, communityBalance);
    const afterWallet = afterDiscount - communityContribution;
    const perPlayer = data.capacity > 0 ? Math.ceil(afterWallet / data.capacity) : 0;

    function selectCommunity(community: CommunityWithCategory) {
        setData((prev) => ({
            ...prev,
            community_id: community.id,
            category_id: community.category_id,
            business_id: '',
            venue_ids: [],
            venue_pricing_id: '',
            discount_id: null,
        }));
    }

    function handlebusinessChange(businessId: string) {
        setData((prev) => ({ ...prev, business_id: businessId, venue_ids: [], venue_pricing_id: '', discount_id: null }));
    }

    function togglevenue(venueId: number) {
        setData((prev) => {
            const ids = prev.venue_ids.includes(venueId)
                ? prev.venue_ids.filter((id) => id !== venueId)
                : [...prev.venue_ids, venueId];
            return { ...prev, venue_ids: ids, venues_count: ids.length, venue_pricing_id: '' };
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/employee/create', {
            onSuccess: () => toastr.success('تم إنشاء الفعالية بنجاح'),
        });
    }

    const reviewRows = [
        { label: 'المجتمع', value: selectedCommunity?.name ?? '-' },
        { label: 'المنشأة', value: selectedBusiness?.name ?? '-' },
        { label: 'المرافق', value: selectedVenues.length > 0 ? selectedVenues.map((c) => c.name).join('، ') : '-' },
        { label: 'التاريخ', value: data.date || '-' },
        { label: 'مدة الحجز', value: selectedPricing ? `${selectedPricing.duration_minutes} دقيقة` : '-' },
        { label: 'عدد المرافق', value: data.venue_ids.length + (data.venue_ids.length === 1 ? ' مرفق' : ' مرافق') },
        { label: 'عدد اللاعبين', value: `${data.capacity} لاعبين` },
        { label: 'إجمالي الحجز', value: `${totalPrice.toLocaleString()} ريال` },
    ];

    return (
        <EmployeeLayout>
            <Head title="إنشاء فعالية" />

            <div style={{ padding: '16px 0 20px' }}>
                <div style={{ fontSize: 11, color: '#7A8BA8' }}>إنشاء فعالية جديدة</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>اختر التفاصيل</div>
            </div>

            {/* Step indicators */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                {[1, 2, 3].map((n) => (
                    <div key={n} style={{ flex: 1, height: 4, borderRadius: 4, background: n <= step ? '#009E82' : '#E4E9F2' }} />
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {/* === STEP 1: Pick Community === */}
                {step === 1 && (
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>اختر المجتمع</div>

                        {communities.length > 0 ? (
                            communities.map((community) => {
                                const isSelected = Number(data.community_id) === community.id;
                                return (
                                    <div
                                        key={community.id}
                                        onClick={() => selectCommunity(community)}
                                        className="card"
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', border: `2px solid ${isSelected ? '#009E82' : '#E4E9F2'}`, marginBottom: 10 }}
                                    >
                                        <div><CategoryIcon icon={community.category?.icon} size={28} /></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700 }}>{community.name}</div>
                                            <div style={{ fontSize: 11, color: '#7A8BA8' }}>{community.members_count} عضو</div>
                                        </div>
                                        {isSelected && <div style={{ color: '#009E82', fontWeight: 700 }}>✓</div>}
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ textAlign: 'center', padding: 24, color: '#7A8BA8', fontSize: 13 }}>لم تنضم لأي مجتمع بعد. انضم لمجتمع أولا.</div>
                        )}

                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            disabled={!data.community_id}
                            style={{ width: '100%', padding: 16, background: '#009E82', color: '#000', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', marginTop: 14 }}
                        >
                            التالي
                        </button>
                    </div>
                )}

                {/* === STEP 2: Business, Date, Duration, Players === */}
                {step === 2 && (
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>المنشأة والموعد</div>

                        {/* Business select */}
                        <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 6 }}>اختر المنشأة</div>
                        <div style={{ position: 'relative', marginBottom: 16 }}>
                            <select
                                value={data.business_id}
                                onChange={(e) => handlebusinessChange(e.target.value)}
                                style={{ width: '100%', padding: '12px 14px', background: '#fff', border: '1px solid #E4E9F2', borderRadius: 12, fontSize: 13, appearance: 'none', cursor: 'pointer', outline: 'none', direction: 'rtl', fontFamily: 'inherit' }}
                            >
                                <option value="">اختر المنشأة...</option>
                                {filteredbusinesses.map((business) => (
                                    <option key={business.id} value={business.id}>{business.name}</option>
                                ))}
                            </select>
                            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#7A8BA8', pointerEvents: 'none' }}>▼</div>
                        </div>

                        {/* Venue multi-select */}
                        {selectedBusiness && availablevenues.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 6 }}>اختر المرافق ({data.venue_ids.length})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {availablevenues.map((venue) => {
                                        const isSelected = data.venue_ids.includes(venue.id);
                                        return (
                                            <div
                                                key={venue.id}
                                                onClick={() => togglevenue(venue.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '12px 14px',
                                                    background: isSelected ? '#009E8208' : '#fff',
                                                    border: `2px solid ${isSelected ? '#009E82' : '#E4E9F2'}`,
                                                    borderRadius: 12,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 18, height: 18, borderRadius: 4, ...(isSelected ? { background: '#009E82', display: 'flex', alignItems: 'center', justifyContent: 'center' } : { border: '2px solid #E4E9F2' }) }}>
                                                        {isSelected && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                                                    </div>
                                                    <span style={{ fontSize: 14, fontWeight: 700 }}>{venue.name}</span>
                                                </div>
                                                <span style={{ fontSize: 11, color: '#7A8BA8' }}>{venue.category?.name ?? ''}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Date & Time */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 6 }}>التاريخ</div>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    style={{ width: '100%', background: '#fff', border: '1px solid #E4E9F2', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit' }}
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#7A8BA8', marginBottom: 6 }}>الوقت</div>
                                <TimePicker value={data.time} onChange={(v) => setData('time', v)} />
                            </div>
                        </div>

                        {/* Duration (pricing) with peak/off-peak badges */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 12, color: '#7A8BA8', fontWeight: 600, marginBottom: 8 }}>مدة الحجز</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {loadingPricings ? (
                                    <div style={{ padding: '12px 14px', background: '#fff', border: '2px solid #E4E9F2', borderRadius: 12, fontSize: 13, color: '#7A8BA8', textAlign: 'center' }}>جاري تحميل الأسعار...</div>
                                ) : availablePricings.length > 0 ? (
                                    availablePricings.map((p) => {
                                        const isSelected = Number(data.venue_pricing_id) === p.id;
                                        const perVenue = selectedVenues.map((venue) => {
                                            const cp = serverPricings.find((sp) => sp.venue_id === venue.id && sp.duration_minutes === p.duration_minutes);
                                            return { name: venue.name, price: Number(cp?.price ?? 0) };
                                        });
                                        const durationTotal = perVenue.reduce((s, c) => s + c.price, 0);
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => setData('venue_pricing_id', p.id)}
                                                style={{ padding: '12px 14px', background: isSelected ? '#009E8208' : '#fff', border: `2px solid ${isSelected ? '#009E82' : '#E4E9F2'}`, borderRadius: 12, cursor: 'pointer' }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 18, height: 18, borderRadius: '50%', ...(isSelected ? { background: '#009E82', display: 'flex', alignItems: 'center', justifyContent: 'center' } : { border: '2px solid #E4E9F2' }) }}>
                                                            {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                                                        </div>
                                                        <span style={{ fontSize: 14, fontWeight: 700 }}>{p.duration_minutes} دقيقة</span>
                                                        {/* Peak badge */}
                                                        {p.is_peak ? (
                                                            <span style={{ background: '#E03050', color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>ذروة</span>
                                                        ) : (
                                                            <span style={{ background: '#10B981', color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>خارج الذروة</span>
                                                        )}
                                                        {p.label && <span style={{ fontSize: 10, color: '#7A8BA8' }}>{p.label}</span>}
                                                    </div>
                                                    <span style={{ fontSize: 14, fontWeight: 800, color: isSelected ? '#009E82' : '#0F1923' }}>{durationTotal.toLocaleString()} ريال</span>
                                                </div>
                                                {selectedVenues.length > 1 && (
                                                    <div style={{ marginTop: 8, marginRight: 26, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                        {perVenue.map((c) => (
                                                            <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7A8BA8' }}>
                                                                <span>{c.name}</span>
                                                                <span>{c.price.toLocaleString()} ريال</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ padding: '12px 14px', background: '#fff', border: '2px solid #E4E9F2', borderRadius: 12, fontSize: 13, color: '#7A8BA8', textAlign: 'center' }}>
                                        {!selectedBusiness ? 'اختر المنشأة أولا' : selectedVenues.length === 0 ? 'اختر المرافق أولا' : !data.date || !data.time ? 'حدد التاريخ والوقت لعرض الأسعار المتاحة' : 'لا توجد أسعار متاحة لهذا الوقت'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Players count */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 12, color: '#7A8BA8', fontWeight: 600, marginBottom: 8 }}>عدد اللاعبين</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <button type="button" onClick={() => setData('capacity', Math.max(2, data.capacity - 1))} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #E4E9F2', background: '#fff', fontSize: 20, cursor: 'pointer', fontFamily: 'inherit' }}>−</button>
                                <input
                                    type="number"
                                    value={data.capacity}
                                    min={2}
                                    onChange={(e) => setData('capacity', Math.max(2, parseInt(e.target.value) || 2))}
                                    style={{ flex: 1, textAlign: 'center', padding: 10, background: '#fff', border: '1px solid #009E82', borderRadius: 10, fontSize: 18, fontWeight: 800, outline: 'none' }}
                                />
                                <button type="button" onClick={() => setData('capacity', data.capacity + 1)} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #E4E9F2', background: '#fff', fontSize: 20, cursor: 'pointer', fontFamily: 'inherit' }}>+</button>
                            </div>
                        </div>

                        {/* Discount selection */}
                        {matchingDiscounts.length > 0 && totalPrice > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 12, color: '#7A8BA8', fontWeight: 600, marginBottom: 8 }}>خصومات متاحة</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {matchingDiscounts.map((d) => {
                                        const isSelected = data.discount_id === d.id;
                                        const amt = d.type === 'percentage'
                                            ? Math.round(totalPrice * Number(d.value) / 100 * 100) / 100
                                            : Math.min(Number(d.value), totalPrice);
                                        return (
                                            <div
                                                key={d.id}
                                                onClick={() => setData('discount_id', isSelected ? null : d.id)}
                                                style={{
                                                    padding: '10px 14px',
                                                    background: isSelected ? '#C8410A08' : '#fff',
                                                    border: `2px solid ${isSelected ? '#C8410A' : '#E4E9F2'}`,
                                                    borderRadius: 12,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 18, height: 18, borderRadius: '50%', ...(isSelected ? { background: '#C8410A', display: 'flex', alignItems: 'center', justifyContent: 'center' } : { border: '2px solid #E4E9F2' }) }}>
                                                            {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#C8410A' : '#1C1410' }}>
                                                                {d.name || (d.type === 'percentage' ? `${d.value}% خصم` : `${Number(d.value).toLocaleString()} ر.س خصم`)}
                                                            </div>
                                                            <div style={{ fontSize: 11, color: '#8A7868', display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                                                                <span>{d.type === 'percentage' ? `${d.value}%` : `${Number(d.value).toLocaleString()} ر.س`}</span>
                                                                <span>{d.usage === 'one_time' ? 'مرة واحدة' : 'فترة زمنية'}</span>
                                                                {d.start_time && d.end_time && <span>{d.start_time.slice(0, 5)} - {d.end_time.slice(0, 5)}</span>}
                                                                {d.usage === 'date_range' && d.expires_at && <span>حتى {d.expires_at.slice(0, 10)}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: 15, fontWeight: 900, color: isSelected ? '#C8410A' : '#8A7868' }}>
                                                        {amt.toLocaleString()} ر.س
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Live price summary */}
                        <div style={{ background: '#009E8210', border: '1px solid #009E8233', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
                            {/* Wallet balance */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 12, color: '#7A8BA8' }}>رصيد محفظة المجتمع</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#0F1923' }}>{communityBalance.toLocaleString()} ريال</span>
                            </div>

                            <div style={{ height: 1, background: '#009E8222', margin: '8px 0' }} />

                            {/* Total */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#0F1923' }}>إجمالي الحجز</span>
                                <span style={{ fontSize: 14, fontWeight: 800, color: '#0F1923' }}>{totalPrice.toLocaleString()} ريال</span>
                            </div>

                            {/* Per-venue breakdown */}
                            {venuePrices.map((c) => (
                                <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, paddingRight: 10 }}>
                                    <span style={{ fontSize: 11, color: '#7A8BA8' }}>{c.name}</span>
                                    <span style={{ fontSize: 11, color: '#7A8BA8' }}>{c.price.toLocaleString()} ريال</span>
                                </div>
                            ))}

                            {/* Discount deduction */}
                            {discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, color: '#C8410A' }}>خصم المنشأة</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#C8410A' }}>-{discountAmount.toLocaleString()} ريال</span>
                                </div>
                            )}

                            {/* Community wallet deduction */}
                            {communityContribution > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, color: '#7A8BA8' }}>خصم من المحفظة</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#009E82' }}>{communityContribution.toLocaleString()} ريال</span>
                                </div>
                            )}

                            {/* Remaining after wallet */}
                            {communityContribution > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, color: '#7A8BA8' }}>المتبقي على اللاعبين</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F1923' }}>{afterWallet.toLocaleString()} ريال</span>
                                </div>
                            )}

                            <div style={{ height: 1, background: '#009E8222', margin: '8px 0' }} />

                            {/* Per player */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>حصة كل لاعب</span>
                                <span style={{ fontSize: 20, fontWeight: 900, color: '#009E82' }}>{perPlayer.toLocaleString()} ريال</span>
                            </div>
                            {perPlayer <= 0 && totalPrice > 0 && (
                                <div style={{ marginTop: 8, background: '#009E8218', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#009E82', textAlign: 'center' }}>
                                    مغطى بالكامل من رصيد المجتمع
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: 16, background: '#E4E9F2', color: '#7A8BA8', border: 'none', borderRadius: 16, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>رجوع</button>
                            <button type="button" onClick={() => setStep(3)} style={{ flex: 2, padding: 16, background: '#009E82', color: '#000', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>التالي</button>
                        </div>
                    </div>
                )}

                {/* === STEP 3: Review & Submit === */}
                {step === 3 && (
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>مراجعة الفعالية</div>

                        <div className="card" style={{ borderColor: '#009E8233', marginBottom: 20 }}>
                            {reviewRows.map((row, i) => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', ...(i < reviewRows.length - 1 ? { borderBottom: '1px solid #E4E9F2' } : {}) }}>
                                    <span style={{ fontSize: 12, color: '#7A8BA8' }}>{row.label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>{row.value}</span>
                                </div>
                            ))}
                            {discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E4E9F2' }}>
                                    <span style={{ fontSize: 12, color: '#C8410A' }}>خصم المنشأة</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#C8410A' }}>-{discountAmount.toLocaleString()} ريال</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                <span style={{ fontSize: 12, color: '#7A8BA8' }}>حصة كل لاعب</span>
                                <span style={{ fontSize: 15, fontWeight: 900, color: '#009E82' }}>{perPlayer.toLocaleString()} ريال</span>
                            </div>
                        </div>

                        <div style={{ background: '#009E8218', border: '1px solid #009E8233', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#009E82', marginBottom: 20 }}>سيُرسل طلب الحجز للمنشأة بعد اكتمال عدد اللاعبين</div>

                        {Object.keys(errors).length > 0 && (
                            <div style={{ background: '#E0305018', border: '1px solid #E0305033', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#E03050', marginBottom: 16 }}>
                                {Object.values(errors).map((err, i) => (
                                    <div key={i}>{err}</div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: 16, background: '#E4E9F2', color: '#7A8BA8', border: 'none', borderRadius: 16, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>رجوع</button>
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ flex: 2, padding: 16, background: 'linear-gradient(135deg,#009E82,#00A888)', color: '#000', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(0,158,130,.3)' }}
                            >
                                نشر الفعالية
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </EmployeeLayout>
    );
}
