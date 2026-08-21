import PartnerLayout from '@/layouts/partner-layout';
import TimePicker from '@/components/time-picker';
import type { ProviderRequest } from '@/types/models';
import { fmtDate, fmtTime, fmtDateTime } from '@/lib/utils';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';

interface Props {
    request: ProviderRequest;
    can_decide: boolean;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'بانتظار قرارك', color: '#B8860A' },
    accepted: { label: 'مقبول', color: '#1A7A4A' },
    rejected: { label: 'مرفوض', color: '#C8410A' },
    alternative_proposed: { label: 'وقت بديل مقترح', color: '#1A5FAB' },
    expired: { label: 'انتهت المهلة', color: '#8A7868' },
    cancelled: { label: 'ملغى بعد القبول', color: '#C8410A' },
};

export default function ProviderRequestDecision({ request, can_decide }: Props) {
    const [mode, setMode] = useState<'none' | 'reject' | 'alternative' | 'cancel'>('none');

    const rejectForm = useForm({ reason: '' });
    const cancelForm = useForm({ reason: '', stale_availability: false as boolean });
    const altForm = useForm({ proposed_date: '', proposed_start_time: '', notes: '' });

    const st = statusLabels[request.status] ?? { label: request.status, color: '#8A7868' };
    const deadlinePassed = request.deadline_at ? new Date(request.deadline_at).getTime() < Date.now() : false;

    const accept = () => {
        router.post(`/partner/requests-queue/${request.id}/accept`, {}, {
            onSuccess: () => toastr.success('قُبل الطلب وحُجزت الوحدة في تقويم المنصة'),
        });
    };

    return (
        <PartnerLayout>
            <Head title={`قرار الطلب #${request.id}`} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800 }}>صفحة قرار الطلب #{request.id}</h1>
                <span className="badge" style={{ background: `${st.color}18`, color: st.color, fontSize: 13 }}>{st.label}</span>
            </div>

            {/* القاعدة الذهبية */}
            <div className="card" style={{ borderRight: '4px solid #C8410A', marginBottom: 16, fontSize: 13, color: '#6A5C48' }}>
                <b>لا يُعتد بقبول عبر واتساب إطلاقاً.</b> هذه الصفحة هي القناة المعتمدة الوحيدة — أول قرار رقمي هنا يثبّت
                الحالة، وأي رد لاحق يُرفض برسالة «تم اتخاذ القرار مسبقاً». الرفض السريع أقل ضرراً من التأخر، وأقل بمراحل من
                الإلغاء بعد القبول (−15 على مؤشرك).
            </div>

            {/* تفاصيل الطلب — الخصوصية: عدد المشاركين لا أسماؤهم */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>
                    {request.event?.company_name} — مجتمع {request.event?.community_name}
                </div>
                <div className="req-grid">
                    <div className="ri"><div className="rl">📅 التاريخ</div><div className="rv">{fmtDate(request.requested_date)}</div></div>
                    <div className="ri"><div className="rl">🕐 الوقت</div><div className="rv">{fmtTime(request.start_time)} · {request.duration_minutes} دقيقة</div></div>
                    <div className="ri"><div className="rl">🏟️ الوحدة المطلوبة</div><div className="rv">{request.unit?.name ?? '—'} × {request.quantity}</div></div>
                    <div className="ri"><div className="rl">👥 عدد المشاركين</div><div className="rv">{request.frozen_participants_count ?? request.event?.participants_count ?? '—'}{request.frozen_participants_count ? ' (مثبَّت عند الإرسال — لن يتغير)' : ''}</div></div>
                    <div className="ri"><div className="rl">💰 الإجمالي (كمية نهائية)</div><div className="rv" style={{ color: '#1A7A4A', fontSize: 16 }}>{Number(request.total_amount ?? 0).toLocaleString()} ريال</div></div>
                    <div className="ri"><div className="rl">⏳ مهلة الرد</div><div className="rv" style={{ color: deadlinePassed ? '#C8410A' : '#B8860A' }}>{request.deadline_at ? fmtDateTime(request.deadline_at) : '—'}{deadlinePassed && request.status === 'pending' ? ' (تجاوزت المهلة — الرد الآن متأخر)' : ''}</div></div>
                </div>

                <div style={{ background: 'rgba(26,95,171,.06)', borderRadius: 10, padding: '10px 14px', marginTop: 12, fontSize: 13 }}>
                    <b>جهة الاتصال (منشئ الفعالية):</b> {request.event?.creator_name ?? '—'}
                    {request.event?.creator_phone ? ` · ${request.event.creator_phone}` : ''}
                    <div style={{ fontSize: 11, color: '#8A7868', marginTop: 4 }}>لا تظهر لك أسماء المشاركين ولا أرقامهم — عددهم فقط.</div>
                </div>

                {request.rejection_reason && (
                    <div style={{ marginTop: 10, fontSize: 13, color: '#C8410A' }}>سبب الرفض: {request.rejection_reason}</div>
                )}
                {request.cancellation_reason && (
                    <div style={{ marginTop: 10, fontSize: 13, color: '#C8410A' }}>سبب الإلغاء: {request.cancellation_reason}</div>
                )}
            </div>

            {/* الإجراءات */}
            {can_decide && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className="act-btn" style={{ flex: 1, background: '#1A7A4A', color: '#fff', borderColor: '#1A7A4A', padding: '12px', borderRadius: 10, fontWeight: 800 }} onClick={accept}>
                            ✓ قبول — يحجز الوحدة فوراً
                        </button>
                        <button className="act-btn" style={{ flex: 1, background: '#C8410A18', color: '#C8410A', borderColor: '#C8410A', padding: '12px', borderRadius: 10, fontWeight: 800 }} onClick={() => setMode(mode === 'reject' ? 'none' : 'reject')}>
                            ✕ رفض
                        </button>
                        <button className="act-btn" style={{ flex: 1, background: '#1A5FAB18', color: '#1A5FAB', borderColor: '#1A5FAB', padding: '12px', borderRadius: 10, fontWeight: 800 }} onClick={() => setMode(mode === 'alternative' ? 'none' : 'alternative')}>
                            ⏱ اقتراح وقت بديل
                        </button>
                    </div>

                    {mode === 'reject' && (
                        <div style={{ marginTop: 14 }}>
                            <label style={{ fontSize: 13, fontWeight: 700 }}>سبب الرفض (إلزامي)</label>
                            <input value={rejectForm.data.reason} onChange={(e) => rejectForm.setData('reason', e.target.value)} style={{ width: '100%', marginTop: 6 }} />
                            {rejectForm.errors.reason && <div style={{ fontSize: 11, color: '#C8410A', marginTop: 4 }}>{rejectForm.errors.reason}</div>}
                            <button
                                className="act-btn"
                                style={{ marginTop: 10, background: '#C8410A', color: '#fff', borderColor: '#C8410A', padding: '10px 20px', borderRadius: 8 }}
                                disabled={rejectForm.processing || !rejectForm.data.reason}
                                onClick={() => rejectForm.post(`/partner/requests-queue/${request.id}/reject`, { onSuccess: () => { setMode('none'); toastr.success('رُفض الطلب'); } })}
                            >
                                تأكيد الرفض
                            </button>
                        </div>
                    )}

                    {mode === 'alternative' && (
                        <div style={{ marginTop: 14 }}>
                            <div className="frow">
                                <div className="fg">
                                    <label>التاريخ البديل</label>
                                    <input type="date" value={altForm.data.proposed_date} onChange={(e) => altForm.setData('proposed_date', e.target.value)} />
                                    {altForm.errors.proposed_date && <div style={{ fontSize: 11, color: '#C8410A', marginTop: 4 }}>{altForm.errors.proposed_date}</div>}
                                </div>
                                <div className="fg">
                                    <label>وقت البداية</label>
                                    <TimePicker value={altForm.data.proposed_start_time} onChange={(v) => altForm.setData('proposed_start_time', v)} />
                                    {altForm.errors.proposed_start_time && <div style={{ fontSize: 11, color: '#C8410A', marginTop: 4 }}>{altForm.errors.proposed_start_time}</div>}
                                </div>
                            </div>
                            <div className="fg" style={{ marginTop: 8 }}>
                                <label>ملاحظات</label>
                                <input value={altForm.data.notes} onChange={(e) => altForm.setData('notes', e.target.value)} />
                            </div>
                            <button
                                className="act-btn"
                                style={{ marginTop: 10, background: '#1A5FAB', color: '#fff', borderColor: '#1A5FAB', padding: '10px 20px', borderRadius: 8 }}
                                disabled={altForm.processing || !altForm.data.proposed_date || !altForm.data.proposed_start_time}
                                onClick={() => altForm.post(`/partner/requests-queue/${request.id}/propose-alternative`, { onSuccess: () => { setMode('none'); toastr.success('أُرسل اقتراح الوقت البديل'); } })}
                            >
                                إرسال الاقتراح — مهلة رد المنشئ 12 ساعة
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* إلغاء بعد القبول */}
            {request.status === 'accepted' && (
                <div className="card" style={{ borderRight: '4px solid #C8410A' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#C8410A', marginBottom: 8 }}>إلغاء الحجز بعد القبول</div>
                    <div style={{ fontSize: 12, color: '#8A7868', marginBottom: 10 }}>
                        الإلغاء بعد القبول: −15 على مؤشر موثوقيتك، استرداد كامل للمجتمع، وتُطبَّق سياسة إلغاء المزوّد في عقدك.
                        إن كان السبب حجزاً خارجياً لم تسجّله، حدّد ذلك — التبعة عليك في الحالين.
                    </div>
                    {mode !== 'cancel' ? (
                        <button className="act-btn" style={{ background: '#C8410A18', color: '#C8410A', borderColor: '#C8410A', padding: '10px 18px', borderRadius: 8 }} onClick={() => setMode('cancel')}>
                            أريد الإلغاء
                        </button>
                    ) : (
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 700 }}>سبب الإلغاء (إلزامي)</label>
                            <input value={cancelForm.data.reason} onChange={(e) => cancelForm.setData('reason', e.target.value)} style={{ width: '100%', marginTop: 6 }} />
                            {cancelForm.errors.reason && <div style={{ fontSize: 11, color: '#C8410A', marginTop: 4 }}>{cancelForm.errors.reason}</div>}
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginTop: 10 }}>
                                <input type="checkbox" checked={cancelForm.data.stale_availability} onChange={(e) => cancelForm.setData('stale_availability', e.target.checked)} />
                                السبب حجز خارجي لم أسجّله في التقويم (تعارض توفر)
                            </label>
                            <button
                                className="act-btn"
                                style={{ marginTop: 10, background: '#C8410A', color: '#fff', borderColor: '#C8410A', padding: '10px 20px', borderRadius: 8 }}
                                disabled={cancelForm.processing || !cancelForm.data.reason}
                                onClick={() => cancelForm.post(`/partner/requests-queue/${request.id}/cancel`, { onSuccess: () => { setMode('none'); toastr.success('أُلغي الحجز'); } })}
                            >
                                تأكيد الإلغاء (−15 على المؤشر)
                            </button>
                        </div>
                    )}
                </div>
            )}
        </PartnerLayout>
    );
}
