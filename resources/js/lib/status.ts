import type { BadgeTone } from '@/components/portal/ui';

/**
 * One Arabic vocabulary for every status the product shows.
 *
 * These strings arrive from the server as machine values (`pending`,
 * `cancelled_provider`, `awaiting_payment`). Left alone they render as raw
 * English in an Arabic RTL interface, which reads as a bug and, worse, hides
 * meaning: `cancelled_company` and `cancelled_provider` look identical at a
 * glance but carry completely different refund consequences.
 *
 * Every screen resolves through here so the same state never gets two
 * different names in two different places.
 */
export type StatusMeta = { label: string; tone: BadgeTone };

function lookup(map: Record<string, StatusMeta>) {
    return (value: string | null | undefined): StatusMeta =>
        value === null || value === undefined
            ? { label: '—', tone: 'neutral' }
            : (map[value] ?? { label: value, tone: 'neutral' });
}

/**
 * Mirrors `App\Enums\EventStatus::label()` word for word — all sixteen cases.
 *
 * The wording is copied rather than paraphrased because the server sends the
 * same labels through `status_label` on some payloads; two spellings of one
 * state ("مفتوحة للتسجيل" here, "التسجيل مفتوح" there) would read as two
 * different states to anyone comparing screens.
 *
 * Note the four distinct cancellations: who cancelled decides who is refunded,
 * so they are never collapsed into one «ملغاة».
 */
export const eventStatus = lookup({
    pending_approval: { label: 'بانتظار الاعتماد', tone: 'warning' },
    open: { label: 'مفتوحة للتسجيل', tone: 'lime' },
    rejected: { label: 'اقتراح مرفوض', tone: 'danger' },
    pending_provider: { label: 'بانتظار رد المزوّد', tone: 'warning' },
    provider_alternative: { label: 'وقت بديل مقترح', tone: 'warning' },
    booked: { label: 'محجوزة — التسجيل مفتوح', tone: 'lime' },
    awaiting_payment: { label: 'بانتظار الدفع', tone: 'warning' },
    confirmed: { label: 'مؤكدة', tone: 'success' },
    in_progress: { label: 'جارية الآن', tone: 'lime' },
    completed: { label: 'مكتملة', tone: 'success' },
    settled: { label: 'مسوّاة', tone: 'success' },
    expired: { label: 'منتهية دون اكتمال العدد', tone: 'neutral' },
    // أربعة إلغاءات مختلفة الأثر على الاسترداد — لا يُجمعن في واحد.
    cancelled_min_not_met: {
        label: 'ملغاة — لم يبلغ الحد الأدنى',
        tone: 'danger',
    },
    cancelled_provider: { label: 'ملغاة من المزوّد', tone: 'danger' },
    cancelled_company: { label: 'ملغاة من الشركة', tone: 'danger' },
    cancelled_payment_failed: { label: 'ملغاة — فشل التحصيل', tone: 'danger' },
});

export const companyStatus = lookup({
    pending: { label: 'طلب جديد', tone: 'warning' },
    review: { label: 'قيد المراجعة', tone: 'warning' },
    active: { label: 'مفعّلة', tone: 'success' },
    rejected: { label: 'مرفوضة', tone: 'danger' },
    suspended: { label: 'موقوفة', tone: 'danger' },
});

export const partnerStatus = lookup({
    pending: { label: 'طلب جديد', tone: 'warning' },
    active: { label: 'مفعّل', tone: 'success' },
    rejected: { label: 'مرفوض', tone: 'danger' },
    suspended: { label: 'موقوف', tone: 'danger' },
});

export const employeeStatus = lookup({
    active: { label: 'مفعّل', tone: 'success' },
    pending_verification: { label: 'بانتظار التفعيل', tone: 'warning' },
    invited: { label: 'مدعو', tone: 'warning' },
    inactive: { label: 'معطّل', tone: 'neutral' },
    banned: { label: 'محظور', tone: 'danger' },
});

export const invoiceStatus = lookup({
    draft: { label: 'مسودة', tone: 'neutral' },
    issued: { label: 'صادرة', tone: 'warning' },
    paid: { label: 'مسددة', tone: 'success' },
    overdue: { label: 'متأخرة', tone: 'danger' },
    blocked: { label: 'محجوبة', tone: 'danger' },
    void: { label: 'ملغاة', tone: 'neutral' },
});

export const settlementStatus = lookup({
    draft: { label: 'قيد الإعداد', tone: 'neutral' },
    approved: { label: 'معتمد — بانتظار التحويل', tone: 'warning' },
    paid: { label: 'حُوِّل', tone: 'success' },
});

