import { router, useForm } from '@inertiajs/react';
import {
    CalendarClock,
    CalendarOff,
    Pause,
    Play,
    Plus,
    Repeat,
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
    INPUT,
    Note,
    Tbody,
    Td,
    Th,
    Thead,
    TableShell,
    Tr,
} from '@/components/portal/ui';
import { eventStatus } from '@/lib/status';

/**
 * H §8 — قوالب التكرار.
 *
 * One component, two portals: the account manager and the community leader
 * manage templates identically, so the only difference is `manageUrl`. The
 * three facts this screen must never let anyone misread:
 *
 *  1. Generation happens 14 days before each date — a template is a promise
 *     about the future, not a batch of events created now.
 *  2. Editing a template touches only what has yet to be generated. Events
 *     already on the calendar keep their old terms.
 *  3. Pausing stops future generation and leaves generated events alone.
 *
 * The blackout preview is shown as its own column because "why did this week
 * disappear?" is the question this feature generates most.
 */
export type TemplatePartner = {
    id: number;
    name: string;
    units: {
        id: number;
        name: string;
        category_id: number | null;
        price: string | number | null;
        default_duration_minutes: number | null;
    }[];
};

export type TemplateRow = {
    id: number;
    title: string | null;
    notes: string | null;
    status: string;
    partner_id: number | null;
    activity_unit_id: number | null;
    category_id: number | null;
    recurrence_pattern: string;
    day_of_week: number | null;
    day_of_month: number | null;
    starts_from: string | null;
    start_time: string;
    duration_minutes: number;
    capacity: number;
    min_participants: number;
    venues_count: number | null;
    total_amount: string | number | null;
    subsidy_type: string | null;
    subsidy_value: number | null;
    blackout_behavior: string;
    reschedule_interval_days: number | null;
    events_count: number;
    partner?: { id: number; name: string; trade_name?: string | null } | null;
    activity_unit?: { id: number; name: string } | null;
    category?: { id: number; name: string } | null;
    upcoming: {
        pattern_date: string;
        effective_date: string | null;
        action: string;
        blackout_name: string | null;
        shifted: boolean;
    }[];
    generated_events: {
        id: number;
        event_date: string;
        start_time: string | null;
        status: string;
        participants_count: number | null;
        min_participants: number | null;
        reschedule_attempt: number | null;
    }[];
};

const PATTERNS: [string, string][] = [
    ['weekly', 'أسبوعي'],
    ['biweekly', 'كل أسبوعين'],
    ['monthly', 'شهري'],
];

const DAYS = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
];

type FormShape = {
    title: string;
    notes: string;
    partner_id: string;
    activity_unit_id: string;
    category_id: string;
    recurrence_pattern: string;
    day_of_week: string;
    day_of_month: string;
    starts_from: string;
    start_time: string;
    duration_minutes: string;
    capacity: string;
    min_participants: string;
    venues_count: string;
    total_amount: string;
    subsidy_type: string;
    subsidy_value: string;
    blackout_behavior: string;
    reschedule_interval_days: string;
};

const BLANK: FormShape = {
    title: '',
    notes: '',
    partner_id: '',
    activity_unit_id: '',
    category_id: '',
    recurrence_pattern: 'weekly',
    day_of_week: '0',
    day_of_month: '',
    starts_from: '',
    start_time: '18:00',
    duration_minutes: '90',
    capacity: '20',
    min_participants: '8',
    venues_count: '1',
    total_amount: '',
    subsidy_type: 'percentage',
    subsidy_value: '100',
    blackout_behavior: 'skip',
    reschedule_interval_days: '7',
};

