import { Head, useForm } from '@inertiajs/react';
import type { GuardName } from '@/types/auth';
import type { FormEvent } from 'react';

type Props = {
    guard: GuardName;
    guardLabel: string;
    token: string;
    email: string;
};

function guardPrefix(guard: GuardName) {
    return guard === 'company' ? 'company' : guard;
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

export default function ResetPassword({ guard, guardLabel, token, email }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/${guardPrefix(guard)}/reset-password`);
    }

    return (
        <>
            <Head title={`إعادة تعيين كلمة المرور — ${guardLabel}`} />

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
                        <div style={{ fontSize: 18, fontWeight: 800, textAlign: 'center', color: '#1A1A18', marginBottom: 4, fontFamily: "'Cairo', sans-serif" }}>إعادة تعيين كلمة المرور</div>
                        <div style={{ fontSize: 13, color: '#8A8A7A', textAlign: 'center', marginBottom: 24 }}>
                            أدخل كلمة المرور الجديدة
                        </div>

                        {/* Errors */}
                        {(errors.email || errors.password) && (
                            <div style={{ background: '#c0392b10', border: '1px solid #c0392b30', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#c0392b', fontWeight: 600, marginBottom: 14 }}>
                                {errors.email || errors.password}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>البريد الإلكتروني</label>
                                <input
                                    style={inputStyle}
                                    type="email"
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>كلمة المرور الجديدة</label>
                                <input
                                    style={inputStyle}
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    autoFocus
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>تأكيد كلمة المرور</label>
                                <input
                                    style={inputStyle}
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                style={{ ...btnStyle, opacity: processing ? 0.6 : 1, marginBottom: 16 }}
                            >
                                {processing ? 'جارٍ التعيين...' : 'تعيين كلمة المرور'}
                            </button>
                        </form>

                        {/* Back to login */}
                        <div style={{ textAlign: 'center', fontSize: 13, color: '#8A8A7A' }}>
                            <a href={`/${guardPrefix(guard)}/login`} style={{ fontWeight: 600, textDecoration: 'none', color: '#C4622D' }}>
                                العودة لتسجيل الدخول
                            </a>
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
