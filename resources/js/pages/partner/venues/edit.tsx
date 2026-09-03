import { Head, router, useForm } from '@inertiajs/react';
import { MapPinned, Plus, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { BackLink, ListStates } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    INPUT,
    Note,
    PageHeader,
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';
import { VENUE_STATUS } from '@/pages/partner/venues/index';

/**
 * H §17 — تعديل الملعب وتسعيراته.
 *
 * Existing pricings are managed one at a time against their own endpoints
 * rather than resubmitted as a block: a price row can be booked against, so
 * disabling one and deleting one are different acts with different
 * consequences — the first stops new bookings, the second erases the rate.
 */
export type PricingDraft = {
    duration_minutes: string;
    price: string;
    is_peak: boolean;
    label: string;
    start_time: string;
    end_time: string;
    days: number[];
};

export const BLANK_PRICING: PricingDraft = {
    duration_minutes: '60',
    price: '',
    is_peak: false,
    label: '',
    start_time: '',
    end_time: '',
    days: [],
};

const DAYS = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
];

type Pricing = {
    id: number;
    duration_minutes: number;
    price: string | number;
    is_peak: boolean;
    label: string | null;
    start_time: string | null;
    end_time: string | null;
    days: number[] | null;
    status?: string;
};

export default function PartnerVenueEdit({
    venue,
    categories,
}: {
    venue: {
        id: number;
        name: string;
        status: string;
        category_id: number;
        category?: {
            id: number;
            name: string;
            parent?: { id: number; name: string } | null;
        } | null;
        pricings?: Pricing[];
    };
    categories: {
        id: number;
        name: string;
        children?: { id: number; name: string }[];
    }[];
}) {
    const form = useForm({
        name: venue.name,
        category_id: String(venue.category_id),
        status: venue.status,
    });

    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState<Pricing | null>(null);
    const addForm = useForm<PricingDraft>({ ...BLANK_PRICING });

    const pricings = venue.pricings ?? [];

    return (
        <PartnerLayout>
            <Head title={`تعديل ${venue.name}`} />

            <BackLink href="/partner/venues" label="العودة إلى الملاعب" />

            <PageHeader
                icon={MapPinned}
                title={venue.name}
                subtitle={venue.category?.name ?? '—'}
                actions={
                    <Badge tone={VENUE_STATUS[venue.status]?.tone ?? 'neutral'}>
                        {VENUE_STATUS[venue.status]?.label ?? venue.status}
                    </Badge>
                }
            />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.put(`/partner/venues/${venue.id}`, {
                        preserveScroll: true,
                    });
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات الملعب">
                    <FormGrid columns={2}>
                        <Field
                            label="اسم الملعب"
                            error={form.errors.name}
                            required
                        >
                            <input
                                className={INPUT}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                        </Field>

                        <Field
                            label="الفئة"
                            error={form.errors.category_id}
                            required
                        >
                            <select
                                className={INPUT}
                                value={form.data.category_id}
                                onChange={(event) =>
                                    form.setData(
                                        'category_id',
                                        event.target.value,
                                    )
                                }
                            >
                                {categories.map((parent) => (
                                    <optgroup
                                        key={parent.id}
                                        label={parent.name}
                                    >
                                        <option value={parent.id}>
                                            {parent.name}
                                        </option>
                                        {(parent.children ?? []).map(
                                            (child) => (
                                                <option
                                                    key={child.id}
                                                    value={child.id}
                                                >
                                                    {child.name}
                                                </option>
                                            ),
                                        )}
                                    </optgroup>
                                ))}
                            </select>
                        </Field>

                        <Field
                            label="الحالة"
                            error={form.errors.status}
                            hint="«تحت الصيانة» تخفيه من الحجز دون حذف تسعيراته."
                        >
                            <select
                                className={INPUT}
                                value={form.data.status}
                                onChange={(event) =>
                                    form.setData('status', event.target.value)
                                }
                            >
                                <option value="active">متاح</option>
                                <option value="maintenance">تحت الصيانة</option>
                                <option value="closed">مغلق</option>
                            </select>
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormActions cancelHref="/partner/venues">
                    <Button type="submit" disabled={form.processing}>
                        حفظ التعديلات
                    </Button>
                </FormActions>
            </form>

            {/* ── التسعيرات ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-extrabold text-ink">
                        التسعيرات
                    </h2>
                    <Button
                        type="button"
                        tone="soft"
                        icon={Plus}
                        onClick={() => setAdding(true)}
                    >
                        تسعيرة جديدة
                    </Button>
                </div>

                <TableShell>
                    <Thead>
                        <Th>المدة</Th>
                        <Th>السعر</Th>
                        <Th>الوسم</Th>
                        <Th>النافذة</Th>
                        <Th>الأيام</Th>
                        <Th className="text-center">الإجراءات</Th>
                    </Thead>
                    <Tbody>
                        {pricings.map((pricing) => (
                            <Tr key={pricing.id}>
                                <Td className="font-mono font-bold text-ink">
                                    {pricing.duration_minutes} د
                                </Td>
                                <Td className="font-mono font-black text-ink">
                                    {pricing.price}
                                </Td>
                                <Td>
                                    {pricing.is_peak && (
                                        <Badge tone="warning">ذروة</Badge>
                                    )}
                                    {pricing.label && (
                                        <span className="block text-[11px] text-ink/70">
                                            {pricing.label}
                                        </span>
                                    )}
                                    {!pricing.is_peak && !pricing.label && (
                                        <span className="text-ink/40">—</span>
                                    )}
                                </Td>
                                <Td
                                    className="font-mono text-[11px] text-ink/70"
                                    dir="ltr"
                                >
                                    {pricing.start_time && pricing.end_time
                                        ? `${pricing.start_time.slice(0, 5)}–${pricing.end_time.slice(0, 5)}`
                                        : '—'}
                                </Td>
                                <Td className="text-[11px] text-ink/70">
                                    {pricing.days && pricing.days.length > 0
                                        ? pricing.days
                                              .map((day) =>
                                                  DAYS[day]?.slice(0, 3),
                                              )
                                              .join('، ')
                                        : 'كل الأيام'}
                                </Td>
                                <Td className="text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.post(
                                                    `/partner/venues/${venue.id}/pricings/${pricing.id}/toggle`,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                            aria-label="تعطيل/تفعيل التسعيرة"
                                            className="rounded-lg bg-ink/5 p-1.5 text-ink transition-colors hover:bg-ink/10"
                                        >
                                            <Power
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleting(pricing)}
                                            aria-label="حذف التسعيرة"
                                            className="rounded-lg bg-danger/8 p-1.5 text-danger transition-colors hover:bg-danger/15"
                                        >
                                            <Trash2
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                        <ListStates
                            count={pricings.length}
                            colSpan={6}
                            empty="لا تسعيرات — هذا الملعب لا يُحجز."
                            emptyHint="أضف تسعيرة واحدة على الأقل ليصبح قابلاً للتسعير في الطلبات."
                        />
                    </Tbody>
                </TableShell>

                {pricings.length === 0 && (
                    <Note tone="warning" title="الملعب غير قابل للحجز الآن">
                        بلا تسعيرة لا يمكن تسعير أي طلب عليه، فلا يُعرض على
                        الشركات.
                    </Note>
                )}
            </Card>

            {adding && (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        addForm.post(`/partner/venues/${venue.id}/pricings`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                addForm.reset();
                                setAdding(false);
                            },
                        });
                    }}
                    className="space-y-6"
                >
                    <FormSection
                        title="تسعيرة جديدة"
                        hint="السعر شامل ضريبة القيمة المضافة 15٪."
                    >
                        <PricingRows
                            rows={[addForm.data]}
                            errors={addForm.errors as Record<string, string>}
                            onChange={(rows) => {
                                const row = rows[0];
                                (
                                    Object.keys(row) as (keyof PricingDraft)[]
                                ).forEach((key) => {
                                    addForm.setData(key, row[key] as never);
                                });
                            }}
                        />
                    </FormSection>

                    <FormActions>
                        <Button
                            type="submit"
                            disabled={addForm.processing || !addForm.data.price}
                        >
                            إضافة التسعيرة
                        </Button>
                        <Button
                            type="button"
                            tone="soft"
                            onClick={() => setAdding(false)}
                        >
                            إلغاء
                        </Button>
                    </FormActions>
                </form>
            )}

            <ConfirmModal
                open={deleting !== null}
                tone="danger"
                title="حذف التسعيرة"
                message="لن يُسعَّر أي طلب جديد بهذه التسعيرة. الحجوزات التي سُعِّرت بها سابقاً تحتفظ بسعرها المتفق عليه."
                details={
                    deleting && (
                        <>
                            <ConfirmRow
                                label="المدة"
                                value={`${deleting.duration_minutes} دقيقة`}
                                strong
                            />
                            <ConfirmRow
                                label="السعر"
                                value={`${deleting.price} ر.س`}
                                strong
                            />
                        </>
                    )
                }
                confirmLabel="نعم، احذف التسعيرة"
                onConfirm={() => {
                    router.delete(
                        `/partner/venues/${venue.id}/pricings/${deleting?.id}`,
                        { preserveScroll: true },
                    );
                    setDeleting(null);
                }}
                onCancel={() => setDeleting(null)}
            />
        </PartnerLayout>
    );
}

/** صفوف التسعيرة — مشتركة بين الإنشاء والتعديل. */
export function PricingRows({
    rows,
    errors,
    onChange,
}: {
    rows: PricingDraft[];
    errors: Record<string, string>;
    onChange: (rows: PricingDraft[]) => void;
}) {
    const update = (index: number, patch: Partial<PricingDraft>) => {
        onChange(
            rows.map((row, position) =>
                position === index ? { ...row, ...patch } : row,
            ),
        );
    };

    return (
        <div className="space-y-4">
            {rows.map((row, index) => (
                <div
                    key={index}
                    className="space-y-3 rounded-2xl border-[0.5px] border-ink/12 bg-page p-3.5"
                >
                    <FormGrid>
                        <Field
                            label="المدة"
                            error={errors[`pricings.${index}.duration_minutes`]}
                            required
                        >
                            <select
                                className={INPUT}
                                value={row.duration_minutes}
                                onChange={(event) =>
                                    update(index, {
                                        duration_minutes: event.target.value,
                                    })
                                }
                            >
                                <option value="60">60 دقيقة</option>
                                <option value="90">90 دقيقة</option>
                                <option value="120">120 دقيقة</option>
                            </select>
                        </Field>

                        <Field
                            label="السعر (شامل الضريبة)"
                            error={errors[`pricings.${index}.price`]}
                            required
                        >
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                dir="ltr"
                                className={INPUT}
                                value={row.price}
                                onChange={(event) =>
                                    update(index, { price: event.target.value })
                                }
                            />
                        </Field>

                        <Field
                            label="الوسم"
                            error={errors[`pricings.${index}.label`]}
                            hint="«سعر الصباح» مثلاً."
                        >
                            <input
                                className={INPUT}
                                value={row.label}
                                onChange={(event) =>
                                    update(index, { label: event.target.value })
                                }
                            />
                        </Field>

                        <Field
                            label="من الساعة"
                            error={errors[`pricings.${index}.start_time`]}
                        >
                            <input
                                type="time"
                                dir="ltr"
                                className={INPUT}
                                value={row.start_time}
                                onChange={(event) =>
                                    update(index, {
                                        start_time: event.target.value,
                                    })
                                }
                            />
                        </Field>

                        <Field
                            label="إلى الساعة"
                            error={errors[`pricings.${index}.end_time`]}
                        >
                            <input
                                type="time"
                                dir="ltr"
                                className={INPUT}
                                value={row.end_time}
                                onChange={(event) =>
                                    update(index, {
                                        end_time: event.target.value,
                                    })
                                }
                            />
                        </Field>
                    </FormGrid>

                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-xs text-ink/80">
                            <input
                                type="checkbox"
                                checked={row.is_peak}
                                onChange={(event) =>
                                    update(index, {
                                        is_peak: event.target.checked,
                                    })
                                }
                                className="h-4 w-4 rounded border-ink/25 accent-ink"
                            />
                            سعر ذروة
                        </label>

                        <div className="flex flex-wrap items-center gap-1">
                            <span className="me-1 text-[11px] text-ink/55">
                                الأيام:
                            </span>
                            {DAYS.map((day, dayIndex) => {
                                const on = row.days.includes(dayIndex);

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() =>
                                            update(index, {
                                                days: on
                                                    ? row.days.filter(
                                                          (value) =>
                                                              value !==
                                                              dayIndex,
                                                      )
                                                    : [...row.days, dayIndex],
                                            })
                                        }
                                        className={`rounded-full border-[0.5px] px-2 py-1 text-[10px] font-bold transition-colors ${
                                            on
                                                ? 'border-ink bg-ink text-lime'
                                                : 'border-ink/15 bg-surface text-ink/60 hover:border-ink/35'
                                        }`}
                                    >
                                        {day.slice(0, 3)}
                                    </button>
                                );
                            })}
                            {row.days.length === 0 && (
                                <span className="ms-1 text-[10px] text-ink/45">
                                    كل الأيام
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
