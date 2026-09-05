import { Head, useForm } from '@inertiajs/react';
import { Ban, Users } from 'lucide-react';
import { CategoryPicker } from '@/components/category-picker';
import { BackLink } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import { Badge, Button, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * H §17 — تعديل مزوّد خدمة.
 *
 * The commission rate here is the *current* one. Scheduling a future change
 * belongs on «شروط العقود» — editing it in place would silently re-price
 * statements that have already been computed.
 */
type Partner = {
    id: number;
    name: string;
    trade_name: string | null;
    email: string;
    city: string | null;
    district: string | null;
    contact_phone: string | null;
    commission_rate: string | number | null;
    status: string;
    bank_status: string;
    cr_number: string | null;
    vat_number: string | null;
    categories?: { id: number }[];
};

/** Same vocabulary the list uses — a raw `pending` in the header reads as a bug. */
const PARTNER_STATUS: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
    pending: { label: 'طلب جديد', tone: 'warning' },
    active: { label: 'مفعّل', tone: 'success' },
    suspended: { label: 'موقوف', tone: 'danger' },
    rejected: { label: 'مرفوض', tone: 'danger' },
};

export default function EditPartner({
    partner,
    categories,
}: {
    partner: Partner;
    categories: { id: number; name: string; children?: { id: number; name: string }[] }[];
}) {
    const form = useForm<{
        name: string;
        email: string;
        password: string;
        city: string;
        district: string;
        contact_phone: string;
        commission_rate: string;
        status: string;
        category_ids: number[];
    }>({
        name: partner.name,
        email: partner.email,
        password: '',
        city: partner.city ?? '',
        district: partner.district ?? '',
        contact_phone: partner.contact_phone ?? '',
        commission_rate: String(partner.commission_rate ?? ''),
        status: partner.status,
        category_ids: (partner.categories ?? []).map((category) => category.id),
    });

    // نموذج مستقل: البيانات الضريبية تُحفظ على مسارها الخاص وتُقيَّد في سجل
    // التدقيق كتغيير تعاقدي، لا كتعديل ملف عادي.
    const taxForm = useForm({
        cr_number: partner.cr_number ?? '',
        vat_number: partner.vat_number ?? '',
    });

    return (
        <AdminLayout>
            <Head title={partner.trade_name ?? partner.name} />

            <BackLink href="/admin/partners" label="العودة إلى المزوّدين" />

            <PageHeader
                icon={Users}
                title={partner.trade_name ?? partner.name}
                subtitle={partner.email}
                actions={
                    <>
                        <Badge tone={PARTNER_STATUS[partner.status]?.tone ?? 'neutral'}>
                            {PARTNER_STATUS[partner.status]?.label ?? partner.status}
                        </Badge>
                        <Badge tone={partner.bank_status === 'approved' ? 'success' : 'danger'} icon={partner.bank_status === 'approved' ? undefined : Ban}>
                            {partner.bank_status === 'approved' ? 'الحساب البنكي معتمد' : 'الحساب البنكي غير معتمد'}
                        </Badge>
                    </>
                }
            />

            <Note title="تغيير العمولة بأثر مستقبلي">
                القيمة هنا هي النسبة السارية الآن. لجدولة نسبة جديدة من تاريخ لاحق دون المساس بالكشوف الصادرة، استخدم شاشة
                «شروط العقود».
            </Note>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.put(`/admin/partners/${partner.id}`, { preserveScroll: true });
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات المرفق">
                    <FormGrid>
                        <Field label="اسم المزوّد" htmlFor="p-name" error={form.errors.name}>
                            <input
                                id="p-name"
                                type="text"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="المدينة" htmlFor="p-city" error={form.errors.city}>
                            <input
                                id="p-city"
                                type="text"
                                value={form.data.city}
                                onChange={(event) => form.setData('city', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="الحي" htmlFor="p-district" error={form.errors.district}>
                            <input
                                id="p-district"
                                type="text"
                                value={form.data.district}
                                onChange={(event) => form.setData('district', event.target.value)}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="نسبة العمولة السارية" htmlFor="p-commission" error={form.errors.commission_rate}>
                            <input
                                id="p-commission"
                                type="number"
                                step="0.01"
                                min={0}
                                max={100}
                                value={form.data.commission_rate}
                                onChange={(event) => form.setData('commission_rate', event.target.value)}
                                className={`${INPUT} font-mono`}
                            />
                        </Field>

                        <Field label="حالة المزوّد" htmlFor="p-status" error={form.errors.status}>
                            <select
                                id="p-status"
                                value={form.data.status}
                                onChange={(event) => form.setData('status', event.target.value)}
                                className={`${INPUT} cursor-pointer`}
                            >
                                <option value="pending">طلب جديد</option>
                                <option value="active">مفعّل</option>
                                <option value="suspended">موقوف</option>
                                <option value="rejected">مرفوض</option>
                            </select>
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormSection title="حساب الدخول">
                    <FormGrid>
                        <Field label="البريد الإلكتروني" htmlFor="p-email" error={form.errors.email}>
                            <input
                                id="p-email"
                                type="email"
                                dir="ltr"
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field label="جوال التواصل" htmlFor="p-phone" error={form.errors.contact_phone}>
                            <input
                                id="p-phone"
                                type="tel"
                                dir="ltr"
                                value={form.data.contact_phone}
                                onChange={(event) => form.setData('contact_phone', event.target.value)}
                                className={`${INPUT} text-right font-mono`}
                            />
                        </Field>

                        <Field label="كلمة مرور جديدة" htmlFor="p-password" hint="اتركها فارغة للإبقاء عليها" error={form.errors.password}>
                            <input
                                id="p-password"
                                type="password"
                                autoComplete="new-password"
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                className={INPUT}
                            />
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormSection
                    title="السجل التجاري والرقم الضريبي"
                    hint="يظهران على فواتير المزوّد وكشوف تسويته. الرقم الضريبي السعودي 15 رقماً يبدأ وينتهي بالرقم 3."
                >
                    <FormGrid columns={2}>
                        <Field label="رقم السجل التجاري" error={taxForm.errors.cr_number}>
                            <input
                                dir="ltr"
                                className={INPUT}
                                value={taxForm.data.cr_number}
                                onChange={(event) => taxForm.setData('cr_number', event.target.value)}
                            />
                        </Field>

                        <Field label="الرقم الضريبي (VAT)" error={taxForm.errors.vat_number}>
                            <input
                                dir="ltr"
                                placeholder="3XXXXXXXXXXXX3"
                                className={`${INPUT} font-mono`}
                                value={taxForm.data.vat_number}
                                onChange={(event) => taxForm.setData('vat_number', event.target.value)}
                            />
                        </Field>
                    </FormGrid>

                    <Button
                        type="button"
                        tone="soft"
                        disabled={taxForm.processing}
                        onClick={() => taxForm.put(`/admin/partners/${partner.id}/tax`, { preserveScroll: true })}
                    >
                        حفظ البيانات الضريبية
                    </Button>
                </FormSection>

                <FormSection title="الأنشطة">
                    <CategoryPicker
                        categories={categories}
                        selected={form.data.category_ids}
                        onChange={(ids) => form.setData('category_ids', ids)}
                        error={form.errors.category_ids}
                    />
                </FormSection>

                <FormActions cancelHref="/admin/partners">
                    <Button type="submit" disabled={form.processing}>
                        حفظ التعديلات
                    </Button>
                </FormActions>
            </form>
        </AdminLayout>
    );
}

/**
 * The activity tree as a set of toggles, grouped by parent. Shared with the
 * create form — the same tree, the same selection semantics.
 */
