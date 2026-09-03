import { Head, router } from '@inertiajs/react';
import { Calendar, History, TriangleAlert, Users } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { BackLink, ListStates } from '@/components/list-states';
import { Badge, Button, Card, Money, Note, PageHeader, StatCard, Tbody, Td, Th, Thead, TableShell, Tr } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import { eventStatus } from '@/lib/status';

/**
 * H §9 rule 2 — «سجل الحالات يُقرأ قبل التدخل».
 *
 * Two exceptional powers live on this screen, and both refuse to act without
 * a written reason: forcing a state transition, and editing attendance after
 * the 24-hour correction window has closed. Neither is a routine operation —
 * every use of them shows up in the ghost-event monitor as a manual
 * intervention, which is exactly the point.
 */
type EventModel = {
    id: number;
    title: string;
    description: string | null;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    status: string;
    capacity: number | null;
    participants_count: number | null;
    min_participants: number | null;
    total_amount: string | number | null;
    company?: { id: number; name: string } | null;
    community?: { id: number; name: string } | null;
    partner?: { id: number; name: string } | null;
    creator?: { id: number; name: string } | null;
};

type StatusRow = {
    id: number;
    from_status: string | null;
    to_status: string;
    is_manual: boolean;
    reason: string | null;
    created_at: string | null;
};

type AttendanceRow = {
    employee_id: number;
    employee_name: string;
    attendance_status: string | null;
    attendance_reason: string | null;
    attendance_marked_at: string | null;
};

