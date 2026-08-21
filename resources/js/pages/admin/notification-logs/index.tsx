import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import ListStates from '@/components/list-states';
import Pagination from '@/components/pagination';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AdminLayout from '@/layouts/admin-layout';
import { fmtDate } from '@/lib/utils';
import type { NotificationLog, PaginatedResult } from '@/types/models';

interface Props {
    logs: PaginatedResult<NotificationLog>;
    statuses: { value: string; label: string }[];
    channels: string[];
    stats: { total: number; failed: number; deferred: number; delivered: number };
    filters: {
        search?: string;
        status?: string;
        channel?: string;
        template_key?: string;
        recipient_type?: string;
        recipient_id?: string;
    };
}

const STATUS_COLORS: Record<string, string> = {
    queued: '#6B7A99',
    deferred: '#E0B040',
    sent: '#4A9DE0',
    delivered: '#009E82',
    failed: '#E03050',
    skipped: '#6B7A99',
};

const CHANNEL_LABELS: Record<string, string> = {
    whatsapp: 'واتساب',
    sms: 'رسالة نصية',
    in_app: 'داخل المنصة',
    mail: 'بريد',
    log: 'سجل التطوير',
    fake: 'قناة اختبار',
};

const REASON_LABELS: Record<string, string> = {
    opted_out: 'أوقفه المستخدم (اختياري)',
    not_configured: 'القناة غير مهيأة',
    template_missing: 'القالب غير موجود — نص احتياطي',
    no_delivery_confirmation: 'لا تأكيد تسليم خلال المهلة',
    no_phone: 'لا رقم جوال — تحوّل للبريد',
    no_phone_no_email: 'لا رقم ولا بريد',
    retryable: 'فشل قابل لإعادة المحاولة',
    hard_failure: 'فشل نهائي على القناة',
    mail_failed: 'فشل إرسال البريد',
    otp_fallback: 'قناة بديلة لرمز الدخول',
    unknown_channel: 'قناة غير معروفة',
};

function StatusBadge({ status, label }: { status: string; label: string }) {
    const color = STATUS_COLORS[status] ?? '#6B7A99';

    return (
        <span
            style={{
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                color,
                background: `${color}1F`,
                whiteSpace: 'nowrap',
            }}
        >
            {label}
        </span>
    );
}

