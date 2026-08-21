import ConfirmModal from '@/components/confirm-modal';
import { ListState } from '@/components/list-states';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import toastr from 'toastr';

/**
 * G — «دليل وكيل الدعم»: البحث وقراءة سجل الحالات وسجل الإشعارات وإعادة
 * الإرسال ضمن الحدود، ومصفوفة التصعيد لكل ما هو خارج الصلاحية.
 */

interface EventResult {
    id: number;
    title: string;
    status: string;
    event_date: string | null;
    company: { id: number; name: string } | null;
    community: { id: number; name: string } | null;
}

interface EmployeeResult {
    id: number;
    name: string;
    email: string | null;
    phone_tail: string | null;
    status: string;
    company: { id: number; name: string } | null;
}

interface CompanyResult {
    id: number;
    name: string;
    email: string | null;
    status: string;
}

interface InvitationRow {
    id: number;
    name: string | null;
    email: string | null;
    phone_tail: string | null;
    company: { id: number; name: string } | null;
    send_count: number;
    expires_at: string | null;
}

interface Props {
    filters: { search?: string; scope?: string };
    results: { events: EventResult[]; employees: EmployeeResult[]; companies: CompanyResult[] };
    escalation: { action: string; label: string; role: string }[];
    pendingInvitations: InvitationRow[];
}

const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    background: '#161B27',
    border: '1px solid #232A3E',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#E8EAF0',
    outline: 'none',
    direction: 'rtl',
    fontFamily: 'inherit',
};

const SCOPES = [
    { value: 'all', label: 'الكل' },
    { value: 'events', label: 'الفعاليات' },
    { value: 'employees', label: 'الموظفون' },
    { value: 'companies', label: 'الشركات' },
];

