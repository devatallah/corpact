import { router } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';

/*
 * A12 — H §13: قائمة الحضور على صفحة القائد.
 *
 * الحضور تلقائي بالكامل عند الاكتمال؛ هذه اللوحة هي **الضمانة** المقابلة:
 * نافذة 24 ساعة يقلب فيها القائد أو المنسّق «حاضر ⇄ غائب» بسبب اختياري،
 * ثم تُقفل القائمة ولا يعدّلها إلا أدمن تيمات بسبب موثَّق إلزامي.
 *
 * لا أثر مالي للغياب إطلاقاً — لا زر استرداد ولا مبلغ في هذه اللوحة.
 */

export interface AttendanceRosterRow {
    employee_id: number;
    name: string | null;
    avatar?: string | null;
    attendance_status: 'attended' | 'absent' | null;
    attendance_reason: string | null;
    attendance_marked_at: string | null;
}

export interface MeasurementUnitOption {
    key: string;
    label: string;
    kind: string;
    direction: string;
    precision: number;
}

export interface EventResultRow {
    id: number;
    employee_id: number;
    employee_name: string | null;
    measurement_type: string;
    unit: string | null;
    unit_label: string;
    value: number | null;
    value_formatted: string | null;
    season_id: number;
    corrections_count: number;
}

export interface AttendancePanelData {
    roster: AttendanceRosterRow[];
    window_closes_at: string | null;
    window_open: boolean;
    locked_at: string | null;
    can_edit: boolean;
    edit_mode: string | null;
    reason_required: boolean;
    notice: string | null;
    results: EventResultRow[];
    units: MeasurementUnitOption[];
    can_enter_results: boolean;
    can_correct_results: boolean;
}

