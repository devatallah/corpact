import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail } from 'lucide-react';
import AuthLayout, { AUTH_INPUT_MONO, AuthField, AuthSubmit } from '@/layouts/auth-layout';

/**
 * Password reset by email — the admin door only. The customer portals log in
 * by phone and OTP, so they have no password to forget.
 */
export default function ForgotPassword({ guard, guardLabel }: { guard: string; guardLabel: string }) {
    const form = useForm({ email: '' });

    return (
        <AuthLayout
            variant={guard === 'admin' ? 'internal' : 'customer'}
            title="استعادة كلمة المرور"
            subtitle={`أدخل بريد ${guardLabel} المسجّل وسنرسل لك رابط إعادة التعيين.`}
            footer={
                <Link
                    href={`/${guard}/login`}
                    className={`text-xs font-medium ${guard === 'admin' ? 'text-white/60 hover:text-white' : 'text-ink/60 hover:text-ink'}`}
                >
                    ← العودة لتسجيل الدخول
                </Link>
            }
        >
            <Head title="استعادة كلمة المرور" />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post(`/${guard}/forgot-password`);
                }}
                className="space-y-5"
            >
                <AuthField label="البريد الإلكتروني*" htmlFor="reset-email" dark={guard === 'admin'} error={form.errors.email}>
                    <input
                        id="reset-email"
                        type="email"
                        required
                        dir="ltr"
                        autoComplete="username"
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                        placeholder="name@teamat.sa"
                        className={`${AUTH_INPUT_MONO} text-right text-sm`}
                    />
                </AuthField>

                <AuthSubmit disabled={form.processing}>
                    <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>إرسال رابط إعادة التعيين</span>
                    <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                </AuthSubmit>
            </form>
        </AuthLayout>
    );
}
