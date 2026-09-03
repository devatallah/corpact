const statusLabels: Record<string, string> = {
    active: 'نشط',
    pending: 'قيد المراجعة',
    approved: 'مقبول',
    rejected: 'مرفوض',
    review: 'مراجعة',
    // آلة حالات الفعالية (H §9 — A7)
    pending_approval: 'بانتظار الاعتماد',
    open: 'مفتوح',
    pending_provider: 'بانتظار رد المزوّد',
    provider_alternative: 'وقت بديل مقترح',
    booked: 'محجوزة — التسجيل مفتوح',
    awaiting_payment: 'بانتظار الدفع',
    confirmed: 'مؤكد',
    in_progress: 'جارية الآن',
    completed: 'مكتمل',
    settled: 'مسوّاة',
    expired: 'منتهية دون اكتمال العدد',
    cancelled_min_not_met: 'ملغاة — لم يبلغ الحد الأدنى',
    cancelled_provider: 'ملغاة من المزوّد',
    cancelled_company: 'ملغاة من الشركة',
    cancelled_payment_failed: 'ملغاة — فشل التحصيل',
    cancelled: 'ملغي',
    inactive: 'غير نشط',
    dormant: 'خامل',
    closed: 'مغلق',
    maintenance: 'صيانة',
    paid: 'مدفوع',
    unpaid: 'غير مدفوع',
    // كشف التسوية وفاتورة رسوم النظام (H §12.7/§12.8 — A11)
    draft: 'مسودة',
    issued: 'مُصدَرة',
    void: 'ملغاة',
    included: 'ضمن كشف',
    disputed: 'معترض عليه',
    adjusted: 'مُصحَّح',
    provisional: 'مبدئية',
    real: 'نهائية',
    // حقول المشارك الثلاثة (H §10 — A7)
    reserved: 'محجوز',
    waitlisted: 'قائمة الانتظار',
    released: 'أُخلي المقعد',
    not_due: 'غير مستحق',
    due: 'مستحق',
    failed: 'فشل الدفع',
    refunded: 'مسترد',
    attended: 'حاضر',
    absent: 'غائب',
    suspended: 'معلّق',
};

/**
 * Tone per status. The label map above is the vocabulary; this decides only
 * how a state reads at a glance — settled/positive, in-flight, or failed.
 */
const positive = new Set([
    "active", "approved", "booked", "confirmed", "completed", "settled", "paid",
    "attended", "real", "issued", "included", "reserved",
]);
const inFlight = new Set([
    "pending", "pending_approval", "pending_provider", "awaiting_payment", "review",
    "provider_alternative", "draft", "provisional", "due", "waitlisted", "in_progress",
    "open", "maintenance", "adjusted",
]);
const negative = new Set([
    "rejected", "expired", "failed", "absent", "void", "disputed", "suspended", "unpaid",
    "cancelled", "cancelled_min_not_met", "cancelled_provider", "cancelled_company",
    "cancelled_payment_failed",
]);

const TONES: Record<string, string> = {
    positive: "bg-emerald-50 text-emerald-800 border-emerald-200",
    inFlight: "bg-[#FEF08A] text-[#C87D00] border-[#C87D00]/20",
    negative: "bg-[#FDEDEC] text-[#D9381E] border-[#D9381E]/20",
    neutral: "bg-[#F6F8F5] text-[#0A0A0A]/70 border-[#0A0A0A]/10",
};

function toneFor(status: string) {
    if (positive.has(status)) return TONES.positive;
    if (inFlight.has(status)) return TONES.inFlight;
    if (negative.has(status)) return TONES.negative;
    return TONES.neutral;
}

export default function StatusBadge({ status }: { status: string }) {
    const label = statusLabels[status] ?? status;
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border-[0.5px] text-[11px] font-bold font-arabic whitespace-nowrap select-none ${toneFor(status)}`}
        >
            {label}
        </span>
    );
}
