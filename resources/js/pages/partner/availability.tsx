import { Head, router, useForm } from '@inertiajs/react';
import {
    CalendarRange,
    ChevronLeft,
    ChevronRight,
    Lock,
    Plus,
    Trash2,
    TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { ListStates } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    IconButton,
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
import TimeSelect from '@/components/time-select';
import PartnerLayout from '@/layouts/partner-layout';

/**
 * G/دليل المزوّد §2 — تقويم التوفر.
 *
 * The grid shows *free* time, not just busy time. A calendar that only marks
 * bookings leaves the provider to infer availability from blank space, which
 * is exactly the inference that produces double-booking — so every working
 * band is drawn, and each one says which of four things it is: bookable,
 * held by a pending request, booked by the platform, or blocked by the
 * provider themselves.
 *
 * Only the last is theirs to delete. A platform booking came from accepting a
 * request and cannot be tidied away here.
 */
type Unit = {
    id: number;
    name: string;
    provider_branch_id: number;
    default_duration_minutes: number | null;
    branch?: {
        id: number;
        name: string;
        working_hours: Record<string, { from: string; to: string }[]> | null;
    } | null;
};

type Slot = {
    id: number;
    activity_unit_id: number;
    date: string;
    start_time: string;
    end_time: string;
    booking_type: string;
    event_id: number | null;
    note: string | null;
};

type PendingRequest = {
    id: number;
    activity_unit_id: number;
    requested_date: string;
    start_time: string;
    duration_minutes: number;
};

const DAY_NAMES = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
];

const toMinutes = (time: string) => {
    const [h, m] = time.slice(0, 5).split(':').map(Number);

    return h * 60 + m;
};

const toClock = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/**
 * ساعة معروضة على ملعب — «متى يفتح هذا الملعب»، لا «ما المحجوز فيه».
 *
 * الحجز لا يقع خارجها، ويوم بلا ساعات معروضة يعني «بلا قيد» لا «مغلق».
 */
type OfferedHour = {
    id: number;
    venue_id: number;
    date: string | null;
    start_time: string;
    end_time: string;
    status: string;
};