export default function SupportConsole({ filters, results, escalation, pendingInvitations }: Props) {
    const [term, setTerm] = useState(filters?.search ?? '');
    const [resendTarget, setResendTarget] = useState<InvitationRow | null>(null);
    const otpForm = useForm({ phone: '' });

    const scope = filters?.scope ?? 'all';
    const hasSearched = (filters?.search ?? '') !== '';
    const totalResults = results.events.length + results.employees.length + results.companies.length;

    function runSearch(nextScope = scope) {
        router.get(
            '/admin/support-console',
            { search: term || undefined, scope: nextScope === 'all' ? undefined : nextScope },
            { preserveState: true, replace: true },
        );
    }

    function confirmResend() {
        if (!resendTarget) return;
        const id = resendTarget.id;
        setResendTarget(null);
        router.post(`/admin/support-console/invitations/${id}/resend`, {}, {
            preserveScroll: true,
            onSuccess: () => toastr.success('أُعيد إرسال الدعوة.'),
        });
    }

    function resendOtp(e: React.FormEvent) {
        e.preventDefault();
        otpForm.post('/admin/support-console/otp/resend', {
            preserveScroll: true,
            onSuccess: () => {
                otpForm.reset();
                toastr.success('أُرسل رمز دخول جديد.');
            },
        });
    }

    return (
        <AdminLayout>
            <Head title="مركز الدعم" />

            <div className="page-title">مركز الدعم</div>
            <div className="page-sub">
                تشخيص وتوثيق وتصعيد — لا حلّ بتجاوز النظام. كل قراءة هنا مسجَّلة في سجل التدقيق.
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <input
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                        placeholder="🔍 معرّف فعالية · اسم موظف · بريد · رقم جوال · اسم شركة"
                        style={{ ...inputStyle, flex: 1, minWidth: 240 }}
                    />
                    <button className="act-btn btn-approve" onClick={() => runSearch()}>بحث</button>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                    {SCOPES.map((s) => (
                        <button key={s.value} className={`fbtn${scope === s.value ? ' on' : ''}`} onClick={() => runSearch(s.value)}>
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {!hasSearched && (
                <div className="card">
                    <ListState
                        tone="empty"
                        title="ابدأ بالبحث"
                        hint="اكتب معرّف الفعالية أو اسم الموظف أو الشركة. G: «وثّق البلاغ بمعرّف الفعالية أو المستخدم، والوقت، والحالة الفعلية مقابل المتوقعة»."
                    />
                </div>
            )}

            {hasSearched && totalResults === 0 && (
                <div className="card">
                    <ListState tone="empty" title="لا نتائج مطابقة" hint="جرّب معرّفاً رقمياً أو جزءاً من الاسم أو آخر أربعة أرقام من الجوال." />
                </div>
            )}

            {results.events.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>الفعاليات</div>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>الفعالية</th>
                                <th>الحالة</th>
                                <th>التاريخ</th>
                                <th>الشركة / المجتمع</th>
                                <th>إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.events.map((event) => (
                                <tr key={event.id}>
                                    <td dir="ltr">{event.id}</td>
                                    <td style={{ fontWeight: 700, color: '#fff' }}>{event.title}</td>
                                    <td style={{ color: '#C8D0E0' }}>{event.status}</td>
                                    <td style={{ fontSize: 12, color: '#6B7A99' }}>{event.event_date ?? '—'}</td>
                                    <td style={{ fontSize: 12, color: '#9CA3BC' }}>
                                        {event.company?.name ?? '—'}
                                        {event.community ? ` · ${event.community.name}` : ''}
                                    </td>
                                    <td>
                                        <Link href={`/admin/support-console/events/${event.id}`} className="act-btn btn-view">
                                            سجل الحالات
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {results.employees.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>الموظفون</div>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>البريد</th>
                                <th>الجوال</th>
                                <th>الشركة</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.employees.map((employee) => (
                                <tr key={employee.id}>
                                    <td style={{ fontWeight: 700, color: '#fff' }}>{employee.name}</td>
                                    <td dir="ltr" style={{ fontSize: 12, color: '#9CA3BC' }}>{employee.email ?? '—'}</td>
                                    <td dir="ltr" style={{ fontSize: 12, color: '#9CA3BC' }}>
                                        {employee.phone_tail ? `••••${employee.phone_tail}` : '—'}
                                    </td>
                                    <td style={{ fontSize: 12, color: '#C8D0E0' }}>{employee.company?.name ?? '—'}</td>
                                    <td style={{ fontSize: 12 }}>{employee.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {results.companies.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>الشركات</div>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>الشركة</th>
                                <th>البريد</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.companies.map((company) => (
                                <tr key={company.id}>
                                    <td style={{ fontWeight: 700, color: '#fff' }}>{company.name}</td>
                                    <td dir="ltr" style={{ fontSize: 12, color: '#9CA3BC' }}>{company.email ?? '—'}</td>
                                    <td style={{ fontSize: 12 }}>{company.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
                <div className="card">
                    <h3 style={{ marginTop: 0 }}>إعادة إرسال رمز الدخول</h3>
                    <p style={{ fontSize: 12, color: '#9CA3BC', lineHeight: 1.9 }}>
                        الحد ٣ طلبات في الساعة للرقم الواحد — مفروض في النظام لا في الإجراء، فالتجاوز مستحيل من هنا.
                    </p>
                    <form onSubmit={resendOtp}>
                        <div className="fg">
                            <label>رقم الجوال</label>
                            <input
                                value={otpForm.data.phone}
                                onChange={(e) => otpForm.setData('phone', e.target.value)}
                                dir="ltr"
                                placeholder="9665XXXXXXXX"
                                style={{ ...inputStyle, width: '100%' }}
                            />
                        </div>
                        {otpForm.errors.phone && <p style={{ fontSize: 12, color: '#E03050' }}>{otpForm.errors.phone}</p>}
                        <button type="submit" className="act-btn btn-approve" disabled={otpForm.processing}>
                            إرسال الرمز
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginTop: 0 }}>ما لا تفعله — يُصعَّد فوراً</h3>
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>الحالة</th>
                                <th>تُصعَّد إلى</th>
                            </tr>
                        </thead>
                        <tbody>
                            {escalation.map((row) => (
                                <tr key={row.action}>
                                    <td style={{ fontSize: 12, color: '#C8D0E0' }}>{row.label}</td>
                                    <td style={{ fontSize: 12, color: '#F5A623', fontWeight: 700 }}>{row.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
                <div style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>دعوات معلّقة — إعادة الإرسال</div>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>المدعو</th>
                            <th>الشركة</th>
                            <th>مرات الإرسال</th>
                            <th>تنتهي في</th>
                            <th>إجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingInvitations.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: 0 }}>
                                    <ListState tone="empty" title="لا دعوات معلّقة" hint="كل الدعوات إما قُبلت أو انتهت صلاحيتها." />
                                </td>
                            </tr>
                        ) : (
                            pendingInvitations.map((invitation) => (
                                <tr key={invitation.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#fff' }}>{invitation.name ?? '—'}</div>
                                        <div dir="ltr" style={{ fontSize: 10, color: '#6B7A99' }}>
                                            {invitation.email ?? (invitation.phone_tail ? `••••${invitation.phone_tail}` : '—')}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 12, color: '#C8D0E0' }}>{invitation.company?.name ?? '—'}</td>
                                    <td>{invitation.send_count}</td>
                                    <td style={{ fontSize: 12, color: '#6B7A99' }}>{invitation.expires_at?.slice(0, 10) ?? '—'}</td>
                                    <td>
                                        <button className="act-btn btn-view" onClick={() => setResendTarget(invitation)}>
                                            إعادة الإرسال
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                open={resendTarget !== null}
                title="إعادة إرسال الدعوة"
                message={
                    resendTarget
                        ? `ستُرسل دعوة جديدة إلى «${resendTarget.name ?? resendTarget.email ?? 'المدعو'}» وتُمدَّد صلاحية الرابط 7 أيام. عدد مرات الإرسال سيصبح ${resendTarget.send_count + 1}.`
                        : ''
                }
                confirmLabel="إرسال"
                onConfirm={confirmResend}
                onCancel={() => setResendTarget(null)}
            />
        </AdminLayout>
    );
}
