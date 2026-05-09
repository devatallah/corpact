import { Head, useForm, usePage } from '@inertiajs/react';
import type { GuardName } from '@/types/auth';
import type { FormEvent } from 'react';

type Props = {
    guard: GuardName;
    guardLabel: string;
    portalTag: string;
    canRegister: boolean;
    status?: string;
};

const portalMeta: Record<string, {
    activeClass: string;
    focusColor: string;
    btnGradient: string;
    btnShadow: string;
    linkColor: string;
    description: string;
    buttonText: string;
    registerHtml: { question: string; label: string; href: string };
}> = {
    employee: {
        activeClass: 'active-emp',
        focusColor: '#009E82',
        btnGradient: 'linear-gradient(135deg,#009E82,#00C49A)',
        btnShadow: '0 6px 20px rgba(0,158,130,.3)',
        linkColor: '#009E82',
        description: 'سجّل دخولك ببريد شركتك للوصول إلى مجتمعاتك والفعاليات',
        buttonText: 'دخول — بوابة الموظف',
        registerHtml: { question: 'ليس لديك حساب؟', label: 'سجّل كموظف', href: '/employee/register' },
    },
    company: {
        activeClass: 'active-company',
        focusColor: '#3B5BDB',
        btnGradient: 'linear-gradient(135deg,#3B5BDB,#5B7EFF)',
        btnShadow: '0 6px 20px rgba(59,91,219,.3)',
        linkColor: '#3B5BDB',
        description: 'سجّل دخولك لإدارة مجتمعات موظفيك وميزانية الدعم',
        buttonText: 'دخول — بوابة الشركة',
        registerHtml: { question: 'شركة جديدة؟', label: 'سجّل شركتك', href: '/company/register' },
    },
    club: {
        activeClass: 'active-club',
        focusColor: '#C8410A',
        btnGradient: 'linear-gradient(135deg,#1C1410,#3A2820)',
        btnShadow: '0 6px 20px rgba(0,0,0,.3)',
        linkColor: '#C8410A',
        description: 'سجّل دخولك لإدارة طلبات الحجز والتقويم والتسويات',
        buttonText: 'دخول — بوابة النادي',
        registerHtml: { question: 'نادٍ جديد؟', label: 'سجّل ناديك', href: '/club/register' },
    },
};

const tabs = [
    { key: 'employee' as const, icon: '👤', label: 'موظف', href: '/employee/login', borderColor: '#009E82', bg: '#009E8210' },
    { key: 'company' as const, icon: '📊', label: 'شركة', href: '/company/login', borderColor: '#3B5BDB', bg: '#3B5BDB10' },
    { key: 'club' as const, icon: '🏟️', label: 'نادي', href: '/club/login', borderColor: '#1C1410', bg: '#1C141010' },
];

const demoCredentials: Record<GuardName, Array<{ label: string; email: string; password: string }>> = {
    admin: [{ label: 'مدير النظام', email: 'admin@corpact.com', password: 'password' }],
    company: [
        { label: 'شركة التقنية', email: 'hr@advancedtech.sa', password: 'password' },
        { label: 'مجموعة الابتكار', email: 'hr@innovation.sa', password: 'password' },
    ],
    club: [
        { label: 'نادي الرياض', email: 'club1@corpact.com', password: 'password' },
        { label: 'نادي جدة', email: 'club2@corpact.com', password: 'password' },
    ],
    employee: [
        { label: 'أحمد السالم', email: 'emp1@advancedtech.sa', password: 'password' },
        { label: 'محمد الحربي', email: 'emp2@advancedtech.sa', password: 'password' },
    ],
};

function guardPrefix(guard: GuardName) {
    return guard === 'company' ? 'company' : guard;
}

