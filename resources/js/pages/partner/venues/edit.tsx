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
import { BLANK_PRICING, PricingRows  } from '@/components/venue-pricing-rows';
import type {PricingDraft} from '@/components/venue-pricing-rows';
import PartnerLayout from '@/layouts/partner-layout';
import { venueStatus } from '@/lib/status';

/**
 * H §17 — تعديل الملعب وتسعيراته.
 *
 * Existing pricings are managed one at a time against their own endpoints
 * rather than resubmitted as a block: a price row can be booked against, so
 * disabling one and deleting one are different acts with different
 * consequences — the first stops new bookings, the second erases the rate.
 */


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
                    <Badge tone={venueStatus(venue.status).tone}>
                        {venueStatus(venue.status).label}
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
