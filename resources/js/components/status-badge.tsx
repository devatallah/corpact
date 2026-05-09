const statusLabels: Record<string, string> = {
    active: 'نشط',
    pending: 'قيد المراجعة',
    approved: 'مقبول',
    rejected: 'مرفوض',
    review: 'مراجعة',
    open: 'مفتوح',
    waiting_club: 'بانتظار النادي',
    confirmed: 'مؤكد',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    inactive: 'غير نشط',
    maintenance: 'صيانة',
    paid: 'مدفوع',
    unpaid: 'غير مدفوع',
    joined: 'منضم',
    full: 'مكتمل',
    alternative_proposed: 'بديل مقترح',
    suspended: 'معلّق',
};

export default function StatusBadge({ status }: { status: string }) {
    const label = statusLabels[status] ?? status;
    return <span className={`badge b-${status}`}>{label}</span>;
}