export const settlementItemStatus = lookup({
    pending: { label: 'بانتظار الكشف', tone: 'neutral' },
    stated: { label: 'مُدرَج في كشف', tone: 'warning' },
    settled: { label: 'مسوّى', tone: 'success' },
    corrected: { label: 'مصحَّح', tone: 'warning' },
});

export const paymentIntentStatus = lookup({
    pending: { label: 'بانتظار السداد', tone: 'warning' },
    paid: { label: 'مسدَّدة', tone: 'success' },
    expired: { label: 'انتهت المهلة', tone: 'danger' },
    failed: { label: 'فشل الدفع', tone: 'danger' },
    refunded: { label: 'مستردة', tone: 'neutral' },
    cancelled: { label: 'ملغاة', tone: 'neutral' },
});

export const topupStatus = lookup({
    pending: { label: 'بانتظار المراجعة', tone: 'warning' },
    under_review: { label: 'قيد المراجعة', tone: 'neutral' },
    approved: { label: 'معتمد', tone: 'success' },
    rejected: { label: 'مرفوض', tone: 'danger' },
});

export const deliveryStatus = lookup({
    queued: { label: 'في الطابور', tone: 'neutral' },
    sent: { label: 'أُرسل', tone: 'success' },
    delivered: { label: 'وصل', tone: 'success' },
    deferred: { label: 'مؤجل', tone: 'warning' },
    failed: { label: 'فشل', tone: 'danger' },
    skipped: { label: 'تُخطّي', tone: 'neutral' },
});

export const attendanceStatus = lookup({
    attended: { label: 'حضر', tone: 'success' },
    absent: { label: 'غاب', tone: 'danger' },
    excused: { label: 'معذور', tone: 'warning' },
});

export const severity = lookup({
    info: { label: 'معلومة', tone: 'neutral' },
    warning: { label: 'تحذير', tone: 'warning' },
    critical: { label: 'حرج', tone: 'danger' },
});

/**
 * H §11 — حالات طلب المزوّد.
 *
 * `expired` is not a neutral outcome here the way it is for an event: a
 * request that expired is one the provider never answered, and it costs
 * reliability points exactly like a rejection would. The tone says so.
 */
export const providerRequestStatus = lookup({
    pending: { label: 'بانتظار ردّك', tone: 'warning' },
    accepted: { label: 'مقبول', tone: 'success' },
    rejected: { label: 'مرفوض', tone: 'danger' },
    alternative_proposed: { label: 'اقترحتَ وقتاً بديلاً', tone: 'lime' },
    expired: { label: 'انتهت المهلة دون ردّ', tone: 'danger' },
    cancelled: { label: 'ملغى بعد القبول', tone: 'danger' },
});

/**
 * H §11 — حالة الملعب.
 *
 * تعيش هنا لا في صفحة القائمة: كانت `VENUE_STATUS` مُصدَّرة من
 * `pages/partner/venues/index.tsx` وتستوردها صفحة التعديل، فصارت الصفحة
 * تبعيةً لصفحة أخرى — يطويها Rollup في حزمة مشتركة وتختفي من بيان Vite،
 * فيردّ `/partner/venues` خطأ خادم في أي نشر مبنيّ. صفحةٌ لا تُستورَد من صفحة.
 */
export const venueStatus = lookup({
    active: { label: 'متاح', tone: 'success' },
    maintenance: { label: 'تحت الصيانة', tone: 'warning' },
    closed: { label: 'مغلق', tone: 'neutral' },
});

/** H §19 — حالة تقرير المنسّق الشهري. */
export const coordinatorReportStatus = lookup({
    generated: { label: 'مولَّد — بانتظار التوصيات', tone: 'warning' },
    submitted: { label: 'مُرسَل للمراجعة', tone: 'warning' },
    delivered: { label: 'مُسلَّم للشركة', tone: 'success' },
});

/** H §16 — حالة الدوري الداخلي. */
export const leagueStatus = lookup({
    draft: { label: 'مسودة', tone: 'neutral' },
    active: { label: 'جارية', tone: 'success' },
    completed: { label: 'منتهية', tone: 'neutral' },
    cancelled: { label: 'ملغاة', tone: 'danger' },
});

/**
 * صيغة الدوري — نصّ بلا نبرة، فلا `lookup` له.
 *
 * تُقرأ في ثلاث شاشات: قائمة الشركة، وتفاصيل الدوري، وشاشة الموظف. اختلاف
 * الترجمة بين الثلاث يجعل الصيغة الواحدة تبدو ثلاث صيغ.
 */
export function leagueFormat(value: string | null | undefined): string {
    const formats: Record<string, string> = {
        single_round_robin: 'دوري من دور واحد',
        double_round_robin: 'دوري من دورين',
        knockout: 'خروج المغلوب',
    };

    return value ? (formats[value] ?? value) : '—';
}
