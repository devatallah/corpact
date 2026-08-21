import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type ContextOption = { id: number; label: string };

type Props = {
    guard: 'employee' | 'company' | 'partner';
    guardLabel: string;
    portalTag: string;
    step: 'phone' | 'context';
    contextOptions: ContextOption[];
    status?: string;
};

const portalMeta: Record<string, { description: string; buttonText: string }> = {
    employee: {
        description: 'أدخل رقم جوالك وسيصلك رمز تحقق عبر واتساب للدخول إلى مجتمعاتك وفعالياتك',
        buttonText: 'إرسال رمز التحقق',
    },
    company: {
        description: 'دخول مسؤول الحساب برقم الجوال ورمز تحقق — بلا كلمة مرور',
        buttonText: 'إرسال رمز التحقق',
    },
    partner: {
        description: 'دخول مزوّد الخدمة برقم الجوال ورمز تحقق يصل عبر واتساب',
        buttonText: 'إرسال رمز التحقق',
    },
};

const tabs = [
    { key: 'employee' as const, label: 'موظف', href: '/employee/login' },
    { key: 'company' as const, label: 'شركة', href: '/company/login' },
    { key: 'partner' as const, label: 'مزوّد خدمة', href: '/partner/login' },
];

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid rgba(10,10,10,0.1)',
    borderRadius: 14,
    fontSize: 16,
    color: '#0A0A0A',
    background: '#fff',
    outline: 'none',
    direction: 'ltr',
    textAlign: 'center',
    fontFamily: "'Almarai', Tahoma, Arial, sans-serif",
    letterSpacing: 2,
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 14,
    fontWeight: 700,
    color: '#0A0A0A',
    marginBottom: 8,
    textAlign: 'right',
    fontFamily: "'Almarai', sans-serif",
};

const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: 16,
    border: 'none',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily: "'Almarai', Tahoma, Arial, sans-serif",
    background: '#C8FF00',
    color: '#0A0A0A',
};

