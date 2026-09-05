import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Info, Lock, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { CodeStep } from '@/components/auth/code-step';
import AuthLayout, { AUTH_INPUT_MONO, AuthField, AuthSubmit } from '@/layouts/auth-layout';

/**
 * H §4 — the one customer door: phone, then a six-digit code over WhatsApp.
 * No passwords on the employee, company or provider portals.
 *
 * The server drives which of the three steps shows: `status === 'otp-sent'`
 * after a code goes out, and `step === 'context'` when the verified account
 * belongs to more than one company and must pick one.
 */
type ContextOption = { id: number; label: string };

export default function OtpLogin({
    guard,
    guardLabel,
    step,
    contextOptions = [],
    status,
}: {
    guard: 'employee' | 'company' | 'partner';
    guardLabel: string;
    portalTag: string;
    step: 'phone' | 'context';
    contextOptions?: ContextOption[];
    status?: string | null;
}) {
    const phoneForm = useForm({ phone: '' });
    const codeForm = useForm({ phone: '', code: '' });
    const contextForm = useForm({ context_id: contextOptions[0]?.id ?? 0 });

    // The code step needs the phone the previous step sent to; it never leaves
    // the browser, so keeping it in state is enough.
    const [phone, setPhone] = useState('');

    /**
     * The server says a code went out (`status`), but «العودة لتعديل رقم الجوال»
     * has to be able to walk that back without another round trip — H §18:
     * «لا شاشة بلا مسار رجوع واضح». So the step is the flash AND the local
     * decision to edit, not the flash alone.
     */
    const [editingPhone, setEditingPhone] = useState(false);
    const sent = status === 'otp-sent' && !editingPhone;

    if (step === 'context') {
        return (
            <AuthLayout title="اختر المنشأة" subtitle={`رقمك مسجّل في أكثر من منشأة — اختر التي تريد الدخول إليها الآن.`}>
                <Head title="اختر المنشأة" />

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        contextForm.post(`/${guard}/login/context`);
                    }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        {contextOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => contextForm.setData('context_id', option.id)}
                                aria-pressed={contextForm.data.context_id === option.id}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-[0.5px] text-xs font-bold transition-colors cursor-pointer text-start ${
                                    contextForm.data.context_id === option.id
                                        ? 'bg-ink text-lime border-ink'
                                        : 'bg-surface text-ink border-ink/15 hover:border-ink/30'
                                }`}
                            >
                                <Building2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span className="flex-1 truncate">{option.label}</span>
                            </button>
                        ))}
                    </div>

                    <AuthSubmit disabled={contextForm.processing || !contextForm.data.context_id}>
                        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>الدخول للمنصة</span>
                    </AuthSubmit>
                </form>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title={sent ? 'أدخل رمز التحقق' : 'تسجيل الدخول للمنصة'}
            subtitle={
                sent ? (
                    <>
                        تم إرسال الرمز المكون من 6 أرقام إلى{' '}
                        <span className="font-mono font-bold text-ink" dir="ltr">
                            {phone}
                        </span>
                    </>
                ) : (
                    `${guardLabel} · دخول سريع وآمن برقم الجوال`
                )
            }
            footer={
                sent ? (
                    <button
                        type="button"
                        onClick={() => {
                            phoneForm.setData('phone', phone);
                            setEditingPhone(true);
                        }}
                        className="text-xs text-ink/60 hover:text-ink font-bold cursor-pointer"
                    >
                        ← العودة لتعديل رقم الجوال
                    </button>
                ) : (
                    <Link href="/admin/login" className="text-xs text-ink/60 hover:text-ink font-bold inline-flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>دخول فريق تيمات (أدمن المنصة · المالي · الدعم)</span>
                    </Link>
                )
            }
        >
            <Head title="تسجيل الدخول" />

            {!sent ? (
                <>
                    <div className="p-3.5 rounded-xl bg-lime/15 border-[0.5px] border-lime/40 flex items-start gap-3 text-xs text-ink">
                        <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                            <span className="font-extrabold block">دخول سريع وآمن بلا كلمة مرور</span>
                            <span className="opacity-80">سيصلك رمز تحقق فوري عبر تطبيق واتساب (WhatsApp) المربوط برقمك.</span>
                        </div>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            setPhone(phoneForm.data.phone);
                            setEditingPhone(false);
                            phoneForm.post(`/${guard}/otp/request`, { preserveScroll: true });
                        }}
                        className="space-y-5"
                    >
                        <AuthField label="رقم الجوال المسجل*" htmlFor="phone-input" hint="05xxxxxxxx" error={phoneForm.errors.phone}>
                            <div dir="ltr">
                                <input
                                    id="phone-input"
                                    type="tel"
                                    required
                                    autoComplete="tel"
                                    value={phoneForm.data.phone}
                                    onChange={(event) => phoneForm.setData('phone', event.target.value)}
                                    placeholder="0551234567"
                                    className={AUTH_INPUT_MONO}
                                />
                            </div>
                        </AuthField>

                        <AuthSubmit disabled={phoneForm.processing}>
                            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>إرسال رمز التحقق</span>
                        </AuthSubmit>
                    </form>

                    <div role="note" className="p-3.5 rounded-xl border-[0.5px] border-ink/10 border-r-[3px] border-r-ink bg-ink/5">
                        <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 text-ink shrink-0 mt-0.5" aria-hidden="true" />
                            <div className="space-y-1 text-xs leading-relaxed">
                                <h5 className="font-extrabold text-ink">مدة الجلسة والحساب الموحد</h5>
                                <div className="text-ink/85 font-medium">
                                    إذا كان رقمك مسجلاً في أكثر من شركة، تُربط العضويات بحسابك الموحد مع إمكانية التبديل بينها.
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <CodeStep
                    error={codeForm.errors.code ?? codeForm.errors.phone}
                    processing={codeForm.processing}
                    onSubmit={(code) => {
                        codeForm.transform((data) => ({ ...data, phone, code }));
                        codeForm.post(`/${guard}/otp/verify`);
                    }}
                    onResend={() => {
                        phoneForm.transform(() => ({ phone }));
                        phoneForm.post(`/${guard}/otp/request`, { preserveScroll: true });
                    }}
                    resending={phoneForm.processing}
                />
            )}
        </AuthLayout>
    );
}

/**
 * Six boxes, one digit each: typing advances, backspace retreats, and a paste
 * of the whole code fills them all. Submitting is the parent's business.
 */