export default function AdminEventShow({
    event,
    statusHistory,
    allStatuses,
    attendance,
    attendanceWindowClosed,
    attendanceWindowClosesAt,
}: {
    event: EventModel;
    seriesEvents: unknown[];
    statusHistory: StatusRow[];
    allStatuses: string[];
    attendance: AttendanceRow[];
    attendanceWindowClosed: boolean;
    attendanceWindowClosesAt: string | null;
}) {
    const [forcing, setForcing] = useState(false);
    const [targetStatus, setTargetStatus] = useState('');
    const [forceReason, setForceReason] = useState('');

    const [editingAttendance, setEditingAttendance] = useState<AttendanceRow | null>(null);
    const [attendanceStatus, setAttendanceStatus] = useState<'attended' | 'absent'>('attended');
    const [attendanceReason, setAttendanceReason] = useState('');

    const status = eventStatus(event.status);
    const manualCount = statusHistory.filter((row) => row.is_manual).length;

    return (
        <AdminLayout>
            <Head title={event.title} />

            <BackLink href="/admin/events" label="العودة إلى الفعاليات" />

            <PageHeader
                icon={Calendar}
                title={event.title}
                subtitle={`${event.company?.name ?? '—'} · ${event.community?.name ?? '—'}`}
                actions={
                    <>
                        <Badge tone={status.tone}>{status.label}</Badge>
                        <Button
                            tone="danger"
                            icon={TriangleAlert}
                            onClick={() => {
                                setTargetStatus('');
                                setForceReason('');
                                setForcing(true);
                            }}
                        >
                            تغيير الحالة يدوياً
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="الموعد" value={event.event_date ?? '—'} hint={event.start_time ?? undefined} />
                <StatCard
                    label="المشاركون"
                    value={`${event.participants_count ?? 0} / ${event.capacity ?? '—'}`}
                    hint={`النصاب ${event.min_participants ?? '—'}`}
                />
                <StatCard label="المرفق" value={event.partner?.name ?? '—'} />
                <StatCard
                    label="تدخلات يدوية"
                    value={manualCount}
                    tone={manualCount > 0 ? 'warning' : 'success'}
                    hint={manualCount > 0 ? 'تظهر في مراقبة الشبح' : 'الدورة تلقائية'}
                />
            </div>

            {event.total_amount !== undefined && event.total_amount !== null && (
                <Card padding="p-4">
                    <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-ink/60">التكلفة الإجمالية المتعاقد عليها</span>
                        <Money amount={event.total_amount} className="text-ink" />
                    </div>
                </Card>
            )}

            {/* ── سجل الحالات ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-ink" aria-hidden="true" />
                    <h2 className="text-sm font-extrabold text-ink">سجل الحالات</h2>
                </div>

                <TableShell>
                    <Thead>
                        <Th>الوقت</Th>
                        <Th>من</Th>
                        <Th>إلى</Th>
                        <Th>المصدر</Th>
                        <Th>السبب</Th>
                    </Thead>
                    <Tbody>
                        {statusHistory.map((row) => (
                            <Tr key={row.id}>
                                <Td className="font-mono text-[11px] text-ink/70 whitespace-nowrap">
                                    {row.created_at ? new Date(row.created_at).toLocaleString('ar-SA') : '—'}
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/60">{row.from_status ?? '—'}</Td>
                                <Td className="font-mono text-[11px] font-bold text-ink">{row.to_status}</Td>
                                <Td>
                                    {row.is_manual ? (
                                        <Badge tone="warning" icon={TriangleAlert}>
                                            تدخل يدوي
                                        </Badge>
                                    ) : (
                                        <Badge tone="neutral">النظام</Badge>
                                    )}
                                </Td>
                                <Td className="text-ink/70 max-w-xs text-[11px]">{row.reason ?? '—'}</Td>
                            </Tr>
                        ))}
                        <ListStates count={statusHistory.length} colSpan={5} empty="لا انتقالات مسجّلة." />
                    </Tbody>
                </TableShell>
            </Card>

            {/* ── الحضور ── */}
            <Card padding="p-4" className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-ink" aria-hidden="true" />
                        <h2 className="text-sm font-extrabold text-ink">قائمة الحضور</h2>
                    </div>
                    <Badge tone={attendanceWindowClosed ? 'neutral' : 'success'}>
                        {attendanceWindowClosed ? 'أُغلقت نافذة التصحيح' : 'نافذة التصحيح مفتوحة'}
                    </Badge>
                </div>

                {attendanceWindowClosed && (
                    <Note tone="warning" title="التعديل بعد النافذة استثناء لا إجراء روتيني">
                        انقضت نافذة الـ٢٤ ساعة{attendanceWindowClosesAt ? ` في ${new Date(attendanceWindowClosesAt).toLocaleString('ar-SA')}` : ''}.
                        التعديل من هنا صلاحية أدمن، ويُسجَّل باسمك وسببه ويظهر في مؤشرات الإنذار المبكر.
                    </Note>
                )}

                <TableShell>
                    <Thead>
                        <Th>الموظف</Th>
                        <Th>الحضور</Th>
                        <Th>سُجِّل في</Th>
                        <Th>سبب التعديل</Th>
                        <Th className="text-center">الإجراء</Th>
                    </Thead>
                    <Tbody>
                        {attendance.map((row) => (
                            <Tr key={row.employee_id}>
                                <Td className="font-extrabold text-ink">{row.employee_name}</Td>
                                <Td>
                                    <Badge
                                        tone={row.attendance_status === 'attended' ? 'success' : row.attendance_status === 'absent' ? 'danger' : 'neutral'}
                                    >
                                        {row.attendance_status === 'attended' ? 'حضر' : row.attendance_status === 'absent' ? 'غاب' : 'لم يُسجَّل'}
                                    </Badge>
                                </Td>
                                <Td className="font-mono text-[11px] text-ink/70">
                                    {row.attendance_marked_at ? new Date(row.attendance_marked_at).toLocaleString('ar-SA') : '—'}
                                </Td>
                                <Td className="text-[11px] text-ink/70 max-w-xs">{row.attendance_reason ?? '—'}</Td>
                                <Td className="text-center">
                                    <Button
                                        tone="soft"
                                        onClick={() => {
                                            setAttendanceStatus(row.attendance_status === 'attended' ? 'absent' : 'attended');
                                            setAttendanceReason('');
                                            setEditingAttendance(row);
                                        }}
                                    >
                                        تعديل
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                        <ListStates count={attendance.length} colSpan={5} empty="لا مشاركين مسجّلين في هذه الفعالية." />
                    </Tbody>
                </TableShell>
            </Card>

            {/* H §9 — a forced transition without a written reason is not allowed. */}
            <ConfirmModal
                open={forcing}
                tone="danger"
                title="تغيير حالة الفعالية يدوياً"
                message="تجاوز لآلة الحالات. يُسجَّل باسمك وسببه، ويُحتسب في مؤشر التدخلات اليدوية على شاشة مراقبة الفعالية الشبح."
                details={
                    <>
                        <ConfirmRow label="الفعالية" value={event.title} />
                        <ConfirmRow label="الحالة الحالية" value={eventStatus(event.status).label} strong />
                        <div className="pt-2 space-y-2">
                            <div>
                                <label htmlFor="force-status" className="block text-[11px] font-bold text-ink mb-1">
                                    الحالة الجديدة
                                </label>
                                <select
                                    id="force-status"
                                    value={targetStatus}
                                    onChange={(changeEvent) => setTargetStatus(changeEvent.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface cursor-pointer focus:outline-none focus:border-ink"
                                >
                                    <option value="">اختر الحالة…</option>
                                    {allStatuses.map((value) => (
                                        <option key={value} value={value}>
                                            {eventStatus(value).label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="force-reason" className="block text-[11px] font-bold text-ink mb-1">
                                    سبب التغيير اليدوي (إلزامي)
                                </label>
                                <textarea
                                    id="force-reason"
                                    rows={2}
                                    value={forceReason}
                                    onChange={(changeEvent) => setForceReason(changeEvent.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                                />
                            </div>
                        </div>
                    </>
                }
                confirmLabel="تغيير الحالة"
                busy={targetStatus === '' || forceReason.trim().length < 5}
                onConfirm={() => {
                    router.post(
                        `/admin/events/${event.id}/force-status`,
                        { status: targetStatus, reason: forceReason },
                        { preserveScroll: true },
                    );
                    setForcing(false);
                }}
                onCancel={() => setForcing(false)}
            />

            <ConfirmModal
                open={editingAttendance !== null}
                tone="danger"
                title="تعديل حالة حضور"
                message="تعديل الحضور يغيّر ما احتُسب في مؤشرات التفاعل وربما في التسوية. السبب الموثَّق إلزامي."
                details={
                    editingAttendance && (
                        <>
                            <ConfirmRow label="الموظف" value={editingAttendance.employee_name} strong />
                            <ConfirmRow label="الحالة الحالية" value={editingAttendance.attendance_status ?? 'لم تُسجَّل'} />
                            <div className="pt-2 space-y-2">
                                <div>
                                    <label htmlFor="att-status" className="block text-[11px] font-bold text-ink mb-1">
                                        الحالة الجديدة
                                    </label>
                                    <select
                                        id="att-status"
                                        value={attendanceStatus}
                                        onChange={(changeEvent) => setAttendanceStatus(changeEvent.target.value as 'attended' | 'absent')}
                                        className="w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface cursor-pointer focus:outline-none focus:border-ink"
                                    >
                                        <option value="attended">حضر</option>
                                        <option value="absent">غاب</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="att-reason" className="block text-[11px] font-bold text-ink mb-1">
                                        السبب الموثَّق (إلزامي)
                                    </label>
                                    <textarea
                                        id="att-reason"
                                        rows={2}
                                        value={attendanceReason}
                                        onChange={(changeEvent) => setAttendanceReason(changeEvent.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border-[0.5px] border-ink/20 text-xs bg-surface focus:outline-none focus:border-ink"
                                    />
                                </div>
                            </div>
                        </>
                    )
                }
                confirmLabel="حفظ التعديل"
                busy={attendanceReason.trim().length < 3}
                onConfirm={() => {
                    router.post(
                        `/admin/events/${event.id}/attendance/${editingAttendance?.employee_id}`,
                        { attendance_status: attendanceStatus, reason: attendanceReason },
                        { preserveScroll: true },
                    );
                    setEditingAttendance(null);
                }}
                onCancel={() => setEditingAttendance(null)}
            />
        </AdminLayout>
    );
}
