import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, KeyRound } from 'lucide-react';
import AuthLayout, { AUTH_INPUT_LIGHT, AUTH_INPUT_MONO, AuthField, AuthSubmit } from '@/layouts/auth-layout';

/** The other half of the reset: the token arrives in the link, the password here. */
export default function ResetPassword({
    guard,
    guardLabel,
    token,
    email,
}: {
    guard: string;
    guardLabel: string;
    token: string;
    email: string;
}) {
    const form = useForm({ token, email, password: '', password_confirmation: '' });

    return (
        <AuthLayout
            variant={guard === 'admin' ? 'internal' : 'customer'}
            title="كلمة مرور جديدة"
            subtitle={`اختر كلمة مرور جديدة لحساب ${guardLabel}.`}
        >
            <Head title="كلمة مرور جديدة" />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post(`/${guard}/reset-password`);
                }}
                className="space-y-5"
            >
                <AuthField label="البريد الإلكتروني" htmlFor="reset-email" dark={guard === 'admin'} error={form.errors.email}>
                    <input
                        id="reset-email"
                        type="email"
                        required
                        readOnly
                        dir="ltr"
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                        className={`${AUTH_INPUT_MONO} text-right text-sm bg-ink/5`}
                    />
                </AuthField>

                <AuthField
                    label="كلمة المرور الجديدة*"
                    htmlFor="reset-password"
                    hint="٨ أحرف على الأقل"
                    dark={guard === 'admin'}
                    error={form.errors.password}
                >
                    <input
                        id="reset-password"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        className={AUTH_INPUT_LIGHT}
                    />
                </AuthField>

                <AuthField label="تأكيد كلمة المرور*" htmlFor="reset-confirm" dark={guard === 'admin'}>
                    <input
                        id="reset-confirm"
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
                    <span>حفظ كلمة المرور والدخول</span>
                    <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                </AuthSubmit>
            </form>
        </AuthLayout>
    );
}
