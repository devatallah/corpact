import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GuardName } from '@/types/auth';
import type { FormEvent } from 'react';

type Props = {
    guard: Extract<GuardName, 'club' | 'company'>;
    guardLabel: string;
};

function guardPrefix(guard: string) {
    return guard === 'company' ? 'company' : guard;
}

export default function Register({ guard, guardLabel }: Props) {
    const isClub = guard === 'club';

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        // Company fields
        hr_name: '',
        hr_phone: '',
        sector: '',
        city: '',
        // Club fields
        district: '',
        contact_phone: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/${guardPrefix(guard)}/register`);
    }

    return (
        <>
            <Head title={`إنشاء حساب — ${guardLabel}`} />

            <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6" dir="rtl">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-xl font-semibold">إنشاء حساب {guardLabel}</h1>
                        <p className="text-sm text-muted-foreground">أدخل بياناتك لإنشاء حساب جديد</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="name">{isClub ? 'اسم النادي' : 'اسم الشركة'}</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input id="email" type="email" dir="ltr" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">كلمة المرور</Label>
                                <Input id="password" type="password" dir="ltr" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">تأكيد كلمة المرور</Label>
                                <Input id="password_confirmation" type="password" dir="ltr" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                            </div>

                            {isClub ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">المدينة</Label>
                                        <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                                        {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="district">الحي</Label>
                                        <Input id="district" value={data.district} onChange={(e) => setData('district', e.target.value)} />
                                        {errors.district && <p className="text-sm text-destructive">{errors.district}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_phone">هاتف التواصل</Label>
                                        <Input id="contact_phone" type="tel" dir="ltr" value={data.contact_phone} onChange={(e) => setData('contact_phone', e.target.value)} />
                                        {errors.contact_phone && <p className="text-sm text-destructive">{errors.contact_phone}</p>}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="hr_name">اسم مسؤول الموارد البشرية</Label>
                                        <Input id="hr_name" value={data.hr_name} onChange={(e) => setData('hr_name', e.target.value)} />
                                        {errors.hr_name && <p className="text-sm text-destructive">{errors.hr_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hr_phone">هاتف الموارد البشرية</Label>
                                        <Input id="hr_phone" type="tel" dir="ltr" value={data.hr_phone} onChange={(e) => setData('hr_phone', e.target.value)} />
                                        {errors.hr_phone && <p className="text-sm text-destructive">{errors.hr_phone}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sector">القطاع</Label>
                                        <Input id="sector" value={data.sector} onChange={(e) => setData('sector', e.target.value)} />
                                        {errors.sector && <p className="text-sm text-destructive">{errors.sector}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">المدينة</Label>
                                        <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                                        {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                                    </div>
                                </>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        لديك حساب بالفعل؟{' '}
                        <Link href={`/${guardPrefix(guard)}/login`} className="text-primary hover:underline">
                            تسجيل الدخول
                        </Link>
                    </p>

                    <div className="space-y-2 border-t pt-4">
                        <p className="text-xs text-muted-foreground text-center">بوابات أخرى</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {guard !== 'company' && (
                                <Link href="/company/login" className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors">🏢 الشركات</Link>
                            )}
                            {guard !== 'club' && (
                                <Link href="/club/login" className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors">🏟️ الأندية</Link>
                            )}
                            <Link href="/employee/login" className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors">👥 الموظفون</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
