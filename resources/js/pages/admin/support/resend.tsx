import { Head, router, useForm } from '@inertiajs/react';
import { Send, SendHorizontal } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal, { ConfirmRow } from '@/components/confirm-modal';
import { ListStates } from '@/components/list-states';
import { FormActions, FormSection } from '@/components/portal/form';
import {
    Badge,
    Button,
    Card,
    Field,
    INPUT,
    Note,
    PageHeader,
    TableShell,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@/components/portal/ui';
import AdminLayout from '@/layouts/admin-layout';

/**
 * G/«دليل وكيل الدعم» — «إعادة إرسال دعوة أو رمز ضمن الحدود المسموحة».
 *
 * كانت هذه الأداة مدفونة أعلى شاشة البحث، فمن جاء ليعيد إرسال رمز يمرّ بنتائج
 * بحث لا تعنيه. الحدّ معروض من الخادم لا مكتوباً هنا: رقم على الشاشة يخالف ما
 * يفرضه الخادم أسوأ من غيابه.
 */
type PendingInvitation = {
    id: number;
    name: string | null;
    email: string;
    phone_tail: string | null;
    company: { id: number; name: string } | null;
    send_count: number;
    expires_at: string | null;
};

export default function SupportResend({
    resendLimit,
    pendingInvitations,
}: {
    resendLimit: { per_minute: number; note: string };
    pendingInvitations: PendingInvitation[];
}) {
    const otpForm = useForm({ phone: '' });
    const [resending, setResending] = useState<PendingInvitation | null>(null);

    return (
        <AdminLayout>
            <Head title="إعادة إرسال الدعوات" />

            <PageHeader
                icon={SendHorizontal}
                title="إعادة إرسال الدعوات والرموز"
                subtitle="روابط قرار المزوّدين، ورموز الدخول، ودعوات الانضمام — بحدّ يحمي المستلم من الإغراق."
            />

            <Note tone="info" title="إعادة الإرسال محدودة بقصد">
                الحدّ الأقصى {resendLimit.per_minute} رسائل لكل رقم في الدقيقة.{' '}
                {resendLimit.note}
            </Note>

            {/* ── إعادة إرسال رمز الدخول ── */}
            <FormSection
                title="إعادة إرسال رمز الدخول"
                hint="لمن يقول «لم يصلني الرمز». تحقّق أولاً من سجل الإشعارات — إن لم يكن الرمز أُرسل أصلاً فالمشكلة ليست في الاستلام."
            >
                <Field
                    label="رقم جوال المستلم"
                    error={otpForm.errors.phone}
                    required
                >
                    <input
                        dir="ltr"
                        placeholder="05xxxxxxxx"
                        className={`${INPUT} font-mono`}
                        value={otpForm.data.phone}
                        onChange={(event) =>
                            otpForm.setData('phone', event.target.value)
                        }
                    />
                </Field>

                <FormActions>
                    <Button
                        type="button"
                        icon={Send}
                        disabled={
                            otpForm.processing || !otpForm.data.phone.trim()
                        }
                        onClick={() =>
                            otpForm.post('/admin/support-console/otp/resend', {
                                preserveScroll: true,
                                onSuccess: () => otpForm.reset(),
                            })
                        }
                    >
                        أرسل الرمز
                    </Button>
                </FormActions>
            </FormSection>

            <Card padding="p-4" className="space-y-4">
                <h2 className="text-sm font-extrabold text-ink">
                    دعوات معلّقة — إعادة الإرسال
                </h2>

                <TableShell>
                    <Thead>
                        <Th>المدعو</Th>
                        <Th>الشركة</Th>
                        <Th>مرات الإرسال</Th>
                        <Th>تنتهي في</Th>
                        <Th className="text-center">الإجراء</Th>
                    </Thead>
                    <Tbody>
                        {pendingInvitations.map((invitation) => {
                            const expired =
                                invitation.expires_at !== null &&
                                new Date(invitation.expires_at) < new Date();

                            return (
                                <Tr key={invitation.id}>
                                    <Td>
                                        <span className="block font-extrabold text-ink">
                                            {invitation.name ?? '—'}
                                        </span>
                                        <span
                                            className="font-mono text-[11px] text-ink/60"
                                            dir="ltr"
                                        >
                                            {invitation.email}
                                        </span>
                                    </Td>
                                    <Td className="text-ink/85">
                                        {invitation.company?.name ?? '—'}
                                    </Td>
                                    <Td className="font-mono text-ink/70">
                                        {invitation.send_count}
                                    </Td>
                                    <Td>
                                        <span className="font-mono text-[11px] text-ink/70">
                                            {invitation.expires_at
                                                ? new Date(
                                                      invitation.expires_at,
                                                  ).toLocaleDateString('ar-SA')
                                                : '—'}
                                        </span>
                                        {expired && (
                                            <Badge tone="danger">منتهية</Badge>
                                        )}
                                    </Td>
                                    <Td className="text-center">
                                        <Button
                                            tone="soft"
                                            icon={Send}
                                            onClick={() =>
                                                setResending(invitation)
                                            }
                                        >
                                            إعادة الإرسال
                                        </Button>
                                    </Td>
                                </Tr>
                            );
                        })}
                        <ListStates
                            count={pendingInvitations.length}
                            colSpan={5}
                            empty="لا دعوات معلّقة."
                            emptyHint="كل الدعوات إما قُبلت أو انتهت صلاحيتها."
                        />
                    </Tbody>
                </TableShell>
            </Card>
            <ConfirmModal
                open={resending !== null}
                title="إعادة إرسال الدعوة"
                message="سيصل المدعو رابط جديد صالح ٧ أيام، ويزيد عدّاد الإرسال. لا يُنشأ حساب جديد ولا تتغيّر هوية الدعوة."
                details={
                    resending && (
                        <>
                            <ConfirmRow
                                label="المدعو"
                                value={resending.email}
                            />
                            <ConfirmRow
                                label="الشركة"
                                value={resending.company?.name ?? '—'}
                            />
                            <ConfirmRow
                                label="مرات الإرسال السابقة"
                                value={String(resending.send_count)}
                                strong
                            />
                            <ConfirmRow
                                label="حدّ الحماية"
                                value={`${resendLimit.per_minute} رسائل لكل رقم في الدقيقة`}
                            />
                        </>
                    )
                }
                confirmLabel="إعادة الإرسال"
                onConfirm={() => {
                    router.post(
                        `/admin/support-console/invitations/${resending?.id}/resend`,
                        {},
                        { preserveScroll: true },
                    );
                    setResending(null);
                }}
                onCancel={() => setResending(null)}
            />
        </AdminLayout>
    );
}
