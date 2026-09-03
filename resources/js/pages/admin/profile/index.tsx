import { Head, useForm, usePage } from '@inertiajs/react';
import { CircleUser, ShieldCheck } from 'lucide-react';
import { Badge, Button, Card, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';
import type { SharedProps } from '@/types';

/**
 * Your own staff account.
 *
 * The current password is required for any change here — including a change
 * of phone, because the phone is where the second factor lands. Letting a
 * hijacked session move that number would defeat the whole 2FA requirement.
 */
export default function AdminProfile({ admin }: { admin: { id: number; name: string; email: string; phone: string | null; status: string } }) {
    const { auth } = usePage<SharedProps>().props;
    const form = useForm({
        name: admin.name,
        email: admin.email,
        phone: admin.phone ?? '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    return (
        <AdminLayout>
            <Head title="الملف الشخصي" />

            <PageHeader
                icon={CircleUser}
                title="ملفك الشخصي"
                subtitle="بيانات حسابك في البوابة الداخلية. تغيير أي منها يتطلب كلمة المرور الحالية."
                actions={<Badge tone="warning">{auth.role_label ?? 'مشرف'}</Badge>}
            />

            <Note title="لماذا كلمة المرور الحالية إلزامية؟">
                رقم الجوال هنا هو وجهة رمز التحقق الثنائي. لو أمكن تغييره من جلسة مفتوحة بلا إثبات، لسقط العامل الثاني كله.
            </Note>

            <Card padding="p-5" className="space-y-5">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put('/admin/profile', {
                            preserveScroll: true,
                            onSuccess: () => form.reset('current_password', 'password', 'password_confirmation'),
                        });
                    }}
                    className="space-y-5"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="الاسم" htmlFor="profile-name" required error={form.errors.name}>
                            <input
                                id="profile-name"
                                type="text"
                                required
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="البريد المؤسسي" htmlFor="profile-email" required error={form.errors.email}>
                            <input
                                id="profile-email"
                                type="email"
                                dir="ltr"
                                required
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field
                            label="رقم الجوال"
                            htmlFor="profile-phone"
                            hint="إليه يصل رمز التحقق الثنائي"
                            error={form.errors.phone}
                        >
                            <input
                                id="profile-phone"
                                type="tel"
                                dir="ltr"
                                value={form.data.phone}
                                onChange={(event) => form.setData('phone', event.target.value)}
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>
                    </div>

                    <div className="pt-4 border-t-[0.5px] border-ink/10 space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-ink" aria-hidden="true" />
                            <h2 className="text-sm font-extrabold text-ink">تغيير كلمة المرور</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field
                                label="كلمة المرور الحالية"
                                htmlFor="profile-current"
                                required
                                hint="مطلوبة لأي تعديل"
                                error={form.errors.current_password}
                            >
                                <input
                                    id="profile-current"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={form.data.current_password}
                                    onChange={(event) => form.setData('current_password', event.target.value)}
                                    className={INPUT}
                                />
                            </Field>

                            <Field
                                label="كلمة مرور جديدة"
                                htmlFor="profile-password"
                                hint="اتركها فارغة للإبقاء عليها"
                                error={form.errors.password}
                            >
                                <input
                                    id="profile-password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={form.data.password}
                                    onChange={(event) => form.setData('password', event.target.value)}
                                    className={INPUT}
                                />
                            </Field>

                            <Field label="تأكيد كلمة المرور" htmlFor="profile-confirm">
                                <input
                                    id="profile-confirm"
                                    type="password"
                                    autoComplete="new-password"
                                    value={form.data.password_confirmation}
                                    onChange={(event) => form.setData('password_confirmation', event.target.value)}
                                    className={INPUT}
                                />
                            </Field>
                        </div>
                    </div>

                    <Button type="submit" disabled={form.processing}>
                        حفظ التغييرات
                    </Button>
                </form>
            </Card>
        </AdminLayout>
    );
}
