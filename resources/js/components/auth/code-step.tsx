import { ArrowLeft, MessageSquare, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';
import { AuthSubmit } from '@/layouts/auth-layout';

/**
 * H §4 — خطوة الرمز: ست خانات تُملأ ثم تُرسَل.
 *
 * تُستعمل في شاشتين — تسجيل الدخول وقبول الدعوة — فكانت الثانية تستوردها من
 * الأولى. صفحة تستورد من صفحة تسقط من بيان Vite متى أعاد Rollup تقسيمه،
 * فموضع المكوّن المشترك هنا لا في إحدى الشاشتين.
 */
export function CodeStep({
    error,
    processing,
    onSubmit,
    onResend,
    resending = false,
}: {
    error?: string;
    processing: boolean;
    onSubmit: (code: string) => void;
    onResend?: () => void;
    resending?: boolean;
}) {
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
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit(code);
            }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between p-3 rounded-xl bg-ink/5 border-[0.5px] border-ink/10 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-ink">
                    <MessageSquare className="w-4 h-4 text-success" aria-hidden="true" />
                    <span>مرسل عبر واتساب</span>
                </span>
                <span className="font-mono text-ink/70">الرمز صالح ٥ دقائق</span>
            </div>

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
                            className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-extrabold text-ink bg-ink/[0.02] border-[0.5px] border-ink/20 rounded-xl focus:border-ink focus:ring-2 focus:ring-lime focus:outline-none transition-all"
                        />
                    ))}
                </div>
                {error && <p className="text-center text-[11px] font-bold text-danger mt-2">{error}</p>}
            </div>

            <AuthSubmit disabled={processing || code.length < 6}>
                <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>تأكيد الدخول للمنصة</span>
            </AuthSubmit>

            {onResend && (
                <div className="space-y-2 pt-4 border-t-[0.5px] border-ink/10 text-center text-xs">
                    <button
                        type="button"
                        onClick={onResend}
                        disabled={resending}
                        className="inline-flex items-center gap-1.5 font-bold text-ink hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>إعادة إرسال رمز التحقق</span>
                    </button>
                    <p className="text-[11px] text-ink/50">
                        لم يصل عبر واتساب؟ سيصلك تلقائياً كرسالة نصية SMS عند الضغط على إعادة الإرسال.
                    </p>
                </div>
            )}
        </form>
    );
}
