import { Head, useForm } from '@inertiajs/react';
import { CalendarPlus, Sparkles, TriangleAlert } from 'lucide-react';
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

type Suggestions = {
    candidates: Candidate[];
    excluded: { partner_id: number; name: string; reason: string }[];
    reason: string | null;
};

export default function EmployeeEventCreate({
    communities,
    partners,
}: {
    communities: Community[];
    partners: Partner[];
}) {
    const form = useForm({
        community_id: '',
        partner_id: '',
        category_id: '',
        venue_pricing_id: '',
        venue_ids: [] as number[],
        date: '',
        time: '',
        capacity: '12',
        min_participants: '4',
        company_subsidy: '',
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
            .then((response) => (response.ok ? response.json() : []))
            .then((data: Pricing[]) => {
                if (!cancelled) {
                    setPricingCache({ key: pricingKey, data: data ?? [] });
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [pricingKey]);

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
                            <input
                                type="time"
                                dir="ltr"
                                className={INPUT}
                                value={form.data.time}
                                onChange={(event) =>
                                    form.setData('time', event.target.value)
                                }
                            />
                        </Field>

                        <Field
                            label="السعة"
                            error={form.errors.capacity}
                            required
                        >
                            <input
                                type="number"
                                min="2"
                                dir="ltr"
                                className={INPUT}
                                value={form.data.capacity}
                                onChange={(event) =>
                                    form.setData('capacity', event.target.value)
                                }
                            />
                        </Field>

                        <Field
                            label="النصاب"
                            error={form.errors.min_participants}
                            hint="أقل عدد تنعقد به — دونه تُلغى الفعالية تلقائياً."
                            required
                        >
                            <input
                                type="number"
                                min="2"
                                dir="ltr"
                                className={INPUT}
                                value={form.data.min_participants}
                                onChange={(event) =>
                                    form.setData(
                                        'min_participants',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    </FormGrid>

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
                            label="التسعيرة"
                            error={form.errors.venue_pricing_id}
                            hint="التسعيرات المعروضة هي المطابقة ليوم الفعالية ووقتها."
                            required
                        >
                            <select
                                className={INPUT}
                                value={form.data.venue_pricing_id}
                                onChange={(event) =>
                                    form.setData(
                                        'venue_pricing_id',
                                        event.target.value,
                                    )
                                }
                                disabled={pricings.length === 0}
                            >
                                <option value="">
                                    {form.data.venue_ids.length === 0
                                        ? 'اختر الملاعب أولاً'
                                        : pricings.length === 0
                                          ? 'لا تسعيرة مطابقة لهذا الوقت'
                                          : '— اختر التسعيرة —'}
                                </option>
                                {pricings.map((pricing) => (
                                    <option key={pricing.id} value={pricing.id}>
                                        {pricing.duration_minutes} دقيقة —{' '}
                                        {pricing.price} ر.س
                                        {pricing.is_peak ? ' (ذروة)' : ''}
                                        {pricing.label
                                            ? ` · ${pricing.label}`
                                            : ''}
                                    </option>
                                ))}
                            </select>
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

                <FormActions cancelHref="/employee/home">
                    <Button
                        type="submit"
                        disabled={
                            form.processing ||
                            !form.data.community_id ||
                            !form.data.partner_id ||
                            !form.data.venue_pricing_id ||
                            form.data.venue_ids.length === 0 ||
                            (overriding && !form.data.override_reason.trim())
                        }
                    >
                        إنشاء الفعالية
                    </Button>
                </FormActions>
            </form>
        </EmployeeLayout>
    );
}
