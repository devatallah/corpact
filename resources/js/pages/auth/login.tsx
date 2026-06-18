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

/* ── Design tokens (matching landing page) ── */
const T = {
    cream: '#F5F0E8',
    creamDark: '#F0EAE0',
    ink: '#1A1A18',
    lime: '#C8F135',
    limeHover: '#B8E030',
    muted: '#8A8A7A',
    line: '#E8E2D8',
    paper: '#fff',
    rust: '#C4622D',
    error: '#c0392b',
    fontCairo: "'Cairo', sans-serif",
    fontBody: "'IBM Plex Sans Arabic', sans-serif",
    fontMono: "'IBM Plex Mono', monospace",
};

const portalMeta: Record<string, {
    description: string;
    buttonText: string;
    registerHtml: { question: string; label: string; href: string };
}> = {
    employee: {
        description: 'سجّل دخولك ببريد شركتك للوصول إلى مجتمعاتك والفعاليات',
        buttonText: 'دخول — بوابة الموظف',
        registerHtml: { question: 'ليس لديك حساب؟', label: 'سجّل كموظف', href: '/employee/register' },
    },
    company: {
        description: 'سجّل دخولك لإدارة مجتمعات موظفيك وميزانية الدعم',
        buttonText: 'دخول — بوابة الشركة',
        registerHtml: { question: 'شركة جديدة؟', label: 'سجّل شركتك', href: '/company/register' },
    },
    business: {
        description: 'سجّل دخولك لإدارة طلبات الحجز والتقويم والتسويات',
        buttonText: 'دخول — بوابة المنشأة',
        registerHtml: { question: 'منشأة جديدة؟', label: 'سجّل منشأتك', href: '/business/register' },
    },
};

const tabs = [
    { key: 'employee' as const, label: 'موظف', href: '/employee/login', tag: 'موظف' },
    { key: 'company' as const, label: 'شركة', href: '/company/login', tag: 'شركة' },
    { key: 'business' as const, label: 'منشأة', href: '/business/login', tag: 'نادي' },
];

const demoCredentials: Record<GuardName, Array<{ label: string; email: string; password: string }>> = {
    admin: [{ label: 'مدير النظام', email: 'admin@teamat.com', password: 'password' }],
    company: [
        { label: 'شركة التقنية', email: 'hr@advancedtech.sa', password: 'password' },
        { label: 'مجموعة الابتكار', email: 'hr@innovation.sa', password: 'password' },
    ],
    business: [
        { label: 'مرافق الرياض', email: 'biz1@teamat.com', password: 'password' },
        { label: 'مرافق جدة', email: 'biz2@teamat.com', password: 'password' },
    ],
    employee: [
        { label: 'أحمد السالم', email: 'emp1@advancedtech.sa', password: 'password' },
        { label: 'محمد الحربي', email: 'emp2@advancedtech.sa', password: 'password' },
    ],
};

function guardPrefix(guard: GuardName) {
    return guard === 'company' ? 'company' : guard;
}

/* ── Shared CSS injected via <style> ── */
const sharedStyles = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

*{margin:0;padding:0;box-sizing:border-box;}
body{
    font-family: ${T.fontBody};
    min-height:100vh;
    background: ${T.cream};
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
}