export default function PartnerAvailability({
    units,
    slots,
    venues,
    offeredHours,
    pendingRequests,
    week_start: weekStart,
    week_end: weekEnd,
}: {
    units: Unit[];
    slots: Slot[];
    venues: { id: number; name: string }[];
    offeredHours: OfferedHour[];
    pendingRequests: PendingRequest[];
    week_start: string;
    week_end: string;
}) {
    const [selectedId, setSelectedId] = useState<number | null>(
        units[0]?.id ?? null,
    );
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState<Slot | null>(null);

    const form = useForm({
        activity_unit_id: '',
        date: '',
        start_time: '',
        end_time: '',
        note: '',
    });
    const hoursForm = useForm({
        // يبدأ على أول ملعب لا فارغاً: `setData` غير متزامنة، فضبط الملعب
        // لحظة الإرسال كان يبعث القيمة السابقة — أي فارغاً — فيُرفض الطلب.
        venue_id: String(venues[0]?.id ?? ''),
        date: '',
        start_time: '',
        end_time: '',
        status: 'available',
    });
    const [venueId, setVenueId] = useState<number | null>(
        venues[0]?.id ?? null,
    );
    const [removingHour, setRemovingHour] = useState<OfferedHour | null>(null);
    const unit = units.find((row) => row.id === selectedId) ?? units[0] ?? null;

    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(`${weekStart}T00:00:00`);
        date.setDate(date.getDate() + index);
        const key = date.toISOString().slice(0, 10);

        return { key, weekday: date.getDay(), name: DAY_NAMES[date.getDay()] };
    });

    // The bands come from the branch's working hours, sliced by the unit's own
    // default duration — the same grid the booking flow offers a company.
    const duration = unit?.default_duration_minutes ?? 90;
    const bands: [number, number][] = [];

    if (unit) {
        const hours = unit.branch?.working_hours ?? null;
        const windows = hours
            ? Object.values(hours).flat().filter(Boolean)
            : [{ from: '16:00', to: '23:30' }];

        const earliest = Math.min(...windows.map((w) => toMinutes(w.from)));
        const latest = Math.max(...windows.map((w) => toMinutes(w.to)));

        for (
            let start = earliest;
            start + duration <= latest;
            start += duration
        ) {
            bands.push([start, start + duration]);
        }
    }

    const shiftWeek = (deltaDays: number) => {
        const date = new Date(`${weekStart}T00:00:00`);
        date.setDate(date.getDate() + deltaDays);
        router.get(
            '/partner/availability',
            { date: date.toISOString().slice(0, 10) },
            { preserveState: false },
        );
    };

    /** What occupies this band on this day, if anything. */
    const occupancy = (dayKey: string, from: number, to: number) => {
        const slot = slots.find(
            (row) =>
                row.activity_unit_id === unit?.id &&
                row.date.slice(0, 10) === dayKey &&
                toMinutes(row.start_time) < to &&
                toMinutes(row.end_time) > from,
        );

        if (slot) {
            return {
                kind:
                    slot.booking_type === 'external'
                        ? ('external' as const)
                        : ('platform' as const),
                slot,
            };
        }

        const request = pendingRequests.find(
            (row) =>
                row.activity_unit_id === unit?.id &&
                row.requested_date.slice(0, 10) === dayKey &&
                toMinutes(row.start_time) < to &&
                toMinutes(row.start_time) + row.duration_minutes > from,
        );

        return request
            ? { kind: 'pending' as const, request }
            : { kind: 'free' as const };
    };

    const externalCount = slots.filter(
        (slot) => slot.booking_type === 'external',
    ).length;

    return (
        <PartnerLayout>
            <Head title="تقويم التوفر" />

            <PageHeader
                icon={CalendarRange}
                title="تقويم التوفر"
                badge="مصدر الحقيقة الوحيد"
                subtitle="تقويم المنصة هو المرجع — ليس نظامك الداخلي ولا دفترك. أي وقت يظهر متاحاً هنا يمكن أن يُحجز."
                actions={
                    <Button
                        type="button"
                        icon={Plus}
                        disabled={units.length === 0}
                        onClick={() => {
                            form.reset();
                            form.setData(
                                'activity_unit_id',
                                String(unit?.id ?? ''),
                            );
                            setAdding(true);
                        }}
                    >
                        إضافة حجز خارجي
                    </Button>
                }
            />

            <Note tone="danger" title="تنبيه مسؤولية التعارض">
                عند تعارض ناتج عن عدم تحديثك للتوفر: تتحمل أنت الإلغاء، وينخفض
                مؤشر موثوقيتك، وتُطبَّق سياسة إلغاء المزوّد المنصوص عليها في
                عقدك. التكامل الآلي مع الأنظمة الداخلية للمزوّدين غير متاح في
                الإصدار الأول.
            </Note>

            {units.length === 0 ? (
                <Card padding="p-8" className="text-center">
                    <p className="mb-1 text-sm font-extrabold text-ink">
                        لا وحدات نشاط بعد.
                    </p>
                    <p className="text-xs text-ink/55">
                        أضف فرعاً ووحدة نشاط أولاً — التقويم يُبنى على الوحدات
                        لا على المرفق ككل.
                    </p>
                </Card>
            ) : (
                <>
                    {/* ── منتقي الوحدة ── */}
                    <Card padding="p-3">
                        <div className="flex flex-wrap gap-2">
                            {units.map((row) => (
                                <button
                                    key={row.id}
                                    type="button"
                                    onClick={() => setSelectedId(row.id)}
                                    className={`rounded-xl border-[0.5px] px-3 py-2 text-start transition-colors ${
                                        row.id === unit?.id
                                            ? 'border-ink bg-ink text-lime'
                                            : 'border-ink/15 bg-surface text-ink/75 hover:border-ink/35'
                                    }`}
                                >
                                    <span className="block text-[11px] font-extrabold">
                                        {row.name}
                                    </span>
                                    <span
                                        className={`block text-[9px] ${row.id === unit?.id ? 'text-lime/70' : 'text-ink/45'}`}
                                    >
                                        {row.branch?.name ?? '—'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* ── الأسبوع ── */}
                    <Card
                        padding="p-3"
                        className="flex items-center justify-between gap-3"
                    >
                        <Button
                            type="button"
                            tone="soft"
                            icon={ChevronRight}
                            onClick={() => shiftWeek(-7)}
                        >
                            الأسبوع السابق
                        </Button>
                        <span
                            className="font-mono text-xs font-bold text-ink"
                            dir="ltr"
                        >
                            {weekStart} — {weekEnd}
                        </span>
                        <Button
                            type="button"
                            tone="soft"
                            icon={ChevronLeft}
                            onClick={() => shiftWeek(7)}
                        >
                            الأسبوع التالي
                        </Button>
                    </Card>

                    {/* ── الشبكة ── */}
                    <Card padding="p-4" className="space-y-3">
                        <h2 className="text-sm font-extrabold text-ink">
                            جدول التوفر: {unit?.name}
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] border-separate border-spacing-1">
                                <thead>
                                    <tr>
                                        <th className="w-24 pb-1 text-[10px] font-bold text-ink/50">
                                            الفترة
                                        </th>
                                        {days.map((day) => (
                                            <th key={day.key} className="pb-1">
                                                <span className="block text-[10px] font-extrabold text-ink">
                                                    {day.name}
                                                </span>
                                                <span className="block font-mono text-[9px] text-ink/45">
                                                    {day.key.slice(5)}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bands.map(([from, to]) => (
                                        <tr key={from}>
                                            <th
                                                className="pe-2 text-start font-mono text-[10px] text-ink/60"
                                                dir="ltr"
                                            >
                                                {toClock(from)} – {toClock(to)}
                                            </th>
                                            {days.map((day) => {
                                                const cell = occupancy(
                                                    day.key,
                                                    from,
                                                    to,
                                                );

                                                return (
                                                    <td
                                                        key={day.key}
                                                        className="p-0"
                                                    >
                                                        <Cell
                                                            cell={cell}
                                                            onDelete={
                                                                setDeleting
                                                            }
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {bands.length === 0 && (
                            <p className="py-4 text-center text-xs text-ink/55">
                                لم تُضبط ساعات عمل لفرع هذه الوحدة — اضبطها من
                                «الفروع والوحدات» ليُبنى الجدول.
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 border-t-[0.5px] border-ink/10 pt-2">
                            <Legend
                                className="border-ink/15 bg-page"
                                label="متاح للحجز التلقائي"
                            />
                            <Legend
                                className="border-warning/30 bg-warning-tint"
                                label="طلب معلّق بانتظار ردّك"
                            />
                            <Legend
                                className="border-ink bg-ink"
                                label="محجوز من المنصة — لا يُحذف من هنا"
                                dark
                            />
                            <Legend
                                className="border-info/30 bg-info-tint"
                                label="حجز خارجي سجّلته أنت"
                            />
                            <Badge tone="neutral">
                                {externalCount} حجزاً خارجياً هذا الأسبوع
                            </Badge>
                        </div>
                    </Card>
                </>
            )}

            {adding && (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post('/partner/availability/external', {
                            preserveScroll: true,
                            onSuccess: () => {
                                form.reset();
                                setAdding(false);
                            },
                        });
                    }}
                    className="space-y-6"
                >
                    <FormSection
                        title="إضافة حجز خارجي (تعطيل موعد)"
                        hint="أي حجز تمّ خارج المنصة — بالهاتف أو حضورياً — يُسجَّل هنا فوراً حتى لا يُعرض وقته للحجز مرتين."
                    >
                        <FormGrid>
                            <Field
                                label="الوحدة"
                                error={form.errors.activity_unit_id}
                                required
                            >
                                <select
                                    className={INPUT}
                                    value={form.data.activity_unit_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'activity_unit_id',
                                            event.target.value,
                                        )
                                    }
                                >
                                    <option value="">— اختر الوحدة —</option>
                                    {units.map((row) => (
                                        <option key={row.id} value={row.id}>
                                            {row.branch?.name
                                                ? `${row.branch.name} — `
                                                : ''}
                                            {row.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="التاريخ"
                                error={form.errors.date}
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

                            <Field
                                label="من"
                                error={form.errors.start_time}
                                required
                            >
                                <TimeSelect
                                    value={form.data.start_time}
                                    onChange={(next) =>
                                        form.setData('start_time', next)
                                    }
                                />
                            </Field>

                            <Field
                                label="إلى"
                                error={form.errors.end_time}
                                required
                            >
                                <TimeSelect
                                    value={form.data.end_time}
                                    onChange={(next) =>
                                        form.setData('end_time', next)
                                    }
                                />
                            </Field>
                        </FormGrid>

                        <Field
                            label="ملاحظة"
                            error={form.errors.note}
                            hint="اسم الجهة الحاجزة مثلاً — يظهر لك وحدك."
                        >
                            <input
                                className={INPUT}
                                value={form.data.note}
                                onChange={(event) =>
                                    form.setData('note', event.target.value)
                                }
                            />
                        </Field>

                        <FormActions>
                            <Button type="submit" disabled={form.processing}>
                                تسجيل الحجز
                            </Button>
                            <Button
                                type="button"
                                tone="soft"
                                onClick={() => setAdding(false)}
                            >
                                إلغاء
                            </Button>
                        </FormActions>
                    </FormSection>
                </form>
            )}

            <ConfirmModal
                open={deleting !== null}
                tone="danger"
                title="حذف حجز خارجي"
                message="يعود هذا الوقت متاحاً للحجز على المنصة فوراً. إن كان محجوزاً فعلاً لدى جهة أخرى، فقد تصلك عليه طلبات — والتعارض حينها مسؤوليتك."
                details={
                    deleting && (
                        <>
                            <ConfirmRow
                                label="التاريخ"
                                value={deleting.date.slice(0, 10)}
                                strong
                            />
                            <ConfirmRow
                                label="الوقت"
                                value={`${deleting.start_time?.slice(0, 5)} — ${deleting.end_time?.slice(0, 5)}`}
                                strong
                            />
                            <ConfirmRow
                                label="الملاحظة"
                                value={deleting.note ?? '—'}
                            />
                        </>
                    )
                }
                confirmLabel="نعم، احذف الحجز"
                onConfirm={() => {
                    router.delete(
                        `/partner/availability/external/${deleting?.id}`,
                        { preserveScroll: true },
                    );
                    setDeleting(null);
                }}
                onCancel={() => setDeleting(null)}
            />

            {/* ── الساعات المعروضة على كل ملعب ── */}
            <Card padding="p-4" className="space-y-4">
                <div>
                    <h2 className="text-sm font-extrabold text-ink">
                        الساعات المعروضة على ملاعبك
                    </h2>
                    <p className="text-[11px] leading-relaxed text-ink/55">
                        هذه هي الساعات التي يفتح فيها الملعب للحجز. لا يقع حجز
                        خارجها. ويوم لم تُعرَّف له ساعات يبقى بلا قيد — الصمت
                        هنا ليس منعاً.
                    </p>
                </div>

                {venues.length > 1 && (
                    <div className="flex flex-wrap gap-1.5">
                        {venues.map((venue) => (
                            <button
                                key={venue.id}
                                type="button"
                                onClick={() => {
                                    setVenueId(venue.id);
                                    // تُضبط مع الاختيار لا عند الإرسال: `setData`
                                    // غير متزامنة، فضبطها لحظة الإرسال يبعث
                                    // القيمة السابقة ويسقط الطلب بلا رسالة.
                                    hoursForm.setData(
                                        'venue_id',
                                        String(venue.id),
                                    );
                                }}
                                className={`cursor-pointer rounded-full border-[0.5px] px-3 py-1 text-xs font-bold transition-colors ${
                                    venueId === venue.id
                                        ? 'border-ink bg-ink text-lime'
                                        : 'border-ink/10 bg-surface text-ink/70 hover:border-ink/30'
                                }`}
                            >
                                {venue.name}
                            </button>
                        ))}
                    </div>
                )}

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        hoursForm.post('/partner/schedule', {
                            preserveScroll: true,
                            onSuccess: () =>
                                hoursForm.reset('start_time', 'end_time'),
                        });
                    }}
                    className="grid grid-cols-1 items-end gap-3 sm:grid-cols-4"
                >
                    <Field
                        label="اليوم"
                        htmlFor="oh-date"
                        error={hoursForm.errors.date}
                        required
                    >
                        <input
                            id="oh-date"
                            type="date"
                            className={INPUT}
                            value={hoursForm.data.date}
                            onChange={(event) =>
                                hoursForm.setData('date', event.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="من"
                        htmlFor="oh-start"
                        error={hoursForm.errors.start_time}
                        required
                    >
                        <TimeSelect
                            id="oh-start"
                            value={hoursForm.data.start_time}
                            onChange={(next) =>
                                hoursForm.setData('start_time', next)
                            }
                        />
                    </Field>
                    <Field
                        label="إلى"
                        htmlFor="oh-end"
                        error={hoursForm.errors.end_time}
                        required
                    >
                        <TimeSelect
                            id="oh-end"
                            value={hoursForm.data.end_time}
                            onChange={(next) =>
                                hoursForm.setData('end_time', next)
                            }
                        />
                    </Field>
                    {hoursForm.errors.venue_id && (
                        <p className="text-[11px] font-bold text-danger sm:col-span-4">
                            {hoursForm.errors.venue_id}
                        </p>
                    )}

                    <Button
                        type="submit"
                        icon={Plus}
                        disabled={
                            hoursForm.processing ||
                            venueId === null ||
                            !hoursForm.data.date ||
                            !hoursForm.data.start_time ||
                            !hoursForm.data.end_time
                        }
                    >
                        أضف ساعة
                    </Button>
                </form>

                <TableShell>
                    <Thead>
                        <Th>اليوم</Th>
                        <Th>الفترة</Th>
                        <Th>الحالة</Th>
                        <Th className="text-center">الإجراء</Th>
                    </Thead>
                    <Tbody>
                        {offeredHours
                            .filter((hour) => hour.venue_id === venueId)
                            .map((hour) => (
                                <Tr key={hour.id}>
                                    <Td className="font-mono text-[11px] whitespace-nowrap text-ink/75">
                                        {hour.date ?? '—'}
                                    </Td>
                                    <Td
                                        className="font-mono text-[11px] text-ink"
                                        dir="ltr"
                                    >
                                        {hour.start_time} — {hour.end_time}
                                    </Td>
                                    <Td>
                                        <Badge
                                            tone={
                                                hour.status === 'available'
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                        >
                                            {hour.status === 'available'
                                                ? 'معروضة للحجز'
                                                : 'مغلقة'}
                                        </Badge>
                                    </Td>
                                    <Td className="text-center">
                                        <IconButton
                                            icon={Trash2}
                                            label="حذف الساعة"
                                            tone="danger"
                                            onClick={() =>
                                                setRemovingHour(hour)
                                            }
                                        />
                                    </Td>
                                </Tr>
                            ))}

                        <ListStates
                            count={
                                offeredHours.filter(
                                    (hour) => hour.venue_id === venueId,
                                ).length
                            }
                            colSpan={4}
                            empty="لا ساعات معروضة لهذا الملعب هذا الأسبوع."
                            emptyHint="بلا ساعات معرَّفة يبقى الملعب قابلاً للحجز في أي وقت ضمن دوام الفرع."
                        />
                    </Tbody>
                </TableShell>
            </Card>

            <ConfirmModal
                open={removingHour !== null}
                tone="danger"
                title="حذف ساعة معروضة"
                message="لن يُعرض هذا الوقت للحجز بعد الآن. الحجوزات القائمة عليه لا تتأثر."
                details={
                    removingHour && (
                        <>
                            <ConfirmRow
                                label="اليوم"
                                value={removingHour.date ?? '—'}
                            />
                            <ConfirmRow
                                label="الفترة"
                                value={`${removingHour.start_time} — ${removingHour.end_time}`}
                                strong
                            />
                        </>
                    )
                }
                confirmLabel="حذف الساعة"
                onConfirm={() => {
                    router.delete(`/partner/schedule/${removingHour?.id}`, {
                        preserveScroll: true,
                    });
                    setRemovingHour(null);
                }}
                onCancel={() => setRemovingHour(null)}
            />
        </PartnerLayout>
    );
}

type CellState =
    | { kind: 'free' }
    | { kind: 'pending'; request: PendingRequest }
    | { kind: 'platform'; slot: Slot }
    | { kind: 'external'; slot: Slot };

function Cell({
    cell,
    onDelete,
}: {
    cell: CellState;
    onDelete: (slot: Slot) => void;
}) {
    if (cell.kind === 'free') {
        return (
            <div className="flex h-11 items-center justify-center rounded-lg border-[0.5px] border-ink/15 bg-page">
                <span className="text-[10px] text-ink/45">متاح</span>
            </div>
        );
    }

    if (cell.kind === 'pending') {
        return (
            <div className="flex h-11 flex-col items-center justify-center rounded-lg border-[0.5px] border-warning/30 bg-warning-tint">
                <span className="text-[10px] font-bold text-warning">
                    طلب معلّق
                </span>
                <span className="text-[9px] text-warning/80">بانتظار ردّك</span>
            </div>
        );
    }

    if (cell.kind === 'platform') {
        return (
            <div className="flex h-11 items-center justify-center gap-1 rounded-lg bg-ink">
                <Lock
                    className="h-2.5 w-2.5 shrink-0 text-lime/70"
                    aria-hidden="true"
                />
                <span className="text-[10px] font-bold text-lime">محجوز</span>
            </div>
        );
    }

    return (
        <div className="flex h-11 items-center justify-center gap-1 rounded-lg border-[0.5px] border-info/30 bg-info-tint px-1">
            <button
                type="button"
                onClick={() => onDelete(cell.slot)}
                aria-label="حذف الحجز الخارجي"
                className="shrink-0 text-info transition-colors hover:text-danger"
            >
                <Trash2 className="h-2.5 w-2.5" aria-hidden="true" />
            </button>
            <span className="truncate text-[10px] font-bold text-info">
                {cell.slot.note || 'حجز خارجي'}
            </span>
        </div>
    );
}

function Legend({
    className,
    label,
    dark = false,
}: {
    className: string;
    label: string;
    dark?: boolean;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 text-[10px] text-ink/70">
            <span
                className={`h-3 w-3 rounded border-[0.5px] ${className}`}
                aria-hidden="true"
            />
            {label}
            {dark && (
                <TriangleAlert
                    className="h-2.5 w-2.5 text-ink/40"
                    aria-hidden="true"
                />
            )}
        </span>
    );
}
