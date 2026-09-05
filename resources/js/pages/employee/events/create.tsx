import { Head, useForm } from '@inertiajs/react';
import {
    CalendarPlus,
    Minus,
    Plus,
    Repeat,
    Sparkles,
    TicketPercent,
    TriangleAlert,
    Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BackLink, ListStates } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Field,
    INPUT,
    Note,
    PageHeader,
} from '@/components/portal/ui';
import TimeSelect from '@/components/time-select';
import EmployeeLayout from '@/layouts/employee-layout';

/**
 * H §7 + H §11 — إنشاء فعالية.
 *
 * The platform suggests providers in a ranked order, and picking anyone other
 * than the top one requires a written reason — the server rejects the submit
 * without it. That rejection would arrive *after* the leader has filled in
 * eight fields, so the suggestions are fetched live and the reason field
 * appears the moment a non-top provider is selected, with the ranking shown
 * so the choice is informed rather than second-guessed.
 *
 * The excluded providers are listed too, each with why it was excluded. "لا
 * توجد اقتراحات" with no explanation is the single most frustrating state
 * this screen can reach.
 */
type Community = {
    id: number;
    name: string;
    members_count: number;
    category_id: number | null;
    category?: { id: number; name: string } | null;
    wallet_balance_halalas: number;
};

/**
 * A17 — تخفيض يمنحه المزوّد لهذا المجتمع.
 *
 * النسبة في `value`، والمبلغ الثابت في `value_halalas` — المال هللات، ولا
 * يُحسب على decimal أبداً.
 */
type Discount = {
    id: number;
    name: string | null;
    type: 'fixed' | 'percentage';
    value: number;
    value_halalas: number;
    starts_at: string | null;
    expires_at: string | null;
    start_time: string | null;
    end_time: string | null;
};
type Partner = {
    id: number;
    name: string;
    trade_name: string | null;
    venues?: { id: number; name: string; category_id: number }[];
};

type Candidate = {
    partner_id: number;
    name: string;
    unit_id: number;
    unit_name: string;
    pricing_type: string;
    estimated_price: string;
    is_preferred: boolean;
    preferred_position: number | null;
    reliability_score: number | null;
    consecutive_repeat: boolean;
    same_city: boolean;
};

type Pricing = {
    id: number;
    venue_id: number;
    duration_minutes: number;
    price: string;
    is_peak: boolean;
    label: string | null;
};

/**
 * خيار حجز واحد: مدة، وسعر كل ملعب مختار على حدة، ومجموعها.
 *
 * الملاعب لا تتساوى أسعارها، وعرض تسعيرة واحدة كان يُخفي ذلك ويترك الخادم
 * يستنتج البقية. الخيار يحمل معرّفات التسعيرات المعروضة، فتُرسَل كما رُئيت.
 */
type PricingOption = {
    duration_minutes: number;
    total_halalas: number;
    is_peak: boolean;
    label: string | null;
    pricing_ids: number[];
    venues: {
        venue_id: number;
        venue_name: string;
        pricing_id: number;
        price_halalas: number;
        is_peak: boolean;
        label: string | null;
    }[];
};

type Suggestions = {
    candidates: Candidate[];
    excluded: { partner_id: number; name: string; reason: string }[];
    reason: string | null;
};

/**
 * النصاب لا يتجاوز السعة — الخادم يرفض ذلك (`lte:capacity`)، فلا يُترك
 * النموذج في حال يعرف سلفاً أنها باطلة. يُطبَّق داخل تحديث واحد كي يبقى
 * الحقلان متسقين مهما تسارعت النقرات.
 */
function clampSeats<T extends { capacity: string; min_participants: string }>(
    data: T,
): T {
    const capacity = Math.max(2, Number(data.capacity || 2));
    const quorum = Number(data.min_participants || 2);

    return quorum > capacity
        ? { ...data, min_participants: String(capacity) }
        : data;
}

/**
 * مبلغ التخفيض على إجمالي بالهللة — مرآةُ `Discount::amountFor` في الخادم
 * (`Math.trunc` مقابل `intdiv`)، ولا يتجاوز الإجمالي.
 */
function discountFor(
    discount: { type: string; value: number; value_halalas: number },
    grossHalalas: number,
): number {
    if (grossHalalas <= 0) {
        return 0;
    }

    return Math.min(
        grossHalalas,
        discount.type === 'percentage'
            ? Math.trunc(
                  (grossHalalas * Math.min(100, Math.max(0, discount.value))) /
                      100,
              )
            : discount.value_halalas,
    );
}

/** هللات → ريالات بخانتين — نص العرض الوحيد في هذه الشاشة. */
function riyals(halalas: number): string {
    return (halalas / 100).toFixed(2);
}

