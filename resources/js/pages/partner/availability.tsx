import { Head, router, useForm } from '@inertiajs/react';
import {
    CalendarRange,
    ChevronLeft,
    ChevronRight,
    Lock,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    INPUT,
    Note,
    PageHeader,
} from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';

/**
 * G/دليل المزوّد §2 — تقويم التوفر.
 *
 * The platform calendar is the single source of truth, which makes this the
 * provider's most consequential daily screen: an hour they sold on the phone
 * and did not record here stays bookable, and the double-booking that follows
 * costs them a cancellation — the heaviest reliability penalty there is.
 *
 * Hence the two visually distinct kinds of block. An internal one came from
 * accepting a request and cannot be removed here; an external one is theirs
 * to add and delete. Only the second gets a delete button.
 */
type Unit = {
    id: number;
    name: string;
    provider_branch_id: number;
    branch?: { id: number; name: string } | null;
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

const DAY_NAMES = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
];

export default function PartnerAvailability({
    units,
    slots,
    week_start: weekStart,
    week_end: weekEnd,
}: {
    units: Unit[];
    slots: Slot[];
    week_start: string;
    week_end: string;
}) {
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState<Slot | null>(null);

    const form = useForm({
        activity_unit_id: '',
        date: '',
        start_time: '',
        end_time: '',
        note: '',
    });

    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(`${weekStart}T00:00:00`);
        date.setDate(date.getDate() + index);
        const key = date.toISOString().slice(0, 10);

        return { key, name: DAY_NAMES[date.getDay()] };
    });

    const shiftWeek = (deltaDays: number) => {
        const date = new Date(`${weekStart}T00:00:00`);
        date.setDate(date.getDate() + deltaDays);
        router.get(
            '/partner/availability',
            { date: date.toISOString().slice(0, 10) },
            { preserveState: false },
        );
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
                subtitle="تقويم المنصة هو المرجع — ما لا تسجّله هنا يبقى معروضاً للحجز."
                actions={
                    <Button
                        type="button"
                        icon={Plus}
                        onClick={() => {
                            form.reset();
                            setAdding(true);
                        }}
                    >
                        تسجيل حجز خارجي
                    </Button>
                }
            />

            {/* ── التنقل بين الأسابيع ── */}
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
                units.map((unit) => (
                    <Card key={unit.id} padding="p-4" className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-sm font-extrabold text-ink">
                                {unit.branch?.name
                                    ? `${unit.branch.name} — `
                                    : ''}
                                {unit.name}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                            {days.map((day) => {
                                const daySlots = slots.filter(
                                    (slot) =>
                                        slot.activity_unit_id === unit.id &&
                                        slot.date.slice(0, 10) === day.key,
                                );

                                return (
                                    <div
                                        key={day.key}
                                        className="min-h-[92px] rounded-xl border-[0.5px] border-ink/12 bg-page p-2"
                                    >
                                        <div className="mb-1.5 flex items-baseline justify-between">
                                            <span className="text-[11px] font-extrabold text-ink">
                                                {day.name}
                                            </span>
                                            <span className="font-mono text-[9px] text-ink/40">
                                                {day.key.slice(5)}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            {daySlots.map((slot) => {
                                                const external =
                                                    slot.booking_type ===
                                                    'external';

                                                return (
                                                    <div
                                                        key={slot.id}
                                                        className={`rounded-lg px-1.5 py-1 text-[10px] leading-tight ${
                                                            external
                                                                ? 'border-[0.5px] border-warning/30 bg-warning-tint'
                                                                : 'bg-ink text-lime'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span
                                                                className="font-mono font-bold"
                                                                dir="ltr"
                                                            >
                                                                {slot.start_time?.slice(
                                                                    0,
                                                                    5,
                                                                )}
                                                                –
                                                                {slot.end_time?.slice(
                                                                    0,
                                                                    5,
                                                                )}
                                                            </span>
                                                            {external ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setDeleting(
                                                                            slot,
                                                                        )
                                                                    }
                                                                    aria-label="حذف الحجز الخارجي"
                                                                    className="text-warning transition-colors hover:text-danger"
                                                                >
                                                                    <Trash2
                                                                        className="h-2.5 w-2.5"
                                                                        aria-hidden="true"
                                                                    />
                                                                </button>
                                                            ) : (
                                                                <Lock
                                                                    className="h-2.5 w-2.5 opacity-60"
                                                                    aria-label="حجز من المنصة"
                                                                />
                                                            )}
                                                        </div>
                                                        {external &&
                                                            slot.note && (
                                                                <span className="block truncate text-warning">
                                                                    {slot.note}
                                                                </span>
                                                            )}
                                                    </div>
                                                );
                                            })}

                                            {daySlots.length === 0 && (
                                                <span className="block text-[10px] text-ink/30">
                                                    متاح
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))
            )}

            <Card padding="p-3.5" className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-ink/70">
                    <span
                        className="h-3 w-3 rounded bg-ink"
                        aria-hidden="true"
                    />
                    حجز من المنصة — لا يُحذف من هنا
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-ink/70">
                    <span
                        className="h-3 w-3 rounded border-[0.5px] border-warning/30 bg-warning-tint"
                        aria-hidden="true"
                    />
                    حجز خارجي سجّلته أنت
                </span>
                <Badge tone="neutral">
                    {externalCount} حجزاً خارجياً هذا الأسبوع
                </Badge>
            </Card>

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
                        title="تسجيل حجز خارجي"
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
                                    {units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.branch?.name
                                                ? `${unit.branch.name} — `
                                                : ''}
                                            {unit.name}
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
                                <input
                                    type="time"
                                    dir="ltr"
                                    className={INPUT}
                                    value={form.data.start_time}
                                    onChange={(event) =>
                                        form.setData(
                                            'start_time',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>

                            <Field
                                label="إلى"
                                error={form.errors.end_time}
                                required
                            >
                                <input
                                    type="time"
                                    dir="ltr"
                                    className={INPUT}
                                    value={form.data.end_time}
                                    onChange={(event) =>
                                        form.setData(
                                            'end_time',
                                            event.target.value,
                                        )
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
                    </FormSection>

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
                </form>
            )}

            <Note title="لماذا هذا أهم واجب يومي؟">
                إن بقي وقت محجوز خارجياً معروضاً على المنصة، قد تقبل عليه طلباً
                ثم تضطر للإلغاء — والإلغاء بعد القبول هو أشد ما يؤثر في
                موثوقيتك.
            </Note>

            <ConfirmModal
                open={deleting !== null}
                tone="danger"
                title="حذف حجز خارجي"
                message="يعود هذا الوقت متاحاً للحجز على المنصة فوراً. إن كان الوقت محجوزاً فعلاً لدى جهة أخرى، فقد تصلك عليه طلبات."
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
        </PartnerLayout>
    );
}
