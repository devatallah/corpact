import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import type { Category, EventTemplate, TemplateOccurrencePreview } from '@/types/models';
import { fmtDate, fmtTime } from '@/lib/utils';
import toastr from 'toastr';

/**
 * A8 — إدارة قوالب التكرار (H §8): مكوّن مشترك بين بوابة الموظف (القائد/
 * المنسّق) وبوابة الشركة (مسؤول الحساب). الإيقاف يوقف التوليد المستقبلي فقط؛
 * التعديل يسري على ما سيُولَّد لاحقاً فقط؛ التوليد قبل 14 يوماً من الموعد.
 */

export interface PartnerOption {
    id: number;
    name: string;
    units: { id: number; name: string; category_id: number; price: number; default_duration_minutes: number }[];
}

interface Props {
    templates: EventTemplate[];
    partners: PartnerOption[];
    categories: Category[];
    manageUrl: string;
    eventUrlPrefix: string;
}

const DAY_LABELS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const PATTERN_LABELS: Record<string, string> = { weekly: 'أسبوعي', biweekly: 'كل أسبوعين', monthly: 'شهري' };

function patternSummary(t: EventTemplate): string {
    if (t.recurrence_pattern === 'monthly') {
        return `شهرياً يوم ${t.day_of_month}${(t.day_of_month ?? 0) >= 29 ? ' (وفي الشهر الأقصر: آخر يوم)' : ''}`;
    }
    return `${PATTERN_LABELS[t.recurrence_pattern]} — ${DAY_LABELS[t.day_of_week ?? 0]}`;
}

interface TemplateFormData {
    [key: string]: unknown;
    title: string;
    partner_id: string;
    activity_unit_id: string;
    category_id: string;
    recurrence_pattern: 'weekly' | 'biweekly' | 'monthly';
    day_of_week: number;
    day_of_month: number;
    starts_from: string;
    start_time: string;
    duration_minutes: number;
    capacity: number;
    min_participants: number;
    total_amount: string;
    company_subsidy: string;
    blackout_behavior: 'skip' | 'shift_week';
    reschedule_interval_days: number;
    notes: string;
}

