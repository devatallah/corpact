import PartnerLayout from '@/layouts/partner-layout';
import FilterTabs from '@/components/filter-tabs';
import Pagination from '@/components/pagination';
import type { PaginatedResult } from '@/types/models';
import type { ProviderRequest } from '@/types/models';
import { fmtDate, fmtTime, fmtDateTime } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

interface Props {
    requests: PaginatedResult<ProviderRequest>;
    filters: { status?: string };
    pendingCount: number;
}

const statusFilters = [
    { label: 'الكل', value: '' },
    { label: 'بانتظار الرد', value: 'pending' },
    { label: 'مقبول', value: 'accepted' },
    { label: 'مرفوض', value: 'rejected' },
    { label: 'وقت بديل', value: 'alternative_proposed' },
    { label: 'منتهي المهلة', value: 'expired' },
    { label: 'ملغى', value: 'cancelled' },
];

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'بانتظار الرد', color: '#B8860A' },
    accepted: { label: 'مقبول', color: '#1A7A4A' },
    rejected: { label: 'مرفوض', color: '#C8410A' },
    alternative_proposed: { label: 'وقت بديل مقترح', color: '#1A5FAB' },
    expired: { label: 'انتهت المهلة', color: '#8A7868' },
    cancelled: { label: 'ملغى بعد القبول', color: '#C8410A' },
};

function deadlineText(request: ProviderRequest): string {
    if (request.status !== 'pending' || !request.deadline_at) return '';
    const remaining = new Date(request.deadline_at).getTime() - Date.now();
    if (remaining <= 0) return 'انتهت المهلة';
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    return `المتبقي للرد: ${hours} س ${minutes} د`;
}

export default function ProviderRequestsQueue({ requests, filters, pendingCount }: Props) {
    return (
        <PartnerLayout>
            <Head title="طلبات الحجز" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800 }}>قائمة طلبات الحجز {pendingCount > 0 && <span className="badge" style={{ background: '#B8860A18', color: '#B8860A' }}>{pendingCount} بانتظار الرد</span>}</h1>
            </div>

            <div className="card" style={{ marginBottom: 16, borderRight: '4px solid #B8860A', fontSize: 13, color: '#6A5C48' }}>
                لوحة المزوّد هي القناة المعتمدة الوحيدة للقرار. رسالة واتساب نصية («تمام محجوز») لا تحجز شيئاً ولا تُلزم أحداً —
                أول قرار من هنا يثبّت الحالة، ومهلتك 12 ساعة أو حتى 6 ساعات قبل الموعد أيهما أقرب.
            </div>

            <FilterTabs options={statusFilters} current={filters.status ?? ''} />

            {requests.data.length === 0 && (
                <div className="card" style={{ textAlign: 'center', color: '#8A7868', padding: 40 }}>لا توجد طلبات.</div>
            )}

            {requests.data.map((request) => {
                const st = statusLabels[request.status] ?? { label: request.status, color: '#8A7868' };
                return (
                    <div key={request.id} className="card" style={{ borderRight: `4px solid ${st.color}`, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>
                                    {request.event?.company_name} — {request.event?.community_name}
                                </div>
                                <div style={{ fontSize: 12, color: '#8A7868' }}>
                                    أُرسل: {request.sent_at ? fmtDateTime(request.sent_at) : '—'}
                                </div>
                            </div>
                            <span className="badge" style={{ background: `${st.color}18`, color: st.color }}>{st.label}</span>
                        </div>

                        <div className="req-grid" style={{ marginTop: 12 }}>
                            <div className="ri"><div className="rl">📅 التاريخ</div><div className="rv">{fmtDate(request.requested_date)}</div></div>
                            <div className="ri"><div className="rl">🕐 الوقت</div><div className="rv">{fmtTime(request.start_time)} · {request.duration_minutes} دقيقة</div></div>
                            <div className="ri"><div className="rl">🏟️ الوحدة</div><div className="rv">{request.unit?.name ?? '—'} × {request.quantity}</div></div>
                            <div className="ri"><div className="rl">👥 المشاركون</div><div className="rv">{request.frozen_participants_count ?? request.event?.participants_count ?? '—'}{request.frozen_participants_count ? ' (مثبَّت)' : ''}</div></div>
                            <div className="ri"><div className="rl">💰 الإجمالي</div><div className="rv" style={{ color: '#1A7A4A' }}>{Number(request.total_amount ?? 0).toLocaleString()} ريال</div></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: request.status === 'pending' ? '#B8860A' : '#8A7868' }}>
                                {deadlineText(request)}
                            </span>
                            <Link href={`/partner/requests-queue/${request.id}`} className="act-btn" style={{ background: '#1A5FAB', color: '#fff', borderColor: '#1A5FAB', padding: '8px 18px', borderRadius: 8, fontSize: 13 }}>
                                صفحة القرار
                            </Link>
                        </div>
                    </div>
                );
            })}

            <Pagination links={requests.links} />
        </PartnerLayout>
    );
}
