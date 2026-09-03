import { Head, router } from '@inertiajs/react';
import { MailCheck, RefreshCw } from 'lucide-react';
import AuthLayout, { AuthSubmit } from '@/layouts/auth-layout';

/** The holding screen while an emailed verification link is outstanding. */
export default function VerifyEmail({ guard, guardLabel }: { guard: string; guardLabel: string }) {
    return (
        <AuthLayout
            title="أكّد بريدك الإلكتروني"
            subtitle={`أرسلنا رابط التأكيد إلى بريد ${guardLabel} المسجّل. افتح الرابط لإكمال التفعيل.`}
        >
            <Head title="تأكيد البريد الإلكتروني" />

            <div className="flex flex-col items-center gap-3 py-2 text-center">
                <div className="w-14 h-14 rounded-full bg-lime flex items-center justify-center">
                    <MailCheck className="w-6 h-6 text-ink" aria-hidden="true" />
                </div>
                <p className="text-xs text-ink/60 leading-relaxed max-w-[320px]">
                    لم يصلك الرابط؟ تحقق من مجلد الرسائل غير المرغوب فيها، أو أعد الإرسال من الزر أدناه.
                </p>
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    router.post(`/${guard}/email/verification-notification`);
                }}
            >
                <AuthSubmit>
                    <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>إعادة إرسال رابط التأكيد</span>
                </AuthSubmit>
            </form>

            <div className="text-center pt-4 border-t-[0.5px] border-ink/10">
                <button
                    type="button"
                    onClick={() => router.post(`/${guard}/logout`)}
                    className="text-xs font-bold text-ink/60 hover:text-ink cursor-pointer"
                >
                    تسجيل الخروج
                </button>
            </div>
        </AuthLayout>
    );
}
