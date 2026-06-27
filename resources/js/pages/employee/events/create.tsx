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
        recurrence_type: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
        recurrence_end_date: '',
        recurrence_days: [] as number[],
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

    const recurrenceLabels: Record<string, string> = { none: 'مرة واحدة', daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري' };
    const dayLabels: Record<number, string> = { 0: 'أحد', 1: 'إثنين', 2: 'ثلاثاء', 3: 'أربعاء', 4: 'خميس', 5: 'جمعة', 6: 'سبت' };

    const reviewRows = [
        { label: 'المجتمع', value: selectedCommunity?.name ?? '-' },
        { label: 'المنشأة', value: selectedBusiness?.name ?? '-' },
        { label: 'المرافق', value: selectedVenues.length > 0 ? selectedVenues.map((c) => c.name).join('، ') : '-' },
        { label: 'التاريخ', value: data.date || '-' },
        { label: 'مدة الحجز', value: selectedPricing ? `${selectedPricing.duration_minutes} دقيقة` : '-' },
        { label: 'عدد المرافق', value: data.venue_ids.length + (data.venue_ids.length === 1 ? ' مرفق' : ' مرافق') },
        { label: 'عدد اللاعبين', value: `${data.capacity} لاعبين` },
        { label: 'التكرار', value: recurrenceLabels[data.recurrence_type] ?? 'مرة واحدة' },
        ...(data.recurrence_type !== 'none' && data.recurrence_end_date
            ? [{ label: 'ينتهي في', value: data.recurrence_end_date }]
            : []),
        ...(data.recurrence_type === 'weekly' && data.recurrence_days.length > 0
            ? [{ label: 'أيام التكرار', value: data.recurrence_days.sort().map((d) => dayLabels[d]).join('، ') }]
            : []),
        { label: 'إجمالي الحجز', value: `${totalPrice.toLocaleString()} ريال` },
    ];

    return (
        <EmployeeLayout>
            <Head title="إنشاء فعالية" />

            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.5px' }}>إنشاء فعالية</h1>
                <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>اختر تفاصيل الفعالية الجديدة</p>
            </div>

            {/* Step indicators */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
                {[1, 2, 3].map((n) => (
                    <div key={n} className="bar-wrap" style={{ flex: 1 }}>
                        {n <= step && <div className="bar-fill" style={{ width: '100%' }} />}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {/* === STEP 1: Pick Community === */}
                {step === 1 && (
                    <div className="section">
                        <div className="section-head">
                            <div className="section-title">اختر المجتمع</div>
                        </div>

                        {communities.length > 0 ? (
                            communities.map((community) => {
                                const isSelected = Number(data.community_id) === community.id;
                                return (
                                    <div
                                        key={community.id}
                                        onClick={() => selectCommunity(community)}
                                        className="card"
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderColor: isSelected ? '#18A86B' : undefined }}
                                    >
                                        <div><CategoryIcon icon={community.category?.icon} size={28} /></div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{community.name}</div>
                                            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{community.members_count} عضو</div>
                                        </div>
                                        {isSelected && <div style={{ color: '#18A86B', fontWeight: 700, fontSize: 18 }}>✓</div>}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty">
                                <div className="ico">📭</div>
                                <div className="txt">لم تنضم لأي مجتمع بعد. انضم لمجتمع أولا.</div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            disabled={!data.community_id}
                            className="btn btn-primary btn-full"
                            style={{ marginTop: 14, padding: '14px 20px', opacity: !data.community_id ? 0.5 : 1 }}
                        >
                            التالي
                        </button>
                    </div>
                )}

                {/* === STEP 2: Business, Date, Duration, Players === */}
                {step === 2 && (
                    <div>
                        <div className="section-head" style={{ marginBottom: 16 }}>
                            <div className="section-title">المنشأة والموعد</div>
                        </div>

                        {/* Business select */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'block' }}>اختر المنشأة</label>
                            <select
                                value={data.business_id}
                                onChange={(e) => handlebusinessChange(e.target.value)}
                            >
                                <option value="">اختر المنشأة...</option>
                                {filteredbusinesses.map((business) => (
                                    <option key={business.id} value={business.id}>{business.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Venue multi-select */}
                        {selectedBusiness && availablevenues.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'block' }}>اختر المرافق ({data.venue_ids.length})</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {availablevenues.map((venue) => {
                                        const isSelected = data.venue_ids.includes(venue.id);
                                        return (
                                            <div
                                                key={venue.id}
                                                onClick={() => togglevenue(venue.id)}
                                                className="card"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                    marginBottom: 0,
                                                    borderColor: isSelected ? '#18A86B' : undefined,
                                                    background: isSelected ? '#18A86B08' : '#fff',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 18, height: 18, borderRadius: 4, ...(isSelected ? { background: '#18A86B', display: 'flex', alignItems: 'center', justifyContent: 'center' } : { border: '2px solid #EBEBEB' }) }}>
                                                        {isSelected && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                                                    </div>
                                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{venue.name}</span>
                                                </div>
                                                <span style={{ fontSize: 12, color: '#999' }}>{venue.category?.name ?? ''}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Date & Time */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'block' }}>التاريخ</label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'block' }}>الوقت</label>
                                <TimePicker value={data.time} onChange={(v) => setData('time', v)} />
                            </div>
                        </div>

                        {/* Duration (pricing) with peak/off-peak badges */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, color: '#666', fontWeight: 600, marginBottom: 8, display: 'block' }}>مدة الحجز</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {loadingPricings ? (
                                    <div className="card" style={{ textAlign: 'center', color: '#999', fontSize: 13, marginBottom: 0 }}>جاري تحميل الأسعار...</div>
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
                                                className="card"
                                                style={{
                                                    cursor: 'pointer',
                                                    marginBottom: 0,
                                                    borderColor: isSelected ? '#18A86B' : undefined,
                                                    background: isSelected ? '#18A86B08' : '#fff',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 18, height: 18, borderRadius: '50%', ...(isSelected ? { background: '#18A86B', display: 'flex', alignItems: 'center', justifyContent: 'center' } : { border: '2px solid #EBEBEB' }) }}>
                                                            {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                                                        </div>
                                                        <span style={{ fontSize: 14, fontWeight: 600 }}>{p.duration_minutes} دقيقة</span>
                                                        {p.is_peak ? (
                                                            <span className="badge b-cancelled" style={{ fontSize: 9, padding: '1px 8px' }}>ذروة</span>
                                                        ) : (
                                                            <span className="badge b-confirmed" style={{ fontSize: 9, padding: '1px 8px' }}>خارج الذروة</span>
                                                        )}
                                                        {p.label && <span style={{ fontSize: 11, color: '#999' }}>{p.label}</span>}
                                                    </div>
                                                    <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? '#18A86B' : '#0A0A0A' }}>{durationTotal.toLocaleString()} ريال</span>
                                                </div>
                                                {selectedVenues.length > 1 && (
                                                    <div style={{ marginTop: 8, marginRight: 26, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                        {perVenue.map((c) => (
                                                            <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
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
                                    <div className="card" style={{ textAlign: 'center', color: '#999', fontSize: 13, marginBottom: 0 }}>
                                        {!selectedBusiness ? 'اختر المنشأة أولا' : selectedVenues.length === 0 ? 'اختر المرافق أولا' : !data.date || !data.time ? 'حدد التاريخ والوقت لعرض الأسعار المتاحة' : 'لا توجد أسعار متاحة لهذا الوقت'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Players count */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, color: '#666', fontWeight: 600, marginBottom: 8, display: 'block' }}>عدد اللاعبين</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <button type="button" onClick={() => setData('capacity', Math.max(2, data.capacity - 1))} className="btn btn-outline" style={{ width: 40, height: 40, padding: 0, fontSize: 20 }}>−</button>
                                <input
                                    type="number"
                                    value={data.capacity}
                                    min={2}
                                    onChange={(e) => setData('capacity', Math.max(2, parseInt(e.target.value) || 2))}
                                    style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 700, borderColor: '#18A86B' }}
                                />
                                <button type="button" onClick={() => setData('capacity', data.capacity + 1)} className="btn btn-outline" style={{ width: 40, height: 40, padding: 0, fontSize: 20 }}>+</button>
                            </div>
                        </div>

                        {/* Recurrence */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, color: '#666', fontWeight: 600, marginBottom: 8, display: 'block' }}>التكرار</label>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {([
                                    { value: 'none', label: 'مرة واحدة' },
                                    { value: 'daily', label: 'يومي' },
                                    { value: 'weekly', label: 'أسبوعي' },
                                    { value: 'monthly', label: 'شهري' },
                                ] as const).map((opt) => {
                                    const isSelected = data.recurrence_type === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setData((prev) => ({
                                                ...prev,
                                                recurrence_type: opt.value,
                                                recurrence_end_date: opt.value === 'none' ? '' : prev.recurrence_end_date,
                                                recurrence_days: opt.value === 'weekly' ? prev.recurrence_days : [],
                                            }))}
                                            className={`pill${isSelected ? ' on' : ''}`}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recurrence end date */}
                        {data.recurrence_type !== 'none' && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, color: '#666', marginBottom: 6, display: 'block' }}>تاريخ انتهاء التكرار</label>
                                <input
                                    type="date"
                                    value={data.recurrence_end_date}
                                    min={data.date || undefined}
                                    onChange={(e) => setData('recurrence_end_date', e.target.value)}
                                />
                            </div>
                        )}

                        {/* Weekly day selection */}
                        {data.recurrence_type === 'weekly' && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, color: '#666', fontWeight: 600, marginBottom: 8, display: 'block' }}>أيام التكرار</label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {([
                                        { value: 0, label: 'أحد' },
                                        { value: 1, label: 'إثنين' },
                                        { value: 2, label: 'ثلاثاء' },
                                        { value: 3, label: 'أربعاء' },
                                        { value: 4, label: 'خميس' },
                                        { value: 5, label: 'جمعة' },
                                        { value: 6, label: 'سبت' },
                                    ] as const).map((day) => {
                                        const isSelected = data.recurrence_days.includes(day.value);
                                        return (
                                            <div
                                                key={day.value}
                                                onClick={() => {
                                                    const days = isSelected
                                                        ? data.recurrence_days.filter((d) => d !== day.value)
                                                        : [...data.recurrence_days, day.value];
                                                    setData('recurrence_days', days);
                                                }}
                                                style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: isSelected ? '2px solid #18A86B' : '1px solid #EBEBEB',
                                                    background: isSelected ? '#18A86B' : '#fff',
                                                    color: isSelected ? '#fff' : '#666',
                                                    cursor: 'pointer',
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {day.label}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Recurrence summary */}
                        {data.recurrence_type !== 'none' && data.recurrence_end_date && (
                            <div className="card" style={{ background: '#ECFDF3', borderColor: '#18A86B33', fontSize: 13, color: '#0E7C4A' }}>
                                {data.recurrence_type === 'daily' && `سيتم إنشاء فعالية يومية من ${data.date} حتى ${data.recurrence_end_date}`}
                                {data.recurrence_type === 'weekly' && `سيتم إنشاء فعالية أسبوعية${data.recurrence_days.length > 0 ? ` في الأيام المختارة` : ''} من ${data.date} حتى ${data.recurrence_end_date}`}
                                {data.recurrence_type === 'monthly' && `سيتم إنشاء فعالية شهرية من ${data.date} حتى ${data.recurrence_end_date}`}
                            </div>
                        )}

                        {/* Discount selection */}
                        {matchingDiscounts.length > 0 && totalPrice > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, color: '#666', fontWeight: 600, marginBottom: 8, display: 'block' }}>خصومات متاحة</label>
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
                                                className="card"
                                                style={{
                                                    cursor: 'pointer',
                                                    marginBottom: 0,
                                                    borderColor: isSelected ? '#D97706' : undefined,
                                                    background: isSelected ? '#FEF3C708' : '#fff',
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 18, height: 18, borderRadius: '50%', ...(isSelected ? { background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' } : { border: '2px solid #EBEBEB' }) }}>
                                                            {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#D97706' : '#0A0A0A' }}>
                                                                {d.name || (d.type === 'percentage' ? `${d.value}% خصم` : `${Number(d.value).toLocaleString()} ر.س خصم`)}
                                                            </div>
                                                            <div style={{ fontSize: 12, color: '#999', display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                                                                <span>{d.type === 'percentage' ? `${d.value}%` : `${Number(d.value).toLocaleString()} ر.س`}</span>
                                                                <span>{d.usage === 'one_time' ? 'مرة واحدة' : 'فترة زمنية'}</span>
                                                                {d.start_time && d.end_time && <span>{d.start_time.slice(0, 5)} - {d.end_time.slice(0, 5)}</span>}
                                                                {d.usage === 'date_range' && d.expires_at && <span>حتى {d.expires_at.slice(0, 10)}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: 15, fontWeight: 700, color: isSelected ? '#D97706' : '#999' }}>
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
                        <div className="card" style={{ background: '#ECFDF3', borderColor: '#18A86B33', marginBottom: 20 }}>
                            {/* Wallet balance */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: '#666' }}>رصيد محفظة المجتمع</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{communityBalance.toLocaleString()} ريال</span>
                            </div>

                            <div style={{ height: 1, background: '#18A86B22', margin: '8px 0' }} />

                            {/* Total */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>إجمالي الحجز</span>
                                <span style={{ fontSize: 14, fontWeight: 700 }}>{totalPrice.toLocaleString()} ريال</span>
                            </div>

                            {/* Per-venue breakdown */}
                            {venuePrices.map((c) => (
                                <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, paddingRight: 10 }}>
                                    <span style={{ fontSize: 12, color: '#999' }}>{c.name}</span>
                                    <span style={{ fontSize: 12, color: '#999' }}>{c.price.toLocaleString()} ريال</span>
                                </div>
                            ))}

                            {/* Discount deduction */}
                            {discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 13, color: '#D97706' }}>خصم المنشأة</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#D97706' }}>-{discountAmount.toLocaleString()} ريال</span>
                                </div>
                            )}

                            {/* Community wallet deduction */}
                            {communityContribution > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 13, color: '#666' }}>خصم من المحفظة</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#18A86B' }}>{communityContribution.toLocaleString()} ريال</span>
                                </div>
                            )}

                            {/* Remaining after wallet */}
                            {communityContribution > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 13, color: '#666' }}>المتبقي على اللاعبين</span>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{afterWallet.toLocaleString()} ريال</span>
                                </div>
                            )}

                            <div style={{ height: 1, background: '#18A86B22', margin: '8px 0' }} />

                            {/* Per player */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>حصة كل لاعب</span>
                                <span style={{ fontSize: 22, fontWeight: 700, color: '#18A86B' }}>{perPlayer.toLocaleString()} ريال</span>
                            </div>
                            {perPlayer <= 0 && totalPrice > 0 && (
                                <div style={{ marginTop: 8, background: '#18A86B18', borderRadius: 10, padding: '6px 10px', fontSize: 12, color: '#18A86B', textAlign: 'center' }}>
                                    مغطى بالكامل من رصيد المجتمع
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1, padding: '14px 20px' }}>رجوع</button>
                            <button type="button" onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2, padding: '14px 20px' }}>التالي</button>
                        </div>
                    </div>
                )}

                {/* === STEP 3: Review & Submit === */}
                {step === 3 && (
                    <div>
                        <div className="section-head" style={{ marginBottom: 16 }}>
                            <div className="section-title">مراجعة الفعالية</div>
                        </div>

                        <div className="card" style={{ borderColor: '#18A86B33', marginBottom: 20 }}>
                            {reviewRows.map((row, i) => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', ...(i < reviewRows.length - 1 ? { borderBottom: '1px solid #EBEBEB' } : {}) }}>
                                    <span style={{ fontSize: 13, color: '#999' }}>{row.label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{row.value}</span>
                                </div>
                            ))}
                            {discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #EBEBEB' }}>
                                    <span style={{ fontSize: 13, color: '#D97706' }}>خصم المنشأة</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#D97706' }}>-{discountAmount.toLocaleString()} ريال</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                <span style={{ fontSize: 13, color: '#999' }}>حصة كل لاعب</span>
                                <span style={{ fontSize: 16, fontWeight: 700, color: '#18A86B' }}>{perPlayer.toLocaleString()} ريال</span>
                            </div>
                        </div>

                        <div className="card" style={{ background: '#ECFDF3', borderColor: '#18A86B33', fontSize: 13, color: '#0E7C4A', marginBottom: 20 }}>
                            سيُرسل طلب الحجز للمنشأة بعد اكتمال عدد اللاعبين
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div className="card" style={{ background: '#FEF2F2', borderColor: '#FECACA', marginBottom: 16 }}>
                                {Object.values(errors).map((err, i) => (
                                    <div key={i} className="field-error">{err}</div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={() => setStep(2)} className="btn btn-outline" style={{ flex: 1, padding: '14px 20px' }}>رجوع</button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn btn-primary"
                                style={{ flex: 2, padding: '14px 20px', opacity: processing ? 0.6 : 1 }}
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