.tm-login-inp{
    width:100%;
    padding:13px 16px;
    border:1px solid ${T.line};
    border-radius:12px;
    font-size:14px;
    color:${T.ink};
    background:${T.paper};
    outline:none;
    direction:ltr;
    font-family:${T.fontBody};
    transition:border-color .2s, box-shadow .2s;
}
.tm-login-inp::placeholder{
    color:${T.muted};
    opacity:.6;
}
.tm-login-inp:focus{
    border-color:${T.lime};
    box-shadow:0 0 0 3px rgba(200,241,53,.18);
}
.tm-login-submit{
    width:100%;
    padding:14px;
    border:none;
    border-radius:10px;
    font-size:15px;
    font-weight:800;
    cursor:pointer;
    font-family:${T.fontCairo};
    background:${T.lime};
    color:${T.ink};
    transition:background .15s,transform .15s,box-shadow .15s;
}
.tm-login-submit:hover:not(:disabled){
    background:${T.limeHover};
    transform:translateY(-1px);
    box-shadow:0 8px 24px rgba(200,241,53,.3);
}
.tm-login-submit:active:not(:disabled){
    transform:scale(.98);
}
.tm-login-submit:disabled{
    opacity:.6;
    cursor:not-allowed;
}
.tm-tab{
    flex:1;
    padding:10px 6px;
    border-radius:10px;
    border:1.5px solid ${T.line};
    background:${T.paper};
    cursor:pointer;
    font-family:${T.fontCairo};
    font-size:13px;
    font-weight:700;
    color:${T.muted};
    transition:all .2s;
    text-align:center;
    text-decoration:none;
    display:block;
}
.tm-tab:hover{
    border-color:${T.muted};
    background:${T.creamDark};
}
.tm-tab.active{
    border-color:${T.lime};
    background:rgba(200,241,53,.08);
    color:${T.ink};
}
.tm-forgot{
    font-size:12px;
    color:${T.muted};
    text-decoration:none;
    font-family:${T.fontBody};
    transition:color .15s;
}
.tm-forgot:hover{
    color:${T.rust};
}
`;

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

    /* ── Admin: simple login (also restyled) ── */
    if (guard === 'admin') {
        const adminDemos = demoCredentials.admin;
        return (
            <>
                <Head title="تسجيل الدخول — المشرف" />
                <style>{sharedStyles}</style>
                <div style={{ width: '100%', maxWidth: 440 }} dir="rtl">
                    {/* Logo linking home */}
                    <a href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32, textDecoration: 'none' }}>
                        <img src="/landing/assets/logo-icon.webp" alt="تيمات" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                        <span style={{ fontFamily: T.fontCairo, fontSize: 26, fontWeight: 900, color: T.ink }}>تيمات</span>
                    </a>

                    {/* Card */}
                    <div style={{ background: T.paper, borderRadius: 16, padding: '36px 32px', border: `1px solid ${T.line}`, boxShadow: '0 4px 24px rgba(26,26,24,.06)' }}>
                        <div style={{ fontFamily: T.fontCairo, fontSize: 18, fontWeight: 800, textAlign: 'center', color: T.ink, marginBottom: 4 }}>لوحة المشرف</div>
                        <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.muted, textAlign: 'center', marginBottom: 24 }}>أدخل بياناتك للدخول</div>

                        {status && (
                            <div style={{ background: 'rgba(200,241,53,.08)', border: '1px solid rgba(200,241,53,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: T.ink, fontWeight: 600, marginBottom: 14, fontFamily: T.fontBody }}>
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontFamily: T.fontCairo, fontSize: 13, color: T.ink, fontWeight: 700, marginBottom: 6 }}>البريد الإلكتروني</label>
                                <input className="tm-login-inp" type="email" autoFocus value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <div style={{ fontSize: 12, color: T.error, marginTop: 4, fontFamily: T.fontBody }}>{errors.email}</div>}
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontFamily: T.fontCairo, fontSize: 13, color: T.ink, fontWeight: 700, marginBottom: 6 }}>كلمة المرور</label>
                                <input className="tm-login-inp" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                {errors.password && <div style={{ fontSize: 12, color: T.error, marginTop: 4, fontFamily: T.fontBody }}>{errors.password}</div>}
                            </div>
                            <button type="submit" disabled={processing} className="tm-login-submit">
                                {processing ? 'جارٍ الدخول...' : 'دخول — لوحة المشرف'}
                            </button>
                        </form>

                        {/* Demo credentials */}
                        <div style={{ marginTop: 20, textAlign: 'center' }}>
                            <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.muted, marginBottom: 8 }}>حساب تجريبي</div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                                {adminDemos.map((d) => (
                                    <button
                                        key={d.email}
                                        type="button"
                                        onClick={() => fillDemo(d.email, d.password)}
                                        style={{
                                            padding: '6px 14px',
                                            border: `1px solid ${T.line}`,
                                            borderRadius: 8,
                                            fontSize: 12,
                                            color: T.ink,
                                            background: T.cream,
                                            cursor: 'pointer',
                                            fontFamily: T.fontCairo,
                                            fontWeight: 700,
                                            transition: 'border-color .15s',
                                        }}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    /* ── Employee / Company / Business login ── */
    const cfg = portalMeta[guard];
    const demos = demoCredentials[guard];

    return (
        <>
            <Head title={`تسجيل الدخول — ${guardLabel}`} />
            <style>{sharedStyles}</style>

            <div style={{ width: '100%', maxWidth: 440 }} dir="rtl">
                {/* Logo linking home */}
                <a href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32, textDecoration: 'none' }}>
                    <img src="/landing/assets/logo-icon.webp" alt="تيمات" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                    <span style={{ fontFamily: T.fontCairo, fontSize: 26, fontWeight: 900, color: T.ink }}>تيمات</span>
                </a>

                {/* Card */}
                <div style={{ background: T.paper, borderRadius: 16, padding: '36px 32px', border: `1px solid ${T.line}`, boxShadow: '0 4px 24px rgba(26,26,24,.06)' }}>
                    {/* Account type selector label */}
                    <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.muted, fontWeight: 500, marginBottom: 10, display: 'block', letterSpacing: '.5px' }}>
                        اختر نوع حسابك
                    </span>

                    {/* Portal tabs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                        {tabs.map((t) => {
                            const active = t.key === guard;
                            return (
                                <a
                                    key={t.key}
                                    href={t.href}
                                    className={`tm-tab${active ? ' active' : ''}`}
                                >
                                    {t.label}
                                </a>
                            );
                        })}
                    </div>

                    {/* Description hint */}
                    <div style={{
                        fontFamily: T.fontBody,
                        fontSize: 13,
                        color: T.muted,
                        background: T.cream,
                        borderRadius: 10,
                        padding: '10px 14px',
                        marginBottom: 18,
                        lineHeight: 1.6,
                        border: `1px solid ${T.line}`,
                    }}>
                        {cfg.description}
                    </div>

                    {/* Error messages */}
                    {(errors.email || errors.password) && (
                        <div style={{
                            background: 'rgba(192,57,43,.06)',
                            border: '1px solid rgba(192,57,43,.18)',
                            borderRadius: 10,
                            padding: '10px 14px',
                            fontSize: 13,
                            color: T.error,
                            fontWeight: 600,
                            marginBottom: 14,
                            fontFamily: T.fontBody,
                        }}>
                            {errors.email || errors.password}
                        </div>
                    )}

                    {/* Flash status */}
                    {displayStatus && (
                        <div style={{
                            background: 'rgba(200,241,53,.08)',
                            border: '1px solid rgba(200,241,53,.2)',
                            borderRadius: 10,
                            padding: '10px 14px',
                            fontSize: 13,
                            color: T.ink,
                            fontWeight: 600,
                            marginBottom: 14,
                            fontFamily: T.fontBody,
                        }}>
                            {displayStatus}
                        </div>
                    )}

                    {/* Demo credentials box */}
                    <div
                        style={{
                            background: 'rgba(200,241,53,.06)',
                            border: '1px dashed rgba(200,241,53,.25)',
                            borderRadius: 10,
                            padding: '12px 14px',
                            marginBottom: 18,
                            fontSize: 12,
                            color: T.muted,
                            lineHeight: 1.8,
                            cursor: 'pointer',
                            fontFamily: T.fontBody,
                            transition: 'border-color .15s',
                        }}
                        onClick={() => fillDemo(demos[0].email, demos[0].password)}
                        title="اضغط لتعبئة البيانات التجريبية"
                    >
                        <strong style={{ color: T.ink }}>بيانات تجريبية:</strong><br />
                        البريد: اكتب أي إيميل<br />
                        كلمة المرور: 123456
                    </div>

                    {/* Form */}
                    <form onSubmit={submit}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontFamily: T.fontCairo, fontSize: 13, color: T.ink, fontWeight: 700, marginBottom: 6 }}>البريد الإلكتروني</label>
                            <input
                                className="tm-login-inp"
                                type="email"
                                placeholder="example@company.com"
                                autoComplete="email"
                                autoFocus
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontFamily: T.fontCairo, fontSize: 13, color: T.ink, fontWeight: 700, marginBottom: 6 }}>كلمة المرور</label>
                            <input
                                className="tm-login-inp"
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                        </div>

                        <div style={{ textAlign: 'left', marginBottom: 20 }}>
                            <a href={`/${guardPrefix(guard)}/forgot-password`} className="tm-forgot">نسيت كلمة المرور؟</a>
                        </div>

                        <button
                            className="tm-login-submit"
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? 'جارٍ الدخول...' : cfg.buttonText}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
                        <div style={{ flex: 1, height: 1, background: T.line }} />
                        <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.muted }}>أو</span>
                        <div style={{ flex: 1, height: 1, background: T.line }} />
                    </div>

                    {/* Register link */}
                    <div style={{ textAlign: 'center', fontSize: 13, color: T.muted, fontFamily: T.fontBody }}>
                        {cfg.registerHtml.question}{' '}
                        <a href={cfg.registerHtml.href} style={{ fontWeight: 700, textDecoration: 'none', color: T.ink, fontFamily: T.fontCairo, transition: 'color .15s' }}>{cfg.registerHtml.label}</a>
                    </div>
                </div>

                {/* Back to home */}
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <a href="/" style={{ fontFamily: T.fontBody, fontSize: 13, color: T.muted, textDecoration: 'none', transition: 'color .15s' }}>
                        &larr; العودة إلى الصفحة الرئيسية
                    </a>
                </div>
            </div>
        </>
    );
}