export default function NotificationLogsIndex({ logs, statuses, channels, stats, filters }: Props) {
    const [search, setSearch] = useDebouncedSearch(filters?.search ?? '', {
        status: filters?.status,
        channel: filters?.channel,
        template_key: filters?.template_key,
    });
    const [detail, setDetail] = useState<NotificationLog | null>(null);
    const [resendPhone, setResendPhone] = useState<string | null>(null);

    function confirmResendOtp() {
        const phone = resendPhone;
        setResendPhone(null);
        if (!phone) return;
        router.post('/admin/support-console/otp/resend', { phone }, { preserveScroll: true });
    }

    const statusLabel = (value: string) => statuses.find((s) => s.value === value)?.label ?? value;

    function filterBy(key: 'status' | 'channel', value: string) {
        router.get(
            '/admin/notification-logs',
            {
                search: filters?.search || undefined,
                status: key === 'status' ? value || undefined : filters?.status || undefined,
                channel: key === 'channel' ? value || undefined : filters?.channel || undefined,
                template_key: filters?.template_key || undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    const controlStyle = {
        padding: '9px 14px',
        background: '#161B27',
        border: '1px solid #232A3E',
        borderRadius: 10,
        fontSize: 13,
        color: '#E8EAF0',
        outline: 'none',
        direction: 'rtl' as const,
        fontFamily: 'inherit',
    };

    return (
        <AdminLayout>
            <Head title="سجل الإشعارات" />

            <div style={{ marginBottom: 4 }}>
                <div className="page-title">سجل الإشعارات</div>
            </div>
            <div className="page-sub">
                {stats.total} محاولة — {stats.delivered} سُلّمت، {stats.failed} فشلت، {stats.deferred} مؤجَّلة. ابحث برقم
                الجوال أولاً في أي شكوى «ما وصلني شيء».
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="رقم الجوال أو مفتاح القالب أو نص الرسالة..."
                    style={{ ...controlStyle, minWidth: 260 }}
                />
                <select value={filters?.status ?? ''} onChange={(e) => filterBy('status', e.target.value)} style={controlStyle}>
                    <option value="">كل الحالات</option>
                    {statuses.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
                <select value={filters?.channel ?? ''} onChange={(e) => filterBy('channel', e.target.value)} style={controlStyle}>
                    <option value="">كل القنوات</option>
                    {channels.map((c) => (
                        <option key={c} value={c}>
                            {CHANNEL_LABELS[c] ?? c}
                        </option>
                    ))}
                </select>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>المستلم</th>
                                <th>القالب</th>
                                <th>القناة</th>
                                <th>المحاولة</th>
                                <th>الحالة</th>
                                <th>الوقت</th>
                                <th>إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ListStates
                                count={logs.data.length}
                                columns={7}
                                emptyTitle="لا توجد سجلات مطابقة"
                                emptyHint="لا سجل إرسال مطابق للبحث والفلاتر الحالية."
                            />
                            {logs.data.map((log) => (
                                <tr key={log.id}>
                                    <td style={{ direction: 'ltr', textAlign: 'right', fontSize: 13, color: '#C8D0E0' }}>
                                        {log.recipient_phone ?? '—'}
                                    </td>
                                    <td style={{ direction: 'ltr', textAlign: 'right', fontSize: 12, color: '#6B7A99' }}>
                                        {log.template_key ?? '—'}
                                    </td>
                                    <td style={{ fontSize: 13, color: '#C8D0E0' }}>
                                        {CHANNEL_LABELS[log.channel] ?? log.channel}
                                    </td>
                                    <td style={{ fontSize: 13, color: '#C8D0E0' }}>{log.attempt}</td>
                                    <td>
                                        <StatusBadge status={log.status} label={statusLabel(log.status)} />
                                    </td>
                                    <td style={{ fontSize: 12, color: '#6B7A99' }}>{fmtDate(log.created_at)}</td>
                                    <td>
                                        <button onClick={() => setDetail(log)} className="act-btn btn-view">
                                            عرض
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={logs.links} />

            {detail && (
                <div className="detail-overlay open" onClick={() => setDetail(null)}>
                    <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            محاولة تسليم
                            <StatusBadge status={detail.status} label={statusLabel(detail.status)} />
                        </h3>

                        <div style={{ display: 'grid', gap: 10, marginTop: 16, fontSize: 13 }}>
                            <div>
                                <span style={{ color: '#6B7A99' }}>القالب: </span>
                                <span style={{ direction: 'ltr', unicodeBidi: 'embed', color: '#C8D0E0' }}>
                                    {detail.template_key ?? '—'}
                                </span>
                            </div>
                            <div>
                                <span style={{ color: '#6B7A99' }}>المستلم: </span>
                                <span style={{ direction: 'ltr', unicodeBidi: 'embed', color: '#C8D0E0' }}>
                                    {detail.recipient_phone ?? '—'} {detail.recipient_type ? `(${detail.recipient_type}#${detail.recipient_id})` : ''}
                                </span>
                            </div>
                            <div>
                                <span style={{ color: '#6B7A99' }}>القناة والمحاولة: </span>
                                <span style={{ color: '#C8D0E0' }}>
                                    {CHANNEL_LABELS[detail.channel] ?? detail.channel} — محاولة {detail.attempt}
                                </span>
                            </div>
                            {detail.reason && (
                                <div>
                                    <span style={{ color: '#6B7A99' }}>السبب: </span>
                                    <span style={{ color: '#C8D0E0' }}>{REASON_LABELS[detail.reason] ?? detail.reason}</span>
                                </div>
                            )}
                            {detail.provider_message_id && (
                                <div>
                                    <span style={{ color: '#6B7A99' }}>معرّف المزوّد: </span>
                                    <span style={{ direction: 'ltr', unicodeBidi: 'embed', color: '#C8D0E0' }}>
                                        {detail.provider_message_id}
                                    </span>
                                </div>
                            )}
                        </div>

                        {detail.recipient_phone && (
                            <div
                                style={{
                                    marginTop: 16,
                                    padding: 14,
                                    background: '#161B27',
                                    border: '1px solid #232A3E',
                                    borderRadius: 10,
                                }}
                            >
                                {/* A15 — G (وكيل الدعم): «إعادة إرسال دعوة أو رمز
                                    ضمن الحدود المسموحة (٣ طلبات في الساعة للرقم
                                    الواحد)». A14 بنى السجل وترك الأزرار. */}
                                <div style={{ fontSize: 12, color: '#6B7A99', marginBottom: 8 }}>
                                    تدخّل الدعم — ضمن الحدود المسموحة
                                </div>
                                <button className="act-btn btn-view" onClick={() => setResendPhone(detail.recipient_phone ?? null)}>
                                    إعادة إرسال رمز دخول لهذا الرقم
                                </button>
                                <div style={{ fontSize: 11, color: '#6B7A99', marginTop: 8, lineHeight: 1.8 }}>
                                    لإعادة إرسال دعوة موظف استخدم «مركز الدعم» — الحد ٣ طلبات في الساعة للرقم الواحد مفروض في
                                    النظام لا في الإجراء.
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gap: 6, marginTop: 16, fontSize: 12, color: '#6B7A99' }}>
                            <div>في الطابور: {detail.queued_at ? fmtDate(detail.queued_at) : '—'}</div>
                            {detail.deferred_until && <div>مؤجَّلة حتى: {fmtDate(detail.deferred_until)}</div>}
                            <div>أُرسلت: {detail.sent_at ? fmtDate(detail.sent_at) : '—'}</div>
                            <div>سُلّمت: {detail.delivered_at ? fmtDate(detail.delivered_at) : '—'}</div>
                            {detail.failed_at && <div>فشلت: {fmtDate(detail.failed_at)}</div>}
                        </div>

                        {detail.variables && Object.keys(detail.variables).length > 0 && (
                            <div
                                style={{
                                    marginTop: 16,
                                    padding: 14,
                                    background: '#161B27',
                                    border: '1px solid #232A3E',
                                    borderRadius: 10,
                                    fontSize: 12,
                                    color: '#C8D0E0',
                                }}
                            >
                                <div style={{ color: '#6B7A99', marginBottom: 6 }}>المتحوّلات</div>
                                {Object.entries(detail.variables).map(([key, value]) => (
                                    <div key={key}>
                                        <span style={{ direction: 'ltr', unicodeBidi: 'embed', color: '#6B7A99' }}>{key}</span>
                                        {': '}
                                        {String(value)}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div
                            style={{
                                marginTop: 16,
                                padding: 14,
                                background: '#161B27',
                                border: '1px solid #232A3E',
                                borderRadius: 10,
                                fontSize: 14,
                                color: '#E8EAF0',
                                lineHeight: 1.9,
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {detail.rendered_body ?? 'النص محجوب — رموز الدخول لا تُخزَّن في السجل.'}
                        </div>

                        {detail.error && (
                            <div
                                style={{
                                    marginTop: 12,
                                    padding: 12,
                                    background: 'rgba(224,48,80,0.12)',
                                    borderRadius: 10,
                                    fontSize: 12,
                                    color: '#E03050',
                                    direction: 'ltr',
                                    textAlign: 'right',
                                }}
                            >
                                {detail.error}
                            </div>
                        )}

                        {detail.recipient_type && detail.recipient_id && (
                            <div style={{ marginTop: 20 }}>
                                <button
                                    className="act-btn btn-view"
                                    onClick={() =>
                                        router.get('/admin/notification-logs', {
                                            recipient_type: detail.recipient_type ?? undefined,
                                            recipient_id: detail.recipient_id ?? undefined,
                                        })
                                    }
                                >
                                    كل رسائل هذا المستلم
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        <ConfirmModal
                open={resendPhone !== null}
                title="إعادة إرسال رمز الدخول"
                message={`سيُرسل رمز دخول جديد إلى ${resendPhone ?? ''} ويُلغى أي رمز سابق لم يُستخدم. الحد ٣ طلبات في الساعة لنفس الرقم — إن تجاوزته سيرفض النظام الطلب. تُسجَّل العملية في سجل التدقيق باسمك.`}
                confirmLabel="إرسال"
                onConfirm={confirmResendOtp}
                onCancel={() => setResendPhone(null)}
            />

        </AdminLayout>
    );
}
