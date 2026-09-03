import { Head, useForm } from '@inertiajs/react';
import { MapPinned, Plus, Trash2 } from 'lucide-react';
import { BackLink } from '@/components/list-states';
import { FormActions, FormGrid, FormSection } from '@/components/portal/form';
import { Button, Field, INPUT, Note, PageHeader } from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';
import { PricingRows, BLANK_PRICING } from '@/pages/partner/venues/edit';
import type { PricingDraft } from '@/pages/partner/venues/edit';

/**
 * H §17 — ملعب جديد.
 *
 * The pricing rows are part of creation rather than a later step, because a
 * venue saved without any is unbookable — and a provider who saved one would
 * reasonably assume it was live.
 */
type Category = { id: number; name: string; children?: Category[] };

export default function PartnerVenueCreate({
    categories,
}: {
    categories: Category[];
}) {
    const form = useForm<{
        name: string;
        category_id: string;
        status: string;
        pricings: PricingDraft[];
    }>({
        name: '',
        category_id: '',
        status: 'active',
        pricings: [{ ...BLANK_PRICING }],
    });

    return (
        <PartnerLayout>
            <Head title="ملعب جديد" />

            <BackLink href="/partner/venues" label="العودة إلى الملاعب" />

            <PageHeader
                icon={MapPinned}
                title="ملعب جديد"
                subtitle="اسم وفئة، ثم تسعيرة واحدة على الأقل ليصبح قابلاً للحجز."
            />

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/partner/venues');
                }}
                className="space-y-6"
            >
                <FormSection title="بيانات الملعب">
                    <FormGrid columns={2}>
                        <Field
                            label="اسم الملعب"
                            error={form.errors.name}
                            required
                        >
                            <input
                                className={INPUT}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                        </Field>

                        <Field
                            label="الفئة"
                            error={form.errors.category_id}
                            required
                        >
                            <select
                                className={INPUT}
                                value={form.data.category_id}
                                onChange={(event) =>
                                    form.setData(
                                        'category_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">— اختر الفئة —</option>
                                {categories.map((parent) => (
                                    <optgroup
                                        key={parent.id}
                                        label={parent.name}
                                    >
                                        <option value={parent.id}>
                                            {parent.name}
                                        </option>
                                        {(parent.children ?? []).map(
                                            (child) => (
                                                <option
                                                    key={child.id}
                                                    value={child.id}
                                                >
                                                    {child.name}
                                                </option>
                                            ),
                                        )}
                                    </optgroup>
                                ))}
                            </select>
                        </Field>

                        <Field label="الحالة" error={form.errors.status}>
                            <select
                                className={INPUT}
                                value={form.data.status}
                                onChange={(event) =>
                                    form.setData('status', event.target.value)
                                }
                            >
                                <option value="active">متاح</option>
                                <option value="maintenance">تحت الصيانة</option>
                                <option value="closed">مغلق</option>
                            </select>
                        </Field>
                    </FormGrid>
                </FormSection>

                <FormSection
                    title="التسعيرات"
                    hint="الأسعار شاملة ضريبة القيمة المضافة 15٪. المدد المسموحة: 60 أو 90 أو 120 دقيقة."
                >
                    <PricingRows
                        rows={form.data.pricings}
                        errors={form.errors as Record<string, string>}
                        onChange={(rows) => form.setData('pricings', rows)}
                    />

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            tone="soft"
                            icon={Plus}
                            onClick={() =>
                                form.setData('pricings', [
                                    ...form.data.pricings,
                                    { ...BLANK_PRICING },
                                ])
                            }
                        >
                            تسعيرة أخرى
                        </Button>
                        {form.data.pricings.length > 1 && (
                            <Button
                                type="button"
                                tone="soft"
                                icon={Trash2}
                                onClick={() =>
                                    form.setData(
                                        'pricings',
                                        form.data.pricings.slice(0, -1),
                                    )
                                }
                            >
                                حذف الأخيرة
                            </Button>
                        )}
                    </div>

                    <Note title="لماذا تسعيرة واحدة على الأقل؟">
                        الملعب بلا تسعيرة لا يظهر في نتائج البحث ولا يمكن تسعير
                        أي طلب عليه — يُحفظ لكنه لا يُحجز.
                    </Note>
                </FormSection>

                <FormActions cancelHref="/partner/venues">
                    <Button type="submit" disabled={form.processing}>
                        إنشاء الملعب
                    </Button>
                </FormActions>
            </form>
        </PartnerLayout>
    );
}
