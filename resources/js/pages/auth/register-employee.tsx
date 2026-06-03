import { Head, useForm, Link } from '@inertiajs/react';
import type { FormEvent } from 'react';

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
            <div className="co-reg-page" dir="rtl">
                <div className="co-reg-logo">
                    <div className="co-reg-logo-ar">تيمات</div>
                    <div className="co-reg-logo-en">TEAMAT</div>
                </div>
                <div className="co-reg-card">
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0F1923', marginBottom: 4 }}>تسجيل حساب موظف</h1>
                    <p style={{ fontSize: 13, color: '#7A8BA8', marginBottom: 28, lineHeight: 1.5 }}>
                        استخدم بريدك الإلكتروني الخاص بالشركة للتسجيل
                    </p>

                    <div style={{ background: '#009E8210', border: '1px solid #009E8233', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 12, color: '#009E82', lineHeight: 1.7 }}>
                        <strong style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>يجب أن تكون شركتك مسجلة في المنصة</strong>
                        سيتم التحقق من نطاق بريدك الإلكتروني (الجزء بعد @) ومطابقته مع الشركات المسجلة.
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <div style={{ background: '#E0305018', border: '1px solid #E0305033', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                            {Object.values(errors).map((err, i) => (
                                <p key={i} style={{ fontSize: 12, color: '#E03050', margin: '0 0 4px', fontWeight: 600 }}>{err}</p>
                            ))}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div className="co-field">
                            <label>الاسم الكامل *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="أحمد محمد"
                                required
                            />
                        </div>

                        <div className="co-field">
                            <label>البريد الإلكتروني *</label>
                            <input
                                type="email"
                                dir="ltr"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@company.com"
                                required
                            />
                            <div style={{ fontSize: 11, color: '#7A8BA8', marginTop: 5, lineHeight: 1.5 }}>
                                يجب أن يكون بريد الشركة (مثال: <strong style={{ color: '#009E82' }}>ahmed@company.com</strong>)
                            </div>
                        </div>

                        <div className="co-field">
                            <label>رقم الجوال</label>
                            <input
                                type="tel"
                                dir="ltr"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="05XXXXXXXX"
                            />
                        </div>

                        <div className="co-frow">
                            <div className="co-field">
                                <label>كلمة المرور *</label>
                                <input
                                    type="password"
                                    dir="ltr"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="8 أحرف على الأقل"
                                    required
                                />
                            </div>
                            <div className="co-field">
                                <label>تأكيد كلمة المرور *</label>
                                <input
                                    type="password"
                                    dir="ltr"
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
                            className="co-submit-btn"
                            style={{ opacity: processing ? 0.6 : 1, background: 'linear-gradient(135deg, #009E82 0%, #00C49A 100%)' }}
                        >
                            {processing ? 'جارٍ التسجيل...' : 'إنشاء حساب'}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: 13, color: '#7A8BA8' }}>
                            لديك حساب بالفعل؟{' '}
                            <Link href="/employee/login" style={{ color: '#009E82', fontWeight: 700, textDecoration: 'none' }}>
                                سجّل دخولك
                            </Link>
                        </p>

                        <div style={{ borderTop: '1px solid #E4E9F2', paddingTop: 16, marginTop: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 8 }}>بوابات أخرى</div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <Link href="/company/login" style={{ padding: '6px 12px', border: '1px solid #E4E9F2', borderRadius: 8, fontSize: 12, color: '#4A5C78', textDecoration: 'none' }}>الشركات</Link>
                                <Link href="/business/login" style={{ padding: '6px 12px', border: '1px solid #E4E9F2', borderRadius: 8, fontSize: 12, color: '#4A5C78', textDecoration: 'none' }}>المنشآت</Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
