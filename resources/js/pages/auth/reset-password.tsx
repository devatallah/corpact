import { Head, useForm } from '@inertiajs/react';
import type { GuardName } from '@/types/auth';
import type { FormEvent } from 'react';

type Props = {
    guard: GuardName;
    guardLabel: string;
    token: string;
    email: string;
};

const portalMeta: Record<string, {
    focusColor: string;
    btnGradient: string;
    btnShadow: string;
    linkColor: string;
}> = {
    employee: {
        focusColor: '#009E82',
        btnGradient: 'linear-gradient(135deg,#009E82,#00C49A)',
        btnShadow: '0 6px 20px rgba(0,158,130,.3)',
        linkColor: '#009E82',
    },
    company: {
        focusColor: '#3B5BDB',
        btnGradient: 'linear-gradient(135deg,#3B5BDB,#5B7EFF)',
        btnShadow: '0 6px 20px rgba(59,91,219,.3)',
        linkColor: '#3B5BDB',
    },
    club: {
        focusColor: '#C8410A',
        btnGradient: 'linear-gradient(135deg,#1C1410,#3A2820)',
        btnShadow: '0 6px 20px rgba(0,0,0,.3)',
        linkColor: '#C8410A',
    },
    admin: {
        focusColor: '#E03050',
        btnGradient: 'linear-gradient(135deg,#E03050,#FF4466)',
        btnShadow: '0 6px 20px rgba(224,48,80,.3)',
        linkColor: '#E03050',
    },
};

function guardPrefix(guard: GuardName) {
    return guard === 'company' ? 'company' : guard;
}

export default function ResetPassword({ guard, guardLabel, token, email }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });
    const cfg = portalMeta[guard] ?? portalMeta.employee;

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/${guardPrefix(guard)}/reset-password`);
    }

    return (
        <>
            <Head title={`إعادة تعيين كلمة المرور — ${guardLabel}`} />

            <style>{`
                *{margin:0;padding:0;box-sizing:border-box;}
                body{font-family:Tahoma,Arial,sans-serif;}
                .rp-wrap{min-height:100vh;background:linear-gradient(135deg,#0A0F1E,#1A2035);display:flex;align-items:center;justify-content:center;padding:20px;}
                .rp-inp{width:100%;padding:12px 14px;border:1px solid #E4E9F2;border-radius:12px;font-size:14px;color:#0F1923;background:#F4F6FA;outline:none;direction:ltr;font-family:inherit;transition:border-color .15s;}
                .rp-inp:focus{border-color:${cfg.focusColor};background:#fff;}
                .rp-submit:hover{transform:translateY(-1px);}
            `}</style>

            <div className="rp-wrap" dir="rtl">
                <div style={{ width: '100%', maxWidth: 400 }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(90deg,#009E82,#D4820A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>كورباكت</div>
                        <div style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>CORPACT</div>
                    </div>

                    {/* Card */}
                    <div style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', boxShadow: '0 24px 80px rgba(0,0,0,.4)' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, textAlign: 'center', marginBottom: 4 }}>إعادة تعيين كلمة المرور</div>
                        <div style={{ fontSize: 12, color: '#7A8BA8', textAlign: 'center', marginBottom: 24 }}>
                            أدخل كلمة المرور الجديدة
                        </div>

                        {/* Errors */}
                        {(errors.email || errors.password) && (
                            <div style={{ background: '#E0305018', border: '1px solid #E0305033', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#E03050', fontWeight: 600, marginBottom: 14 }}>
                                {errors.email || errors.password}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>البريد الإلكتروني</label>
                                <input
                                    className="rp-inp"
                                    type="email"
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>كلمة المرور الجديدة</label>
                                <input
                                    className="rp-inp"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    autoFocus
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>تأكيد كلمة المرور</label>
                                <input
                                    className="rp-inp"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>

                            <button
                                className="rp-submit"
                                type="submit"
                                disabled={processing}
                                style={{
                                    width: '100%', padding: 15, border: 'none', borderRadius: 14,
                                    fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
                                    marginBottom: 16, transition: 'transform .15s',
                                    background: cfg.btnGradient, color: '#fff', boxShadow: cfg.btnShadow,
                                    opacity: processing ? 0.7 : 1,
                                }}
                            >
                                {processing ? 'جارٍ التعيين...' : 'تعيين كلمة المرور'}
                            </button>
                        </form>

                        {/* Back to login */}
                        <div style={{ textAlign: 'center', fontSize: 13, color: '#7A8BA8' }}>
                            <a href={`/${guardPrefix(guard)}/login`} style={{ fontWeight: 700, textDecoration: 'none', color: cfg.linkColor }}>
                                العودة لتسجيل الدخول
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
