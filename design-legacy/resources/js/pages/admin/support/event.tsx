import { BackLink, ListState } from '@/components/list-states';
import AdminLayout from '@/layouts/admin-layout';
import { fmtDateTime } from '@/lib/utils';
import { Head } from '@inertiajs/react';

/**
 * G — «قراءة سجل حالات أي فعالية»، و H §9 القاعدة 2: السجل يُقرأ **قبل** أي
 * تدخل يدوي. الشاشة قراءة محضة: لا زر يغيّر حالة، والتصعيد مكتوب.
 */

interface Props {
    event: {
        id: number;
        title: string;
        status: string;
        event_date: string | null;
        start_time: string | null;
        capacity: number | null;
        min_participants: number | null;
        participants_count: number | null;
        company: { id: number; name: string } | null;
        community: { id: number; name: string } | null;
        partner: { id: number; name: string } | null;
    };
    statusHistory: {
        id: number;
        from_status: string | null;
        to_status: string;
        is_manual: boolean;
        reason: string | null;
        actor_id: number | null;
        created_at: string | null;
    }[];
    notificationLogs: {
        id: number;
        template_key: string;
        channel: string;
        status: string;
        reason: string | null;
        created_at: string | null;
    }[];
    escalation: { action: string; label: string; role: string }[];
}

export default function SupportEvent({ event, statusHistory, notificationLogs, escalation }: Props) {
    return (
        <AdminLayout>
            <Head title={`سجل حالات الفعالية #${event.id}`} />

            <BackLink href="/admin/support-console" label="العودة إلى مركز الدعم" />

            <div className="page-title">{event.title}</div>
            <div className="page-sub">
                فعالية #{event.id} · الحالة الراهنة: {event.status} · {event.company?.name ?? '—'}
                {event.community ? ` · ${event.community.name}` : ''}
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 style={{ marginTop: 0 }}>الحقائق</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
                    <Fact label="التاريخ" value={event.event_date ?? '—'} />
                    <Fact label="الوقت" value={event.start_time ?? '—'} />
                    <Fact label="المشاركون" value={`${event.participants_count ?? 0} / ${event.capacity ?? '—'}`} />
                    <Fact label="الحد الأدنى" value={String(event.min_participants ?? '—')} />
                    <Fact label="المزوّد" value={event.partner?.name ?? '—'} />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
                <div style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>سجل الانتقالات</div>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الوقت</th>
                            <th>من</th>
                            <th>إلى</th>
                            <th>يدوي؟</th>
                            <th>السبب</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statusHistory.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: 0 }}>
                                    <ListState tone="empty" title="لا انتقالات مسجَّلة" hint="الفعالية لم تغادر حالتها الأولى بعد." />
                                </td>
                            </tr>
                        ) : (
                            statusHistory.map((row) => (
                                <tr key={row.id}>
                                    <td style={{ fontSize: 12, color: '#6B7A99', whiteSpace: 'nowrap' }}>
                                        {row.created_at ? fmtDateTime(row.created_at) : '—'}
                                    </td>
                                    <td style={{ color: '#9CA3BC' }}>{row.from_status ?? '—'}</td>
                                    <td style={{ color: '#fff', fontWeight: 700 }}>{row.to_status}</td>
                                    <td style={{ color: row.is_manual ? '#F5A623' : '#6B7A99', fontWeight: 700 }}>
                                        {row.is_manual ? 'يدوي' : 'آلي'}
                                    </td>
                                    <td style={{ fontSize: 12, color: '#C8D0E0' }}>{row.reason ?? '—'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
                <div style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>
                    سجل الإشعارات وحالات التسليم — أول ما يُفحص في شكوى «ما وصلني شيء»
                </div>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>الوقت</th>
                            <th>القالب</th>
                            <th>القناة</th>
                            <th>الحالة</th>
                            <th>السبب</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notificationLogs.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: 0 }}>
                                    <ListState
                                        tone="empty"
                                        title="لا سجلات إشعارات لهذه الفعالية"
                                        hint="راجع سجل الإشعارات الكامل بحثاً برقم المستلم إن كانت الشكوى عن رسالة غير مرتبطة بالفعالية."
                                    />
                                </td>
                            </tr>
                        ) : (
                            notificationLogs.map((log) => (
                                <tr key={log.id}>
                                    <td style={{ fontSize: 12, color: '#6B7A99', whiteSpace: 'nowrap' }}>
                                        {log.created_at ? fmtDateTime(log.created_at) : '—'}
                                    </td>
                                    <td dir="ltr" style={{ fontSize: 12, color: '#C8D0E0' }}>{log.template_key}</td>
                                    <td style={{ fontSize: 12 }}>{log.channel}</td>
                                    <td style={{ fontSize: 12 }}>{log.status}</td>
                                    <td style={{ fontSize: 12, color: '#9CA3BC' }}>{log.reason ?? '—'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 style={{ marginTop: 0 }}>هذه الشاشة للقراءة فقط</h3>
                <p style={{ fontSize: 12, color: '#9CA3BC', lineHeight: 1.9 }}>
                    تغيير حالة الفعالية أو تعديل الحضور بعد النافذة أو أي تصحيح مالي — كلها خارج صلاحية الدعم وتُصعَّد:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {escalation.map((row) => (
                        <span
                            key={row.action}
                            style={{
                                fontSize: 11,
                                color: '#C8D0E0',
                                background: '#12161F',
                                border: '1px solid #232A3E',
                                borderRadius: 8,
                                padding: '4px 10px',
                            }}
                        >
                            {row.label} → <b style={{ color: '#F5A623' }}>{row.role}</b>
                        </span>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}

function Fact({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div style={{ fontSize: 11, color: '#6B7A99' }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#E8EAF0' }}>{value}</div>
        </div>
    );
}
