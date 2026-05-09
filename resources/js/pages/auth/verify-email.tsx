import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { GuardName } from '@/types/auth';
import type { FormEvent } from 'react';

type Props = {
    guard: GuardName;
    guardLabel: string;
};

function guardPrefix(guard: GuardName) {
    return guard === 'company' ? 'company' : guard;
}

export default function VerifyEmail({ guard, guardLabel }: Props) {
    const { flash } = usePage().props;
    const { post, processing } = useForm({});

    function resend(e: FormEvent) {
        e.preventDefault();
        post(`/${guardPrefix(guard)}/email/verification-notification`);
    }

    return (
        <>
            <Head title={`تأكيد البريد الإلكتروني — ${guardLabel}`} />

            <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6" dir="rtl">
                <div className="w-full max-w-sm space-y-8 text-center">
                    <div className="space-y-2">
                        <h1 className="text-xl font-semibold">تأكيد البريد الإلكتروني</h1>
                        <p className="text-sm text-muted-foreground">
                            شكراً لتسجيلك! يرجى تأكيد بريدك الإلكتروني من خلال الرابط الذي أرسلناه إليك.
                        </p>
                    </div>

                    {flash.status && (
                        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {flash.status}
                        </div>
                    )}

                    <form onSubmit={resend}>
                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? 'جارٍ الإرسال...' : 'إعادة إرسال رابط التأكيد'}
                        </Button>
                    </form>

                    {guard !== 'admin' && (
                        <div className="space-y-2 border-t pt-4">
                            <p className="text-xs text-muted-foreground text-center">بوابات أخرى</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {guard !== 'company' && (
                                    <Link href="/company/login" className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors">🏢 الشركات</Link>
                                )}
                                {guard !== 'club' && (
                                    <Link href="/club/login" className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors">🏟️ الأندية</Link>
                                )}
                                {guard !== 'employee' && (
                                    <Link href="/employee/login" className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors">👥 الموظفون</Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
