import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

interface Props {
    invitation: {
        token: string;
        email: string;
        name?: string | null;
        phone?: string | null;
        phone_locked?: boolean;
        company_name: string;
    };
    /** Server-driven: 'otp' once a code has been sent to the invited number. */
    step?: 'details' | 'otp';
    pendingPhone?: string | null;
    status?: string | null;
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #F6F8F5',
    borderRadius: 12,
    fontSize: 14,
    color: '#0A0A0A',
    background: '#F6F8F5',
    outline: 'none',
    fontFamily: "'Almarai', sans-serif",
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    color: 'rgba(10,10,10,.55)',
    fontWeight: 500,
    marginBottom: 6,
    fontFamily: "'Almarai', sans-serif",
};

const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: 14,
    background: '#0A0A0A',
    color: '#C8FF00',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Almarai', sans-serif",
    cursor: 'pointer',
};

export default function AcceptInvitation({ invitation, step = 'details', pendingPhone, status }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: invitation.name ?? '',
        phone: invitation.phone ?? '',
    });

    const otpForm = useForm({ code: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/invite/${invitation.token}`);
    }

    function submitCode(e: FormEvent) {
        e.preventDefault();
        otpForm.post(`/invite/${invitation.token}/verify`);
    }

    return (
        <>
            <Head title="قبول الدعوة" />

            <div dir="rtl" style={{
                minHeight: '100vh',
                background: '#F6F8F5',
                fontFamily: "'Almarai', sans-serif",
            }}>
                {/* Nav bar */}
                <nav style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'rgba(245,240,232,.8)', backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid #F6F8F5',
                }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                            <svg width="32" height="32" viewBox="0 0 52 52"><rect width="52" height="52" rx="13" fill="#C8FF00"/><rect x="11" y="13" width="30" height="8" rx="2.5" fill="#0A0A0A"/><rect x="21" y="21" width="10" height="20" rx="2.5" fill="#0A0A0A"/></svg>
                                <span style={{ fontFamily: "'Almarai', sans-serif", fontWeight: 800, fontSize: 22, color: '#0A0A0A' }}>تيمات</span>
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <a href="/companies" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(10,10,10,.55)', textDecoration: 'none', fontFamily: "'Almarai', sans-serif" }}>للشركات</a>
                            <a href="/employees" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(10,10,10,.55)', textDecoration: 'none', fontFamily: "'Almarai', sans-serif" }}>للموظفين</a>
                            <a href="/partners" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(10,10,10,.55)', textDecoration: 'none', fontFamily: "'Almarai', sans-serif" }}>للشركاء</a>
                        </div>
                    </div>
                </nav>

                {/* Center content */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 16px' }}>
                    <div style={{
                        background: '#fff',
                        border: '1px solid #F6F8F5',
                        borderRadius: 20,
                        padding: '36px 32px',
                        width: '100%',
                        maxWidth: 460,
                        boxShadow: '0 4px 24px rgba(26,26,24,.06)',
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#0A0A0A08', border: '1px solid #C8FF0040', padding: '6px 14px', borderRadius: 99,
                                fontSize: 12, fontWeight: 700, color: '#0A0A0A', marginBottom: 12,
                            }}>
                                دعوة موظف
                            </div>
                            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0A0A0A', marginBottom: 4, fontFamily: "'Almarai', sans-serif" }}>مرحباً بك!</h1>
                            <p style={{ fontSize: 13, color: 'rgba(10,10,10,.55)' }}>
                                تمت دعوتك للانضمام إلى <strong style={{ color: '#0A0A0A' }}>{invitation.company_name}</strong>
                            </p>
                        </div>

                        <div style={{ background: '#F6F8F5', borderRadius: 12, padding: 12, textAlign: 'center', fontSize: 13, marginBottom: 20, border: '1px solid #F6F8F5' }}>
                            <span style={{ color: 'rgba(10,10,10,.55)' }}>البريد: </span>
                            <span style={{ fontWeight: 600, color: '#0A0A0A' }} dir="ltr">{invitation.email}</span>
                        </div>

                        {status === 'otp-sent' && (
                            <div style={{ background: '#C8FF0020', border: '1px solid #C8FF0060', borderRadius: 12, padding: 12, textAlign: 'center', fontSize: 12, color: '#0A0A0A', marginBottom: 16 }}>
                                أرسلنا رمز تحقق إلى <span dir="ltr">{pendingPhone}</span>
                            </div>
                        )}

                        {step === 'otp' ? (
                            <form onSubmit={submitCode}>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={labelStyle}>رمز التحقق</label>
                                    <input
                                        style={{ ...inputStyle, direction: 'ltr', textAlign: 'center', letterSpacing: 6, fontSize: 18 }}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        autoFocus
                                        maxLength={6}
                                        placeholder="------"
                                        value={otpForm.data.code}
                                        onChange={(e) => otpForm.setData('code', e.target.value)}
                                    />
                                    {otpForm.errors.code && <p style={{ fontSize: 12, color: '#D9381E', marginTop: 4 }}>{otpForm.errors.code}</p>}
                                    {/* حدود الطلب والقفل تعود على المفتاح `phone` من خدمة الرمز. */}
                                    {errors.phone && <p style={{ fontSize: 12, color: '#D9381E', marginTop: 4 }}>{errors.phone}</p>}
                                    <p style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginTop: 6 }}>
                                        الرمز يثبت أن الرقم رقمك — لا يُنشأ الحساب ولا تُفتح الجلسة قبل التحقق.
                                    </p>
                                </div>

                                <button type="submit" disabled={otpForm.processing} style={{ ...btnStyle, opacity: otpForm.processing ? 0.6 : 1 }}>
                                    {otpForm.processing ? 'جارٍ التحقق...' : 'تأكيد وإنشاء الحساب'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => post(`/invite/${invitation.token}`)}
                                    disabled={processing}
                                    style={{ width: '100%', marginTop: 10, padding: 10, background: 'transparent', border: 'none', color: 'rgba(10,10,10,.55)', fontSize: 12, cursor: 'pointer', fontFamily: "'Almarai', sans-serif" }}
                                >
                                    إعادة إرسال الرمز
                                </button>
                            </form>
                        ) : (
                        <form onSubmit={submit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>الاسم الكامل</label>
                                <input
                                    style={inputStyle}
                                    type="text"
                                    autoFocus
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p style={{ fontSize: 12, color: '#D9381E', marginTop: 4 }}>{errors.name}</p>}
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>رقم الجوال</label>
                                <input
                                    style={{ ...inputStyle, direction: 'ltr', textAlign: 'center', opacity: invitation.phone_locked ? 0.7 : 1 }}
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    placeholder="05xxxxxxxx"
                                    value={data.phone}
                                    readOnly={invitation.phone_locked}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                {errors.phone && <p style={{ fontSize: 12, color: '#D9381E', marginTop: 4 }}>{errors.phone}</p>}
                                <p style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginTop: 6 }}>
                                    {invitation.phone_locked
                                        ? 'هذا الرقم من ملف شركتك وسيكون هوية دخولك — تسجيل الدخول برمز تحقق يصل عبر واتساب.'
                                        : 'لا كلمة مرور — تسجيل الدخول يتم برقم الجوال ورمز تحقق يصل عبر واتساب.'}
                                </p>
                            </div>

                            <button type="submit" disabled={processing} style={{ ...btnStyle, opacity: processing ? 0.6 : 1 }}>
                                {processing ? 'جارٍ الإرسال...' : 'إرسال رمز التحقق'}
                            </button>
                        </form>
                        )}

                        <div style={{ borderTop: '1px solid #F6F8F5', paddingTop: 16, marginTop: 20, textAlign: 'center' }}>
                            <p style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginBottom: 8 }}>بوابات أخرى</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                <Link href="/company/login" style={{ padding: '6px 12px', border: '1px solid #F6F8F5', borderRadius: 8, fontSize: 12, color: 'rgba(10,10,10,.55)', textDecoration: 'none' }}>الشركات</Link>
                                <Link href="/partner/login" style={{ padding: '6px 12px', border: '1px solid #F6F8F5', borderRadius: 8, fontSize: 12, color: 'rgba(10,10,10,.55)', textDecoration: 'none' }}>الشركاء</Link>
                                <Link href="/employee/login" style={{ padding: '6px 12px', border: '1px solid #F6F8F5', borderRadius: 8, fontSize: 12, color: 'rgba(10,10,10,.55)', textDecoration: 'none' }}>الموظفون</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', padding: '20px', fontSize: 12, color: 'rgba(10,10,10,.55)', fontFamily: "'IBM Plex Mono', monospace" }}>
                    &copy; 2026 تيمات. جميع الحقوق محفوظة.
                </div>
            </div>
        </>
    );
}
