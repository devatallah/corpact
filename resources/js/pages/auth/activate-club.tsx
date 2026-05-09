import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

interface Props {
    token: string;
    clubName: string;
    email: string;
    activated?: boolean;
}

export default function ActivateClub({ token, clubName, email, activated }: Props) {
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
        post(`/club/activate/${token}`, {
            onSuccess: () => setStep(2),
        });
    }

    return (
        <>
            <Head title="تفعيل حساب النادي — كورباكت" />
            <div className="activate-page" dir="rtl">
                <div className="activate-card">
                    {/* Progress bar */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{
                                flex: 1, height: 4, borderRadius: 4,
                                background: s <= step ? '#009E82' : '#232A3E',
                                transition: 'background .3s',
                            }} />
                        ))}
                    </div>

                    {step === 1 && (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: '50%', background: '#009E8220',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 26, margin: '0 auto 12px',
                                }}>🏟️</div>
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                                    مرحبًا بك في كورباكت
                                </h2>
                                <p style={{ fontSize: 13, color: '#6B7A99' }}>
                                    {clubName} — قم بتعيين كلمة المرور لتفعيل حسابك
                                </p>
                            </div>

                            {Object.keys(errors).length > 0 && (
                                <div style={{ background: 'rgba(224,48,80,.1)', border: '1px solid rgba(224,48,80,.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                                    {Object.values(errors).map((err, i) => (
                                        <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px' }}>{err}</p>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={submitPassword}>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7A99', marginBottom: 5 }}>البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        value={email}
                                        readOnly
                                        dir="ltr"
                                        style={{
                                            width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #232A3E',
                                            fontSize: 13, background: '#0A0D14', color: '#6B7A99', outline: 'none', fontFamily: 'inherit',
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7A99', marginBottom: 5 }}>كلمة المرور *</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        dir="ltr"
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #232A3E',
                                            fontSize: 13, background: '#0F1117', color: '#E8EAF0', outline: 'none', fontFamily: 'inherit',
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7A99', marginBottom: 5 }}>تأكيد كلمة المرور *</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        dir="ltr"
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #232A3E',
                                            fontSize: 13, background: '#0F1117', color: '#E8EAF0', outline: 'none', fontFamily: 'inherit',
                                        }}
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
                                        width: '100%', padding: 13, background: '#009E82', color: '#fff', border: 'none',
                                        borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
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
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>تم تفعيل حسابك!</h2>
                            <p style={{ fontSize: 13, color: '#6B7A99', marginBottom: 24, lineHeight: 1.7 }}>
                                مرحبًا بك في كورباكت! حسابك جاهز الآن.
                            </p>

                            <div style={{ textAlign: 'right', background: '#0F1117', borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: '#fff' }}>خطواتك القادمة</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {[
                                        { icon: '🏟️', t: 'إعداد الملاعب', d: 'أضف ملاعبك وحدد أنواع الرياضات' },
                                        { icon: '⏰', t: 'تحديد المواعيد', d: 'حدد أوقات العمل والأسعار' },
                                        { icon: '📋', t: 'إدارة الحجوزات', d: 'ستتلقى طلبات الحجز من الشركات' },
                                        { icon: '💰', t: 'متابعة الإيرادات', d: 'تابع التسويات والمدفوعات' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 10, background: '#009E8215',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                                            }}>{item.icon}</div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{item.t}</div>
                                                <div style={{ fontSize: 12, color: '#6B7A99' }}>{item.d}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => router.visit('/club/dash')}
                                style={{
                                    width: '100%', padding: 13, background: '#009E82', color: '#fff', border: 'none',
                                    borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                }}
                            >
                                الدخول للوحة التحكم
                            </button>
                        </div>
                    )}

                    <div style={{ borderTop: '1px solid #E4E9F2', paddingTop: 16, marginTop: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#6B7A99', marginBottom: 8 }}>بوابات أخرى</div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <Link href="/company/login" style={{ padding: '6px 12px', border: '1px solid #E4E9F2', borderRadius: 8, fontSize: 12, color: '#4A5C78', textDecoration: 'none' }}>🏢 الشركات</Link>
                            <Link href="/employee/login" style={{ padding: '6px 12px', border: '1px solid #E4E9F2', borderRadius: 8, fontSize: 12, color: '#4A5C78', textDecoration: 'none' }}>👥 الموظفون</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function Rule({ ok, text }: { ok: boolean; text: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: ok ? '#009E82' : '#6B7A99' }}>
            <span style={{ fontSize: 14 }}>{ok ? '✓' : '○'}</span>
            <span>{text}</span>
        </div>
    );
}
