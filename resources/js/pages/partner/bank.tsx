import { Head, useForm } from '@inertiajs/react';
import { Landmark, Lock } from 'lucide-react';
import { FormActions, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Field,
    INPUT,
    Note,
    PageHeader,
    StatCard,
} from '@/components/portal/ui';
import PartnerLayout from '@/layouts/partner-layout';

/**
 * H §12 — الحساب البنكي.
 *
 * The consequence that must not surprise anyone: editing an already-approved
 * account resets it to pending and blocks payouts until a Teamat admin
 * re-approves. That is an anti-fraud control, not an oversight — so the page
 * says it before the field is touched, not in the flash message afterwards.
 */
const BANK_STATUS: Record<
    string,
    { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }
> = {
    pending: { label: 'بانتظار الاعتماد', tone: 'warning' },
    approved: { label: 'معتمد', tone: 'success' },
    rejected: { label: 'مرفوض', tone: 'danger' },
};

export default function PartnerBank({
    bank,
}: {
    bank: {
        account_holder: string | null;
        iban: string | null;
        status: string | null;
        approved_at: string | null;
        payouts_blocked: boolean;
    };
}) {
    const form = useForm({
        account_holder: bank.account_holder ?? '',
        iban: bank.iban ?? '',
    });

    const wasApproved = bank.status === 'approved';
    const changed =
        form.data.account_holder !== (bank.account_holder ?? '') ||
        form.data.iban !== (bank.iban ?? '');

    return (
        <PartnerLayout>
            <Head title="الحساب البنكي" />

            <PageHeader
                icon={Landmark}
                title="الحساب البنكي"
                subtitle="إليه تُحوَّل مستحقاتك بعد اعتماد كشف التسوية."
                actions={
                    <Badge
                        tone={
                            BANK_STATUS[bank.status ?? 'pending']?.tone ??
                            'neutral'
                        }
                    >
                        {BANK_STATUS[bank.status ?? 'pending']?.label ??
                            'غير مسجَّل'}
                    </Badge>
                }
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <StatCard
                    label="حالة الصرف"
                    value={bank.payouts_blocked ? 'محجوب' : 'متاح'}
                    tone={bank.payouts_blocked ? 'danger' : 'success'}
                    hint={
                        bank.payouts_blocked
                            ? 'لا يُصرف حتى يُعتمد الحساب'
                            : 'الحساب معتمد'
                    }
                />
                <StatCard
                    label="اعتُمد في"
                    value={
                        bank.approved_at
                            ? new Date(bank.approved_at).toLocaleDateString(
                                  'ar-SA',
                              )
                            : '—'
                    }
                />
            </div>

            {bank.payouts_blocked && (
                <Note tone="warning" title="الصرف محجوب الآن">
                    مستحقاتك تُحتسب وتُدرَج في كشوف التسوية كالمعتاد، لكن
                    التحويل لا يتم حتى يعتمد أدمن تيمات هذا الحساب.
                </Note>
            )}

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.put('/partner/bank', { preserveScroll: true });
                }}
                className="space-y-6"
            >
                <FormSection
                    title="بيانات الحساب"
                    hint="يجب أن يطابق اسم صاحب الحساب اسم المنشأة في السجل التجاري."
                >
                    <Field
                        label="اسم صاحب الحساب"
                        error={form.errors.account_holder}
                        required
                    >
                        <input
                            className={INPUT}
                            value={form.data.account_holder}
                            onChange={(event) =>
                                form.setData(
                                    'account_holder',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>

                    <Field
                        label="رقم الآيبان (IBAN)"
                        error={form.errors.iban}
                        required
                    >
                        <input
                            dir="ltr"
                            placeholder="SA00 0000 0000 0000 0000 0000"
                            className={`${INPUT} font-mono`}
                            value={form.data.iban}
                            onChange={(event) =>
                                form.setData('iban', event.target.value)
                            }
                        />
                    </Field>

                    {wasApproved && changed && (
                        <Note
                            tone="warning"
                            title="تعديل حساب معتمد يوقف الصرف مؤقتاً"
                        >
                            بحفظ هذا التعديل تعود حالة الحساب إلى «بانتظار
                            الاعتماد»، ويُحجب الصرف حتى يعتمده أدمن تيمات
                            مجدداً. هذا ضابط أمني: تغيير وجهة التحويل لا يمرّ
                            بلا مراجعة.
                        </Note>
                    )}
                </FormSection>

                <FormActions>
                    <Button
                        type="submit"
                        disabled={form.processing || !changed}
                        icon={wasApproved && changed ? Lock : undefined}
                    >
                        حفظ بيانات الحساب
                    </Button>
                </FormActions>
            </form>
        </PartnerLayout>
    );
}
