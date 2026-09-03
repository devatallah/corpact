import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Props = {
    maskedPhone?: string | null;
};

export default function AdminOtp({ maskedPhone }: Props) {
    const form = useForm({ code: '' });
    const resendForm = useForm({});

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/admin/otp/verify');
    }

    function resend() {
        resendForm.post('/admin/otp/resend', { preserveScroll: true });
    }

    return (
        <>
            <Head title="رمز التحقق — المشرف" />
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
                    <svg width="40" height="40" viewBox="0 0 52 52"><rect width="52" height="52" rx="13" fill="#C8FF00" /><rect x="11" y="13" width="30" height="8" rx="2.5" fill="#0A0A0A" /><rect x="21" y="21" width="10" height="20" rx="2.5" fill="#0A0A0A" /></svg>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#0A0A0A' }}>تيمات</span>
                </div>

                <div style={{ background: '#fff', borderRadius: 24, padding: '40px 32px', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(26,26,24,.06)' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', color: '#0A0A0A', marginBottom: 6 }}>التحقق بخطوتين</div>
                    <div style={{ fontSize: 14, color: 'rgba(10,10,10,0.6)', textAlign: 'center', marginBottom: 28, lineHeight: 1.8 }}>
                        كلمة المرور وحدها لا تكفي لهذه اللوحة.
                        <br />
                        أُرسل رمز تحقق إلى {maskedPhone ?? 'جوالك المسجل'}.
                    </div>

                    {form.errors.code && (
                        <div style={{ background: 'rgba(192,57,43,.06)', border: '1px solid rgba(192,57,43,.2)', borderRadius: 14, padding: 12, fontSize: 13, color: '#D9381E', marginBottom: 20 }}>
                            {form.errors.code}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div style={{ marginBottom: 24 }}>
                            <label htmlFor="code" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0A0A0A', marginBottom: 8, textAlign: 'right' }}>رمز التحقق</label>
                            <input
                                id="code"
                                style={{
                                    width: '100%', padding: '14px 16px', border: '2px solid rgba(10,10,10,0.1)', borderRadius: 14,
                                    fontSize: 24, color: '#0A0A0A', background: '#fff', outline: 'none', direction: 'ltr',
                                    textAlign: 'center', letterSpacing: 8, fontFamily: "'Almarai', Tahoma, Arial, sans-serif",
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="••••••"
                                autoFocus
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                        <button type="submit" disabled={form.processing} style={{
                            width: '100%', padding: 16, border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800,
                            cursor: 'pointer', fontFamily: "'Almarai', Tahoma, Arial, sans-serif",
                            background: '#C8FF00', color: '#0A0A0A', opacity: form.processing ? 0.6 : 1,
                        }}>
                            {form.processing ? 'جارٍ التحقق...' : 'تحقق وادخل'}
                        </button>
                    </form>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                        <button
                            type="button"
                            onClick={resend}
                            disabled={resendForm.processing}
                            style={{ background: 'none', border: 'none', color: '#2E7D32', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Almarai', sans-serif" }}
                        >
                            إعادة إرسال الرمز
                        </button>
                        <a href="/admin/login" style={{ color: 'rgba(10,10,10,0.5)', fontSize: 13, textDecoration: 'none', fontFamily: "'Almarai', sans-serif" }}>
                            ← العودة لتسجيل الدخول
                        </a>
                    </div>

                    <div style={{ fontSize: 12, color: 'rgba(10,10,10,0.45)', marginTop: 16, textAlign: 'center', lineHeight: 1.8 }}>
                        الرمز صالح ٥ دقائق · مدة الجلسة ١٢ ساعة
                    </div>
                </div>
            </div>
        </>
    );
}
