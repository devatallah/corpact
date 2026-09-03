import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import AuthLayout, { AUTH_INPUT_DARK, AuthEyebrow, AuthField, AuthSubmit } from '@/layouts/auth-layout';

/**
 * H §4 — the internal door. Email + password is only the first factor; the
 * session opens on the OTP challenge that follows, and lasts 12 hours.
 *
 * The 2FA code is not asked for here even though the prototype shows a third
 * box: the backend sends the code only after the password verifies, so asking
 * for it up front would be a box with nothing to type in it yet.
 */
export default function InternalLogin() {
    const form = useForm({ email: '', password: '' });

    return (
        <AuthLayout
            variant="internal"
            title="دخول فريق تيمات الداخلي"
            subtitle="أدمن المنصة · الأدمن المالي · وكيل الدعم الفني"
            eyebrow={
                <AuthEyebrow>
                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                    بوابة الإدارة المركزية والحوكمة
                </AuthEyebrow>
            }
            footer={
                <Link href="/employee/login" className="text-xs text-white/60 hover:text-white font-medium">
                    ← العودة لتسجيل دخول العملاء والمزوّدين
                </Link>
            }
        >
            <Head title="دخول فريق تيمات" />

            <div className="p-4 rounded-xl bg-lime/10 border-[0.5px] border-lime/30 text-xs text-white space-y-1.5">
                <div className="flex items-center gap-2 font-extrabold text-lime">
                    <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>معيار الأمان الإلزامي (عاملان 2FA)</span>
                </div>
                <p className="text-white/80 leading-relaxed font-medium">
                    «حساب واحد هنا يكفي للوصول إلى كل الأموال — لذلك العاملان إلزاميان.»
                </p>
                <div className="text-[11px] text-white/50 pt-1 font-mono">
                    مدة الجلسة محدودة بـ 12 ساعة فقط لضمان السلامة المحاسبية.
                </div>
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/admin/login');
                }}
                className="space-y-4"
            >
                <AuthField label="البريد المؤسسي*" htmlFor="admin-email" dark error={form.errors.email}>
                    <input
                        id="admin-email"
                        type="email"
                        required
                        autoComplete="username"
                        dir="ltr"
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                        placeholder="name@teamat.sa"
                        className={`${AUTH_INPUT_DARK} font-mono text-right`}
                    />
                </AuthField>

                <AuthField label="كلمة المرور الرئيسية*" htmlFor="admin-password" dark error={form.errors.password}>
                    <input
                        id="admin-password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        placeholder="••••••••••••"
                        className={AUTH_INPUT_DARK}
                    />
                </AuthField>

                <div className="pt-2 border-t-[0.5px] border-white/10">
                    <p className="text-[11px] text-white/50 leading-relaxed">
                        بعد التحقق من كلمة المرور سيصلك رمز تحقق على جوالك المسجّل لإكمال الدخول.
                    </p>
                </div>

                <AuthSubmit disabled={form.processing}>
                    <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>التحقق ومتابعة الدخول</span>
                </AuthSubmit>
            </form>

            <div className="text-center pt-4 border-t-[0.5px] border-white/10">
                <Link href="/admin/forgot-password" className="text-xs text-white/60 hover:text-white font-medium">
                    نسيت كلمة المرور؟
                </Link>
            </div>
        </AuthLayout>
    );
}
