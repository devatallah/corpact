import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FormEvent } from 'react';

interface Props {
    invitation: {
        token: string;
        email: string;
        company_name: string;
    };
}

export default function AcceptInvitation({ invitation }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/invite/${invitation.token}`);
    }

    return (
        <>
            <Head title="قبول الدعوة" />

            <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6" dir="rtl">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            دعوة موظف
                        </div>
                        <h1 className="text-xl font-semibold">مرحباً بك!</h1>
                        <p className="text-sm text-muted-foreground">
                            تمت دعوتك للانضمام إلى <strong>{invitation.company_name}</strong>
                        </p>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 text-center text-sm">
                        <span className="text-muted-foreground">البريد: </span>
                        <span className="font-medium" dir="ltr">{invitation.email}</span>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">الاسم الكامل</Label>
                            <Input
                                id="name"
                                type="text"
                                autoFocus
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input
                                id="password"
                                type="password"
                                dir="ltr"
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">تأكيد كلمة المرور</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                dir="ltr"
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب والانضمام'}
                        </Button>
                    </form>

                    <div className="space-y-2 border-t pt-4">
                        <p className="text-xs text-muted-foreground text-center">بوابات أخرى</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Link href="/company/login" className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors">🏢 الشركات</Link>
                            <Link href="/club/login" className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors">🏟️ الأندية</Link>
                            <Link href="/employee/login" className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors">👥 الموظفون</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
