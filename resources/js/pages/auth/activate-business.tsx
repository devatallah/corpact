import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

interface Props {
    token: string;
    businessName: string;
    email: string;
    activated?: boolean;
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #E8E2D8',
    borderRadius: 12,
    fontSize: 14,
    color: '#1A1A18',
    background: '#F5F0E8',
    outline: 'none',
    direction: 'ltr',
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

export default function Activatebusiness({ token, businessName, email, activated }: Props) {
    const [step, setStep] = useState<1 | 2>(activated ? 2 : 1);

    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const hasMinLength = data.password.length >= 8;
    const hasNumber = /\d/.test(data.password);
    const hasLetter = /[a-zA-Z]/.test(data.password);
    const passwordsMatch = data.password === data.password_confirmation && data.password.length > 0;
    const allValid = hasMinLength && hasNumber && hasLetter && passwordsMatch;

    function submitPassword(e: FormEvent) {
        e.preventDefault();
        post(`/business/activate/${token}`, {
            onSuccess: () => setStep(2),
        });
    }

    return (
        <>
            <Head title="تفعيل حساب مزود الخدمة — تيمات" />
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
                        {/* Progress bar */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
                            {[1, 2].map(s => (
                                <div key={s} style={{
                                    flex: 1, height: 4, borderRadius: 4,
                                    background: s <= step ? '#C8F135' : '#E8E2D8',
                                    transition: 'background .3s',
                                }} />
                            ))}
                        </div>

                        {step === 1 && (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A18', marginBottom: 4, fontFamily: "'Cairo', sans-serif" }}>
                                        مرحباً بك في تيمات
                                    </h2>
                                    <p style={{ fontSize: 13, color: '#8A8A7A' }}>
                                        {businessName} — قم بتعيين كلمة المرور لتفعيل حسابك
                                    </p>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <div style={{ background: '#c0392b10', border: '1px solid #c0392b30', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                                        {Object.values(errors).map((err, i) => (
                                            <p key={i} style={{ fontSize: 12, color: '#c0392b', margin: '0 0 4px' }}>{err}</p>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={submitPassword}>
                                    <div style={{ marginBottom: 14 }}>
                                        <label style={labelStyle}>البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            value={email}
                                            readOnly
                                            dir="ltr"
                                            style={{
                                                ...inputStyle,
                                                background: '#E8E2D8',
                                                color: '#8A8A7A',
                                                cursor: 'not-allowed',
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: 14 }}>
                                        <label style={labelStyle}>كلمة المرور *</label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            dir="ltr"
                                            placeholder="••••••••"
                                            required
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        <label style={labelStyle}>تأكيد كلمة المرور *</label>
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={e => setData('password_confirmation', e.target.value)}
                                            dir="ltr"
                                            placeholder="••••••••"
                                            required
                                            style={inputStyle}
                                        />
                                    </div>

                                    {/* Password rules */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, fontSize: 12 }}>
                                        <Rule ok={hasMinLength} text="8 أحرف على الأقل" />
                                        <Rule ok={hasNumber} text="يحتوي على رقم واحد على الأقل" />
                                        <Rule ok={hasLetter} text="يحتوي على حرف واحد على الأقل" />
                                        <Rule ok={passwordsMatch} text="كلمتا المرور متطابقتان" />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing || !allValid}
                                        style={{
                                            ...btnStyle,
                                            opacity: (processing || !allValid) ? 0.5 : 1,
                                        }}
                                    >
                                        {processing ? 'جارٍ التفعيل...' : 'تعيين كلمة المرور'}
                                    </button>
                                </form>
                            </>
                        )}

                        {step === 2 && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A18', marginBottom: 8, fontFamily: "'Cairo', sans-serif" }}>تم تفعيل حسابك!</h2>
                                <p style={{ fontSize: 13, color: '#8A8A7A', marginBottom: 24, lineHeight: 1.7 }}>
                                    مرحباً بك في تيمات! حسابك جاهز الآن.
                                </p>

                                <div style={{ textAlign: 'right', background: '#F5F0E8', borderRadius: 12, padding: '20px 24px', marginBottom: 24, border: '1px solid #E8E2D8' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: '#1A1A18', fontFamily: "'Cairo', sans-serif" }}>خطواتك القادمة</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        {[
                                            { icon: '🏟️', t: 'إعداد المرافق', d: 'أضف مرافقك وحدد أنواع الفئات' },
                                            { icon: '⏰', t: 'تحديد المواعيد', d: 'حدد أوقات العمل والأسعار' },
                                            { icon: '📋', t: 'إدارة الحجوزات', d: 'ستتلقى طلبات الحجز من الشركات' },
                                            { icon: '💰', t: 'متابعة الإيرادات', d: 'تابع التسويات والمدفوعات' },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: 10, background: '#1A1A1810',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                                                }}>{item.icon}</div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A18' }}>{item.t}</div>
                                                    <div style={{ fontSize: 12, color: '#8A8A7A' }}>{item.d}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.visit('/business/dash')}
                                    style={btnStyle}
                                >
                                    الدخول للوحة التحكم
                                </button>
                            </div>
                        )}

                        <div style={{ borderTop: '1px solid #E8E2D8', paddingTop: 16, marginTop: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: 11, color: '#8A8A7A', marginBottom: 8 }}>بوابات أخرى</div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <Link href="/company/login" style={{ padding: '6px 12px', border: '1px solid #E8E2D8', borderRadius: 8, fontSize: 12, color: '#8A8A7A', textDecoration: 'none' }}>الشركات</Link>
                                <Link href="/employee/login" style={{ padding: '6px 12px', border: '1px solid #E8E2D8', borderRadius: 8, fontSize: 12, color: '#8A8A7A', textDecoration: 'none' }}>الموظفون</Link>
                            </div>
                        </div>
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

function Rule({ ok, text }: { ok: boolean; text: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: ok ? '#1A1A18' : '#8A8A7A' }}>
            <span style={{ fontSize: 14, color: ok ? '#C8F135' : '#8A8A7A' }}>{ok ? '✓' : '○'}</span>
            <span>{text}</span>
        </div>
    );
}
