import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Lock } from 'lucide-react';
import { CodeStep } from '@/components/auth/code-step';
import AuthLayout, { AUTH_INPUT_LIGHT, AUTH_INPUT_MONO, AuthField, AuthSubmit } from '@/layouts/auth-layout';

/**
 * H §5 — accepting an invitation. Two steps, and the server owns which one
 * shows: nothing is created until the code proves the acceptor holds the
 * phone that will become their login identity.
 *
 * The invited phone is not editable here. An expired link is resent by the
 * account manager — it never becomes a second account.
 */
export default function AcceptInvitation({
    invitation,
    step,
    pendingPhone,
}: {
    invitation: {
        token: string;
        email: string;
        name: string | null;
        phone: string | null;
        phone_locked: boolean;
        company_name: string;
    };
    step: 'details' | 'otp';
    pendingPhone: string | null;
    status?: string | null;
}) {
    const details = useForm({ name: invitation.name ?? '', phone: invitation.phone ?? '' });
    const code = useForm({ code: '' });

    if (step === 'otp') {
        return (
            <AuthLayout
                title="أكّد رقم جوالك"
                subtitle={
                    <>
                        أرسلنا رمزاً من ٦ أرقام إلى{' '}
                        <span className="font-mono font-bold text-ink" dir="ltr">
                            {pendingPhone}
                        </span>
                    </>
                }
            >
                <Head title="تأكيد الدعوة" />

                <CodeStep
                    error={code.errors.code}
                    processing={code.processing}
                    onSubmit={(value) => {
                        code.transform(() => ({ code: value }));
                        code.post(`/invite/${invitation.token}/verify`);
                    }}
                />
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="أهلاً بك في تيمات"
            subtitle={`دعتك ${invitation.company_name} للانضمام إلى مجتمعات منسوبيها.`}
        >
            <Head title="قبول الدعوة" />

            <div className="p-3.5 rounded-xl bg-lime/15 border-[0.5px] border-lime/40 flex items-start gap-3 text-xs text-ink">
                <Building2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                    <span className="font-extrabold block">{invitation.company_name}</span>
                    <span className="opacity-80 font-mono" dir="ltr">
                        {invitation.email}
                    </span>
                </div>
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    details.post(`/invite/${invitation.token}`);
                }}
                className="space-y-5"
            >
                <AuthField label="الاسم الكامل*" htmlFor="invite-name" error={details.errors.name}>
                    <input
                        id="invite-name"
                        type="text"
                        required
                        value={details.data.name}
                        onChange={(event) => details.setData('name', event.target.value)}
                        placeholder="مثال: محمد بن سعود"
                        className={AUTH_INPUT_LIGHT}
                    />
                </AuthField>

                <AuthField
                    label="رقم الجوال*"
                    htmlFor="invite-phone"
                    hint="05xxxxxxxx"
                    error={details.errors.phone}
                >
                    <div dir="ltr" className="relative">
                        <input
                            id="invite-phone"
                            type="tel"
                            required
                            readOnly={invitation.phone_locked}
                            value={details.data.phone}
                            onChange={(event) => details.setData('phone', event.target.value)}
                            placeholder="0551234567"
                            className={`${AUTH_INPUT_MONO} ${invitation.phone_locked ? 'bg-ink/5 cursor-not-allowed' : ''}`}
                        />
                        {invitation.phone_locked && (
                            <Lock className="w-3.5 h-3.5 text-ink/40 absolute top-1/2 -translate-y-1/2 right-3" aria-hidden="true" />
                        )}
                    </div>
                </AuthField>

                {invitation.phone_locked && (
                    <p className="text-[11px] text-ink/55 leading-relaxed">
                        هذا الرقم هو هويتك في المنصة وقد أدرجته شركتك — لتغييره تواصل مع مسؤول الحساب.
                    </p>
                )}

                <AuthSubmit disabled={details.processing}>
                    <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>إرسال رمز التأكيد</span>
                </AuthSubmit>
            </form>
        </AuthLayout>
    );
}
