import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

interface Props {
    invitation: {
        token: string;
        email: string;
        company_name: string;
    };
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

export default function AcceptInvitation({ invitation }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/invite/${invitation.token}`);
    }

    return (
        <>
            <Head title="قبول الدعوة" />

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
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#1A1A1808', border: '1px solid #C8F13540', padding: '6px 14px', borderRadius: 99,
                                fontSize: 12, fontWeight: 700, color: '#1A1A18', marginBottom: 12,
                            }}>
                                دعوة موظف
                            </div>
                            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A18', marginBottom: 4, fontFamily: "'Cairo', sans-serif" }}>مرحباً بك!</h1>
                            <p style={{ fontSize: 13, color: '#8A8A7A' }}>
                                تمت دعوتك للانضمام إلى <strong style={{ color: '#1A1A18' }}>{invitation.company_name}</strong>
                            </p>
                        </div>

                        <div style={{ background: '#F5F0E8', borderRadius: 12, padding: 12, textAlign: 'center', fontSize: 13, marginBottom: 20, border: '1px solid #E8E2D8' }}>
                            <span style={{ color: '#8A8A7A' }}>البريد: </span>
                            <span style={{ fontWeight: 600, color: '#1A1A18' }} dir="ltr">{invitation.email}</span>
                        </div>

                        <form onSubmit={submit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>الاسم الكامل</label>
                                <input
                                    style={inputStyle}
                                    type="text"
                                    autoFocus
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{errors.name}</p>}
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>كلمة المرور</label>
                                <input
                                    style={{ ...inputStyle, direction: 'ltr' }}
                                    type="password"
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{errors.password}</p>}
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>تأكيد كلمة المرور</label>
                                <input
                                    style={{ ...inputStyle, direction: 'ltr' }}
                                    type="password"
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>

                            <button type="submit" disabled={processing} style={{ ...btnStyle, opacity: processing ? 0.6 : 1 }}>
                                {processing ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب والانضمام'}
                            </button>
                        </form>

                        <div style={{ borderTop: '1px solid #E8E2D8', paddingTop: 16, marginTop: 20, textAlign: 'center' }}>
                            <p style={{ fontSize: 11, color: '#8A8A7A', marginBottom: 8 }}>بوابات أخرى</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                <Link href="/company/login" style={{ padding: '6px 12px', border: '1px solid #E8E2D8', borderRadius: 8, fontSize: 12, color: '#8A8A7A', textDecoration: 'none' }}>الشركات</Link>
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
