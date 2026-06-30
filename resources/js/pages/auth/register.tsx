import { Head, Link, useForm } from '@inertiajs/react';
import type { GuardName } from '@/types/auth';
import type { FormEvent } from 'react';

type Props = {
    guard: Extract<GuardName, 'business' | 'company'>;
    guardLabel: string;
};

function guardPrefix(guard: string) {
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

export default function Register({ guard, guardLabel }: Props) {
    const isBusiness = guard === 'business';

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        // Company fields
        hr_name: '',
        hr_phone: '',
        sector: '',
        city: '',
        // Business fields
        district: '',
        contact_phone: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/${guardPrefix(guard)}/register`);
    }

    return (
        <>
            <Head title={`إنشاء حساب — ${guardLabel}`} />

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
                            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A18', marginBottom: 4, fontFamily: "'Cairo', sans-serif" }}>إنشاء حساب {guardLabel}</h1>
                            <p style={{ fontSize: 13, color: '#8A8A7A' }}>أدخل بياناتك لإنشاء حساب جديد</p>
                        </div>

                        <form onSubmit={submit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>{isBusiness ? 'اسم المنشأة' : 'اسم الشركة'}</label>
                                <input style={inputStyle} type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{errors.name}</p>}
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={labelStyle}>البريد الإلكتروني</label>
                                <input style={{ ...inputStyle, direction: 'ltr' }} type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{errors.email}</p>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                <div>
                                    <label style={labelStyle}>كلمة المرور</label>
                                    <input style={{ ...inputStyle, direction: 'ltr' }} type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                    {errors.password && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{errors.password}</p>}
                                </div>
                                <div>
                                    <label style={labelStyle}>تأكيد كلمة المرور</label>
                                    <input style={{ ...inputStyle, direction: 'ltr' }} type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                                </div>
                            </div>

                            {/* Section divider */}
                            <div style={{ borderTop: '1px solid #E8E2D8', margin: '20px 0' }} />

                            {isBusiness ? (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                        <div>
                                            <label style={labelStyle}>المدينة</label>
                                            <input style={inputStyle} type="text" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                                            {errors.city && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{errors.city}</p>}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>الحي</label>
                                            <input style={inputStyle} type="text" value={data.district} onChange={(e) => setData('district', e.target.value)} />
                                            {errors.district && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{errors.district}</p>}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={labelStyle}>هاتف التواصل</label>
                                        <input style={{ ...inputStyle, direction: 'ltr' }} type="tel" value={data.contact_phone} onChange={(e) => setData('contact_phone', e.target.value)} />
                                        {errors.contact_phone && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{errors.contact_phone}</p>}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                        <div>
                                            <label style={labelStyle}>اسم مسؤول الموارد البشرية</label>
                                            <input style={inputStyle} type="text" value={data.hr_name} onChange={(e) => setData('hr_name', e.target.value)} />
                                            {errors.hr_name && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{errors.hr_name}</p>}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>هاتف الموارد البشرية</label>
                                            <input style={{ ...inputStyle, direction: 'ltr' }} type="tel" value={data.hr_phone} onChange={(e) => setData('hr_phone', e.target.value)} />
                                            {errors.hr_phone && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{errors.hr_phone}</p>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                        <div>
                                            <label style={labelStyle}>القطاع</label>
                                            <input style={inputStyle} type="text" value={data.sector} onChange={(e) => setData('sector', e.target.value)} />
                                            {errors.sector && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{errors.sector}</p>}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>المدينة</label>
                                            <input style={inputStyle} type="text" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                                            {errors.city && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>{errors.city}</p>}
                                        </div>
                                    </div>
                                </>
                            )}

                            <button type="submit" disabled={processing} style={{ ...btnStyle, opacity: processing ? 0.6 : 1, marginBottom: 16 }}>
                                {processing ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', fontSize: 13, color: '#8A8A7A' }}>
                            لديك حساب بالفعل؟{' '}
                            <Link href={`/${guardPrefix(guard)}/login`} style={{ color: '#C4622D', fontWeight: 600, textDecoration: 'none' }}>
                                تسجيل الدخول
                            </Link>
                        </p>

                        <div style={{ borderTop: '1px solid #E8E2D8', paddingTop: 16, marginTop: 16, textAlign: 'center' }}>
                            <p style={{ fontSize: 11, color: '#8A8A7A', marginBottom: 8 }}>بوابات أخرى</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                {guard !== 'company' && (
                                    <Link href="/company/login" style={{ padding: '6px 12px', border: '1px solid #E8E2D8', borderRadius: 8, fontSize: 12, color: '#8A8A7A', textDecoration: 'none' }}>الشركات</Link>
                                )}
                                {guard !== 'business' && (
                                    <Link href="/business/login" style={{ padding: '6px 12px', border: '1px solid #E8E2D8', borderRadius: 8, fontSize: 12, color: '#8A8A7A', textDecoration: 'none' }}>المنشآت</Link>
                                )}
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
