import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import AuthLayout, { AuthEyebrow, AuthSubmit } from '@/layouts/auth-layout';

/**
 * H §4 — the second factor for Teamat staff. The password already verified;
 * nothing is signed in until this code does.
 */
export default function AdminOtp({ maskedPhone }: { maskedPhone: string }) {
    const form = useForm({ code: '' });
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const code = digits.join('');

    function setDigit(index: number, value: string) {
        const next = [...digits];
        next[index] = value.replace(/\D/g, '').slice(-1);
        setDigits(next);

        if (next[index] && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    }

    return (
        <AuthLayout
            variant="internal"
            title="رمز التحقق الثنائي"
            subtitle={
                <>
                    أرسلنا رمزاً من ٦ خانات إلى{' '}
                    <span className="font-mono font-bold text-white" dir="ltr">
                        {maskedPhone}
                    </span>
                </>
            }
            eyebrow={
                <AuthEyebrow>
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    العامل الثاني إلزامي
                </AuthEyebrow>
            }
            footer={
                <Link href="/admin/login" className="text-xs text-white/60 hover:text-white font-medium">
                    ← العودة لإدخال بيانات الدخول
                </Link>
            }
        >
            <Head title="رمز التحقق الثنائي" />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.transform(() => ({ code }));
                    form.post('/admin/otp/verify');
                }}
                className="space-y-6"
            >
                <div>
                    <div className="flex items-center justify-center gap-2 sm:gap-3" dir="ltr">
                        {digits.map((digit, index) => (
                            <input
                                key={index}
                                ref={(element) => {
                                    inputs.current[index] = element;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                                aria-label={`الخانة ${index + 1}`}
                                value={digit}
                                onChange={(event) => setDigit(index, event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Backspace' && !digits[index] && index > 0) {
                                        inputs.current[index - 1]?.focus();
                                    }
                                }}
                                onPaste={(event) => {
                                    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

                                    if (pasted.length > 1) {
                                        event.preventDefault();
                                        setDigits(pasted.padEnd(6, '').split('').slice(0, 6));
                                        inputs.current[Math.min(pasted.length, 5)]?.focus();
                                    }
                                }}
                                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-extrabold text-lime bg-white/5 border-[0.5px] border-lime/40 rounded-xl focus:border-lime focus:outline-none transition-all"
                            />
                        ))}
                    </div>
                    {form.errors.code && <p className="text-center text-[11px] font-bold text-danger mt-2">{form.errors.code}</p>}
                </div>

                <AuthSubmit disabled={form.processing || code.length < 6}>
                    <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>التحقق وتسجيل الدخول</span>
                </AuthSubmit>
            </form>

            <div className="text-center pt-4 border-t-[0.5px] border-white/10">
                <button
                    type="button"
                    onClick={() => router.post('/admin/otp/resend')}
                    className="text-xs font-bold text-white/70 hover:text-white cursor-pointer"
                >
                    إعادة إرسال الرمز
                </button>
            </div>
        </AuthLayout>
    );
}
