import { Head, useForm } from '@inertiajs/react';
import { Ban, Users } from 'lucide-react';
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
export function CategoryPicker({
    categories,
    selected,
    onChange,
    error,
}: {
    categories: { id: number; name: string; children?: { id: number; name: string }[] }[];
    selected: number[];
    onChange: (ids: number[]) => void;
    error?: string;
}) {
    function toggle(id: number) {
        onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
    }

    return (
        <div className="space-y-4">
            {categories.map((parent) => (
                <div key={parent.id} className="space-y-2">
                    <span className="text-[11px] font-extrabold text-ink/50 uppercase tracking-wider block">{parent.name}</span>
                    <div className="flex flex-wrap gap-2">
                        {[parent, ...(parent.children ?? [])].map((category) => {
                            const active = selected.includes(category.id);

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => toggle(category.id)}
                                    aria-pressed={active}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-[0.5px] transition-colors cursor-pointer ${
                                        active ? 'bg-ink text-lime border-ink' : 'bg-surface text-ink/70 border-ink/15 hover:border-ink/30'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {error && <p className="text-[11px] font-bold text-danger">{error}</p>}
            {selected.length === 0 && !error && (
                <p className="text-[11px] text-ink/55">اختر نشاطاً واحداً على الأقل — بدونه لا يظهر المرفق في محرك الاقتراحات.</p>
            )}
        </div>
    );
}