/**
 * عدّاد بزرّي − و+ بدل حقل رقم.
 *
 * العدد هنا يُعدَّل بواحد أو اثنين في الغالب، ولوحة المفاتيح على الجوال
 * تحجب نصف النموذج لأجل ذلك. الحقل يبقى قابلاً للكتابة لمن يريد قفزة.
 *
 * الزرّان يُبلّغان **الفرق** لا القيمة الجديدة: نقرتان متلاحقتان قبل إعادة
 * الرسم كانتا تُحتسبان من نفس القيمة القديمة فتضيع إحداهما (12 ← 13 بدل 14).
 * الأب يطبّق الفرق على أحدث حالة، فتتراكم النقرات كما نُقرت.
 */
function Stepper({
    value,
    min,
    max,
    onChange,
    onStep,
    label,
}: {
    value: string;
    min: number;
    max?: number;
    onChange: (next: string) => void;
    onStep: (delta: number) => void;
    label: string;
}) {
    const current = Number(value || min);

    const button =
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[0.5px] border-ink/15 bg-surface text-ink transition-colors hover:border-ink/40 disabled:opacity-35';

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                className={button}
                onClick={() => onStep(-1)}
                disabled={current <= min}
                aria-label={`إنقاص ${label}`}
            >
                <Minus className="h-4 w-4" aria-hidden="true" />
            </button>

            <input
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                dir="ltr"
                aria-label={label}
                className={`${INPUT} w-20 text-center font-mono text-sm font-black`}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />

            <button
                type="button"
                className={button}
                onClick={() => onStep(1)}
                disabled={max !== undefined && current >= max}
                aria-label={`زيادة ${label}`}
            >
                <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}