export default function OtpLogin({ guard, guardLabel, step, contextOptions, status }: Props) {
    const { flash } = usePage().props;
    const flashStatus = (flash as Record<string, unknown>)?.status as string | undefined;
    const flashError = (flash as Record<string, unknown>)?.error as string | undefined;
    const otpSent = (status ?? flashStatus) === 'otp-sent';

    const [phase, setPhase] = useState<'phone' | 'code'>(otpSent ? 'code' : 'phone');

    const form = useForm({ phone: '', code: '' });
    const contextForm = useForm({ context_id: 0 });

    function requestCode(e: FormEvent) {
        e.preventDefault();
        form.post(`/${guard}/otp/request`, {
            preserveScroll: true,
            onSuccess: () => setPhase('code'),
        });
    }

    function verifyCode(e: FormEvent) {
        e.preventDefault();
        form.post(`/${guard}/otp/verify`, { preserveScroll: true });
    }

    function chooseContext(id: number) {
        contextForm.transform(() => ({ context_id: id }));
        contextForm.post(`/${guard}/login/context`);
    }

    const meta = portalMeta[guard];
    const errorMessage = form.errors.phone || form.errors.code || (contextForm.errors as Record<string, string>).context || flashError;

    return (
        <>
            <Head title={`تسجيل الدخول — ${guardLabel}`} />
            <div dir="rtl" style={{ minHeight: '100vh', background: '#F0EDE6', fontFamily: "'Almarai', sans-serif" }}>
                {/* Nav bar */}
                <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(240,237,230,.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(10,10,10,0.1)' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                            <span style={{ fontWeight: 800, fontSize: 22, color: '#0A0A0A' }}>تيمات</span>
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <a href="/companies" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(10,10,10,0.6)', textDecoration: 'none' }}>للشركات</a>
                            <a href="/employees" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(10,10,10,0.6)', textDecoration: 'none' }}>للموظفين</a>
                            <a href="/partners" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(10,10,10,0.6)', textDecoration: 'none' }}>لمزوّدي الخدمة</a>
                        </div>
                    </div>
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 16px' }}>
                    <div style={{ background: '#fff', border: '1px solid rgba(10,10,10,0.1)', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 460, boxShadow: '0 4px 24px rgba(26,26,24,.06)' }}>
                        {/* Portal tabs */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                            {tabs.map((tab) => (
                                <a
                                    key={tab.key}
                                    href={tab.href}
                                    style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        padding: '10px 0',
                                        borderRadius: 12,
                                        fontSize: 13,
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        background: tab.key === guard ? '#0A0A0A' : 'transparent',
                                        color: tab.key === guard ? '#C8FF00' : 'rgba(10,10,10,0.6)',
                                        border: tab.key === guard ? 'none' : '1px solid rgba(10,10,10,0.1)',
                                    }}
                                >
                                    {tab.label}
                                </a>
                            ))}
                        </div>

                        <div style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', color: '#0A0A0A', marginBottom: 6 }}>
                            {step === 'context' ? 'اختر جهة الدخول' : `دخول — بوابة ${guardLabel}`}
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(10,10,10,0.6)', textAlign: 'center', marginBottom: 28, lineHeight: 1.8 }}>
                            {step === 'context'
                                ? 'حسابك مرتبط بأكثر من جهة. اختر الجهة التي تريد الدخول إليها — يمكنك التبديل لاحقاً.'
                                : meta.description}
                        </div>

                        {errorMessage && (
                            <div style={{ background: 'rgba(192,57,43,.06)', border: '1px solid rgba(192,57,43,.2)', borderRadius: 14, padding: 12, fontSize: 13, color: '#c0392b', marginBottom: 20 }}>
                                {errorMessage}
                            </div>
                        )}

                        {step === 'context' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {contextOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        disabled={contextForm.processing}
                                        onClick={() => chooseContext(option.id)}
                                        style={{
                                            width: '100%',
                                            padding: '16px 18px',
                                            borderRadius: 14,
                                            border: '2px solid rgba(10,10,10,0.1)',
                                            background: '#fff',
                                            fontSize: 15,
                                            fontWeight: 700,
                                            color: '#0A0A0A',
                                            cursor: 'pointer',
                                            textAlign: 'right',
                                            fontFamily: "'Almarai', sans-serif",
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => router.visit(`/${guard}/login`)}
                                    style={{ background: 'none', border: 'none', color: 'rgba(10,10,10,0.5)', fontSize: 13, marginTop: 8, cursor: 'pointer', fontFamily: "'Almarai', sans-serif" }}
                                >
                                    ← العودة
                                </button>
                            </div>
                        ) : phase === 'phone' ? (
                            <form onSubmit={requestCode}>
                                <div style={{ marginBottom: 24 }}>
                                    <label htmlFor="phone" style={labelStyle}>رقم الجوال</label>
                                    <input
                                        id="phone"
                                        style={inputStyle}
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        placeholder="05xxxxxxxx"
                                        autoFocus
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                    />
                                </div>
                                <button type="submit" disabled={form.processing} style={{ ...btnStyle, opacity: form.processing ? 0.6 : 1 }}>
                                    {form.processing ? 'جارٍ الإرسال...' : meta.buttonText}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={verifyCode}>
                                <div style={{ background: 'rgba(200,255,0,.12)', border: '1px solid rgba(200,255,0,.4)', borderRadius: 14, padding: 12, fontSize: 13, color: '#5a7a10', fontWeight: 600, marginBottom: 20, textAlign: 'center' }}>
                                    أُرسل رمز تحقق مكوّن من ٦ أرقام إلى {form.data.phone || 'جوالك'} — صالح ٥ دقائق.
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label htmlFor="code" style={labelStyle}>رمز التحقق</label>
                                    <input
                                        id="code"
                                        style={{ ...inputStyle, fontSize: 24, letterSpacing: 8 }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="••••••"
                                        autoFocus
                                        value={form.data.code}
                                        onChange={(e) => form.setData('code', e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                                <button type="submit" disabled={form.processing} style={{ ...btnStyle, opacity: form.processing ? 0.6 : 1 }}>
                                    {form.processing ? 'جارٍ التحقق...' : 'تحقق وادخل'}
                                </button>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                                    <button
                                        type="button"
                                        onClick={(e) => requestCode(e as unknown as FormEvent)}
                                        disabled={form.processing}
                                        style={{ background: 'none', border: 'none', color: '#5a7a10', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Almarai', sans-serif" }}
                                    >
                                        إعادة إرسال الرمز
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            form.setData('code', '');
                                            setPhase('phone');
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'rgba(10,10,10,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: "'Almarai', sans-serif" }}
                                    >
                                        تغيير الرقم
                                    </button>
                                </div>
                                <div style={{ fontSize: 12, color: 'rgba(10,10,10,0.45)', marginTop: 16, textAlign: 'center', lineHeight: 1.8 }}>
                                    ٣ طلبات كحد أقصى في الساعة · ٥ محاولات خاطئة تقفل المحاولة ١٥ دقيقة
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