export default function TemplateManager({
    community,
    templates,
    partners,
    categories,
    manageUrl,
}: {
    community: { id: number; name: string; status?: string };
    templates: TemplateRow[];
    partners: TemplatePartner[];
    categories: { id: number; name: string }[];
    manageUrl: string;
}) {
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<TemplateRow | null>(null);
    const [toggling, setToggling] = useState<{
        template: TemplateRow;
        action: 'pause' | 'resume';
    } | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-ink" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">
                        قوالب التكرار
                    </h2>
                    <Badge tone="neutral">{templates.length}</Badge>
                </div>
                <Button
                    type="button"
                    icon={Plus}
                    onClick={() => {
                        setEditing(null);
                        setCreating(true);
                    }}
                >
                    قالب جديد
                </Button>
            </div>

            <Note title="متى تُنشأ الفعاليات؟">
                القالب لا ينشئ فعالياته دفعةً واحدة: يولّد كل فعالية قبل موعدها
                بـ14 يوماً. لذلك تعديل القالب لا يمسّ ما وُلِّد فعلاً — يسري على
                القادم فقط.
            </Note>

            {(creating || editing) && (
                <TemplateForm
                    key={editing?.id ?? 'new'}
                    template={editing}
                    partners={partners}
                    categories={categories}
                    manageUrl={manageUrl}
                    onDone={() => {
                        setCreating(false);
                        setEditing(null);
                    }}
                />
            )}

            {templates.map((template) => (
                <Card key={template.id} padding="p-4" className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-sm font-extrabold text-ink">
                                {template.title ||
                                    template.activity_unit?.name ||
                                    'قالب بلا عنوان'}
                            </h3>
                            <p className="text-[11px] text-ink/55">
                                {template.partner?.trade_name ||
                                    template.partner?.name ||
                                    '—'}{' '}
                                ·{' '}
                                {PATTERNS.find(
                                    ([key]) =>
                                        key === template.recurrence_pattern,
                                )?.[1] ?? template.recurrence_pattern}
                                {template.recurrence_pattern === 'monthly'
                                    ? ` · يوم ${template.day_of_month ?? '—'}`
                                    : ` · ${DAYS[template.day_of_week ?? 0]}`}{' '}
                                · {template.start_time} ·{' '}
                                {template.duration_minutes} دقيقة
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <Badge
                                tone={
                                    template.status === 'active'
                                        ? 'success'
                                        : 'neutral'
                                }
                            >
                                {template.status === 'active'
                                    ? 'يعمل'
                                    : 'موقوف'}
                            </Badge>
                            <Button
                                type="button"
                                tone="soft"
                                onClick={() => {
                                    setCreating(false);
                                    setEditing(template);
                                }}
                            >
                                تعديل
                            </Button>
                            <Button
                                type="button"
                                tone="soft"
                                icon={
                                    template.status === 'active' ? Pause : Play
                                }
                                onClick={() =>
                                    setToggling({
                                        template,
                                        action:
                                            template.status === 'active'
                                                ? 'pause'
                                                : 'resume',
                                    })
                                }
                            >
                                {template.status === 'active'
                                    ? 'إيقاف'
                                    : 'استئناف'}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <Fact label="السعة" value={`${template.capacity}`} />
                        <Fact
                            label="النصاب"
                            value={`${template.min_participants}`}
                        />
                        <Fact
                            label="فعاليات مولَّدة"
                            value={`${template.events_count}`}
                        />
                        <Fact
                            label="سلوك التعطيل"
                            value={
                                template.blackout_behavior === 'skip'
                                    ? 'تخطّي الموعد'
                                    : 'تأجيل أسبوعاً'
                            }
                        />
                    </div>

                    {/* ── المواعيد القادمة ── */}
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <CalendarClock
                                className="h-3.5 w-3.5 text-ink/60"
                                aria-hidden="true"
                            />
                            <span className="text-[11px] font-bold text-ink/70">
                                المواعيد القادمة كما سيولّدها القالب
                            </span>
                        </div>

                        <TableShell>
                            <Thead>
                                <Th>موعد النمط</Th>
                                <Th>الموعد الفعلي</Th>
                                <Th>ما سيحدث</Th>
                            </Thead>
                            <Tbody>
                                {template.upcoming.map((row) => (
                                    <Tr key={row.pattern_date}>
                                        <Td className="font-mono text-[11px] text-ink/70">
                                            {row.pattern_date}
                                        </Td>
                                        <Td className="font-mono text-[11px] font-bold text-ink">
                                            {row.effective_date ?? '—'}
                                        </Td>
                                        <Td>
                                            {row.action === 'skip_blackout' ? (
                                                <Badge
                                                    tone="danger"
                                                    icon={CalendarOff}
                                                >
                                                    تُخطّى —{' '}
                                                    {row.blackout_name ??
                                                        'فترة تعطيل'}
                                                </Badge>
                                            ) : row.shifted ? (
                                                <Badge tone="warning">
                                                    أُجّلت —{' '}
                                                    {row.blackout_name ??
                                                        'فترة تعطيل'}
                                                </Badge>
                                            ) : (
                                                <Badge tone="success">
                                                    تُولَّد كما هي
                                                </Badge>
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                                <ListStates
                                    count={template.upcoming.length}
                                    colSpan={3}
                                    empty="لا مواعيد قادمة ضمن السنة القادمة."
                                    emptyHint="راجع نمط التكرار وتاريخ البداية."
                                />
                            </Tbody>
                        </TableShell>
                    </div>

                    {/* ── ما وُلِّد فعلاً ── */}
                    {template.generated_events.length > 0 && (
                        <div>
                            <span className="mb-2 block text-[11px] font-bold text-ink/70">
                                آخر ما وُلِّد من هذا القالب
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {template.generated_events.map((event) => (
                                    <span
                                        key={event.id}
                                        className="inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-ink/12 bg-ink/5 px-2.5 py-1 text-[11px]"
                                    >
                                        <span className="font-mono text-ink/70">
                                            {event.event_date}
                                        </span>
                                        <span className="font-bold text-ink">
                                            {eventStatus(event.status).label}
                                        </span>
                                        <span className="font-mono text-ink/50">
                                            {event.participants_count ?? 0}/
                                            {event.min_participants ?? '—'}
                                        </span>
                                        {(event.reschedule_attempt ?? 0) >
                                            0 && (
                                            <TriangleAlert
                                                className="h-3 w-3 text-warning"
                                                aria-label="أُعيدت جدولتها"
                                            />
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            ))}

            {templates.length === 0 && !creating && (
                <Card padding="p-8" className="text-center">
                    <p className="mb-1 text-sm font-extrabold text-ink">
                        لا قوالب تكرار في {community.name}.
                    </p>
                    <p className="text-xs text-ink/55">
                        القالب يوفّر إنشاء الفعالية أسبوعياً باليد — تضبطه مرة،
                        فيولّد فعالياته قبل كل موعد بـ14 يوماً.
                    </p>
                </Card>
            )}

            <ConfirmModal
                open={toggling !== null}
                tone={toggling?.action === 'pause' ? 'danger' : 'default'}
                title={
                    toggling?.action === 'pause'
                        ? 'إيقاف القالب'
                        : 'استئناف القالب'
                }
                message={
                    toggling?.action === 'pause'
                        ? 'يتوقف توليد الفعاليات المستقبلية من هذا القالب. الفعاليات التي وُلِّدت بالفعل لا تُمسّ ولا تُلغى.'
                        : 'يعود القالب للتوليد من موعده القادم فصاعداً. المواعيد التي فاتت أثناء الإيقاف لا تُعوَّض.'
                }
                details={
                    toggling && (
                        <>
                            <ConfirmRow
                                label="القالب"
                                value={
                                    toggling.template.title ||
                                    toggling.template.activity_unit?.name ||
                                    '—'
                                }
                                strong
                            />
                            <ConfirmRow
                                label="فعاليات مولَّدة"
                                value={`${toggling.template.events_count} — لن تتأثر`}
                            />
                            <ConfirmRow
                                label="الموعد القادم"
                                value={
                                    toggling.template.upcoming[0]
                                        ?.effective_date ?? '—'
                                }
                            />
                        </>
                    )
                }
                confirmLabel={
                    toggling?.action === 'pause'
                        ? 'نعم، أوقف التوليد'
                        : 'نعم، استأنف'
                }
                onConfirm={() => {
                    router.post(
                        `${manageUrl}/${toggling?.template.id}/${toggling?.action}`,
                        {},
                        { preserveScroll: true },
                    );
                    setToggling(null);
                }}
                onCancel={() => setToggling(null)}
            />
        </div>
    );
}

function Fact({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border-[0.5px] border-ink/12 bg-page px-3 py-2">
            <span className="block text-[10px] text-ink/50">{label}</span>
            <span className="block font-mono text-xs font-extrabold text-ink">
                {value}
            </span>
        </div>
    );
}

function TemplateForm({
    template,
    partners,
    categories,
    manageUrl,
    onDone,
}: {
    template: TemplateRow | null;
    partners: TemplatePartner[];
    categories: { id: number; name: string }[];
    manageUrl: string;
    onDone: () => void;
}) {
    const form = useForm<FormShape>(
        template
            ? {
                  title: template.title ?? '',
                  notes: template.notes ?? '',
                  partner_id: template.partner_id
                      ? String(template.partner_id)
                      : '',
                  activity_unit_id: template.activity_unit_id
                      ? String(template.activity_unit_id)
                      : '',
                  category_id: template.category_id
                      ? String(template.category_id)
                      : '',
                  recurrence_pattern: template.recurrence_pattern,
                  day_of_week:
                      template.day_of_week === null
                          ? ''
                          : String(template.day_of_week),
                  day_of_month:
                      template.day_of_month === null
                          ? ''
                          : String(template.day_of_month),
                  starts_from: template.starts_from ?? '',
                  start_time: template.start_time?.slice(0, 5) ?? '18:00',
                  duration_minutes: String(template.duration_minutes),
                  capacity: String(template.capacity),
                  min_participants: String(template.min_participants),
                  venues_count: String(template.venues_count ?? 1),
                  total_amount:
                      template.total_amount === null
                          ? ''
                          : String(template.total_amount),
                  subsidy_type: template.subsidy_type ?? 'percentage',
                  subsidy_value:
                      template.subsidy_value === null
                          ? ''
                          : String(template.subsidy_value),
                  blackout_behavior: template.blackout_behavior,
                  reschedule_interval_days: String(
                      template.reschedule_interval_days ?? 7,
                  ),
              }
            : BLANK,
    );

    const partner = partners.find(
        (row) => String(row.id) === form.data.partner_id,
    );
    const monthly = form.data.recurrence_pattern === 'monthly';

    return (
        <Card padding="p-5" className="border-ink/25">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    const options = { preserveScroll: true, onSuccess: onDone };

                    if (template) {
                        form.patch(`${manageUrl}/${template.id}`, options);
                    } else {
                        form.post(manageUrl, options);
                    }
                }}
            >
                <FormSection
                    title={template ? 'تعديل القالب' : 'قالب جديد'}
                    hint="ما تضبطه هنا يسري على الفعاليات التي ستُولَّد لاحقاً — لا على ما وُلِّد."
                >
                    <FormGrid>
                        <Field
                            label="عنوان القالب"
                            error={form.errors.title}
                            hint="اتركه فارغاً ليأخذ اسم النشاط."
                        >
                            <input
                                className={INPUT}
                                value={form.data.title}
                                onChange={(event) =>
                                    form.setData('title', event.target.value)
                                }
                            />
                        </Field>

                        <Field
                            label="المرفق"
                            error={form.errors.partner_id}
                            required
                        >
                            <select
                                className={INPUT}
                                value={form.data.partner_id}
                                onChange={(event) => {
                                    form.setData(
                                        'partner_id',
                                        event.target.value,
                                    );
                                    form.setData('activity_unit_id', '');
                                }}
                            >
                                <option value="">— اختر المرفق —</option>
                                {partners.map((row) => (
                                    <option key={row.id} value={row.id}>
                                        {row.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field
                            label="النشاط"
                            error={form.errors.activity_unit_id}
                        >
                            <select
                                className={INPUT}
                                value={form.data.activity_unit_id}
                                onChange={(event) => {
                                    form.setData(
                                        'activity_unit_id',
                                        event.target.value,
                                    );
                                    const unit = partner?.units.find(
                                        (item) =>
                                            String(item.id) ===
                                            event.target.value,
                                    );

                                    if (unit?.default_duration_minutes) {
                                        form.setData(
                                            'duration_minutes',
                                            String(
                                                unit.default_duration_minutes,
                                            ),
                                        );
                                    }
                                }}
                                disabled={!partner}
                            >
                                <option value="">
                                    {partner
                                        ? '— اختر النشاط —'
                                        : 'اختر المرفق أولاً'}
                                </option>
                                {(partner?.units ?? []).map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="الفئة" error={form.errors.category_id}>
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
                                <option value="">— بلا فئة —</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormSection title="التكرار">
                    <FormGrid>
                        <Field
                            label="النمط"
                            error={form.errors.recurrence_pattern}
                            required
                        >
                            <select
                                className={INPUT}
                                value={form.data.recurrence_pattern}
                                onChange={(event) =>
                                    form.setData(
                                        'recurrence_pattern',
                                        event.target.value,
                                    )
                                }
                            >
                                {PATTERNS.map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {monthly ? (
                            <Field
                                label="يوم الشهر"
                                error={form.errors.day_of_month}
                                required
                            >
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    dir="ltr"
                                    className={INPUT}
                                    value={form.data.day_of_month}
                                    onChange={(event) =>
                                        form.setData(
                                            'day_of_month',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        ) : (
                            <Field
                                label="يوم الأسبوع"
                                error={form.errors.day_of_week}
                                required
                            >
                                <select
                                    className={INPUT}
                                    value={form.data.day_of_week}
                                    onChange={(event) =>
                                        form.setData(
                                            'day_of_week',
                                            event.target.value,
                                        )
                                    }
                                >
                                    {DAYS.map((day, index) => (
                                        <option key={day} value={index}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        )}

                        <Field
                            label="وقت البداية"
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
                            label="المدة (دقيقة)"
                            error={form.errors.duration_minutes}
                            required
                        >
                            <input
                                type="number"
                                min="30"
                                max="480"
                                dir="ltr"
                                className={INPUT}
                                value={form.data.duration_minutes}
                                onChange={(event) =>
                                    form.setData(
                                        'duration_minutes',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>

                        <Field
                            label="يبدأ من"
                            error={form.errors.starts_from}
                            hint="اتركه فارغاً ليبدأ من أقرب موعد."
                        >
                            <input
                                type="date"
                                dir="ltr"
                                className={INPUT}
                                value={form.data.starts_from}
                                onChange={(event) =>
                                    form.setData(
                                        'starts_from',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>

                        <Field
                            label="عند فترة التعطيل"
                            error={form.errors.blackout_behavior}
                            hint="فترات التعطيل تحددها إدارة تيمات (أعياد، إجازات رسمية)."
                            required
                        >
                            <select
                                className={INPUT}
                                value={form.data.blackout_behavior}
                                onChange={(event) =>
                                    form.setData(
                                        'blackout_behavior',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="skip">تخطّي الموعد</option>
                                <option value="shift_week">
                                    تأجيله أسبوعاً
                                </option>
                            </select>
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormSection title="السعة والتكلفة">
                    <FormGrid>
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
                            hint="أقل عدد يجعل الفعالية تنعقد."
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

                        <Field
                            label="إجمالي التكلفة"
                            error={form.errors.total_amount}
                        >
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                dir="ltr"
                                className={INPUT}
                                value={form.data.total_amount}
                                onChange={(event) =>
                                    form.setData(
                                        'total_amount',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>

                        <Field
                            label="نوع الدعم"
                            error={form.errors.subsidy_type}
                        >
                            <select
                                className={INPUT}
                                value={form.data.subsidy_type}
                                onChange={(event) =>
                                    form.setData(
                                        'subsidy_type',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="percentage">نسبة مئوية</option>
                                <option value="fixed">مبلغ ثابت</option>
                            </select>
                        </Field>

                        <Field
                            label={
                                form.data.subsidy_type === 'percentage'
                                    ? 'نسبة الدعم (٪)'
                                    : 'مبلغ الدعم'
                            }
                            error={form.errors.subsidy_value}
                            hint={
                                form.data.subsidy_type === 'percentage'
                                    ? '100 = تتحمل الشركة التكلفة كاملة.'
                                    : undefined
                            }
                        >
                            <input
                                type="number"
                                min="0"
                                dir="ltr"
                                className={INPUT}
                                value={form.data.subsidy_value}
                                onChange={(event) =>
                                    form.setData(
                                        'subsidy_value',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    </FormGrid>

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

                <FormActions>
                    <Button type="button" tone="soft" onClick={onDone}>
                        إلغاء
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {template ? 'حفظ التعديلات' : 'إنشاء القالب'}
                    </Button>
                </FormActions>
            </form>
        </Card>
    );
}