export default function EmployeeEventCreate({
    communities,
    partners,
    subsidyDefault,
}: {
    communities: Community[];
    partners: Partner[];
    /** افتراضي دعم الشركة (H §12.2) — يسري متى تُرك حقل الدعم فارغاً. */
    subsidyDefault: { type: 'fixed' | 'percentage'; value: number };
}) {
    const form = useForm({
        community_id: '',
        partner_id: '',
        category_id: '',
        venue_pricing_id: '',
        venue_pricing_ids: [] as string[],
        venue_ids: [] as number[],
        date: '',
        time: '',
        capacity: '12',
        min_participants: '4',
        company_subsidy: '',
        discount_id: '',
        recurrence: 'none',
        notes: '',
        override_reason: '',
    });

    /**
     * Both lookups are keyed by the exact inputs they were fetched for, and
     * the render derives visibility from that key rather than an effect
     * clearing state. That is what the hooks rule is protecting against here:
     * a response for an older (date, time) pair arriving late and being shown
     * as if it described the current one.
     */
    const [suggestionCache, setSuggestionCache] = useState<{
        key: string;
        data: Suggestions;
    } | null>(null);
    const [pricingCache, setPricingCache] = useState<{
        key: string;
        data: Pricing[];
        options: PricingOption[];
    } | null>(null);
    const [discountCache, setDiscountCache] = useState<{
        key: string;
        data: Discount[];
    } | null>(null);

    const suggestionKey =
        form.data.community_id &&
        form.data.category_id &&
        form.data.date &&
        form.data.time
            ? [
                  form.data.community_id,
                  form.data.category_id,
                  form.data.date,
                  form.data.time,
                  form.data.capacity || '2',
              ].join('|')
            : '';

    // A17 — انطباق التخفيض موقوت بالتاريخ والساعة، ومرهون بالمزوّد
    // والمجتمع؛ فمفتاحه هذه الأربعة، ويسقط المعروض متى تغيّر أيّها.
    const discountKey =
        form.data.community_id &&
        form.data.partner_id &&
        form.data.date &&
        form.data.time
            ? [
                  form.data.community_id,
                  form.data.partner_id,
                  form.data.date,
                  form.data.time,
              ].join('|')
            : '';

    const pricingKey =
        form.data.venue_ids.length > 0 && form.data.date && form.data.time
            ? [
                  form.data.venue_ids.join(','),
                  form.data.date,
                  form.data.time,
              ].join('|')
            : '';

    const suggestions =
        suggestionKey !== '' && suggestionCache?.key === suggestionKey
            ? suggestionCache.data
            : null;
    const pricings =
        pricingKey !== '' && pricingCache?.key === pricingKey
            ? pricingCache.data
            : [];
    const pricingOptions =
        pricingKey !== '' && pricingCache?.key === pricingKey
            ? pricingCache.options
            : [];
    const discounts =
        discountKey !== '' && discountCache?.key === discountKey
            ? discountCache.data
            : [];

    const community = communities.find(
        (row) => String(row.id) === form.data.community_id,
    );
    const partner = partners.find(
        (row) => String(row.id) === form.data.partner_id,
    );
    const venues = (partner?.venues ?? []).filter(
        (venue) =>
            !form.data.category_id ||
            String(venue.category_id) === form.data.category_id,
    );

    const topPartnerId = suggestions?.candidates[0]?.partner_id ?? null;
    const overriding =
        topPartnerId !== null &&
        form.data.partner_id !== '' &&
        Number(form.data.partner_id) !== topPartnerId;

    const recurring = form.data.recurrence !== 'none';

    /*
     * A17 — التخفيض المختار يُشتق من المعروض لا من الحالة: تغيّر الموعد أو
     * المزوّد يُسقط قائمة التخفيضات، فيسقط معها الاختيار من تلقائه بدل أن
     * يبقى معرّف لا يقابله شيء ويُحتسب عليه ملخّص كاذب.
     */
    const selectedDiscount =
        discounts.find((row) => String(row.id) === form.data.discount_id) ??
        null;

    const chosenOption =
        pricingOptions.find((option) =>
            option.pricing_ids.includes(Number(form.data.venue_pricing_id)),
        ) ?? null;

    /*
     * ملخّص التكلفة — بنفس ترتيب الخادم وبنفس حسابه بالهللة
     * ({@see EventCreationService::costsFromTotal}): الإجمالي، ثم تخفيض
     * المزوّد، ثم دعم المحفظة، ثم القسمة على النصاب بلا تقريب لأعلى.
     *
     * رقمٌ يُعرض هنا ويُحتسب هناك بغيره أسوأ من ألا يُعرض.
     */
    const gross = chosenOption?.total_halalas ?? 0;
    const discountAmount =
        selectedDiscount === null ? 0 : discountFor(selectedDiscount, gross);
    const net = gross - discountAmount;
    /*
     * الدعم: ما كُتب في الحقل، وإلا **افتراضي إعدادات الشركة**.
     *
     * الحقل فارغاً لا يعني «لا دعم»: الخادم يقرأ الفراغ على أنه افتراضي
     * الشركة (نسبة 100 في الغالب = المحفظة تغطّي الحجز كاملاً)، فحساب
     * الملخّص بصفر كان يعرض على اللاعبين مبلغاً لن يُطالَبوا به.
     */
    const typedSubsidy = form.data.company_subsidy.trim();
    const subsidy =
        typedSubsidy === ''
            ? subsidyDefault.type === 'percentage'
                ? Math.trunc((net * Math.min(100, subsidyDefault.value)) / 100)
                : Math.min(net, subsidyDefault.value)
            : Math.min(
                  net,
                  Math.max(0, Math.round(Number(typedSubsidy) * 100)),
              );
    const onPlayers = net - subsidy;
    const fullyCovered = net > 0 && onPlayers === 0;
    const quorum = Math.max(1, Number(form.data.min_participants || 1));
    const perPlayer = Math.trunc(onPlayers / quorum);
    const walletShort = subsidy > (community?.wallet_balance_halalas ?? 0);

    useEffect(() => {
        if (suggestionKey === '') {
            return;
        }

        const [communityId, categoryId, date, time, capacity] =
            suggestionKey.split('|');
        const query = new URLSearchParams({
            community_id: communityId,
            category_id: categoryId,
            date,
            time,
            participants_count: capacity,
        });

        let cancelled = false;

        fetch(`/employee/provider-suggestions?${query}`, {
            headers: { Accept: 'application/json' },
        })
            .then((response) => (response.ok ? response.json() : null))
            .then((data: Suggestions | null) => {
                if (!cancelled && data !== null) {
                    setSuggestionCache({ key: suggestionKey, data });
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [suggestionKey]);

    useEffect(() => {
        if (pricingKey === '') {
            return;
        }

        const [venueIds, date, time] = pricingKey.split('|');
        let cancelled = false;

        fetch('/employee/create/pricings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN':
                    document.querySelector<HTMLMetaElement>(
                        'meta[name="csrf-token"]',
                    )?.content ?? '',
            },
            body: JSON.stringify({
                venue_ids: venueIds.split(',').map(Number),
                date,
                time,
            }),
        })
            .then((response) =>
                response.ok ? response.json() : { options: [], pricings: [] },
            )
            .then(
                (data: { options?: PricingOption[]; pricings?: Pricing[] }) => {
                    if (!cancelled) {
                        setPricingCache({
                            key: pricingKey,
                            data: data?.pricings ?? [],
                            options: data?.options ?? [],
                        });
                    }
                },
            )
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [pricingKey]);

    useEffect(() => {
        if (discountKey === '') {
            return;
        }

        const [communityId, partnerId, date, time] = discountKey.split('|');
        let cancelled = false;

        fetch('/employee/create/discounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN':
                    document.querySelector<HTMLMetaElement>(
                        'meta[name="csrf-token"]',
                    )?.content ?? '',
            },
            body: JSON.stringify({
                community_id: Number(communityId),
                partner_id: Number(partnerId),
                date,
                time,
            }),
        })
            .then((response) => (response.ok ? response.json() : null))
            .then((data: { discounts?: Discount[] } | null) => {
                if (!cancelled) {
                    setDiscountCache({
                        key: discountKey,
                        data: data?.discounts ?? [],
                    });
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [discountKey]);

    return (
        <EmployeeLayout>
            <Head title="فعالية جديدة" />

            <BackLink href="/employee/home" label="العودة إلى الرئيسية" />

            <PageHeader
                icon={CalendarPlus}
                title="فعالية جديدة"
                subtitle="اختر المجتمع والموعد — ثم المرفق من اقتراحات المنصة."
            />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/employee/create');
                }}
                className="space-y-6"
            >
                <FormSection title="المجتمع والموعد">
                    <Field
                        label="المجتمع"
                        error={form.errors.community_id}
                        required
                    >
                        <select
                            className={INPUT}
                            value={form.data.community_id}
                            onChange={(event) => {
                                const picked = communities.find(
                                    (row) =>
                                        String(row.id) === event.target.value,
                                );
                                form.setData(
                                    'community_id',
                                    event.target.value,
                                );
                                form.setData(
                                    'category_id',
                                    picked?.category_id
                                        ? String(picked.category_id)
                                        : '',
                                );
                                form.setData('partner_id', '');
                                form.setData('venue_ids', []);
                                form.setData('venue_pricing_id', '');
                            }}
                        >
                            <option value="">— اختر المجتمع —</option>
                            {communities.map((row) => (
                                <option key={row.id} value={row.id}>
                                    {row.name} ({row.members_count} عضواً)
                                </option>
                            ))}
                        </select>
                    </Field>

                    <FormGrid columns={2}>
                        <Field
                            label="التاريخ"
                            error={form.errors.date}
                            hint="من الغد فصاعداً."
                            required
                        >
                            <input
                                type="date"
                                dir="ltr"
                                className={INPUT}
                                value={form.data.date}
                                onChange={(event) =>
                                    form.setData('date', event.target.value)
                                }
                            />
                        </Field>

                        <Field label="الوقت" error={form.errors.time} required>
                            <TimeSelect
                                required
                                value={form.data.time}
                                onChange={(next) => form.setData('time', next)}
                            />
                        </Field>

                        <Field
                            label="عدد اللاعبين"
                            error={form.errors.capacity}
                            hint="السعة الكاملة — عليها يُقسَّم الحجز."
                            required
                        >
                            <Stepper
                                label="عدد اللاعبين"
                                min={2}
                                value={form.data.capacity}
                                onChange={(next) =>
                                    form.setData((data) =>
                                        clampSeats({ ...data, capacity: next }),
                                    )
                                }
                                onStep={(delta) =>
                                    form.setData((data) =>
                                        clampSeats({
                                            ...data,
                                            capacity: String(
                                                Math.max(
                                                    2,
                                                    Number(data.capacity || 2) +
                                                        delta,
                                                ),
                                            ),
                                        }),
                                    )
                                }
                            />
                        </Field>

                        <Field
                            label="النصاب"
                            error={form.errors.min_participants}
                            hint="أقل عدد تنعقد به — دونه تُلغى الفعالية تلقائياً."
                            required
                        >
                            <Stepper
                                label="النصاب"
                                min={2}
                                max={Math.max(2, Number(form.data.capacity))}
                                value={form.data.min_participants}
                                onChange={(next) =>
                                    form.setData((data) =>
                                        clampSeats({
                                            ...data,
                                            min_participants: next,
                                        }),
                                    )
                                }
                                onStep={(delta) =>
                                    form.setData((data) =>
                                        clampSeats({
                                            ...data,
                                            min_participants: String(
                                                Math.max(
                                                    2,
                                                    Number(
                                                        data.min_participants ||
                                                            2,
                                                    ) + delta,
                                                ),
                                            ),
                                        }),
                                    )
                                }
                            />
                        </Field>
                    </FormGrid>

                    {/* ── التكرار ── */}
                    <Field
                        label="التكرار"
                        error={form.errors.recurrence}
                        hint="التكرار يُنشئ قالباً يولّد فعالياته قبل 14 يوماً من كل موعد."
                    >
                        <div className="flex flex-wrap gap-2">
                            {(
                                [
                                    ['none', 'مرة واحدة'],
                                    ['weekly', 'أسبوعي'],
                                    ['monthly', 'شهري'],
                                ] as const
                            ).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={
                                        form.data.recurrence === value
                                    }
                                    onClick={() => {
                                        form.setData('recurrence', value);

                                        // التخفيض لا ينتقل إلى القالب — يُسقط
                                        // هنا كي لا يبقى معروضاً بلا أثر.
                                        if (value !== 'none') {
                                            form.setData('discount_id', '');
                                        }
                                    }}
                                    className={`rounded-full border-[0.5px] px-3.5 py-1.5 text-[11px] font-bold transition-colors ${
                                        form.data.recurrence === value
                                            ? 'border-ink bg-ink text-lime'
                                            : 'border-ink/15 bg-surface text-ink/70 hover:border-ink/35'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </Field>

                    {recurring && (
                        <Note tone="warning" title="هذا يُنشئ سلسلة، لا فعالية">
                            {form.data.recurrence === 'weekly'
                                ? 'يتكرر أسبوعياً في نفس يوم التاريخ المختار وساعته.'
                                : 'يتكرر شهرياً في نفس يوم الشهر وساعته.'}{' '}
                            تُولَّد كل فعالية قبل موعدها بـ14 يوماً، ويُدار
                            الإيقاف والتعديل من صفحة «القوالب المتكررة».
                        </Note>
                    )}

                    {community && (
                        <Note title="الفئة تتبع المجتمع">
                            فعاليات «{community.name}» في فئة «
                            {community.category?.name ?? '—'}» — وعليها تُبنى
                            قائمة المرافق.
                        </Note>
                    )}
                </FormSection>

                {/* ── اقتراحات المنصة ── */}
                {suggestions && (
                    <FormSection
                        title="المرافق المقترحة"
                        hint="مرتّبة حسب: المفضّلة أولاً، ثم السعر، ثم الموثوقية، ثم عدم التكرار، ثم القرب."
                    >
                        {suggestions.candidates.map((candidate, index) => (
                            <label
                                key={candidate.partner_id}
                                className={`flex cursor-pointer items-start gap-2.5 rounded-xl border-[0.5px] p-3 transition-colors ${
                                    String(candidate.partner_id) ===
                                    form.data.partner_id
                                        ? 'border-ink bg-lime/15'
                                        : 'border-ink/12 bg-page hover:border-ink/30'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="partner_id"
                                    checked={
                                        String(candidate.partner_id) ===
                                        form.data.partner_id
                                    }
                                    onChange={() => {
                                        form.setData(
                                            'partner_id',
                                            String(candidate.partner_id),
                                        );
                                        form.setData('venue_ids', []);
                                        form.setData('venue_pricing_id', '');
                                    }}
                                    className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                                />

                                <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-xs font-extrabold text-ink">
                                            {candidate.name}
                                        </span>
                                        {index === 0 && (
                                            <Badge tone="lime" icon={Sparkles}>
                                                الاقتراح الأول
                                            </Badge>
                                        )}
                                        {candidate.is_preferred && (
                                            <Badge tone="neutral">
                                                مفضّل #
                                                {candidate.preferred_position}
                                            </Badge>
                                        )}
                                        {candidate.consecutive_repeat && (
                                            <Badge tone="warning">
                                                تكرّر مرتين متتاليتين
                                            </Badge>
                                        )}
                                    </span>

                                    <span className="mt-0.5 block text-[11px] text-ink/55">
                                        {candidate.unit_name} · تقدير{' '}
                                        <span className="font-mono font-bold text-ink">
                                            {candidate.estimated_price}
                                        </span>{' '}
                                        ر.س
                                        {candidate.same_city &&
                                            ' · نفس المدينة'}
                                    </span>
                                </span>
                            </label>
                        ))}

                        <ListStates
                            count={suggestions.candidates.length}
                            empty={
                                suggestions.reason ??
                                'لا مرافق متاحة لهذا الموعد.'
                            }
                            emptyHint="جرّب موعداً آخر، أو راجع المرافق المستبعدة أدناه."
                        />

                        {overriding && (
                            <Field
                                label="سبب اختيار مرفق غير الاقتراح الأول"
                                error={form.errors.override_reason}
                                hint="إلزامي — وهذه الأسباب هي ما يُحسّن الاقتراح لاحقاً."
                                required
                            >
                                <textarea
                                    rows={2}
                                    className={INPUT}
                                    value={form.data.override_reason}
                                    onChange={(event) =>
                                        form.setData(
                                            'override_reason',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        )}

                        {suggestions.excluded.length > 0 && (
                            <div className="space-y-1 rounded-xl border-[0.5px] border-ink/12 bg-page p-3">
                                <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink/70">
                                    <TriangleAlert
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                    />
                                    مرافق مستبعدة ولماذا
                                </span>
                                {suggestions.excluded.slice(0, 6).map((row) => (
                                    <span
                                        key={row.partner_id}
                                        className="block text-[10px] text-ink/55"
                                    >
                                        {row.name} — {row.reason}
                                    </span>
                                ))}
                            </div>
                        )}
                    </FormSection>
                )}

                {/* ── الملاعب والتسعيرة ── */}
                {partner && (
                    <FormSection title="الملاعب والتسعيرة">
                        <Field
                            label="الملاعب"
                            error={form.errors.venue_ids}
                            required
                        >
                            <div className="flex flex-wrap gap-2">
                                {venues.map((venue) => {
                                    const on = form.data.venue_ids.includes(
                                        venue.id,
                                    );

                                    return (
                                        <button
                                            key={venue.id}
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    'venue_ids',
                                                    on
                                                        ? form.data.venue_ids.filter(
                                                              (value) =>
                                                                  value !==
                                                                  venue.id,
                                                          )
                                                        : [
                                                              ...form.data
                                                                  .venue_ids,
                                                              venue.id,
                                                          ],
                                                )
                                            }
                                            className={`rounded-full border-[0.5px] px-3 py-1.5 text-[11px] font-bold transition-colors ${
                                                on
                                                    ? 'border-ink bg-ink text-lime'
                                                    : 'border-ink/15 bg-surface text-ink/70 hover:border-ink/35'
                                            }`}
                                        >
                                            {venue.name}
                                        </button>
                                    );
                                })}
                                {venues.length === 0 && (
                                    <span className="text-xs text-ink/55">
                                        لا ملاعب مطابقة لهذه الفئة.
                                    </span>
                                )}
                            </div>
                        </Field>

                        <Field
                            label="مدة الحجز والتسعيرة"
                            error={form.errors.venue_pricing_id}
                            hint="السعر معروض لكل ملعب على حدة — وهو نفسه ما يُحتسب عليك."
                            required
                        >
                            {form.data.venue_ids.length === 0 ? (
                                <p className="text-[11px] text-ink/55">
                                    اختر الملاعب أولاً.
                                </p>
                            ) : pricingOptions.length === 0 ? (
                                <p className="text-[11px] text-ink/55">
                                    لا تسعيرة تغطي كل الملاعب المختارة في هذا
                                    الوقت — غيّر الوقت أو قلّل الملاعب.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {pricingOptions.map((option) => {
                                        const chosen =
                                            option.pricing_ids.includes(
                                                Number(
                                                    form.data.venue_pricing_id,
                                                ),
                                            );

                                        return (
                                            <button
                                                key={option.duration_minutes}
                                                type="button"
                                                aria-pressed={chosen}
                                                onClick={() => {
                                                    // يُرسَل الاثنان: الممثِّل للتوافق، والقائمة
                                                    // كاملةً كي يُحتسب ما عُرض بالضبط.
                                                    form.setData(
                                                        'venue_pricing_id',
                                                        String(
                                                            option
                                                                .pricing_ids[0],
                                                        ),
                                                    );
                                                    form.setData(
                                                        'venue_pricing_ids',
                                                        option.pricing_ids.map(
                                                            String,
                                                        ),
                                                    );
                                                }}
                                                className={`w-full cursor-pointer rounded-xl border-[0.5px] p-3 text-start transition-colors ${
                                                    chosen
                                                        ? 'border-ink bg-ink/[0.03]'
                                                        : 'border-ink/12 hover:border-ink/30'
                                                }`}
                                            >
                                                <span className="flex items-center justify-between gap-2">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="text-xs font-extrabold text-ink">
                                                            {
                                                                option.duration_minutes
                                                            }{' '}
                                                            دقيقة
                                                        </span>
                                                        <Badge
                                                            tone={
                                                                option.is_peak
                                                                    ? 'warning'
                                                                    : 'neutral'
                                                            }
                                                        >
                                                            {option.is_peak
                                                                ? 'ذروة'
                                                                : 'خارج الذروة'}
                                                        </Badge>
                                                        {option.label && (
                                                            <span className="text-[10px] text-ink/50">
                                                                {option.label}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="font-mono text-sm font-black text-ink">
                                                        {(
                                                            option.total_halalas /
                                                            100
                                                        ).toFixed(2)}{' '}
                                                        ر.س
                                                    </span>
                                                </span>

                                                {/* تفصيل لكل ملعب: ملعبان بسعرين لا يُخفيان خلف مجموع. */}
                                                <span className="mt-2 block space-y-0.5 border-t-[0.5px] border-ink/10 pt-2">
                                                    {option.venues.map(
                                                        (venue) => (
                                                            <span
                                                                key={
                                                                    venue.venue_id
                                                                }
                                                                className="flex items-center justify-between gap-2 text-[11px] text-ink/60"
                                                            >
                                                                <span className="truncate">
                                                                    {
                                                                        venue.venue_name
                                                                    }
                                                                </span>
                                                                <span className="font-mono">
                                                                    {(
                                                                        venue.price_halalas /
                                                                        100
                                                                    ).toFixed(
                                                                        2,
                                                                    )}{' '}
                                                                    ر.س
                                                                </span>
                                                            </span>
                                                        ),
                                                    )}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </Field>

                        {form.data.venue_ids.length > 0 &&
                            pricings.length === 0 && (
                                <Note
                                    tone="warning"
                                    title="لا تسعيرة تغطي هذا الوقت"
                                >
                                    للمرفق تسعيرات، لكن أياً منها لا يشمل يوم
                                    الفعالية أو ساعتها. جرّب وقتاً آخر أو ملعباً
                                    آخر.
                                </Note>
                            )}
                    </FormSection>
                )}

                <FormSection title="التمويل والملاحظات">
                    <Field
                        label="دعم الشركة (ريال)"
                        error={form.errors.company_subsidy}
                        hint="ما تتحمله محفظة المجتمع — الباقي يدفعه المشاركون."
                    >
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            dir="ltr"
                            className={INPUT}
                            value={form.data.company_subsidy}
                            onChange={(event) =>
                                form.setData(
                                    'company_subsidy',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>

                    {/* ── خصومات متاحة (A17) ── */}
                    {!recurring && discounts.length > 0 && (
                        <Field
                            label="خصومات متاحة"
                            error={form.errors.discount_id}
                            hint="يمنحها المزوّد لهذا المجتمع — تُخصم من الإجمالي قبل دعم المحفظة."
                        >
                            <div className="space-y-2">
                                {discounts.map((row) => {
                                    const on =
                                        String(row.id) ===
                                        form.data.discount_id;

                                    return (
                                        <button
                                            key={row.id}
                                            type="button"
                                            aria-pressed={on}
                                            onClick={() =>
                                                form.setData(
                                                    'discount_id',
                                                    on ? '' : String(row.id),
                                                )
                                            }
                                            className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border-[0.5px] p-3 text-start transition-colors ${
                                                on
                                                    ? 'border-ink bg-lime/15'
                                                    : 'border-ink/12 hover:border-ink/30'
                                            }`}
                                        >
                                            <span className="flex min-w-0 items-center gap-1.5">
                                                <TicketPercent
                                                    className="h-3.5 w-3.5 shrink-0 text-ink/60"
                                                    aria-hidden="true"
                                                />
                                                <span className="min-w-0">
                                                    <span className="block truncate text-xs font-extrabold text-ink">
                                                        {row.name ?? 'تخفيض'}
                                                    </span>

                                                    {/* شروط التخفيض معروضة قبل الاختيار — لا يُكتشف قيدٌ بعده. */}
                                                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-ink/50">
                                                        <span className="font-mono">
                                                            {row.type ===
                                                            'percentage'
                                                                ? `${row.value}٪`
                                                                : `${riyals(row.value_halalas)} ر.س`}
                                                        </span>
                                                        {row.start_time &&
                                                            row.end_time && (
                                                                <span
                                                                    className="font-mono"
                                                                    dir="ltr"
                                                                >
                                                                    {row.start_time.slice(
                                                                        0,
                                                                        5,
                                                                    )}{' '}
                                                                    —{' '}
                                                                    {row.end_time.slice(
                                                                        0,
                                                                        5,
                                                                    )}
                                                                </span>
                                                            )}
                                                        {row.expires_at && (
                                                            <span className="font-mono">
                                                                حتى{' '}
                                                                {row.expires_at.slice(
                                                                    0,
                                                                    10,
                                                                )}
                                                            </span>
                                                        )}
                                                    </span>
                                                </span>
                                            </span>

                                            {/* ما يعنيه التخفيض على هذا الحجز بالذات، لا قاعدته وحدها. */}
                                            <span className="shrink-0 text-end">
                                                <span className="block font-mono text-sm font-black text-ink">
                                                    {gross > 0
                                                        ? `${riyals(discountFor(row, gross))} ر.س`
                                                        : row.type ===
                                                            'percentage'
                                                          ? `${row.value}٪`
                                                          : `${riyals(row.value_halalas)} ر.س`}
                                                </span>
                                                {gross > 0 && (
                                                    <span className="block text-[10px] text-ink/45">
                                                        على هذا الحجز
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Field>
                    )}

                    {recurring && (
                        <Note title="التخفيضات لا تنتقل إلى السلسلة">
                            التخفيض اتفاق على حجز بعينه، والقالب يولّد مواعيد لم
                            تُسعَّر بعد — فيُطبَّق على الفعالية المفردة وحدها.
                        </Note>
                    )}

                    <Field label="ملاحظات" error={form.errors.notes}>
                        <textarea
                            rows={2}
                            className={INPUT}
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData('notes', event.target.value)
                            }
                        />
                    </Field>
                </FormSection>

                {/* ── ملخّص التكلفة ── */}
                {gross > 0 && (
                    <FormSection
                        title="ملخّص التكلفة"
                        hint="بنفس ترتيب حساب الخادم — هذا ما سيُطالَب به فعلاً."
                    >
                        <div className="space-y-2.5 rounded-2xl border-[0.5px] border-ink/12 bg-page p-4">
                            {community && (
                                <div className="flex items-center justify-between gap-2 border-b-[0.5px] border-ink/10 pb-2.5">
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink/70">
                                        <Wallet
                                            className="h-3.5 w-3.5 shrink-0"
                                            aria-hidden="true"
                                        />
                                        رصيد محفظة المجتمع
                                    </span>
                                    <span
                                        className={`font-mono text-xs font-black ${walletShort ? 'text-danger' : 'text-ink'}`}
                                    >
                                        {riyals(
                                            community.wallet_balance_halalas,
                                        )}{' '}
                                        ر.س
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-ink/70">
                                    إجمالي الحجز
                                </span>
                                <span className="font-mono text-xs font-black text-ink">
                                    {riyals(gross)} ر.س
                                </span>
                            </div>

                            {/* المرافق سطراً سطراً — المجموع لا يُخفي فرق الأسعار. */}
                            {chosenOption?.venues.map((venue) => (
                                <div
                                    key={venue.venue_id}
                                    className="flex items-center justify-between gap-2 ps-3 text-[10px] text-ink/50"
                                >
                                    <span className="truncate">
                                        {venue.venue_name}
                                    </span>
                                    <span className="font-mono">
                                        {riyals(venue.price_halalas)}
                                    </span>
                                </div>
                            ))}

                            {selectedDiscount !== null && (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-bold text-ink/70">
                                        خصم الشريك
                                    </span>
                                    <span className="font-mono text-xs font-black text-success">
                                        − {riyals(discountAmount)} ر.س
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-ink/70">
                                    خصم من المحفظة
                                    {typedSubsidy === '' && (
                                        <span className="ms-1 font-normal text-ink/45">
                                            (افتراضي الشركة
                                            {subsidyDefault.type ===
                                            'percentage'
                                                ? ` ${subsidyDefault.value}٪`
                                                : ''}
                                            )
                                        </span>
                                    )}
                                </span>
                                <span className="font-mono text-xs font-black text-success">
                                    − {riyals(subsidy)} ر.س
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 border-t-[0.5px] border-ink/10 pt-2.5">
                                <span className="text-[11px] font-extrabold text-ink">
                                    المتبقي على اللاعبين
                                </span>
                                <span className="font-mono text-sm font-black text-ink">
                                    {riyals(onPlayers)} ر.س
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 rounded-xl bg-lime/20 px-3 py-2">
                                <span className="text-[11px] font-extrabold text-ink">
                                    حصة كل لاعب
                                </span>
                                <span className="font-mono text-sm font-black text-ink">
                                    {riyals(perPlayer)} ر.س
                                </span>
                            </div>

                            {fullyCovered ? (
                                <p className="rounded-xl bg-success-tint px-3 py-2 text-center text-[11px] font-extrabold text-success">
                                    مغطى بالكامل من رصيد المجتمع
                                </p>
                            ) : (
                                <p className="text-[10px] leading-relaxed text-ink/50">
                                    الحصة محسوبة على النصاب ({quorum}) — وهي
                                    السقف الملزم. اكتمال العدد يخفضها، ولا
                                    يرفعها شيء.
                                </p>
                            )}
                        </div>

                        {walletShort && (
                            <Note
                                tone="warning"
                                title="الدعم يتجاوز رصيد المحفظة"
                            >
                                رصيد «{community?.name}» لا يغطي الدعم المطلوب.
                                الحجز يُحجَز عند إغلاق التسجيل، فإن بقي الرصيد
                                ناقصاً حينها تعذّر التمويل — اشحن المحفظة أو
                                أنقص الدعم.
                            </Note>
                        )}
                    </FormSection>
                )}

                <FormActions cancelHref="/employee/home">
                    <Button
                        type="submit"
                        icon={recurring ? Repeat : undefined}
                        disabled={
                            form.processing ||
                            !form.data.community_id ||
                            !form.data.partner_id ||
                            !form.data.venue_pricing_id ||
                            form.data.venue_ids.length === 0 ||
                            (overriding && !form.data.override_reason.trim())
                        }
                    >
                        {recurring ? 'إنشاء السلسلة' : 'إنشاء الفعالية'}
                    </Button>
                </FormActions>
            </form>
        </EmployeeLayout>
    );
}