function formatMoment(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleString('ar-SA', {
        day: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function AttendancePanel({ eventId, data }: { eventId: number; data: AttendancePanelData }) {
    const [reasons, setReasons] = useState<Record<number, string>>({});
    const [resultUnit, setResultUnit] = useState<Record<number, string>>({});
    const [resultValue, setResultValue] = useState<Record<number, string>>({});
    const [correcting, setCorrecting] = useState<number | null>(null);
    const [correctionValue, setCorrectionValue] = useState('');
    const [correctionReason, setCorrectionReason] = useState('');

    const resultsByEmployee = new Map<number, EventResultRow>();
    data.results.forEach((r) => resultsByEmployee.set(r.employee_id, r));

    function mark(employeeId: number, status: 'attended' | 'absent') {
        router.post(
            `/employee/detail/${eventId}/attendance/${employeeId}`,
            { attendance_status: status, reason: reasons[employeeId] ?? '' },
            {
                preserveScroll: true,
                onSuccess: () => toastr.success('حُدّثت قائمة الحضور'),
            },
        );
    }

    function storeResult(employeeId: number) {
        router.post(
            `/employee/detail/${eventId}/results/${employeeId}`,
            { unit: resultUnit[employeeId] ?? data.units[0]?.key, value: resultValue[employeeId] ?? '' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toastr.success('سُجّلت النتيجة');
                    setResultValue((v) => ({ ...v, [employeeId]: '' }));
                },
            },
        );
    }

    function correct(resultId: number) {
        router.post(
            `/employee/results/${resultId}/correct`,
            { value: correctionValue, reason: correctionReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toastr.success('صُحِّحت النتيجة وأُعيد احتساب اللوحة');
                    setCorrecting(null);
                    setCorrectionValue('');
                    setCorrectionReason('');
                },
            },
        );
    }

    return (
        <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>الحضور والنتائج</div>

            <div style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.7 }}>
                الحضور سُجِّل تلقائياً عند اكتمال الفعالية — لا مسح رموز ولا تأكيد من المزوّد.
                {data.window_open ? (
                    <>
                        {' '}نافذة التعديل مفتوحة حتى <b>{formatMoment(data.window_closes_at)}</b>. راجِعها — هي الضمانة الوحيدة ضد احتساب فعالية لم تُقم.
                    </>
                ) : (
                    <> نافذة التعديل مُقفلة (انتهت 24 ساعة). لا يعدّلها إلا أدمن تيمات بسبب موثَّق.</>
                )}
                {' '}<b>لا أثر مالي للغياب إطلاقاً.</b>
            </div>

            {data.notice && (
                <div style={{ background: '#FFF8E6', border: '1px solid #F0D9A0', borderRadius: 8, padding: 10, fontSize: 12, marginBottom: 12 }}>
                    ⚠️ {data.notice}
                </div>
            )}

            {data.roster.length === 0 && (
                <div style={{ fontSize: 13, color: '#888' }}>لا مشاركين مؤكدين في هذه الفعالية.</div>
            )}

            {data.roster.map((row) => {
                const result = resultsByEmployee.get(row.employee_id);

                return (
                    <div key={row.employee_id} style={{ borderTop: '1px solid #F0EDE8', padding: '10px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 600, flex: 1, minWidth: 140 }}>{row.name ?? '—'}</div>

                            <span
                                style={{
                                    fontSize: 12,
                                    padding: '3px 10px',
                                    borderRadius: 999,
                                    background: row.attendance_status === 'absent' ? '#FEE2E2' : '#DCFCE7',
                                    color: row.attendance_status === 'absent' ? '#B91C1C' : '#166534',
                                }}
                            >
                                {row.attendance_status === 'absent' ? 'غائب' : 'حاضر'}
                            </span>

                            {data.can_edit && (
                                <>
                                    <input
                                        placeholder={data.reason_required ? 'السبب الموثَّق (إلزامي)' : 'السبب (اختياري)'}
                                        value={reasons[row.employee_id] ?? ''}
                                        onChange={(e) => setReasons((r) => ({ ...r, [row.employee_id]: e.target.value }))}
                                        style={{ padding: '6px 10px', border: '1px solid #DDD', borderRadius: 8, fontSize: 12, minWidth: 180 }}
                                    />
                                    <button
                                        className="btn btn-outline"
                                        style={{ fontSize: 12, padding: '4px 12px' }}
                                        onClick={() => mark(row.employee_id, row.attendance_status === 'absent' ? 'attended' : 'absent')}
                                    >
                                        {row.attendance_status === 'absent' ? 'سجّله حاضراً' : 'سجّله غائباً'}
                                    </button>
                                </>
                            )}
                        </div>

                        {row.attendance_status === 'absent' && row.attendance_reason && (
                            <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 4 }}>
                                سبب الغياب المسجَّل: {row.attendance_reason} · {formatMoment(row.attendance_marked_at)}
                            </div>
                        )}

                        {/* النتائج — قيمة فردية بوحدة من الكتالوج المركزي (H §13) */}
                        {result ? (
                            <div style={{ fontSize: 12, color: '#444', marginTop: 6, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                🏅 النتيجة: <b>{result.value_formatted}</b>
                                {result.corrections_count > 0 && <span style={{ color: '#888' }}>(صُحِّحت {result.corrections_count} مرة)</span>}
                                {data.can_correct_results && (
                                    <button className="btn btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setCorrecting(result.id)}>
                                        تصحيح
                                    </button>
                                )}
                                {correcting === result.id && (
                                    <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="القيمة"
                                            value={correctionValue}
                                            onChange={(e) => setCorrectionValue(e.target.value)}
                                            style={{ padding: '4px 8px', border: '1px solid #DDD', borderRadius: 6, width: 90 }}
                                        />
                                        <input
                                            placeholder="سبب التصحيح (إلزامي)"
                                            value={correctionReason}
                                            onChange={(e) => setCorrectionReason(e.target.value)}
                                            style={{ padding: '4px 8px', border: '1px solid #DDD', borderRadius: 6, minWidth: 160 }}
                                        />
                                        <button className="btn" style={{ fontSize: 11, padding: '3px 10px' }} onClick={() => correct(result.id)}>
                                            حفظ التصحيح
                                        </button>
                                    </span>
                                )}
                            </div>
                        ) : (
                            data.can_enter_results && row.attendance_status !== 'absent' && (
                                <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <select
                                        value={resultUnit[row.employee_id] ?? data.units[0]?.key ?? ''}
                                        onChange={(e) => setResultUnit((u) => ({ ...u, [row.employee_id]: e.target.value }))}
                                        style={{ padding: '4px 8px', border: '1px solid #DDD', borderRadius: 6, fontSize: 12 }}
                                    >
                                        {data.units.map((u) => (
                                            <option key={u.key} value={u.key}>{u.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="القيمة"
                                        value={resultValue[row.employee_id] ?? ''}
                                        onChange={(e) => setResultValue((v) => ({ ...v, [row.employee_id]: e.target.value }))}
                                        style={{ padding: '4px 8px', border: '1px solid #DDD', borderRadius: 6, width: 90, fontSize: 12 }}
                                    />
                                    <button className="btn btn-outline" style={{ fontSize: 11, padding: '3px 10px' }} onClick={() => storeResult(row.employee_id)}>
                                        سجّل النتيجة
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                );
            })}
        </div>
    );
}
