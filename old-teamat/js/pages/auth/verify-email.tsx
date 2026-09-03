import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { GuardName } from '@/types/auth';
import type { FormEvent } from 'react';

type Props = {
    guard: GuardName;
    guardLabel: string;
};

function guardPrefix(guard: GuardName) {
    return guard === 'company' ? 'company' : guard;
}

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

export default function VerifyEmail({ guard, guardLabel }: Props) {
    const { flash } = usePage().props;
    const { post, processing } = useForm({});

    function resend(e: FormEvent) {
        e.preventDefault();
        post(`/${guardPrefix(guard)}/email/verification-notification`);
    }

    return (
        <>
            <Head title={`تأكيد البريد الإلكتروني — ${guardLabel}`} />

            <div dir="rtl" style={{
                minHeight: '100vh',
                background: '#F6F8F5',
                fontFamily: "'Almarai', sans-serif",
            }}>
                {/* Nav bar */}
                <nav style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'rgba(245,240,232,.8)', backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid #F6F8F5',
                }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                            <svg width="32" height="32" viewBox="0 0 52 52"><rect width="52" height="52" rx="13" fill="#C8FF00"/><rect x="11" y="13" width="30" height="8" rx="2.5" fill="#0A0A0A"/><rect x="21" y="21" width="10" height="20" rx="2.5" fill="#0A0A0A"/></svg>
                                <span style={{ fontFamily: "'Almarai', sans-serif", fontWeight: 800, fontSize: 22, color: '#0A0A0A' }}>تيمات</span>
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <a href="/companies" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(10,10,10,.55)', textDecoration: 'none', fontFamily: "'Almarai', sans-serif" }}>للشركات</a>
                            <a href="/employees" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(10,10,10,.55)', textDecoration: 'none', fontFamily: "'Almarai', sans-serif" }}>للموظفين</a>
                            <a href="/partners" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(10,10,10,.55)', textDecoration: 'none', fontFamily: "'Almarai', sans-serif" }}>للشركاء</a>
                        </div>
                    </div>
                </nav>

                {/* Center content */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 16px' }}>
                    <div style={{
                        background: '#fff',
                        border: '1px solid #F6F8F5',
                        borderRadius: 20,
                        padding: '36px 32px',
                        width: '100%',
                        maxWidth: 460,
                        boxShadow: '0 4px 24px rgba(26,26,24,.06)',
                        textAlign: 'center',
                    }}>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0A0A0A', marginBottom: 8, fontFamily: "'Almarai', sans-serif" }}>تأكيد البريد الإلكتروني</h1>
                        <p style={{ fontSize: 13, color: 'rgba(10,10,10,.55)', marginBottom: 24, lineHeight: 1.6 }}>
                            شكراً لتسجيلك! يرجى تأكيد بريدك الإلكتروني من خلال الرابط الذي أرسلناه إليك.
                        </p>

                        {(flash as Record<string, unknown>)?.status ? (
                            <div style={{ background: '#0A0A0A08', border: '1px solid #C8FF0040', borderRadius: 12, padding: 12, fontSize: 13, color: '#0A0A0A', fontWeight: 600, marginBottom: 16 }}>
                                {String((flash as Record<string, unknown>).status)}
                            </div>
                        ) : null}

                        <form onSubmit={resend}>
                            <button type="submit" disabled={processing} style={{ ...btnStyle, opacity: processing ? 0.6 : 1 }}>
                                {processing ? 'جارٍ الإرسال...' : 'إعادة إرسال رابط التأكيد'}
                            </button>
                        </form>

                        {guard !== 'admin' && (
                            <div style={{ borderTop: '1px solid #F6F8F5', paddingTop: 16, marginTop: 20, textAlign: 'center' }}>
                                <p style={{ fontSize: 11, color: 'rgba(10,10,10,.55)', marginBottom: 8 }}>بوابات أخرى</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                    {guard !== 'company' && (
                                        <Link href="/company/login" style={{ padding: '6px 12px', border: '1px solid #F6F8F5', borderRadius: 8, fontSize: 12, color: 'rgba(10,10,10,.55)', textDecoration: 'none' }}>الشركات</Link>
                                    )}
                                    {guard !== 'partner' && (
                                        <Link href="/partner/login" style={{ padding: '6px 12px', border: '1px solid #F6F8F5', borderRadius: 8, fontSize: 12, color: 'rgba(10,10,10,.55)', textDecoration: 'none' }}>الشركاء</Link>
                                    )}
                                    {guard !== 'employee' && (
                                        <Link href="/employee/login" style={{ padding: '6px 12px', border: '1px solid #F6F8F5', borderRadius: 8, fontSize: 12, color: 'rgba(10,10,10,.55)', textDecoration: 'none' }}>الموظفون</Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', padding: '20px', fontSize: 12, color: 'rgba(10,10,10,.55)', fontFamily: "'IBM Plex Mono', monospace" }}>
                    &copy; 2026 تيمات. جميع الحقوق محفوظة.
                </div>
            </div>
        </>
    );
}
