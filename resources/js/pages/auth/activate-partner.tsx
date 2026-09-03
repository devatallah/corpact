import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CircleCheckBig, KeyRound } from 'lucide-react';
import AuthLayout, { AUTH_INPUT_LIGHT, AuthField, AuthSubmit } from '@/layouts/auth-layout';

/**
 * Activation from an emailed link: the account already exists, this sets its
 * password and opens the first session. The token is single-use and expires,
 * so an invalid one never lands here — the controller redirects first.
 */
export default function ActivatePartner({
    token,
    partnerName,
    email,
    activated = false,
}: {
    token: string;
    partnerName: string;
    email: string;
    activated?: boolean;
}) {
    const form = useForm({ password: '', password_confirmation: '' });

    if (activated) {
        return (
            <AuthLayout title="تم التفعيل بنجاح" subtitle={`حساب ${partnerName} جاهز الآن.`}>
                <Head title="تم التفعيل" />

                <div className="flex flex-col items-center gap-3 py-2 text-center">
                    <div className="w-14 h-14 rounded-full bg-lime flex items-center justify-center">
                        <CircleCheckBig className="w-6 h-6 text-ink" aria-hidden="true" />
                    </div>
                    <p className="text-xs text-ink/60 leading-relaxed max-w-[320px]">
                        سُجّل دخولك تلقائياً. يمكنك الانتقال إلى لوحة التحكم الآن.
                    </p>
                </div>

                <Link
                    href="/partner/dash"
                    className="inline-flex items-center justify-center gap-2.5 font-bold rounded-full bg-lime text-ink border-[0.5px] border-lime hover:bg-lime-hover transition-colors text-base px-6 py-3 h-12 w-full"
                >
                    <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>الانتقال للوحة التحكم</span>
                </Link>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="تفعيل الحساب" subtitle={`اختر كلمة مرور لحساب ${partnerName}.`}>
            <Head title="تفعيل الحساب" />

            <div className="p-3.5 rounded-xl bg-ink/5 border-[0.5px] border-ink/10 text-xs">
                <span className="text-ink/60 block">البريد المسجّل</span>
                <span className="font-mono font-bold text-ink" dir="ltr">
                    {email}
                </span>
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post(`/partner/activate/${token}`);
                }}
                className="space-y-5"
            >
                <AuthField label="كلمة المرور*" htmlFor="activate-password" hint="٨ أحرف على الأقل" error={form.errors.password}>
                    <input
                        id="activate-password"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        className={AUTH_INPUT_LIGHT}
                    />
                </AuthField>

                <AuthField label="تأكيد كلمة المرور*" htmlFor="activate-confirm">
                    <input
                        id="activate-confirm"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={form.data.password_confirmation}
                        onChange={(event) => form.setData('password_confirmation', event.target.value)}
                        className={AUTH_INPUT_LIGHT}
                    />
                </AuthField>

                <AuthSubmit disabled={form.processing}>
                    <KeyRound className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>تفعيل الحساب والدخول</span>
                </AuthSubmit>
            </form>
        </AuthLayout>
    );
}
