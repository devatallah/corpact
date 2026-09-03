import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import PasswordInput from '@/components/password-input';

type Props = {
    status?: string;
};

const field =
    'w-full p-3 rounded-xl border-[0.5px] border-white/20 text-sm text-white bg-white/5 placeholder:text-white/30 ' +
    'focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] focus:outline-none';

/**
 * The internal door — platform, finance and support admins.
 *
 * Ported from teamat.ai.studio (auth_internal). The prototype puts a third
 * field here for an Authenticator TOTP code; this platform's second factor is
 * an OTP sent to the admin's registered phone and verified on the next screen
 * (admin.otp), so the field is deliberately absent. Everything the security
 * panel claims is true of the real flow: AdminAuthController always issues an
 * `admin_2fa` OTP after the password, and SESSION_LIFETIME is 43200s = 12h.
 */
export default function InternalLogin({ status }: Props) {
    const { flash } = usePage().props;
    const flashStatus = (flash as Record<string, unknown>)?.status as string | undefined;
    const displayStatus = status || flashStatus;

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/admin/login');
    }

    return (
        <>
            <Head title="دخول فريق تيمات الداخلي" />

            <div
                dir="rtl"
                className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-arabic relative overflow-hidden"
            >
                <div
                    aria-hidden="true"
                    className="absolute -top-32 -left-32 w-96 h-96 rounded-full border-[28px] border-[#C8FF00]/10 pointer-events-none"
                />

                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4 relative z-10">
                    <a href="/" className="inline-block">
                        <div className="inline-flex items-center gap-3 select-none">
                            <svg width="42" height="42" viewBox="0 0 52 52" role="img" aria-label="شعار تيمات" className="shrink-0">
                                <rect width="52" height="52" rx="13" fill="#C8FF00" />
                                <rect x="11" y="13" width="30" height="8" rx="2.5" fill="#0A0A0A" />
                                <rect x="21" y="21" width="10" height="20" rx="2.5" fill="#0A0A0A" />
                            </svg>
                            <span className="font-arabic font-extrabold tracking-tight text-2xl text-white">تيمات</span>
                        </div>
                    </a>

                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8FF00]/20 text-[#C8FF00] border-[0.5px] border-[#C8FF00]/40 text-xs font-bold mb-2">
                            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                            بوابة الإدارة المركزية والحوكمة
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">دخول فريق تيمات الداخلي</h2>
                        <p className="text-xs sm:text-sm text-white/60 mt-1">أدمن المنصة · الأدمن المالي · وكيل الدعم الفني</p>
                    </div>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
                    <div className="bg-[#141414] py-8 px-6 sm:px-8 rounded-2xl border-[0.5px] border-white/15 shadow-2xl space-y-6">
                        <div className="p-4 rounded-xl bg-[#C8FF00]/10 border-[0.5px] border-[#C8FF00]/30 text-xs text-white space-y-1.5">
                            <div className="flex items-center gap-2 font-extrabold text-[#C8FF00]">
                                <ShieldCheck className="w-4 h-4 text-[#C8FF00] shrink-0" aria-hidden="true" />
                                <span>معيار الأمان الإلزامي (عاملان 2FA)</span>
                            </div>
                            <p className="text-white/80 leading-relaxed font-medium">
                                «حساب واحد هنا يكفي للوصول إلى كل الأموال — لذلك العاملان إلزاميان.»
                            </p>
                            <p className="text-white/80 leading-relaxed font-medium">كلمة المرور وحدها لا تكفي لهذه اللوحة.</p>
                            <div className="text-[11px] text-white/50 pt-1 font-mono">
                                مدة الجلسة محدودة بـ 12 ساعة فقط لضمان السلامة المحاسبية.
                            </div>
                        </div>

                        {displayStatus && (
                            <div
                                role="status"
                                className="p-3 rounded-xl bg-[#C8FF00]/10 border-[0.5px] border-[#C8FF00]/30 text-xs font-bold text-[#C8FF00]"
                            >
                                {displayStatus}
                            </div>
                        )}

                        {/*
                            Every key, not just email/password — the password step can
                            also fail on `phone` (no number on file, or the OTP send
                            limit), and swallowing those leaves the button looking inert.
                        */}
                        {Object.entries(errors).length > 0 && (
                            <div
                                role="alert"
                                className="p-3 rounded-xl bg-[#EF4444]/10 border-[0.5px] border-[#EF4444]/40 text-xs font-bold text-[#EF4444] space-y-1"
                            >
                                {Object.entries(errors).map(([key, message]) => (
                                    <p key={key}>{message}</p>
                                ))}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="internal-email" className="text-xs font-extrabold text-white/90 block">
                                    البريد المؤسسي*
                                </label>
                                <input
                                    id="internal-email"
                                    type="email"
                                    required
                                    autoFocus
                                    dir="ltr"
                                    autoComplete="email"
                                    inputMode="email"
                                    placeholder="name@teamat.sa"
                                    className={`${field} font-mono`}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="internal-password" className="text-xs font-extrabold text-white/90 block">
                                    كلمة المرور الرئيسية*
                                </label>
                                <PasswordInput
                                    id="internal-password"
                                    required
                                    dir="ltr"
                                    autoComplete="current-password"
                                    placeholder="••••••••••••"
                                    className={field}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center font-bold font-arabic rounded-full transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] select-none whitespace-nowrap active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 bg-[#C8FF00] text-[#0A0A0A] border-[0.5px] border-[#C8FF00] hover:bg-[#bbf300] text-base px-6 py-3 gap-2.5 h-12 w-full mt-2"
                            >
                                <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span>{processing ? 'جارٍ الدخول...' : 'التحقق وتسجيل الدخول'}</span>
                            </button>
                        </form>

                        <div className="text-center pt-4 border-t-[0.5px] border-white/10">
                            <a href="/login" className="text-xs text-white/60 hover:text-white font-medium inline-flex items-center gap-1">
                                ← العودة لتسجيل دخول العملاء والمزوّدين
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