function TemplateForm({ initial, partners, categories, submitLabel, onSubmit, processing, errors }: {
    initial: TemplateFormData;
    partners: PartnerOption[];
    categories: Category[];
    submitLabel: string;
    processing: boolean;
    errors: Record<string, string>;
    onSubmit: (data: TemplateFormData) => void;
}) {
    const [data, setDataState] = useState<TemplateFormData>(initial);
    const set = (patch: Partial<TemplateFormData>) => setDataState((prev) => ({ ...prev, ...patch }));
    const selectedPartner = partners.find((p) => p.id === Number(data.partner_id));
    const err = (key: string) => errors[key] && <div style={{ fontSize: 11, color: '#D9381E', marginTop: 2 }}>{errors[key]}</div>;

    const label = { fontSize: 12, color: 'rgba(10,10,10,.6)', fontWeight: 600 as const, display: 'block', marginBottom: 4 };
    const row = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 10 };

    return (
        <div>
            <div style={row}>
                <div>
                    <label style={label}>اسم القالب (اختياري)</label>
                    <input value={data.title} onChange={(e) => set({ title: e.target.value })} placeholder="مثال: تدريب الأربعاء" />
                    {err('title')}
                </div>
                <div>
                    <label style={label}>المزوّد</label>
                    <select value={data.partner_id} onChange={(e) => set({ partner_id: e.target.value, activity_unit_id: '' })}>
                        <option value="">اختر المزوّد</option>
                        {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {err('partner_id')}
                </div>
                <div>
                    <label style={label}>وحدة النشاط (للتحقق من التوفر)</label>
                    <select
                        value={data.activity_unit_id}
                        onChange={(e) => {
                            const unit = selectedPartner?.units.find((u) => u.id === Number(e.target.value));
                            set({
                                activity_unit_id: e.target.value,
                                ...(unit ? { category_id: String(unit.category_id), duration_minutes: unit.default_duration_minutes, total_amount: String(unit.price) } : {}),
                            });
                        }}
                    >
                        <option value="">بدون وحدة محددة</option>
                        {(selectedPartner?.units ?? []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    {err('activity_unit_id')}
                </div>
                <div>
                    <label style={label}>النشاط</label>
                    <select value={data.category_id} onChange={(e) => set({ category_id: e.target.value })}>
                        <option value="">اختر النشاط</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {err('category_id')}
                </div>
            </div>

            <div style={{ marginBottom: 10 }}>
                <label style={label}>نمط التكرار (أسبوعي · كل أسبوعين · شهري — بداية الأسبوع الأحد)</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(['weekly', 'biweekly', 'monthly'] as const).map((p) => (
                        <button key={p} type="button" className={`pill${data.recurrence_pattern === p ? ' on' : ''}`} onClick={() => set({ recurrence_pattern: p })}>
                            {PATTERN_LABELS[p]}
                        </button>
                    ))}
                </div>
            </div>

            {data.recurrence_pattern !== 'monthly' ? (
                <div style={{ marginBottom: 10 }}>
                    <label style={label}>اليوم</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {DAY_LABELS.map((d, i) => (
                            <button key={i} type="button" className={`pill${data.day_of_week === i ? ' on' : ''}`} onClick={() => set({ day_of_week: i })}>{d}</button>
                        ))}
                    </div>
                    {err('day_of_week')}
                </div>
            ) : (
                <div style={{ marginBottom: 10, maxWidth: 220 }}>
                    <label style={label}>يوم الشهر (31 في شهر أقصر = آخر يوم)</label>
                    <input type="number" min={1} max={31} value={data.day_of_month} onChange={(e) => set({ day_of_month: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })} />
                    {err('day_of_month')}
                </div>
            )}

            <div style={row}>
                <div>
                    <label style={label}>يبدأ من تاريخ</label>
                    <input type="date" value={data.starts_from} onChange={(e) => set({ starts_from: e.target.value })} />
                    {err('starts_from')}
                </div>
                <div>
                    <label style={label}>وقت البدء</label>
                    <input type="time" value={data.start_time} onChange={(e) => set({ start_time: e.target.value })} />
                    {err('start_time')}
                </div>
                <div>
                    <label style={label}>المدة (دقائق)</label>
                    <input type="number" min={30} max={480} step={15} value={data.duration_minutes} onChange={(e) => set({ duration_minutes: Number(e.target.value) || 60 })} />
                    {err('duration_minutes')}
                </div>
            </div>

            <div style={row}>
                <div>
                    <label style={label}>الحد الأقصى للمشاركين</label>
                    <input type="number" min={2} value={data.capacity} onChange={(e) => set({ capacity: Math.max(2, Number(e.target.value) || 2) })} />
                    {err('capacity')}
                </div>
                <div>
                    <label style={label}>الحد الأدنى للمشاركين</label>
                    <input type="number" min={2} value={data.min_participants} onChange={(e) => set({ min_participants: Math.max(2, Number(e.target.value) || 2) })} />
                    {err('min_participants')}
                </div>
                <div>
                    <label style={label}>إجمالي التكلفة (ريال)</label>
                    <input type="number" min={0} step="0.01" value={data.total_amount} onChange={(e) => set({ total_amount: e.target.value })} />
                    {err('total_amount')}
                </div>
                <div>
                    <label style={label}>دعم الشركة (ريال)</label>
                    <input type="number" min={0} step="0.01" value={data.company_subsidy} onChange={(e) => set({ company_subsidy: e.target.value })} />
                    {err('company_subsidy')}
                </div>
            </div>

            <div style={row}>
                <div>
                    <label style={label}>عند وقوع الموعد في يوم حظر (إجازة/رمضان)</label>
                    <select value={data.blackout_behavior} onChange={(e) => set({ blackout_behavior: e.target.value as 'skip' | 'shift_week' })}>
                        <option value="skip">تخطي الفعالية (الافتراضي)</option>
                        <option value="shift_week">إزاحة أسبوعاً واحداً</option>
                    </select>
                </div>
                <div>
                    <label style={label}>إعادة الجدولة عند نقص العدد (أيام)</label>
                    <input type="number" min={1} max={28} value={data.reschedule_interval_days} onChange={(e) => set({ reschedule_interval_days: Math.min(28, Math.max(1, Number(e.target.value) || 7)) })} />
                    {err('reschedule_interval_days')}
                </div>
            </div>

            <div style={{ marginBottom: 10 }}>
                <label style={label}>ملاحظات (تُنسخ لكل فعالية مولّدة)</label>
                <input value={data.notes} onChange={(e) => set({ notes: e.target.value })} />
            </div>

            <button type="button" className="btn btn-primary" disabled={processing || !data.partner_id} onClick={() => onSubmit(data)}>
                {submitLabel}
            </button>
        </div>
    );
}

function UpcomingPreview({ rows }: { rows: TemplateOccurrencePreview[] }) {
    if (rows.length === 0) return null;

    return (
        <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(10,10,10,.6)', marginBottom: 6 }}>المواعيد القادمة (التوليد قبل 14 يوماً من كل موعد)</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {rows.map((row) => (
                    <span
                        key={row.pattern_date}
                        title={row.blackout_name ? `يقع في «${row.blackout_name}»` : undefined}
                        style={{
                            fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600,
                            background: row.action === 'skip_blackout' ? '#D9381E12' : row.shifted ? '#C87D0012' : '#2E7D3212',
                            color: row.action === 'skip_blackout' ? '#D9381E' : row.shifted ? '#C87D00' : '#0A0A0A',
                            textDecoration: row.action === 'skip_blackout' ? 'line-through' : 'none',
                            border: '1px solid rgba(0,0,0,.06)',
                        }}
                    >
                        {row.action === 'skip_blackout'
                            ? `${fmtDate(row.pattern_date)} — حظر: ${row.blackout_name ?? ''}`
                            : row.shifted
                                ? `${fmtDate(row.pattern_date)} ← ${fmtDate(row.effective_date!)} (إزاحة — ${row.blackout_name ?? 'حظر'})`
                                : fmtDate(row.pattern_date)}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function TemplateManager({ templates, partners, categories, manageUrl, eventUrlPrefix }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);
    // H §18: نافذة تأكيد موحّدة بدل نافذة المتصفح — الإيقاف يوقف التوليد فقط.
    const [pauseTarget, setPauseTarget] = useState<EventTemplate | null>(null);

    function confirmPause() {
        if (!pauseTarget) return;
        const id = pauseTarget.id;
        setPauseTarget(null);
        router.post(`${manageUrl}/${id}/pause`, {}, {
            onSuccess: () => toastr.success('أُوقف القالب'),
        });
    }
    const pageErrors = (usePage().props as { errors?: Record<string, string> }).errors ?? {};

    const emptyForm: TemplateFormData = {
        title: '', partner_id: '', activity_unit_id: '', category_id: '',
        recurrence_pattern: 'weekly', day_of_week: 0, day_of_month: 15,
        starts_from: '', start_time: '20:00', duration_minutes: 90,
        capacity: 10, min_participants: 4, total_amount: '0', company_subsidy: '0',
        blackout_behavior: 'skip', reschedule_interval_days: 7, notes: '',
    };

    const toPayload = (d: TemplateFormData) => ({
        title: d.title || null,
        partner_id: d.partner_id ? Number(d.partner_id) : null,
        activity_unit_id: d.activity_unit_id ? Number(d.activity_unit_id) : null,
        category_id: d.category_id ? Number(d.category_id) : null,
        recurrence_pattern: d.recurrence_pattern,
        day_of_week: d.recurrence_pattern === 'monthly' ? null : d.day_of_week,
        day_of_month: d.recurrence_pattern === 'monthly' ? d.day_of_month : null,
        starts_from: d.starts_from || null,
        start_time: d.start_time,
        duration_minutes: d.duration_minutes,
        capacity: d.capacity,
        min_participants: d.min_participants,
        total_amount: Number(d.total_amount) || 0,
        company_subsidy: Number(d.company_subsidy) || 0,
        blackout_behavior: d.blackout_behavior,
        reschedule_interval_days: d.reschedule_interval_days,
        notes: d.notes || null,
    });

    const submitCreate = (d: TemplateFormData) => {
        setProcessing(true);
        router.post(manageUrl, toPayload(d), {
            onSuccess: () => { setShowCreate(false); toastr.success('أُنشئ القالب — سيولّد فعالياته قبل 14 يوماً من كل موعد'); },
            onFinish: () => setProcessing(false),
        });
    };

    const submitUpdate = (template: EventTemplate) => (d: TemplateFormData) => {
        setProcessing(true);
        router.patch(`${manageUrl}/${template.id}`, toPayload(d), {
            onSuccess: () => { setEditingId(null); toastr.success('عُدّل القالب — يسري على ما سيُولَّد لاحقاً فقط'); },
            onFinish: () => setProcessing(false),
        });
    };

    const editInitial = (t: EventTemplate): TemplateFormData => ({
        title: t.title ?? '',
        partner_id: t.partner_id ? String(t.partner_id) : '',
        activity_unit_id: t.activity_unit_id ? String(t.activity_unit_id) : '',
        category_id: t.category_id ? String(t.category_id) : '',
        recurrence_pattern: t.recurrence_pattern,
        day_of_week: t.day_of_week ?? 0,
        day_of_month: t.day_of_month ?? 15,
        starts_from: '',
        start_time: (t.start_time || '20:00').slice(0, 5),
        duration_minutes: t.duration_minutes,
        capacity: t.capacity,
        min_participants: t.min_participants,
        total_amount: String(t.total_amount),
        company_subsidy: String(t.company_subsidy),
        blackout_behavior: t.blackout_behavior,
        reschedule_interval_days: t.reschedule_interval_days,
        notes: t.notes ?? '',
    });

    return (
        <div>
            {/* قواعد H §8 */}
            <div className="card" style={{ fontSize: 12, color: 'rgba(10,10,10,.6)', lineHeight: 1.9 }}>
                <b style={{ display: 'block', marginBottom: 2 }}>قواعد القوالب</b>
                تُولَّد كل فعالية تلقائياً قبل <b>14 يوماً</b> من موعدها · بداية الأسبوع <b>الأحد</b> · «شهرياً يوم 31» في شهر أقصر ينفَّذ آخر يوم ·
                إيقاف القالب يوقف <b>التوليد المستقبلي فقط</b> ولا يمس فعالية مولّدة · التعديل يسري على ما سيُولَّد لاحقاً فقط ·
                فعالية لا تبلغ حدها الأدنى عند إغلاق التسجيل تُعاد جدولتها <b>مرة واحدة</b> (+7 أيام) ثم تُلغى — بلا أي استقطاع.
            </div>

            {/* إنشاء */}
            {showCreate ? (
                <div className="card">
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>قالب جديد</div>
                    <TemplateForm
                        initial={emptyForm}
                        partners={partners}
                        categories={categories}
                        submitLabel="إنشاء القالب"
                        processing={processing}
                        errors={pageErrors}
                        onSubmit={submitCreate}
                    />
                    <button type="button" className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => setShowCreate(false)}>إلغاء</button>
                </div>
            ) : (
                <button type="button" className="card" style={{ width: '100%', textAlign: 'center', border: '2px dashed #F6F8F5', color: '#0A0A0A', fontWeight: 700, fontSize: 14, cursor: 'pointer', background: 'transparent' }} onClick={() => setShowCreate(true)}>
                    + قالب تكرار جديد
                </button>
            )}

            {/* القوالب */}
            {templates.length === 0 && !showCreate && (
                <div className="card" style={{ textAlign: 'center', color: 'rgba(10,10,10,.5)', fontSize: 13 }}>
                    لا قوالب بعد — القالب هو ما يجعل الفعاليات تحدث دون أن يتذكر أحد.
                </div>
            )}

            {templates.map((t) => (
                <div key={t.id} className="card" style={{ opacity: t.status === 'paused' ? 0.75 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <b style={{ fontSize: 15 }}>{t.title || `قالب #${t.id}`}</b>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: t.status === 'active' ? '#2E7D3218' : 'rgba(10,10,10,.09)', color: t.status === 'active' ? '#0A0A0A' : 'rgba(10,10,10,.58)' }}>
                            {t.status === 'active' ? 'نشط' : 'موقوف'}
                        </span>
                        <span style={{ fontSize: 12, color: 'rgba(10,10,10,.6)' }}>
                            {patternSummary(t)} · {fmtTime(t.start_time)} · {t.duration_minutes} دقيقة
                        </span>
                        <span style={{ marginRight: 'auto', display: 'flex', gap: 6 }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                style={{ fontSize: 12 }}
                                onClick={() => setEditingId(editingId === t.id ? null : t.id)}
                            >
                                {editingId === t.id ? 'إغلاق التعديل' : 'تعديل'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline"
                                style={{ fontSize: 12, color: t.status === 'active' ? '#D9381E' : '#0A0A0A', borderColor: t.status === 'active' ? '#D9381E44' : '#2E7D3244' }}
                                onClick={() => {
                                    if (t.status === 'active') {
                                        setPauseTarget(t);

                                        return;
                                    }
                                    router.post(`${manageUrl}/${t.id}/resume`, {}, {
                                        onSuccess: () => toastr.success('أُعيد تفعيل القالب'),
                                    });
                                }}
                            >
                                {t.status === 'active' ? 'إيقاف' : 'تفعيل'}
                            </button>
                        </span>
                    </div>

                    <div style={{ fontSize: 12, color: 'rgba(10,10,10,.55)', marginTop: 6 }}>
                        {t.partner ? `المزوّد: ${t.partner.trade_name || t.partner.name}` : 'بلا مزوّد'}
                        {t.activity_unit ? ` · الوحدة: ${t.activity_unit.name}` : ''}
                        {` · ${t.min_participants}–${t.capacity} مشاركاً`}
                        {` · حظر: ${t.blackout_behavior === 'skip' ? 'تخطٍ' : 'إزاحة أسبوع'}`}
                        {` · فعاليات مولّدة: ${t.events_count ?? 0}`}
                        {t.ends_on ? ` · ينتهي ${fmtDate(t.ends_on)}` : ''}
                    </div>

                    {editingId === t.id && (
                        <div style={{ marginTop: 12, borderTop: '1px solid rgba(0,0,0,.06)', paddingTop: 12 }}>
                            <div style={{ fontSize: 12, color: '#C87D00', marginBottom: 8 }}>
                                التعديل يسري على الفعاليات التي ستُولَّد لاحقاً فقط — المولّدة لا تتغيّر.
                            </div>
                            <TemplateForm
                                initial={editInitial(t)}
                                partners={partners}
                                categories={categories}
                                submitLabel="حفظ التعديل"
                                processing={processing}
                                errors={pageErrors}
                                onSubmit={submitUpdate(t)}
                            />
                        </div>
                    )}

                    {t.status === 'active' && <UpcomingPreview rows={t.upcoming ?? []} />}

                    {(t.generated_events?.length ?? 0) > 0 && (
                        <div style={{ marginTop: 10 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(10,10,10,.6)', marginBottom: 6 }}>آخر الفعاليات المولّدة</div>
                            {t.generated_events!.map((e) => (
                                <a key={e.id} href={`${eventUrlPrefix}${e.id}`} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, padding: '5px 0', borderBottom: '1px solid rgba(0,0,0,.04)', color: 'inherit', textDecoration: 'none' }}>
                                    <span>{fmtDate(e.event_date)} · {fmtTime(e.start_time)}</span>
                                    <span style={{ color: 'rgba(10,10,10,.55)' }}>{e.participants_count}/{e.min_participants}+</span>
                                    {(e.reschedule_attempt ?? 0) > 0 && <span style={{ color: '#C87D00' }}>أُعيدت جدولتها</span>}
                                    <span style={{ marginRight: 'auto', color: 'rgba(10,10,10,.6)' }}>{e.status}</span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            <ConfirmModal
                open={pauseTarget !== null}
                title="إيقاف قالب التكرار"
                message={
                    pauseTarget
                        ? `يتوقّف توليد فعاليات جديدة من هذا القالب من الآن فصاعداً. الفعاليات المولَّدة سابقاً (${pauseTarget.events_count ?? 0}) لا تُمس ولا تُلغى وتكمل دورتها كالمعتاد. تستطيع إعادة تفعيل القالب في أي وقت.`
                        : ''
                }
                confirmLabel="إيقاف القالب"
                onConfirm={confirmPause}
                onCancel={() => setPauseTarget(null)}
            />
        </div>
    );
}
