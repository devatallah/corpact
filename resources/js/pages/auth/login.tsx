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
    { key: 'business' as const, label: 'منشأة', href: '/business/login', tag: 'مزود خدمة' },
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

/* ── Shared inline styles ── */
const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid rgba(10,10,10,0.1)',
    borderRadius: 12,
    fontSize: 14,
    color: '#0A0A0A',
    background: '#F0EDE6',
    outline: 'none',
    direction: 'ltr',
    fontFamily: "'Almarai', sans-serif",
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    color: 'rgba(10,10,10,0.6)',
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

    /* ── Admin: cream/lime login matching mockup ── */
    if (guard === 'admin') {
        return (
            <>
                <Head title="تسجيل الدخول — المشرف" />
                <div dir="rtl" style={{
                    minHeight: '100vh',
                    background: '#F0EDE6',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px 16px',
                    fontFamily: "'Almarai', Tahoma, Arial, sans-serif",
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                        <svg width="40" height="40" viewBox="0 0 52 52"><rect width="52" height="52" rx="13" fill="#C8FF00"/><rect x="11" y="13" width="30" height="8" rx="2.5" fill="#0A0A0A"/><rect x="21" y="21" width="10" height="20" rx="2.5" fill="#0A0A0A"/></svg>
                        <span style={{ fontSize: 28, fontWeight: 900, color: '#0A0A0A' }}>تيمات</span>
                    </div>

                    <div style={{
                        background: '#fff',
                        borderRadius: 24,
                        padding: '40px 32px',
                        width: '100%',
                        maxWidth: 420,
                        boxShadow: '0 4px 24px rgba(26,26,24,.06)',
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', color: '#0A0A0A', marginBottom: 6 }}>لوحة المشرف</div>
                        <div style={{ fontSize: 14, color: 'rgba(10,10,10,0.6)', textAlign: 'center', marginBottom: 32 }}>أدخل بياناتك للدخول</div>

                        {status && (
                            <div style={{ background: 'rgba(200,241,53,.1)', border: '1px solid rgba(200,241,53,.3)', borderRadius: 14, padding: 12, fontSize: 13, color: '#5a7a10', fontWeight: 600, marginBottom: 20 }}>
                                {status}
                            </div>
                        )}
                        {(errors.email || errors.password) && (
                            <div style={{ background: 'rgba(192,57,43,.06)', border: '1px solid rgba(192,57,43,.2)', borderRadius: 14, padding: 12, fontSize: 13, color: '#c0392b', marginBottom: 20 }}>
                                {errors.email || errors.password}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0A0A0A', marginBottom: 8, textAlign: 'right' }}>البريد الإلكتروني</label>
                                <input
                                    style={{
                                        width: '100%', padding: '14px 16px', border: '2px solid rgba(10,10,10,0.1)', borderRadius: 14,
                                        fontSize: 15, color: '#0A0A0A', background: '#fff', outline: 'none', direction: 'ltr' as const,
                                        fontFamily: "'Almarai', Tahoma, Arial, sans-serif",
                                    }}
                                    type="email"
                                    autoFocus
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    onFocus={(e) => { e.target.style.borderColor = '#C8FF00'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(10,10,10,0.1)'; }}
                                />
                            </div>
                            <div style={{ marginBottom: 32 }}>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0A0A0A', marginBottom: 8, textAlign: 'right' }}>كلمة المرور</label>
                                <input
                                    style={{
                                        width: '100%', padding: '14px 16px', border: '2px solid rgba(10,10,10,0.1)', borderRadius: 14,
                                        fontSize: 15, color: '#0A0A0A', background: '#fff', outline: 'none', direction: 'ltr' as const,
                                        fontFamily: "'Almarai', Tahoma, Arial, sans-serif",
                                    }}
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    onFocus={(e) => { e.target.style.borderColor = '#C8FF00'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(10,10,10,0.1)'; }}
                                />
                            </div>
                            <button type="submit" disabled={processing} style={{
                                width: '100%', padding: 16, border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800,
                                cursor: 'pointer', fontFamily: "'Almarai', Tahoma, Arial, sans-serif",
                                background: '#C8FF00', color: '#0A0A0A', transition: 'opacity .15s',
                                opacity: processing ? 0.6 : 1,
                            }}>
                                {processing ? 'جارٍ الدخول...' : 'دخول — لوحة المشرف'}
                            </button>
                        </form>
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

            <div dir="rtl" style={{
                minHeight: '100vh',
                background: '#F0EDE6',
                fontFamily: "'Almarai', sans-serif",
            }}>
                {/* Nav bar */}
                <nav style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'rgba(240,237,230,.8)', backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid rgba(10,10,10,0.1)',
                }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                            <span style={{ fontFamily: "'Almarai', sans-serif", fontWeight: 800, fontSize: 22, color: '#0A0A0A' }}>تيمات</span>
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <a href="/companies" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(10,10,10,0.6)', textDecoration: 'none', fontFamily: "'Almarai', sans-serif" }}>للشركات</a>
                            <a href="/employees" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(10,10,10,0.6)', textDecoration: 'none', fontFamily: "'Almarai', sans-serif" }}>للموظفين</a>
                            <a href="/businesses" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(10,10,10,0.6)', textDecoration: 'none', fontFamily: "'Almarai', sans-serif" }}>لمزودي الخدمة</a>
                        </div>
                    </div>
                </nav>

                {/* Center content */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 16px' }}>
                    <div style={{
                        background: '#fff',
                        border: '1px solid rgba(10,10,10,0.1)',
                        borderRadius: 20,
                        padding: '36px 32px',
                        width: '100%',
                        maxWidth: 460,
                        boxShadow: '0 4px 24px rgba(26,26,24,.06)',
                    }}>
                        {/* Portal tabs */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 24, alignItems: 'center' }}>
                            {tabs.map((t) => {
                                const active = t.key === guard;
                                return (
                                    <a
                                        key={t.key}
                                        href={t.href}
                                        style={{
                                            background: active ? '#0A0A0A' : 'transparent',
                                            color: active ? '#C8FF00' : 'rgba(10,10,10,0.6)',
                                            border: active ? 'none' : '1px solid rgba(10,10,10,0.1)',
                                            borderRadius: 99,
                                            padding: '8px 20px',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            textAlign: 'center',
                                            fontFamily: "'Almarai', sans-serif",
                                            transition: 'all .15s',
                                        }}
                                    >
                                        {t.label}
                                    </a>
                                );
                            })}
                        </div>

                        {/* Description hint */}
                        <div style={{
                            fontSize: 13,
                            color: 'rgba(10,10,10,0.6)',
                            background: '#F0EDE6',
                            borderRadius: 12,
                            padding: '10px 14px',
                            marginBottom: 18,
                            lineHeight: 1.6,
                            border: '1px solid rgba(10,10,10,0.1)',
                            fontFamily: "'Almarai', sans-serif",
                        }}>
                            {cfg.description}
                        </div>

                        {/* Error messages */}
                        {(errors.email || errors.password) && (
                            <div style={{
                                background: '#c0392b10',
                                border: '1px solid #c0392b30',
                                borderRadius: 12,
                                padding: '10px 14px',
                                fontSize: 13,
                                color: '#c0392b',
                                fontWeight: 600,
                                marginBottom: 14,
                            }}>
                                {errors.email || errors.password}
                            </div>
                        )}

                        {/* Flash status */}
                        {displayStatus && (
                            <div style={{
                                background: 'rgba(10,10,10,0.03)',
                                border: '1px solid rgba(200,255,0,0.25)',
                                borderRadius: 12,
                                padding: 12,
                                fontSize: 13,
                                color: '#0A0A0A',
                                fontWeight: 600,
                                marginBottom: 14,
                            }}>
                                {displayStatus}
                            </div>
                        )}

                        {/* Demo credentials box */}
                        <div
                            style={{
                                background: '#F0EDE6',
                                border: '1px dashed rgba(10,10,10,0.1)',
                                borderRadius: 12,
                                padding: '12px 14px',
                                marginBottom: 18,
                                fontSize: 12,
                                color: 'rgba(10,10,10,0.6)',
                                lineHeight: 1.8,
                                cursor: 'pointer',
                                transition: 'border-color .15s',
                                fontFamily: "'Almarai', sans-serif",
                            }}
                            onClick={() => fillDemo(demos[0].email, demos[0].password)}
                            title="اضغط لتعبئة البيانات التجريبية"
                        >
                            <strong style={{ color: '#0A0A0A' }}>بيانات تجريبية:</strong><br />
                            البريد: اكتب أي إيميل<br />
                            كلمة المرور: 123456
                        </div>

                        {/* Form */}
                        <form onSubmit={submit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>البريد الإلكتروني</label>
                                <input
                                    style={inputStyle}
                                    type="email"
                                    placeholder="example@company.com"
                                    autoComplete="email"
                                    autoFocus
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>كلمة المرور</label>
                                <input
                                    style={inputStyle}
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>

                            <div style={{ textAlign: 'left', marginBottom: 20 }}>
                                <a href={`/${guardPrefix(guard)}/forgot-password`} style={{ fontSize: 12, color: '#C4622D', textDecoration: 'none' }}>نسيت كلمة المرور؟</a>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                style={{ ...btnStyle, opacity: processing ? 0.6 : 1 }}
                            >
                                {processing ? 'جارٍ الدخول...' : cfg.buttonText}
                            </button>
                        </form>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
                            <div style={{ flex: 1, height: 1, background: 'rgba(10,10,10,0.1)' }} />
                            <span style={{ fontSize: 11, color: 'rgba(10,10,10,0.6)' }}>أو</span>
                            <div style={{ flex: 1, height: 1, background: 'rgba(10,10,10,0.1)' }} />
                        </div>

                        {/* Register link */}
                        <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(10,10,10,0.6)' }}>
                            {cfg.registerHtml.question}{' '}
                            <a href={cfg.registerHtml.href} style={{ fontWeight: 600, textDecoration: 'none', color: '#C4622D' }}>{cfg.registerHtml.label}</a>
                        </div>

                        {/* Admin tab — subtle, at bottom */}
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <a
                                href="/admin/login"
                                style={{
                                    fontSize: 11,
                                    color: 'rgba(10,10,10,0.6)',
                                    textDecoration: 'none',
                                    fontFamily: "'Almarai', sans-serif",
                                }}
                            >
                                المشرف
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', padding: '20px', fontSize: 12, color: 'rgba(10,10,10,0.6)', fontFamily: "'Inter', monospace" }}>
                    &copy; 2026 تيمات. جميع الحقوق محفوظة.
                </div>
            </div>
        </>
    );
}
