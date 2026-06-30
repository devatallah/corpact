import { Head, useForm, Link } from '@inertiajs/react';
import type { FormEvent } from 'react';

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #E8E2D8',
    borderRadius: 12,
    fontSize: 14,
    color: '#1A1A18',
    background: '#F5F0E8',
    outline: 'none',
    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    color: '#8A8A7A',
    fontWeight: 500,
    marginBottom: 6,
    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
};

const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: 14,
    background: '#1A1A18',
    color: '#C8F135',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
};

export default function RegisterEmployee() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/employee/register');
    }

    return (
        <>
            <Head title="تسجيل موظف — تيمات" />
            <div dir="rtl" style={{
                minHeight: '100vh',
                background: '#F5F0E8',
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            }}>
                {/* Nav bar */}
                <nav style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'rgba(245,240,232,.8)', backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid #E8E2D8',
                }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                            <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 22, color: '#1A1A18' }}>تيمات</span>
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <a href="/companies" style={{ fontSize: 14, fontWeight: 600, color: '#8A8A7A', textDecoration: 'none', fontFamily: "'Cairo', sans-serif" }}>للشركات</a>
                            <a href="/employees" style={{ fontSize: 14, fontWeight: 600, color: '#8A8A7A', textDecoration: 'none', fontFamily: "'Cairo', sans-serif" }}>للموظفين</a>
                            <a href="/businesses" style={{ fontSize: 14, fontWeight: 600, color: '#8A8A7A', textDecoration: 'none', fontFamily: "'Cairo', sans-serif" }}>لمزودي الخدمة</a>
                        </div>
                    </div>
                </nav>

                {/* Center content */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 16px' }}>
                    <div style={{
                        background: '#fff',
                        border: '1px solid #E8E2D8',
                        borderRadius: 20,
                        padding: '36px 32px',
                        width: '100%',
                        maxWidth: 460,
                        boxShadow: '0 4px 24px rgba(26,26,24,.06)',
                    }}>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A18', marginBottom: 4, fontFamily: "'Cairo', sans-serif" }}>تسجيل حساب موظف</h1>
                        <p style={{ fontSize: 13, color: '#8A8A7A', marginBottom: 28, lineHeight: 1.5 }}>
                            استخدم بريدك الإلكتروني الخاص بالشركة للتسجيل
                        </p>

                        <div style={{ background: '#1A1A1808', border: '1px solid #C8F13540', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 12, color: '#1A1A18', lineHeight: 1.7 }}>
                            <strong style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>يجب أن تكون شركتك مسجلة في المنصة</strong>
                            سيتم التحقق من نطاق بريدك الإلكتروني (الجزء بعد @) ومطابقته مع الشركات المسجلة.
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div style={{ background: '#c0392b10', border: '1px solid #c0392b30', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
                                {Object.values(errors).map((err, i) => (
                                    <p key={i} style={{ fontSize: 12, color: '#c0392b', margin: '0 0 4px', fontWeight: 600 }}>{err}</p>
                                ))}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>الاسم الكامل *</label>
                                <input
                                    style={inputStyle}
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="أحمد محمد"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>البريد الإلكتروني *</label>
                                <input
                                    style={{ ...inputStyle, direction: 'ltr' }}
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@company.com"
                                    required
                                />
                                <div style={{ fontSize: 11, color: '#8A8A7A', marginTop: 5, lineHeight: 1.5 }}>
                                    يجب أن يكون بريد الشركة (مثال: <strong style={{ color: '#C4622D' }}>ahmed@company.com</strong>)
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>رقم الجوال</label>
                                <input
                                    style={{ ...inputStyle, direction: 'ltr' }}
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="05XXXXXXXX"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                <div>
                                    <label style={labelStyle}>كلمة المرور *</label>
                                    <input
                                        style={{ ...inputStyle, direction: 'ltr' }}
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="8 أحرف على الأقل"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>تأكيد كلمة المرور *</label>
                                    <input
                                        style={{ ...inputStyle, direction: 'ltr' }}
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="أعد كتابة كلمة المرور"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                style={{ ...btnStyle, opacity: processing ? 0.6 : 1, marginBottom: 16 }}
                            >
                                {processing ? 'جارٍ التسجيل...' : 'إنشاء حساب'}
                            </button>

                            <p style={{ textAlign: 'center', fontSize: 13, color: '#8A8A7A' }}>
                                لديك حساب بالفعل؟{' '}
                                <Link href="/employee/login" style={{ color: '#C4622D', fontWeight: 600, textDecoration: 'none' }}>
                                    سجّل دخولك
                                </Link>
                            </p>

                            <div style={{ borderTop: '1px solid #E8E2D8', paddingTop: 16, marginTop: 16, textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: '#8A8A7A', marginBottom: 8 }}>بوابات أخرى</div>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                    <Link href="/company/login" style={{ padding: '6px 12px', border: '1px solid #E8E2D8', borderRadius: 8, fontSize: 12, color: '#8A8A7A', textDecoration: 'none' }}>الشركات</Link>
                                    <Link href="/business/login" style={{ padding: '6px 12px', border: '1px solid #E8E2D8', borderRadius: 8, fontSize: 12, color: '#8A8A7A', textDecoration: 'none' }}>المنشآت</Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', padding: '20px', fontSize: 12, color: '#8A8A7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                    &copy; 2026 تيمات. جميع الحقوق محفوظة.
                </div>
            </div>
        </>
    );
}
