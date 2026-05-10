import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

interface Props {
    token: string;
    companyName: string;
    email: string;
    activated?: boolean;
}

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
            <div className="co-reg-page" dir="rtl">
                <div className="co-reg-logo">
                    <div className="co-reg-logo-ar">تيمات</div>
                    <div className="co-reg-logo-en">TEAMAT</div>
                </div>
                <div className="co-reg-card" style={{ maxWidth: 460 }}>
                    {/* Progress bar */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                        {[1, 2, 3].map(s => (
                            <div key={s} style={{
                                flex: 1, height: 4, borderRadius: 4,
                                background: s <= step ? '#3B5BDB' : '#E4E9F2',
                                transition: 'background .3s',
                            }} />
                        ))}
                    </div>

                    {/* Step 1: Set password */}
                    {step === 1 && (
                        <>
                            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F1923', marginBottom: 4 }}>تفعيل حساب شركة</h2>
                            <p style={{ fontSize: 13, color: '#7A8BA8', marginBottom: 24, lineHeight: 1.5 }}>
                                تهانينا! تمت الموافقة على طلب شركتك. حدّد كلمة مرور لحسابك.
                            </p>

                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: '#3B5BDB10', border: '1px solid #3B5BDB33', borderRadius: 10,
                                padding: '8px 14px', marginBottom: 20,
                            }}>
                                <span style={{ fontSize: 18 }}>🏢</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#3B5BDB' }}>{companyName}</span>
                            </div>

                            {Object.keys(errors).length > 0 && (
                                <div style={{ background: '#E0305018', border: '1px solid #E0305033', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                                    {Object.values(errors).map((err, i) => (
                                        <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px', fontWeight: 600 }}>{err}</p>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={submitPassword}>
                                <div className="co-field">
                                    <label>البريد الإلكتروني للشركة</label>
                                    <input type="email" value={email} readOnly dir="ltr" style={{ color: '#7A8BA8', cursor: 'not-allowed' }} />
                                </div>

                                <div className="co-field">
                                    <label>كلمة المرور الجديدة *</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        dir="ltr"
                                        placeholder="8 رموز على الأقل"
                                        required
                                    />
                                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#7A8BA8' }}>
                                        <Rule ok={hasMinLength} text="8 رموز على الأقل" />
                                        <Rule ok={hasNumber} text="يحتوي على رقم" />
                                        <Rule ok={hasLetter} text="يحتوي على حرف" />
                                    </div>
                                </div>

                                <div className="co-field">
                                    <label>تأكيد كلمة المرور *</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        dir="ltr"
                                        placeholder="أعد كتابة كلمة المرور"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || !allValid}
                                    className="co-submit-btn"
                                    style={{ opacity: (processing || !allValid) ? 0.5 : 1 }}
                                >
                                    {processing ? 'جارٍ التفعيل...' : 'تفعيل الحساب ←'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 2: Next steps intro */}
                    {step === 2 && (
                        <>
                            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F1923', marginBottom: 4 }}>مرحباً بك في تيمات 🎉</h2>
                            <p style={{ fontSize: 13, color: '#7A8BA8', marginBottom: 24, lineHeight: 1.5 }}>
                                حسابك مفعّل الآن. إليك ما تقدر تبدأ به:
                            </p>

                            <div style={{ background: '#F4F6FA', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
                                {[
                                    { n: '1', t: 'أنشئ مجتمعات رياضية لموظفيك (بادل، كرة قدم، تنس...)' },
                                    { n: '2', t: 'اشحن رصيد للمجتمعات لدعم فعالياتهم' },
                                    { n: '3', t: 'ادعُ موظفيك ليسجلوا ويبدأوا الاستخدام' },
                                    { n: '4', t: 'تابع نشاط الفعاليات والتقارير من لوحة التحكم' },
                                ].map(item => (
                                    <div key={item.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 13, color: '#4A5C78' }}>
                                        <div style={{
                                            width: 22, height: 22, borderRadius: '50%', background: '#3B5BDB', color: '#fff',
                                            fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                                        }}>{item.n}</div>
                                        <span>{item.t}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(3)}
                                className="co-submit-btn"
                            >
                                ابدأ إعداد شركتك ←
                            </button>
                        </>
                    )}

                    {/* Step 3: Done */}
                    {step === 3 && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 60, marginBottom: 16 }}>🚀</div>
                            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F1923', marginBottom: 8 }}>كل شيء جاهز!</h2>
                            <p style={{ fontSize: 14, color: '#7A8BA8', marginBottom: 28 }}>
                                ستُحوَّل الآن لبوابة الشركة لتبدأ إعداد مجتمعات شركتك
                            </p>
                            <button
                                onClick={() => router.visit('/company/dash')}
                                className="co-submit-btn"
                            >
                                الدخول لبوابة الشركة ←
                            </button>
                        </div>
                    )}

                    <div style={{ borderTop: '1px solid #E4E9F2', paddingTop: 16, marginTop: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 8 }}>بوابات أخرى</div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <Link href="/club/login" style={{ padding: '6px 12px', border: '1px solid #E4E9F2', borderRadius: 8, fontSize: 12, color: '#4A5C78', textDecoration: 'none' }}>🏟️ الأندية</Link>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: ok ? '#009E82' : '#7A8BA8' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: ok ? '#009E82' : '#E4E9F2', transition: 'background .2s' }} />
            <span>{text}</span>
        </div>
    );
}
