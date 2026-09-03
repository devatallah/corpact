import AdminLayout from '@/layouts/admin-layout';
import CategoryIcon from '@/components/category-icon';
import ConfirmModal from '@/components/confirm-modal';
import StatusBadge from '@/components/status-badge';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Event, Employee, Community, Partner, Category, Company } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface SeriesEvent {
    id: number;
    event_date: string;
    start_time: string;
    status: string;
    participants_count: number;
    capacity: number;
}

interface StatusHistoryEntry {
    id: number;
    from_status: string | null;
    to_status: string;
    reason: string | null;
    is_manual: boolean;
    created_at: string;
}

interface AttendanceRow {
    employee_id: number;
    employee_name: string;
    attendance_status: string | null;
    attendance_reason: string | null;
    attendance_marked_at: string | null;
}

interface Props {
    event: Event & {
        community: Community;
        partner: Partner;
        category: Category;
        company: Company;
        creator: Employee;
        participants: (Employee & { pivot?: { seat_status?: string; joined_at?: string } })[];
    };
    seriesEvents: SeriesEvent[];
    statusHistory?: StatusHistoryEntry[];
    allStatuses?: string[];
    attendance?: AttendanceRow[];
    attendanceWindowClosed?: boolean;
    attendanceWindowClosesAt?: string | null;
}