export default function Login({ guard, guardLabel, portalTag, canRegister, status }: Props) {
    const { flash } = usePage().props;
    const flashStatus = (flash as Record<string, unknown>)?.status as string | undefined;
    const displayStatus = status || flashStatus;
    const queryEmail = new URLSearchParams(window.location.search).get('email') ?? '';
    const { data, setData, post, processing, errors } = useForm({
        email: queryEmail,
        password: '',
        remember: false,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/${guardPrefix(guard)}/login`);
    }

    function fillDemo(email: string, password: string) {
        setData({ email, password, remember: false });
    }

    // Admin: simple login
    if (guard === 'admin') {
        return (
            <>
                <Head title="تسجيل الدخول — المشرف" />
                <style>{`
                    body{font-family:Tahoma,Arial,sans-serif;}
                    .admin-wrap{min-height:100vh;background:linear-gradient(135deg,#0A0F1E,#1A2035);display:flex;align-items:center;justify-content:center;padding:20px;}
                    .admin-inp{width:100%;padding:12px 14px;border:1px solid #E4E9F2;border-radius:12px;font-size:14px;color:#0F1923;background:#F4F6FA;outline:none;direction:ltr;font-family:inherit;transition:border-color .15s;}
                    .admin-inp:focus{border-color:#E03050;background:#fff;}
                `}</style>
                <div className="admin-wrap" dir="rtl">
                    <div style={{ width: '100%', maxWidth: 440 }}>
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(90deg,#009E82,#D4820A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>كورباكت</div>
                            <div style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>CORPACT</div>
                        </div>
                        <div style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', boxShadow: '0 24px 80px rgba(0,0,0,.4)' }}>
                            <div style={{ fontSize: 16, fontWeight: 800, textAlign: 'center', marginBottom: 4 }}>لوحة المشرف</div>
                            <div style={{ fontSize: 12, color: '#7A8BA8', textAlign: 'center', marginBottom: 24 }}>أدخل بياناتك للدخول</div>
                            {status && <div style={{ background: '#009E8218', border: '1px solid #009E8233', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#009E82', fontWeight: 600, marginBottom: 14 }}>{status}</div>}
                            <form onSubmit={submit}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>البريد الإلكتروني</label>
                                    <input className="admin-inp" type="email" autoFocus value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    {errors.email && <div style={{ fontSize: 12, color: '#E03050', marginTop: 4 }}>{errors.email}</div>}
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>كلمة المرور</label>
                                    <input className="admin-inp" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                    {errors.password && <div style={{ fontSize: 12, color: '#E03050', marginTop: 4 }}>{errors.password}</div>}
                                </div>
                                <button type="submit" disabled={processing} style={{ width: '100%', padding: 15, border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', background: 'linear-gradient(135deg,#E03050,#FF4466)', color: '#fff', boxShadow: '0 6px 20px rgba(224,48,80,.3)', opacity: processing ? 0.7 : 1 }}>
                                    {processing ? 'جارٍ الدخول...' : 'دخول — لوحة المشرف'}
                                </button>
                            </form>
                            <div style={{ marginTop: 20, textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: '#7A8BA8', marginBottom: 8 }}>حساب تجريبي</div>
                                {demoCredentials.admin.map((d) => (
                                    <button key={d.email} type="button" onClick={() => fillDemo(d.email, d.password)} style={{ padding: '6px 14px', border: '1px solid #E4E9F2', borderRadius: 8, fontSize: 11, color: '#4A5C78', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>{d.label}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const cfg = portalMeta[guard];
    const demos = demoCredentials[guard];

    return (
        <>
            <Head title={`تسجيل الدخول — ${guardLabel}`} />

            <style>{`
                *{margin:0;padding:0;box-sizing:border-box;}
                body{font-family:Tahoma,Arial,sans-serif;min-height:100vh;background:linear-gradient(135deg,#0A0F1E,#1A2035);display:flex;align-items:center;justify-content:center;padding:20px;}
                .login-inp{width:100%;padding:12px 14px;border:1px solid #E4E9F2;border-radius:12px;font-size:14px;color:#0F1923;background:#F4F6FA;outline:none;direction:ltr;font-family:inherit;transition:border-color .15s;}
                .login-inp:focus{border-color:${cfg.focusColor};background:#fff;}
                .login-submit:hover{transform:translateY(-1px);}
            `}</style>

            <div style={{ width: '100%', maxWidth: 440 }} dir="rtl">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(90deg,#009E82,#D4820A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>كورباكت</div>
                    <div style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>CORPACT</div>
                </div>

                {/* Card */}
                <div style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', boxShadow: '0 24px 80px rgba(0,0,0,.4)' }}>
                    {/* Label */}
                    <span style={{ fontSize: 12, color: '#7A8BA8', fontWeight: 600, marginBottom: 10, display: 'block' }}>اختر نوع حسابك</span>

                    {/* Portal tabs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                        {tabs.map((t) => {
                            const active = t.key === guard;
                            return (
                                <a
                                    key={t.key}
                                    href={t.href}
                                    style={{
                                        flex: 1, padding: '10px 6px', borderRadius: 12,
                                        border: active ? `2px solid ${t.borderColor}` : '2px solid #E4E9F2',
                                        background: active ? t.bg : '#fff',
                                        cursor: 'pointer', fontFamily: 'inherit',
                                        fontSize: 11, fontWeight: 700,
                                        color: active ? t.borderColor : '#7A8BA8',
                                        transition: 'all .15s', textAlign: 'center',
                                        textDecoration: 'none', display: 'block',
                                    }}
                                >
                                    <span style={{ fontSize: 20, display: 'block', marginBottom: 4 }}>{t.icon}</span>
                                    {t.label}
                                </a>
                            );
                        })}
                    </div>

                    {/* Hint */}
                    <div style={{ fontSize: 12, color: '#7A8BA8', background: '#F4F6FA', borderRadius: 10, padding: '8px 12px', marginBottom: 16, lineHeight: 1.5 }}>
                        {cfg.description}
                    </div>

                    {/* Error */}
                    {(errors.email || errors.password) && (
                        <div style={{ background: '#E0305018', border: '1px solid #E0305033', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#E03050', fontWeight: 600, marginBottom: 14 }}>
                            {errors.email || errors.password}
                        </div>
                    )}

                    {displayStatus && (
                        <div style={{ background: '#009E8218', border: '1px solid #009E8233', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#009E82', fontWeight: 600, marginBottom: 14 }}>
                            {displayStatus}
                        </div>
                    )}

                    {/* Demo box */}
                    <div
                        style={{ background: '#F4F6FA', border: '1px dashed #E4E9F2', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: '#7A8BA8', lineHeight: 1.8, cursor: 'pointer' }}
                        onClick={() => fillDemo(demos[0].email, demos[0].password)}
                        title="اضغط لتعبئة البيانات التجريبية"
                    >
                        <strong>بيانات تجريبية:</strong><br />
                        البريد: اكتب أي إيميل<br />
                        كلمة المرور: 123456
                    </div>

                    {/* Form */}
                    <form onSubmit={submit}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>البريد الإلكتروني</label>
                            <input
                                className="login-inp"
                                type="email"
                                placeholder="example@company.com"
                                autoComplete="email"
                                autoFocus
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, color: '#4A5C78', fontWeight: 600, marginBottom: 6 }}>كلمة المرور</label>
                            <input
                                className="login-inp"
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                        </div>

                        <div style={{ textAlign: 'left', marginBottom: 20 }}>
                            <a href={`/${guardPrefix(guard)}/forgot-password`} style={{ fontSize: 12, color: '#7A8BA8', textDecoration: 'none' }}>نسيت كلمة المرور؟</a>
                        </div>

                        <button
                            className="login-submit"
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
                            {processing ? 'جارٍ الدخول...' : cfg.buttonText}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ flex: 1, height: 1, background: '#E4E9F2' }} />
                        <span style={{ fontSize: 11, color: '#7A8BA8' }}>أو</span>
                        <div style={{ flex: 1, height: 1, background: '#E4E9F2' }} />
                    </div>

                    {/* Register link */}
                    <div style={{ textAlign: 'center', fontSize: 13, color: '#7A8BA8' }}>
                        {cfg.registerHtml.question}{' '}
                        <a href={cfg.registerHtml.href} style={{ fontWeight: 700, textDecoration: 'none', color: cfg.linkColor }}>{cfg.registerHtml.label}</a>
                    </div>
                </div>
            </div>
        </>
    );
}
