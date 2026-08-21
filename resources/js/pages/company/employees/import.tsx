import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import CompanyLayout from '@/layouts/company-layout';

interface ImportRow {
    id: number;
    row_number: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    department_name: string | null;
    employee_number: string | null;
    errors: string[] | null;
}

interface EmployeeImport {
    id: number;
    original_filename: string;
    status: 'needs_correction' | 'ready' | 'invited';
    total_rows: number;
    valid_rows: number;
    error_rows: number;
    created_at: string;
    invited_at: string | null;
    rows?: ImportRow[];
}

interface Invitation {
    id: number;
    email: string;
    name: string | null;
    phone: string | null;
    status: string;
    expires_at: string | null;
    last_sent_at: string | null;
    send_count: number;
}

interface Props {
    latestImport: EmployeeImport | null;
    imports: EmployeeImport[];
    invitations: Invitation[];
}

const statusLabels: Record<EmployeeImport['status'], string> = {
    needs_correction: 'يحتاج تصحيحاً',
    ready: 'جاهز للدعوات',
    invited: 'أُرسلت الدعوات',
};

const statusColors: Record<EmployeeImport['status'], string> = {
    needs_correction: '#E03050',
    ready: '#2A9D5C',
    invited: '#3B5BDB',
};

export default function EmployeesImport({ latestImport, imports, invitations }: Props) {
    const form = useForm<{ file: File | null }>({ file: null });

    function handleUpload(e: FormEvent) {
        e.preventDefault();
        form.post('/company/employees/import', {
            forceFormData: true,
            onSuccess: () => form.reset(),
        });
    }

    function sendInvites(importId: number) {
        router.post(`/company/employees/import/${importId}/invites`);
    }

    function resendInvitation(invitationId: number) {
        router.post(`/company/invitations/${invitationId}/resend`);
    }

    return (
        <CompanyLayout>
            <Head title="استيراد الموظفين" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Link href="/company/employees" style={{ color: '#7A8BA8', textDecoration: 'none', fontSize: 14 }}>
                    ← الموظفون
                </Link>
                <span style={{ color: '#C8D0E0' }}>/</span>
                <span style={{ fontWeight: 700 }}>استيراد ملف الموظفين</span>
            </div>

            {/* Upload card */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>رفع ملف CSV أو Excel</div>
                <div style={{ fontSize: 13, color: '#7A8BA8', marginBottom: 16 }}>
                    الأعمدة: الاسم · بريد العمل · رقم الجوال · الإدارة · الرقم الوظيفي (اختياري).
                    يتحقق النظام فوراً من صيغة الجوال السعودي والتكرار داخل الملف ومع الموظفين القائمين.
                </div>
                <form onSubmit={handleUpload} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="file"
                        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)}
                        style={{ fontSize: 13 }}
                    />
                    <button
                        type="submit"
                        disabled={form.processing || !form.data.file}
                        style={{ background: '#3B5BDB', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: form.processing || !form.data.file ? 0.6 : 1 }}
                    >
                        {form.processing ? 'جارٍ التحقق...' : 'رفع والتحقق'}
                    </button>
                </form>
                {form.errors.file && <p style={{ fontSize: 12, color: '#E03050', marginTop: 8 }}>{form.errors.file}</p>}
            </div>

            {/* Latest import result */}
            {latestImport && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                        <div>
                            <span style={{ fontSize: 15, fontWeight: 700 }}>{latestImport.original_filename}</span>{' '}
                            <span style={{ fontSize: 12, fontWeight: 700, color: statusColors[latestImport.status] }}>
                                — {statusLabels[latestImport.status]}
                            </span>
                            <div style={{ fontSize: 12, color: '#7A8BA8', marginTop: 2 }}>
                                {latestImport.total_rows} صف · {latestImport.valid_rows} سليم · {latestImport.error_rows} بأخطاء
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {latestImport.error_rows > 0 && (
                                <a
                                    href={`/company/employees/import/${latestImport.id}/errors`}
                                    style={{ background: '#E03050', color: '#fff', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
                                >
                                    ⬇ تنزيل تقرير الأخطاء
                                </a>
                            )}
                            {latestImport.status === 'ready' && (
                                <button
                                    onClick={() => sendInvites(latestImport.id)}
                                    style={{ background: '#2A9D5C', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                    إرسال الدعوات عبر واتساب
                                </button>
                            )}
                        </div>
                    </div>

                    {latestImport.error_rows > 0 && (
                        <div style={{ background: '#E0305010', border: '1px solid #E0305033', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#E03050' }}>
                            لا يمكن إرسال الدعوات قبل خلو تقرير الأخطاء — صحّح الملف وأعد الرفع.
                        </div>
                    )}

                    {latestImport.rows && latestImport.rows.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="portal-table">
                                <thead>
                                    <tr>
                                        <th>السطر</th>
                                        <th>الاسم</th>
                                        <th>بريد العمل</th>
                                        <th>الجوال</th>
                                        <th>الإدارة</th>
                                        <th>الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestImport.rows.map((row) => (
                                        <tr key={row.id}>
                                            <td>{row.row_number}</td>
                                            <td>{row.name ?? '—'}</td>
                                            <td dir="ltr">{row.email ?? '—'}</td>
                                            <td dir="ltr">{row.phone ?? '—'}</td>
                                            <td>{row.department_name ?? '—'}</td>
                                            <td>
                                                {row.errors ? (
                                                    <span style={{ color: '#E03050', fontSize: 12 }}>{row.errors.join(' · ')}</span>
                                                ) : (
                                                    <span style={{ color: '#2A9D5C', fontSize: 12, fontWeight: 700 }}>سليم</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Pending / expired invitations */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>الدعوات غير المفعّلة</div>
                <div style={{ fontSize: 13, color: '#7A8BA8', marginBottom: 12 }}>
                    الرابط صالح 7 أيام وقابل لإعادة الإرسال — الرابط المنتهي يُعاد إرساله ولا يُنشأ حساب جديد.
                </div>
                {invitations.length === 0 ? (
                    <div style={{ fontSize: 13, color: '#7A8BA8' }}>لا توجد دعوات معلّقة.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="portal-table">
                            <thead>
                                <tr>
                                    <th>الموظف</th>
                                    <th>الجوال</th>
                                    <th>الحالة</th>
                                    <th>مرات الإرسال</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {invitations.map((invitation) => (
                                    <tr key={invitation.id}>
                                        <td>
                                            {invitation.name ?? '—'}
                                            <div style={{ fontSize: 11, color: '#7A8BA8' }} dir="ltr">{invitation.email}</div>
                                        </td>
                                        <td dir="ltr">{invitation.phone ?? '—'}</td>
                                        <td>
                                            {invitation.status === 'expired' ? (
                                                <span style={{ color: '#E03050', fontSize: 12, fontWeight: 700 }}>منتهية</span>
                                            ) : (
                                                <span style={{ color: '#B8860B', fontSize: 12, fontWeight: 700 }}>معلّقة</span>
                                            )}
                                        </td>
                                        <td>{invitation.send_count}</td>
                                        <td>
                                            <button
                                                onClick={() => resendInvitation(invitation.id)}
                                                style={{ background: '#E2E8F4', color: '#4A5C78', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                            >
                                                إعادة الإرسال
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Import history */}
            {imports.length > 1 && (
                <div style={{ background: '#fff', border: '1px solid #E2E8F4', borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>ملفات سابقة</div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="portal-table">
                            <thead>
                                <tr>
                                    <th>الملف</th>
                                    <th>الصفوف</th>
                                    <th>الأخطاء</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {imports.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.original_filename}</td>
                                        <td>{item.total_rows}</td>
                                        <td>{item.error_rows}</td>
                                        <td style={{ color: statusColors[item.status], fontSize: 12, fontWeight: 700 }}>
                                            {statusLabels[item.status]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </CompanyLayout>
    );
}