export default function EventShow({
    event,
    seriesEvents,
    statusHistory = [],
    allStatuses = [],
    attendance = [],
    attendanceWindowClosed = false,
    attendanceWindowClosesAt = null,
}: Props) {
    // A15 — G (أدمن تيمات §3): «تعديل قائمة الحضور بعد انقضاء نافذة الـ24 ساعة
    // — استثناء لا إجراء روتيني»، بسبب موثَّق ويُسجَّل في سجل التدقيق.
    const [attendanceTarget, setAttendanceTarget] = useState<AttendanceRow | null>(null);
    const [attendanceStatus, setAttendanceStatus] = useState<'attended' | 'absent'>('attended');
    const [attendanceReason, setAttendanceReason] = useState('');
    const [attendanceConfirm, setAttendanceConfirm] = useState(false);

    function submitAttendance() {
        if (!attendanceTarget || attendanceReason.trim().length < 3) return;
        const employeeId = attendanceTarget.employee_id;
        setAttendanceConfirm(false);
        router.post(
            `/admin/events/${event.id}/attendance/${employeeId}`,
            { attendance_status: attendanceStatus, reason: attendanceReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAttendanceTarget(null);
                    setAttendanceReason('');
                },
            },
        );
    }

    const joinedParticipants = event.participants?.filter(
        (p) => p.pivot?.seat_status === 'reserved',
    ) ?? [];

    // H §9 قاعدة 2: التغيير اليدوي — أدمن تيمات وحده بسبب مكتوب، والسجل مقروء أولاً
    const [forceStatus, setForceStatus] = useState('');
    const [forceReason, setForceReason] = useState('');
    const [forceConfirm, setForceConfirm] = useState(false);

    function submitForceStatus(e: React.FormEvent) {
        e.preventDefault();
        if (!forceStatus || forceReason.trim().length < 5) return;
        setForceConfirm(true);
    }

    function confirmForceStatus() {
        setForceConfirm(false);
        router.post(`/admin/events/${event.id}/force-status`, { status: forceStatus, reason: forceReason }, {
            onSuccess: () => {
                setForceStatus('');
                setForceReason('');
            },
        });
    }

    const fillPercent = event.capacity > 0
        ? Math.round((event.participants_count / event.capacity) * 100)
        : 0;

    return (
        <AdminLayout>
            <Head title={`فعالية #${event.id}`} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Link href="/admin/events" style={{ color: '#6B7A99', textDecoration: 'none', fontSize: '14px' }}>
                    ← الفعاليات
                </Link>
                <span style={{ color: '#3D4A60' }}>/</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>فعالية #{event.id}</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                        <CategoryIcon icon={event.category?.icon} size={16} /> {event.community?.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#6B7A99' }}>
                        {event.company?.name} — {event.partner?.name} — {fmtDate(event.event_date)} — {fmtTime(event.start_time)}
                    </div>
                </div>
                <StatusBadge status={event.status} />
            </div>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
                <div className="card">
                    <div style={{ fontSize: 11, color: '#6B7A99' }}>اللاعبون</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: fillPercent >= 100 ? '#009E82' : '#fff' }}>
                        {event.participants_count}/{event.capacity}
                    </div>
                    <div style={{ height: 4, background: '#232A3E', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${fillPercent}%`, background: '#009E82', borderRadius: 4 }} />
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 11, color: '#6B7A99' }}>عدد المرافق</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{event.venues_count}</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 11, color: '#6B7A99' }}>إجمالي التكلفة</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#D4820A' }}>{Number(event.total_amount).toLocaleString()} ريال</div>
                </div>
                <div className="card">
                    <div style={{ fontSize: 11, color: '#6B7A99' }}>حصة كل لاعب</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{Number(event.cost_per_person).toLocaleString()} ريال</div>
                </div>
                {Number(event.community_contribution) > 0 && (
                    <div className="card">
                        <div style={{ fontSize: 11, color: '#6B7A99' }}>استقطاع من المحفظة</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#009E82' }}>{Number(event.community_contribution).toLocaleString()} ريال</div>
                    </div>
                )}
            </div>

            {/* A8 — مولّدة من قالب تكرار (H §8) */}
            {event.template_id && (
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1A5FAB15', borderColor: '#1A5FAB44' }}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#8AB4F8' }}>مولّدة من قالب تكرار #{event.template_id}</span>
                    {(event.reschedule_attempt ?? 0) > 0 && (
                        <span style={{ fontSize: 11, color: '#D4820A', marginRight: 'auto' }}>أُعيدت جدولتها مرة — لم يكتمل العدد</span>
                    )}
                </div>
            )}
            {event.parent_event_id && (
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1A5FAB15', borderColor: '#1A5FAB44' }}>
                    <span style={{ fontSize: 16 }}>🔄</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#8AB4F8' }}>جزء من سلسلة فعاليات متكررة</span>
                    <Link
                        href={`/admin/events/${event.parent_event_id}`}
                        style={{ fontSize: 11, color: '#8AB4F8', marginRight: 'auto', textDecoration: 'underline' }}
                    >
                        عرض السلسلة
                    </Link>
                </div>
            )}

            {/* Series timeline */}
            {seriesEvents && seriesEvents.length > 0 && (
                <div className="card">
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 14 }}>
                        سلسلة الفعاليات ({seriesEvents.length + 1} فعاليات)
                    </div>
                    <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {seriesEvents.map((se) => {
                            const isCurrent = se.id === event.id;
                            const statusColor = se.status === 'cancelled' ? '#E03050' : se.status === 'completed' ? '#6B7A99' : '#009E82';
                            const statusLabel = se.status === 'cancelled' ? 'ملغية' : se.status === 'completed' ? 'مكتملة' : `${se.participants_count}/${se.capacity}`;
                            return (
                                <Link
                                    key={se.id}
                                    href={`/admin/events/${se.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 12px',
                                        borderRadius: 10,
                                        textDecoration: 'none',
                                        background: isCurrent ? '#009E8215' : '#161B27',
                                        border: isCurrent ? '1px solid #009E8244' : '1px solid #232A3E',
                                        color: 'inherit',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? '#009E82' : '#C8D0E0' }}>
                                            {fmtDate(se.event_date)}
                                        </span>
                                        <span style={{ fontSize: 11, color: '#6B7A99' }}>
                                            {fmtTime(se.start_time)}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: statusColor }}>
                                        {statusLabel}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Joined participants */}
            <div className="card">
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 14 }}>
                    المنضمون ({joinedParticipants.length}/{event.capacity})
                </div>
                {joinedParticipants.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6B7A99', fontSize: 13, padding: '16px 0' }}>
                        لا يوجد منضمون بعد
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {joinedParticipants.map((p) => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#161B27', borderRadius: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#009E8220', color: '#009E82', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                                    {p.name?.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#E8EAF0' }}>{p.name}</div>
                                    <div style={{ fontSize: 11, color: '#6B7A99' }}>{p.email}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes */}
            {event.notes && (
                <div className="card">
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>ملاحظات</div>
                    <div style={{ fontSize: 13, color: '#C8D0E0' }}>{event.notes}</div>
                </div>
            )}

            {/* سجل الانتقالات (H §9) — يُقرأ قبل أي تغيير يدوي */}
            <div className="card">
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 14 }}>
                    سجل حالات الفعالية ({statusHistory.length})
                </div>
                {statusHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6B7A99', fontSize: 13, padding: '10px 0' }}>لا سجل بعد</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {statusHistory.map((h) => (
                            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#161B27', borderRadius: 10, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 11, color: '#6B7A99', minWidth: 120 }}>{new Date(h.created_at).toLocaleString('ar-SA')}</span>
                                <span style={{ fontSize: 12, color: '#C8D0E0' }}>
                                    {h.from_status ? <StatusBadge status={h.from_status} /> : 'إنشاء'} ← <StatusBadge status={h.to_status} />
                                </span>
                                {h.is_manual && <span style={{ fontSize: 10, background: '#E0305022', color: '#E03050', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>يدوي</span>}
                                {h.reason && <span style={{ fontSize: 11, color: '#6B7A99' }}>{h.reason}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* التغيير اليدوي — أدمن تيمات وحده بسبب مكتوب (H §9 قاعدة 2) */}
            <div className="card" style={{ borderColor: '#E0305044' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#E03050', marginBottom: 6 }}>تغيير الحالة يدوياً</div>
                <div style={{ fontSize: 12, color: '#6B7A99', marginBottom: 12 }}>
                    خارج جدول الانتقالات — لتصحيح الواقع فقط (مثل إرجاع فعالية لم تُقم). السبب المكتوب إلزامي ويُسجَّل في سجلي الانتقالات والتدقيق.
                </div>
                <form onSubmit={submitForceStatus} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <select
                        value={forceStatus}
                        onChange={(e) => setForceStatus(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: 10, background: '#161B27', color: '#E8EAF0', border: '1px solid #2A3245', fontSize: 13, fontFamily: 'inherit' }}
                    >
                        <option value="">اختر الحالة...</option>
                        {allStatuses.filter((s) => s !== event.status).map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <input
                        value={forceReason}
                        onChange={(e) => setForceReason(e.target.value)}
                        placeholder="السبب المكتوب (إلزامي — 5 أحرف فأكثر)"
                        style={{ flex: 1, minWidth: 220, padding: '9px 12px', borderRadius: 10, background: '#161B27', color: '#E8EAF0', border: '1px solid #2A3245', fontSize: 13, fontFamily: 'inherit', direction: 'rtl' }}
                    />
                    <button
                        type="submit"
                        disabled={!forceStatus || forceReason.trim().length < 5}
                        className="btn btn-danger"
                        style={{ opacity: !forceStatus || forceReason.trim().length < 5 ? 0.5 : 1 }}
                    >
                        تنفيذ التغيير اليدوي
                    </button>
                </form>
            </div>

            {/* A15 — استثناء الحضور بعد النافذة (H §13 / G أدمن تيمات §3) */}
            {attendance.length > 0 && (
                <div className="card" style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>قائمة الحضور</div>
                    <div style={{ fontSize: 12, color: '#6B7A99', lineHeight: 1.9, marginBottom: 14 }}>
                        {attendanceWindowClosed
                            ? 'نافذة القائد (٢٤ ساعة) أُقفلت — التعديل من هنا استثناء إداري بسبب موثَّق، ويُسجَّل بالفاعل والقيمة قبل وبعد في سجل التدقيق.'
                            : `النافذة ما زالت مفتوحة للقائد${attendanceWindowClosesAt ? ` حتى ${attendanceWindowClosesAt.slice(0, 16).replace('T', ' ')}` : ''} — الأصل أن يعدّلها هو، والتعديل من هنا يبقى استثناءً.`}
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="portal-table">
                            <thead>
                                <tr>
                                    <th>المشارك</th>
                                    <th>الحضور</th>
                                    <th>السبب المسجَّل</th>
                                    <th>إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((row) => (
                                    <tr key={row.employee_id}>
                                        <td style={{ fontWeight: 700, color: '#fff' }}>{row.employee_name}</td>
                                        <td style={{ color: row.attendance_status === 'absent' ? '#E03050' : '#009E82', fontWeight: 700 }}>
                                            {row.attendance_status === 'attended' ? 'حاضر' : row.attendance_status === 'absent' ? 'غائب' : '—'}
                                        </td>
                                        <td style={{ fontSize: 12, color: '#9CA3BC' }}>{row.attendance_reason ?? '—'}</td>
                                        <td>
                                            <button
                                                className="act-btn btn-view"
                                                onClick={() => {
                                                    setAttendanceTarget(row);
                                                    setAttendanceStatus(row.attendance_status === 'attended' ? 'absent' : 'attended');
                                                    setAttendanceReason('');
                                                }}
                                            >
                                                تعديل استثنائي
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {attendanceTarget && (
                        <div style={{ marginTop: 14, padding: 14, background: '#161B27', border: '1px solid #2A3245', borderRadius: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#E8EAF0', marginBottom: 10 }}>
                                تعديل حضور «{attendanceTarget.employee_name}»
                            </div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <select
                                    value={attendanceStatus}
                                    onChange={(e) => setAttendanceStatus(e.target.value as 'attended' | 'absent')}
                                    style={{ padding: '9px 12px', borderRadius: 10, background: '#0E121B', color: '#E8EAF0', border: '1px solid #2A3245', fontSize: 13, fontFamily: 'inherit' }}
                                >
                                    <option value="attended">حاضر</option>
                                    <option value="absent">غائب</option>
                                </select>
                                <input
                                    value={attendanceReason}
                                    onChange={(e) => setAttendanceReason(e.target.value)}
                                    placeholder="السبب الموثَّق (إلزامي)"
                                    style={{ flex: 1, minWidth: 220, padding: '9px 12px', borderRadius: 10, background: '#0E121B', color: '#E8EAF0', border: '1px solid #2A3245', fontSize: 13, fontFamily: 'inherit', direction: 'rtl' }}
                                />
                                <button
                                    className="act-btn btn-approve"
                                    disabled={attendanceReason.trim().length < 3}
                                    onClick={() => setAttendanceConfirm(true)}
                                >
                                    تنفيذ
                                </button>
                                <button className="act-btn" onClick={() => setAttendanceTarget(null)}>إلغاء</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                open={attendanceConfirm}
                title="تعديل الحضور بعد النافذة"
                message={
                    attendanceTarget
                        ? `سيُسجَّل «${attendanceTarget.employee_name}» ${attendanceStatus === 'attended' ? 'حاضراً' : 'غائباً'} بدل «${attendanceTarget.attendance_status === 'attended' ? 'حاضر' : attendanceTarget.attendance_status === 'absent' ? 'غائب' : 'غير محدد'}». الأثر: يتغيّر احتساب الموظف المفعّل في فاتورة الشهر ولوحتَي الصدارة. السبب يُحفظ في سجل التدقيق ولا يُحذف.`
                        : ''
                }
                confirmLabel="تسجيل الاستثناء"
                onConfirm={submitAttendance}
                onCancel={() => setAttendanceConfirm(false)}
            />

            <ConfirmModal
                open={forceConfirm}
                title="تغيير حالة الفعالية يدوياً"
                message={`تنتقل الفعالية من «${event.status}» إلى «${forceStatus}» خارج آلة الحالات. التغيير اليدوي استثناء لا إجراء روتيني: يُسجَّل في سجل التدقيق بالفاعل والقيمة قبل وبعد والسبب المكتوب، ولا يُحذف. تحقّق من سجل الحالات أعلاه قبل التأكيد.`}
                confirmLabel="تغيير الحالة"
                onConfirm={confirmForceStatus}
                onCancel={() => setForceConfirm(false)}
            />
        </AdminLayout>
    );
}
