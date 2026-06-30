import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

interface Props {
    token: string;
    companyName: string;
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

export default function ActivateCompany({ token, companyName, email, activated }: Props) {
    const [step, setStep] = useState<1 | 2 | 3>(activated ? 2 : 1);

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
        post(`/company/activate/${token}`, {
            onSuccess: () => setStep(2),
        });
    }

    return (
        <>
            <Head title="تفعيل حساب شركة — تيمات" />
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
                        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                            {[1, 2, 3].map(s => (
                                <div key={s} style={{
                                    flex: 1, height: 4, borderRadius: 4,
                                    background: s <= step ? '#C8F135' : '#E8E2D8',
                                    transition: 'background .3s',
                                }} />
                            ))}
                        </div>

                        {/* Step 1: Set password */}
                        {step === 1 && (
                            <>
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A18', marginBottom: 4, fontFamily: "'Cairo', sans-serif" }}>تفعيل حساب شركة</h2>
                                <p style={{ fontSize: 13, color: '#8A8A7A', marginBottom: 24, lineHeight: 1.5 }}>
                                    تهانينا! تمت الموافقة على طلب شركتك. حدّد كلمة مرور لحسابك.
                                </p>

                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    background: '#1A1A1808', border: '1px solid #C8F13540', borderRadius: 12,
                                    padding: '8px 14px', marginBottom: 20,
                                }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A18' }}>{companyName}</span>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <div style={{ background: '#c0392b10', border: '1px solid #c0392b30', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
                                        {Object.values(errors).map((err, i) => (
                                            <p key={i} style={{ fontSize: 12, color: '#c0392b', margin: '0 0 4px', fontWeight: 600 }}>{err}</p>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={submitPassword}>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={labelStyle}>البريد الإلكتروني للشركة</label>
                                        <input
                                            type="email"
                                            value={email}
                                            readOnly
                                            dir="ltr"
                                            style={{ ...inputStyle, background: '#E8E2D8', color: '#8A8A7A', cursor: 'not-allowed' }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        <label style={labelStyle}>كلمة المرور الجديدة *</label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            dir="ltr"
                                            placeholder="8 رموز على الأقل"
                                            required
                                            style={inputStyle}
                                        />
                                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
                                            <Rule ok={hasMinLength} text="8 رموز على الأقل" />
                                            <Rule ok={hasNumber} text="يحتوي على رقم" />
                                            <Rule ok={hasLetter} text="يحتوي على حرف" />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 20 }}>
                                        <label style={labelStyle}>تأكيد كلمة المرور *</label>
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={e => setData('password_confirmation', e.target.value)}
                                            dir="ltr"
                                            placeholder="أعد كتابة كلمة المرور"
                                            required
                                            style={inputStyle}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing || !allValid}
                                        style={{
                                            ...btnStyle,
                                            opacity: (processing || !allValid) ? 0.5 : 1,
                                        }}
                                    >
                                        {processing ? 'جارٍ التفعيل...' : 'تفعيل الحساب'}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* Step 2: Next steps intro */}
                        {step === 2 && (
                            <>
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A18', marginBottom: 4, fontFamily: "'Cairo', sans-serif" }}>مرحباً بك في تيمات 🎉</h2>
                                <p style={{ fontSize: 13, color: '#8A8A7A', marginBottom: 24, lineHeight: 1.5 }}>
                                    حسابك مفعّل الآن. إليك ما تقدر تبدأ به:
                                </p>

                                <div style={{ background: '#F5F0E8', borderRadius: 12, padding: '16px 20px', marginBottom: 24, border: '1px solid #E8E2D8' }}>
                                    {[
                                        { n: '1', t: 'أنشئ مجتمعات رياضية لموظفيك (بادل، كرة قدم، تنس...)' },
                                        { n: '2', t: 'اشحن رصيد للمجتمعات لدعم فعالياتهم' },
                                        { n: '3', t: 'ادعُ موظفيك ليسجلوا ويبدأوا الاستخدام' },
                                        { n: '4', t: 'تابع نشاط الفعاليات والتقارير من لوحة التحكم' },
                                    ].map(item => (
                                        <div key={item.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 13, color: '#8A8A7A' }}>
                                            <div style={{
                                                width: 22, height: 22, borderRadius: '50%', background: '#1A1A18', color: '#C8F135',
                                                fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                                            }}>{item.n}</div>
                                            <span>{item.t}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setStep(3)}
                                    style={btnStyle}
                                >
                                    ابدأ إعداد شركتك
                                </button>
                            </>
                        )}

                        {/* Step 3: Done */}
                        {step === 3 && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 60, marginBottom: 16 }}>🚀</div>
                                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A18', marginBottom: 8, fontFamily: "'Cairo', sans-serif" }}>كل شيء جاهز!</h2>
                                <p style={{ fontSize: 14, color: '#8A8A7A', marginBottom: 28 }}>
                                    ستُحوَّل الآن لبوابة الشركة لتبدأ إعداد مجتمعات شركتك
                                </p>
                                <button
                                    onClick={() => router.visit('/company/dash')}
                                    style={btnStyle}
                                >
                                    الدخول لبوابة الشركة
                                </button>
                            </div>
                        )}

                        <div style={{ borderTop: '1px solid #E8E2D8', paddingTop: 16, marginTop: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: 11, color: '#8A8A7A', marginBottom: 8 }}>بوابات أخرى</div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <Link href="/business/login" style={{ padding: '6px 12px', border: '1px solid #E8E2D8', borderRadius: 8, fontSize: 12, color: '#8A8A7A', textDecoration: 'none' }}>مزودو الخدمة</Link>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: ok ? '#1A1A18' : '#8A8A7A' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: ok ? '#C8F135' : '#E8E2D8', transition: 'background .2s' }} />
            <span>{text}</span>
        </div>
    );
}
